import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Robot({ state = "idle" }) {
  const mountRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera (straight ahead, centered on robot) ───────────
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    // ── Lights ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x9999dd, 1.2));

    const key = new THREE.DirectionalLight(0xd4c5fd, 4.5);
    key.position.set(5, 9, 7);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x38bdf8, 2.5);
    fill.position.set(-6, 4, 5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 9.5); //glow
    rim.position.set(0, -5, -6);
    scene.add(rim);

    const glow = new THREE.PointLight(0xc4b5fd, 5.0, 16);
    glow.position.set(2, 3, 5);
    scene.add(glow);

    // ── Materials ────────────────────────────────────────────
    const mat = (col, met=0.85, rou=0.15, emi=0x000000, ei=0) =>
      new THREE.MeshStandardMaterial({ color:col, metalness:met, roughness:rou, emissive:emi, emissiveIntensity:ei });

    const bodyM   = mat(0x0d1422, 0.88, 0.14);
    const jointM  = mat(0x192038, 0.76, 0.24);
    const darkM   = mat(0x04060e, 0.93, 0.26);
    const accentM = mat(0xa78bfa, 0.52, 0.09, 0x6d28d9, 0.6);
    const glowM   = mat(0x38bdf8, 0.12, 0.04, 0x0ea5e9, 1.8);
    const eyeM    = () => mat(0x38bdf8, 0.08, 0.03, 0x93c5fd, 4.0);
    const stripM  = mat(0x182038, 0.90, 0.10);

    // ── Outline material (white edges) ────────────────────────
    const outlineM = new THREE.MeshBasicMaterial({
      color: 0xffffff,  // Magenta/pink
      
  side: THREE.BackSide,
  transparent: true,
  opacity: 3.5,

    });

    // ── Geo shortcuts ─────────────────────────────────────────
    const BX = (w,h,d,m) => new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
    const SP = (r,m)     => new THREE.Mesh(new THREE.SphereGeometry(r,32,32), m);
    const CY = (rt,rb,h,m,s=16) => new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s), m);
    const TR = (r,t,m,s=32,ts=16) => new THREE.Mesh(new THREE.TorusGeometry(r,t,ts,s), m);

    // Helper to add outline clone
    const addOutline = (mesh, scale=1.05) => {
      const outline = mesh.clone();
      outline.material = outlineM;
      outline.scale.multiplyScalar(scale);
      mesh.add(outline);
    };

    // ══════════════════════════════════════════════════════════
    //  ROBOT (centered at origin, then shift to RIGHT HALF)
    // ══════════════════════════════════════════════════════════
    const root = new THREE.Group();
    // Position robot in the RIGHT side of screen (better centered)
    root.position.set(8.0, -6.0, 0);
    root.scale.set(2.2, 2.2, 2.2);  // ADD THIS LINE - makes robot 30% bigger

    scene.add(root);

    // ════ TORSO ═══════════════════════════════════════════════
    const torso = new THREE.Group();
    root.add(torso);

    const torsoMesh = BX(1.4, 1.7, 0.85, bodyM);
    addOutline(torsoMesh, 1.03);
    torso.add(torsoMesh);

    const panel = BX(1.02, 0.95, 0.06, darkM);
    panel.position.set(0, 0.10, 0.44);
    torso.add(panel);

    const rRing = TR(0.23, 0.048, accentM);
    rRing.rotation.x = Math.PI / 2;
    rRing.position.set(0, 0.16, 0.48);
    torso.add(rRing);

    const rCore = SP(0.13, glowM.clone());
    rCore.position.set(0, 0.16, 0.48);
    torso.add(rCore);

    for (let i = 0; i < 4; i++) {
      const slat = BX(0.72, 0.038, 0.06, accentM);
      slat.position.set(0, -0.10 - i * 0.105, 0.45);
      torso.add(slat);
    }

    [-1, 1].forEach(s => {
      const ridge = BX(0.13, 0.28, 0.87, accentM);
      ridge.position.set(s * 0.585, 0.56, 0);
      torso.add(ridge);
    });

    // ════ WAIST ═══════════════════════════════════════════════
    const waist = CY(0.44, 0.52, 0.24, jointM);
    waist.position.set(0, -0.97, 0);
    addOutline(waist, 1.04);
    torso.add(waist);

    // ════ HIPS ════════════════════════════════════════════════
    const hipsM = BX(1.16, 0.40, 0.72, bodyM);
    hipsM.position.set(0, -1.28, 0);
    addOutline(hipsM, 1.03);
    torso.add(hipsM);

    // ════ LEGS ════════════════════════════════════════════════
    const legsG = new THREE.Group();
    legsG.position.set(0, -1.28, 0);
    torso.add(legsG);

    [-0.33, 0.33].forEach(x => {
      const g = new THREE.Group();
      g.position.set(x, 0, 0);
      legsG.add(g);

      const ul = BX(0.38, 0.75, 0.40, bodyM); ul.position.y = -0.58; addOutline(ul,1.03); g.add(ul);
      const kn = SP(0.21, jointM); kn.position.y = -0.98; addOutline(kn,1.05); g.add(kn);
      const kr = TR(0.17, 0.030, accentM); kr.rotation.x=Math.PI/2; kr.position.y=-0.98; g.add(kr);
      const ll = BX(0.32, 0.68, 0.36, bodyM); ll.position.y = -1.50; addOutline(ll,1.03); g.add(ll);
      const ft = BX(0.36, 0.19, 0.60, darkM); ft.position.set(0,-1.92,0.12); addOutline(ft,1.03); g.add(ft);
      const fa = BX(0.32, 0.055, 0.54, accentM); fa.position.set(0,-1.83,0.12); g.add(fa);
    });

    // ════ NECK ════════════════════════════════════════════════
    const neckM = CY(0.19, 0.21, 0.30, jointM);
    neckM.position.set(0, 1.00, 0);
    addOutline(neckM, 1.04);
    torso.add(neckM);

    [0.86, 1.00, 1.14].forEach(y => {
      const r = TR(0.20, 0.024, accentM);
      r.rotation.x = Math.PI / 2;
      r.position.set(0, y, 0);
      torso.add(r);
    });

    // ════ HEAD ════════════════════════════════════════════════
    const head = new THREE.Group();
    head.position.set(0, 1.30, 0);
    torso.add(head);

    const headMesh = BX(1.10, 0.96, 0.92, bodyM);
    addOutline(headMesh, 1.03);
    head.add(headMesh);

    [-0.57, 0.57].forEach(x => {
      const s = BX(0.04, 0.96, 0.92, stripM);
      s.position.set(x, 0, 0);
      head.add(s);
    });

    // ── Eyes ──────────────────────────────────────────────────
    const eyes = [];
    const eyeG = new THREE.Group();
    eyeG.position.set(0, 0.07, 0.47);
    head.add(eyeG);

    [-0.27, 0.27].forEach(x => {
      const sock = BX(0.28, 0.19, 0.04, darkM); sock.position.set(x,0,0); eyeG.add(sock);
      const eye  = BX(0.22, 0.13, 0.07, eyeM()); eye.position.set(x,0,0.026); eyeG.add(eye);
      eyes.push(eye);
      const halo = BX(0.27, 0.18, 0.02,
        new THREE.MeshStandardMaterial({ color:0x38bdf8, emissive:0x38bdf8, emissiveIntensity:0.5, transparent:true, opacity:0.25 }));
      halo.position.set(x, 0, 0.048); eyeG.add(halo);
    });

    // ── Mouth (animated lip-sync when speaking) ───────────────
    const mouthG = new THREE.Group();
    mouthG.position.set(0, -0.22, 0.47);
    head.add(mouthG);

    const mouthBg = BX(0.56, 0.14, 0.03, darkM);
    mouthG.add(mouthBg);

    // Mouth bars (animate these for lip-sync)
    const mouthBars = [];
    for (let i = -2; i <= 2; i++) {
      const bar = BX(0.04, 0.12, 0.046, accentM);
      bar.position.x = i * 0.105;
      mouthG.add(bar);
      mouthBars.push(bar);
    }

    // ── Ears ──────────────────────────────────────────────────
    [-0.58, 0.58].forEach(x => {
      const ear = CY(0.11, 0.13, 0.13, jointM, 8);
      ear.rotation.z = Math.PI / 2; ear.position.set(x, 0, 0); head.add(ear);
      const dot = SP(0.07, glowM.clone()); dot.position.set(x, 0, 0); head.add(dot);
    });

    // ── Antenna ───────────────────────────────────────────────
    const aBase = CY(0.058, 0.072, 0.19, jointM); aBase.position.set(0, 0.57, 0); head.add(aBase);
    const aStem = CY(0.030, 0.036, 0.40, darkM);  aStem.position.set(0, 0.87, 0); head.add(aStem);
    const aBall = SP(0.096, glowM.clone());         aBall.position.set(0, 1.11, 0); head.add(aBall);
    const aRing = TR(0.078, 0.019, accentM);
    aRing.rotation.x = Math.PI / 2; aRing.position.set(0, 0.95, 0); head.add(aRing);

    // ════ ARMS ════════════════════════════════════════════════
    const armPivL = new THREE.Group(); armPivL.position.set(-0.88, 0.64, 0); torso.add(armPivL);
    const armPivR = new THREE.Group(); armPivR.position.set( 0.88, 0.64, 0); torso.add(armPivR);

    const mkArm = (grp, side) => {
      const sh = SP(0.21, jointM); addOutline(sh, 1.05); grp.add(sh);
      const sr = TR(0.18, 0.030, accentM); sr.rotation.x=Math.PI/2; grp.add(sr);
      const ua = BX(0.30, 0.72, 0.30, bodyM); ua.position.y = -0.54; addOutline(ua,1.03); grp.add(ua);
      const el = SP(0.17, jointM); el.position.y = -0.96; addOutline(el,1.05); grp.add(el);

      const lower = new THREE.Group(); lower.position.y = -0.96; grp.add(lower);
      const fa = BX(0.25, 0.64, 0.25, bodyM); fa.position.y = -0.40; addOutline(fa,1.03); lower.add(fa);
      const wr = TR(0.145, 0.026, accentM); wr.rotation.x=Math.PI/2; wr.position.y=-0.73; lower.add(wr);
      const hd = BX(0.32, 0.23, 0.19, darkM); hd.position.y = -0.86; addOutline(hd,1.03); lower.add(hd);
      [-0.095, 0, 0.095].forEach((x,i) => {
        const f = BX(0.072, i===1?0.15:0.12, 0.085, bodyM); f.position.set(x,-0.99,0); lower.add(f);
      });
      const st = BX(0.042, 0.72, 0.32, accentM); st.position.set(side*0.14,-0.54,0); grp.add(st);
      return lower;
    };

    const lowerL = mkArm(armPivL, -1);
    const lowerR = mkArm(armPivR,  1);
    armPivL.rotation.z =  0.22;
    armPivR.rotation.z = -0.22;

    // ── Floor glow disc ───────────────────────────────────────
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 64),
      new THREE.MeshBasicMaterial({ color:0x7c3aed, transparent:true, opacity:0.22 })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -3.5;
    root.add(disc);

    // ── Particles ─────────────────────────────────────────────
    const pN = 140;
    const pG = new THREE.BufferGeometry();
    const pP = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      pP[i*3]   = (Math.random()-0.5)*16;
      pP[i*3+1] = (Math.random()-0.5)*11;
      pP[i*3+2] = (Math.random()-0.5)*9 - 2;
    }
    pG.setAttribute("position", new THREE.BufferAttribute(pP, 3));
    const pts = new THREE.Points(pG, new THREE.PointsMaterial({ color:0xc4b5fd, size:0.035, transparent:true, opacity:0.55 }));
    scene.add(pts);

    // ═════════════════════════════════════════════════════════
    //  ANIMATION LOOP
    // ═════════════════════════════════════════════════════════
    const clock   = new THREE.Clock();
    let waving    = true;
    let wavePhase = 0;
    let sentTime  = -99;
    let animId;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const t  = clock.getElapsedTime();
      const st = stateRef.current;

      // ── Idle: float + breathe ─────────────────────────────
      root.position.y = -0.5 + Math.sin(t * 0.85) * 0.10;
      root.rotation.y = Math.sin(t * 0.38) * 0.08;
      torso.scale.x   = 1 + Math.sin(t * 1.1)           * 0.013;
      torso.scale.z   = 1 + Math.sin(t * 1.1 + Math.PI) * 0.013;

      // ── Thinking: head shake + LIP SYNC (mouth bars move) ─
      if (st === "thinking") {
        head.rotation.y = Math.sin(t * 3.0) * 0.22;
        head.rotation.x = Math.sin(t * 2.1) * 0.09;
        aBall.material.emissiveIntensity  = 0.8 + Math.abs(Math.sin(t * 9)) * 2.2;
        rCore.material.emissiveIntensity  = 1.5 + Math.sin(t * 7) * 1.5;
        eyes.forEach(e => { e.material.emissiveIntensity = 2.0 + Math.sin(t * 8) * 2.2; });
        armPivL.rotation.x = Math.sin(t * 1.7) * 0.10;
        armPivR.rotation.x = Math.sin(t * 1.7 + 1.2) * 0.10;

        // LIP SYNC: mouth bars oscillate (simulates speaking)
        mouthBars.forEach((bar, i) => {
          const offset = i * 0.3;
          const scale = 0.8 + Math.abs(Math.sin(t * 12 + offset)) * 0.5;
          bar.scale.y = scale;
        });
      } else {
        head.rotation.y = Math.sin(t * 0.5) * 0.05;
        head.rotation.x = 0;
        aBall.material.emissiveIntensity = 1.0 + Math.sin(t * 1.6) * 0.5;
        rCore.material.emissiveIntensity = 1.2 + Math.sin(t * 1.3) * 0.4;
        eyes.forEach(e => { e.material.emissiveIntensity = 2.8 + Math.sin(t * 2.0) * 0.8; });

        // Mouth idle (bars slightly pulse)
        mouthBars.forEach(bar => {
          bar.scale.y = 1 + Math.sin(t * 2) * 0.08;
        });
      }

      // ── Sent pulse ─────────────────────────────────────────
      if (st === "sent" && sentTime < 0) sentTime = t;
      if (t - sentTime < 0.6) {
        const p = (t - sentTime) / 0.6;
        const s = 1 + Math.sin(p * Math.PI) * 0.09;
        torso.scale.set(s, s, s);
      } else {
        if (st !== "thinking") torso.scale.set(1,1,1);
        if (st !== "sent") sentTime = -99;
      }

      // ── Wave on load ───────────────────────────────────────
      if (waving) {
        wavePhase += 0.06;
        armPivR.rotation.z = -0.5 - Math.abs(Math.sin(wavePhase)) * 1.2;
        armPivR.rotation.x = Math.sin(wavePhase * 2) * 0.30;
        lowerR.rotation.z  = -Math.abs(Math.sin(wavePhase * 1.5)) * 0.55;
        if (wavePhase > Math.PI * 3.8) {
          waving = false;
          armPivR.rotation.set(0, 0, -0.22);
          lowerR.rotation.set(0, 0, 0);
        }
      } else if (st !== "thinking") {
        armPivR.rotation.z = -0.22 + Math.sin(t * 0.72) * 0.025;
        armPivL.rotation.z =  0.22 + Math.sin(t * 0.72 + 1.1) * 0.025;
      }

      // ── Particles + glow disc ──────────────────────────────
      pts.rotation.y = t * 0.04;
      pts.rotation.x = t * 0.02;
      disc.scale.setScalar(1 + Math.sin(t * 0.85) * 0.06);
      disc.material.opacity = 0.16 + Math.sin(t * 0.85) * 0.07;

      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ─────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}