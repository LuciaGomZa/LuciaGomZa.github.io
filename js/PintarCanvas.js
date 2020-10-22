/**
 *  Seminario GPC #1. Pintar un rectangulo azul 
 */
function main()
{
    // recuperar el canvas (lienzo)
    var canvas = document.getElementById("canvas");
    
    // Obtener el contexto de render (herramientas de dibujo)
    // getWebGLContext es una funcion proporcionada en las bibliotecas
    var gl = getWebGLContext(canvas);

    // Fija color de borrado del lienzo
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Borra el canvas con el color de fondo
    gl.clear( gl.COLOR_BUFFER_BIT );
}