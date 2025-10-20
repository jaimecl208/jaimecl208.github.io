// Juego refactorizado sin CANNON.js - Solo raycasting

var loader;
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;
var mixer = null;
const clock = new THREE.Clock();
var player;

// Posición y física manual del jugador
var speed = 0.1;
var p_pos = new THREE.Vector3(0, 0, 0);
var velocity = new THREE.Vector3(0, 0, 0);

// Ventanas
let ventanas = [];
let velocidadVentanas = 20;

// Vagones
let vagones = [];
let velocidadVagones = 25;
const railXPositions = [-2.5, 0, 2.5];

// Obstáculos
let obstaculos = [];
let tiempoProximoObstaculo = 0;

// Cámara
let cameraMode = "third";
const cameraOffset = new THREE.Vector3(0, 3, 6);

// Configuración de los vagones
const vagonAncho = 1.5;
const vagonAlto = 3.0;
const vagonLargo = 10.0;

// Nave
let naveWidth = 6;
let naveHeight = 100;
let naveLength = 200;

// Animaciones
const A_JUMP = 1;
const A_RUN = 0;
const A_CROUCH = 2;

// Estado del personaje
let currentRail = 1;
let canChangeLane = true;
let isJumping = false;
let isCrouching = false;
let enSuelo = false;
const jumpStrength = 0.45;
const gravity = -0.020;
const fastDropStrength = -0.9   ;
const laneCooldown = 150;
let targetX = railXPositions[currentRail];

// Altura del jugador
const playerHeight = 1.8;
const playerWidth = 0.5;

// Raycasters
let downRaycaster = new THREE.Raycaster();
let forwardRaycaster = new THREE.Raycaster();
let rayHelper;
let downRayHelper;

// Objetos colisionables
let collidables = [];

// Event listeners para controles
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            // if (canChangeLane && currentRail > 0) {
            //     currentRail--;
            //     p_pos.x = railXPositions[currentRail];
            //     canChangeLane = false;
            //     setTimeout(() => canChangeLane = true, laneCooldown);
            // }
            // break;
            if (canChangeLane && currentRail > 0) {
                currentRail--;
                targetX = railXPositions[currentRail];
                canChangeLane = false;
                setTimeout(() => canChangeLane = true, laneCooldown);
            }
            break;


        case 'ArrowRight':
        case 'KeyD':
            // if (canChangeLane && currentRail < 2) {
            //     currentRail++;
            //     p_pos.x = railXPositions[currentRail];
            //     canChangeLane = false;
            //     setTimeout(() => canChangeLane = true, laneCooldown);
            // }
            // break;

            if (canChangeLane && currentRail < 2) {
                currentRail++;
                targetX = railXPositions[currentRail];
                canChangeLane = false;
                setTimeout(() => canChangeLane = true, laneCooldown);
            }
            break;


        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            if (enSuelo) {
                enSuelo = false;
                isJumping = true;
                isCrouching = false;
                velocity.y = jumpStrength;
                changeAnimation(A_JUMP);
            }
            break;

        case 'ArrowDown':
        case 'KeyS':
        case 'ShiftLeft':
        case 'ShiftRight':
            // if (!enSuelo) {
            //     velocity.y = fastDropStrength;
            //     isJumping = false;
            //     isCrouching = true;
            //     changeAnimation(A_CROUCH);
            // } else {
            //     if (!isCrouching) {
            //         isCrouching = true;
            //         changeAnimation(A_CROUCH);
            //         setTimeout(() => {
            //             isCrouching = false;
            //             if (enSuelo) changeAnimation(A_RUN);
            //         }, 600);
            //     }
            // }
            // break;
            if (isCrouching) break; // evita reiniciar animación si ya está agachado

            isCrouching = true;
            isJumping = false;
            velocity.y = enSuelo ? 0 : fastDropStrength;
            changeAnimation(A_CROUCH);

            // Asegura que se levante en máximo 1 segundo
            setTimeout(() => {
                if (isCrouching) {
                    isCrouching = false;
                    if (enSuelo) changeAnimation(A_RUN);
                }
            }, 1000);
            break;

        case 'KeyC':
            cameraMode = (cameraMode === "third") ? "first" : "third";
            break;
    }
});

// init();
// render();

class Obstaculo {
    constructor(mesh, tipo) {
        this.mesh = mesh;
        this.tipo = tipo;
    }

    actualizar(delta) {
        const velocidad = this.tipo === "suelo" ? 25 : 25;
        this.mesh.position.z += velocidad * delta;
    }

    fueraDeVista() {
        return this.mesh.position.z > naveLength / 2 + 10;
    }
}

function generarObstaculo(scene) {
    const tiposDisponibles = ["suelo", "vagonAgacharse", "vagonSaltar"];
    const tipo = tiposDisponibles[Math.floor(Math.random() * tiposDisponibles.length)];
    let mesh;

    if (tipo === "suelo") {
        const altoSuelo = 1;
        const geo = new THREE.BoxGeometry(1, altoSuelo, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        mesh = new THREE.Mesh(geo, mat);
        const rail = railXPositions[Math.floor(Math.random() * 3)];
        mesh.position.set(rail, altoSuelo / 2 + vagonAlto/2, -naveLength / 2 - 20);
    } else if (tipo === "vagonAgacharse") {
        const alto = 0.5;
        const geo = new THREE.BoxGeometry(1, alto, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff00ff });
        mesh = new THREE.Mesh(geo, mat);
        const rail = railXPositions[Math.floor(Math.random() * 3)];
        mesh.position.set(rail, vagonAlto + alto / 2, -naveLength / 2 - 20);
    } else if (tipo === "vagonSaltar") {
        const alto = 1.2;
        const geo = new THREE.BoxGeometry(1, alto, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        mesh = new THREE.Mesh(geo, mat);
        const rail = railXPositions[Math.floor(Math.random() * 3)];
        mesh.position.set(rail, vagonAlto + alto / 2, -naveLength / 2 - 20);
    }

    mesh.userData.isObstacle = true;
    scene.add(mesh);
    collidables.push(mesh);
    obstaculos.push(new Obstaculo(mesh, tipo));
}

function generarVagon(scene) {
    const railIndex = Math.floor(Math.random() * railXPositions.length);
    const railX = railXPositions[railIndex];
    const posZ = -naveLength / 2 - Math.random() * 20 - 10;

    const geo = new THREE.BoxGeometry(vagonAncho, vagonAlto, vagonLargo);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x111111
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(railX, vagonAlto / 2, posZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isVagon = true;
    scene.add(mesh);
    collidables.push(mesh);
    vagones.push(mesh);
}

function crearEscenario(scene) {
    // Skybox
    const skyGeo = new THREE.SphereGeometry(300, 64, 64);
    const skyMat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('textures/space_sky.jpg'),
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // Raíles flotantes
    const railWidth = 1.5;
    const railHeight = 0.2;
    const railLength = 200;
    const spacing = 2.5;

    const materialRail = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x2244ff,
        emissiveIntensity: 0.4
    });

    const railPositions = [-spacing, 0, spacing];

    railPositions.forEach(x => {
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(railWidth, railHeight, railLength),
            materialRail
        );
        rail.position.set(x, 0, -railLength / 2);
        rail.castShadow = true;
        rail.receiveShadow = true;
        rail.userData.isRail = true;
        scene.add(rail);
        collidables.push(rail);
    });

    // Estructura nave
    const naveGeo = new THREE.BoxGeometry(naveWidth, naveHeight, naveLength);
    const naveMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.3,
    });
    const nave = new THREE.Mesh(naveGeo, naveMat);
    nave.position.set(8, 0, -naveLength / 2);
    scene.add(nave);

    // Ventanas
    const windowGeo = new THREE.BoxGeometry(0.2, 0.5, 0.5);
    const windowMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1.5,
        metalness: 0.1,
        roughness: 0.1
    });

    const rows = 40;
    const cols = 25;
    const step = naveLength / cols * 1.5;
    const naveX = 8;
    const naveY = 0;
    const naveZ = -naveLength / 2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const win = new THREE.Mesh(windowGeo, windowMat);
            const y = (r - (rows - 1) / 2) * 1.2 + naveY;
            const z = naveZ + c * step;
            const x = naveX - naveWidth / 2 - 0.20;
            win.position.set(x, y, z);
            scene.add(win);
            ventanas.push(win);
        }
    }

    // Luces
    const ambient = new THREE.AmbientLight(0x99aaff, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xffffff, 1.2, 100);
    keyLight.position.set(0, 10, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x2244ff, 0.4, 60);
    fillLight.position.set(5, 2, -10);
    scene.add(fillLight);
}

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    crearEscenario(scene);

    // Inicializar posición del jugador
    p_pos.set(railXPositions[1], playerHeight / 2, -50);

    loadModelAndAnimations();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.01, 150);

    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    const light1 = new THREE.PointLight(0xffffff, 1, 10000);
    light1.position.set(-50, 50, -50);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xffffff, 1, 10000);
    light2.position.set(50, 50, 50);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Raycaster helper hacia adelante
    rayHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(0, 0, 0),
        5,
        0xff0000
    );
    scene.add(rayHelper);

    // Raycaster helper hacia abajo
    downRayHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 0),
        3,
        0x00ff00
    );
    scene.add(downRayHelper);

    window.addEventListener('resize', updateAspectRatio);

    // Suelo invisible para evitar que el jugador atraviese los raíles
    const invisibleFloorGeo = new THREE.BoxGeometry(10, 0.5, naveLength); // ancho suficiente para cubrir los 3 raíles
    const invisibleFloorMat = new THREE.MeshBasicMaterial({
        color: 0x00ff00,       // solo visible si necesitas depurar
        transparent: true,
        opacity: 0.0          // completamente invisible
    });
    const invisibleFloor = new THREE.Mesh(invisibleFloorGeo, invisibleFloorMat);
    invisibleFloor.position.set(0, 0, -naveLength / 2);
    scene.add(invisibleFloor);
    collidables.push(invisibleFloor);
}

let actions = {};
let animationNames = [];
let currentAnimationIndex = 0;

function loadModelAndAnimations() {
    const loader = new THREE.FBXLoader();

    loader.load('models/pj_juego/Ch44_nonPBR.fbx', function (object) {
        player = object;
        scene.add(object);
        object.position.copy(p_pos);
        object.rotation.y = Math.PI;

        var box = new THREE.Box3().setFromObject(object);
        var size = new THREE.Vector3();
        box.getSize(size);
        var s = 2.0 / size.y;
        object.scale.set(s, s, s);

        mixer = new THREE.AnimationMixer(object);

        object.traverse(function (child) {
            if (child.isMesh) {
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });

        const animations = [
            'models/pj_juego/Fast Run.fbx',
            'models/pj_juego/Jumping Up.fbx',
            'models/pj_juego/Laying.fbx'
        ];
        
        animations.forEach(function (animFile, index) {
            loader.load(animFile, function (animData) {
                const name = animFile.split('/').pop().split('.').slice(0, -1).join('.');
                const action = mixer.clipAction(animData.animations[0]);
                actions[name] = action;
                animationNames[index] = name;

                if (index === 0) {
                    action.play();
                }
            });
        });
    }, undefined, function (error) {
        console.error(error);
    });
}

function changeAnimation(index) {
    if (currentAnimationIndex == index) return;
    actions[animationNames[index]].play();
    actions[animationNames[currentAnimationIndex]].stop();
    currentAnimationIndex = index;
}

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// function checkGroundCollision() {
//     // Rayo desde el centro del jugador hacia abajo
//     const rayOrigin = p_pos.clone();
//     const rayDirection = new THREE.Vector3(0, -1, 0);

//     downRaycaster.set(rayOrigin, rayDirection);
//     const intersects = downRaycaster.intersectObjects(collidables, false);

//     // Actualizar helper visual
//     downRayHelper.position.copy(rayOrigin);
//     downRayHelper.setDirection(rayDirection);

//     if (intersects.length > 0) {
//         const distance = intersects[0].distance;
//         const groundY = intersects[0].point.y;

//         // Si estamos cerca del suelo (tolerancia)
//         if (distance < playerHeight / 2 + 0.3) {
//             if (!enSuelo && velocity.y <= 0) {
//                 // Aterrizamos
//                 p_pos.y = groundY + playerHeight / 2;
//                 velocity.y = 0;
//                 enSuelo = true;
//                 isJumping = false;
//                 if (!isCrouching) changeAnimation(A_RUN);
//             }
//             return true;
//         }
//     }

//     // No hay suelo debajo
//     if (enSuelo) {
//         enSuelo = false;
//     }
//     return false;
// }

function checkGroundCollision() {
    // Puntos desde los que se lanzarán rayos (centro y esquinas del "pie")
    const offsets = [
        new THREE.Vector3(0, 0, 0),          // centro
        new THREE.Vector3(0.2, 0, 0.2),      // delante derecha
        new THREE.Vector3(-0.2, 0, 0.2),     // delante izquierda
        new THREE.Vector3(0.2, 0, -0.2),     // atrás derecha
        new THREE.Vector3(-0.2, 0, -0.2)     // atrás izquierda
    ];

    let grounded = false;
    let minDistance = Infinity;
    let groundY = -Infinity;

    const rayDirection = new THREE.Vector3(0, -1, 0);

    for (const offset of offsets) {
        const rayOrigin = p_pos.clone().add(offset);
        downRaycaster.set(rayOrigin, rayDirection);

        const intersects = downRaycaster.intersectObjects(collidables, false);
        if (intersects.length > 0 && intersects[0].distance < playerHeight / 2 + 0.3) {
            grounded = true;
            if (intersects[0].point.y > groundY) {
                groundY = intersects[0].point.y;
                minDistance = intersects[0].distance;
            }
        }
    }

    // Actualizar helper visual (opcional, solo usa el rayo central)
    downRayHelper.position.copy(p_pos);
    downRayHelper.setDirection(rayDirection);

    if (grounded) {
        if (!enSuelo && velocity.y <= 0) {
            // Aterrizamos
            p_pos.y = groundY + playerHeight / 2;
            velocity.y = 0;
            enSuelo = true;
            isJumping = false;
            if (!isCrouching) changeAnimation(A_RUN);
        }
        return true;
    } else {
        enSuelo = false;
        return false;
    }
}


function update() {
    cameraControls.update();
    const delta = clock.getDelta();
    if (mixer != null) mixer.update(delta);

    if (player == null) return;

    // Aplicar gravedad
    if (!enSuelo) {
        velocity.y += gravity;
    }

    // Actualizar posición vertical
    p_pos.y += velocity.y;

    // Verificar colisión con el suelo
    checkGroundCollision();

    // Evitar caer infinitamente
    if (p_pos.y < -10) {
        p_pos.y = playerHeight / 2;
        velocity.y = 0;
        enSuelo = true;
    }

    // Interpolación suave entre carriles
    p_pos.x = THREE.MathUtils.lerp(p_pos.x, targetX, 0.15);

    // Actualizar posición del modelo del jugador
    if (player) {
        player.position.copy(p_pos);
    }

    // Movimiento de ventanas
    if (ventanas && ventanas.length > 0) {
        for (let i = 0; i < ventanas.length; i++) {
            const win = ventanas[i];
            win.position.z += velocidadVentanas * delta;

            if (win.position.z > naveLength / 2) {
                win.position.z = -naveLength / 2 - Math.random() * 10;
            }
        }
    }

    // Movimiento de vagones
    if (vagones.length > 0) {
        for (let i = 0; i < vagones.length; i++) {
            const v = vagones[i];
            v.position.z += velocidadVagones * delta;
        }

        vagones = vagones.filter(v => {
            if (v.position.z > naveLength / 2 + 10) {
                scene.remove(v);
                const idx = collidables.indexOf(v);
                if (idx > -1) collidables.splice(idx, 1);
                return false;
            }
            return true;
        });
    }

    generarVagonesPeriodicamente(delta);

    // Generar obstáculos
    tiempoProximoObstaculo -= delta;
    if (tiempoProximoObstaculo <= 0) {
        const cantidad = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < cantidad; i++) {
            generarObstaculo(scene);
        }
        tiempoProximoObstaculo = 0.6 + Math.random() * 1.2;
    }

    // Mover obstáculos
    obstaculos = obstaculos.filter(o => {
        o.actualizar(delta);
        if (o.fueraDeVista()) {
            scene.remove(o.mesh);
            const idx = collidables.indexOf(o.mesh);
            if (idx > -1) collidables.splice(idx, 1);
            return false;
        }
        return true;
    });

    // Cámara dinámica
    if (cameraMode === "third") {
        const offset = cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angulo);
        const targetPosition = new THREE.Vector3(
            p_pos.x - offset.x,
            p_pos.y + offset.y,
            p_pos.z + offset.z
        );
        camera.position.lerp(targetPosition, 0.1);
        const lookTarget = new THREE.Vector3(p_pos.x, p_pos.y + 1.5, p_pos.z);
        camera.lookAt(lookTarget);
    } else if (cameraMode === "first") {
        const headHeight = 1.6;
        const lookDistance = 4;
        const lookDir = new THREE.Vector3(Math.sin(angulo), 0, Math.cos(angulo));

        camera.position.set(p_pos.x, p_pos.y + headHeight, p_pos.z-0.5);
        const lookAtPos = new THREE.Vector3(
            p_pos.x + lookDir.x * lookDistance,
            p_pos.y + headHeight,
            p_pos.z - lookDir.z * lookDistance
        );
        camera.lookAt(lookAtPos);
    }

    // Actualizar raycaster hacia adelante
    const rayOrigin = new THREE.Vector3().copy(p_pos);
    rayOrigin.y += 1.0;
    const rayDirection = new THREE.Vector3(0, 0, -1);
    rayHelper.position.copy(rayOrigin);
    rayHelper.setDirection(rayDirection.normalize());
    rayHelper.setLength(5);
}

let tiempoProximoVagon = 0;
function generarVagonesPeriodicamente(delta) {
    tiempoProximoVagon -= delta;
    if (tiempoProximoVagon <= 0) {
        const cantidad = 1 + Math.floor(Math.random() * 8);
        for (let i = 0; i < cantidad; i++) {
            generarVagon(scene);
        }
        tiempoProximoVagon = 1 + Math.random() * 2;
    }
}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

init();
render();