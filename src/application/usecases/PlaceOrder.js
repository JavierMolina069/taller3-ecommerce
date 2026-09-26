const Order = require("../../domain/entities/Order");

class PlaceOrder {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    execute(userId, data) {
        const order = new Order({
            usuarioId: userId,
            items: data.items,
            direccion_envio: data.direccion_envio,
            ciudad: data.ciudad,
            codigo_postal: data.codigo_postal,
            pais: data.pais,
            metodo_pago: data.metodo_pago
        });

        return this.orderRepository.create(order);
    }
}

module.exports = PlaceOrder;
