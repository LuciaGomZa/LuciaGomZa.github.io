/**
*	Seminario GPC #3. Camara
*	Manejo de camaras, marcos y seleccion (picking)
*   (PARA HACER LAS DIVISIONES DE LA VISTA) http://personales.upv.es/rvivo/seminariosGPC/threejsapp.html
*/

// Variables imprescindibles
var renderer, scene, camera;

// Variables globales
var esferacubo, cubo, angulo = 0;
// -- Para crear variables relacionadas con la ventana del mundo real de tamaño 8x8 de la camara ortografica
var r = t = 4;
var l = b = -r;
// - Para contolar los movimientos de la cama
var cameraController;
var alzado, planta, perfil; // (AQUI)

// Acciones
init();
loadScene();
render();

// (AQUI) Crear las cuatro camaras
function setCameras(ar){
    
    var origen = new THREE.Vector3(0,0,0);

    // CAMARAS ORTOGRAFICAS
    var camOrtografica;
    if (ar>1){
        // Corregir que la ventana sea más alta que ancha
        camOrtografica = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 20);        
    } else {
        // Corregir que la ventana sea más ancha que alta
        camOrtografica = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -20, 20);        
    }
    alzado = camOrtografica.clone();
    alzado.position.set(0,0,4); // en el eje z mirando hacia el origen de coordenadas
    alzado.lookAt(origen);
    perfil = camOrtografica.clone();
    perfil.position.set(4,0,0);
    perfil.lookAt(origen);
    planta = camOrtografica.clone();
    planta.position.set(0,4,0);
    planta.lookAt(origen); 
    planta.up = new THREE.Vector3(0,0,-1); // Hay que definir el vector up, que debe ser paralelo al suelo (aqui el vector -z)

    // CAMERA PERSPECTIVA
    camera = new THREE.PerspectiveCamera( 50, ar, 0.1, 100 );
    camera.position.set(0.5,3,9);
    camera.lookAt(new THREE.Vector3(0,0,0));

    scene.add(alzado);
    scene.add(perfil);
    scene.add(planta);
    scene.add(camera);
}

function init() {
	// Crear el motor, la escena y la camara

	// Motor de render
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0x0000AA) );
    renderer.autoClear = false; // (AQUI) Con ello evito que solo muestre la ultima vista puesta en el renderer
	document.getElementById('container').appendChild(renderer.domElement);

	// Escena
	scene = new THREE.Scene();

	// Camara
    var ar = window.innerWidth / window.innerHeight;

    setCameras(ar); // (AQUI) 

    
    // Controlador de la camara
    cameraController = new THREE.OrbitControls(camera, renderer.domElement); // biblioteca que permite añadir los mov de panning, orbitacion y....
    cameraController.target.set(0,0,0); // coordenadas del punto sobre el que orbita
    cameraController.noKeys = true; // para evitar que las teclas muevan la ventana

    // Eventos
    // -- Para que la escena se reajuste al cambiar el tamaño de la ventana
    window.addEventListener('resize',updateAspectRatio); // Se crear la funcion updateAspectRatio
    // - Para que el objeto gire al hacer doble click
    renderer.domElement.addEventListener('dblclick',rotate); // Se crea la funcion rotate
}

function loadScene() {
	// Cargar la escena con objetos

	// Materiales
	var material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});

	// Geometrias
	var geocubo = new THREE.BoxGeometry(2,2,2);
	var geoesfera = new THREE.SphereGeometry(1, 30, 30);

	// Objetos
	cubo = new THREE.Mesh( geocubo, material );
	cubo.position.x = -1;

	var esfera = new THREE.Mesh( geoesfera, material );
	esfera.position.x = 1;

	esferacubo = new THREE.Object3D();
	esferacubo.position.y = 1;

	// Modelo importado
	var loader = new THREE.ObjectLoader();
	loader.load('models/soldado.json', 
        function(obj){
            obj.position.y = 1; // lo traslado hacia arriba
            cubo.add(obj); // hace el objeto hijo del cubo
        }  );

	// Construir la escena
	esferacubo.add(cubo);
	esferacubo.add(esfera);
	scene.add(esferacubo);
	cubo.add(new THREE.AxisHelper(1));
	scene.add( new THREE.AxisHelper(3) );

}
function rotate() {
    // Localiza el evento seleccionado y lo gira 45º
    var x = event.clientX; // sistema de ref en el sistema superior izq del dibujo, con y hacia la der y x hacia abajo con pixeles
    var y = event.clientY;

    // (AQUI)
    var derecha = abajo = false;
    var cam = null;

    // (AQUI) Conocer el cuadrante de la seleccion
    if(x>window.innerWidth/2){
        // Entonces estoy a la derecha
        x -= window.innerWidth/2;
        derecha = true;
    };
    if(y>window.innerHeight/2){
        // Entonces estoy en los dos cuadrantes de abajo
        y -= window.innerHeight/2;
        abajo = true;
    };
    if(derecha)
        if(abajo) cam = camera;
        else cam = perfil;
    else
        if(abajo) cam = planta;
        else cam = alzado; 

    // (AQUI)
    // Convertir al cuadrado canónico (2x2) --> mediante composición de escalado y traslación
    x = (2*x/window.innerWidth) * 2 - 1; // (Ahora las x van de 0 a 1) * 2 --> (ahora van de 0 a 2 ) - 1 --> ahora van de -1 a 1
    y = -((2*y/window.innerHeight) * 2) + 1; 

    // Construcción del rayo e interseccion con la escena
    var rayo = new THREE.Raycaster(); // Crear rayo
    rayo.setFromCamera(new THREE.Vector2(x,y), cam); // Le damos dirección y origen al rayo dandole la camara y el punto por el que pasar
    var interseccion = rayo.intersectObjects( scene.children, true); // Dame los objetos que interseccionan con la visual --> hijos de la escena
    // Se le pone true para que recorra todos los nodos de la escena
    if (interseccion.length>0){
        interseccion[0].object.rotation.y += Math.PI / 4; // Devuelve todos los objetos ordenados por cercania --> como interesa el más cercano --> [0]
    }

}
function updateAspectRatio(){
    // Indicarle al motor las nuevas dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Calcula la nueva razón de aspecto (variando el volumen de la vista)
    var ar = window.innerWidth / window.innerHeight;

    // (AQUI)
    if(ar>1){
        alzado.left = perfil.left = planta.left = l * ar;
        alzado.right = perfil.right = planta.right = r * ar;
        alzado.top = perfil.top = planta.top = t;
        alzado.bottom = perfil.bottom = planta.bottom = b;
     }
    else{
        alzado.left = perfil.left = planta.left = l;
        alzado.right = perfil.right = planta.right = r;
        alzado.top = perfil.top = planta.top = t/ar;
        alzado.bottom = perfil.bottom = planta.bottom = b/ar;    
    }
    // (AQUI)
    camera.aspect = ar; // (AQUI)

    // Se ha variado el volumen de la vista --> Cambia la matriz de proyección, de la vista (V)
    alzado.updateProjectionMatrix();
    planta.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    camera.updateProjectionMatrix();
}

function update() {
	// Cambios entre frames


}

function render() {
	// Dibujar cada frame 
	requestAnimationFrame(render);

    update();
    
    renderer.clear(); // (AQUI) Que lo primero que haga sea borrar

    // (AQUI) Para darle el rectangulo donde queremos que vaya la escena
    renderer.setViewport(0,window.innerHeight/2, 
        window.innerWidth/2,window.innerHeight/2);
    renderer.render( scene, planta );

    renderer.setViewport(window.innerWidth/2,0, 
    window.innerWidth/2,window.innerHeight/2);   
    renderer.render( scene, perfil );

    renderer.setViewport(0,0, 
    window.innerWidth/2,window.innerHeight/2); 
    renderer.render( scene, alzado );

    renderer.setViewport(window.innerWidth/2,window.innerHeight/2, 
    window.innerWidth/2,window.innerHeight/2); 
    renderer.render( scene, camera );
    // (AQUI)
}
