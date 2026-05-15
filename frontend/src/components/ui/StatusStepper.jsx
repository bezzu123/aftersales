import { STATUS_SHORT, STATUS_COLORS } from "../../utils/statusUtils";

// Channel-specific step paths
const CHANNEL_STEPS = {
  "in-store":     ["waiting_repair", "repaired_pickup", "completed"],
  "vendor-store": ["sent_vendor", "repaired_pickup", "completed"],
  "vendor-bdc":   ["pending_gr", "pending_bdc", "received_bdc", "sent_vendor", "repaired_pickup", "completed"],
};

const TERMINAL_STATUSES = {
  cancelled:      { label: "ยกเลิก", color: "bg-gray-200 text-gray-600" },
  donated:        { label: "บริจาคแล้ว", color: "bg-cyan-100 text-cyan-700" },
  re_repair:      { label: "ซ่อมซ้ำ", color: "bg-purple-100 text-purple-700" },
  pending_cancel: { label: "รออนุมัติยกเลิก", color: "bg-red-100 text-red-700" },
  pending_donate: { label: "รออนุมัติบริจาค", color: "bg-pink-100 text-pink-700" },
};

export default function StatusStepper({ status, channel }) {
  const steps = CHANNEL_STEPS[channel] || CHANNEL_STEPS["in-store"];
  const idx = steps.indexOf(status);
  const terminal = TERMINAL_STATUSES[status];

  return (
    <div>
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const done = i < idx || (idx === -1 && !terminal); // all done if completed outside steps
          const active = i === idx;
          const stepDone = done || (status === "completed" && s === "completed") || idx > i;
          return (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${active ? "bg-brand-red text-white ring-2 ring-brand-red ring-offset-2" :
                    stepDone ? "bg-brand-red text-white" : "bg-gray-200 text-gray-500"}`}>
                  {stepDone && !active ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] text-center w-14 leading-tight
                  ${active ? "text-brand-red font-semibold" : stepDone ? "text-gray-600" : "text-gray-400"}`}>
                  {STATUS_SHORT[s] || s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-5 shrink-0 mb-4 ${stepDone ? "bg-brand-red" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}

        {/* Terminal state badge */}
        {terminal && (
          <div className="ml-3 shrink-0 self-start mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${terminal.color}`}>
              {terminal.label}
            </span>
          </div>
        )}
      </div>

      {/* Channel label */}
      <p className="text-[11px] text-gray-400 mt-1">
        {channel === "in-store" && "🏪 In-Store"}
        {channel === "vendor-store" && "🚚 Send-out · Vendor รับที่ร้าน"}
        {channel === "vendor-bdc" && "📦 Send-out · Vendor รับที่ BDC"}
      </p>
    </div>
  );
}
