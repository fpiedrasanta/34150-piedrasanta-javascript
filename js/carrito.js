/* PONGO ACÁ TODO LO RELACIONADO AL CARRITO PERO NO AL CATALOGO */
/* Es para usarlo en todas las páginas */

let botonCarrito = document.getElementById("boton_carrito");
let modalBodyCarrito = document.getElementById("modal_body_carrito");
let cantidadCarrito = document.getElementById("cantidad_carrito");
let selectCondicionFiscal = document.getElementById("select_condicion_fiscal");
let botonConfirmarCompra = document.getElementById("btn_confirmar_compra");
let formularioConfirmarCompra = document.getElementById("form_confirmar_compra");

//Si el carrito tiene algo, le agrego un fondo verde al carrito.
function actualizarEstadoCarrito() {
    let carritoCompra = obtenerCarritoDelStorage();

    if(carritoCompra.detallesCarritoCompra.length > 0) {
        botonCarrito.classList.add("carrito-con-productos");

        let cantidad = 0;
        for(detalleCarritoCompra of carritoCompra.detallesCarritoCompra) {
            cantidad += detalleCarritoCompra.cantidad;
        }

        cantidadCarrito.innerHTML = cantidad;
    } else {
        botonCarrito.classList.remove("carrito-con-productos");
        cantidadCarrito.innerHTML = 0;
    }
}

/* Función que me actualiza el modal del carrito */
/* La idea es que se actualice cada vez que haya un evento en el localStorage */
function actualizarModalCarrito() {
    //Obtengo mi carrito del local storage.
    let carrito = obtenerCarritoDelStorage();
    
    //Limpio el cuerpo de mi carrito.
    modalBodyCarrito.innerHTML = "";

    discriminaIva = carrito.condicionFiscal != null && carrito.condicionFiscal.id == ID_RESPONSABLE_INSCRIPTO;
    
    carrito.detallesCarritoCompra.forEach((detalle)=>{  
        let datosIVA = `
            <p class="card-text"><strong>Total sin IVA: $${detalle.obtenerTotalSinIVA()}</p> 
            <p class="card-text"><strong>Total IVA: $${detalle.obtenerTotalIVA()}</p> 
        `;
        
        modalBodyCarrito.innerHTML += `
            <div class="card border-primary mb-3" id ="productoCarrito${detalle.producto.id}" style="max-width: 540px;">
                <img class="card-img-top" style="height:300px; object-fit: cover;" src="${pathImages}${detalle.producto.urlImagen}" alt="${detalle.producto.nombre}">
                <div class="card-body">
                        <h4 class="card-title">${detalle.producto.nombre}</h4>
                        <p class="card-text">Precio unitario: $${discriminaIva ? detalle.producto.precioUnitarioSinIVA : detalle.producto.obtenerPrecioUnitarioConIVA()}</p> 
                        <p class="card-text">Cantidad: ${detalle.cantidad}</p> 
                        ${discriminaIva ? datosIVA : ""}
                        <p class="card-text"><strong>Total: $${detalle.obtenerTotalConIVA()}</p> 
                        <button class= "btn btn-danger" onclick="quitarProducto(${detalle.producto.id})"><i class="fas fa-trash-alt"></i></button>
                </div>    
            </div>`;
    });

    if(carrito.condicionFiscal != null && carrito.condicionFiscal.id == ID_RESPONSABLE_INSCRIPTO)
    {
        modalBodyCarrito.innerHTML += `
            <p class="card-text"><strong>Total sin IVA: $${carrito.obtenerTotalSinIVA()}</p> 
            <p class="card-text"><strong>Total IVA: $${carrito.obtenerTotalIVA()}</p> 
        `;
    }

    modalBodyCarrito.innerHTML += `
            <p class="card-text"><strong>Total: $${carrito.obtenerTotalConIVA()}</p> 
        `;
}

//Agrega un producto al carrito de compra.
//Si ya existe lo suma.
//Si no, lo agrega.
function agregarProducto(id) {
    let carritoCompra = obtenerCarritoDelStorage();

    //Obtengo del carrito de compras el detalle.
    let detalle = carritoCompra.obtenerDetalleCarritoCompraPorIdProducto(id);

    //Si no exite lo creo.
    if(detalle == null) {
        //Obtengo el producto de mi lista de productos.
        let producto = obtenerProductoPorId(id);

        //Creo el detalle con cantidad 0.
        detalle = new DetalleCarritoCompra(producto, 0);

        //Agrego el detalle al carrito de compras
        carritoCompra.detallesCarritoCompra.push(detalle);
    }

    //Ya sea que exista o que lo cree, le añado 1 cantidad al detalle.
    detalle.cantidad++;

    //Actualizo mi localStorage.
    cargarCarritoAlStorage(carritoCompra);
    
    //Actualizo el estado del carrito
    actualizarEstadoCarrito();

    //Actualizo el modal
    actualizarModalCarrito();

    //Si la función de actualizar pantalla está definida, la llamo.
    if(window.actualizarCatalogo) actualizarCatalogo();

    mensajeVerde(`El producto ${detalle.producto.nombre} se agregó correctamente`);
}

//Quita un producto del carrito de compra.
//Resta de a uno.
function quitarProducto(id) {
    let carritoCompra = obtenerCarritoDelStorage();

    //Obtengo del carrito de compras el detalle.
    let detalle = carritoCompra.obtenerDetalleCarritoCompraPorIdProducto(id);

    //Si no exite es un error.
    if(detalle == null) return;

    //Le resto uno.
    detalle.cantidad--;

    if(detalle.cantidad <= 0) {
        //Tengo que quitar el detalle de la lista.
        carritoCompra.quitarDetalleCarritoCompra(detalle);
    }

    //Actualizo mi localStorage.
    cargarCarritoAlStorage(carritoCompra);
    
    //Actualizo el estado del carrito
    actualizarEstadoCarrito();

    //Actualizo el modal
    actualizarModalCarrito();

    //Si la función de actualizar pantalla está definida, la llamo.
    if(window.actualizarCatalogo) actualizarCatalogo();

    mensajeRojo(`El producto ${detalle.producto.nombre} se quitó correctamente`);
}

function updateStorage(event) {
    if(event.key == "carritoCompra") {
        //Si se actualizó el carrito de compra actualizo todo.
        //Es para cuando tengo más de una pestaña abierta.
        actualizarEstadoCarrito();
        actualizarModalCarrito();

        //Si la función de actualizar pantalla está definida, la llamo.
        if(window.actualizarCatalogo) actualizarCatalogo();
    }
}

/* EVENTOS DEL CARRITO */
selectCondicionFiscal.addEventListener("change", ()=>{
    let carritoCompra = obtenerCarritoDelStorage();
    
    if(selectCondicionFiscal.value == ID_RESPONSABLE_INSCRIPTO) {
        carritoCompra.condicionFiscal = new CondicionFiscal(ID_RESPONSABLE_INSCRIPTO, "Responsable inscripto");
    } else {
        carritoCompra.condicionFiscal = new CondicionFiscal(ID_CONSUMIDOR_FINAL, "Consumidor final");
    }
    
    cargarCarritoAlStorage(carritoCompra);

    actualizarModalCarrito();
});

botonCarrito.addEventListener("click", ()=>{
    let carritoCompra = obtenerCarritoDelStorage();
    selectCondicionFiscal.value = carritoCompra.condicionFiscal != null ? carritoCompra.condicionFiscal.id : ID_CONSUMIDOR_FINAL;
    
    //Actualizo el modal
    actualizarModalCarrito();
});

botonConfirmarCompra.addEventListener("click", (event)=>{
    //Prevengo el submit
    event.preventDefault();

    //TODO: Enviar al backend los datos de la compra por fetch cuando vea nodejs.
    //Si el servidor responde ok, se ejecutan todos los pasos de abajo.

    //Actualizo el carrito y el storage.
    let carritoCompra = obtenerCarritoDelStorage();
    carritoCompra.detallesCarritoCompra = [];
    cargarCarritoAlStorage(carritoCompra);

    //Actualizar el estado del carrito
    actualizarEstadoCarrito();

    //Actualizo el modal del carrito.
    actualizarModalCarrito();
    
    //Cierro el modal
    $("#modal_confirmacion_compra").modal("hide");

    //Limpio el formulario de confirmación de compra.
    formularioConfirmarCompra.reset();

    //Muestro un mensaje de OK.
    mensajeVerde(`La compra se realizó con éxito`);
});

window.addEventListener("storage", updateStorage, false);

actualizarEstadoCarrito();