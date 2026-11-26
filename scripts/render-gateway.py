#!/usr/bin/env python3
"""Render the reconstructed Clarity Gateway, using the live scene's source data.

Run from any directory:
    python scripts/render-gateway.py

Requires Blender 4.x, Node.js and Pillow. The default outputs are the two local
WebP fallbacks in public/assets. Only the geometry reconstructed in
src/scene-math.js is rendered; no reference screenshot is edited or embedded.
The lighting is an offline approximation of the web scene, not pixel parity.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "public/assets")
    parser.add_argument("--samples", type=int, default=64)
    parser.add_argument("--blender-worker", action="store_true")
    parser.add_argument("--spec", type=Path)
    return parser.parse_args(argv)


def linear_color(hex_color):
    values = [int(hex_color.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in values)


def to_blender(point):
    # A proper rotation (no reflection) from Three Y-up to Blender Z-up.
    return (point[0], -point[2], point[1])


def render_worker(args):
    import bpy
    import bmesh
    from mathutils import Vector

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    if len(spec["units"]) != 5 or len(spec["links"]) != 4:
        raise ValueError("The approved gateway requires five units and four links.")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = args.samples
    # Some packaged Blender builds omit OpenImageDenoise. A plain CPU render
    # keeps this source renderer portable and avoids a missing-kernel failure.
    scene.cycles.use_denoising = False
    scene.cycles.adaptive_threshold = 0.02
    scene.cycles.max_bounces = 6
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 3
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0
    scene.render.resolution_percentage = 100

    world = bpy.data.worlds.new("Soft studio environment")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.78, 0.83, 0.93, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.4
    scene.world = world

    def material(name, hex_color, roughness, metalness=0, specular=0.32):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = (*linear_color(hex_color), 1)
        shader.inputs["Roughness"].default_value = roughness
        shader.inputs["Metallic"].default_value = metalness
        shader.inputs["Specular IOR Level"].default_value = specular
        return mat

    navy = material("Mizaj Navy — architectural units", spec["palette"]["navy"], 0.62, 0.06, 0.08)
    gold = material("Mizaj Gold — four relationships", spec["palette"]["gold"], 0.32, 0.45)
    floor_mat = material("Neutral shadow receiver", spec["palette"]["cream"], 0.85)

    def finish_mesh(obj, bevel, mat):
        obj.data.materials.append(mat)
        if bevel:
            modifier = obj.modifiers.new("Small architectural edge bevel", "BEVEL")
            modifier.width = bevel
            modifier.segments = 2
            modifier.affect = "EDGES"
            modifier.harden_normals = True
        for face in obj.data.polygons:
            face.use_smooth = True
        weighted = obj.modifiers.new("Stable planar normals", "WEIGHTED_NORMAL")
        weighted.keep_sharp = True
        weighted.weight = 50

    def create_piece(unit, piece, index):
        position = [unit["position"][i] + piece["position"][i] for i in range(3)]
        name = f"{unit['id']}-{index + 1}"
        if piece["type"] == "box":
            bpy.ops.mesh.primitive_cube_add(size=1, location=to_blender(position))
            obj = bpy.context.object
            obj.name = name
            w, h, d = piece["size"]
            obj.dimensions = (w, d, h)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        elif piece["type"] == "profile":
            depth = piece["depth"]
            points = piece["points"]
            count = len(points)
            vertices = [to_blender((x, y, z)) for z in (depth / 2, -depth / 2) for x, y in points]
            faces = [list(range(count)), list(reversed(range(count, count * 2)))]
            faces += [[i, count + i, count + (i + 1) % count, (i + 1) % count] for i in range(count)]
            mesh = bpy.data.meshes.new(name)
            mesh.from_pydata(vertices, [], faces)
            mesh.update()
            bm = bmesh.new()
            bm.from_mesh(mesh)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bm.to_mesh(mesh)
            bm.free()
            obj = bpy.data.objects.new(name, mesh)
            scene.collection.objects.link(obj)
            obj.location = to_blender(position)
        else:
            raise ValueError(f"Unsupported geometry type: {piece['type']}")
        finish_mesh(obj, piece.get("bevel", 0), navy)
        obj["business_unit"] = unit["id"]
        return obj

    for unit in spec["units"]:
        for index, piece in enumerate(unit["pieces"]):
            create_piece(unit, piece, index)

    for link in spec["links"]:
        curve = bpy.data.curves.new(link["id"], "CURVE")
        curve.dimensions = "3D"
        curve.resolution_u = 1
        curve.bevel_depth = spec["linkRadius"]
        curve.bevel_resolution = 2
        curve.use_fill_caps = True
        spline = curve.splines.new("POLY")
        spline.points.add(len(link["points"]) - 1)
        for vertex, point in zip(spline.points, link["points"]):
            vertex.co = (*to_blender(point["at"]), 1)
        obj = bpy.data.objects.new(link["id"], curve)
        scene.collection.objects.link(obj)
        obj.data.materials.append(gold)
        obj["relationship"] = link["id"]

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.012))
    floor = bpy.context.object
    floor.name = "Soft contact shadow catcher"
    floor.data.materials.append(floor_mat)
    floor.is_shadow_catcher = True

    def area_light(name, position, energy, size, target, color=(1, 1, 1)):
        data = bpy.data.lights.new(name, type="AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = to_blender(position)
        direction = Vector(to_blender(target)) - obj.location
        obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()

    area_light("Large soft key", [-3.5, 7.5, 6], 1000, 5, [0, 2, 0], (1, 0.96, 0.9))
    area_light("Quiet cool fill", [6, 4.5, 3], 500, 4.5, [0, 2, 0], (0.83, 0.89, 1))
    area_light("Soft upper edge", [-3, 7, -4], 650, 4, [0, 2.2, 0], (0.91, 0.95, 1))

    target = spec["camera"]["target"]
    camera_location = [target[i] + spec["camera"]["offset"][i] for i in range(3)]
    bpy.ops.object.camera_add(location=to_blender(camera_location))
    camera = bpy.context.object
    camera.name = "Fixed orthographic three quarter camera"
    camera.data.type = "ORTHO"
    camera.data.sensor_fit = "HORIZONTAL"
    camera.rotation_euler = (Vector(to_blender(target)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, width, height, view_height in [
        ("gateway-static", 1152, 900, spec["camera"]["desktopHeight"]),
        ("gateway-mobile", 700, 700, spec["camera"]["mobileHeight"]),
    ]:
        scene.render.resolution_x = width
        scene.render.resolution_y = height
        camera.data.ortho_scale = view_height * width / height
        # Keep the physically rendered shadow separate from the beauty pass,
        # so its intensity can be quiet without changing the unit materials.
        floor.hide_render = False
        scene.render.filepath = str(args.output_dir / f"{name}-shadow.png")
        bpy.ops.render.render(write_still=True)
        floor.hide_render = True
        scene.render.filepath = str(args.output_dir / f"{name}.png")
        bpy.ops.render.render(write_still=True)


def main(args):
    from PIL import Image

    blender = shutil.which("blender")
    node = shutil.which("node")
    if not blender or not node:
        raise SystemExit("Blender and Node.js must be available on PATH.")
    source = ROOT / "src/scene-math.js"
    query = f"import {{ GATEWAY_SPEC }} from {json.dumps(source.as_uri())}; process.stdout.write(JSON.stringify(GATEWAY_SPEC));"
    spec = json.loads(subprocess.check_output([node, "--input-type=module", "-e", query], text=True))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="mizaj-gateway-render-") as temp:
        temp_dir = Path(temp)
        spec_path = temp_dir / "gateway-spec.json"
        spec_path.write_text(json.dumps(spec), encoding="utf-8")
        subprocess.run([
            blender, "--background", "--threads", "8", "--python", str(Path(__file__).resolve()), "--",
            "--blender-worker", "--spec", str(spec_path), "--output-dir", str(temp_dir),
            "--samples", str(args.samples),
        ], check=True)
        for name in ("gateway-static", "gateway-mobile"):
            rgba = Image.open(temp_dir / f"{name}.png").convert("RGBA")
            shadow = Image.open(temp_dir / f"{name}-shadow.png").convert("RGBA")
            shadow.putalpha(shadow.getchannel("A").point(lambda alpha: round(alpha * 0.35)))
            image = Image.new("RGBA", rgba.size, spec["palette"]["cream"])
            image.alpha_composite(shadow)
            image.alpha_composite(rgba)
            output = args.output_dir / f"{name}.webp"
            image.convert("RGB").save(output, format="WEBP", quality=88, method=6)
            print(json.dumps({"file": str(output), "width": rgba.width, "height": rgba.height, "bytes": output.stat().st_size}))


if __name__ == "__main__":
    arguments = parse_args()
    if arguments.blender_worker:
        render_worker(arguments)
    else:
        main(arguments)
