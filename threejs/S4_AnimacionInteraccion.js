/**
 * Seminario GPC #4: Animacion e interaccion
 * Ejemplo de peonza con interpolacion de trayectoria y giro
 * 
 * @requires three.min_r96.js, coordinates.js, orbitControls.js, dat.gui.js, tween.min.js, stats.min.js
 * @author rvivo / http://personales.upv.es/rvivo
 * @date 2020
 */

"use strict"; // Aplica reglas más estrictar al comprobar las variables declaradas

// Globales convenidas
var renderer, scene, camera;
// Control de camara
var cameraControls;
// Monitor de recursos
var stats;
// Global GUI
var effectController;
// Objetos y tiempo
var peonza,eje;
var angulo = 0;
var antes = Date.now();

// Acciones a realizar
init();
loadScene();
setupGui();
startAnimation();
render();

function init()
{
	// Inicializar el motor
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color(0x000000) );
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	// Crear el grafo de escena
	scene = new THREE.Scene();

	// Crear y situar la camara
	var aspectRatio = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, aspectRatio , 0.1, 100 );
	camera.position.set( 1,2,10 );
	// Control de camara
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
	cameraControls.target.set(0,0,0);

	// STATS --> stats.update() en update() --> VENTANA DE INFO COMPU (FPS)
	stats = new Stats();
	stats.setMode( 0 ); // Muestra FPS
	stats.domElement.style.position = 'absolute'; // Abajo izquierda (ahora no funciona, describir por qué)
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.left = '0px';
	document.getElementById( 'container' ).appendChild( stats.domElement );

	// Callbacks
	window.addEventListener('resize', updateAspectRatio );

}

function loadScene()
{
	// Materiales
	var material = new THREE.MeshBasicMaterial( 
                                      { color:0xFFFFFF,
                                        wireframe: true } );

	// Peonza
	peonza = new THREE.Object3D();
	var cuerpo = new THREE.Mesh(new THREE.CylinderGeometry( 1, 0.2, 2, 10, 2 ), material); // Tronco de cono
	cuerpo.position.y = 1.5;
	peonza.add( cuerpo );
	var punta = new THREE.Mesh(new THREE.CylinderGeometry( 0.1, 0, 0.5, 10, 1 ), material); // Cono
	punta.position.set( 0, 0.25, 0 );
	peonza.add( punta );
	var mango = new THREE.Mesh(new THREE.CylinderGeometry( 0.1, 0.1, 0.5, 10, 1 ), material); // Cilindro
	mango.position.set( 0, 2.75, 0 );
	peonza.add( mango );
	peonza.rotation.x = Math.PI/16;

	eje = new THREE.Object3D(); // No es algo que se pinte
	eje.position.set(-2.5,0,-2.5);
	eje.add( peonza );
	scene.add(eje);


	// Suelo
	var geoSuelo = new THREE.PlaneGeometry( 5, 5 );
	var suelo = new THREE.Mesh( geoSuelo, material );
	suelo.rotation.x = -Math.PI/2; // Rotación para que sea el suelo
	scene.add( suelo );
	
	//Coordinates.drawGrid({size:6,scale:1});
	Coordinates.drawGrid({size:6,scale:1, orientation:"y"}); // Crear la malla de los planos del espacio que se ven
	Coordinates.drawGrid({size:6,scale:1, orientation:"z"});	

}

function setupGui()
{
	// Definicion de los controles
	effectController = {
		mensaje: 'Interfaz',
		velang: 1, // 1 : una vuelta por segundo
		reiniciar: function(){
			TWEEN.removeAll();
			eje.position.set(-2.5,0,-2.5);
			eje.rotation.set( 0, 0, 0 );
			startAnimation(); // Función creada
		},
		sombras: true, // Checkbox: true-false
		color: "rgb(255,255,255)" // Color blanco inicial dado en el witchet 
	};

	// Creacion interfaz
	var gui = new dat.GUI();

	// Construccion del menu
	var h = gui.addFolder("Control peonza");
	// add(objeto que mantiene los atributos físicos a los que vamos a asociar nuestro wiches,
	// nombre del atributo que pretendemos asociar al wicher a crear--si es string, crea caja de texto-,
	// nombre que se ve en los controles)
	h.add(effectController, "mensaje").name("Peonza");
	h.add(effectController, "velang", 0, 5, 0.5).name("Vueltas/sg");
	// limites superior e inferior de la variable e incremento
	h.add(effectController, "reiniciar").name("Reiniciar"); 
	// reiniciar atiende a la callback

	// Añadimos paleta de color
	var sensorColor = h.addColor(effectController, "color").name("Color");
	// Se le asocia callback a sensorColor: recorre los hijos de la peonza buscando cuales son de 
	// tipo THREE.Mesh y a esos les cambia el color al color seleccionado en la paleta de colores
	sensorColor.onChange( function(color){
							peonza.traverse( function(hijo){
								if( hijo instanceof THREE.Mesh ) hijo.material.color = new THREE.Color(color);
							})
						  });
}

function startAnimation(){
	// Movimiento autonomo de la peonza mediante TWEEN (4 movimientos enlazados)
	// eje es el nodo padre de la peonza, por eso se le aplica el movimiento
	// Se mueve de la posición actual a la indicada (como son tres puntos, está
	// creando una curva de Behier de grado 2). El valor final es el tiempo que va a tardar (ms)
	var mvtoDer = new TWEEN.Tween( eje.position ).to( {x: [-1.5, -2.5],
													 y: [0, 0],
													 z: [0, 2.5] }, 5000 );
	var mvtoFrente = new TWEEN.Tween( eje.position ).to( {x: [0, 2.5],
													 y: [0, 0],
													 z: [0, 2.5] }, 5000 );
	var mvtoIzq = new TWEEN.Tween( eje.position ).to( {x: [1.5, 2.5],
													 y: [0, 0],
													 z: [0, -2.5] }, 5000 );
	var mvtoTras = new TWEEN.Tween( eje.position ).to( {x: [0, -2.5],
													 y: [0, 0],
													 z: [-1.5, -2.5] }, 5000 );

	// Comportamiento a lo largo de la trayectoria indicada
	mvtoDer.easing(TWEEN.Easing.Bounce.Out); // Por defecto: lineal (mismo espacio para el mismo tiempo) (Bounce Out: función de rebote)
	mvtoDer.interpolation( TWEEN.Interpolation.Bezier ); // De los puntos dados, qué curva queremos que trace
	mvtoFrente.easing(TWEEN.Easing.Bounce.Out); // Lo mismo para el resto de trayectorias
	mvtoFrente.interpolation( TWEEN.Interpolation.Bezier );
	mvtoIzq.easing(TWEEN.Easing.Bounce.Out);
	mvtoIzq.interpolation( TWEEN.Interpolation.Bezier );
	mvtoTras.easing(TWEEN.Easing.Bounce.Out);
	mvtoTras.interpolation( TWEEN.Interpolation.Bezier );

	// Concatenacion de los movimientos
	mvtoDer.chain( mvtoFrente );
	mvtoFrente.chain( mvtoIzq );
	mvtoIzq.chain( mvtoTras );
	//mvto.repeat( 1 ); // Indicar que se repita cada movimiento las veces que se quiera
	//mvto.yoyo( true );
	mvtoDer.start(); // Comenzar la animacion

	// Giro de la peonza
	var giro = new TWEEN.Tween( eje.rotation ).to( {x:0, y:-Math.PI*2, z:0}, 2000 ); // Aquí le damos solo valores finales
	giro.repeat(Infinity);
	giro.start();
}

function updateAspectRatio()
{
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

function update()
{
	// Rotacion de la peonza (velang = velocidad angular)
	var ahora = Date.now();							// Hora actual
	angulo += effectController.velang * 2*Math.PI * (ahora-antes)/1000;			// Incrementar el angulo en 360º / sg
	antes = ahora;									// Actualizar antes
	peonza.rotation.y = angulo;
	//eje.rotation.y = angulo/2;
	// ---------------------------------

	// Control de camra
	cameraControls.update();
	// Actualiza los FPS
	stats.update();
	// Actualiza interpoladores
	TWEEN.update();
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}