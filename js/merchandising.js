/* VARIABLES GLOBALES */
const NOMBRE = 1;
const PRECIO = 2;
const ASC = 1;
const DESC = 2;

/* ELEMENTOS DEL DOM QUE NECESITO MANIPULAR */
let contenedorProductos = document.getElementById("productos");
let inputBuscador = document.getElementById("buscador");
let selectOrden = document.getElementById("select_orden");
let botonCarrito = document.getElementById("boton_carrito");
let modalBodyCarrito = document.getElementById("modal_body_carrito");
let cantidadCarrito = document.getElementById("cantidad_carrito");
let selectCondicionFiscal = document.getElementById("select_condicion_fiscal");
let botonConfirmarCompra = document.getElementById("btn_confirmar_compra");
let formularioConfirmarCompra = document.getElementById("form_confirmar_compra");

/* INICIALIZO MI VARIABLE DE PRODUCTOS */
/* ESTO SE OBTIENE DE UN ARCHIVO JSON */

let productos = [];
let productosFiltrados = [];
pedido('http://nepsdns.no-ip.biz/bootstrap4/productos.json', (json) => {
    for(let producto of json){
        productos.push(Producto.fromObject(producto));
    }

    productosFiltrados = productos;

    mostrarProductos(productosFiltrados);
});

/* FUNCIONES PARA RECUPERO DEL STORAGE */
/* Es porque siempre me olvido del parse y el stringify */
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
    
    //Cada vez que actualizo mi storage, actualizo mi modal.
    actualizarModalCarrito();
}

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

//Muestra los productos en la página
function mostrarProductos(productos){
    let carritoCompra = obtenerCarritoDelStorage();

    //Limpio mi contenedor
    contenedorProductos.innerHTML = "";

    for(let producto of productos){
        //Creo un nuevo div para mi producto.
        let nuevoProducto = document.createElement("div");

        let detalle = carritoCompra.obtenerDetalleCarritoCompraPorIdProducto(producto.id);
        let cantidad = detalle ? detalle.cantidad : 0;
        //Le agrego las clases de bootstrap para que sea responsive.
        //Si existe el detalle en el carrito lo pongo en verde.
        nuevoProducto.className = `col-12 col-md-6 col-lg-4 my-3`;

        //Genero mi template
        nuevoProducto.innerHTML = `
            <div id="${producto.id}" class="card ${detalle ? "seleccionado" : ""}" style="width: 18rem;">
                <img class="card-img-top img-fluid" style="height: 200px; object-fit: cover;" src="../images/${producto.urlImagen}" alt="${producto.nombre}">
                <div class="card-body">
                    <h4 class="card-title">${producto.nombre}</h4>
                    <p>${producto.descripcion}</p>
                    <p>Precio: ${producto.obtenerPrecioUnitarioConIVA()}</p>
                    <button onclick="agregarProducto(${producto.id})" class="btn btn-outline-success">Agregar</button>
                </div>
                <span id="cantidad_card_${producto.id}" class="cantidad_card badge rounded-circle">${cantidad}</span>
            </div>`;

        //Lo agrego al contenedor
        contenedorProductos.appendChild(nuevoProducto);
    }
}

//Agrega un producto al carrito de compra.
//Si ya existe lo suma.
//Si no, lo agrega.
function agregarProducto(id) {
    let carritoCompra = obtenerCarritoDelStorage();

    //1 -> Obtengo del carrito de compras el detalle.
    let detalle = carritoCompra.obtenerDetalleCarritoCompraPorIdProducto(id);

    //2 -> Si no exite lo creo.
    if(detalle == null) {
        //Obtengo el producto de mi lista de productos.
        let producto = obtenerProductoPorId(id);

        //Creo el detalle con cantidad 0.
        detalle = new DetalleCarritoCompra(producto, 0);

        //Agrego el detalle al carrito de compras
        carritoCompra.detallesCarritoCompra.push(detalle);
    }

    //3 -> Ya sea que exista o que lo cree, le añado 1 cantidad al detalle.
    detalle.cantidad++;

    //4 -> Actualizo mi localStorage.
    cargarCarritoAlStorage(carritoCompra);
    
    //5 -> Actualizo la pantalla
    mostrarProductos(productosFiltrados);

    //6 -> Actualizo el estado del carrito
    actualizarEstadoCarrito();

    Toastify({
        text: `El producto ${detalle.producto.nombre} se agregó correctamente`,
        duration: 3000,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)"
        }
      }).showToast();
}

//Quita un producto del carrito de compra.
//Resta de a uno.
function quitarProducto(id) {
    let carritoCompra = obtenerCarritoDelStorage();

    //1 -> Obtengo del carrito de compras el detalle.
    let detalle = carritoCompra.obtenerDetalleCarritoCompraPorIdProducto(id);

    //2 -> Si no exite es un error.
    if(detalle == null) return;

    //3 -> Le resto uno.
    detalle.cantidad--;

    if(detalle.cantidad <= 0) {
        //Tengo que quitar el detalle de la lista.
        carritoCompra.quitarDetalleCarritoCompra(detalle);
    }

    //4 -> Actualizo mi localStorage.
    cargarCarritoAlStorage(carritoCompra);
    
    //5 -> Actualizo la pantalla
    mostrarProductos(productosFiltrados);

    //6 -> Actualizo el estado del carrito
    actualizarEstadoCarrito();

    Toastify({
        text: `El producto ${detalle.producto.nombre} se quitó correctamente`,
        duration: 3000,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        style: {
            background: "linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))"
        }
      }).showToast();
}

/* Obtengo un producto de la lista original por ID */
function obtenerProductoPorId(id) {
    let producto = productos.find((producto) => {
        return producto.id === id;
    });

    //Si producto es undefined, quiero que me devuelva null.
    return (producto || null);
}

/* Busco un producto por el nombre */
function buscarProducto(query, array){
    productosFiltrados = array.filter(
        (producto) => {
            return producto.nombre.toLowerCase().includes(query.toLowerCase());
        }
    )

    mostrarProductos(productosFiltrados);
}

//Función que ordena los productos.
//Destruye la lista productosFiltrados.
function ordenarProductos(ordenarPor, direccion) {
    if(ordenarPor == NOMBRE) {
        productosFiltrados.sort((a, b) => {
            if (a.nombre < b.nombre){
                if(direccion == ASC) return -1;
                else if(direccion == DESC) return 1;
                return 0;
            } 

            if (a.nombre > b.nombre) {
                if(direccion == ASC) return 1;
                else if (direccion == DESC) return - 1;
                return 0;
            }

            return 0;
        });
    } else if(ordenarPor == PRECIO) {
        productosFiltrados.sort((a, b) => {
            if (parseFloat(a.precioUnitarioSinIVA) < parseFloat(b.precioUnitarioSinIVA)) {
                if(direccion == ASC) return -1;
                else if(direccion == DESC) return 1;
                return 0;
            } 

            if (parseFloat(a.precioUnitarioSinIVA) > parseFloat(b.precioUnitarioSinIVA)) {
                if(direccion == ASC) return 1;
                else if(direccion == DESC) return -1;
                return 0;
            } 
            return 0;
        });
    }
}

/* Función que me actualiza el modal del carrito */
/* La idea es que se actualice cada vez que haya un evento en el localStorage */
function actualizarModalCarrito() {
    //Obtengo mi carrito del local storage.
    //Quiero usar esta función en todas las páginas.
    //Por ahora solo se ve en esta página.
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
                <img class="card-img-top" style="height:300px; object-fit: cover;" src="../images/${detalle.producto.urlImagen}" alt="${detalle.producto.nombre}">
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

function updateStorage(event) {
    if(event.key == "carritoCompra") {
        //Si se actualizó el carrito de compra actualizo todo.
        //Es para cuando tengo más de una pestaña abierta.
        mostrarProductos(productosFiltrados);
        actualizarEstadoCarrito();
        actualizarModalCarrito();
    }
}

/* EVENTOS */

//Eventos del buscador.
inputBuscador.addEventListener("input", ()=>{
    buscarProducto(inputBuscador.value.toLowerCase(), productos);
});

selectOrden.addEventListener("change", ()=>{
    if(selectOrden.value == "1") {
        ordenarProductos(NOMBRE, ASC);
    } else if(selectOrden.value =="2") {
        ordenarProductos(NOMBRE, DESC);
    } else if(selectOrden.value == "3") {
        ordenarProductos(PRECIO, ASC);
    } else if(selectOrden.value == "4") {
        ordenarProductos(PRECIO, DESC);
    }

    mostrarProductos(productosFiltrados);
});

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
    
    //Actualizo el DOM de productos finales.
    mostrarProductos(productosFiltrados);

    //Cierro el modal
    $("#modal_confirmacion_compra").modal("hide");

    //Limpio el formulario de confirmación de compra.
    formularioConfirmarCompra.reset();

    //Muestro un mensaje de OK.
    Toastify({
        text: `La compra se realizó con éxito`,
        duration: 3000,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)"
        }
      }).showToast();
});

window.addEventListener("storage", updateStorage, false);

//INICIO
mostrarProductos(productosFiltrados);
actualizarEstadoCarrito();