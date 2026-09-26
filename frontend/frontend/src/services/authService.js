import { apiRequest, saveSession, clearSession } from "./api";

export async function register(data) {
    const session = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
    });
    saveSession(session.token, session.user);
    return session.user;
}

export async function login(data) {
    const session = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
    });
    saveSession(session.token, session.user);
    return session.user;
}

export function logout() {
    clearSession();
}
