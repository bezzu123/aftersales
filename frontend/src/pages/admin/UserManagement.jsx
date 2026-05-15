import { useEffect, useState } from "react";
import { listUsers, createUser, updateUser, deactivateUser } from "../../api/users";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";

const ROLES = [
  { value: "pc",    label: "PC — Product Consultant" },
  { value: "bdc",   label: "BDC — BDC Staff" },
  { value: "gr",    label: "GR — GR Staff" },
  { value: "dsm",   label: "DSM — District Manager" },
  { value: "admin", label: "Admin — Administrator" },
];

const ROLE_BADGE_COLORS = {
  pc:    "bg-blue-100 text-blue-700",
  bdc:   "bg-purple-100 text-purple-700",
  gr:    "bg-orange-100 text-orange-700",
  dsm:   "bg-teal-100 text-teal-700",
  admin: "bg-brand-red-light text-brand-red",
};

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState({ username: "", password: "", full_name: "", email: "", role: "pc", branch_code: "" });
  const [loading, setLoading] = useState(false);

  function load() {
    listUsers().then((u) => setUsers(u.data));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ username: "", password: "", full_name: "", email: "", role: "pc", branch_code: "" });
    setModal({ open: true, editing: null });
  }

  function openEdit(u) {
    setForm({ username: u.username, password: "", full_name: u.full_name || "", email: u.email || "", role: u.role, branch_code: u.branch_code || "" });
    setModal({ open: true, editing: u.id });
  }

  async function save() {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.branch_code) delete payload.branch_code;
      if (modal.editing) await updateUser(modal.editing, payload);
      else await createUser(payload);
      toast(modal.editing ? "อัปเดตผู้ใช้สำเร็จ" : "สร้างผู้ใช้สำเร็จ", "success");
      setModal({ open: false, editing: null });
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "เกิดข้อผิดพลาด", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm("ปิดการใช้งานผู้ใช้นี้?")) return;
    try {
      await deactivateUser(id);
      toast("ปิดการใช้งานแล้ว", "success");
      load();
    } catch {
      toast("เกิดข้อผิดพลาด", "error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">จัดการผู้ใช้ · User Management</h1>
        <button className="btn-primary" onClick={openCreate}>+ เพิ่มผู้ใช้</button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Username", "ชื่อ", "Role", "สาขา", "สถานะ", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3">{u.full_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${ROLE_BADGE_COLORS[u.role] || "bg-gray-100 text-gray-700"}`}>
                    {u.role?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.branch_code || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => openEdit(u)}>แก้ไข</button>
                    {u.is_active && <button className="text-xs text-red-500 hover:underline" onClick={() => handleDeactivate(u.id)}>ปิดการใช้งาน</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}>
        <div className="space-y-3">
          {!modal.editing && (
            <FormField label="Username" required>
              <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </FormField>
          )}
          <FormField label={modal.editing ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"}>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ชื่อ-นามสกุล">
              <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Role" required>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </FormField>
          {form.role === "pc" && (
            <FormField label="รหัสสาขา · Branch Code">
              <input className="input" value={form.branch_code} onChange={(e) => setForm({ ...form, branch_code: e.target.value })} placeholder="เช่น CEN-001" />
            </FormField>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-ghost" onClick={() => setModal({ open: false, editing: null })}>ยกเลิก</button>
            <button className="btn-primary" onClick={save} disabled={loading}>{loading ? "กำลังบันทึก..." : "บันทึก"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
