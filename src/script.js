import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'

import gsap from 'gsap'






/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded',
    starColor:'#ffff00'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
        particleMaterial.color.set(parameters.materialColor)
    })

  


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * texture
 */

const textureLoader = new THREE.TextureLoader()

const particlesLoader= textureLoader.load('/Textures/particles/4.png')


const griLoader = textureLoader.load('textures/gradients/3.jpg')
griLoader.magFilter= THREE.NearestFilter

const material = new THREE.MeshToonMaterial({
    color: '#ffff00',
    gradientMap:griLoader
})


const objectDistance = 4

const meshBox = new THREE.Mesh(
    new THREE.TorusGeometry(1,0.4,16,6),
    material
)

const meshcone = new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)

const meshtour = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8,0.35,100,16),
    material
)

meshBox.position.y = objectDistance * 0;

meshcone.position.y = - objectDistance * 1;

meshtour.position.y = - objectDistance * 2;

meshBox.position.x =2;

meshcone.position.x = -2;

meshtour.position.x = 2;


scene.add(meshBox,meshcone,meshtour)

const sectionmeshes = [meshBox,meshcone,meshtour]


/**
 * particles
 */

const particlesCount = 1000
const postion = new Float32Array (particlesCount * 3)


for (let i = 0; i < particlesCount; i++) {
    
    postion[i * 3 + 0] = (Math.random() - 0.5) * 10
    postion[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionmeshes.length
    postion[i * 3 + 2] = (Math.random() - 0.5) * 10
    
}

const particlesGeometry = new THREE.BufferGeometry()

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(postion, 3))

const particleMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.2,
    map: particlesLoader,
    transparent: true,
    alphaMap: particlesLoader,
    depthWrite:false

})

const paticles = new THREE.Points(particlesGeometry, particleMaterial)

scene.add(paticles)

/**
 * light
 */

const light = new THREE.DirectionalLight('#ffffff',1)

light.position.set(1, 1, 0)
scene.add(light)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * the scroll
 */


let currentSection = 0
window.addEventListener('scroll', () => {
    let scrollY= window.scrollY

    const newSection = Math.round(scrollY / sizes.height)
    
    if (currentSection != newSection) {

        gsap.to(
            sectionmeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                
            }
        )
    }

})


/** curser */

const curser = {}
curser.x = 0;
curser.y = 0;


window.addEventListener('mousemove', (event) => {
    curser.y = event.clientY / sizes.height - 0.5;
    curser.x = event.clientX / sizes.width - 0.5;

})


/**
 * Camera
 */

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previoustime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previoustime

    previoustime = deltaTime;

    

    //animate the Camera
    camera.position.y= - scrollY/sizes.height * objectDistance
            //parallax movment
            const parallaxX = curser.x
            const parallaxY = curser.y

            cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.1 
            cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.1 

    //animation the meshes
    for (const mesh of sectionmeshes) {
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()