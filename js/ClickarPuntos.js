
/**
 * Seminario GPC #1. Hacer click y pintar un punto rojo
 */

// A continuacion se escriben los programas que instalan 
// el shader de vertices y el shader de fragmentos en 
// lenguaje en GLSL. Es necesario que sean en codigo fuente,
// es decir, en texto plano. Se compilan e instalan en tiempo
// de ejecución

// SHADER DE VERTICES
var VSHADER_SOURCE =
    'attribute vec4 posicion;                     \n' +
    'void main(){                                 \n' +
        'gl_Position = posicion;                  \n' +
        'gl_PointSize = 7.0;                      \n' +             
    '}                                            \n' ;

// Todo shader necesita una función main. 
// gl_Position es una variable reservada que fluye al shader 
// de fragmentos para hacer el rasterizado. La posicion es
// la del sistema de referencia que tiene por defecto. El size
// es que lo haga de tamaño 10px

// SHADER DE FRAGMENTOS
var FSHADER_SOURCE = 
    'precision mediump float;                        \n' +
    'uniform vec4 fColor;                            \n' +
    'void main(){                                    \n' +
        'gl_FragColor = fColor;                      \n' +           
    '}                                               \n' ;

function main()
{
    // recuperar el canvas (área de dibujo)
    var canvas = document.getElementById("canvas");
    if (!canvas){
        console.log("Fallo al recuperar el canvas");
        return
    }

    // Obtener el contexto de render (herramientas de dibujo)
    // getWebGLContext es una funcion proporcionada en las bibliotecas
    var gl = getWebGLContext(canvas);
    if( !gl ){
        console.log("Fallo al recuperar el contexto WebGL");
        return;
    }
    //

    // Carga, compila y monta los shaders 
    // (funcion ya proporcionada en las bibliotecas)
    if (!initShaders(gl, VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Fallo al cargar los shaders");
        return;
    }

    // Fija color de borrado del lienzo
    gl.clearColor(139/255, 0, 139/255, 1.0); 
    

    // Borra el canvas con el color de fondo
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Dibuja el frame
    render(gl);
}

function render( gl ){
    var coord = [0.0, 0.0, 0.5,
                 0.0, 0.9, 0.0,
                 0.7,-0.6, 0.0,
                -0.7,-0.6, 0.0 ];
    var triangulos = [0,3,2, 0,2,1, 0,1,3, 1,3,2];
    var tetraedro = [];
    for (var i=0; i<triangulos.length; i++){
        tetraedro.push(coord[triangulos[i]*3]);
        tetraedro.push(coord[triangulos[i]*3+1]);
        tetraedro.push(coord[triangulos[i]*3+2]);
    }

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Localiza el atributo en el shader
    var coordenadas = gl.getAttribLocation( gl.program, 'posicion');
    var fColorLocation = gl.getUniformLocation( gl.program, 'fColor' );
    gl.uniform4f(fColorLocation, 1.0,0.0,0.0,1.0)

    var bufferVertices = gl.createBuffer();
    gl.bindBuffer (gl.ARRAY_BUFFER, bufferVertices); // activar el buffer como un array simple
    gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0); // asignar el buffer al atributo elegido
    gl.enableVertexAttribArray( coordenadas ); // activar el atributo
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(tetraedro), gl.STATIC_DRAW); // escribir los datos en el buffer
    gl.drawArrays(gl.TRIANGLES, 0, tetraedro.length/3); // dibujar todos de una

    
    // Pintar las aristas en blanco
    var aristas = [0,1, 0,2, 0,3, 1,2, 2,3, 3,1];
    var tetraedro2 = [];
    for (var i=0; i<aristas.length; i++){
        tetraedro2.push(coord[aristas[i]*3]);
        tetraedro2.push(coord[aristas[i]*3+1]);
        tetraedro2.push(coord[aristas[i]*3+2]);
    }
    gl.uniform4f(fColorLocation, 1.0,1.0,1.0,1.0)
    gl.drawArrays(gl.LINES, 0, tetraedro2.length/3); // dibujar todos de una
}






