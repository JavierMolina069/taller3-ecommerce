class Order {
    constructor({ usuarioId, items, direccion_envio, ciudad, codigo_postal, pais, metodo_pago }) {
        if (!/^[1-9][0-9]*$/.test(String(usuarioId))) {
            throw new Error("Usuario inválido");
        }
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("El pedido debe incluir al menos un producto");
        }

        const combined = new Map();

        for (const item of items) {
            const productId = String(item.producto_id || "");
            const quantity = Number(item.cantidad);

            if (!/^[1-9][0-9]*$/.test(productId)) {
                throw new Error("Producto inválido en el pedido");
            }
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                throw new Error("La cantidad debe ser un entero entre 1 y 99");
            }

            combined.set(productId, (combined.get(productId) || 0) + quantity);
        }

        const paymentMethod = String(metodo_pago || "contra_entrega");
        if (!["tarjeta_demo", "transferencia", "contra_entrega"].includes(paymentMethod)) {
            throw new Error("Selecciona un método de pago válido");
        }

        this.metodo_pago = paymentMethod;
        this.usuarioId = String(usuarioId);
        this.items = Array.from(combined, ([producto_id, cantidad]) => ({
            producto_id,
            cantidad
        }));
        this.direccion_envio = String(direccion_envio || "").trim();
        this.ciudad = String(ciudad || "").trim();
        this.codigo_postal = String(codigo_postal || "").trim();
        this.pais = String(pais || "México").trim();

        if (!this.direccion_envio || !this.ciudad || !this.codigo_postal) {
            throw new Error("Dirección, ciudad y código postal son obligatorios");
        }
    }

    static canTransition(current, next) {
        const transitions = {
            pendiente: ["pagado", "cancelado"],
            pagado: ["preparando", "cancelado"],
            preparando: ["enviado"],
            enviado: ["entregado"],
            entregado: [],
            cancelado: []
        };

        return (transitions[current] || []).includes(next);
    }
}

module.exports = Order;
