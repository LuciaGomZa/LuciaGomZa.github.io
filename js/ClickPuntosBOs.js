
// SHADER DE VERTICES
var VSHADER_SOURCE =
    'precision mediump float;                                     \n' +
    'attribute vec4 posicion;                                     \n' +
    'varying vec4 color;                                          \n' +
    'void main(){                                                 \n' +
        'gl_Position = posicion;                                  \n' +
        'gl_PointSize = 10.0;                                     \n' + 
        "float i = sqrt(pow(posicion[0], 2.0) + pow(posicion[1], 2.0));  \n" +
        "color = vec4(i*1.0, i*1.0, i*1.0, 1.0);                  \n" +            
    '}                                                            \n' ;

// SHADER DE FRAGMENTOS
var FSHADER_SOURCE = 
    'precision mediump float;                        \n' +
    'varying vec4 color;                             \n' +
    'void main(){                                    \n' +
        'gl_FragColor = color;                       \n' +           
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
    var gl = getWebGLContext(canvas);
    if( !gl ){
        console.log("Fallo al recuperar el contexto WebGL");
        return;
    }

    // Carga, compila y monta los shaders 
    if (!initShaders(gl, VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("Fallo al cargar los shaders");
        return;
    }

    // Fija color de borrado del lienzo
    gl.clearColor(139/255, 0, 139/255, 1.0); 

    // Borra el canvas con el color de fondo
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Localiza el atributo en el shader (referencia a la variable dentro del shader)
    var coordenadas = gl.getAttribLocation( gl.program, 'posicion' );

    // Escuchar eventos de raton --> función click
    canvas.onmousedown = function(evento){ click(evento,gl,canvas,coordenadas); };
}


var puntos = [];
// Definición de la función click 
function click(evento,gl,canvas,coordenadas){
    // coordenadas del click
    var x = evento.clientX;
    var y = evento.clientY;
    var rect = evento.target.getBoundingClientRect(); // Para conseguir el rectángulo del sistema de referencia

    // Conversion de coordenadas al sistema de WebGL por defecto
    x = ((x-rect.left)-canvas.width/2) * 2/canvas.width;
    y = (canvas.height/2 - (y-rect.top)) * 2/canvas.height;
    z = 0.0
    
    // Guardar coordenadas
    puntos.push(x); puntos.push(y); puntos.push(z);
    
    // Borrar el canvas (cada vez que se hace un click, borro y dibujo todo)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Crear el buffer, activarlo y enlazarlo con las coordenadas
    var bufferVertices = gl.createBuffer(); // Crear buffer
    gl.bindBuffer (gl.ARRAY_BUFFER, bufferVertices); // activar el buffer como un array simple
    gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0); // asignar el buffer al atributo elegido
    gl.enableVertexAttribArray( coordenadas ); // activar el atributo
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(puntos), gl.STATIC_DRAW); // escribir los datos en el buffer
    gl.drawArrays(gl.POINTS, 0, puntos.length/3); // dibujar todos de una
    gl.drawArrays(gl.LINE_STRIP, 0, puntos.length/3);

    }
