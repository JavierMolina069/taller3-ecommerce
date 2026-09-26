const express = require("express");
const { requireAuth, requireAdmin } =
    require("../middleware/authMiddleware");

const PostgresCategoryRepository =
    require("../../../infrastructure/repositories/PostgresCategoryRepository");
const ManageCategories =
    require("../../../application/usecases/ManageCategories");
const CategoryController =
    require("../controllers/CategoryController");

const PostgresProductRepository =
    require("../../../infrastructure/repositories/PostgresProductRepository");
const ManageProducts =
    require("../../../application/usecases/ManageProducts");
const ProductController =
    require("../controllers/ProductController");

const router = express.Router();

const categoryController = new CategoryController(
    new ManageCategories(new PostgresCategoryRepository())
);
const productController = new ProductController(
    new ManageProducts(new PostgresProductRepository())
);

router.get("/categorias", (req, res) => categoryController.list(req, res));
router.post("/categorias", requireAuth, requireAdmin,
    (req, res) => categoryController.create(req, res));
router.put("/categorias/:id", requireAuth, requireAdmin,
    (req, res) => categoryController.update(req, res));
router.delete("/categorias/:id", requireAuth, requireAdmin,
    (req, res) => categoryController.delete(req, res));

router.get("/productos", (req, res) => productController.list(req, res));
router.get("/productos/:id", (req, res) => productController.get(req, res));
router.post("/productos", requireAuth, requireAdmin,
    (req, res) => productController.create(req, res));
router.put("/productos/:id", requireAuth, requireAdmin,
    (req, res) => productController.update(req, res));
router.delete("/productos/:id", requireAuth, requireAdmin,
    (req, res) => productController.delete(req, res));

module.exports = router;
