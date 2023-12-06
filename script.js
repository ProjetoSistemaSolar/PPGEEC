// Importação das bibliotecas Three.js necessárias
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js"
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js"
import { TWEEN } from "https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/libs/tween.module.min.js"

// Criação da cena, câmera e renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Adição de um grid à cena para melhor visualização
const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper)

// Configuração dos controles de órbita para interação do usuário
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.screenSpacePanning = false
controls.maxPolarAngle = Math.PI / 2

// Adição de luz ambiente e luz direcional à cena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
scene.add(directionalLight)

// Adição de um helper para visualizar a direção da luz direcional
const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
scene.add(lightHelper)

// Carregamento de um modelo 3D usando o GLTFLoader
const loader = new GLTFLoader()
loader.load("./blender/ppgeec.glb", (gltf) => {
  // Manipulação do modelo 3D carregado
  const particles = gltf.scene
  particles.scale.set(1.5, 1.5, 1.5)
  particles.position.set(-3, 20, 0)

  scene.add(particles)

  // Configuração de material personalizado e sombras para cada malha do modelo
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

  // Animação de queda e quicar usando o Tween.js
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

// Funções auxiliares para atualizar a posição da câmera e da luz
const setCameraPosition = (x, y, z) => {
  camera.position.set(x, y, z)
}

const setLightAngle = (x, y, z) => {
  directionalLight.position.set(x, y, z)
  lightHelper.update()
}

// Funções para atualizar a posição da câmera e da luz com base nos valores fornecidos
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

// Adição de event listeners para os botões que aplicam as mudanças de câmera e luz
$("#applyCameraChanges").on("click", function () {
  updateCameraPosition()
})

$("#applyLightChanges").on("click", function () {
  updateLightAngle()
})

// Posicionamento inicial da câmera
camera.position.y = 15

// Função de animação principal
const animate = () => {
  requestAnimationFrame(animate)

  // Atualização dos controles de órbita e do Tween.js
  controls.update()
  TWEEN.update()

  // Renderização da cena
  renderer.render(scene, camera)
}

// Inicialização da animação
animate()

