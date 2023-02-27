/* AGRUPO LOS MENSAJES AQUI POR SI ALGÚN DÍA QUIERO CAMBIAR LA LIBRERIA O LA GAMA DE COLORES. */

const mensajeBase = (mensaje, tiempo, colorDesde, colorHasta) => {
    Toastify({
        text: mensaje,
        duration: tiempo,
        gravity: "top",
        position: "right",
        style: {
            background: `linear-gradient(to right, ${colorDesde}, ${colorHasta})`
        }
      }).showToast();
}

const mensajeVerde = (mensaje) => {
    mensajeBase(mensaje, 3000, '#00b09b', '#96c93d');
}

const mensajeRojo = (mensaje) => {
    mensajeBase(mensaje, 3000, 'rgb(255, 95, 109)', 'rgb(255, 195, 113)');
}