class OrderController {
    constructor(placeOrder, manageOrders) {
        this.placeOrder = placeOrder;
        this.manageOrders = manageOrders;
    }

    async create(req, res) {
        try {
            const order = await this.placeOrder.execute(req.auth.sub, req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(error.statusCode || 400).json({ error: error.message });
        }
    }

    async listMine(req, res) {
        try {
            res.status(200).json(
                await this.manageOrders.listMine(req.auth.sub)
            );
        } catch (error) {
            res.status(500).json({ error: "Error al listar tus pedidos" });
        }
    }

    async listAll(req, res) {
        try {
            res.status(200).json(await this.manageOrders.listAll());
        } catch (error) {
            res.status(500).json({ error: "Error al listar pedidos" });
        }
    }

    async getById(req, res) {
        try {
            res.status(200).json(
                await this.manageOrders.getById(req.params.id, req.auth)
            );
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async changeStatus(req, res) {
        try {
            const order = await this.manageOrders.changeStatus(
                req.params.id,
                req.body.estado
            );
            res.status(200).json(order);
        } catch (error) {
            res.status(error.statusCode || 400).json({ error: error.message });
        }
    }

    async cancel(req, res) {
        try {
            res.status(200).json(
                await this.manageOrders.cancel(req.params.id, req.auth, req.body?.motivo_cancelacion)
            );
        } catch (error) {
            res.status(error.statusCode || 400).json({ error: error.message });
        }
    }
}

module.exports = OrderController;
