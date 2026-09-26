const Order = require("../../domain/entities/Order");

function appError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

class ManageOrders {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    listMine(userId) {
        return this.orderRepository.findAll(userId);
    }

    listAll() {
        return this.orderRepository.findAll();
    }

    async getById(id, auth) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw appError("ID de pedido inválido", 400);
        }

        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw appError("Pedido no encontrado", 404);
        }
        if (auth.rol !== "administrador" &&
            String(order.usuario_id) !== String(auth.sub)) {
            throw appError("No tienes permiso para consultar este pedido", 403);
        }

        return order;
    }

    async changeStatus(id, nextStatus) {
        if (nextStatus === "cancelado") {
            throw appError("Usa la ruta de cancelación para cancelar el pedido", 400);
        }

        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw appError("Pedido no encontrado", 404);
        }
        if (!Order.canTransition(order.estado, nextStatus)) {
            throw appError(
                "No se permite cambiar de " + order.estado + " a " + nextStatus,
                409
            );
        }

        return this.orderRepository.updateStatus(id, nextStatus);
    }

    cancel(id, auth, motivoCancelacion) {
        const motivo = String(motivoCancelacion || "").trim();
        if (motivo.length < 5 || motivo.length > 500) {
            throw appError("Escribe un motivo de cancelación de entre 5 y 500 caracteres", 400);
        }
        const userId = auth.rol === "administrador" ? null : auth.sub;
        return this.orderRepository.cancel(id, userId, motivo);
    }
}

module.exports = ManageOrders;
