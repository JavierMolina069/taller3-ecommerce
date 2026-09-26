const CategoryRepository = require("../../domain/ports/CategoryRepository");
const pool = require("../database/postgres");

class PostgresCategoryRepository extends CategoryRepository {
    async findAll() {
        const result = await pool.query(
            "SELECT c.id, c.nombre, c.descripcion, c.activo, c.created_at, " +
            "COUNT(p.id)::int AS total_productos " +
            "FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id " +
            "GROUP BY c.id ORDER BY c.nombre"
        );

        return result.rows;
    }

    async findById(id) {
        const result = await pool.query(
            "SELECT id, nombre, descripcion, activo, created_at " +
            "FROM categorias WHERE id = $1",
            [id]
        );

        return result.rows[0] || null;
    }

    async create(category) {
        const result = await pool.query(
            "INSERT INTO categorias (nombre, descripcion, activo) " +
            "VALUES ($1, $2, $3) " +
            "RETURNING id, nombre, descripcion, activo, created_at",
            [category.nombre, category.descripcion, category.activo]
        );

        return result.rows[0];
    }

    async update(category) {
        const result = await pool.query(
            "UPDATE categorias SET nombre = $1, descripcion = $2, " +
            "activo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 " +
            "RETURNING id, nombre, descripcion, activo, updated_at",
            [category.nombre, category.descripcion, category.activo, category.id]
        );

        return result.rows[0] || null;
    }

    async deleteById(id) {
        const result = await pool.query(
            "DELETE FROM categorias WHERE id = $1 RETURNING id",
            [id]
        );

        return result.rowCount > 0;
    }
}

module.exports = PostgresCategoryRepository;
