import { statusLabel, statusColor } from "../../utils/statusUtils";

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
