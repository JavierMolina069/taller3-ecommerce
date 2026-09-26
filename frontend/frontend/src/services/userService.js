import { apiRequest } from "./api";

export const getUsers = () => apiRequest("/usuarios");
export const updateUser = (id, data) =>
    apiRequest("/usuarios/" + id, { method: "PUT", body: JSON.stringify(data) });
export const deleteUser = (id) =>
    apiRequest("/usuarios/" + id, { method: "DELETE" });
