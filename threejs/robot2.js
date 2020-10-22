/** 
*  -------------------------------------------
*  |  Práctica GPC #3. Movimiento de camara  |
*  -------------------------------------------
*/

// Variables imprescindibles
var renderer, scene, camera, planta;
var cameraController, cameraController2;
var r = t = 60;
var l = b = -r;

// Acciones
init();
loadScene();
render();

function setCameras(ar){

    // Camara ortografica
    var camOrtografica;
    /*
    if (ar>1){
        // Corregir que la ventana sea más alta que ancha
        camOrtografica = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -200, 200);        
    } else {
        // Corregir que la ventana sea más ancha que alta
        camOrtografica = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -200, 200);        
    }
    */
    camOrtografica = new THREE.OrthographicCamera(l, r, t, b, -200, 200);
    planta = camOrtografica.clone();
    planta.position.set(0,4,0);
    planta.lookAt(new THREE.Vector3(0,0,0)); 
    planta.up = new THREE.Vector3(0,0,-1); // Hay que definir el vector up, que debe ser paralelo al suelo (aqui el vector -z)
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
    cameraController = new THREE.OrbitControls(camera, renderer.domElement); // biblioteca que permite añadir los mov de panning, orbitacion y....
    cameraController.target.set(0,100,0); // coordenadas del punto sobre el que orbita
    cameraController.noKeys = true; // para evitar que las teclas muevan la ventana

    // Eventos
    window.addEventListener('resize',updateAspectRatio); // Reajuste canvas al cambiar el tamaño de la ventana
}

function loadPinzas(){
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
    var geoEje = new THREE.CylinderGeometry(20, 20, 18, 32);
    var geoEsparrago = new THREE.BoxGeometry(18, 120, 12);
    var geoRotula = new THREE.SphereGeometry(20, 30, 30);
    var geoDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
    var geoNervio = new THREE.BoxGeometry(4, 80, 4);
    var geoMano = new THREE.CylinderGeometry(15, 15, 40, 32);
    var geoPinzaIzq = loadPinzas();

    // -------------------
    // |     Objetos     |
    // -------------------
    var suelo = new THREE.Mesh(geoSuelo, materialSuelo);
    var base = new THREE.Mesh(geoBase, materialRobot);
    var eje = new THREE.Mesh(geoEje, materialRobot);
    var esparrago = new THREE.Mesh(geoEsparrago, materialRobot);
    var rotula = new THREE.Mesh(geoRotula, materialRobot);
    var disco = new THREE.Mesh(geoDisco, materialRobot);
    var nervio1 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio2 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio3 = new THREE.Mesh(geoNervio, materialRobot);
    var nervio4 = new THREE.Mesh(geoNervio, materialRobot);
    var mano = new THREE.Mesh(geoMano, materialRobot);
    var pinzaIzq = new THREE.Mesh(geoPinzaIzq, materialRobot);
    var pinzaDer = new THREE.Mesh(geoPinzaIzq, materialRobot);
    // Contenedores
    robot = new THREE.Object3D();
    brazo = new THREE.Object3D();
    antebrazo = new THREE.Object3D();

    // --------------------
    // | Transformaciones |
    // --------------------
    // - Suelo
    suelo.rotation.x = Math.PI/2;
    // - Base
    base.position.y = 15/2;
    // - Eje
    eje.rotation.x = Math.PI/2;
    // - Esparrago
    esparrago.position.y = 120/2;
    // - Rotula
    rotula.position.y = 120;
    // - Disco
    disco.position.y = 120;
    // - Nervios
    nervio1.position.y = 120 + 80/2; nervio1.position.x = 4;  nervio1.position.z = 4;
    nervio2.position.y = 120 + 80/2; nervio2.position.x = -4; nervio2.position.z = 4;
    nervio3.position.y = 120 + 80/2; nervio3.position.x = -4; nervio3.position.z = -4;
    nervio4.position.y = 120 + 80/2; nervio4.position.x = 4; nervio4.position.z = -4;
    // - Mano
    mano.position.y = 120 + 80; mano.rotation.x = Math.PI/2;
    // - Pinzas
    var matrixTranslationPinzaIzq = new THREE.Matrix4();
    var matrixRotationPinzaIzq = new THREE.Matrix4();
    pinzaIzq.matrixAutoUpdate = false;
    matrixTranslationPinzaIzq.makeTranslation(0, 14, 10); // No  sumamos 200 en y porque ya aplicamos esa transformación a la mano
    matrixRotationPinzaIzq.makeRotationX(-Math.PI/2);  // Deshacemos el giro aplicado a la mano
    pinzaIzq.matrix = matrixTranslationPinzaIzq.multiply(matrixRotationPinzaIzq);
    
    var matrixTranslationPinzaDer = new THREE.Matrix4();
    var matrixRotationPinzaDer = new THREE.Matrix4();
    pinzaDer.matrixAutoUpdate = false;
    matrixTranslationPinzaDer.makeTranslation(0, -14, -10); // No  sumamos 200 en y porque ya aplicamos esa transformación a la mano
    matrixRotationPinzaDer.makeRotationX(-Math.PI/2 + Math.PI);  // Deshacemos el giro aplicado a la mano
    pinzaDer.matrix = matrixTranslationPinzaDer.multiply(matrixRotationPinzaDer);

    // --------------------
    // | Grado de escena  |
    // --------------------
    robot.add(base);
    base.add(brazo);
    brazo.add(eje); 
    brazo.add(esparrago); 
    brazo.add(rotula); 
    brazo.add(antebrazo);
    antebrazo.add(disco); 
    antebrazo.add(nervio1); 
    antebrazo.add(nervio2); 
    antebrazo.add(nervio3); 
    antebrazo.add(nervio4);
    antebrazo.add(mano);
    mano.add(pinzaIzq);
    mano.add(pinzaDer);

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
    /*
    if(ar>1){
        planta.left = l * ar;
        planta.right = r * ar;
        planta.top = t;
        planta.bottom = b;
    }
    else{
        planta.left = l;
        planta.right = r;
        planta.top = t/ar;
        planta.bottom = b/ar;    
    }
    */ 
    camera.aspect = ar

    // Se ha variado el volumen de la vista --> Cambia la matriz de proyección, de la vista
    camera.updateProjectionMatrix();
    //planta.updateProjectionMatrix();

}

function update(){
    // Cambios entre frames

}

function render(){
    // Dibujar cada frame
    requestAnimationFrame(render);
    update();

    renderer.clear();
    renderer.setViewport(0,0, window.innerWidth,window.innerHeight); // (xorigen, yorigen, ancho, alto)
    renderer.render( scene, camera );

    renderer.clearDepth();
    renderer.setViewport(0,0, 
        Math.min(window.innerHeight, window.innerWidth)/4,
        Math.min(window.innerHeight, window.innerWidth)/4); 
    renderer.render( scene, planta );

}
