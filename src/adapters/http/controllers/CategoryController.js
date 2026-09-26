class CategoryController {
    constructor(manageCategories) {
        this.manageCategories = manageCategories;
    }

    async list(req, res) {
        try {
            res.status(200).json(await this.manageCategories.list());
        } catch (error) {
            res.status(500).json({ error: "Error al listar categorías" });
        }
    }

    async create(req, res) {
        try {
            res.status(201).json(await this.manageCategories.create(req.body));
        } catch (error) {
            const status = error.code === "23505" ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            res.status(200).json(
                await this.manageCategories.update(req.params.id, req.body)
            );
        } catch (error) {
            const status = error.code === "23505" ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            res.status(200).json(
                await this.manageCategories.delete(req.params.id)
            );
        } catch (error) {
            const status = error.code === "23503" ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    }
}

module.exports = CategoryController;
