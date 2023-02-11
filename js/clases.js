/* VARIABLES GLOBALES */
const ID_RESPONSABLE_INSCRIPTO = 1;
const ID_CONSUMIDOR_FINAL = 2;

class Producto {
    id = 0;
    nombre = "";
    descripcion = "";
    precioUnitarioSinIVA = 0;
    porcentajeIVA = 0;
    urlImagen = "";

    constructor(id, nombre, descripcion, precioUnitarioSinIVA, porcentajeIVA, urlImagen) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precioUnitarioSinIVA = precioUnitarioSinIVA;
        this.porcentajeIVA = porcentajeIVA;
        this.urlImagen = urlImagen;
    }

    static fromObject(obj) {
        return new Producto(
            obj.id, 
            obj.nombre, 
            obj.descripcion, 
            obj.precioUnitarioSinIVA, 
            obj.porcentajeIVA, 
            obj.urlImagen
        );
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

    static fromObject(obj) {
        return new DetalleCarritoCompra(
            Producto.fromObject(obj.producto), 
            obj.cantidad
        );
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

class CondicionFiscal {
    id = 0;
    descripcion = "";
    
    constructor(id, descripcion) {
        this.id = id;
        this.descripcion = descripcion;
    }

    static fromObject(obj) {
        return new CondicionFiscal(
            obj.id,
            obj.descripcion
        );
    }
}

class CarritoCompra {
    condicionFiscal = null;
    detallesCarritoCompra = [];

    constructor(condicionFiscal, detallesCarritoCompra) {
        this.condicionFiscal = condicionFiscal;
        this.detallesCarritoCompra = detallesCarritoCompra;
    }

    static fromObject(obj) {
        let detalles = [];

        obj.detallesCarritoCompra.forEach((objDetalle) => {
            detalles.push(DetalleCarritoCompra.fromObject(objDetalle));
        });
        
        return new CarritoCompra(
            obj.condicionFiscal != null ? CondicionFiscal.fromObject(obj.condicionFiscal) : null, 
            detalles
        );
    }

    mostrarModeloFactura() {
        if(this.detallesCarritoCompra.length == 0) {
            console.log("El carrito está vacio");
            return;
        }
        
        let totalSinIVA = 0;
        let totalIVA = 0;

        let factura = [];
        let indice = 0;
        for(const detalle of this.detallesCarritoCompra) {
            if(this.condicionFiscal != null && this.condicionFiscal.id == ID_RESPONSABLE_INSCRIPTO) {
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