class OrderRepository {
    async create(order) {
        throw new Error("create() no implementado");
    }

    async findAll(userId = null) {
        throw new Error("findAll() no implementado");
    }

    async findById(id) {
        throw new Error("findById() no implementado");
    }

    async updateStatus(id, status) {
        throw new Error("updateStatus() no implementado");
    }

    async cancel(id, userId = null) {
        throw new Error("cancel() no implementado");
    }
}

module.exports = OrderRepository;
