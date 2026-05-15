import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listGR } from "../../api/gr";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card";
import { formatDate } from "../../utils/dateUtils";
import { can } from "../../utils/roleUtils";

export default function GRList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGR().then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, []);

  const statusColor = { created: "bg-blue-100 text-blue-700", in_transit: "bg-yellow-100 text-yellow-700", received: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Goods Returns</h1>
          <p className="text-sm text-gray-500">{items.length} records</p>
        </div>
        {can(user, "store_staff", "admin") && (
          <button className="btn-primary" onClick={() => navigate("/gr/create")}>+ New GR</button>
        )}
      </div>
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-4xl mb-2">↩</p><p>No goods returns yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">GR No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Return Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ticket</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Carrier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tracking</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/gr/${g.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs text-brand-red font-semibold">{g.gr_number}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(g.return_date)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{g.ticket_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{g.carrier_name || "-"}</td>
                    <td className="px-4 py-3">{g.tracking_no || "-"}</td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor[g.status] || "bg-gray-100 text-gray-600"}`}>{g.status}</span></td>
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
