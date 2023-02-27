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

    obtenerTotalSinIVA() {
        let totalSinIVA = 0;
        for(const detalle of this.detallesCarritoCompra) {
            totalSinIVA += detalle.obtenerTotalSinIVA();
        }

        return totalSinIVA;
    }

    obtenerTotalIVA() {
        let totalIVA = 0;

        for(const detalle of this.detallesCarritoCompra) {
            totalIVA += detalle.obtenerTotalIVA();
        }

        return totalIVA;
    }

    obtenerTotalConIVA() {
        let total = 0;
        
        for(const detalle of this.detallesCarritoCompra) {
            total += detalle.obtenerTotalConIVA();
        }

        return total;
    }

    obtenerDetalleCarritoCompraPorIdProducto(id) {
        let detalle = this.detallesCarritoCompra.find(function(detalle){
            return detalle.producto.id === id;
        });
    
        //Si detalle es undefined, quiero que me devuela null.
        return (detalle || null);
    }

    quitarDetalleCarritoCompra(detalleAQuitar) {
        this.detallesCarritoCompra = this.detallesCarritoCompra.filter(function(detalle){
            //si el detalle que estoy analizando es diferente al que quiero quitar
            //retorno true para que se quede.
            //cuando sean iguales devuelve false y por lo tanto se va.
            return detalle.producto.id !== detalleAQuitar.producto.id;
        });
    }
}