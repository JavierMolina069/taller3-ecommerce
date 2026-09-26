const ProductRepository = require("../../domain/ports/ProductRepository");
const pool = require("../database/postgres");

class PostgresProductRepository extends ProductRepository {
    async findAll() {
        const result = await pool.query(
            "SELECT p.id, p.categoria_id, c.nombre AS categoria_nombre, " +
            "p.nombre, p.slug, p.sku, p.descripcion, p.precio, p.stock, " +
            "p.image_url, p.activo, p.created_at, p.updated_at " +
            "FROM productos p JOIN categorias c ON c.id = p.categoria_id " +
            "ORDER BY p.id"
        );

        return result.rows;
    }

    async findById(id) {
        const result = await pool.query(
            "SELECT p.id, p.categoria_id, c.nombre AS categoria_nombre, " +
            "p.nombre, p.slug, p.sku, p.descripcion, p.precio, p.stock, " +
            "p.image_url, p.activo, p.created_at, p.updated_at " +
            "FROM productos p JOIN categorias c ON c.id = p.categoria_id " +
            "WHERE p.id = $1",
            [id]
        );

        return result.rows[0] || null;
    }

    async create(product) {
        const result = await pool.query(
            "INSERT INTO productos " +
            "(categoria_id, nombre, slug, sku, descripcion, precio, stock, image_url, activo) " +
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) " +
            "RETURNING id, categoria_id, nombre, slug, sku, descripcion, " +
            "precio, stock, image_url, activo, created_at, updated_at",
            [
                product.categoria_id, product.nombre, product.slug, product.sku,
                product.descripcion, product.precio, product.stock, product.image_url, product.activo
            ]
        );

        return result.rows[0];
    }

    async update(product) {
        const result = await pool.query(
            "UPDATE productos SET categoria_id = $1, nombre = $2, slug = $3, " +
            "sku = $4, descripcion = $5, precio = $6, stock = $7, image_url = $8, activo = $9, " +
            "updated_at = CURRENT_TIMESTAMP WHERE id = $10 " +
            "RETURNING id, categoria_id, nombre, slug, sku, descripcion, " +
            "precio, stock, image_url, activo, updated_at",
            [
                product.categoria_id, product.nombre, product.slug, product.sku,
                product.descripcion, product.precio, product.stock, product.image_url, product.activo,
                product.id
            ]
        );

        return result.rows[0] || null;
    }

    async deleteById(id) {
        const result = await pool.query(
            "DELETE FROM productos WHERE id = $1 RETURNING id",
            [id]
        );

        return result.rowCount > 0;
    }
}

module.exports = PostgresProductRepository;
