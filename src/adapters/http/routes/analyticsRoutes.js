const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const AnalytecService = require("../../../application/usecases/AnalytecService");
const AnalyticsRepositoryAdapter = require("../../../infrastructure/repositories/AnalyticsRepositoryAdapter");
const AnalyticsController = require("../controllers/AnalyticsController");

const router = express.Router();
const controller = new AnalyticsController(
    new AnalytecService(new AnalyticsRepositoryAdapter())
);

router.get("/reportes", requireAuth, requireAdmin,
    (req, res) => controller.getDashboard(req, res));

module.exports = router;
