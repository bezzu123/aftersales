import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../api/tickets";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";

const STEPS = ["ข้อมูลตั๋ว", "สินค้า", "ลูกค้า", "รายละเอียดซ่อม", "ตรวจสอบ"];

const REPAIR_CHANNELS = [
  { value: "in-store",     label: "In-Store — ซ่อมในร้าน" },
  { value: "vendor-store", label: "Send-out — Vendor รับที่ร้าน" },
  { value: "vendor-bdc",   label: "Send-out — Vendor รับที่ BDC" },
];

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
    repair_cost_tbd: false,
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
      if (payload.repair_cost_tbd) {
        delete payload.repair_cost; // will be set later
      } else if (payload.repair_cost) {
        payload.repair_cost = parseFloat(payload.repair_cost);
      } else {
        delete payload.repair_cost;
      }
      const { data } = await createTicket(payload);
      toast("สร้างตั๋วสำเร็จ!", "success");
      navigate(`/tickets/${data.id}`);
    } catch (e) {
      toast(e.response?.data?.detail || "ไม่สามารถสร้างตั๋วได้", "error");
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = STEPS;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">สร้างตั๋วใหม่ · New Ticket</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลสินค้าและลูกค้าเพื่อสร้างตั๋วบริการ</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? "bg-brand-red text-white" : i === step ? "bg-brand-red text-white ring-2 ring-brand-red ring-offset-2" : "bg-gray-200 text-gray-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 hidden sm:block ${i === step ? "text-brand-red font-semibold" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-brand-red" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 0: Ticket Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">ข้อมูลตั๋ว · Ticket Information</h2>
            <FormField label="Business Unit" required>
              <select className="input" value={form.bu} onChange={(e) => set("bu", e.target.value)}>
                <option value="CDS">CDS</option>
                <option value="RBS">RBS</option>
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="ชื่อพนักงาน · Staff Name">
                <input className="input" value={form.staff_name} onChange={(e) => set("staff_name", e.target.value)} />
              </FormField>
              <FormField label="เบอร์โทร · Staff Phone">
                <input className="input" value={form.staff_phone} onChange={(e) => set("staff_phone", e.target.value)} />
              </FormField>
            </div>
            <FormField label="รหัสแผนก · Sub Dept Code">
              <input className="input" value={form.sub_dept_code} onChange={(e) => set("sub_dept_code", e.target.value)} />
            </FormField>
          </div>
        )}

        {/* Step 1: Product */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">ข้อมูลสินค้า · Product Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="ประเภทสินค้า · Product Type" required>
                <input className="input" placeholder="นาฬิกา, กระเป๋า, รองเท้า..." value={form.product_type} onChange={(e) => set("product_type", e.target.value)} />
              </FormField>
              <FormField label="แบรนด์ · Brand">
                <input className="input" value={form.product_brand} onChange={(e) => set("product_brand", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Serial Number">
              <input className="input" value={form.serial_no} onChange={(e) => set("serial_no", e.target.value)} />
            </FormField>
            <FormField label="ช่องทางซ่อม · Repair Channel" required>
              <select className="input" value={form.repair_channel} onChange={(e) => set("repair_channel", e.target.value)}>
                {REPAIR_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </FormField>
            {/* Channel description */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              {form.repair_channel === "in-store" && "🏪 ซ่อมในร้าน — ช่างซ่อมที่สาขา รอรับสินค้าหลังซ่อมเสร็จ"}
              {form.repair_channel === "vendor-store" && "🚚 Send-out ร้าน — Vendor มารับสินค้าที่ร้าน แล้วส่งกลับเมื่อซ่อมเสร็จ"}
              {form.repair_channel === "vendor-bdc" && "📦 Send-out BDC — ส่งสินค้าผ่าน GR ไปยัง BDC แล้ว BDC ส่งต่อให้ Vendor"}
            </div>
          </div>
        )}

        {/* Step 2: Customer */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">ข้อมูลลูกค้า · Customer Information</h2>
            <FormField label="ชื่อลูกค้า · Customer Name" required>
              <input className="input" value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="เบอร์โทร · Phone">
                <input className="input" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} />
              </FormField>
              <FormField label="Email">
                <input type="email" className="input" value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="เลขประกัน · Warranty Number">
                <input className="input" value={form.warranty_no} onChange={(e) => set("warranty_no", e.target.value)} />
              </FormField>
              <FormField label="รายละเอียดประกัน · Warranty Desc">
                <input className="input" value={form.warranty_desc} onChange={(e) => set("warranty_desc", e.target.value)} />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 3: Repair Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">รายละเอียดการซ่อม · Repair Details</h2>
            <FormField label="รายละเอียดการซ่อม · Repair Detail" required>
              <textarea className="input min-h-[100px]" value={form.repair_detail} onChange={(e) => set("repair_detail", e.target.value)} placeholder="อธิบายปัญหาหรืองานที่ต้องซ่อม..." />
            </FormField>
            <FormField label="ประเภทค่าใช้จ่าย · Cost Type">
              <select className="input" value={form.cost_type} onChange={(e) => set("cost_type", e.target.value)}>
                <option value="warranty">Warranty — ประกัน</option>
                <option value="chargeable">Chargeable — มีค่าใช้จ่าย</option>
                <option value="goodwill">Goodwill — Goodwill</option>
              </select>
            </FormField>

            {/* Repair Cost with "Notify Later" */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="label">ค่าซ่อม · Repair Cost (THB)</label>
                <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                    checked={form.repair_cost_tbd}
                    onChange={(e) => set("repair_cost_tbd", e.target.checked)}
                  />
                  <span>แจ้งภายหลัง · Notify Later</span>
                </label>
              </div>
              {form.repair_cost_tbd ? (
                <div className="input bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                  <span>⏳</span>
                  <span>จะแจ้งราคาภายหลัง — Price to be confirmed</span>
                </div>
              ) : (
                <input
                  type="number"
                  className="input"
                  value={form.repair_cost}
                  onChange={(e) => set("repair_cost", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              )}
            </div>

            <FormField label="หมายเหตุ · Remark">
              <textarea className="input" value={form.remark} onChange={(e) => set("remark", e.target.value)} rows={3} />
            </FormField>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">ตรวจสอบข้อมูล · Review & Submit</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["BU", form.bu],
                ["ช่องทางซ่อม", REPAIR_CHANNELS.find(c => c.value === form.repair_channel)?.label || form.repair_channel],
                ["พนักงาน", form.staff_name],
                ["ประเภทสินค้า", form.product_type],
                ["แบรนด์", form.product_brand],
                ["ลูกค้า", form.customer_name],
                ["เบอร์โทร", form.customer_phone],
                ["ประเภทค่าใช้จ่าย", form.cost_type],
                ["ค่าซ่อม", form.repair_cost_tbd ? "แจ้งภายหลัง" : form.repair_cost ? `฿${form.repair_cost}` : "-"],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-gray-500 text-xs">{label}:</span>
                  <p className="font-medium mt-0.5">{val || "-"}</p>
                </div>
              ))}
            </div>
            {form.repair_detail && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-500 text-xs mb-1">รายละเอียดการซ่อม</p>
                <p>{form.repair_detail}</p>
              </div>
            )}
            {form.repair_cost_tbd && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                ⚠️ ราคาจะถูกแจ้งภายหลัง — Repair cost will be notified later
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button className="btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate("/tickets")} disabled={loading}>
            {step === 0 ? "ยกเลิก" : "← ย้อนกลับ"}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>
              ถัดไป →
            </button>
          ) : (
            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? "กำลังสร้าง..." : "สร้างตั๋ว ✓"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
