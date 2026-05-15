import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGR, markReceived } from "../../api/gr";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { can } from "../../utils/roleUtils";

export default function GRDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [gr, setGr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    getGR(id).then((r) => setGr(r.data)).finally(() => setLoading(false));
  }, [id]);

  async function handleReceived() {
    setMarking(true);
    try {
      const { data } = await markReceived(id, { vendor_received_by: user?.full_name || user?.username });
      setGr(data);
      toast("Marked as received", "success");
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setMarking(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (!gr) return <div className="text-center py-16 text-gray-400">GR not found</div>;

  const statusColors = { created: "bg-blue-100 text-blue-700", in_transit: "bg-yellow-100 text-yellow-700", received: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate("/gr")} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back</button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono text-gray-900">{gr.gr_number}</h1>
            <span className={`badge ${statusColors[gr.status]}`}>{gr.status}</span>
          </div>
        </div>
        {can(user, "vendor", "admin") && gr.status === "in_transit" && (
          <button className="btn-primary" onClick={handleReceived} disabled={marking}>{marking ? "..." : "Mark Received"}</button>
        )}
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Return Details</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Return Date", formatDate(gr.return_date)],
            ["Carrier", gr.carrier_name],
            ["Tracking No", gr.tracking_no],
            ["Package Condition", gr.package_condition],
            ["Items Count", gr.items_count],
            ["Vendor Received At", formatDateTime(gr.vendor_received_at)],
            ["Received By", gr.vendor_received_by],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{value || "-"}</dd>
            </div>
          ))}
        </dl>
        {gr.remark && <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm"><p className="text-xs text-gray-500 mb-1">Remark</p><p>{gr.remark}</p></div>}
      </Card>
    </div>
  );
}
