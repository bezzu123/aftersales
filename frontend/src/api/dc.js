import client from "./client";

export const listDC = (params) => client.get("/dc", { params });
export const getDC = (id) => client.get(`/dc/${id}`);
export const createDC = (data) => client.post("/dc", data);
export const updateDC = (id, data) => client.patch(`/dc/${id}`, data);
export const approveDC = (id) => client.patch(`/dc/${id}/approve`);
