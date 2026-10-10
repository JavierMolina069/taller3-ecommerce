import { apiRequest } from "./api";

export function getAnalytics({ desde, hasta, granularidad = "day", limite = 5 }) {
    const query = new URLSearchParams({ desde, hasta, granularidad, limite });
    return apiRequest("/reportes?" + query.toString());
}
