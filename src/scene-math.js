/**
 * Shared, renderer-independent source for the reconstructed Clarity Gateway.
 * Coordinates use Three's convention: X right, Y up, Z toward the viewer.
 * Blender's source renderer reads this module as JSON through Node.
 */
export const GATEWAY_SPEC = {
  palette: { navy: '#16213E', gold: '#E0A133', cream: '#F7F6F3' },
  camera: { target: [0, 2.0, 0], offset: [7, 5.4, 10], desktopHeight: 6.3, mobileHeight: 6.35 },
  duration: 4.8,
  units: [
    {
      id: 'products', position: [-0.015, 3.99, 0],
      pieces: [{ type: 'profile', depth: 0.82, bevel: 0.025,
        points: [[-1.61, -0.235], [1.61, -0.235], [1.61, 0.015], [1.36, 0.235], [-1.61, 0.235]],
        position: [0, 0, 0] }],
    },
    {
      id: 'inventory', position: [-1.27, 2.0, 0],
      pieces: [
        { type: 'box', size: [0.64, 3.49, 0.60], position: [0, 0, -0.07], bevel: 0.035 },
        { type: 'box', size: [0.64, 0.22, 0.14], position: [0, 1.635, 0.30], bevel: 0.035 },
        { type: 'box', size: [0.64, 0.18, 0.14], position: [0, -1.655, 0.30], bevel: 0.02 },
        { type: 'box', size: [0.105, 3.11, 0.14], position: [-0.2675, -0.02, 0.30], bevel: 0.012 },
        { type: 'box', size: [0.105, 3.11, 0.14], position: [-0.1075, -0.02, 0.30], bevel: 0.012 },
        { type: 'box', size: [0.105, 3.11, 0.14], position: [0.0525, -0.02, 0.30], bevel: 0.012 },
        { type: 'box', size: [0.16, 3.11, 0.14], position: [0.24, -0.02, 0.30], bevel: 0.012 },
      ],
    },
    {
      id: 'customers', position: [1.26, 1.99, 0],
      pieces: [{ type: 'profile', depth: 0.76, bevel: 0.024,
        points: [[-0.25, -1.74], [0.33, -1.74], [0.33, 1.74], [-0.05, 1.74], [-0.40, 1.42], [-0.40, 1.05], [-0.25, 1.05]],
        position: [0, 0, 0] }],
    },
    {
      id: 'orders', position: [-0.02, 1.25, 0.05],
      pieces: [{ type: 'box', size: [2.25, 0.30, 0.70], position: [0, 0, 0], bevel: 0.035 }],
    },
    {
      id: 'reports', position: [0, 0, 0],
      pieces: [
        { type: 'box', size: [3.62, 0.19, 1.82], position: [0, 0.095, 0.22], bevel: 0.025 },
        { type: 'box', size: [3.04, 0.105, 1.50], position: [-0.15, 0.2425, 0.12], bevel: 0.018 },
        { type: 'box', size: [0.125, 0.875, 0.15], position: [0.04, 0.7075, 0.32], bevel: 0.012 },
      ],
    },
  ],
  // Each point is attached to a named unit. World coordinates describe its
  // final position and are converted to local coordinates by either renderer.
  links: [
    { id: 'products-inventory', points: [
      { unit: 'products', at: [1.035, 3.83, 0.438] },
      { unit: 'products', at: [-0.99, 3.83, 0.438] },
      { unit: 'inventory', at: [-0.99, 3.71, 0.398] },
      { unit: 'inventory', at: [-0.99, 2.25, 0.398] },
    ] },
    { id: 'inventory-orders', points: [
      { unit: 'inventory', at: [-0.99, 2.15, 0.398] },
      { unit: 'inventory', at: [-0.99, 1.31, 0.398] },
      { unit: 'orders', at: [-0.99, 1.31, 0.427] },
      { unit: 'orders', at: [-0.20, 1.31, 0.427] },
    ] },
    { id: 'customers-orders', points: [
      { unit: 'customers', at: [1.35, 0.52, 0.408] },
      { unit: 'customers', at: [1.35, 1.28, 0.408] },
      { unit: 'customers', at: [1.25, 1.23, 0.435] },
      { unit: 'orders', at: [0.33, 1.23, 0.435] },
    ] },
    { id: 'orders-reports', points: [
      { unit: 'orders', at: [0.04, 1.25, 0.429] },
      { unit: 'reports', at: [0.04, 0.34, 0.418] },
      { unit: 'reports', at: [-0.32, 0.308, 0.72] },
      { unit: 'reports', at: [-0.32, 0.308, 0.89] },
      { unit: 'reports', at: [-0.32, 0.206, 0.89] },
      { unit: 'reports', at: [-0.32, 0.206, 1.148] },
      { unit: 'reports', at: [-0.32, 0.145, 1.148] },
      { unit: 'reports', at: [0.94, 0.145, 1.148] },
    ] },
  ],
  linkRadius: 0.009,
};

const pose = (position, rotation = [0, 0, 0]) => ({ position, rotation });
export const FINAL_POSES = Object.fromEntries(GATEWAY_SPEC.units.map(unit => [unit.id, pose(unit.position)]));

export const STORY_POSES = {
  complexity: {
    products: pose([0.12, 0.64, -0.20], [0, -0.12, -0.055]),
    inventory: pose([-1.85, 2.0, -0.12]),
    customers: pose([2.00, 1.99, -0.02]),
    orders: pose([0.75, 0.20, 1.36], [0, 0.15, 0]),
    reports: pose([-0.62, 0, 0.05]),
  },
  connection: {
    products: pose([-0.05, 3.78, -0.08], [0, -0.13, 0.025]),
    inventory: pose([-1.52, 2.0, -0.02]),
    customers: pose([1.83, 1.99, -0.03]),
    orders: pose([0.22, 0.55, 0.62], [0, -0.12, 0.07]),
    reports: pose([-0.18, 0, 0.05]),
  },
  system: {
    products: pose([-0.08, 3.84, 0], [0, -0.46, 0.05]),
    inventory: pose([-1.32, 2.0, 0]),
    customers: pose([1.65, 1.99, -0.06]),
    orders: pose([0.03, 1.30, 0.36], [0, -0.12, 0.96]),
    reports: pose([0, 0, 0]),
  },
  clarity: FINAL_POSES,
};

export const smoothstep = value => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

export function storySegment(seconds) {
  if (seconds <= 0.6) return { from: STORY_POSES.complexity, to: STORY_POSES.complexity, amount: 0 };
  if (seconds < 2.1) return { from: STORY_POSES.complexity, to: STORY_POSES.connection, amount: smoothstep((seconds - 0.6) / 1.5) };
  if (seconds < 3.3) return { from: STORY_POSES.connection, to: STORY_POSES.system, amount: smoothstep((seconds - 2.1) / 1.2) };
  return { from: STORY_POSES.system, to: STORY_POSES.clarity, amount: smoothstep((seconds - 3.3) / 1.2) };
}

// The two inputs to orders meet before orders feed the reporting platform.
const connectionWindows = {
  'products-inventory': [1.2, 1.79],
  'inventory-orders': [1.53, 2.11],
  'customers-orders': [1.57, 2.11],
  'orders-reports': [1.97, 2.4],
};

export function connectionProgress(id, seconds) {
  const [start, end] = connectionWindows[id];
  return smoothstep((seconds - start) / (end - start));
}

// Fractional edge index at the head of a line drawn along moving anchors.
export function routeHead(edgeLengths, progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return edgeLengths.length;
  let remaining = edgeLengths.reduce((sum, length) => sum + length, 0) * progress;
  for (let edge = 0; edge < edgeLengths.length; edge += 1) {
    const length = edgeLengths[edge];
    if (length > 0 && remaining <= length) return edge + remaining / length;
    remaining -= length;
  }
  return edgeLengths.length;
}
