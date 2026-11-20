import {
  ACESFilmicToneMapping,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Scene,
  TetrahedronGeometry,
  type WebGLRenderer,
} from 'three';

/** nx / ny: -1..1 across the screen (so crystals always hug the edges, at any aspect ratio). */
interface Crystal {
  nx: number;
  ny: number;
  z: number;
  size: number;
  kind: 0 | 1 | 2 | 3;
  spin: number;
  phase: number;
}

// Placed around the outer ring, leaving the centre (logo) and bottom-left (headline) clear.
const DESKTOP: Crystal[] = [
  { nx: -0.93, ny: 0.66, z: -1, size: 0.62, kind: 0, spin: 0.22, phase: 0.4 },
  { nx: -0.72, ny: 0.34, z: 2.5, size: 0.34, kind: 3, spin: 0.4, phase: 1.7 },
  { nx: -0.96, ny: 0.04, z: 0.5, size: 0.5, kind: 1, spin: 0.18, phase: 2.6 },
  { nx: -0.97, ny: -0.72, z: -2, size: 0.4, kind: 2, spin: 0.3, phase: 3.3 },
  { nx: -0.4, ny: 0.93, z: -2, size: 0.45, kind: 3, spin: 0.26, phase: 0.9 },
  { nx: 0.12, ny: 0.97, z: 1, size: 0.3, kind: 2, spin: 0.5, phase: 4.1 },
  { nx: 0.55, ny: 0.92, z: -1.5, size: 0.55, kind: 1, spin: 0.2, phase: 5.0 },
  { nx: 0.93, ny: 0.7, z: 0.5, size: 0.7, kind: 0, spin: 0.24, phase: 2.1 },
  { nx: 0.78, ny: 0.3, z: 3, size: 0.36, kind: 3, spin: 0.45, phase: 0.2 },
  { nx: 0.97, ny: -0.08, z: -1, size: 0.58, kind: 1, spin: 0.17, phase: 3.9 },
  { nx: 0.84, ny: -0.52, z: 1.5, size: 0.8, kind: 2, spin: 0.21, phase: 1.2 },
  { nx: 0.62, ny: -0.86, z: -0.5, size: 0.42, kind: 0, spin: 0.33, phase: 4.6 },
  { nx: 0.22, ny: -0.93, z: 2, size: 0.28, kind: 3, spin: 0.5, phase: 5.6 },
  { nx: -0.2, ny: -0.96, z: -2.5, size: 0.4, kind: 2, spin: 0.28, phase: 2.9 },
];

const MOBILE: Crystal[] = [
  { nx: -0.92, ny: 0.5, z: 0, size: 0.4, kind: 0, spin: 0.22, phase: 0.4 },
  { nx: 0.92, ny: 0.62, z: 0, size: 0.46, kind: 1, spin: 0.2, phase: 2.1 },
  { nx: 0.9, ny: -0.1, z: 1, size: 0.34, kind: 3, spin: 0.4, phase: 3.9 },
  { nx: -0.9, ny: -0.3, z: -1, size: 0.3, kind: 2, spin: 0.3, phase: 1.3 },
  { nx: 0.3, ny: 0.96, z: -1, size: 0.34, kind: 2, spin: 0.35, phase: 4.4 },
  { nx: -0.35, ny: 0.95, z: -1, size: 0.3, kind: 3, spin: 0.3, phase: 5.2 },
];

const FOV = 35;
const CAM_Z = 14;
const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface CrystalFrame {
  t: number;
  /** Pointer, -1..1 (y up). */
  px: number;
  py: number;
  /** Scroll progress through the first screen, 0..1. */
  scroll: number;
  /** Intro progress, 0..1. */
  intro: number;
  aspect: number;
}

export interface Crystals {
  render: (frame: CrystalFrame) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

/**
 * A layer of real 3D glass crystals framing the outer edges of the hero:
 * mirrored dark glass lit by red and white light, with glowing edges.
 * They drift with the pointer, spin, and fly outward as you scroll.
 */
export function createCrystals(renderer: WebGLRenderer, lowPower: boolean): Crystals {
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, CAM_Z);

  // Reflection environment: red panels on the left, white / silver on the right and top.
  const envScene = new Scene();
  envScene.background = new Color(0x060408);
  const envDisposables: Array<BufferGeometry | MeshBasicMaterial> = [];
  const panel = (color: number, intensity: number, w: number, h: number, pos: [number, number, number]): void => {
    const geo = new PlaneGeometry(w, h);
    const mat = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide, toneMapped: false });
    const mesh = new Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    envScene.add(mesh);
    envDisposables.push(geo, mat);
  };
  panel(0xff0a3c, 16, 9, 7, [-7, 1, 2]);
  panel(0xff1a1a, 10, 10, 1.4, [0, -5, 3]);
  panel(0xffffff, 14, 10, 1.6, [0, 6, 1]);
  panel(0xf2f4ff, 12, 7, 6, [7, 0, 2]);
  panel(0xffffff, 6, 5, 4, [0, 2, 7]);
  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  envDisposables.forEach((d) => d.dispose());
  scene.environment = envTarget.texture;

  const redLight = new PointLight(0xff1744, 260, 40, 2);
  redLight.position.set(-9, 4, 6);
  const whiteLight = new PointLight(0xffffff, 200, 40, 2);
  whiteLight.position.set(9, 3, 7);
  scene.add(redLight, whiteLight);

  const geometries = [
    new IcosahedronGeometry(1, 0),
    new OctahedronGeometry(1, 0),
    new TetrahedronGeometry(1.15, 0),
    new OctahedronGeometry(1, 0),
  ];
  const edgeGeometries = geometries.map((g) => new EdgesGeometry(g));
  const glass = new MeshPhysicalMaterial({
    color: 0x3a0f1a,
    emissive: 0x240509,
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 3.4,
    flatShading: true,
  });
  const edgeMaterial = new LineBasicMaterial({ color: 0xff3a5a, transparent: true, opacity: 0.95 });

  const items = lowPower ? MOBILE : DESKTOP;
  const groups = items.map((it) => {
    const group = new Group();
    const mesh = new Mesh(geometries[it.kind], glass);
    if (it.kind === 1) mesh.scale.set(0.7, 1.9, 0.7); // elongated shard
    const edges = new LineSegments(edgeGeometries[it.kind], edgeMaterial);
    edges.scale.copy(mesh.scale);
    group.add(mesh, edges);
    group.visible = false;
    scene.add(group);
    return group;
  });

  let aspect = 1;
  const resize = (width: number, height: number): void => {
    aspect = width / Math.max(1, height);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  const render = (f: CrystalFrame): void => {
    const s = f.scroll;
    items.forEach((it, i) => {
      const group = groups[i];
      const appear = smooth(i * 0.035, i * 0.035 + 0.55, f.intro); // staggered fly-in from the sides
      group.visible = appear > 0.001;
      if (!group.visible) return;

      const halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * (CAM_Z - it.z);
      const halfW = halfH * aspect;
      const outward = 1 + s * 1.3;
      const depth = 0.35 + 0.12 * it.z;

      const x = it.nx * halfW * outward + f.px * depth + (1 - appear) * Math.sign(it.nx || 1) * halfW * 1.1;
      const y = it.ny * halfH * outward + s * (it.z + 3) * 0.7 - f.py * depth * 0.7 + Math.sin(f.t * 0.6 + it.phase) * 0.18;
      group.position.set(x, y, it.z);
      group.scale.setScalar(it.size * (0.4 + 0.6 * appear) * (1 - s * 0.25));
      group.rotation.set(f.t * it.spin * 0.7 + it.phase + s * 3.2, f.t * it.spin + s * 2.4, it.phase * 0.5);
    });

    camera.position.set(f.px * 0.25, -f.py * 0.18, CAM_Z - s * 2.2);
    camera.lookAt(0, 0, 0);
    redLight.position.x = -9 + Math.sin(f.t * 0.3) * 2;
    whiteLight.position.x = 9 + Math.cos(f.t * 0.27) * 2;

    renderer.clearDepth();
    renderer.render(scene, camera);
  };

  return {
    render,
    resize,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      edgeGeometries.forEach((g) => g.dispose());
      glass.dispose();
      edgeMaterial.dispose();
      envTarget.dispose();
    },
  };
}
