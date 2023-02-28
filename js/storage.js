/* FUNCIONES PARA EL MANEJO DEL STORAGE */
/* Funciones:
 - obtenerObjetoDelStorage
 - guardarObjetoEnStorage
 - obtenerCarritoDelStorage
 - cargarCarritoAlStorage
*/

function obtenerObjetoDelStorage(key) {
    let objeto = localStorage.getItem(key);
    if(objeto) {
        return JSON.parse(localStorage.getItem(key));
    }

    return null;
}

function guardarObjetoEnStorage(key, objeto) {
    localStorage.setItem(key, JSON.stringify(objeto));
}

/* Uso las funciones GET y SET del carrito del storage.
   Es para tener el KEY en un solo lugar.
   Podría haber sido con variable global también
*/
function obtenerCarritoDelStorage() {
    let carritoCompra = obtenerObjetoDelStorage("carritoCompra");
    
    if (carritoCompra == null) {
        carritoCompra = new CarritoCompra(null, []);
        guardarObjetoEnStorage("carritoCompra", carritoCompra);
    }

    return CarritoCompra.fromObject(carritoCompra);
}

function cargarCarritoAlStorage(carrito) {
    guardarObjetoEnStorage("carritoCompra", carrito);
}