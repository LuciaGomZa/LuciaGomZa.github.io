/** 
*  ----------------------------------------------
*  |  Práctica GPC #4. Animacion e interaccion  |
*  ----------------------------------------------
*/

// Variables imprescindibles
var renderer, scene, camera, planta;
var base, brazo, antebrazo, pinzas, pinzaIzq, pinzaDer;
var keyboard;
var cameraController;
var updateFcts	= [];
var r = t = 60;
var l = b = -r;
var delta = 10;

// Acciones
init();
loadScene();
setupGui();
render();

function setCameras(ar){

    // Camara ortografica
    var camOrtografica;
    camOrtografica = new THREE.OrthographicCamera(l, r, t, b, -200, 200);
    planta = camOrtografica.clone();
    planta.position.set(0,4,0);
    planta.lookAt(new THREE.Vector3(0,0,0)); 
    planta.up = new THREE.Vector3(0,0,-1); 
    scene.add(planta);

    // Camara perspectiva
    camera = new THREE.PerspectiveCamera (50, ar, 0.1, 1500);
    camera.position.set(300, 300, 300); 
    camera.lookAt(new THREE.Vector3(0,100,0));
    scene.add(camera);
}

function init(){
    // -------------------
    // | Motor de render |
    // -------------------
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); // Determinar el área de dibujo
    renderer.setClearColor(new THREE.Color(0xFFFFFF));  // Color de borrado 
    renderer.autoClear = false; 
    document.getElementById("container").appendChild(renderer.domElement); //  Conectar el canvas al cuerpo de la página

    // -------------------
    // |     Escena      |
    // -------------------
    scene = new THREE.Scene();

    // -------------------
    // |     Camara      |
    // -------------------
    var ar = window.innerWidth / window.innerHeight; // Razon de aspecto (ar) proporcional al área de dibujo
    setCameras(ar);

    // Controlador de la camara
    cameraController = new THREE.OrbitControls(camera, renderer.domElement);
    cameraController.target.set(0,100,0); // coordenadas del punto sobre el que orbita
    cameraController.noKeys = true; // para evitar que las teclas muevan la ventana

    // Eventos
    window.addEventListener('resize',updateAspectRatio); // Reajuste canvas al cambiar el tamaño de la ventana
    document.addEventListener("keydown", onArrowPress);
}

function loadPinzaIzq(){
    // Función para crear la geometría de las pinzas del robot
    var geoPinza = new THREE.Geometry();
    var coordenadas = [
        0,0,2,
        19,0,2,
        38,4,2,
        38,16,2,
        19,20,2,
        0,20,2,
        0,0,-2,
        19,0,-2,
        38,4,0,
        38,16,0,
        19,20,-2,
        0,20,-2
    ];
    var indices = [
        5,0,1, 1,4,5,
        4,1,2, 4,2,3, 
        6,11,7, 11,10,7, 7,10,8, 10,9,8,
        5,6,0,  5,11,6, 
        5,11,4, 11,10,4, 4,10,3, 10,9,3,
        3,8,2, 3,8,9,
        0,6,1, 6,7,1, 1,7,2, 7,8,2
    ];
    for (var i=0; i<coordenadas.length; i+=3){
        var vertice = new THREE.Vector3( coordenadas[i], coordenadas[i+1], coordenadas[i+2] );
        geoPinza.vertices.push( vertice );
    }
    for (var i=0; i<indices.length; i+=3){
        var triangulo = new THREE.Face3( indices[i], indices[i+1], indices[i+2] );
        geoPinza.faces.push(triangulo); 
    }
    geoPinza.computeFaceNormals ();
    return geoPinza;
}

function loadPinzaDer(){
    // Función para crear la geometría de las pinzas del robot
    var geoPinza = new THREE.Geometry();
    var coordenadas = [
        0,0,2,
        19,0,2,
        38,4,0,
        38,16,0,
        19,20,2,
        0,20,2,
        0,0,-2,
        19,0,-2,
        38,4,-2,
        38,16,-2,
        19,20,-2,
        0,20,-2
    ];
    var indices = [
        5,0,1, 1,4,5,
        4,1,2, 4,2,3, 
        6,11,7, 11,10,7, 7,10,8, 10,9,8,
        5,6,0,  5,11,6, 
        5,11,4, 11,10,4, 4,10,3, 10,9,3,
        3,8,2, 3,8,9,
        0,6,1, 6,7,1, 1,7,2, 7,8,2
    ];
    for (var i=0; i<coordenadas.length; i+=3){
        var vertice = new THREE.Vector3( coordenadas[i], coordenadas[i+1], coordenadas[i+2] );
        geoPinza.vertices.push( vertice );
    }
    for (var i=0; i<indices.length; i+=3){
        var triangulo = new THREE.Face3( indices[i], indices[i+1], indices[i+2] );
        geoPinza.faces.push(triangulo); 
    }
    geoPinza.computeFaceNormals ();
    return geoPinza;
}

function loadScene(){
    // -------------------
    // |    Material     |
    // -------------------
    materialRobot = new THREE.MeshBasicMaterial({color:'red', wireframe:true});
    materialSuelo = new THREE.MeshBasicMaterial({color:'black', wireframe:true});

    // -------------------
    // |    Geometría    |
    // -------------------
    var geoSuelo = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var geoBase = new THREE.CylinderGeometry(50, 50, 15, 32);
    var geoEsparrago = new THREE.CylinderGeometry(20, 20, 18, 32);
    var geoEje = new THREE.BoxGeometry(18, 120, 12);
    var geoRotula = new THREE.SphereGeometry(20, 30, 30);
    var geoDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
    var geoNervio = new THREE.BoxGeometry(4, 80, 4);
    var geoMano = new THREE.CylinderGeometry(15, 15, 40, 32);
    var geoPinzaIzq = loadPinzaIzq();
    var geoPinzaDer = loadPinzaDer();

    // -------------------
    // |     Objetos     |
    // -------------------
    var suelo = new THREE.Mesh(geoSuelo, materialSuelo);
    base = new THREE.Mesh(geoBase, materialRobot);
    var eje = new THREE.Mesh(geoEje, materialRobot);
    var esparrago = new THREE.Mesh(geoEsparrago, materialRobot);
    var rotula = new THREE.Mesh(geoRotula, materialRobot);
    var disco = new THREE.Mesh(geoDisco, materialRobot);
    var nervio1 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio2 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio3 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio4 = new THREE.Mesh(geoNervio, materialRobot);
    var mano = new THREE.Mesh(geoMano, materialRobot);
    pinzaIzq = new THREE.Mesh(geoPinzaIzq, materialRobot);
    pinzaDer = new THREE.Mesh(geoPinzaDer, materialRobot);
    // Contenedores
    robot = new THREE.Object3D();
    brazo = new THREE.Object3D();
    antebrazo = new THREE.Object3D();
    pinzas = new THREE.Object3D();

    antebrazo.position.y = 120;
    pinzas.rotation.x = Math.PI/2; // Deshacer el giro de la mano

    // --------------------
    // | Transformaciones |
    // --------------------
    // - Suelo
    suelo.rotation.x = Math.PI/2;
    // - Eje
    esparrago.rotation.x = Math.PI/2;
    // - Esparrago
    eje.position.y = 60;
    // - Rotula
    rotula.position.y = 120;
    // - Nervios
    nervio1.position.y = 40; nervio1.position.x = 4;  nervio1.position.z = 4;
    nervio2.position.y = 40; nervio2.position.x = -4; nervio2.position.z = 4;
    nervio3.position.y = 40; nervio3.position.x = -4; nervio3.position.z = -4;
    nervio4.position.y = 40; nervio4.position.x = 4; nervio4.position.z = -4;
    // - Mano
    mano.position.y = 80; mano.rotation.x = Math.PI/2;
    // - Pinzas
    pinzaIzq.position.z = 14;
    pinzaIzq.position.y = -10;
    pinzaDer.position.z = -14;
    pinzaDer.position.y = -10;

    // --------------------
    // | Grado de escena  |
    // --------------------
    pinzas.add(pinzaDer);
    pinzas.add(pinzaIzq);

    mano.add(pinzas);

    antebrazo.add(mano);
    antebrazo.add(nervio1); 
    antebrazo.add(nervio2); 
    antebrazo.add(nervio3); 
    antebrazo.add(nervio4);
    antebrazo.add(disco); 

    brazo.add(antebrazo);
    brazo.add(rotula); 
    brazo.add(esparrago); 
    brazo.add(eje);

    base.add(brazo);

    robot.add(base);

    // Añadir a la escena
    scene.add(suelo);
    scene.add(robot);

    // Eventos
    // -- Para que la escena se reajuste al cambiar el tamaño de la ventana
    window.addEventListener('resize',updateAspectRatio); // Se crear la funcion updateAspectRatio
}

function updateAspectRatio(){
    // Indicarle al motor las nuevas dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Calcula la nueva razón de aspecto (variando el volumen de la vista)
    var ar = window.innerWidth / window.innerHeight; 
    camera.aspect = ar

    // Se ha variado el volumen de la vista --> Cambia la matriz de proyección, de la vista
    camera.updateProjectionMatrix();
}

function onArrowPress(e) {
    switch (e.which) {
    case 37:
        robot.position.x -= delta; // Left
        planta.position.x -= delta;
        break;
    case 39:
        robot.position.x += delta; // Right
        planta.position.x += delta;
        break;
    case 38:
        robot.position.z -= delta; // Up
        planta.position.z -= delta;
        break;
    case 40:
        robot.position.z += delta; // Down
        planta.position.z += delta;
        break;
    default:
        return;
    }
}

function setupGui()
{
	// Definicion de los controles
	effectController = {
        giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY: 0,
        giroAntebrazoZ: 0,
        giroPinza: 0,
        separacionPinza: 15
	};

	// Creacion interfaz
	var gui = new dat.GUI();

	// Construccion del menu
	var h = gui.addFolder("Control Robot");
    h.add(effectController, "giroBase", -180, 180, 10).name("Giro Base"); 
    h.add(effectController, "giroBrazo", -45, 45, 5).name("Giro Brazo");
    h.add(effectController, "giroAntebrazoY", -180, 180, 1).name("Giro Antebrazo Y");
    h.add(effectController, "giroAntebrazoZ",-90, 90, 1).name("Giro Antebrazo Z");
    h.add(effectController, "giroPinza", -40, 220, 2).name("Giro Pinza");
    h.add(effectController, "separacionPinza", 0, 15, 1).name("Separación Pinza");

}

function update(){

    // Cambios entre frames
    base.rotation.y = (Math.PI*effectController.giroBase) / 180;
    brazo.rotation.z = (Math.PI*effectController.giroBrazo) / 180;
    antebrazo.rotation.y = (Math.PI*effectController.giroAntebrazoY) / 180;
    antebrazo.rotation.z = (Math.PI*effectController.giroAntebrazoZ) / 180;
    pinzas.rotation.z = (Math.PI*effectController.giroPinza)  / 180;
    pinzaIzq.position.z = -2 - effectController.separacionPinza/2;
    pinzaDer.position.z = 2 + effectController.separacionPinza/2;

}

function render(){
    // Dibujar cada frame
    requestAnimationFrame(render);
    update();
    
    // Camara perspectiva
    renderer.clear();
    renderer.setViewport(0,0, window.innerWidth,window.innerHeight); // (xorigen, yorigen, ancho, alto)
    renderer.render( scene, camera );
    
    // Camara cenital
    renderer.clearDepth();
    renderer.setViewport(0,0, 
        Math.min(window.innerHeight, window.innerWidth)/4,
        Math.min(window.innerHeight, window.innerWidth)/4); 
    renderer.render( scene, planta );

}
