import { apiRequest } from "./api";

export const createOrder = (data) =>
    apiRequest("/pedidos", { method: "POST", body: JSON.stringify(data) });
export const getMyOrders = () => apiRequest("/pedidos/mios");
export const getAllOrders = () => apiRequest("/pedidos");
export const updateOrderStatus = (id, estado) =>
    apiRequest("/pedidos/" + id + "/estado", {
        method: "PUT",
        body: JSON.stringify({ estado })
    });
export const cancelOrder = (id, motivo_cancelacion) =>
    apiRequest("/pedidos/" + id, {
        method: "DELETE",
        body: JSON.stringify({ motivo_cancelacion })
    });
