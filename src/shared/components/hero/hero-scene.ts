import gsap from 'gsap';
import {
  AddEquation,
  CustomBlending,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  type Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';

import { introReady } from '@/shared/intro-gate';

import { createCrystals } from './hero-crystals';

export interface HeroSceneHandle {
  dispose: () => void;
}

const IMAGE_URL = '/hero-logo.png';
const IMAGE_ASPECT = 1536 / 1024;

/** Where the mark's visual centre sits inside the picture (fraction from the left / top). */
const CENTROID_U = 0.53;
const CENTROID_V = 0.38;

/** Zoom completes over this many screens of scroll; the logo then dims as the cards take over. */
const ZOOM_SCREENS = 0.95;
const MAX_ZOOM = 4.2;

/** Shared GLSL: left-red / right-blue grading based on where a pixel sits on screen. */
const GRADE = /* glsl */ `
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// x = 0 (left edge) .. 1 (right edge) of the hero
vec3 grade(vec3 col, float x) {
  float l = luma(col);
  float t = smoothstep(0.28, 0.72, x);
  vec3 red = vec3(1.0, 0.035, 0.15);
  vec3 blue = vec3(0.42, 0.5, 0.72);   // muted steel, not electric blue
  vec3 tint = mix(red, blue, t);
  // Colour follows the side; chrome highlights stay white.
  vec3 tinted = tint * (l * 3.4) + vec3(pow(l, 3.0)) * 1.1;
  // Light touch: the logo keeps its own red/blue; the left/right tint only nudges it.
  vec3 g = mix(col, tinted, 0.3);
  g.b *= 0.7;                          // pull the blue back everywhere
  return g;
}`;

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec2 vWorld;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xy;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * The glass logo: liquid shimmer, a slow light sweep, and a radial zoom-blur that peaks
 * mid-flight so the logo feels like it is rushing at the camera.
 */
const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uIntro;
uniform float uZoom;
uniform float uFade;
uniform float uAlphaMul;
uniform float uBlur;
uniform vec2 uFocus;
uniform vec2 uView;
varying vec2 vUv;
varying vec2 vWorld;
${GRADE}

void main() {
  vec2 uv = vUv;
  float mask = smoothstep(0.02, 0.35, luma(texture2D(uTex, uv).rgb));
  vec2 flow = vec2(
    sin(uv.y * 9.0 + uTime * 0.9) + sin(uv.x * 5.0 - uTime * 0.6),
    cos(uv.x * 9.0 + uTime * 0.8) + cos(uv.y * 6.0 + uTime * 0.5));
  uv += flow * 0.0024 * mask;

  // Radial zoom-blur toward the mark's centre.
  vec2 dir = uv - uFocus;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float t = float(i) / 8.0;
    col += texture2D(uTex, uv - dir * uBlur * t).rgb;
  }
  col /= 8.0;
  col = grade(col, vWorld.x / uView.x + 0.5);

  float pulse = 0.5 + 0.5 * sin(uTime * 0.9);
  col *= 1.45 + 0.25 * pulse;

  // A slow diagonal sweep of light across the glass.
  float band = smoothstep(0.045, 0.0, abs(fract(uv.x * 0.7 - uv.y * 0.45 - uTime * 0.06) - 0.5));
  col += col * band * 0.9;

  // The glow swells as the logo floods the window.
  col *= 1.0 + 0.75 * uZoom;

  float edge = smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x)
             * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  float appear = smoothstep(0.0, 0.4, uIntro);
  col *= edge * appear * uFade * uAlphaMul;

  // Premultiplied additive: black adds nothing, so the page background shows through.
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}`;

/** Premultiplied additive blending: light is added over whatever the page shows behind the canvas. */
const BLEND = {
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: CustomBlending,
  blendEquation: AddEquation,
  blendEquationAlpha: AddEquation,
  blendSrc: OneFactor,
  blendDst: OneFactor,
  blendSrcAlpha: OneFactor,
  blendDstAlpha: OneFactor,
} as const;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const damp = (rate: number, dt: number): number => 1 - Math.exp(-rate * dt);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The main logo plus two fainter "light echo" copies that trail behind it as it zooms. */
const LAYERS = [
  { alpha: 1, scale: 1, rot: 0, echo: false },
  { alpha: 0.34, scale: 1.07, rot: -0.03, echo: true },
  { alpha: 0.18, scale: 1.16, rot: 0.05, echo: true },
] as const;

/**
 * Mounts the hero logo scene. `container` is the hero element: the canvas fills it and
 * rendering pauses whenever it is off screen. Resolves once the image is loaded; rejects
 * if WebGL or the image fails.
 */
export function createHeroScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  reducedMotion: boolean,
  isCancelled: () => boolean = () => false,
  options: { logo?: boolean } = {},
): Promise<HeroSceneHandle> {
  /** With `logo: false` the scene draws only the 3D crystals (used by sections other than the hero). */
  const withLogo = options.logo !== false;
  const lowPower = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false; // two passes: the logo layer, then the 3D crystal layer

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const crystals = createCrystals(renderer, lowPower);

  const geometry = new PlaneGeometry(1, 1);
  const layerDefs: ReadonlyArray<(typeof LAYERS)[number]> = withLogo ? LAYERS : [];
  const layers = layerDefs.map((layer) => {
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      ...BLEND,
      uniforms: {
        uTex: { value: null as Texture | null },
        uTime: { value: 0 },
        uIntro: { value: reducedMotion ? 1 : 0 },
        uZoom: { value: 0 },
        uFade: { value: 1 },
        uAlphaMul: { value: layer.alpha },
        uBlur: { value: 0 },
        uFocus: { value: new Vector2(CENTROID_U, 1 - CENTROID_V) },
        uView: { value: new Vector2(1, 1) },
      },
    });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);
    return { ...layer, material, mesh };
  });

  const disposeAll = (texture?: Texture): void => {
    texture?.dispose();
    geometry.dispose();
    layers.forEach((l) => l.material.dispose());
    crystals.dispose();
    renderer.dispose();
  };

  return new Promise<HeroSceneHandle>((resolve, reject) => {
    if (!withLogo) {
      // No picture to load: start straight away (unless already unmounted).
      if (isCancelled()) {
        disposeAll();
        resolve({ dispose: () => undefined });
      } else {
        resolve(start(null));
      }
      return;
    }
    new TextureLoader().load(
      IMAGE_URL,
      (texture) => {
        if (isCancelled()) {
          // Unmounted (e.g. React dev double-mount) before the image arrived: never start.
          disposeAll(texture);
          resolve({ dispose: () => undefined });
          return;
        }
        resolve(start(texture));
      },
      undefined,
      () => {
        disposeAll();
        reject(new Error('hero image failed to load'));
      },
    );
  });

  function start(texture: Texture | null): HeroSceneHandle {
    layers.forEach((l) => {
      l.material.uniforms.uTex.value = texture;
    });
    const intro = { value: reducedMotion ? 1 : 0 };
    const crystalIntro = { value: reducedMotion ? 1 : 0 };

    const pointerTarget = new Vector2();
    const pointer = new Vector2();
    let pointerSeen = false;
    let width = 1;
    let height = 1;
    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let scrollP = 0;

    const layout = (): { w: number; h: number; x: number; y: number } => {
      const mobile = width < 768;
      const w = mobile ? width * 1.25 : Math.min(height * 0.74 * IMAGE_ASPECT, width * 0.98);
      const h = w / IMAGE_ASPECT;
      const centreFromTop = mobile ? 70 + h / 2 : height * 0.45;
      return { w, h, x: width * (mobile ? 0.02 : 0.05), y: height / 2 - centreFromTop };
    };

    const resize = (): void => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      layers.forEach((l) => (l.material.uniforms.uView.value as Vector2).set(width, height));
      crystals.resize(width, height);
    };

    const render = (dt: number): void => {
      if (pointerSeen) pointer.lerp(pointerTarget, damp(6, dt));
      const base = layout();
      const s = reducedMotion ? 0 : scrollP; // 0 .. ~2 screens of scroll
      const e = intro.value;

      // The journey: the logo grows and glides to the middle until it fills the window.
      const zRaw = clamp01(s / ZOOM_SCREENS);
      const z = easeInOut(zRaw);
      const fade = 1 - 0.88 * smooth(0.75, 1.75, s); // dims as the cards take over
      const blur = 0.13 * Math.sin(Math.PI * zRaw); // zoom-blur peaks mid-flight

      const float = reducedMotion ? 0 : Math.sin(elapsed * 0.8) * 7;
      const breathe = reducedMotion ? 1 : 1 + Math.sin(elapsed * 0.6) * 0.008;
      const scale = mix(1, MAX_ZOOM, z) * (0.9 + 0.1 * e) * breathe;
      const slide = (1 - e) * width * 0.8; // enters from the right edge and glides to rest

      // Keep the mark's own centre on the path from its resting spot to the window centre.
      const offU = CENTROID_U - 0.5;
      const offV = 0.5 - CENTROID_V;
      const sx = mix(base.x + slide + offU * base.w, 0, z);
      const sy = mix(base.y - float + offV * base.h, 0, z);
      const px = pointerSeen ? pointer.x * 0.012 * (1 - 0.7 * z) : 0;
      const py = pointerSeen ? pointer.y * 0.012 * (1 - 0.7 * z) : 0;
      const cx = sx - offU * base.w * scale + px;
      const cy = sy - offV * base.h * scale + py;

      layers.forEach((l) => {
        const k = l.echo ? z : 1; // echoes only appear as the logo starts to move
        l.mesh.scale.set(base.w * scale * l.scale, base.h * scale * l.scale, 1);
        l.mesh.position.set(cx, cy, 0);
        l.mesh.rotation.z = z * 0.07 + l.rot * z;
        const u = l.material.uniforms;
        u.uTime.value = elapsed;
        u.uIntro.value = e;
        u.uZoom.value = z;
        u.uFade.value = fade;
        u.uBlur.value = blur;
        u.uAlphaMul.value = l.alpha * k;
      });

      renderer.clear();
      renderer.render(scene, camera);
      crystals.render({
        t: elapsed,
        px: pointerSeen ? Math.max(-1, Math.min(1, pointer.x / (width / 2))) : 0,
        py: pointerSeen ? Math.max(-1, Math.min(1, pointer.y / (height / 2))) : 0,
        scroll: Math.min(s, 1.4),
        intro: crystalIntro.value,
        aspect: width / height,
      });
    };

    const tick = (now: number): void => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      render(dt);
    };
    const play = (): void => {
      if (reducedMotion || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const pause = (): void => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointer = (ev: PointerEvent): void => {
      const rect = container.getBoundingClientRect();
      pointerTarget.set(ev.clientX - rect.left - rect.width / 2, -(ev.clientY - rect.top - rect.height / 2));
      if (!pointerSeen) {
        pointer.copy(pointerTarget);
        pointerSeen = true;
      }
    };
    const onScroll = (): void => {
      if (withLogo) {
        scrollP = Math.min(2, Math.max(0, window.scrollY / Math.max(1, height)));
      } else {
        // Inside another section the crystals rest while it is centred on screen, and fly outward
        // a little as it scrolls in and out.
        const r = container.getBoundingClientRect();
        const p = clamp01((window.innerHeight - r.top) / (window.innerHeight + r.height));
        scrollP = Math.abs(p - 0.5) * 2 * 0.45;
      }
      if (reducedMotion) render(0.016);
    };
    const onVisibility = (): void => (document.hidden ? pause() : play());
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) render(0.016);
    });
    // Visible for as long as the hero is on screen (the card section keeps it pinned behind it).
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });

    resize();
    onScroll();
    resizeObserver.observe(container);
    io.observe(container);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    const tweens: gsap.core.Tween[] = [];
    let cancelled = false;
    if (reducedMotion) {
      render(0.016);
    } else {
      play();
      // Wait for the opening curtain, then the whole logo glides in from the right.
      void introReady.then(() => {
        if (cancelled) return;
        tweens.push(
          gsap.to(intro, { value: 1, duration: 2.8, ease: 'expo.out', delay: 0.15 }),
          // Crystals sweep in from the left and right edges, one after another.
          gsap.to(crystalIntro, { value: 1, duration: 3.2, ease: 'power2.out', delay: 0.5 }),
        );
      });
    }

    return {
      dispose: () => {
        cancelled = true;
        pause();
        tweens.forEach((t) => t.kill());
        resizeObserver.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVisibility);
        disposeAll(texture ?? undefined);
      },
    };
  }
}
