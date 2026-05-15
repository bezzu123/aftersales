import { STATUS_ORDER, STATUS_LABELS } from "../../utils/statusUtils";

export default function StatusStepper({ status }) {
  const idx = STATUS_ORDER.indexOf(status);
  const isCancelled = status === "cancelled";
  const isRejected = status === "vendor_rejected";

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STATUS_ORDER.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${active ? "bg-brand-red text-white ring-2 ring-brand-red ring-offset-2" :
                  done ? "bg-brand-red text-white" : "bg-gray-200 text-gray-500"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] text-center w-16 leading-tight
                ${active ? "text-brand-red font-semibold" : done ? "text-gray-600" : "text-gray-400"}`}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div className={`h-0.5 w-6 shrink-0 mb-4 ${done || active ? "bg-brand-red" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
      {(isCancelled || isRejected) && (
        <span className={`badge ${isCancelled ? "bg-gray-200 text-gray-500" : "bg-red-100 text-red-700"} ml-2 shrink-0`}>
          {isCancelled ? "Cancelled" : "Rejected"}
        </span>
      )}
    </div>
  );
}
