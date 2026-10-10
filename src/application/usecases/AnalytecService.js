const DAY_IN_MS = 24 * 60 * 60 * 1000;
const GRANULARITIES = new Set(["day", "week", "month"]);

function appError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function isoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
    const date = new Date(value + "T00:00:00.000Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dateString(date) {
    return date.toISOString().slice(0, 10);
}

class AnalytecService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    execute(query = {}) {
        const today = new Date();
        const endDefault = dateString(today);
        const startDefault = dateString(new Date(today.getTime() - 6 * DAY_IN_MS));
        const desde = query.desde || startDefault;
        const hasta = query.hasta || endDefault;
        const granularidad = query.granularidad || "day";
        const limite = Number(query.limite || 5);

        if (!isoDate(desde) || !isoDate(hasta)) {
            throw appError("Las fechas deben tener formato YYYY-MM-DD");
        }
        if (desde > hasta) {
            throw appError("La fecha inicial no puede ser posterior a la final");
        }
        if (!GRANULARITIES.has(granularidad)) {
            throw appError("La granularidad debe ser day, week o month");
        }
        if (![5, 10].includes(limite)) {
            throw appError("El límite de productos debe ser 5 o 10");
        }

        return this.analyticsRepository.getDashboard({
            desde,
            hasta,
            granularidad,
            limite
        });
    }
}

module.exports = AnalytecService;
