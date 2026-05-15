import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createGR } from "../../api/gr";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

export default function GRCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ticket_id: params.get("ticket_id") || "",
    return_date: new Date().toISOString().split("T")[0],
    carrier_name: "",
    tracking_no: "",
    package_condition: "",
    items_count: 1,
    remark: "",
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createGR({ ...form, items_count: parseInt(form.items_count) });
      toast("GR created successfully!", "success");
      navigate(`/gr/${data.id}`);
    } catch (e) {
      toast(e.response?.data?.detail || "Failed to create GR", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <button onClick={() => navigate("/gr")} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back</button>
        <h1 className="text-xl font-bold text-gray-900">New Goods Return</h1>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Ticket ID" required>
            <input className="input" value={form.ticket_id} onChange={(e) => set("ticket_id", e.target.value)} required placeholder="Ticket UUID" />
          </FormField>
          <FormField label="Return Date" required>
            <input type="date" className="input" value={form.return_date} onChange={(e) => set("return_date", e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Carrier">
              <input className="input" value={form.carrier_name} onChange={(e) => set("carrier_name", e.target.value)} />
            </FormField>
            <FormField label="Tracking No.">
              <input className="input" value={form.tracking_no} onChange={(e) => set("tracking_no", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Package Condition">
              <input className="input" value={form.package_condition} onChange={(e) => set("package_condition", e.target.value)} />
            </FormField>
            <FormField label="Items Count">
              <input type="number" min="1" className="input" value={form.items_count} onChange={(e) => set("items_count", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Remark">
            <textarea className="input" rows={2} value={form.remark} onChange={(e) => set("remark", e.target.value)} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create GR"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
