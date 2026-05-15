import { useEffect, useState } from "react";
import { listUsers, createUser, updateUser, deactivateUser } from "../../api/users";
import { listVendors } from "../../api/vendors";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";

const ROLES = ["store_staff", "dsm", "vendor", "admin"];

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ username: "", password: "", full_name: "", email: "", role: "store_staff", vendor_id: "", branch_code: "" });
  const [loading, setLoading] = useState(false);

  function load() {
    Promise.all([listUsers(), listVendors()]).then(([u, v]) => { setUsers(u.data); setVendors(v.data); });
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ username: "", password: "", full_name: "", email: "", role: "store_staff", vendor_id: "", branch_code: "" });
    setModal({ open: true, editing: null });
  }

  function openEdit(u) {
    setForm({ username: u.username, password: "", full_name: u.full_name || "", email: u.email || "", role: u.role, vendor_id: u.vendor_id || "", branch_code: u.branch_code || "" });
    setModal({ open: true, editing: u.id });
  }

  async function save() {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.vendor_id) delete payload.vendor_id;
      if (!payload.branch_code) delete payload.branch_code;
      if (modal.editing) await updateUser(modal.editing, payload);
      else await createUser(payload);
      toast(modal.editing ? "User updated" : "User created", "success");
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm("Deactivate this user?")) return;
    try {
      await deactivateUser(id);
      toast("User deactivated", "success");
      load();
    } catch (e) {
      toast("Failed", "error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <button className="btn-primary" onClick={openCreate}>+ New User</button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Username", "Full Name", "Role", "Branch / Vendor", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3">{u.full_name || "-"}</td>
                <td className="px-4 py-3 capitalize"><span className="badge bg-gray-100 text-gray-700">{u.role?.replace("_", " ")}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.branch_code || u.vendor_id || "-"}</td>
                <td className="px-4 py-3"><span className={`badge ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => openEdit(u)}>Edit</button>
                    {u.is_active && <button className="text-xs text-red-500 hover:underline" onClick={() => handleDeactivate(u.id)}>Disable</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? "Edit User" : "New User"}>
        <div className="space-y-3">
          {!modal.editing && (
            <FormField label="Username" required>
              <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </FormField>
          )}
          <FormField label={modal.editing ? "New Password (leave blank to keep)" : "Password"}>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name"><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></FormField>
            <FormField label="Email"><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
          </div>
          <FormField label="Role">
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
          </FormField>
          {form.role === "vendor" && (
            <FormField label="Vendor">
              <select className="input" value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
                <option value="">Select vendor...</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
              </select>
            </FormField>
          )}
          {form.role === "store_staff" && (
            <FormField label="Branch Code"><input className="input" value={form.branch_code} onChange={(e) => setForm({ ...form, branch_code: e.target.value })} placeholder="e.g. CEN-001" /></FormField>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setModal({ open: false, editing: null })}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
