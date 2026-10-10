import { useEffect, useMemo, useState } from "react";
import {
    Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { getAnalytics } from "../services/analyticsService";
import "./AnalyticsDashboard.css";

const STATUS_LABELS = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    preparando: "Preparando",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado"
};
const STATUS_COLORS = ["#e8a15b", "#4c8b72", "#8da6ce", "#5c75a6", "#79a56b", "#c96d62"];
const currency = (value) => new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 2
}).format(Number(value || 0));

function asDateInput(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")].join("-");
}

function presetDates(preset) {
    const end = new Date();
    const start = new Date(end);
    if (preset === "7d") start.setDate(end.getDate() - 6);
    if (preset === "30d") start.setDate(end.getDate() - 29);
    if (preset === "month") start.setDate(1);
    return { desde: asDateInput(start), hasta: asDateInput(end) };
}

function MetricCard({ label, value, detail }) {
    return (
        <article className="analytics-metric-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
        </article>
    );
}

function AnalyticsDashboard() {
    const initialRange = presetDates("7d");
    const [desde, setDesde] = useState(initialRange.desde);
    const [hasta, setHasta] = useState(initialRange.hasta);
    const [preset, setPreset] = useState("7d");
    const [granularidad, setGranularidad] = useState("day");
    const [limite, setLimite] = useState("5");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        getAnalytics({ desde, hasta, granularidad, limite: Number(limite) })
            .then((data) => { if (active) setReport(data); })
            .catch((requestError) => { if (active) setError(requestError.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [desde, hasta, granularidad, limite, refreshKey]);

    const statuses = useMemo(() => (report?.estados_pedido || []).map((item) => ({
        ...item,
        nombre: STATUS_LABELS[item.estado] || item.estado
    })), [report]);

    function changePreset(value) {
        setPreset(value);
        if (value !== "custom") {
            const next = presetDates(value);
            setDesde(next.desde);
            setHasta(next.hasta);
        }
    }

    function updateDate(setter, value) {
        setPreset("custom");
        setter(value);
    }

    const summary = report?.resumen || {};

    return (
        <section className="analytics-page">
            <div className="analytics-heading">
                <div>
                    <p className="eyebrow">DECISIONES CON DATOS</p>
                    <h1>Dashboard de ventas</h1>
                    <p>Rendimiento comercial y actividad de pedidos.</p>
                </div>
                <button className="analytics-refresh" onClick={() => setRefreshKey((value) => value + 1)}>Actualizar datos</button>
            </div>

            <div className="analytics-filters" aria-label="Filtros del reporte">
                <label>Periodo
                    <select value={preset} onChange={(event) => changePreset(event.target.value)}>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="month">Este mes</option>
                        <option value="custom">Rango personalizado</option>
                    </select>
                </label>
                <label>Desde
                    <input type="date" value={desde} onChange={(event) => updateDate(setDesde, event.target.value)} />
                </label>
                <label>Hasta
                    <input type="date" value={hasta} onChange={(event) => updateDate(setHasta, event.target.value)} />
                </label>
                <label>Agrupar por
                    <select value={granularidad} onChange={(event) => setGranularidad(event.target.value)}>
                        <option value="day">Día</option>
                        <option value="week">Semana</option>
                        <option value="month">Mes</option>
                    </select>
                </label>
                <label>Ranking
                    <select value={limite} onChange={(event) => setLimite(event.target.value)}>
                        <option value="5">Top 5</option>
                        <option value="10">Top 10</option>
                    </select>
                </label>
            </div>

            {error && <div className="analytics-error" role="alert">No se pudo cargar el reporte: {error}</div>}
            {loading && <p className="analytics-loading">Actualizando métricas…</p>}

            <div className="analytics-metrics">
                <MetricCard label="Ingresos del periodo" value={currency(summary.ingresos_totales)} detail="Pedidos no cancelados" />
                <MetricCard label="Pedidos válidos" value={summary.pedidos_validos ?? 0} detail="En el rango seleccionado" />
                <MetricCard label="Ticket promedio por pedido" value={currency(summary.ticket_promedio_pedido)} detail="Ingreso promedio por venta" />
                <MetricCard label="Gasto promedio por cliente" value={currency(summary.gasto_promedio_por_usuario)} detail={`${summary.clientes_con_compra ?? 0} clientes con compra`} />
            </div>

            <div className="analytics-chart-grid">
                <section className="analytics-card analytics-revenue-card">
                    <div className="analytics-card-heading"><div><h2>Tendencia de ingresos</h2><p>Ventas agrupadas por {granularidad === "day" ? "día" : granularidad === "week" ? "semana" : "mes"}</p></div></div>
                    <div className="analytics-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={report?.ingresos_por_periodo || []} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9e2" />
                                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#78817c" }} tickLine={false} axisLine={false} />
                                <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString("es-MX")}`} tick={{ fontSize: 11, fill: "#78817c" }} tickLine={false} axisLine={false} width={74} />
                                <Tooltip formatter={(value) => [currency(value), "Ingresos"]} labelFormatter={(label) => `Periodo: ${label}`} />
                                <Bar dataKey="ingresos" fill="#245c49" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                        {!loading && !error && !(report?.ingresos_por_periodo || []).length && <p className="analytics-empty-chart">Sin ventas en este periodo.</p>}
                    </div>
                </section>

                <section className="analytics-card">
                    <div className="analytics-card-heading"><div><h2>Estados de pedidos</h2><p>Distribución del periodo seleccionado</p></div></div>
                    <div className="analytics-chart analytics-pie-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statuses} dataKey="cantidad" nameKey="nombre" innerRadius={58} outerRadius={92} paddingAngle={2}>
                                    {statuses.map((item, index) => <Cell key={item.estado} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} pedidos`, name]} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        {!loading && !error && !statuses.some((item) => Number(item.cantidad) > 0) && <p className="analytics-empty-chart">Sin pedidos en este periodo.</p>}
                    </div>
                    <div className="analytics-status-list">
                        {statuses.map((item, index) => (
                            <div key={item.estado}><i style={{ background: STATUS_COLORS[index % STATUS_COLORS.length] }} /><span>{item.nombre}</span><strong>{item.cantidad}</strong><small>{item.porcentaje}%</small></div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="analytics-card analytics-ranking-card">
                <div className="analytics-card-heading"><div><h2>Productos más vendidos</h2><p>Ordenados por unidades vendidas; se excluyen pedidos cancelados.</p></div></div>
                <div className="analytics-table-wrap">
                    <table className="analytics-table">
                        <thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                        <tbody>
                            {(report?.productos_mas_vendidos || []).map((product, index) => (
                                <tr key={product.producto_id}><td>{String(index + 1).padStart(2, "0")}</td><td>{product.nombre}</td><td>{product.unidades_vendidas}</td><td>{currency(product.ingresos)}</td></tr>
                            ))}
                            {!loading && !(report?.productos_mas_vendidos || []).length && <tr><td colSpan="4" className="analytics-empty-row">Aún no hay ventas de productos en este periodo.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}

export default AnalyticsDashboard;
