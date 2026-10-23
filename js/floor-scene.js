import * as THREE from 'three';

/**
 * STAGE B: 3D ISOMETRIC ARCHITECTURAL CUTAWAY OF "THE FLOOR"
 * - Features the elevated 180kg Fully Loaded Barbell as the upper Cross-Section Boundary Marker
 * - Detailed 3D brutalist gym interior with 4 interactive telemetry zones:
 *   1. Power Racks
 *   2. Free Weights
 *   3. Turf Track
 *   4. Recovery Lounge
 * - Real-time 3D-to-2D projection for floating glowing hotspot nodes
 */
export class FloorCutawayScene {
  constructor({ canvas, viewportBox, hotspotElements, onSelectZone }) {
    this.canvas = canvas;
    this.viewportBox = viewportBox;
    this.hotspotElements = hotspotElements; // { racks, freeweights, turf, recovery }
    this.onSelectZone = onSelectZone || (() => {});

    this.width = viewportBox.clientWidth || 860;
    this.height = viewportBox.clientHeight || 560;

    this.activeZone = 'racks';
    this.wireframeMode = false;

    // Camera spherical / target interpolation
    this.camTargetPos = new THREE.Vector3(14.5, 13.5, 15.5);
    this.camCurrentPos = new THREE.Vector3(14.5, 13.5, 15.5);
    this.lookAtTarget = new THREE.Vector3(0, 0.4, 0);
    this.lookAtCurrent = new THREE.Vector3(0, 0.4, 0);

    // Drag orbit
    this.isDragging = false;
    this.prevPointer = { x: 0, y: 0 };
    this.orbitAngleOffset = 0;

    // Zone 3D anchor coordinates
    this.zoneAnchors = {
      racks: new THREE.Vector3(-4.2, 1.9, -2.2),
      freeweights: new THREE.Vector3(4.1, 1.7, -2.2),
      turf: new THREE.Vector3(-1.8, 1.2, 2.95),
      recovery: new THREE.Vector3(4.5, 1.6, 2.7)
    };

    this.zoneHighlightPads = {};
    this.allMaterials = [];

    this.initThree();
    this.buildLighting();
    this.buildArchitecturalShell();
    this.buildBoundaryBarbellHeader();
    this.buildZonePowerRacks();
    this.buildZoneFreeWeights();
    this.buildZoneTurfTrack();
    this.buildZoneRecoveryLounge();
    this.bindEvents();
    this.handleResize();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161615);

    this.camera = new THREE.PerspectiveCamera(32, this.width / this.height, 0.1, 120);
    this.camera.position.copy(this.camCurrentPos);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  buildLighting() {
    const ambient = new THREE.AmbientLight(0xedece8, 0.9);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.1);
    dirLight.position.set(12, 22, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.top = 12;
    dirLight.shadow.camera.bottom = -12;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.75);
    fillLight.position.set(-14, 10, -10);
    this.scene.add(fillLight);
  }

  registerMat(mat) {
    this.allMaterials.push(mat);
    return mat;
  }

  buildArchitecturalShell() {
    this.archGroup = new THREE.Group();
    this.scene.add(this.archGroup);

    // 1. Thick Reinforced Concrete Floor Slab (16 x 10.5 units)
    const slabMat = this.registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x2c2c2a,
        roughness: 0.85,
        metalness: 0.1
      })
    );
    const slabGeo = new THREE.BoxGeometry(15.6, 0.55, 10.4);
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.y = -0.275;
    slabMesh.receiveShadow = true;
    this.archGroup.add(slabMesh);

    // Architectural Blueprint Grid on the Floor Slab
    const gridHelper = new THREE.GridHelper(15.4, 22, 0x6e6d68, 0x3b3b38);
    gridHelper.position.y = 0.01;
    gridHelper.scale.z = 10.2 / 15.4;
    this.archGroup.add(gridHelper);

    // 2. Cutaway Brutalist Perimeter Concrete Walls (Back & Left Wall Cutaway)
    const wallMat = this.registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x42413e,
        roughness: 0.78,
        metalness: 0.12
      })
    );

    // Back North Wall
    const backWallGeo = new THREE.BoxGeometry(15.6, 3.2, 0.38);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.6, -5.01);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    this.archGroup.add(backWall);

    // Left West Wall
    const leftWallGeo = new THREE.BoxGeometry(0.38, 3.2, 10.4);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-7.61, 1.6, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.archGroup.add(leftWall);

    // Section Cut Top Cap Stripe (Chalk White architectural section cut indicator)
    const cutCapMat = this.registerMat(
      new THREE.MeshBasicMaterial({ color: 0xf4f3ef })
    );
    const backCap = new THREE.Mesh(new THREE.BoxGeometry(15.62, 0.06, 0.4), cutCapMat);
    backCap.position.set(0, 3.21, -5.01);
    this.archGroup.add(backCap);

    const leftCap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 10.42), cutCapMat);
    leftCap.position.set(-7.61, 3.21, 0);
    this.archGroup.add(leftCap);

    // Structural Black Steel Columns along the back & side
    const steelMat = this.registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x181818,
        metalness: 0.8,
        roughness: 0.3
      })
    );
    [-7.3, -2.5, 2.5, 7.3].forEach((x) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.5, 0.24), steelMat);
      col.position.set(x, 1.75, -4.8);
      this.archGroup.add(col);
    });
  }

  /**
   * Stage B Bridge: The 180kg Fully Loaded Barbell elevated as an Architectural Section Boundary Marker
   */
  buildBoundaryBarbellHeader() {
    this.boundaryBarGroup = new THREE.Group();
    this.boundaryBarGroup.position.set(0, 4.45, -2.2);
    this.scene.add(this.boundaryBarGroup);

    const chromeMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0xd8dce2, metalness: 0.9, roughness: 0.2 })
    );

    // Cross-section shaft spanning across the architectural datum
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 11.5, 20);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, chromeMat);
    this.boundaryBarGroup.add(shaft);

    // Full IWF Bumper stacks on both ends of the boundary marker bar
    const plateColors = [
      { c: 0xf4f3ef, r: 0.52, t: 0.12, offset: 4.2 },
      { c: 0x008751, r: 0.58, t: 0.14, offset: 4.36 },
      { c: 0xf0b800, r: 0.63, t: 0.16, offset: 4.54 },
      { c: 0x0052cc, r: 0.68, t: 0.18, offset: 4.74 },
      { c: 0xd92626, r: 0.72, t: 0.2, offset: 4.96 }
    ];

    plateColors.forEach((p) => {
      const mat = this.registerMat(
        new THREE.MeshStandardMaterial({ color: p.c, roughness: 0.4, metalness: 0.15 })
      );
      const geo = new THREE.CylinderGeometry(p.r, p.r, p.t, 28);
      geo.rotateZ(Math.PI / 2);

      const leftP = new THREE.Mesh(geo, mat);
      leftP.position.x = -p.offset;
      const rightP = new THREE.Mesh(geo, mat);
      rightP.position.x = p.offset;

      this.boundaryBarGroup.add(leftP);
      this.boundaryBarGroup.add(rightP);
    });

    // Vertical architectural datum drop lines connecting the barbell to the floor cutaway
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xd92626,
      transparent: true,
      opacity: 0.55
    });
    [-4.96, 4.96].forEach((x) => {
      const pts = [new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, -4.4, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, lineMat);
      this.boundaryBarGroup.add(line);
    });
  }

  createZonePad(zoneKey, x, z, w, d, colorHex) {
    const padGeo = new THREE.BoxGeometry(w, 0.06, d);
    const padMat = this.registerMat(
      new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.5,
        metalness: 0.1,
        transparent: true,
        opacity: 0.25
      })
    );
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(x, 0.03, z);
    this.archGroup.add(pad);
    this.zoneHighlightPads[zoneKey] = { mesh: pad, mat: padMat, baseColor: colorHex };
  }

  /**
   * ZONE 01: POWER RACKS (North-West Sector)
   */
  buildZonePowerRacks() {
    this.createZonePad('racks', -4.1, -2.3, 6.4, 4.4, 0xd92626);

    const rackSteelMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.75, roughness: 0.35 })
    );
    const oakMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x8f6b4a, roughness: 0.65 })
    );
    const redPlateMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0xd92626, roughness: 0.4 })
    );
    const bluePlateMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x0052cc, roughness: 0.4 })
    );

    // Build 3 Competition Power Racks with Oak Platforms & Loaded Barbells
    [-6.1, -4.1, -2.1].forEach((rx) => {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rx, 0, -2.5);

      // Lifting Platform (Rubber + Oak Center)
      const platRubber = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 2.4), rackSteelMat);
      platRubber.position.y = 0.04;
      rackGroup.add(platRubber);

      const platOak = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.09, 2.38), oakMat);
      platOak.position.y = 0.045;
      rackGroup.add(platOak);

      // 4 Vertical Uprights
      [
        [-0.55, -0.55],
        [0.55, -0.55],
        [-0.55, 0.25],
        [0.55, 0.25]
      ].forEach(([ux, uz]) => {
        const upright = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.08), rackSteelMat);
        upright.position.set(ux, 1.15, uz);
        upright.castShadow = true;
        rackGroup.add(upright);
      });

      // Top Pull-up / Crossbeams
      const topBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.88), rackSteelMat);
      topBeamL.position.set(-0.55, 2.26, -0.15);
      const topBeamR = topBeamL.clone();
      topBeamR.position.x = 0.55;
      const pullBar = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 0.06), rackSteelMat);
      pullBar.position.set(0, 2.26, 0.25);
      rackGroup.add(topBeamL, topBeamR, pullBar);

      // Barbell on J-cups with Red/Blue Plates
      const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.85, 12);
      barGeo.rotateZ(Math.PI / 2);
      const bar = new THREE.Mesh(barGeo, new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.9 }));
      bar.position.set(0, 1.25, 0.3);
      rackGroup.add(bar);

      [-0.74, 0.74].forEach((px) => {
        const pGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 18);
        pGeo.rotateZ(Math.PI / 2);
        const plate = new THREE.Mesh(pGeo, px < 0 ? redPlateMat : bluePlateMat);
        plate.position.set(px, 1.25, 0.3);
        rackGroup.add(plate);
      });

      this.archGroup.add(rackGroup);
    });
  }

  /**
   * ZONE 02: FREE WEIGHTS (North-East Sector)
   */
  buildZoneFreeWeights() {
    this.createZonePad('freeweights', 4.0, -2.3, 6.4, 4.4, 0x0052cc);

    const ironMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.35 })
    );
    const padLeatherMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x191919, roughness: 0.55 })
    );

    // 2 Multi-tier Dumbbell Racks along the back wall
    [2.6, 5.5].forEach((dx) => {
      const dbRack = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.85, 0.55), ironMat);
      dbRack.position.set(dx, 0.425, -4.1);
      dbRack.castShadow = true;
      this.archGroup.add(dbRack);

      // Row of dumbbells
      for (let i = -0.9; i <= 0.9; i += 0.36) {
        const db = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.38), ironMat);
        db.position.set(dx + i, 0.92, -4.1);
        this.archGroup.add(db);
      }
    });

    // 3 Heavy Adjustable Competition Benches
    [2.2, 4.0, 5.8].forEach((bx) => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(bx, 0, -1.7);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.42, 1.25), ironMat);
      frame.position.y = 0.21;
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 1.3), padLeatherMat);
      pad.position.y = 0.45;
      pad.castShadow = true;

      benchGroup.add(frame, pad);
      this.archGroup.add(benchGroup);
    });
  }

  /**
   * ZONE 03: TURF TRACK (South-West / Longitudinal Sprint & Sled Lane)
   */
  buildZoneTurfTrack() {
    this.createZonePad('turf', -1.8, 2.8, 10.6, 3.6, 0x008751);

    // Textured Dark Green/Charcoal Mondo Turf Strip
    const turfMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x1c3b2b, roughness: 0.9 })
    );
    const turfStrip = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.08, 3.1), turfMat);
    turfStrip.position.set(-1.8, 0.05, 2.8);
    turfStrip.receiveShadow = true;
    this.archGroup.add(turfStrip);

    // Crisp White Yard / Meter Hash Lines
    const hashMat = this.registerMat(new THREE.MeshBasicMaterial({ color: 0xf4f3ef }));
    for (let x = -6.2; x <= 2.6; x += 1.1) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 2.8), hashMat);
      line.position.set(x, 0.055, 2.8);
      this.archGroup.add(line);
    }

    // 2 Prowler Sleds loaded with Red & Yellow Olympic Plates
    const sledMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 })
    );
    const redMat = this.registerMat(new THREE.MeshStandardMaterial({ color: 0xd92626 }));
    const yellowMat = this.registerMat(new THREE.MeshStandardMaterial({ color: 0xf0b800 }));

    [
      { x: -4.8, z: 2.15, mat: redMat },
      { x: -0.4, z: 3.4, mat: yellowMat }
    ].forEach((s) => {
      const sledGroup = new THREE.Group();
      sledGroup.position.set(s.x, 0.09, s.z);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.65), sledMat);
      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 12), sledMat);
      post1.position.set(-0.38, 0.48, -0.22);
      const post2 = post1.clone();
      post2.position.set(-0.38, 0.48, 0.22);

      const weightHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 12), sledMat);
      weightHorn.position.set(0.1, 0.3, 0);

      const plateStack = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 20), s.mat);
      plateStack.position.set(0.1, 0.16, 0);

      sledGroup.add(base, post1, post2, weightHorn, plateStack);
      this.archGroup.add(sledGroup);
    });
  }

  /**
   * ZONE 04: RECOVERY LOUNGE (South-East Contrast Therapy Bay)
   */
  buildZoneRecoveryLounge() {
    this.createZonePad('recovery', 5.2, 2.8, 4.2, 3.6, 0xf0b800);

    // Sauna Cedar & Slate Chamber
    const saunaMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x5c3e26, roughness: 0.7 })
    );
    const saunaWarmGlow = this.registerMat(
      new THREE.MeshBasicMaterial({ color: 0xff9933 })
    );

    const saunaBox = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 1.75), saunaMat);
    saunaBox.position.set(5.9, 1.05, 1.95);
    saunaBox.castShadow = true;
    this.archGroup.add(saunaBox);

    const saunaWindow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 0.06), saunaWarmGlow);
    saunaWindow.position.set(5.9, 1.0, 2.84);
    this.archGroup.add(saunaWindow);

    // 2 Dual Cold Plunge Monolith Tubs (4°C Ice-Blue Illuminated Water)
    const tubWallMat = this.registerMat(
      new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.4, metalness: 0.5 })
    );
    const waterMat = this.registerMat(
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );

    [3.8, 5.1].forEach((tx) => {
      const tub = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.72, 1.45), tubWallMat);
      tub.position.set(tx, 0.36, 3.7);
      tub.castShadow = true;

      const water = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.05, 1.28), waterMat);
      water.position.set(tx, 0.71, 3.7);

      this.archGroup.add(tub, water);
    });
  }

  /**
   * Highlights a zone in 3D and focuses camera slightly toward that sector
   */
  focusZone(zoneKey) {
    if (!this.zoneAnchors[zoneKey]) return;
    this.activeZone = zoneKey;

    Object.entries(this.zoneHighlightPads).forEach(([key, item]) => {
      if (key === zoneKey) {
        item.mat.opacity = 0.72;
      } else {
        item.mat.opacity = 0.18;
      }
    });

    const anchor = this.zoneAnchors[zoneKey];
    this.lookAtTarget.set(anchor.x * 0.35, 0.5, anchor.z * 0.35);
    this.onSelectZone(zoneKey);
  }

  /**
   * Camera View Presets: 'isometric', 'top', 'low'
   */
  setCameraView(viewMode) {
    this.orbitAngleOffset = 0;
    if (viewMode === 'top') {
      this.camTargetPos.set(0, 23.5, 0.01);
      this.lookAtTarget.set(0, 0, 0);
    } else if (viewMode === 'low') {
      this.camTargetPos.set(0, 4.4, 17.5);
      this.lookAtTarget.set(0, 1.4, 0);
    } else {
      // Default Isometric 3D Cutaway
      this.camTargetPos.set(14.5, 13.5, 15.5);
      this.lookAtTarget.set(0, 0.4, 0);
    }
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this.allMaterials.forEach((mat) => {
      if ('wireframe' in mat) {
        mat.wireframe = this.wireframeMode;
      }
    });
    return this.wireframeMode;
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevPointer = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointer.x;
      this.prevPointer = { x: e.clientX, y: e.clientY };
      this.orbitAngleOffset -= dx * 0.0065;
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const rect = this.viewportBox.getBoundingClientRect();
    this.width = Math.max(300, rect.width);
    this.height = Math.max(320, rect.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  /**
   * Projects 3D zone coordinates to 2D CSS coordinates for the floating glowing hotspot nodes
   */
  updateHotspotProjections() {
    Object.entries(this.zoneAnchors).forEach(([zoneKey, worldVec]) => {
      const btn = this.hotspotElements[zoneKey];
      if (!btn) return;

      const projected = worldVec.clone();
      // Account for archGroup rotation
      projected.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.archGroup.rotation.y);
      projected.project(this.camera);

      const x = (projected.x * 0.5 + 0.5) * this.width;
      const y = (-(projected.y * 0.5) + 0.5) * this.height;

      btn.style.left = `${x}px`;
      btn.style.top = `${y}px`;
    });
  }

  update(time) {
    // Smooth camera interpolation
    this.camCurrentPos.lerp(this.camTargetPos, 0.07);
    this.lookAtCurrent.lerp(this.lookAtTarget, 0.08);

    this.camera.position.copy(this.camCurrentPos);
    this.camera.lookAt(this.lookAtCurrent);

    // Subtle rotation or user drag orbit on the architectural model
    if (!this.isDragging) {
      this.orbitAngleOffset += Math.sin(time * 0.35) * 0.0004;
    }
    this.archGroup.rotation.y += (this.orbitAngleOffset - this.archGroup.rotation.y) * 0.08;

    // Subtle hover float on the upper 180kg Cross-Section Boundary Barbell
    if (this.boundaryBarGroup) {
      this.boundaryBarGroup.position.y = 4.45 + Math.sin(time * 1.6) * 0.06;
      this.boundaryBarGroup.rotation.y = this.archGroup.rotation.y * 0.35;
    }

    this.renderer.render(this.scene, this.camera);
    this.updateHotspotProjections();
  }
}
