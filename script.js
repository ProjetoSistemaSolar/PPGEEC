import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js"
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js"
import { TWEEN } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/libs/tween.module.min.js"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.screenSpacePanning = false
controls.maxPolarAngle = Math.PI / 2

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
scene.add(directionalLight)

const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
scene.add(lightHelper)

const loader = new GLTFLoader()
loader.load("./blender/ppgeec.glb", (gltf) => {
  const particles = gltf.scene
  particles.scale.set(1.5, 1.5, 1.5)
  particles.position.set(-3, 20, 0)

  scene.add(particles)

  particles.traverse((child) => {
    if (child.isMesh) {
      const customMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
      })
      child.material = customMaterial
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  const targetPosition = new THREE.Vector3(-3, -2.55, 0)
  const fallDuration = 1000
  const quicarDuration = 800

  new TWEEN.Tween({ y: particles.position.y })
    .to({ y: targetPosition.y }, fallDuration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((obj) => {
      particles.position.y = obj.y
    })
    .onComplete(() => {
      new TWEEN.Tween({ bounce: 0 })
        .to({ bounce: 1 }, quicarDuration)
        .onUpdate((obj) => {
          const bounceFactor = Math.abs(Math.sin(obj.bounce * Math.PI))
          particles.position.y = targetPosition.y + 10 * bounceFactor
        })
        .onComplete(() => {
          particles.position.copy(targetPosition)
        })
        .start()
    })
    .start()
})

const setCameraPosition = (x, y, z) => {
  camera.position.set(x, y, z)
}

const setLightAngle = (x, y, z) => {
  directionalLight.position.set(x, y, z)
  lightHelper.update()
}

const updateCameraPosition = () => {
  const cameraX = parseFloat($("#cameraX").val()) || 0
  const cameraY = parseFloat($("#cameraY").val()) || 0
  const cameraZ = parseFloat($("#cameraZ").val()) || 0

  setCameraPosition(cameraX, cameraY, cameraZ)
}

const updateLightAngle = () => {
  const lightX = parseFloat($("#lightX").val()) || 0
  const lightY = parseFloat($("#lightY").val()) || 0
  const lightZ = parseFloat($("#lightZ").val()) || 0

  setLightAngle(lightX, lightY, lightZ)
}

$("#applyCameraChanges").on("click", function () {
  updateCameraPosition()
})

$("#applyLightChanges").on("click", function () {
  updateLightAngle()
})

camera.position.y = 15

const animate = () => {
  requestAnimationFrame(animate)

  controls.update()
  TWEEN.update()

  renderer.render(scene, camera)
}

animate()
