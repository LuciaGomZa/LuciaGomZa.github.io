/** 
*  ------------------------------------------------------
*  |  Proyecto GPC: Página web de diseño de mascarillas  |
*  -------------------------------------------------------
*/

// Variables imprescindibles
var renderer, scene, camera, planta;
var diseño, mask, gomas;
var cameraController;
var mode = 1;
var start;
var r = t = 10;
var l = b = -r;
var angulo = -0.01;

// Acciones
init();
loadScene(mode);
setupGui();
render();

function setCameras(ar){

    // Camara perspectiva
    camera = new THREE.PerspectiveCamera (30, ar, 0.1, 1500);
    camera.position.set(20, 7, 10); 
    camera.lookAt(new THREE.Vector3(0,0,3));
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
    cameraController.target.set(0,4.5,0); // coordenadas del punto sobre el que orbita
    cameraController.noKeys = true; // para evitar que las teclas muevan la ventana

    // Eventos
    window.addEventListener('resize',updateAspectRatio); // Reajuste canvas al cambiar el tamaño de la ventana
}

function loadMask(){
    // Función para crear la geometría de las pinzas del robot
    var geoMask = new THREE.Geometry();
    var coordenadas = [
        0,1,0,
        1.5,3,0,
        -5,3,5,
        1.5,6,0,
        -5,6,5,
        0,8.5,0,
        -1,6,3,
        -1,3,3,
        -1,6,-3,
        -1,3,-3,
        -5,3,-5,
        -5,6,-5
    ];
    var indices = [
        0,1,7, 0,7,2,
        7,1,3, 7,3,6,
        2,7,6, 2,6,4,
        6,3,5, 4,6,5,

        0,9,1, 10,9,0,
        9,3,1, 9,8,3,
        10,8,9, 10,11,8,
        8,5,3, 11,5,8
    ];

    for (var i=0; i<coordenadas.length; i+=3){
        var vertice = new THREE.Vector3( coordenadas[i], coordenadas[i+1], coordenadas[i+2] );
        geoMask.vertices.push( vertice );
    }
    for (var i=0; i<indices.length; i+=3){
        var triangulo = new THREE.Face3( indices[i], indices[i+1], indices[i+2] );
        geoMask.faces.push(triangulo); 
    }
    geoMask.computeFaceNormals ();
    return geoMask;
}

function loadScene(mode){

    //var texture = new THREE.TextureLoader().load( 'vaquero.jpg' );

    // Material     
    materialMask = new THREE.MeshBasicMaterial({color:'red'});
    materialGoma = new THREE.MeshBasicMaterial({color:'black',  wireframe:true});

    // Contenedores
    diseño = new THREE.Object3D();
    gomas = new THREE.Object3D();
    var geoMask = loadMask();
    mask = new THREE.Mesh(geoMask, materialMask);
    if (mode===1){
        var geoGoma = new THREE.RingGeometry( 2.5/2, 3/2, 32, 1, Math.PI/2, Math.PI);
        var gomaIzq = new THREE.Mesh(geoGoma, materialGoma);
        var gomaDer = new THREE.Mesh(geoGoma, materialGoma);

        gomaIzq.position.z = 5;
        gomaIzq.position.x = -5;
        gomaIzq.position.y = 4.5;
        gomaDer.position.z = -5;
        gomaDer.position.x = -5;
        gomaDer.position.y = 4.5;

        gomas.add(gomaIzq);
        gomas.add(gomaDer);

    } else if (mode===2){
        var geoGoma2 = new THREE.TorusGeometry( 5, 0.05, 16, 100, Math.PI);
        var gomaArriba = new THREE.Mesh(geoGoma2, materialGoma);
        var gomaAbajo = new THREE.Mesh(geoGoma2, materialGoma);

        gomaAbajo.rotation.z = Math.PI/2;
        gomaAbajo.rotation.x = Math.PI/2;
        gomaAbajo.position.x = -5;
        gomaAbajo.position.y = 6;
        gomaArriba.rotation.z = Math.PI/2;
        gomaArriba.rotation.x = Math.PI/2;
        gomaArriba.position.x = -5;
        gomaArriba.position.y = 3;

        gomas.add(gomaAbajo);
        gomas.add(gomaArriba);
    }

    diseño.add(gomas);
    diseño.add(mask);

    diseño.position.z = 3;

    // Añadir a la escena
    scene.add(diseño);

    // Eventos
    window.addEventListener('resize',updateAspectRatio);
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

function setupGui()
{
	// Definicion de los controles
	effectController = {
        girar: function(){
            start = true;
        },
        parar: function(){
            start = false;
        },
        cambiarModo: function(){
            if (mode===1){
                mode = 2;
            } else {
                mode = 1;
            }
            scene.remove.apply(scene, scene.children);
            loadScene(mode)
        },
        colorMask: "rgb(255,255,255)",
        colorGomas: "rgb(255,255,255)"
	};

	// Creacion interfaz
    var gui = new dat.GUI({ autoPlace: false });
    gui.domElement.id = "gui";
    gui_container.appendChild(gui.domElement)

	// Construccion del menu
	var h = gui.addFolder("Parámetros de diseño");
    h.add(effectController, "girar").name("Rotar"); 
    h.add(effectController, "parar").name("Parar"); 
    h.add(effectController, "cambiarModo").name("Cambiar modo"); 
    // Añadimos paleta de color
	var sensorColorMask = h.addColor(effectController, "colorMask").name("Color de la tela");
	sensorColorMask.onChange( function(color){
							mask.traverse( function(hijo){
								if( hijo instanceof THREE.Mesh ) hijo.material.color = new THREE.Color(color);
							})
                          });
    // Añadimos paleta de color
	var sensorColorGomas = h.addColor(effectController, "colorGomas").name("Color de las gomas");
	sensorColorGomas.onChange( function(color){
							gomas.traverse( function(hijo){
								if( hijo instanceof THREE.Mesh ) hijo.material.color = new THREE.Color(color);
							})
						  });
}

function rotateModel(start){
    if (start === true) {
        diseño.rotateOnAxis( new THREE.Vector3(0,1,0), angulo);
    } 
}

function update(){

    // Cambios para actualizar la camara segun mvto del raton
    cameraController.update();

    // Movimiento propio del cubo
    rotateModel(start)

}

function render(){
    // Dibujar cada frame
    
    requestAnimationFrame(render);
    update();
    
    // Camara perspectiva
    renderer.clear();
    renderer.setViewport(0,0, window.innerWidth,window.innerHeight); // (xorigen, yorigen, ancho, alto)
    renderer.render( scene, camera );
    

}



    /*
    var coordenadas = [
        0,0,0,
        2,3,0,
        -5,3,5,
        2,6,0,
        -5,6,5,
        0,9,0,
        -5,6,-5,
        -5,3,-5
    ];

    var indices = [
        0,1,2, 1,3,2, 4,2,3, 3,5,4,
        7,1,0, 7,3,1, 6,3,7, 6,5,3
    ];
    */

/*
function loadScene(){

    // Material     
    materialMask = new THREE.MeshBasicMaterial({color:'red',  wireframe:true});
    materialGoma = new THREE.MeshBasicMaterial({color:'black',  wireframe:true});
    

    // -------------------
    // |    Geometría    |
    // -------------------
    var geoMask = loadMask1();
    var geoGoma = new THREE.RingGeometry( 2.5/2, 3/2, 32, 1, Math.PI/2, Math.PI);
    var geoGoma2 = new THREE.TorusGeometry( 5, 0.05, 16, 100, Math.PI)

    // -------------------
    // |     Objetos     |
    // -------------------
    mask = new THREE.Mesh(geoMask, materialMask);
    var gomaIzq = new THREE.Mesh(geoGoma, materialGoma);
    var gomaDer = new THREE.Mesh(geoGoma, materialGoma);

    var gomaArriba = new THREE.Mesh(geoGoma2, materialGoma);
    var gomaAbajo = new THREE.Mesh(geoGoma2, materialGoma);


    // Contenedores
    diseño = new THREE.Object3D();
    gomas = new THREE.Object3D();

    // --------------------
    // | Transformaciones |
    // --------------------
    gomaIzq.position.z = 5;
    gomaIzq.position.x = -5;
    gomaIzq.position.y = 4.5;
    gomaDer.position.z = -5;
    gomaDer.position.x = -5;
    gomaDer.position.y = 4.5;

    gomaAbajo.rotation.z = Math.PI/2;
    gomaAbajo.rotation.x = Math.PI/2;
    gomaAbajo.position.x = -5;
    gomaAbajo.position.y = 6;

    gomaArriba.rotation.z = Math.PI/2;
    gomaArriba.rotation.x = Math.PI/2;
    gomaArriba.position.x = -5;
    gomaArriba.position.y = 3;

    // --------------------
    // | Grado de escena  |
    // --------------------
    gomas.add(gomaIzq);
    gomas.add(gomaDer);

    diseño.add(gomas);
    diseño.add(mask);

    diseño.position.z = 3;

    // Añadir a la escena
    //scene.add(diseño);
    scene.add(gomaAbajo);
    scene.add(gomaArriba);
    scene.add(mask);

    // Eventos
    window.addEventListener('resize',updateAspectRatio);
}
*/