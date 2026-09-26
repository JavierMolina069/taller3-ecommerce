import { apiRequest } from "./api";

export const getProducts = () => apiRequest("/productos");
export const getCategories = () => apiRequest("/categorias");
export const createProduct = (data) =>
    apiRequest("/productos", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
    apiRequest("/productos/" + id, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) =>
    apiRequest("/productos/" + id, { method: "DELETE" });
export const createCategory = (data) =>
    apiRequest("/categorias", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) =>
    apiRequest("/categorias/" + id, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) =>
    apiRequest("/categorias/" + id, { method: "DELETE" });
