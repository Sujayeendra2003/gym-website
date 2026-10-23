import * as THREE from 'three';

/**
 * STAGE A: 3D OLYMPIC BARBELL & CHALK-DUST PARTICLE ENGINE
 * - Photorealistic 20kg Olympic Barbell with procedural diamond knurling
 * - Progressive scroll-bound loading of IWF Olympic Bumper Plates:
 *   5kg White -> 10kg Green -> 15kg Yellow -> 20kg Blue -> 25kg Red + Competition Collars (180kg total)
 * - Initial Barbell Drop & Clank animation with 3D + 2D Chalk-Dust Particle Explosion
 */
export class BarbellSceneController {
  constructor({ canvas, chalkCanvas, onPlateLock }) {
    this.canvas = canvas;
    this.chalkCanvas = chalkCanvas;
    this.chalkCtx = chalkCanvas ? chalkCanvas.getContext('2d') : null;
    this.onPlateLock = onPlateLock || (() => {});

    this.width = canvas.clientWidth || 960;
    this.height = canvas.clientHeight || 340;

    this.scrollProgress = 0; // 0.0 (20kg) -> 1.0 (180kg)
    this.currentWeight = 20;
    this.lockedStageIndex = 0;

    // Interactive orbit offsets
    this.targetRotX = 0.08;
    this.targetRotY = -0.18;
    this.currentRotX = 0.08;
    this.currentRotY = -0.18;
    this.isDragging = false;
    this.prevPointer = { x: 0, y: 0 };

    // Drop physics state
    this.barDropY = 3.2;
    this.barDropVel = 0;
    this.barFlexRecoil = 0;
    this.hasDroppedInitially = false;

    // 2D Chalk burst particles
    this.chalkParticles2D = [];

    this.initThree();
    this.buildLighting();
    this.buildBarbellAssembly();
    this.buildChalkDust3D();
    this.bindEvents();
    this.handleResize();

    // Trigger initial barbell drop & clank after short delay
    setTimeout(() => {
      this.triggerBarDrop();
    }, 280);
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(34, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0.15, 7.6);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  buildLighting() {
    const ambient = new THREE.AmbientLight(0xf6f5f0, 1.35);
    this.scene.add(ambient);

    // Overhead industrial gym key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // Cool steel rim light from left
    const rimLeft = new THREE.DirectionalLight(0xd8e4ff, 1.4);
    rimLeft.position.set(-7, 3, -4);
    this.scene.add(rimLeft);

    // Warm concrete bounce from below
    const bounceBottom = new THREE.DirectionalLight(0xedece8, 0.9);
    bounceBottom.position.set(0, -5, 3);
    this.scene.add(bounceBottom);

    // Subtle shadow-catcher plane under the barbell
    const shadowGeo = new THREE.PlaneGeometry(16, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.25;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  createKnurlBumpTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    const step = 8;
    for (let x = -64; x < c.width + 64; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 64, 64);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 64, 0);
      ctx.lineTo(x, 64);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(36, 4);
    return tex;
  }

  createPlateFaceTexture(labelKg, bgHex, textHex) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const cx = 256;
    const cy = 256;

    // Base rubber fill
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 512);

    // Outer recessed rubber flange rings
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, 232, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, Math.PI * 2);
    ctx.stroke();

    // Bold technical weight markings Top & Bottom
    ctx.save();
    ctx.fillStyle = textHex;
    ctx.font = '800 54px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${labelKg} KG`, cx, 92);
    ctx.fillText(`KILO // IWF`, cx, 420);
    ctx.restore();

    // Side competition markings
    ctx.save();
    ctx.fillStyle = textHex;
    ctx.font = '700 32px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CALIBRATED', 100, cy);
    ctx.fillText('COMPETITION', 412, cy);
    ctx.restore();

    // Metallic center hub ring
    const grad = ctx.createRadialGradient(cx, cy, 24, cx, cy, 78);
    grad.addColorStop(0, '#222222');
    grad.addColorStop(0.45, '#d4d7dc');
    grad.addColorStop(0.85, '#8c9199');
    grad.addColorStop(1, '#2b2b2b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 78, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  buildBarbellAssembly() {
    this.barbellGroup = new THREE.Group();
    this.scene.add(this.barbellGroup);

    const knurlTex = this.createKnurlBumpTexture();

    // 1. 28mm High-Tensile Steel Shaft (Horizontally oriented along X-axis)
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xbec3c9,
      metalness: 0.88,
      roughness: 0.28,
      bumpMap: knurlTex,
      bumpScale: 0.015
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe4e7ec,
      metalness: 0.94,
      roughness: 0.14
    });

    const bronzeBushingMat = new THREE.MeshStandardMaterial({
      color: 0xc88a3b,
      metalness: 0.85,
      roughness: 0.24
    });

    // Main central shaft (length 3.4 units)
    const shaftGeo = new THREE.CylinderGeometry(0.052, 0.052, 3.4, 32);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    shaftMesh.castShadow = true;
    this.barbellGroup.add(shaftMesh);

    // IWF Smooth Ring Marks on the shaft
    [-0.95, 0.95, -0.08, 0.08].forEach((xPos) => {
      const ringGeo = new THREE.CylinderGeometry(0.0535, 0.0535, 0.025, 24);
      ringGeo.rotateZ(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, chromeMat);
      ringMesh.position.x = xPos;
      this.barbellGroup.add(ringMesh);
    });

    // 2. Left & Right Rotating Olympic Sleeves (50mm diameter)
    [-1, 1].forEach((dir) => {
      // Inner flange stop collar
      const flangeGeo = new THREE.CylinderGeometry(0.165, 0.165, 0.08, 36);
      flangeGeo.rotateZ(Math.PI / 2);
      const flangeMesh = new THREE.Mesh(flangeGeo, chromeMat);
      flangeMesh.position.x = dir * 1.72;
      flangeMesh.castShadow = true;
      this.barbellGroup.add(flangeMesh);

      // Bronze IWF Bushing ring
      const bushingGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.04, 32);
      bushingGeo.rotateZ(Math.PI / 2);
      const bushingMesh = new THREE.Mesh(bushingGeo, bronzeBushingMat);
      bushingMesh.position.x = dir * 1.66;
      this.barbellGroup.add(bushingMesh);

      // Outer Loadable Sleeve
      const sleeveLength = 1.48;
      const sleeveGeo = new THREE.CylinderGeometry(0.095, 0.095, sleeveLength, 36);
      sleeveGeo.rotateZ(Math.PI / 2);
      const sleeveMesh = new THREE.Mesh(sleeveGeo, chromeMat);
      sleeveMesh.position.x = dir * (1.76 + sleeveLength / 2);
      sleeveMesh.castShadow = true;
      this.barbellGroup.add(sleeveMesh);

      // End cap
      const capGeo = new THREE.CylinderGeometry(0.096, 0.096, 0.03, 32);
      capGeo.rotateZ(Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeo, bronzeBushingMat);
      capMesh.position.x = dir * (1.76 + sleeveLength + 0.015);
      this.barbellGroup.add(capMesh);
    });

    // 3. Olympic Bumper Plate Definitions (5kg White, 10kg Green, 15kg Yellow, 20kg Blue, 25kg Red + Collars)
    // Prompt sequence: 20kg -> 30kg (+2x5kg White) -> 50kg (+2x10kg Green) -> 80kg (+2x15kg Yellow) -> 120kg (+2x20kg Blue) -> 180kg (+2x25kg Red + 2x5kg Collars)
    this.plateSpecs = [
      {
        id: '5kg',
        label: '5',
        weightPair: 10,
        cumulativeWeight: 30,
        colorHex: '#F4F3EF',
        textHex: '#111111',
        radius: 0.78,
        thickness: 0.11,
        lockXOffset: 1.83,
        startXOffset: 4.1,
        thresholdStart: 0.03,
        thresholdEnd: 0.20
      },
      {
        id: '10kg',
        label: '10',
        weightPair: 20,
        cumulativeWeight: 50,
        colorHex: '#008751',
        textHex: '#FFFFFF',
        radius: 0.88,
        thickness: 0.15,
        lockXOffset: 1.97,
        startXOffset: 4.35,
        thresholdStart: 0.20,
        thresholdEnd: 0.40
      },
      {
        id: '15kg',
        label: '15',
        weightPair: 30,
        cumulativeWeight: 80,
        colorHex: '#F0B800',
        textHex: '#111111',
        radius: 0.92,
        thickness: 0.18,
        lockXOffset: 2.145,
        startXOffset: 4.6,
        thresholdStart: 0.40,
        thresholdEnd: 0.60
      },
      {
        id: '20kg',
        label: '20',
        weightPair: 40,
        cumulativeWeight: 120,
        colorHex: '#0052CC',
        textHex: '#FFFFFF',
        radius: 0.95,
        thickness: 0.21,
        lockXOffset: 2.35,
        startXOffset: 4.85,
        thresholdStart: 0.60,
        thresholdEnd: 0.80
      },
      {
        id: '25kg',
        label: '25',
        weightPair: 60, // 2x25kg Red + 2x5kg competition collars = +60kg -> 180kg total
        cumulativeWeight: 180,
        colorHex: '#D92626',
        textHex: '#FFFFFF',
        radius: 0.97,
        thickness: 0.24,
        lockXOffset: 2.585,
        startXOffset: 5.15,
        thresholdStart: 0.80,
        thresholdEnd: 0.98
      }
    ];

    this.platePairs = [];

    this.plateSpecs.forEach((spec) => {
      const faceTex = this.createPlateFaceTexture(spec.label, spec.colorHex, spec.textHex);

      const rimMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.colorHex),
        roughness: 0.42,
        metalness: 0.12
      });

      const faceMat = new THREE.MeshStandardMaterial({
        map: faceTex,
        roughness: 0.38,
        metalness: 0.18
      });

      const plateGeo = new THREE.CylinderGeometry(spec.radius, spec.radius, spec.thickness, 48);
      plateGeo.rotateZ(Math.PI / 2);

      // Materials array for Cylinder: [sideRim, topCap, bottomCap]
      const mats = [rimMat, faceMat, faceMat];

      const leftPlate = new THREE.Mesh(plateGeo, mats);
      const rightPlate = new THREE.Mesh(plateGeo, mats);
      leftPlate.castShadow = true;
      rightPlate.castShadow = true;

      leftPlate.position.x = -spec.startXOffset;
      rightPlate.position.x = spec.startXOffset;
      leftPlate.visible = false;
      rightPlate.visible = false;

      this.barbellGroup.add(leftPlate);
      this.barbellGroup.add(rightPlate);

      this.platePairs.push({
        spec,
        leftMesh: leftPlate,
        rightMesh: rightPlate,
        wasLocked: false
      });
    });

    // Competition 2.5kg Spinlock Chrome/Red Collars on both sides (locks with the final 180kg stage)
    const collarGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.13, 32);
    collarGeo.rotateZ(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.2
    });
    this.leftCollar = new THREE.Mesh(collarGeo, collarMat);
    this.rightCollar = new THREE.Mesh(collarGeo, collarMat);
    this.leftCollar.visible = false;
    this.rightCollar.visible = false;
    this.barbellGroup.add(this.leftCollar);
    this.barbellGroup.add(this.rightCollar);
  }

  buildChalkDust3D() {
    const count = 260;
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      velocities.push({
        vx: (Math.random() - 0.5) * 0.008,
        vy: Math.random() * 0.006 + 0.002,
        vz: (Math.random() - 0.5) * 0.006
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });

    this.chalkPoints3D = new THREE.Points(geo, mat);
    this.chalkVelocities3D = velocities;
    this.scene.add(this.chalkPoints3D);
  }

  /**
   * Triggers the Barbell Drop & Chalk-Dust Burst Particle Explosion
   */
  triggerBarDrop() {
    this.barDropY = 2.4;
    this.barDropVel = -0.18;
    this.hasDroppedInitially = false;
  }

  /**
   * Emits a 2D high-density chalk-dust particle cloud burst at given normalized X positions
   */
  spawnChalkBurst2D(normalizedXList = [0.28, 0.5, 0.72], intensity = 1.0) {
    if (!this.chalkCanvas) return;
    const w = this.chalkCanvas.width;
    const h = this.chalkCanvas.height;
    const countPerOrigin = Math.floor(42 * intensity);

    normalizedXList.forEach((nx) => {
      const originX = nx * w;
      const originY = h * 0.52;
      for (let i = 0; i < countPerOrigin; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 5.5 + 1.2) * intensity;
        this.chalkParticles2D.push({
          x: originX + (Math.random() - 0.5) * 26,
          y: originY + (Math.random() - 0.5) * 18,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2.2,
          radius: Math.random() * 14 + 3,
          alpha: Math.random() * 0.55 + 0.25,
          decay: Math.random() * 0.014 + 0.008
        });
      }
    });
  }

  /**
   * Updates plate sliding positions and locks based on scroll progress (0..1)
   */
  setScrollProgress(progress) {
    this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);

    let computedWeight = 20;
    let activeStageIdx = 0;

    this.platePairs.forEach((pair, idx) => {
      const { spec, leftMesh, rightMesh } = pair;
      const localP = THREE.MathUtils.clamp(
        (this.scrollProgress - spec.thresholdStart) / (spec.thresholdEnd - spec.thresholdStart),
        0,
        1
      );

      if (localP <= 0.001) {
        leftMesh.visible = false;
        rightMesh.visible = false;
        pair.wasLocked = false;
      } else {
        leftMesh.visible = true;
        rightMesh.visible = true;

        // Smooth ease-out cubic slide onto sleeve
        const eased = 1 - Math.pow(1 - localP, 3);
        const currentOffset = THREE.MathUtils.lerp(spec.startXOffset, spec.lockXOffset, eased);

        leftMesh.position.x = -currentOffset;
        rightMesh.position.x = currentOffset;

        // Slight rotational spin as plate slides onto sleeve
        leftMesh.rotation.x = (1 - eased) * 1.6;
        rightMesh.rotation.x = -(1 - eased) * 1.6;

        if (localP >= 0.96) {
          computedWeight = spec.cumulativeWeight;
          activeStageIdx = idx + 1;
          if (!pair.wasLocked) {
            pair.wasLocked = true;
            this.barFlexRecoil = 0.085;
            this.spawnChalkBurst2D([0.24, 0.76], 0.85);
            this.onPlateLock(spec.cumulativeWeight, idx + 1, spec);
          }
        } else {
          // Interpolate intermediate weight display while sliding
          const prevWeight = idx === 0 ? 20 : this.plateSpecs[idx - 1].cumulativeWeight;
          computedWeight = Math.round(THREE.MathUtils.lerp(prevWeight, spec.cumulativeWeight, eased));
          pair.wasLocked = false;
        }
      }
    });

    // Collars lock at the end of the 25kg Red plate stage (reaching 180 kg)
    if (this.scrollProgress > 0.86) {
      const collarP = THREE.MathUtils.clamp((this.scrollProgress - 0.86) / 0.12, 0, 1);
      const collarX = THREE.MathUtils.lerp(4.9, 2.79, 1 - Math.pow(1 - collarP, 3));
      this.leftCollar.visible = true;
      this.rightCollar.visible = true;
      this.leftCollar.position.x = -collarX;
      this.rightCollar.position.x = collarX;
    } else {
      this.leftCollar.visible = false;
      this.rightCollar.visible = false;
    }

    this.currentWeight = computedWeight;
    this.lockedStageIndex = activeStageIdx;
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevPointer = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointer.x;
      const dy = e.clientY - this.prevPointer.y;
      this.prevPointer = { x: e.clientX, y: e.clientY };

      this.targetRotY += dx * 0.006;
      this.targetRotX = THREE.MathUtils.clamp(this.targetRotX + dy * 0.004, -0.45, 0.55);
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = Math.max(300, rect.width);
    this.height = Math.max(200, rect.height);

    this.camera.aspect = this.width / this.height;

    // Responsive adaptation: pull camera back slightly on mobile / narrow screens so full barbell fits
    if (this.width < 600) {
      this.camera.position.z = 11.2;
      this.targetRotZ = 0.16; // Slight dynamic tilt on narrow mobile viewports
    } else if (this.width < 920) {
      this.camera.position.z = 9.2;
      this.targetRotZ = 0;
    } else {
      this.camera.position.z = 7.4;
      this.targetRotZ = 0;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);

    if (this.chalkCanvas) {
      this.chalkCanvas.width = this.width;
      this.chalkCanvas.height = this.height;
    }
  }

  update(time) {
    // 1. Barbell Initial Drop & Clank Physics
    if (this.barDropY > 0 || Math.abs(this.barDropVel) > 0.001) {
      this.barDropVel -= 0.018; // Gravity
      this.barDropY += this.barDropVel;

      if (this.barDropY <= 0) {
        this.barDropY = 0;
        if (!this.hasDroppedInitially) {
          this.hasDroppedInitially = true;
          this.spawnChalkBurst2D([0.22, 0.5, 0.78], 1.35);
          this.onPlateLock(this.currentWeight, this.lockedStageIndex, { id: 'drop' });
        }
        // Damped steel bounce
        this.barDropVel = -this.barDropVel * 0.36;
        if (Math.abs(this.barDropVel) < 0.015) {
          this.barDropVel = 0;
        }
      }
    }

    // 2. Micro-recoil when plates slam onto sleeves
    if (this.barFlexRecoil > 0.001) {
      this.barFlexRecoil *= 0.86;
    } else {
      this.barFlexRecoil = 0;
    }

    // 3. Smooth rotational damping
    if (!this.isDragging) {
      this.targetRotY = -0.16 + Math.sin(time * 0.6) * 0.05;
    }
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.08;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.08;

    this.barbellGroup.position.y =
      this.barDropY + Math.sin(time * 28) * this.barFlexRecoil;
    this.barbellGroup.rotation.x = this.currentRotX;
    this.barbellGroup.rotation.y = this.currentRotY;
    this.barbellGroup.rotation.z = this.targetRotZ || 0;

    // 4. Update 3D ambient chalk particles
    if (this.chalkPoints3D) {
      const posAttr = this.chalkPoints3D.geometry.attributes.position;
      for (let i = 0; i < this.chalkVelocities3D.length; i++) {
        const v = this.chalkVelocities3D[i];
        let x = posAttr.getX(i) + v.vx;
        let y = posAttr.getY(i) + v.vy;
        let z = posAttr.getZ(i) + v.vz;

        if (y > 1.4) y = -1.4;
        if (x > 4.2) x = -4.2;
        if (x < -4.2) x = 4.2;

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);

    // 5. Render 2D Chalk Burst Overlay Particles
    if (this.chalkCtx && this.chalkCanvas) {
      this.chalkCtx.clearRect(0, 0, this.chalkCanvas.width, this.chalkCanvas.height);
      for (let i = this.chalkParticles2D.length - 1; i >= 0; i--) {
        const p = this.chalkParticles2D[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.04; // slight drift
        p.radius += 0.35;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          this.chalkParticles2D.splice(i, 1);
          continue;
        }

        const grad = this.chalkCtx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        grad.addColorStop(0.6, `rgba(237, 236, 232, ${p.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(237, 236, 232, 0)');

        this.chalkCtx.fillStyle = grad;
        this.chalkCtx.beginPath();
        this.chalkCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.chalkCtx.fill();
      }
    }
  }
}
