const express = require("express");
const { requireAuth, requireAdmin } =
    require("../middleware/authMiddleware");

const PostgresOrderRepository =
    require("../../../infrastructure/repositories/PostgresOrderRepository");
const PlaceOrder =
    require("../../../application/usecases/PlaceOrder");
const ManageOrders =
    require("../../../application/usecases/ManageOrders");
const OrderController =
    require("../controllers/OrderController");

const router = express.Router();
const repository = new PostgresOrderRepository();
const controller = new OrderController(
    new PlaceOrder(repository),
    new ManageOrders(repository)
);

router.post("/pedidos", requireAuth, (req, res) => controller.create(req, res));
router.get("/pedidos/mios", requireAuth,
    (req, res) => controller.listMine(req, res));
router.get("/pedidos", requireAuth, requireAdmin,
    (req, res) => controller.listAll(req, res));
router.get("/pedidos/:id", requireAuth,
    (req, res) => controller.getById(req, res));
router.put("/pedidos/:id/estado", requireAuth, requireAdmin,
    (req, res) => controller.changeStatus(req, res));
router.delete("/pedidos/:id", requireAuth,
    (req, res) => controller.cancel(req, res));

module.exports = router;
