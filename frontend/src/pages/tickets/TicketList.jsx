import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTickets } from "../../api/tickets";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/dateUtils";
import { can } from "../../utils/roleUtils";

const STATUSES = [
  "", "draft", "pending_gr", "gr_created", "sent_to_vendor",
  "vendor_accepted", "vendor_rejected", "in_repair", "repaired",
  "pending_dc", "dc_created", "ready_pickup", "completed", "cancelled",
];

export default function TicketList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", bu: "" });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.bu) params.bu = filters.bu;
    listTickets(params)
      .then((r) => setTickets(r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500">{tickets.length} tickets</p>
        </div>
        {can(user, "store_staff", "admin") && (
          <button className="btn-primary" onClick={() => navigate("/tickets/create")}>
            + New Ticket
          </button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <select
            className="input w-auto"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All Statuses"}</option>)}
          </select>
          <select
            className="input w-auto"
            value={filters.bu}
            onChange={(e) => setFilters({ ...filters, bu: e.target.value })}
          >
            <option value="">All BU</option>
            <option value="CDS">CDS</option>
            <option value="RBS">RBS</option>
          </select>
          <button className="btn-ghost text-sm" onClick={() => setFilters({ status: "", bu: "" })}>
            Clear
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-4xl mb-2">🗒</p>
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ticket No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">BU</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-brand-red font-semibold">{t.ticket_number}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(t.ticket_date)}</td>
                    <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-700">{t.bu}</span></td>
                    <td className="px-4 py-3">{t.customer_name || "-"}</td>
                    <td className="px-4 py-3">{[t.product_type, t.product_brand].filter(Boolean).join(" / ") || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
