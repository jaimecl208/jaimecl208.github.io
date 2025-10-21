

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
    // let cubo = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1), material);
    // let cubo2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), material);
    // scene.add(cubo);
    // scene.add(cubo2);


    // let suelo = new THREE.PlaneGeometry(50,50,10,10)
    // scene.add(suelo)

    // for(let i = 0; i < 20; i++) {
    //   let cubo = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), material);
    //   cubo.position.y = 0.05 * i
    //   cubo.position.z = 0.05 * i
    //   scene.add(cubo)
    // }




    // let base = new THREE.Mesh(new THREE.CylinderGeometry(4,4,1,32) , new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.5} ))
    // scene.add(base)

    // let brazo = new THREE.Object3D();

    // let esparrago = new THREE.Mesh(new THREE.CylinderGeometry(2,2,1,32) , new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.5} ))
    // esparrago.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2)
    // brazo.add(esparrago)

    // let eje = new THREE.Mesh(new THREE.BoxGeometry(1,10,1) , new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.5} ))
    // eje.position.y = 7
    // brazo.add(eje)

    // brazo.rotateOnAxis(new THREE.Vector3(1,0,0), 0.5)
    // scene.add(brazo)



    var vertices = new Float32Array([
      0.5, 0.


    ])


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