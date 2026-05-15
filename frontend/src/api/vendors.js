import client from "./client";

export const listVendors = () => client.get("/vendors");
export const getVendor = (id) => client.get(`/vendors/${id}`);
export const createVendor = (data) => client.post("/vendors", data);
export const updateVendor = (id, data) => client.patch(`/vendors/${id}`, data);

export const listVendorTickets = (params) => client.get("/vendor/tickets", { params });
export const acceptTicket = (id) => client.patch(`/vendor/tickets/${id}/accept`);
export const rejectTicket = (id, reject_reason) =>
  client.patch(`/vendor/tickets/${id}/reject`, null, { params: { reject_reason } });
export const updateRepairStatus = (id, new_status, note) =>
  client.patch(`/vendor/tickets/${id}/update`, null, { params: { new_status, note } });
