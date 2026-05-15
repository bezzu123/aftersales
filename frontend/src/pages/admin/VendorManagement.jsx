import { useEffect, useState } from "react";
import { listVendors, createVendor, updateVendor } from "../../api/vendors";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";

export default function VendorManagement() {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ vendor_code: "", vendor_name: "", contact_name: "", contact_phone: "", contact_email: "", product_types: "" });
  const [loading, setLoading] = useState(false);

  function load() { listVendors().then((r) => setVendors(r.data)); }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ vendor_code: "", vendor_name: "", contact_name: "", contact_phone: "", contact_email: "", product_types: "" });
    setModal({ open: true, editing: null });
  }

  function openEdit(v) {
    setForm({ vendor_code: v.vendor_code, vendor_name: v.vendor_name, contact_name: v.contact_name || "", contact_phone: v.contact_phone || "", contact_email: v.contact_email || "", product_types: v.product_types || "" });
    setModal({ open: true, editing: v.id });
  }

  async function save() {
    setLoading(true);
    try {
      if (modal.editing) await updateVendor(modal.editing, form);
      else await createVendor(form);
      toast(modal.editing ? "Vendor updated" : "Vendor created", "success");
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Vendor Management</h1>
        <button className="btn-primary" onClick={openCreate}>+ New Vendor</button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Code", "Vendor Name", "Contact", "Phone", "Product Types", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{v.vendor_code}</td>
                <td className="px-4 py-3 font-medium">{v.vendor_name}</td>
                <td className="px-4 py-3 text-gray-500">{v.contact_name || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{v.contact_phone || "-"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{v.product_types || "-"}</td>
                <td className="px-4 py-3"><button className="text-xs text-blue-600 hover:underline" onClick={() => openEdit(v)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? "Edit Vendor" : "New Vendor"}>
        <div className="space-y-3">
          {!modal.editing && (
            <FormField label="Vendor Code" required><input className="input" value={form.vendor_code} onChange={(e) => setForm({ ...form, vendor_code: e.target.value })} placeholder="VND-001" /></FormField>
          )}
          <FormField label="Vendor Name" required><input className="input" value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contact Name"><input className="input" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></FormField>
            <FormField label="Contact Phone"><input className="input" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></FormField>
          </div>
          <FormField label="Contact Email"><input type="email" className="input" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></FormField>
          <FormField label="Product Types (comma-separated)"><input className="input" value={form.product_types} onChange={(e) => setForm({ ...form, product_types: e.target.value })} placeholder="Watch,Bag,Jewelry" /></FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setModal({ open: false, editing: null })}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
