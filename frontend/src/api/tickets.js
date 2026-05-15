import client from "./client";

export const listTickets = (params) => client.get("/tickets", { params });
export const getTicket = (id) => client.get(`/tickets/${id}`);
export const createTicket = (data) => client.post("/tickets", data);
export const updateTicket = (id, data) => client.patch(`/tickets/${id}`, data);
export const transitionStatus = (id, data) => client.patch(`/tickets/${id}/status`, data);
export const getTicketHistory = (id) => client.get(`/tickets/${id}/history`);
export const uploadImage = (id, file) => {
  const form = new FormData();
  form.append("file", file);
  return client.post(`/tickets/${id}/image`, form);
};
