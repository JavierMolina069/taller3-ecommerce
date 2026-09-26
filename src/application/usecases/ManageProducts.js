const Product = require("../../domain/entities/Product");

class ManageProducts {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    list() {
        return this.productRepository.findAll();
    }

    async get(id) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw new Error("ID de producto inválido");
        }

        const product = await this.productRepository.findById(id);
        if (!product) {
            const error = new Error("Producto no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return product;
    }

    create(data) {
        return this.productRepository.create(new Product(data));
    }

    async update(id, data) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw new Error("ID de producto inválido");
        }

        const product = new Product({ ...data, id });
        const updated = await this.productRepository.update(product);

        if (!updated) {
            const error = new Error("Producto no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return updated;
    }

    async delete(id) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw new Error("ID de producto inválido");
        }

        const deleted = await this.productRepository.deleteById(id);
        if (!deleted) {
            const error = new Error("Producto no encontrado");
            error.statusCode = 404;
            throw error;
        }

        return { message: "Producto eliminado correctamente" };
    }
}

module.exports = ManageProducts;
