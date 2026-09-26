const pool = require("../database/postgres");

class PostgresUserRepository {
    async create(user) {
        const { rows } = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, nombre, email, rol, activo, created_at`,
            [user.nombre, user.email, user.password]
        );

        return rows[0];
    }

    async findAll() {
        const { rows } = await pool.query(
            `SELECT id, nombre, email, rol, activo, created_at
             FROM usuarios
             ORDER BY id`
        );

        return rows;
    }

    async findByEmail(email) {
        const { rows } = await pool.query(
            `SELECT id, nombre, email, password_hash AS password, rol, activo
             FROM usuarios
             WHERE lower(email) = lower($1)
             LIMIT 1`,
            [email]
        );

        return rows[0] || null;
    }

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT id, nombre, email, password_hash AS password, rol, activo
             FROM usuarios
             WHERE id = $1`,
            [id]
        );

        return rows[0] || null;
    }

    async update(user) {
        const { rows } = await pool.query(
            `UPDATE usuarios
             SET nombre = $1,
                 email = $2,
                 password_hash = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, nombre, email, rol, activo, updated_at`,
            [user.nombre, user.email, user.password, user.id]
        );

        if (!rows[0]) {
            throw new Error("Usuario no encontrado");
        }

        return rows[0];
    }

    async deleteById(id) {
        const { rows } = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING id",
            [id]
        );

        return rows.length > 0;
    }
}

module.exports = PostgresUserRepository;
