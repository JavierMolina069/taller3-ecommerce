const Category = require("../../domain/entities/Category");

class ManageCategories {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    list() {
        return this.categoryRepository.findAll();
    }

    async create(data) {
        return this.categoryRepository.create(new Category(data));
    }

    async update(id, data) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw new Error("ID de categoría inválido");
        }

        const category = new Category({ ...data, id });
        const updated = await this.categoryRepository.update(category);

        if (!updated) {
            throw new Error("Categoría no encontrada");
        }

        return updated;
    }

    async delete(id) {
        if (!/^[1-9][0-9]*$/.test(String(id))) {
            throw new Error("ID de categoría inválido");
        }

        const deleted = await this.categoryRepository.deleteById(id);

        if (!deleted) {
            throw new Error("Categoría no encontrada");
        }

        return { message: "Categoría eliminada correctamente" };
    }
}

module.exports = ManageCategories;
