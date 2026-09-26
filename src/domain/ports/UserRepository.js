class UserRepository {
    async create(user) {
        throw new Error("Método create() no implementado");
    }

    async findAll() {
        throw new Error("Método findAll() no implementado");
    }

    async findByEmail(email) {
        throw new Error("Método findByEmail() no implementado");
    }

    async findById(id) {
        throw new Error("Método findById() no implementado");
    }

    async update(user) {
        throw new Error("Método update() no implementado");
    }

    async deleteById(id) {
        throw new Error("Método deleteById() no implementado");
    }
}

module.exports = UserRepository;
