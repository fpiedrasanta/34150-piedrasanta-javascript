/* VARIABLES GLOBALES */
const NOMBRE = 1;
const PRECIO = 2;
const ASC = 1;
const DESC = 2;

/* ELEMENTOS DEL DOM QUE NECESITO MANIPULAR */
let contenedorProductos = document.getElementById("productos");
let inputBuscador = document.getElementById("buscador");
let selectOrden = document.getElementById("select_orden");

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

function actualizarCatalogo() {
    mostrarProductos(productosFiltrados);
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
                    <button onclick="agregarProducto(${producto.id});" class="btn btn-outline-success">Agregar</button>
                </div>
                <span id="cantidad_card_${producto.id}" class="cantidad_card badge rounded-circle">${cantidad}</span>
            </div>`;

        //Lo agrego al contenedor
        contenedorProductos.appendChild(nuevoProducto);
    }
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

//INICIO
mostrarProductos(productosFiltrados);