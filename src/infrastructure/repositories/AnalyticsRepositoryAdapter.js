const AnalyticsRepository = require("../../domain/ports/AnalyticsRepository");
const pool = require("../database/postgres");

class AnalyticsRepositoryAdapter extends AnalyticsRepository {
    async getDashboard({ desde, hasta, granularidad, limite }) {
        const range = [desde, hasta];
        const [summaryResult, revenueResult, statusesResult, productsResult] =
            await Promise.all([
                pool.query(
                    "WITH ventas AS (" +
                    " SELECT usuario_id, total FROM pedidos" +
                    " WHERE created_at >= $1::date" +
                    " AND created_at < ($2::date + INTERVAL '1 day')" +
                    " AND estado <> 'cancelado'" +
                    "), gasto_usuario AS (" +
                    " SELECT usuario_id, SUM(total) AS total_usuario" +
                    " FROM ventas GROUP BY usuario_id" +
                    ") SELECT COALESCE(SUM(ventas.total), 0)::numeric(14,2) AS ingresos_totales," +
                    " COUNT(*)::int AS pedidos_validos," +
                    " COUNT(DISTINCT ventas.usuario_id)::int AS clientes_con_compra," +
                    " COALESCE(AVG(ventas.total), 0)::numeric(14,2) AS ticket_promedio_pedido," +
                    " COALESCE((SELECT AVG(total_usuario) FROM gasto_usuario), 0)::numeric(14,2)" +
                    " AS gasto_promedio_por_usuario FROM ventas",
                    range
                ),
                pool.query(
                    "SELECT date_trunc($1, created_at)::date AS periodo," +
                    " COALESCE(SUM(total), 0)::numeric(14,2) AS ingresos," +
                    " COUNT(*)::int AS pedidos" +
                    " FROM pedidos WHERE created_at >= $2::date" +
                    " AND created_at < ($3::date + INTERVAL '1 day')" +
                    " AND estado <> 'cancelado'" +
                    " GROUP BY date_trunc($1, created_at)::date" +
                    " ORDER BY periodo",
                    [granularidad, desde, hasta]
                ),
                pool.query(
                    "WITH conteo AS (SELECT estado, COUNT(*)::int AS cantidad" +
                    " FROM pedidos WHERE created_at >= $1::date" +
                    " AND created_at < ($2::date + INTERVAL '1 day')" +
                    " GROUP BY estado), estados AS (" +
                    " SELECT unnest(ARRAY['pendiente','pagado','preparando','enviado','entregado','cancelado']) AS estado" +
                    ") SELECT estados.estado, COALESCE(conteo.cantidad, 0)::int AS cantidad," +
                    " CASE WHEN SUM(COALESCE(conteo.cantidad, 0)) OVER () = 0 THEN 0" +
                    " ELSE ROUND(100.0 * COALESCE(conteo.cantidad, 0) /" +
                    " SUM(COALESCE(conteo.cantidad, 0)) OVER (), 2) END AS porcentaje" +
                    " FROM estados LEFT JOIN conteo USING (estado) ORDER BY estados.estado",
                    range
                ),
                pool.query(
                    "SELECT p.id AS producto_id, p.nombre," +
                    " SUM(d.cantidad)::int AS unidades_vendidas," +
                    " SUM(d.total_linea)::numeric(14,2) AS ingresos" +
                    " FROM detalle_pedido d JOIN pedidos o ON o.id = d.pedido_id" +
                    " JOIN productos p ON p.id = d.producto_id" +
                    " WHERE o.created_at >= $2::date" +
                    " AND o.created_at < ($3::date + INTERVAL '1 day')" +
                    " AND o.estado <> 'cancelado'" +
                    " GROUP BY p.id, p.nombre ORDER BY unidades_vendidas DESC, ingresos DESC" +
                    " LIMIT $1",
                    [limite, desde, hasta]
                )
            ]);

        return {
            filtros: { desde, hasta, granularidad, limite },
            resumen: summaryResult.rows[0],
            ingresos_por_periodo: revenueResult.rows,
            estados_pedido: statusesResult.rows,
            productos_mas_vendidos: productsResult.rows
        };
    }
}

module.exports = AnalyticsRepositoryAdapter;
