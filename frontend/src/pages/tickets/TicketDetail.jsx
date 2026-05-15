import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTicket, getTicketHistory, transitionStatus } from "../../api/tickets";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import StatusStepper from "../../components/ui/StatusStepper";
import Modal from "../../components/ui/Modal";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { can } from "../../utils/roleUtils";
import { channelLabel, statusLabel } from "../../utils/statusUtils";

// MVP state machine — mirrors backend ticket_service.py TRANSITIONS + ROLE_TRANSITIONS
const ROLE_NEXT_STATUSES = {
  pc: {
    waiting_repair:  ["repaired_pickup", "pending_cancel", "pending_donate"],
    sent_vendor:     ["repaired_pickup", "pending_cancel"],
    repaired_pickup: ["completed", "re_repair"],
    re_repair:       ["waiting_repair", "sent_vendor"],
  },
  gr: {
    pending_gr: ["pending_bdc"],
  },
  bdc: {
    pending_bdc:  ["received_bdc"],
    received_bdc: ["sent_vendor"],
  },
  dsm: {
    pending_cancel: ["cancelled"],
    pending_donate: ["donated"],
  },
  admin: {
    waiting_repair:  ["repaired_pickup", "pending_cancel", "pending_donate"],
    pending_gr:      ["pending_bdc", "pending_cancel"],
    pending_bdc:     ["received_bdc", "pending_cancel"],
    received_bdc:    ["sent_vendor", "pending_cancel"],
    sent_vendor:     ["repaired_pickup", "pending_cancel"],
    repaired_pickup: ["completed", "re_repair"],
    re_repair:       ["waiting_repair", "sent_vendor", "pending_cancel"],
    pending_cancel:  ["cancelled"],
    pending_donate:  ["donated"],
  },
};

// Human-readable action labels for transition buttons
const TRANSITION_LABELS = {
  repaired_pickup: "✅ รับสินค้าคืนจาก Vendor/ช่าง",
  completed:       "🎉 ลูกค้ารับสินค้าแล้ว (Complete)",
  re_repair:       "🔄 ส่งซ่อมอีกครั้ง (Re-Repair)",
  pending_cancel:  "❌ ขอยกเลิก (รอ DSM)",
  pending_donate:  "🎁 ขอบริจาค (รอ DSM)",
  waiting_repair:  "🔧 ส่งซ่อมในร้าน",
  sent_vendor:     "🚚 ส่ง Vendor",
  pending_bdc:     "📦 ส่งออก GR → BDC",
  received_bdc:    "📥 BDC รับสินค้าแล้ว",
  cancelled:       "✓ อนุมัติยกเลิก",
  donated:         "✓ อนุมัติบริจาค",
};

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || "-"}</dd>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [modal, setModal] = useState({ open: false, target: "" });
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    return Promise.all([
      getTicket(id).then((r) => setTicket(r.data)),
      getTicketHistory(id).then((r) => setHistory(r.data)),
    ]).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  const availableTransitions = ticket
    ? (ROLE_NEXT_STATUSES[user?.role]?.[ticket.status] || [])
    : [];

  async function doTransition() {
    setTransitioning(true);
    try {
      await transitionStatus(id, { status: modal.target, note, reject_reason: rejectReason || undefined });
      toast("อัปเดตสถานะสำเร็จ", "success");
      setModal({ open: false, target: "" });
      setNote(""); setRejectReason("");
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "ไม่สามารถเปลี่ยนสถานะได้", "error");
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>;
  if (!ticket) return <div className="text-center py-16 text-gray-400">ไม่พบตั๋ว</div>;

  const canEdit = can(user, "pc", "admin") && ticket.status === "waiting_repair";

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button onClick={() => navigate("/tickets")} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← รายการตั๋ว</button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold font-mono text-gray-900">{ticket.ticket_number}</h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">สร้างเมื่อ {formatDateTime(ticket.created_at)}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {canEdit && (
            <button className="btn-outline text-sm" onClick={() => navigate(`/tickets/${id}/edit`)}>
              ✏️ แก้ไข
            </button>
          )}
          {can(user, "gr", "admin") && ticket.status === "pending_gr" && (
            <Link to={`/gr/create?ticket_id=${ticket.id}`} className="btn-outline text-sm">
              📦 สร้าง GR
            </Link>
          )}
          {availableTransitions.map((s) => (
            <button
              key={s}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors
                ${["pending_cancel", "pending_donate"].includes(s)
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "btn-primary"}`}
              onClick={() => setModal({ open: true, target: s })}
            >
              {TRANSITION_LABELS[s] || s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper */}
      <Card className="overflow-x-auto">
        <StatusStepper status={ticket.status} channel={ticket.repair_channel} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลบริการ · Service Info</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="BU" value={ticket.bu} />
            <InfoRow label="ช่องทางซ่อม" value={channelLabel(ticket.repair_channel)} />
            <InfoRow label="พนักงาน" value={ticket.staff_name} />
            <InfoRow label="เบอร์พนักงาน" value={ticket.staff_phone} />
            <InfoRow label="รหัสแผนก" value={ticket.sub_dept_code} />
            <InfoRow label="วันที่" value={formatDate(ticket.ticket_date)} />
          </dl>
        </Card>

        {/* Customer */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลลูกค้า · Customer</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="ชื่อ" value={ticket.customer_name} />
            <InfoRow label="เบอร์โทร" value={ticket.customer_phone} />
            <InfoRow label="Email" value={ticket.customer_email} />
            <InfoRow label="เลขประกัน" value={ticket.warranty_no} />
          </dl>
        </Card>

        {/* Product */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลสินค้า · Product</h3>
          {ticket.image_url && (
            <img src={ticket.image_url} className="w-full h-32 object-cover rounded-lg mb-3" alt="Product" />
          )}
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="ประเภท" value={ticket.product_type} />
            <InfoRow label="แบรนด์" value={ticket.product_brand} />
            <InfoRow label="Serial No" value={ticket.serial_no} />
            <InfoRow label="ประเภทค่าใช้จ่าย" value={ticket.cost_type} />
            <InfoRow
              label="ค่าซ่อม"
              value={ticket.repair_cost_tbd ? "⏳ แจ้งภายหลัง" : ticket.repair_cost ? `฿${Number(ticket.repair_cost).toLocaleString()}` : null}
            />
          </dl>
          {ticket.repair_detail && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">รายละเอียดการซ่อม</p>
              <p className="text-sm">{ticket.repair_detail}</p>
            </div>
          )}
          {ticket.reject_reason && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-500 mb-1">เหตุผลปฏิเสธ</p>
              <p className="text-sm text-red-700">{ticket.reject_reason}</p>
            </div>
          )}
          {ticket.remark && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600 mb-1">หมายเหตุ</p>
              <p className="text-sm text-yellow-800">{ticket.remark}</p>
            </div>
          )}
        </Card>

        {/* Dates */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">วันที่ · Dates & Timing</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="วันที่สร้างตั๋ว" value={formatDate(ticket.ticket_date)} />
            <InfoRow label="วันที่เริ่มดำเนินการ" value={formatDate(ticket.processing_date)} />
            <InfoRow label="วันที่รับสินค้า" value={formatDate(ticket.pickup_date)} />
            <InfoRow label="สถานะเปลี่ยนล่าสุด" value={formatDateTime(ticket.status_changed_at)} />
          </dl>
        </Card>
      </div>

      {/* Status History */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">ประวัติสถานะ · Status History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">ยังไม่มีการเปลี่ยนสถานะ</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium">
                    {h.from_status ? `${statusLabel(h.from_status)} → ` : ""}
                    {statusLabel(h.to_status)}
                  </span>
                  {h.note && <span className="text-gray-500 ml-2">· {h.note}</span>}
                  <p className="text-xs text-gray-400">{formatDateTime(h.changed_at)} · {h.changed_by || "System"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transition Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, target: "" })}
        title={TRANSITION_LABELS[modal.target] || modal.target}
      >
        <div className="space-y-4">
          {["pending_cancel", "cancelled"].includes(modal.target) && (
            <div>
              <label className="label">เหตุผล *</label>
              <textarea className="input" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="ระบุเหตุผล..." />
            </div>
          )}
          <div>
            <label className="label">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-ghost" onClick={() => setModal({ open: false, target: "" })}>ยกเลิก</button>
            <button className="btn-primary" onClick={doTransition} disabled={transitioning}>
              {transitioning ? "กำลังอัปเดต..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
