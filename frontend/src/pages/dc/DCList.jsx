import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDC } from "../../api/dc";
import Card from "../../components/ui/Card";
import { formatDate } from "../../utils/dateUtils";

export default function DCList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listDC().then((r) => setItems(r.data)).finally(() => setLoading(false)); }, []);

  const statusColors = { open: "bg-yellow-100 text-yellow-700", pending_approval: "bg-blue-100 text-blue-700", approved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Damage Control</h1>
          <p className="text-sm text-gray-500">{items.length} records</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/dc/create")}>+ New DC</button>
      </div>
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-4xl mb-2">🔍</p><p>No DC records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">DC No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Damage Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Resolution</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/dc/${d.id}`)}>
                    <td className="px-4 py-3 font-mono text-xs text-brand-red font-semibold">{d.dc_number}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(d.assessment_date)}</td>
                    <td className="px-4 py-3">{d.damage_type || "-"}</td>
                    <td className="px-4 py-3 capitalize">{d.resolution_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3"><span className={`badge ${statusColors[d.status]}`}>{d.status}</span></td>
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
