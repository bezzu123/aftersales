import { useState } from "react";
import client from "../../api/client";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

export default function ReportExport() {
  const toast = useToast();
  const [form, setForm] = useState({
    start_date: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    format: "excel",
    bu: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: form.start_date, end_date: form.end_date, format: form.format });
      if (form.bu) params.set("bu", form.bu);
      if (form.status) params.set("status", form.status);
      const res = await client.get(`/reports/tickets?${params}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets_${form.start_date}_${form.end_date}.${form.format === "excel" ? "xlsx" : "csv"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Report downloaded!", "success");
    } catch {
      toast("Download failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Export ticket data</p>
      </div>
      <Card className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </FormField>
          <FormField label="End Date">
            <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Business Unit">
            <select className="input" value={form.bu} onChange={(e) => setForm({ ...form, bu: e.target.value })}>
              <option value="">All BU</option>
              <option value="CDS">CDS</option>
              <option value="RBS">RBS</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="">All Statuses</option>
              {["completed", "in_repair", "vendor_accepted", "cancelled"].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Format">
          <div className="flex gap-3">
            {[["excel", "Excel (.xlsx)"], ["csv", "CSV (.csv)"]].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={val} checked={form.format === val} onChange={() => setForm({ ...form, format: val })} className="accent-brand-red" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </FormField>
        <button className="btn-primary w-full" onClick={download} disabled={loading}>
          {loading ? "Generating..." : "Download Report"}
        </button>
      </Card>
    </div>
  );
}
