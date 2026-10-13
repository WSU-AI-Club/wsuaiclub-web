import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, gustStrength, influenceAt, kick, stepSpring, type Spring } from '../lib/wind';

type Props = { paused: boolean; gust: number; onEnergy?: (energy: number) => void; onReady?: (ready: boolean) => void };
type Piece = {
  object: THREE.Object3D; rest: THREE.Vector3; rotation: THREE.Quaternion;
  x: Spring; y: Spring; z: Spring; rx: Spring; ry: Spring; rz: Spring;
  weight: number; seed: number;
};
const spring = (): Spring => ({ position: 0, velocity: 0 });

export default function LogoSculpture({ paused, gust, onEnergy, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ paused, onEnergy, onReady });
  state.current = { paused, onEnergy, onReady };
  const sendGust = useRef<() => void>(() => {});
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => { if (gust > 0) sendGust.current(); }, [gust]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const container: HTMLDivElement = element;
    let disposed = false;
    let failed = false;
    let frameId = 0;
    let needsRender = true;
    let previouslyMoving = true;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setStatus('fallback');
      state.current.onReady?.(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0xf6f6f2, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(0, 0.2, 12.6);
    camera.lookAt(0, 0, 0);
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(room, 0.035);
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.05;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x807e77, 2));
    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(-4, 7, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    key.shadow.normalBias = 0.035;
    key.shadow.bias = -0.0001;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 3.2);
    rim.position.set(5, 1, -3); scene.add(rim);
    const goldFill = new THREE.DirectionalLight(0xffefd0, 0.8);
    goldFill.position.set(0, -1, 4); scene.add(goldFill);

    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ color: 0x343329, opacity: 0.13 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.85;
    ground.receiveShadow = true;
    scene.add(ground);

    const shadeCanvas = document.createElement('canvas');
    shadeCanvas.width = 128; shadeCanvas.height = 128;
    const context = shadeCanvas.getContext('2d')!;
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(20,20,15,0.22)'); gradient.addColorStop(0.5, 'rgba(20,20,15,0.09)'); gradient.addColorStop(1, 'rgba(20,20,15,0)');
    context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
    const shadeTexture = new THREE.CanvasTexture(shadeCanvas);
    const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.5), new THREE.MeshBasicMaterial({ map: shadeTexture, transparent: true, depthWrite: false }));
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, -2.82, 0);
    scene.add(contactShadow);

    const streaks: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(32 * 3), 3));
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xc39116, transparent: true, opacity: 0, depthWrite: false }));
      scene.add(line); streaks.push(line);
    }

    const pieces: Piece[] = [];
    let energy = 0;
    let elapsed = 0;
    let lastTime = 0;
    let lastReport = 0;
    let ready = false;
    let visible = true;
    let pointerInside = false;
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    const worldPosition = new THREE.Vector3();
    const animationRotation = new THREE.Quaternion();
    const animationEuler = new THREE.Euler();
    const windDirection = new THREE.Vector2(1, 0.15);
    let previousPointer: { x: number; y: number; time: number } | null = null;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;

    const disposeModel = (root: THREE.Object3D) => root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      }
    });

    new GLTFLoader().load('/models/club-emblem.glb', (gltf) => {
      if (disposed || failed) { disposeModel(gltf.scene); return; }
      sculpture.add(gltf.scene);
      gltf.scene.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(gltf.scene);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const scale = 5.1 / size.y;
      gltf.scene.scale.setScalar(scale);
      gltf.scene.position.copy(center).multiplyScalar(-scale);
      gltf.scene.updateMatrixWorld(true);
      const candidates: THREE.Object3D[] = [];
      gltf.scene.traverse((object) => {
        if (/^(leaf_|stem$|chevron_|spark$)/i.test(object.name) && !candidates.some((parent) => {
          let ancestor = object.parent;
          while (ancestor) { if (ancestor === parent) return true; ancestor = ancestor.parent; }
          return false;
        })) candidates.push(object);
        if (object instanceof THREE.Mesh) {
          object.castShadow = true; object.receiveShadow = true;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if (material instanceof THREE.MeshStandardMaterial) material.envMapIntensity = 1.15;
          }
        }
      });
      // Reparent preserves exported transforms while giving every piece a world-aligned motion pivot.
      for (const [index, object] of candidates.entries()) {
        const pivot = new THREE.Group();
        object.getWorldPosition(worldPosition);
        pivot.position.copy(worldPosition);
        sculpture.add(pivot);
        pivot.attach(object);
        pieces.push({ object: pivot, rest: pivot.position.clone(), rotation: pivot.quaternion.clone(),
          x: spring(), y: spring(), z: spring(), rx: spring(), ry: spring(), rz: spring(),
          weight: object.name.toLowerCase() === 'spark' ? 0.52 : object.name.startsWith('leaf') ? 1 : 0.7,
          seed: index * 1.71 });
      }
      if (pieces.length !== 10) console.warn(`Expected 10 logo pieces, received ${pieces.length}`);
      ready = true;
      setStatus('ready');
      container.dataset.pieceCount = String(pieces.length);
      state.current.onReady?.(true);
      draw();
    }, undefined, (error) => {
      if (disposed) return;
      console.error('Sculpture could not load', error);
      failed = true;
      cancelAnimationFrame(frameId);
      renderer.domElement.style.display = 'none';
      setStatus('fallback');
      state.current.onReady?.(false);
    });

    function applyGust(x: number, y: number, dx: number, dy: number, strength: number, global = false) {
      if (!ready || state.current.paused || reduced) return;
      const magnitude = Math.hypot(dx, dy) || 1;
      const nx = dx / magnitude, ny = dy / magnitude;
      windDirection.set(nx, ny);
      energy = clamp(energy + strength * 0.065, 0, 1);
      for (const p of pieces) {
        const local = global ? 0.78 : influenceAt(p.rest.x, p.rest.y, x, y);
        const force = strength * local * p.weight;
        kick(p.x, nx * force * 1.05);
        kick(p.y, ny * force * 0.8 + force * 0.08);
        kick(p.z, force * (0.3 + Math.sin(p.seed) * 0.8));
        kick(p.rx, -ny * force * 1.7 + force * Math.sin(p.seed) * 0.3);
        kick(p.ry, nx * force * 2.2);
        kick(p.rz, -nx * force * 0.6 * (p.rest.y > 0 ? 1 : -1));
      }
    }
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.buttons === 0) return;
      const rect = container.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      pointerInside = true;
      const now = performance.now();
      if (previousPointer) {
        const dx = event.clientX - previousPointer.x;
        const dy = previousPointer.y - event.clientY;
        const dt = (now - previousPointer.time) / 1000;
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(plane, intersection)) {
          const force = gustStrength(Math.hypot(dx, dy), dt);
          // Integrate by elapsed time so high-polling mice do not inject more energy.
          applyGust(intersection.x, intersection.y, dx, dy, force * Math.min(dt, 0.05) * 36);
        }
      }
      previousPointer = { x: event.clientX, y: event.clientY, time: now };
    };
    const pointerLeave = () => { previousPointer = null; pointerInside = false; };
    const pointerDown = (event: PointerEvent) => {
      previousPointer = { x: event.clientX, y: event.clientY, time: performance.now() };
      if (event.pointerType === 'touch') container.setPointerCapture(event.pointerId);
    };
    container.addEventListener('pointermove', pointerMove);
    container.addEventListener('pointerleave', pointerLeave);
    container.addEventListener('pointerdown', pointerDown);
    container.addEventListener('pointerup', pointerLeave);
    container.addEventListener('pointercancel', pointerLeave);
    sendGust.current = () => {
      applyGust(0, 0, 1, 0.2, 6.4, true);
      draw();
    };

    const reset = () => {
      for (const p of pieces) for (const channel of [p.x, p.y, p.z, p.rx, p.ry, p.rz]) { channel.position = 0; channel.velocity = 0; }
      energy = 0;
    };
    const motionChange = () => { reduced = motionQuery.matches; if (reduced) reset(); needsRender = true; };
    motionQuery.addEventListener('change', motionChange);
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      // Keep the complete mark visible on narrow screens, with room for gusts.
      camera.position.z = Math.max(12.1, 7.1 / camera.aspect);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; lastTime = 0; if (visible) draw(); }, { threshold: 0.01 });
    observer.observe(container);
    const visibilityChange = () => { lastTime = 0; };
    document.addEventListener('visibilitychange', visibilityChange);

    function draw() {
      if (!disposed && !failed) renderer.render(scene, camera);
    }
    function frame(time: number) {
      if (disposed || failed) return;
      frameId = requestAnimationFrame(frame);
      if (!visible || document.hidden || !ready) { lastTime = time; return; }
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = time;
      const moving = !state.current.paused && !reduced;
      if (moving) {
        elapsed += dt;
        energy *= Math.exp(-1.35 * dt);
        const targetX = pointerInside ? pointer.y * 0.055 : 0;
        const targetY = -0.36 + (pointerInside ? pointer.x * 0.10 : 0);
        sculpture.rotation.x = THREE.MathUtils.damp(sculpture.rotation.x, targetX, 3, dt);
        sculpture.rotation.y = THREE.MathUtils.damp(sculpture.rotation.y, targetY, 3, dt);
        sculpture.rotation.z = -0.025 + Math.sin(elapsed * 0.42) * 0.007;
      }
      let displacement = 0;
      for (const p of pieces) {
        if (moving) {
          for (const channel of [p.x, p.y, p.z]) stepSpring(channel, dt, 24 * p.weight + 12, 5.8, 1.3);
          for (const channel of [p.rx, p.ry, p.rz]) stepSpring(channel, dt, 19 * p.weight + 7, 4.5, 1.05);
        }
        const breathe = moving ? Math.sin(elapsed * 0.9 + p.seed) * 0.022 : 0;
        p.object.position.set(p.rest.x + p.x.position, p.rest.y + p.y.position + breathe, p.rest.z + p.z.position);
        animationEuler.set(p.rx.position, p.ry.position, p.rz.position);
        animationRotation.setFromEuler(animationEuler);
        p.object.quaternion.copy(p.rotation).multiply(animationRotation);
        displacement += Math.abs(p.x.position) + Math.abs(p.y.position) + Math.abs(p.ry.position);
      }
      for (const [index, line] of streaks.entries()) {
        line.material.opacity = moving ? Math.max(0, energy - 0.1) * 0.23 : 0;
        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < 32; j++) {
          const t = j / 31;
          const x = (t - 0.5) * 9;
          const wave = Math.sin(t * 4 + elapsed * 2.4 + index * 0.7) * energy * 0.32;
          positions.setXYZ(j, x * windDirection.x - (index - 2) * 0.18 * windDirection.y,
            (index - 2) * 0.65 + x * windDirection.y * 0.35 + wave, -0.6 - index * 0.12);
        }
        positions.needsUpdate = true;
      }
      if (time - lastReport > 100) {
        const value = moving ? Math.min(1, energy + displacement / 30) : 0;
        state.current.onEnergy?.(value);
        container.dataset.energy = value.toFixed(3);
        container.dataset.displacement = displacement.toFixed(3);
        container.dataset.reducedMotion = String(reduced);
        lastReport = time;
      }
      // Static preferences and paused scenes need no continuous GPU renders.
      if (moving || previouslyMoving !== moving || needsRender) draw();
      previouslyMoving = moving;
      needsRender = false;
    }
    const lostContext = (event: Event) => {
      event.preventDefault();
      failed = true;
      cancelAnimationFrame(frameId);
      renderer.domElement.style.display = 'none';
      setStatus('fallback');
      state.current.onReady?.(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', lostContext);
    resize();
    frameId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      sendGust.current = () => {};
      resizeObserver.disconnect(); observer.disconnect();
      motionQuery.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', visibilityChange);
      container.removeEventListener('pointermove', pointerMove);
      container.removeEventListener('pointerleave', pointerLeave);
      container.removeEventListener('pointerdown', pointerDown);
      container.removeEventListener('pointerup', pointerLeave);
      container.removeEventListener('pointercancel', pointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', lostContext);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      shadeTexture.dispose(); environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={`logo-sculpture logo-sculpture--${status}`} role="img"
    aria-label="Interactive AI Club sculpture. Move across the logo to create wind; faster movement scatters the leaves. Use Send a gust for a keyboard-accessible demonstration."
    style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'pan-y' }}>
    {status !== 'ready' && <div className="sculpture-fallback" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
      <img src="/brand/mark-black.svg" alt="" style={{ height: '72%', maxWidth: '76%', objectFit: 'contain' }} />
      {status === 'loading' && <span style={{ position: 'absolute', bottom: '7%', fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Loading the emblem</span>}
    </div>}
  </div>;
}
