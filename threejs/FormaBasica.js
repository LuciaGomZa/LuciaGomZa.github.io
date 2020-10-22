/** 
 * Seminario GPC #2. FormaBasica
 * Dibujar formas basicas con animacion
 * 
 */

// Variables imprescindibles
var renderer, scene, camera

// Variables globales
var esferacubo, cubo, angulo = 0

// Acciones
init();
loadScene();
render();

function init(){
    // -----------------------------------------------
    // MOTOR DE RENDER 
    // -----------------------------------------------
    // Conjunto de herramientas, procesos que convierten una estructura de datos informática en los colores
    // y formas que se ven en la pantalla -> coje un canvas y crea estructuras de datos asociadas
    renderer = new THREE.WebGLRenderer(); // todas las funciones/constantes empiezan por THREE en threejs
    // Determinar el área de dibujo
    renderer.setSize( window.innerWidth, window.innerHeight);
    // Color de borrado (en rgba)
    renderer.setClearColor( new THREE.Color(0x0000AA)); // el color se le pasa como una instancia de THREE, con el valor hexadecimal (RR GG BB)
    //  Conectar el canvas al cuerpo de la página
    document.getElementById("container").appendChild(renderer.domElement);

    // -----------------------------------------------
    // ESCENA
    // -----------------------------------------------
    // Estructura de datos que aguanta todo el conjunto de datos sobre los que se hace el render
    scene = new THREE.Scene();

    // -----------------------------------------------
    // CAMARA
    // -----------------------------------------------
    // Razon de aspecto (ar) proporcional al área de dibujo para que no salga deformada
    var ar = window.innerWidth / window.innerHeight;
    // Crear una cámara perspectiva con un determinado volumen de la vista
    camera = new THREE.PerspectiveCamera (50, ar, 0.1, 100); // (fov, razonAspecto,cerca,lejos) cerca: a partir de donde empieza a fotografiar (ej. 1 metro) //lejos: a partir de donde deja de fotografiar (ej. 1000 metrs)
    scene.add(camera); // la camara se instancia en el origen de coordenadas, hacia -z
    camera.position.set(0.5, 3, 9); // punto en el que quiero fijar la cámara
    camera.lookAt(new THREE.Vector3(0, 0, 0,)); // Punto hacia el que mira la cámara
 }
function loadScene(){
    // Cargar la escena con objetos

    // Material
    var material = new THREE.MeshBasicMaterial({color:'yellow', wireframe:true});
    // Geometría
    var geocubo = new THREE.BoxGeometry(2,2,2);
    var geoesfera = new THREE.SphereGeometry(1,30,30); // numero de paralelos y meridiarons de la esfera
    // Objeto
    cubo = new THREE.Mesh(geocubo, material); // antes ponía var delante, pero lo hemos quitado y añadido arriba para que la variable sea general y pueda acceder desde update
    cubo.position.x = -1; // que se vaya uno hacia la izquierda

    var esfera = new THREE.Mesh(geoesfera,material);
    esfera.position.x = 1; // moverla a la derecha, traslación

    esferacubo = new THREE.Object3D();
    esferacubo.position.y = 1;
    // esferacubo.rotation.y = Math.PI/4; // rotación en radianes
    
    // Modelo importado
    var loader = new THREE.ObjectLoader();
    // cargar el modelo, y le pasas la funcion de lo que quiero que haga
    loader.load('models/soldado.json', 
        function(obj){
            obj.position.y = 1; // lo traslado hacia arriba
            cubo.add(obj); // hace el objeto hijo del cubo
        }  );

    // Añadir a la escena
    esferacubo.add(cubo);
    esferacubo.add(esfera);
    scene.add(esferacubo);
    cubo.add(new THREE.AxisHelper(3)); // Dibujar el sistema de referencia propio del cubo
    scene.add(new THREE.AxisHelper(3)); // Dibujar ejes de ayuda (sistema de referencia de la escena)
}
// Por defecto, las transformaciones se aplican en este orden, independientemente de la parte del codigo 
// donde este escalado (con respecto al sistema de referencia del padre), rotación, traslación
// Se puede usar un orden diferente. 
function update(){
    // Cambios entre frames
    angulo += Math.PI/100
    esferacubo.rotation.y = angulo;
    cubo.rotation.x = angulo/2;

}
function render(){
    // Dibujar cada frame
    requestAnimationFrame(render); // bucle de refresco infinito, ya que la función se encola a sí misma
    update(); // cambiar algo en la escena
    renderer.render( scene, camera ); // Le indico que haga un render (dibujo) de esa escena vista desde esa camera

}

// Compute face normals:
//https://threejs.org/docs/#api/en/core/Face3.normal

// Añadir a la escena
// scene.add(suelo);
// scene.add(base);
// scene.add(eje);
// scene.add(esparrago);
// scene.add(rotula);
// scene.add(disco);
// scene.add(nervio1);
// scene.add(nervio2);
// scene.add(nervio3);
// scene.add(nervio4);
// scene.add(mano);
// scene.add(pinzaIzq);
// scene.add(pinzaDer);


// antebrazo.add(pinzaIzq);
// antebrazo.add(pinzaDer);
// pinzaIzq.position.y = 120 + 80 - 10; pinzaIzq.position.z = 20 - 6;
// pinzaDer.position.y = 120 + 80 - 10; pinzaDer.position.z = -20 + 6; pinzaDer.rotation.x = Math.PI*2;