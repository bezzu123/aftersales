import client from "./client";

export const getSummary = () => client.get("/dashboard/summary");
export const getRepairTime = () => client.get("/dashboard/repair-time");
export const getStatusAging = () => client.get("/dashboard/status-aging");
