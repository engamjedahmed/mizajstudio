import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GATEWAY_SPEC, storySegment, smoothstep } from './scene-math.js';

const RADIAL_SEGMENTS = 6;
const SAMPLES_PER_EDGE = 8;
const DURATION = GATEWAY_SPEC.duration;

function pieceGeometry(piece) {
  let geometry;
  if (piece.type === 'box') {
    geometry = new RoundedBoxGeometry(...piece.size, 1, piece.bevel);
  } else {
    const shape = new THREE.Shape();
    piece.points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    geometry = new THREE.ExtrudeGeometry(shape, {
      depth: piece.depth - 2 * piece.bevel,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelThickness: piece.bevel,
      bevelSize: piece.bevel,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -piece.depth / 2 + piece.bevel);
  }
  geometry.translate(...piece.position);
  geometry.clearGroups();
  return geometry;
}

function unitGeometry(unit) {
  const pieces = unit.pieces.map(pieceGeometry);
  const geometry = mergeGeometries(pieces, false);
  pieces.forEach(piece => piece.dispose());
  if (!geometry) throw new Error(`Could not construct the ${unit.id} unit.`);
  geometry.computeBoundingSphere();
  return geometry;
}

function routeGeometry(pointCount) {
  const ringCount = (pointCount - 1) * SAMPLES_PER_EDGE + 1;
  const positions = new Float32Array(ringCount * RADIAL_SEGMENTS * 3);
  const normals = new Float32Array(positions.length);
  const indices = new Uint16Array((ringCount - 1) * RADIAL_SEGMENTS * 6);
  let index = 0;
  for (let ring = 0; ring < ringCount - 1; ring += 1) {
    for (let side = 0; side < RADIAL_SEGMENTS; side += 1) {
      const next = (side + 1) % RADIAL_SEGMENTS;
      const a = ring * RADIAL_SEGMENTS + side;
      const b = ring * RADIAL_SEGMENTS + next;
      const c = (ring + 1) * RADIAL_SEGMENTS + side;
      const d = (ring + 1) * RADIAL_SEGMENTS + next;
      indices.set([a, b, c, b, d, c], index);
      index += 6;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return { geometry, ringCount };
}

const triangleCount = geometry => (geometry.index?.count ?? geometry.attributes.position.count) / 3;

/** Source-geometry inspection only: this does not claim GPU or phone performance. */
export function getGeometryBudget() {
  const units = GATEWAY_SPEC.units.map(unitGeometry);
  const links = GATEWAY_SPEC.links.map(link => routeGeometry(link.points.length).geometry);
  const triangles = units.concat(links).reduce((count, geometry) => count + triangleCount(geometry), 2);
  units.concat(links).forEach(geometry => geometry.dispose());
  return { units: units.length, links: links.length, geometries: units.length + links.length + 1, materials: 3, triangles };
}

/**
 * Mount a reconstructed Clarity Gateway. Import this module only after the
 * visitor asks to see the 3D scene. Mount renders the final pose once; it does
 * not start the story. All continuous rendering is confined to play/resume.
 */
export async function mountGateway(container, { onStage, onState, onError } = {}) {
  if (!container?.appendChild) throw new TypeError('A scene container is required.');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (cause) {
    throw new Error('The 3D scene could not start. The static illustration remains available.', { cause });
  }
  const canvas = renderer.domElement;
  const materials = [];
  const geometries = [];
  let disposeInitialized;
  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(GATEWAY_SPEC.palette.cream, 1);
    canvas.className = 'gateway-webgl';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(GATEWAY_SPEC.palette.cream);
    const model = new THREE.Group();
    scene.add(model);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
    const target = new THREE.Vector3(...GATEWAY_SPEC.camera.target);
    camera.position.copy(target).add(new THREE.Vector3(...GATEWAY_SPEC.camera.offset));
    camera.lookAt(target);

    const navy = new THREE.MeshStandardMaterial({ color: GATEWAY_SPEC.palette.navy, roughness: 0.62, metalness: 0.06 });
    materials.push(navy);
    const gold = new THREE.MeshStandardMaterial({
      color: GATEWAY_SPEC.palette.gold, roughness: 0.38, metalness: 0.26,
      transparent: true, opacity: 1,
    });
    materials.push(gold);
    const shadowMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { ink: { value: new THREE.Color('#172039') } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 ink;
        void main(){
          vec2 p=(vUv-0.5)*vec2(3.15,3.8);
          float alpha=exp(-dot(p,p)*2.7)*0.28;
          gl_FragColor=vec4(ink,alpha);
          #include <colorspace_fragment>
        }`,
    });
    materials.push(shadowMaterial);
    const unitMap = new Map();
    const localOrigins = new Map();
    GATEWAY_SPEC.units.forEach(unit => {
      const geometry = unitGeometry(unit);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, navy);
      mesh.name = unit.id;
      mesh.position.set(...unit.position);
      model.add(mesh);
      unitMap.set(unit.id, mesh);
      localOrigins.set(unit.id, new THREE.Vector3(...unit.position));
    });

    const tangent = new THREE.Vector3();
    const basisU = new THREE.Vector3();
    const basisV = new THREE.Vector3();
    const guide = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const routes = GATEWAY_SPEC.links.map(link => {
      const { geometry, ringCount } = routeGeometry(link.points.length);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, gold);
      mesh.name = link.id;
      // Each route follows moving anchors; avoid recomputing bounds every frame.
      mesh.frustumCulled = false;
      model.add(mesh);
      return {
        mesh, geometry, ringCount,
        anchors: link.points.map(point => ({
          unit: unitMap.get(point.unit),
          local: new THREE.Vector3(...point.at).sub(localOrigins.get(point.unit)),
          current: new THREE.Vector3(),
        })),
        samples: Array.from({ length: ringCount }, () => new THREE.Vector3()),
      };
    });

    const shadowGeometry = new THREE.PlaneGeometry(6.5, 3.8);
    geometries.push(shadowGeometry);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.014, 0.22);
    shadow.renderOrder = -1;
    scene.add(shadow);

    const sky = new THREE.HemisphereLight('#f0f3ff', '#9799a4', 2.0);
    scene.add(sky);
    const key = new THREE.DirectionalLight('#fff6e9', 3.0);
    key.position.set(-3.5, 7, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight('#dce6ff', 1.7);
    fill.position.set(5, 3, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight('#f4f5ff', 2.6);
    rim.position.set(-1, 5, -4);
    scene.add(rim);

    let disposed = false;
    let lostContext = false;
    let state = 'ready';
    let elapsed = DURATION;
    let lastTimestamp = 0;
    let frameRequest = 0;
    let frameCount = 0;
    let lastStage = -1;
    let resizeObserver;
    let intersectionObserver;
    // Populate from the DOM, not from an observer callback which may arrive
    // after the user's first play request or after an asynchronous import.
    let inView = intersectsViewport();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sourceTriangles = geometries.reduce((count, geometry) => count + triangleCount(geometry), 0);

    function emitStage(stage) {
      if (stage === lastStage) return;
      lastStage = stage;
      onStage?.(stage);
    }
    function emitState(next) {
      state = next;
      onState?.(next);
    }
    function stopFrames() {
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }
    function intersectsViewport() {
      if (!container.isConnected) return false;
      const bounds = container.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      return bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 &&
        bounds.right > 0 && bounds.top < viewportHeight && bounds.left < viewportWidth;
    }
    function canStartPlayback() {
      inView = intersectsViewport();
      return !document.hidden && inView;
    }
    function updateRoutes() {
      model.updateMatrixWorld(true);
      routes.forEach(route => {
        route.anchors.forEach(anchor => anchor.current.copy(anchor.local).applyMatrix4(anchor.unit.matrixWorld));
        for (let ring = 0; ring < route.ringCount; ring += 1) {
          const edge = Math.min(route.anchors.length - 2, Math.floor(ring / SAMPLES_PER_EDGE));
          const amount = Math.min(1, (ring - edge * SAMPLES_PER_EDGE) / SAMPLES_PER_EDGE);
          route.samples[ring].lerpVectors(route.anchors[edge].current, route.anchors[edge + 1].current, amount);
        }
        const positions = route.geometry.attributes.position.array;
        const normals = route.geometry.attributes.normal.array;
        for (let ring = 0; ring < route.ringCount; ring += 1) {
          const current = route.samples[ring];
          tangent.subVectors(route.samples[Math.min(route.ringCount - 1, ring + 1)], route.samples[Math.max(0, ring - 1)]);
          if (tangent.lengthSq() < 1e-12) tangent.set(0, 1, 0);
          tangent.normalize();
          guide.set(0, Math.abs(tangent.y) > 0.9 ? 0 : 1, Math.abs(tangent.y) > 0.9 ? 1 : 0);
          basisU.crossVectors(tangent, guide).normalize();
          basisV.crossVectors(tangent, basisU).normalize();
          for (let side = 0; side < RADIAL_SEGMENTS; side += 1) {
            const angle = side / RADIAL_SEGMENTS * Math.PI * 2;
            normal.copy(basisU).multiplyScalar(Math.cos(angle)).addScaledVector(basisV, Math.sin(angle));
            const offset = (ring * RADIAL_SEGMENTS + side) * 3;
            positions[offset] = current.x + normal.x * GATEWAY_SPEC.linkRadius;
            positions[offset + 1] = current.y + normal.y * GATEWAY_SPEC.linkRadius;
            positions[offset + 2] = current.z + normal.z * GATEWAY_SPEC.linkRadius;
            normals[offset] = normal.x;
            normals[offset + 1] = normal.y;
            normals[offset + 2] = normal.z;
          }
        }
        route.geometry.attributes.position.needsUpdate = true;
        route.geometry.attributes.normal.needsUpdate = true;
      });
    }
    function setPose(seconds) {
      const { from, to, amount } = storySegment(seconds);
      unitMap.forEach((mesh, id) => {
        const start = from[id];
        const end = to[id];
        mesh.position.set(
          start.position[0] + (end.position[0] - start.position[0]) * amount,
          start.position[1] + (end.position[1] - start.position[1]) * amount,
          start.position[2] + (end.position[2] - start.position[2]) * amount,
        );
        mesh.rotation.set(
          start.rotation[0] + (end.rotation[0] - start.rotation[0]) * amount,
          start.rotation[1] + (end.rotation[1] - start.rotation[1]) * amount,
          start.rotation[2] + (end.rotation[2] - start.rotation[2]) * amount,
        );
      });
      gold.opacity = smoothstep((seconds - 1.2) / 1.0);
      routes.forEach(route => { route.mesh.visible = gold.opacity > 0; });
      const reports = unitMap.get('reports').position;
      shadow.position.set(reports.x, -0.014, reports.z + 0.22);
      updateRoutes();
    }
    function render() {
      if (disposed || lostContext) return;
      renderer.render(scene, camera);
      frameCount += 1;
    }
    function fit() {
      if (disposed || lostContext) return;
      const { width, height } = container.getBoundingClientRect();
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      const aspect = w / h;
      const viewHeight = aspect <= 1.05 ? GATEWAY_SPEC.camera.mobileHeight : GATEWAY_SPEC.camera.desktopHeight;
      camera.left = -viewHeight * aspect / 2;
      camera.right = viewHeight * aspect / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      // The initial draw establishes ready; later idle resize draws are useful
      // only while visible. This never starts the animation loop.
      if (state !== 'playing' && state !== 'static' && (frameCount === 0 || canStartPlayback())) render();
    }
    function frame(timestamp) {
      frameRequest = 0;
      if (disposed || lostContext || state !== 'playing') return;
      if (document.hidden || !inView || !intersectsViewport()) {
        pause();
        return;
      }
      elapsed = Math.min(DURATION, elapsed + Math.max(0, timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      setPose(elapsed);
      emitStage(Math.min(3, Math.floor(elapsed / 1.2)));
      render();
      if (elapsed >= DURATION) {
        emitState('complete');
        return;
      }
      frameRequest = window.requestAnimationFrame(frame);
    }
    function showStatic() {
      if (disposed) return false;
      stopFrames();
      elapsed = DURATION;
      canvas.hidden = true;
      canvas.style.visibility = 'hidden';
      emitStage(3);
      emitState('static');
      return true;
    }
    function play() {
      if (disposed || lostContext) return false;
      if (reducedMotion.matches) return showStatic();
      if (!canStartPlayback()) {
        pause();
        return false;
      }
      stopFrames();
      canvas.hidden = false;
      canvas.style.visibility = 'visible';
      elapsed = 0;
      setPose(0);
      emitStage(0);
      emitState('playing');
      render();
      lastTimestamp = performance.now();
      frameRequest = window.requestAnimationFrame(frame);
      return true;
    }
    function pause() {
      if (disposed || state !== 'playing') return false;
      stopFrames();
      emitState('paused');
      return true;
    }
    function resume() {
      if (disposed || lostContext || state !== 'paused') return false;
      if (reducedMotion.matches) return showStatic();
      if (!canStartPlayback()) return false;
      canvas.hidden = false;
      canvas.style.visibility = 'visible';
      lastTimestamp = performance.now();
      emitState('playing');
      frameRequest = window.requestAnimationFrame(frame);
      return true;
    }
    function handleVisibility() {
      if (document.hidden) pause();
    }
    function handleReducedMotion(event) {
      if (event.matches) showStatic();
    }
    function handleContextLoss(event) {
      event.preventDefault();
      lostContext = true;
      showStatic();
      onError?.(new Error('The graphics context was lost. The static illustration is available.'));
    }
    function getStats() {
      return {
        reconstruction: true,
        state, disposed, contextLost: lostContext,
        units: GATEWAY_SPEC.units.length, links: GATEWAY_SPEC.links.length,
        durationMs: DURATION * 1000,
        elapsedMs: Math.round(elapsed * 1000),
        framesRendered: frameCount,
        sourceTriangles,
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs?.length ?? 0,
        materials: disposed ? 0 : materials.length,
        dpr: renderer.getPixelRatio(),
      };
    }
    function dispose() {
      if (disposed) return;
      stopFrames();
      disposed = true;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', fit);
      reducedMotion.removeEventListener('change', handleReducedMotion);
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      model.clear();
      scene.clear();
      unitMap.clear();
      localOrigins.clear();
      routes.length = 0;
      geometries.length = 0;
      materials.length = 0;
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }

    disposeInitialized = dispose;
    container.appendChild(canvas);
    setPose(DURATION);
    fit(); // first successful render precedes the ready callback
    emitStage(3);
    emitState('ready');
    canvas.addEventListener('webglcontextlost', handleContextLoss);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handleReducedMotion);
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(fit);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', fit);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.target === container);
        if (!entry || disposed) return;
        inView = entry.isIntersecting && entry.intersectionRatio > 0;
        if (!inView) pause();
      }, { threshold: 0 });
      intersectionObserver.observe(container);
    }
    return { play, pause, resume, replay: play, showStatic, dispose, getStats };
  } catch (cause) {
    // Also cover failures before the full lifecycle/observer setup exists.
    // Keep the original initialization error if a lost GPU context prevents
    // a best-effort disposal call from succeeding.
    try {
      if (disposeInitialized) disposeInitialized();
      else {
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      }
    } catch { /* Preserve the initialization failure reported below. */ }
    finally { canvas.remove(); }
    throw new Error('The 3D scene could not finish loading. The static illustration remains available.', { cause });
  }
}
