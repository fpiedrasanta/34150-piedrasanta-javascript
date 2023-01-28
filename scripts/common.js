/* VARIABLES GLOBALES */
const ID_RESPONSABLE_INSCRIPTO = 1;
const ID_CONSUMIDOR_FINAL = 2;
const NOMBRE = 1;
const PRECIO = 2;
const ASC = 1;
const DESC = 2;

class Producto {
    nombre = "";
    descripcion = "";
    precioUnitarioSinIVA = 0;
    porcentajeIVA = 0;

    constructor(nombre, descripcion, precioUnitarioSinIVA, porcentajeIVA) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precioUnitarioSinIVA = precioUnitarioSinIVA;
        this.porcentajeIVA = porcentajeIVA;
    }

    obtenerIVA() {
        return (this.precioUnitarioSinIVA * this.porcentajeIVA)/100;
    }

    obtenerPrecioUnitarioConIVA() {
        return this.precioUnitarioSinIVA + this.obtenerIVA();
    }
}

class DetalleCarritoCompra {
    producto = null;
    cantidad = 0;

    constructor(producto, cantidad) {
        this.producto = producto;
        this.cantidad = cantidad;
    }

    obtenerTotalSinIVA() {
        return this.cantidad * this.producto.precioUnitarioSinIVA;
    }

    obtenerTotalIVA() {
        return this.cantidad * this.producto.obtenerIVA();
    }

    obtenerTotalConIVA() {
        return this.obtenerTotalSinIVA() + this.obtenerTotalIVA();
    }
}

class CarritoCompra {
    condicionFiscal = null;
    detallesCarritoCompra = [];

    mostrarModeloFactura() {
        if(this.detallesCarritoCompra.length == 0)
        {
            console.log("El carrito está vacio");
            return;
        }
        
        let totalSinIVA = 0;
        let totalIVA = 0;

        let factura = [];
        let indice = 0;
        for(const detalle of this.detallesCarritoCompra) {
            if(this.condicionFiscal != null && this.condicionFiscal.id == ID_RESPONSABLE_INSCRIPTO)
            {
                //Si es responsable inscripto debo discriminar IVA
                factura.push(`
                    ${parseInt(indice) + 1} - 
                    Producto: ${detalle.producto.nombre} - 
                    Cantidad: ${detalle.cantidad} - 
                    Precio unitario sin IVA: ${detalle.producto.precioUnitarioSinIVA} - 
                    Total sin IVA: ${detalle.obtenerTotalSinIVA()} - 
                    Total IVA: ${detalle.obtenerTotalIVA()} - 
                    Total: ${detalle.obtenerTotalConIVA()}`);
            } else {
                //Si no, no discrimina IVA
                factura.push(`
                    ${parseInt(indice) + 1} - 
                    Producto: ${detalle.producto.nombre} - 
                    Cantidad: ${detalle.cantidad} - 
                    Precio unitario: ${detalle.producto.obtenerPrecioUnitarioConIVA()} - 
                    Total: ${detalle.obtenerTotalConIVA()}`);
            }

            totalSinIVA += detalle.obtenerTotalSinIVA();
            totalIVA += detalle.obtenerTotalIVA();

            indice++;
        }

        for(let i = 0; i < factura.length; i++) {
            console.log(factura[i]);
        }

        if(this.condicionFiscal.id == ID_RESPONSABLE_INSCRIPTO)
        {
            console.log(`Total sin IVA: ${totalSinIVA}`);
            console.log(`Total IVA: ${totalIVA}`);
        }
        
        console.log(`Total: ${totalSinIVA + totalIVA}`);
    }
}

class CondicionFiscal {
    id = 0;
    descripcion = "";
    
    constructor(id, descripcion) {
        this.id = id;
        this.descripcion = descripcion;
    }
}

class Menu {
    productos = [
        new Producto("Remera", "", 1000, 21),
        new Producto("Gorra", "", 500, 21),
        new Producto("Muñeco 3D", "", 1500, 21)
    ];

    carrito = new CarritoCompra();

    //Funciones del menú
    seleccionarProducto(listaProductos) {
        let mensaje = "Ingrese el número de producto que desea:\n";

        let indice = 0;
        for(const producto of listaProductos)
        {
            mensaje += `${parseInt(indice) + 1} - ${producto.nombre} - $ ${parseFloat(producto.precioUnitarioSinIVA).toFixed(2)}\n`;
            indice++;
        }

        let nroProducto = prompt(mensaje);

        if(isNaN(parseInt(nroProducto)) || parseInt(nroProducto) < 1 || parseInt(nroProducto) > listaProductos.length)
        {
            return null;
        }

        return listaProductos[parseInt(nroProducto) - 1];
    }

    seleccionarCantidad() {
        let cantidad = prompt("Ingrese la cantidad deseada: ");

        if(isNaN(parseInt(cantidad)) || parseInt(cantidad) < 0)
        {
            return 0;
        }

        return parseInt(cantidad);
    }

    agregarProductoAlCarrito(listaProductos) {
        let producto = this.seleccionarProducto(listaProductos);

        if(producto == null)
        {
            alert("seleccione una opción válida");
            return false;
        }

        let cantidad = this.seleccionarCantidad();

        if(cantidad == 0)
        {
            alert("Ingrese una cantidad válida");
            return false;
        }

        let detalle = new DetalleCarritoCompra(producto, cantidad);

        this.carrito.detallesCarritoCompra.push(detalle);

        return true;
    }

    quitarProductoDelCarrito() {
        let mensaje = "Ingrese el número del producto que desea retirar:\n";

        let indice = 0;
        for(const detalle of this.carrito.detallesCarritoCompra)
        {
            mensaje += `${parseInt(indice) + 1} - ${detalle.producto.nombre}\n`;
            indice++;
        }

        mensaje += "0 - Salir";

        let nroProducto = prompt(mensaje);

        if(parseInt(nroProducto) == 0)
        {
            return false;
        }

        if(isNaN(parseInt(nroProducto)) || parseInt(nroProducto) < 1 || parseInt(nroProducto) > this.carrito.detallesCarritoCompra.length)
        {
            alert("seleccione una opción válida");
            return false;
        }

        this.carrito.detallesCarritoCompra.splice(parseInt(nroProducto) - 1, 1);

        return true;
    }

    seleccionarCondicionFiscal() {
        let condicion = prompt(`
            Ingrese la condición fiscal: 
            1 - Responsable inscripto
            2 - Consumidor final
        `);

        if(condicion == "1")
        {
            this.carrito.condicionFiscal = new CondicionFiscal(ID_RESPONSABLE_INSCRIPTO, "Responsable inscripto");
        }
        else
        {
            this.carrito.condicionFiscal = new CondicionFiscal(ID_CONSUMIDOR_FINAL, "Consumidor final");
        }
    }

    seleccionarMetodoOrdenamiento(){
        let ordenarPor = prompt(
            "Ordenar por:\n" + 
            "1 - Nombre\n" + 
            "2 - Precio\n" +
            "Ingrese la opción deseada");

        if(isNaN(parseInt(ordenarPor)) || parseInt(ordenarPor) < 1 || parseInt(ordenarPor) > 2)
        {
            alert("Debe ingresar un valor correcto");
            return false;
        }

        let direccion = prompt(
            "De manera:\n" + 
            "1 - Ascendente\n" + 
            "2 - Descendente\n" +
            "Ingrese la opción deseada");

        if(isNaN(parseInt(direccion)) || parseInt(direccion) < 1 || parseInt(direccion) > 2)
        {
            alert("Debe ingresar un valor correcto");
            return false;
        }

        this.ordenarProductos(parseInt(ordenarPor), parseInt(direccion));
    }

    ordenarProductos(ordenarPor, direccion) {
        //Ordeno los productos.
        //El metodo sort es destructivo, con lo cual pierdo el orden
        //del array original.
        //Por ahora creo que no hace falta hacer una copia
        
        if(ordenarPor == NOMBRE) {
            this.productos.sort((a, b) => {
                if (a.nombre < b.nombre){
                    if(direccion == ASC) {
                        console.log(`${a.nombre} < ${b.nombre} - NOMBRE ASC`);
                        return -1;
                    } else if(direccion == DESC) {
                        console.log(`${a.nombre} < ${b.nombre} - NOMBRE DESC`);
                        return 1;
                    }
                    return 0;
                } 

                if (a.nombre > b.nombre) {
                    if(direccion == ASC) {
                        console.log(`${a.nombre} > ${b.nombre} - NOMBRE ASC`);
                        return 1;
                    } else if(direccion == DESC) {
                        console.log(`${a.nombre} > ${b.nombre} - NOMBRE DESC`);
                        return - 1;
                    }
                    return 0;
                }

                return 0;
            });
        } else if(ordenarPor == PRECIO) {
            this.productos.sort((a, b) => {
                if (parseFloat(a.precioUnitarioSinIVA) < parseFloat(b.precioUnitarioSinIVA)){
                    if(direccion == ASC) {
                        console.log(`${a.precioUnitarioSinIVA} < ${b.precioUnitarioSinIVA} - PRECIO ASC`);
                        return -1;
                    } else if(direccion == DESC) {
                        console.log(`${a.precioUnitarioSinIVA} < ${b.precioUnitarioSinIVA} - PRECIO DESC`);
                        return 1;
                    }

                    return 0;
                } 

                if (parseFloat(a.precioUnitarioSinIVA) > parseFloat(b.precioUnitarioSinIVA)){
                    if(direccion == ASC) {
                        console.log(`${a.precioUnitarioSinIVA} > ${b.precioUnitarioSinIVA} - PRECIO ASC`);
                        return 1;
                    } else if(direccion == DESC) {
                        console.log(`${a.precioUnitarioSinIVA} > ${b.precioUnitarioSinIVA} - PRECIO DESC`);
                        return -1;
                    }
                    
                    return 0;
                } 
                return 0;
            });
        }
    }

    buscarProducto() {
        let query = prompt("Ingrese el criterio de búsqueda");

        let productosFiltrado = 
            this.productos.filter(
                producto => producto.nombre.toLowerCase().includes(
                    query.toLowerCase()
                )
            );

        if(productosFiltrado == null || productosFiltrado.length <= 0)
        {
            alert("No se encontró ningún producto");
            return false;
        }

        this.agregarProductoAlCarrito(productosFiltrado);
    }

    mostrarMenu() {
        let salir = false;

        this.carrito.condicionFiscal = new CondicionFiscal(ID_CONSUMIDOR_FINAL, "Consumidor final");

        do {
            let opcion = prompt(`
                Ingrese la opción deseada: 
                1 - Ordenar productos
                2 - Buscar producto
                3 - Agregar producto al carrito
                4 - Quitar producto del carrito
                5 - Seleccionar condicion fiscal
                6 - Mostrar total
                7 - Limpiar carrito
                0 - Salir
            `);

            switch(opcion){
                case "1":
                    this.seleccionarMetodoOrdenamiento();
                break;

                case "2":
                    this.buscarProducto();
                break;

                case "3":
                    this.agregarProductoAlCarrito(this.productos);
                break;

                case "4":
                    this.quitarProductoDelCarrito();
                break;
                
                case "5":
                    this.seleccionarCondicionFiscal();
                break;
                
                case "6":
                    this.carrito.mostrarModeloFactura();
                break;

                case "7":
                    this.carrito.detallesCarritoCompra = [];
                break;
                
                case "0":
                    salir = true;
                break;
            }
        } while (!salir)
    }
}

/* EJECUCIÓN DEL PROGRAMA */
const menu = new Menu();
    
menu.mostrarMenu();