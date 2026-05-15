// Bilingual Thai/English status labels
export const STATUS_LABELS = {
  waiting_repair:  "รอซ่อม · Waiting Repair",
  pending_gr:      "รอส่ง GR · Pending GR",
  pending_bdc:     "รอ BDC รับ · Pending BDC",
  received_bdc:    "BDC รับแล้ว · Received BDC",
  sent_vendor:     "ส่ง Vendor แล้ว · Sent to Vendor",
  repaired_pickup: "ซ่อมเสร็จ รอรับ · Ready Pickup",
  re_repair:       "ซ่อมซ้ำ · Re-Repair",
  pending_cancel:  "รออนุมัติยกเลิก · Pending Cancel",
  pending_donate:  "รออนุมัติบริจาค · Pending Donate",
  completed:       "เสร็จสิ้น · Completed",
  cancelled:       "ยกเลิก · Cancelled",
  donated:         "บริจาคแล้ว · Donated",
};

export const STATUS_COLORS = {
  waiting_repair:  "bg-yellow-100 text-yellow-800",
  pending_gr:      "bg-orange-100 text-orange-800",
  pending_bdc:     "bg-amber-100 text-amber-800",
  received_bdc:    "bg-blue-100 text-blue-800",
  sent_vendor:     "bg-indigo-100 text-indigo-800",
  repaired_pickup: "bg-teal-100 text-teal-800",
  re_repair:       "bg-purple-100 text-purple-800",
  pending_cancel:  "bg-red-100 text-red-700",
  pending_donate:  "bg-pink-100 text-pink-700",
  completed:       "bg-green-100 text-green-800",
  cancelled:       "bg-gray-200 text-gray-500",
  donated:         "bg-cyan-100 text-cyan-700",
};

// Order for status stepper display
export const STATUS_ORDER = [
  "waiting_repair",
  "pending_gr",
  "pending_bdc",
  "received_bdc",
  "sent_vendor",
  "repaired_pickup",
  "completed",
];

// Short labels for stepper (Thai only)
export const STATUS_SHORT = {
  waiting_repair:  "รอซ่อม",
  pending_gr:      "รอส่ง GR",
  pending_bdc:     "รอ BDC",
  received_bdc:    "BDC รับ",
  sent_vendor:     "ส่ง Vendor",
  repaired_pickup: "รอรับสินค้า",
  re_repair:       "ซ่อมซ้ำ",
  pending_cancel:  "รออนุมัติยกเลิก",
  pending_donate:  "รออนุมัติบริจาค",
  completed:       "เสร็จสิ้น",
  cancelled:       "ยกเลิก",
  donated:         "บริจาค",
};

// Repair channel labels
export const CHANNEL_LABELS = {
  "in-store":    "In-Store (ซ่อมในร้าน)",
  "vendor-store": "Send-out (Vendor รับที่ร้าน)",
  "vendor-bdc":  "Send-out (Vendor รับที่ BDC)",
};

export function statusLabel(s) {
  return STATUS_LABELS[s] || s;
}

export function statusShort(s) {
  return STATUS_SHORT[s] || s;
}

export function statusColor(s) {
  return STATUS_COLORS[s] || "bg-gray-100 text-gray-700";
}

export function channelLabel(c) {
  return CHANNEL_LABELS[c] || c || "-";
}
