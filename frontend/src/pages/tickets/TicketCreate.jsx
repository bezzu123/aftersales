import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../api/tickets";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

const STEPS = ["Ticket Info", "Product", "Customer", "Repair Details", "Review"];

export default function TicketCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bu: "CDS",
    staff_name: user?.full_name || "",
    staff_phone: "",
    sub_dept_code: "",
    product_type: "",
    product_brand: "",
    serial_no: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    warranty_no: "",
    warranty_desc: "",
    repair_detail: "",
    repair_cost: "",
    repair_channel: "in-store",
    cost_type: "warranty",
    remark: "",
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.repair_cost) payload.repair_cost = parseFloat(payload.repair_cost);
      else delete payload.repair_cost;
      const { data } = await createTicket(payload);
      toast("Ticket created successfully!", "success");
      navigate(`/tickets/${data.id}`);
    } catch (e) {
      toast(e.response?.data?.detail || "Failed to create ticket", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New Ticket</h1>
        <p className="text-sm text-gray-500">Create a repair or alteration service ticket</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? "bg-brand-red text-white" : i === step ? "bg-brand-red text-white ring-2 ring-brand-red ring-offset-2" : "bg-gray-200 text-gray-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 hidden sm:block ${i === step ? "text-brand-red font-semibold" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-brand-red" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Ticket Information</h2>
            <FormField label="Business Unit" required>
              <select className="input" value={form.bu} onChange={(e) => set("bu", e.target.value)}>
                <option value="CDS">CDS</option>
                <option value="RBS">RBS</option>
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Staff Name">
                <input className="input" value={form.staff_name} onChange={(e) => set("staff_name", e.target.value)} />
              </FormField>
              <FormField label="Staff Phone">
                <input className="input" value={form.staff_phone} onChange={(e) => set("staff_phone", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Sub Dept Code">
              <input className="input" value={form.sub_dept_code} onChange={(e) => set("sub_dept_code", e.target.value)} />
            </FormField>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Product Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Product Type" required>
                <input className="input" placeholder="Watch, Bag, Shoes..." value={form.product_type} onChange={(e) => set("product_type", e.target.value)} required />
              </FormField>
              <FormField label="Brand">
                <input className="input" value={form.product_brand} onChange={(e) => set("product_brand", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Serial Number">
              <input className="input" value={form.serial_no} onChange={(e) => set("serial_no", e.target.value)} />
            </FormField>
            <FormField label="Repair Channel">
              <select className="input" value={form.repair_channel} onChange={(e) => set("repair_channel", e.target.value)}>
                <option value="in-store">In-Store</option>
                <option value="send-out">Send Out</option>
              </select>
            </FormField>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Customer Information</h2>
            <FormField label="Customer Name" required>
              <input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone">
                <input className="input" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} />
              </FormField>
              <FormField label="Email">
                <input type="email" className="input" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Warranty Number">
                <input className="input" value={form.warranty_no} onChange={(e) => set("warranty_no", e.target.value)} />
              </FormField>
              <FormField label="Warranty Description">
                <input className="input" value={form.warranty_desc} onChange={(e) => set("warranty_desc", e.target.value)} />
              </FormField>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Repair Details</h2>
            <FormField label="Repair Detail" required>
              <textarea className="input min-h-[100px]" value={form.repair_detail} onChange={(e) => set("repair_detail", e.target.value)} placeholder="Describe the repair or alteration..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Cost Type">
                <select className="input" value={form.cost_type} onChange={(e) => set("cost_type", e.target.value)}>
                  <option value="warranty">Warranty</option>
                  <option value="chargeable">Chargeable</option>
                  <option value="goodwill">Goodwill</option>
                </select>
              </FormField>
              <FormField label="Repair Cost (THB)">
                <input type="number" className="input" value={form.repair_cost} onChange={(e) => set("repair_cost", e.target.value)} placeholder="0.00" />
              </FormField>
            </div>
            <FormField label="Remark">
              <textarea className="input" value={form.remark} onChange={(e) => set("remark", e.target.value)} rows={3} />
            </FormField>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Review & Submit</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["BU", form.bu], ["Staff", form.staff_name], ["Product Type", form.product_type],
                ["Brand", form.product_brand], ["Customer", form.customer_name], ["Phone", form.customer_phone],
                ["Repair Channel", form.repair_channel], ["Cost Type", form.cost_type],
                ["Repair Cost", form.repair_cost ? `฿${form.repair_cost}` : "-"],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-gray-500">{label}:</span>
                  <span className="ml-2 font-medium">{val || "-"}</span>
                </div>
              ))}
            </div>
            {form.repair_detail && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-500 text-xs mb-1">Repair Detail</p>
                <p>{form.repair_detail}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button className="btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate("/tickets")} disabled={loading}>
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
