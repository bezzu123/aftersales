export const STATUS_LABELS = {
  draft: "Draft",
  pending_gr: "Pending GR",
  gr_created: "GR Created",
  sent_to_vendor: "Sent to Vendor",
  vendor_accepted: "Vendor Accepted",
  vendor_rejected: "Vendor Rejected",
  in_repair: "In Repair",
  repaired: "Repaired",
  pending_dc: "Pending DC",
  dc_created: "DC Created",
  ready_pickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-700",
  pending_gr: "bg-yellow-100 text-yellow-800",
  gr_created: "bg-blue-100 text-blue-800",
  sent_to_vendor: "bg-indigo-100 text-indigo-800",
  vendor_accepted: "bg-teal-100 text-teal-800",
  vendor_rejected: "bg-red-100 text-red-800",
  in_repair: "bg-orange-100 text-orange-800",
  repaired: "bg-cyan-100 text-cyan-800",
  pending_dc: "bg-purple-100 text-purple-800",
  dc_created: "bg-violet-100 text-violet-800",
  ready_pickup: "bg-lime-100 text-lime-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-500",
};

export const STATUS_ORDER = [
  "draft", "pending_gr", "gr_created", "sent_to_vendor",
  "vendor_accepted", "in_repair", "repaired", "ready_pickup", "completed",
];

export function statusLabel(s) {
  return STATUS_LABELS[s] || s;
}

export function statusColor(s) {
  return STATUS_COLORS[s] || "bg-gray-100 text-gray-700";
}
