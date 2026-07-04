// 검단퍼스트치과 — 히어로 3D 씬 (Three.js)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

const wrap = document.getElementById('hero-3d')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (wrap && !reduced) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, wrap.clientWidth / wrap.clientHeight, 0.1, 100)
  camera.position.set(0, 0.3, 8)

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
  wrap.appendChild(renderer.domElement)

  // ===== 조명 =====
  scene.add(new THREE.AmbientLight(0x8899bb, 0.55))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(4, 6, 6)
  scene.add(key)
  const goldLight = new THREE.PointLight(0xc9a227, 26, 22)
  goldLight.position.set(-4.5, -2, 3.5)
  scene.add(goldLight)
  const rim = new THREE.DirectionalLight(0x5b8ec2, 1.4)
  rim.position.set(-3, 4, -5)
  scene.add(rim)

  const root = new THREE.Group()
  scene.add(root)

  // ===== 치아 (진주광택) =====
  const pearl = new THREE.MeshPhysicalMaterial({
    color: 0xf9f7f1, roughness: 0.16, metalness: 0.02,
    clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.4, sheenColor: 0xddb85e,
  })
  const tooth = new THREE.Group()

  const crown = new THREE.Mesh(new THREE.SphereGeometry(1.15, 56, 56), pearl)
  crown.scale.set(1, 0.82, 0.92)
  crown.position.y = 0.55
  tooth.add(crown)

  // 교두(cusps) 4개
  ;[[0.48, 0.38], [-0.48, 0.38], [0.48, -0.38], [-0.48, -0.38]].forEach(([x, z]) => {
    const cusp = new THREE.Mesh(new THREE.SphereGeometry(0.36, 36, 36), pearl)
    cusp.position.set(x, 1.18, z)
    tooth.add(cusp)
  })

  // 치근(roots) 2개
  ;[-0.42, 0.42].forEach((x, i) => {
    const rootMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.85, 8, 24), pearl)
    rootMesh.position.set(x, -0.62, 0)
    rootMesh.rotation.z = i === 0 ? 0.22 : -0.22
    tooth.add(rootMesh)
  })

  tooth.position.y = 0.1
  root.add(tooth)

  // ===== 골드 궤도 링 =====
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1, roughness: 0.22 })
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.035, 16, 140), goldMat)
  ring1.rotation.x = Math.PI / 2.25
  root.add(ring1)

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.02, 16, 140),
    new THREE.MeshStandardMaterial({ color: 0xddb85e, metalness: 1, roughness: 0.3, transparent: true, opacity: 0.55 })
  )
  ring2.rotation.x = Math.PI / 3.2
  ring2.rotation.y = 0.5
  root.add(ring2)

  // 링 위의 골드 구슬
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), goldMat)
  root.add(orb)
  const orb2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 24), goldMat)
  root.add(orb2)

  // ===== 파티클 =====
  const N = 260
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const r = 2.9 + Math.random() * 1.8
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.cos(phi) * 0.8
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xddb85e, size: 0.045, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  root.add(particles)

  // ===== 마우스 패럴랙스 =====
  let mx = 0, my = 0, tx = 0, ty = 0
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2
    ty = (e.clientY / window.innerHeight - 0.5) * 2
  }, { passive: true })

  // ===== 루프 =====
  const clock = new THREE.Clock()
  let raf
  const animate = () => {
    raf = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()
    mx += (tx - mx) * 0.045
    my += (ty - my) * 0.045

    tooth.rotation.y = t * 0.35
    tooth.position.y = 0.1 + Math.sin(t * 1.1) * 0.14
    tooth.rotation.z = Math.sin(t * 0.6) * 0.05

    ring1.rotation.z = t * 0.25
    ring2.rotation.z = -t * 0.18
    particles.rotation.y = t * 0.05

    orb.position.set(Math.cos(t * 0.7) * 2.25, Math.sin(t * 0.7) * 0.6, Math.sin(t * 0.7) * 2.25)
    orb2.position.set(Math.cos(-t * 0.5 + 2) * 2.7, Math.sin(-t * 0.5 + 2) * 1.1, Math.sin(-t * 0.5 + 2) * 2.7)

    root.rotation.y = mx * 0.25
    root.rotation.x = my * 0.15
    camera.position.x = mx * 0.4
    camera.position.y = 0.3 - my * 0.3
    camera.lookAt(0, 0.2, 0)

    renderer.render(scene, camera)
  }
  animate()

  // 화면 밖이면 정지 (성능)
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { if (!raf) animate() }
      else { cancelAnimationFrame(raf); raf = null }
    })
  }, { threshold: 0.02 }).observe(wrap)

  // 리사이즈
  new ResizeObserver(() => {
    const w = wrap.clientWidth, h = wrap.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }).observe(wrap)
}
