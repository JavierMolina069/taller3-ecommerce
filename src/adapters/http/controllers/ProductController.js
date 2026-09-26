class ProductController {
    constructor(manageProducts) {
        this.manageProducts = manageProducts;
    }

    async list(req, res) {
        try {
            res.status(200).json(await this.manageProducts.list());
        } catch (error) {
            res.status(500).json({ error: "Error al listar productos" });
        }
    }

    async get(req, res) {
        try {
            res.status(200).json(await this.manageProducts.get(req.params.id));
        } catch (error) {
            res.status(error.statusCode || 400).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            res.status(201).json(await this.manageProducts.create(req.body));
        } catch (error) {
            const status = error.code === "23505" || error.code === "23503"
                ? 409
                : 400;
            res.status(status).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            res.status(200).json(
                await this.manageProducts.update(req.params.id, req.body)
            );
        } catch (error) {
            const status = error.statusCode ||
                (error.code === "23505" || error.code === "23503" ? 409 : 400);
            res.status(status).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            res.status(200).json(
                await this.manageProducts.delete(req.params.id)
            );
        } catch (error) {
            const status = error.statusCode ||
                (error.code === "23503" ? 409 : 400);
            res.status(status).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
