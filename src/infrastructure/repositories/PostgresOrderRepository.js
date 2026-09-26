const OrderRepository = require("../../domain/ports/OrderRepository");
const pool = require("../database/postgres");

function centsFromDecimal(value) {
    const parts = String(value).split(".");
    const whole = BigInt(parts[0] || "0");
    const fraction = BigInt(((parts[1] || "") + "00").slice(0, 2));
    return whole * 100n + fraction;
}

function decimalFromCents(value) {
    return (value / 100n).toString() + "." +
        (value % 100n).toString().padStart(2, "0");
}

function statusError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

class PostgresOrderRepository extends OrderRepository {
    async create(order) {
        const client = await pool.connect();
        let inTransaction = false;

        try {
            await client.query("BEGIN");
            inTransaction = true;

            const productIds = order.items.map((item) => item.producto_id);
            const productResult = await client.query(
                "SELECT id, nombre, precio, stock, activo FROM productos " +
                "WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE",
                [productIds]
            );

            if (productResult.rows.length !== productIds.length) {
                throw statusError("Uno o más productos no existen", 404);
            }

            const products = new Map(
                productResult.rows.map((product) => [String(product.id), product])
            );

            let subtotalCents = 0n;
            const orderItems = [];

            for (const item of order.items) {
                const product = products.get(String(item.producto_id));

                if (!product.activo) {
                    throw statusError(
                        "El producto " + product.nombre + " no está disponible",
                        409
                    );
                }
                if (Number(product.stock) < item.cantidad) {
                    throw statusError(
                        "Stock insuficiente para " + product.nombre,
                        409
                    );
                }

                const unitCents = centsFromDecimal(product.precio);
                subtotalCents += unitCents * BigInt(item.cantidad);
                orderItems.push({
                    producto_id: product.id,
                    nombre_producto: product.nombre,
                    cantidad: item.cantidad,
                    precio_unitario: product.precio
                });
            }

            const subtotal = decimalFromCents(subtotalCents);
            const shipping = "0.00";
            const total = subtotal;

            const orderResult = await client.query(
                "INSERT INTO pedidos " +
                "(usuario_id, subtotal, costo_envio, total, direccion_envio, ciudad, codigo_postal, pais, metodo_pago) " +
                "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) " +
                "RETURNING id, usuario_id, estado, subtotal, costo_envio, total, " +
                "moneda, direccion_envio, ciudad, codigo_postal, pais, metodo_pago, motivo_cancelacion, created_at",
                [
                    order.usuarioId,
                    subtotal,
                    shipping,
                    total,
                    order.direccion_envio,
                    order.ciudad,
                    order.codigo_postal,
                    order.pais,
                    order.metodo_pago
                ]
            );

            const savedOrder = orderResult.rows[0];

            for (const item of orderItems) {
                await client.query(
                    "INSERT INTO detalle_pedido " +
                    "(pedido_id, producto_id, nombre_producto, cantidad, precio_unitario) " +
                    "VALUES ($1, $2, $3, $4, $5)",
                    [
                        savedOrder.id,
                        item.producto_id,
                        item.nombre_producto,
                        item.cantidad,
                        item.precio_unitario
                    ]
                );

                await client.query(
                    "UPDATE productos SET stock = stock - $1, " +
                    "updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    [item.cantidad, item.producto_id]
                );
            }

            await client.query("COMMIT");
            inTransaction = false;

            savedOrder.items = orderItems;
            return savedOrder;
        } catch (error) {
            if (inTransaction) {
                await client.query("ROLLBACK");
            }
            throw error;
        } finally {
            client.release();
        }
    }

    async findAll(userId = null) {
        const query = userId
            ? await pool.query(
                "SELECT id, usuario_id, estado, subtotal, costo_envio, total, " +
                "moneda, direccion_envio, ciudad, codigo_postal, pais, metodo_pago, motivo_cancelacion, created_at " +
                "FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC",
                [userId]
            )
            : await pool.query(
                "SELECT id, usuario_id, estado, subtotal, costo_envio, total, " +
                "moneda, direccion_envio, ciudad, codigo_postal, pais, metodo_pago, motivo_cancelacion, created_at " +
                "FROM pedidos ORDER BY created_at DESC"
            );

        for (const order of query.rows) {
            const detail = await pool.query(
                "SELECT producto_id, nombre_producto, cantidad, " +
                "precio_unitario, total_linea FROM detalle_pedido " +
                "WHERE pedido_id = $1 ORDER BY id",
                [order.id]
            );
            order.items = detail.rows;
        }

        return query.rows;
    }

    async findById(id) {
        const result = await pool.query(
            "SELECT id, usuario_id, estado, subtotal, costo_envio, total, " +
            "moneda, direccion_envio, ciudad, codigo_postal, pais, metodo_pago, motivo_cancelacion, created_at " +
            "FROM pedidos WHERE id = $1",
            [id]
        );

        const order = result.rows[0];
        if (!order) {
            return null;
        }

        const detail = await pool.query(
            "SELECT producto_id, nombre_producto, cantidad, " +
            "precio_unitario, total_linea FROM detalle_pedido " +
            "WHERE pedido_id = $1 ORDER BY id",
            [id]
        );
        order.items = detail.rows;
        return order;
    }

    async updateStatus(id, status) {
        const result = await pool.query(
            "UPDATE pedidos SET estado = $1, updated_at = CURRENT_TIMESTAMP " +
            "WHERE id = $2 RETURNING id, usuario_id, estado, total, created_at",
            [status, id]
        );

        return result.rows[0] || null;
    }

    async cancel(id, userId = null, motivoCancelacion) {
        const client = await pool.connect();
        let inTransaction = false;

        try {
            await client.query("BEGIN");
            inTransaction = true;

            const result = await client.query(
                "SELECT id, usuario_id, estado FROM pedidos " +
                "WHERE id = $1 FOR UPDATE",
                [id]
            );
            const order = result.rows[0];

            if (!order) {
                throw statusError("Pedido no encontrado", 404);
            }
            if (userId && String(order.usuario_id) !== String(userId)) {
                throw statusError("No tienes permiso para cancelar este pedido", 403);
            }
            if (order.estado !== "pendiente") {
                throw statusError("Solo se pueden cancelar pedidos pendientes", 409);
            }

            const items = await client.query(
                "SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = $1",
                [id]
            );

            for (const item of items.rows) {
                await client.query(
                    "UPDATE productos SET stock = stock + $1, " +
                    "updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    [item.cantidad, item.producto_id]
                );
            }

            const updated = await client.query(
                "UPDATE pedidos SET estado = 'cancelado', motivo_cancelacion = $1, " +
                "updated_at = CURRENT_TIMESTAMP WHERE id = $2 " +
                "RETURNING id, usuario_id, estado, total, motivo_cancelacion",
                [motivoCancelacion, id]
            );

            await client.query("COMMIT");
            inTransaction = false;
            return updated.rows[0];
        } catch (error) {
            if (inTransaction) {
                await client.query("ROLLBACK");
            }
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = PostgresOrderRepository;
