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

const ROLE_NEXT_STATUSES = {
  store_staff: {
    draft: ["pending_gr", "sent_to_vendor", "cancelled"],
    pending_gr: ["gr_created"],
    repaired: ["ready_pickup", "pending_dc"],
    dc_created: ["ready_pickup"],
    ready_pickup: ["completed"],
    gr_created: ["sent_to_vendor"],
  },
  vendor: {
    sent_to_vendor: ["vendor_accepted", "vendor_rejected"],
    vendor_accepted: ["in_repair"],
    in_repair: ["repaired"],
  },
  admin: {
    draft: ["pending_gr", "sent_to_vendor", "cancelled"],
    pending_gr: ["gr_created", "cancelled"],
    gr_created: ["sent_to_vendor", "cancelled"],
    sent_to_vendor: ["vendor_accepted", "vendor_rejected"],
    vendor_accepted: ["in_repair"],
    vendor_rejected: ["pending_gr", "cancelled"],
    in_repair: ["repaired"],
    repaired: ["ready_pickup", "pending_dc"],
    pending_dc: ["dc_created"],
    dc_created: ["ready_pickup", "cancelled"],
    ready_pickup: ["completed"],
  },
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
      toast("Status updated", "success");
      setModal({ open: false, target: "" });
      setNote(""); setRejectReason("");
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Transition failed", "error");
    } finally {
      setTransitioning(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (!ticket) return <div className="text-center py-16 text-gray-400">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate("/tickets")} className="text-sm text-gray-400 hover:text-gray-600 mb-1">← Back to Tickets</button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono text-gray-900">{ticket.ticket_number}</h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Created {formatDateTime(ticket.created_at)}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {can(user, "store_staff", "admin") && ticket.status === "draft" && (
            <button className="btn-outline text-sm" onClick={() => navigate(`/tickets/${id}/edit`)}>Edit</button>
          )}
          {can(user, "store_staff", "admin") && ["pending_gr", "gr_created"].includes(ticket.status) && (
            <Link to={`/gr/create?ticket_id=${ticket.id}`} className="btn-outline text-sm">Create GR</Link>
          )}
          {availableTransitions.map((s) => (
            <button key={s} className="btn-primary text-sm" onClick={() => setModal({ open: true, target: s })}>
              → {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper */}
      <Card className="overflow-x-auto">
        <StatusStepper status={ticket.status} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Staff & Service */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Service Info</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="BU" value={ticket.bu} />
            <InfoRow label="Repair Channel" value={ticket.repair_channel} />
            <InfoRow label="Staff Name" value={ticket.staff_name} />
            <InfoRow label="Staff Phone" value={ticket.staff_phone} />
            <InfoRow label="Sub Dept" value={ticket.sub_dept_code} />
            <InfoRow label="Date" value={formatDate(ticket.ticket_date)} />
          </dl>
        </Card>

        {/* Customer */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Customer</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="Name" value={ticket.customer_name} />
            <InfoRow label="Phone" value={ticket.customer_phone} />
            <InfoRow label="Email" value={ticket.customer_email} />
            <InfoRow label="Warranty No" value={ticket.warranty_no} />
          </dl>
        </Card>

        {/* Product */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
          {ticket.image_url && (
            <img src={ticket.image_url} className="w-full h-32 object-cover rounded-lg mb-3" alt="Product" />
          )}
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="Type" value={ticket.product_type} />
            <InfoRow label="Brand" value={ticket.product_brand} />
            <InfoRow label="Serial No" value={ticket.serial_no} />
            <InfoRow label="Cost Type" value={ticket.cost_type} />
            <InfoRow label="Repair Cost" value={ticket.repair_cost ? `฿${ticket.repair_cost}` : null} />
          </dl>
          {ticket.repair_detail && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Repair Detail</p>
              <p className="text-sm">{ticket.repair_detail}</p>
            </div>
          )}
          {ticket.reject_reason && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-500 mb-1">Reject Reason</p>
              <p className="text-sm text-red-700">{ticket.reject_reason}</p>
            </div>
          )}
        </Card>

        {/* Dates */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Dates & Timing</h3>
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow label="Ticket Date" value={formatDate(ticket.ticket_date)} />
            <InfoRow label="Processing Date" value={formatDate(ticket.processing_date)} />
            <InfoRow label="Pickup Date" value={formatDate(ticket.pickup_date)} />
            <InfoRow label="Status Changed" value={formatDateTime(ticket.status_changed_at)} />
          </dl>
        </Card>
      </div>

      {/* Status History */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No status changes yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium">{h.from_status ? `${h.from_status} → ` : ""}{h.to_status}</span>
                  {h.note && <span className="text-gray-500 ml-2">· {h.note}</span>}
                  <p className="text-xs text-gray-400">{formatDateTime(h.changed_at)} · {h.changed_by || "System"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transition Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, target: "" })} title={`Move to: ${modal.target?.replace(/_/g, " ")}`}>
        <div className="space-y-4">
          {modal.target === "vendor_rejected" && (
            <div>
              <label className="label">Reject Reason *</label>
              <textarea className="input" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why the ticket is rejected..." />
            </div>
          )}
          <div>
            <label className="label">Note (optional)</label>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-ghost" onClick={() => setModal({ open: false, target: "" })}>Cancel</button>
            <button className="btn-primary" onClick={doTransition} disabled={transitioning}>
              {transitioning ? "Updating..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
