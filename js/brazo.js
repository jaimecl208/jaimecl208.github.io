

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 10, 15, 20 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
	// Añade el objeto grafico a la escena
    //let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Verde
    let material = new THREE.MeshNormalMaterial();          


    let suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000,10,10), new THREE.MeshBasicMaterial({color: 0xf0f000, transparent: true, opacity: 0.5} ))
    suelo.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
    scene.add(suelo)

    let robot = new THREE.Object3D()
  
    let base = new THREE.Mesh(new THREE.CylinderGeometry(5,5,1.5,32) , material)
    robot.add(base)

    let brazo = new THREE.Object3D();

    let esparrago = new THREE.Mesh(new THREE.CylinderGeometry(2,2,1.8,32) , material)
    esparrago.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
    brazo.add(esparrago)

    let eje = new THREE.Mesh(new THREE.BoxGeometry(1.2,12,1.8) , material)
    eje.position.y = 7
    brazo.add(eje)
    //brazo.rotateOnAxis(new THREE.Vector3(1,0,0), 0.5)
    

    let rotula = new THREE.Mesh(new THREE.SphereGeometry(2), material)
    rotula.position.y = 13
    brazo.add(rotula)

    robot.add(brazo)

    let antebrazo = new THREE.Object3D()

    let disco = new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,0.6,32) , material)
    antebrazo.add(disco)

    let nervio1 = new THREE.Mesh(new THREE.BoxGeometry(0.4,8,0.4) , material)
    nervio1.position.x = 1
    nervio1.position.z = 1
    nervio1.position.y = 4.3
    let nervio2 = new THREE.Mesh(new THREE.BoxGeometry(0.4,8,0.4) , material)
    nervio2.position.x = -1
    nervio2.position.z = 1
    nervio2.position.y = 4.3
    let nervio3 = new THREE.Mesh(new THREE.BoxGeometry(0.4,8,0.4) , material)
    nervio3.position.x = 1
    nervio3.position.z = -1
    nervio3.position.y = 4.3
    let nervio4 = new THREE.Mesh(new THREE.BoxGeometry(0.4,8,0.4) , material)
    nervio4.position.x = -1
    nervio4.position.z = -1
    nervio4.position.y = 4.3
    antebrazo.add(nervio1); antebrazo.add(nervio2); antebrazo.add(nervio3); antebrazo.add(nervio4);

    antebrazo.position.y = 13
    brazo.add(antebrazo)

    let mano = new THREE.Object3D()

    let palma = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,4,32) , material)
    palma.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
    mano.add(palma)

    let palaIz = new THREE.Object3D()

    let geometry = new THREE.BufferGeometry()
    let vertices = new Float32Array(
      [
        -0.2, 0.1, -1,
        0.2, 0, -1,
        -0.2, 0, -1,
        -0.2, 0.1, 1,
        0.2, 0, 1,
        -0.2, 0, 1
      ]
    )
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    let indices = new Uint16Array(
      [
        0, 1, 2,
        0, 4, 1,
        0, 3, 4,
        3, 5, 4,
        0, 2, 5,
        0, 5, 3,
        4, 5, 2,
        4, 2, 1
      ]
    )
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals()
    pico = new THREE.Mesh(geometry, material)
    palaIz.add(pico)
    pico.position.y = 3.7
    let cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.4,1.8,2) , material)
    cuerpo.position.y = 2.8
    palaIz.add(cuerpo)
    let geometry2 = new THREE.BufferGeometry()
    let vertices2 = new Float32Array(
      [
        -0.2, 1.9, -1,
        0.2, 1.9, -1,
        0, 0, -1,
        0.2, 0, -1,
        -0.2, 1.9, 1,
        0.2, 1.9, 1,
        0, 0, 1,
        0.2, 0, 1
      ]
    )
    geometry2.setAttribute('position', new THREE.BufferAttribute(vertices2, 3));
    let indices2 = new Uint16Array([
      0, 1, 2,
      2, 1, 3,
      4, 6, 5,
      6, 7, 5,
      0, 2, 6,
      0, 6, 4,
      1, 5, 7,
      1, 7, 3,
      0, 4, 5,
      0, 5, 1,
      2, 3, 7,
      2, 7, 6
    ]);
    geometry2.setIndex(new THREE.BufferAttribute(indices2, 1));
    geometry2.computeVertexNormals()
    cuerpoinf = new THREE.Mesh(geometry2, material)
    palaIz.add(cuerpoinf)
    palaDr = palaIz.clone()
    palaIz.rotateOnAxis(new THREE.Vector3(0, -1, 0), -Math.PI/2)
    palaIz.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
    palaIz.position.x = 4
    palaIz.position.z = 1.2
    palaDr.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI/2)
    palaDr.rotateOnAxis(new THREE.Vector3(-1, 0, 0), -Math.PI/2)
    palaDr.position.x = 4
    palaDr.position.z = -1.2
    mano.add(palaIz)   
    mano.add(palaDr) 
    mano.position.y = 22
    robot.add(mano)

    scene.add(robot)


}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}