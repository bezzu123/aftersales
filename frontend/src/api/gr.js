import client from "./client";

export const listGR = (params) => client.get("/gr", { params });
export const getGR = (id) => client.get(`/gr/${id}`);
export const createGR = (data) => client.post("/gr", data);
export const updateGR = (id, data) => client.patch(`/gr/${id}`, data);
export const markReceived = (id, data) => client.patch(`/gr/${id}/received`, data);
