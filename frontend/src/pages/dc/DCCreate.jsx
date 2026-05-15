import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDC } from "../../api/dc";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

export default function DCCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gr_id: "", ticket_id: "",
    assessment_date: new Date().toISOString().split("T")[0],
    damage_type: "", damage_description: "", assessed_by: "",
    resolution_type: "no_action",
    credit_amount: "", credit_note_no: "", consignment_ref: "", remark: "",
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.credit_amount) payload.credit_amount = parseFloat(payload.credit_amount);
      else delete payload.credit_amount;
      const { data } = await createDC(payload);
      toast("DC record created!", "success");
      navigate(`/dc/${data.id}`);
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <button onClick={() => navigate("/dc")} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back</button>
        <h1 className="text-xl font-bold text-gray-900">New Damage Control</h1>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="GR ID" required><input className="input" value={form.gr_id} onChange={(e) => set("gr_id", e.target.value)} required /></FormField>
            <FormField label="Ticket ID" required><input className="input" value={form.ticket_id} onChange={(e) => set("ticket_id", e.target.value)} required /></FormField>
          </div>
          <FormField label="Assessment Date" required>
            <input type="date" className="input" value={form.assessment_date} onChange={(e) => set("assessment_date", e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Damage Type"><input className="input" value={form.damage_type} onChange={(e) => set("damage_type", e.target.value)} /></FormField>
            <FormField label="Assessed By"><input className="input" value={form.assessed_by} onChange={(e) => set("assessed_by", e.target.value)} /></FormField>
          </div>
          <FormField label="Damage Description">
            <textarea className="input" rows={3} value={form.damage_description} onChange={(e) => set("damage_description", e.target.value)} />
          </FormField>
          <FormField label="Resolution Type" required>
            <select className="input" value={form.resolution_type} onChange={(e) => set("resolution_type", e.target.value)}>
              <option value="credit_note">Credit Note</option>
              <option value="consignment">Consignment</option>
              <option value="replacement">Replacement</option>
              <option value="no_action">No Action</option>
            </select>
          </FormField>
          {form.resolution_type === "credit_note" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Credit Amount (THB)"><input type="number" className="input" value={form.credit_amount} onChange={(e) => set("credit_amount", e.target.value)} /></FormField>
              <FormField label="Credit Note No."><input className="input" value={form.credit_note_no} onChange={(e) => set("credit_note_no", e.target.value)} /></FormField>
            </div>
          )}
          {form.resolution_type === "consignment" && (
            <FormField label="Consignment Ref"><input className="input" value={form.consignment_ref} onChange={(e) => set("consignment_ref", e.target.value)} /></FormField>
          )}
          <FormField label="Remark"><textarea className="input" rows={2} value={form.remark} onChange={(e) => set("remark", e.target.value)} /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create DC"}</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
