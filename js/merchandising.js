/* VARIABLES GLOBALES */
const NOMBRE = 1;
const PRECIO = 2;
const ASC = 1;
const DESC = 2;

/* ELEMENTOS DEL DOM QUE NECESITO MANIPULAR */
let contenedorProductos = document.getElementById("productos");
let inputBuscador = document.getElementById("buscador");
let selectOrden = document.getElementById("selectOrden");
let botonCarrito = document.getElementById("botonCarrito");
let modalBodyCarrito = document.getElementById("modal-bodyCarrito");

/* INICIALIZO MI VARIABLE DE PRODUCTOS */
/* ESTO SE OBTENDRÁ LUEGO DE UN ARCHIVO JSON */
//TODO: Obtener los productos de un archivo json.
let productos = [
    new Producto(1, "Remera", "Remera de Regrets?, tenemos en varios colores y varios talles, hacé tú pedido ahora!", 1000, 21, "remera.jpg"),
    new Producto(2, "Gorra", "No te pierdas esta gorra espectacular de Regrets?, con los diseños de los biomas del juego", 500, 21, "gorra.jpg"),
    new Producto(3, "Kaori 3D", "Espectacular impresión en 3D de nuestro personaje favorito, Kaori!", 1500, 21, "kaori_3d.jpg")
];

let productosFiltrados = productos;

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
//TODO: Agregar la cantidad en el carrito de los productos agregados.
function actualizarEstadoCarrito() {
    if(carritoCompra.detallesCarritoCompra.length > 0) {
        botonCarrito.classList.add("carrito-con-productos");
    } else {
        botonCarrito.classList.remove("carrito-con-productos");
    }
}

//Muestra los productos en la página
function mostrarProductos(productos){
    //Limpio mi contenedor
    contenedorProductos.innerHTML = "";

    for(let producto of productos){
        //Creo un nuevo div para mi producto.
        let nuevoProducto = document.createElement("div");

        let detalle = obtenerDetalleCarritoPorIdProducto(producto.id);

        //Le agrego las clases de bootstrap para que sea responsive.
        //Si existe el detalle en el carrito lo pongo en verde.
        //TODO: Mostrar con una estrellita arriba la cantidad seleccionada.
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
            </div>`;

        //Lo agrego al contenedor
        contenedorProductos.appendChild(nuevoProducto);
    }
}

//Agrega un producto al carrito de compra.
//Si ya existe lo suma.
//Si no, lo agrega.
function agregarProducto(id) {
    //1 -> Obtengo del carrito de compras el detalle.
    let detalle = obtenerDetalleCarritoPorIdProducto(id);

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
}

//Quita un producto del carrito de compra.
//Resta de a uno.
function quitarProducto(id) {
    //1 -> Obtengo del carrito de compras el detalle.
    let detalle = obtenerDetalleCarritoPorIdProducto(id);

    //2 -> Si no exite es un error.
    if(detalle == null) return;

    //3 -> Le resto uno.
    detalle.cantidad--;

    if(detalle.cantidad <= 0) {
        //Tengo que quitar el detalle de la lista.
        quitarDetalleCarrito(detalle);
    }

    //4 -> Actualizo mi localStorage.
    cargarCarritoAlStorage(carritoCompra);
    
    //5 -> Actualizo la pantalla
    mostrarProductos(productosFiltrados);

    //6 -> Actualizo el estado del carrito
    actualizarEstadoCarrito();
}

/* Obtengo un detalle del carrito por el ID del producto */
function obtenerDetalleCarritoPorIdProducto(id) {
    let detalle = carritoCompra.detallesCarritoCompra.find(function(detalle){
        return detalle.producto.id === id;
    });

    //Si detalle es undefined, quiero que me devuela null.
    return (detalle || null);
}

function quitarDetalleCarrito(detalleAQuitar) {
    carritoCompra.detallesCarritoCompra = carritoCompra.detallesCarritoCompra.filter(function(detalle){
        //si el detalle que estoy analizando es diferente al que quiero quitar
        //retorno true para que se quede.
        //cuando sean iguales devuelve false y por lo tanto se va.
        return detalle.producto.id !== detalleAQuitar.producto.id;
    });
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
//TODO: Agregar un select para elegir la condición fiscal.
//TODO: Agregar el total (suma de todas las compras)
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
}

/* EVENTOS */

//Eventos del buscador.
//TODO: Implementar también el botón del buscar.
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

botonCarrito.addEventListener("click", ()=>{
    actualizarModalCarrito();
})

//INICIO
let carritoCompra = obtenerCarritoDelStorage();
mostrarProductos(productosFiltrados);
actualizarEstadoCarrito();