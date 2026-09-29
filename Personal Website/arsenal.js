window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("arsenal-canvas");
    if (!canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lighting (Reflections on glass + bright front logo illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const frontDirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    frontDirLight.position.set(0, 4, 8);
    scene.add(frontDirLight);

    const purpleAccent = new THREE.PointLight(0xa855f7, 3.5, 30);
    purpleAccent.position.set(-6, 3, 3);
    scene.add(purpleAccent);

    const cyanAccent = new THREE.PointLight(0x38bdf8, 2.5, 30);
    cyanAccent.position.set(6, -3, 3);
    scene.add(cyanAccent);

    // 3. Materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.1,
        transmission: 0.95,
        thickness: 1.2,
        transparent: true,
        opacity: 0.85,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x110c1a,
        metalness: 0.8,
        roughness: 0.3,
    });

    // 4. Exact Brand Vectors (Encoded as SVG Data URIs)
    const brandData = [
        {
            name: "After Effects",
            glow: 0x9999ff,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#00005b"/>
              <text x="35" y="80" fill="#9999ff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="52">Ae</text>
            </svg>`,
        },
        {
            name: "Blender 3D",
            glow: 0xe87d0d,
            svg: `<svg xmlns="https://download.blender.org/branding/community/blender_community_badge_white.svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#1e1e24"/>
              <circle cx="60" cy="65" r="18" fill="none" stroke="#e87d0d" stroke-width="8"/>
              <circle cx="60" cy="65" r="9" fill="#007acc"/>
              <line x1="60" y1="47" x2="60" y2="24" stroke="#e87d0d" stroke-width="8" stroke-linecap="round"/>
              <line x1="45" y1="55" x2="26" y2="40" stroke="#e87d0d" stroke-width="8" stroke-linecap="round"/>
              <line x1="75" y1="55" x2="94" y2="40" stroke="#e87d0d" stroke-width="8" stroke-linecap="round"/>
            </svg>`,
        },
        {
            name: "HTML5",
            glow: 0xe34f26,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#1b1724"/>
              <path d="M 28 24 L 92 24 L 86 88 L 60 96 L 34 88 Z" fill="#e34f26"/>
              <path d="M 60 30 L 85 30 L 80 82 L 60 88 Z" fill="#ef652a"/>
              <text x="60" y="68" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" text-anchor="middle">H5</text>
            </svg>`,
        },
        {
            name: "CSS3",
            glow: 0x1572b6,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#1b1724"/>
              <path d="M 28 24 L 92 24 L 86 88 L 60 96 L 34 88 Z" fill="#1572b6"/>
              <path d="M 60 30 L 85 30 L 80 82 L 60 88 Z" fill="#33a9dc"/>
              <text x="60" y="68" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" text-anchor="middle">C3</text>
            </svg>`,
        },
        {
            name: "JavaScript",
            glow: 0xf7df1e,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#f7df1e"/>
              <text x="60" y="82" fill="#000000" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="52" text-anchor="middle">JS</text>
            </svg>`,
        },
        {
            name: "TradingView",
            glow: 0x2962ff,
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
              <rect width="120" height="120" rx="26" fill="#131722"/>
              <path d="M 26 44 L 52 44 L 52 82 L 38 82 L 38 58 L 26 58 Z" fill="#2962ff"/>
              <rect x="60" y="44" width="34" height="38" rx="7" fill="#2962ff"/>
            </svg>`,
        },
    ];

    const group = new THREE.Group();
    scene.add(group);

    const total = brandData.length;
    const spacing = 1.95;
    const startX = -((total - 1) * spacing) / 2;
    const pedestals = [];
    const texLoader = new THREE.TextureLoader();

    // 5. Build Monoliths
    brandData.forEach((brand, index) => {
        const monolith = new THREE.Group();

        // Dark pedestal bottom
        const baseGeom = new THREE.CylinderGeometry(0.68, 0.74, 0.22, 36);
        const baseMesh = new THREE.Mesh(baseGeom, baseMaterial);
        baseMesh.position.y = -0.95;
        monolith.add(baseMesh);

        // Glass box wrapper
        const glassGeom = new THREE.BoxGeometry(1.2, 1.35, 0.5);
        const glassMesh = new THREE.Mesh(glassGeom, glassMaterial);
        monolith.add(glassMesh);

        // Create 3D Emblem Plate with the actual vector texture
        const dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(brand.svg);
        const logoTexture = texLoader.load(dataUri);
        logoTexture.anisotropy = 8;

        const emblemPlateGeom = new THREE.BoxGeometry(0.85, 0.85, 0.08);
        const emblemMat = new THREE.MeshStandardMaterial({
            map: logoTexture,
            roughness: 0.2,
            metalness: 0.5,
            emissive: brand.glow,
            emissiveIntensity: 0.15,
        });

        const logoMesh = new THREE.Mesh(emblemPlateGeom, emblemMat);
        monolith.add(logoMesh);

        monolith.position.x = startX + index * spacing;
        group.add(monolith);

        pedestals.push({
            mesh: monolith,
            logo: logoMesh,
            initialY: monolith.position.y,
            seed: index * 0.95,
        });
    });

    // 6. Interactive Movement
    let targetRotationX = 0;
    let targetRotationY = 0;

    window.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

            targetRotationY = nx * 0.45;
            targetRotationX = -ny * 0.25;
        }
    });

    window.addEventListener("resize", () => {
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;

        camera.aspect = width / height;
        camera.position.z = width < 768 ? 16 : 11;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    if (canvas.parentElement.clientWidth < 768) {
        camera.position.z = 16;
        camera.updateProjectionMatrix();
    }

    // 7. Render Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;
        group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

        pedestals.forEach(p => {
            p.mesh.position.y = p.initialY + Math.sin(t * 1.8 + p.seed) * 0.08;
            p.logo.rotation.y = Math.sin(t * 1.2 + p.seed) * 0.2;
        });

        renderer.render(scene, camera);
    }

    animate();
});
