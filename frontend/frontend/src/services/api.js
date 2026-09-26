const API_URL = import.meta.env.VITE_API_URL || "http://" + "localhost:3000";

let authToken = localStorage.getItem("store_token");

export function saveSession(token, user) {
    authToken = token;
    localStorage.setItem("store_token", token);
    localStorage.setItem("store_user", JSON.stringify(user));
}

export function clearSession() {
    authToken = null;
    localStorage.removeItem("store_token");
    localStorage.removeItem("store_user");
}

export async function apiRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});

    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    if (authToken) {
        headers.set("Authorization", "Bearer " + authToken);
    }

    const response = await fetch(API_URL + path, { ...options, headers });
    const payload = response.status === 204
        ? null
        : await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error((payload && payload.error) || "Error de conexión con la API");
    }

    return payload;
}
