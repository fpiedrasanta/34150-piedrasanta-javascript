/* VARIABLES GLOBALES */
const ID_RESPONSABLE_INSCRIPTO = 1;
const ID_CONSUMIDOR_FINAL = 2;

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

    agregarProducto() {
        let mensaje = "Ingrese el número de producto que desea:\n";

        let indice = 0;
        for(const producto of this.productos)
        {
            mensaje += `${parseInt(indice) + 1} - ${producto.nombre}\n`;
            indice++;
        }

        let nroProducto = prompt(mensaje);

        if(isNaN(parseInt(nroProducto)) || parseInt(nroProducto) < 1 || parseInt(nroProducto) > this.productos.length)
        {
            alert("seleccione una opción válida");
            return false;
        }

        let cantidad = prompt("Ingrese la cantidad deseada: ");

        if(isNaN(parseInt(cantidad)) || parseInt(cantidad) < 0)
        {
            alert("Ingrese una cantidad válida");
            return false;
        }

        let detalle = new DetalleCarritoCompra(this.productos[parseInt(nroProducto) - 1], parseInt(cantidad));

        this.carrito.detallesCarritoCompra.push(detalle);

        return true;
    }

    quitarProducto() {
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

    mostrarMenu() {
        let salir = false;

        this.carrito.condicionFiscal = new CondicionFiscal(ID_CONSUMIDOR_FINAL, "Consumidor final");

        do {
            let opcion = prompt(`
                Ingrese la opción deseada: 
                1 - Agregar producto al carrito
                2 - Quitar producto del carrito
                3 - Seleccionar condicion fiscal
                4 - Mostrar total
                5 - Limpiar carrito
                0 - Salir
            `);

            switch(opcion){
                case "1":
                    this.agregarProducto();
                break;

                case "2":
                    this.quitarProducto();
                break;
                
                case "3":
                    this.seleccionarCondicionFiscal();
                break;
                
                case "4":
                    this.carrito.mostrarModeloFactura();
                break;

                case "5":
                    this.carrito.detallesCarritoCompra = [];
                break;
                
                case "0":
                    salir = true;
                break;
            }
        } while (!salir)
    }
}

