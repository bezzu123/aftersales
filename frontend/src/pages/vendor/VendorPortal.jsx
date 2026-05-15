import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listVendorTickets, acceptTicket, rejectTicket, updateRepairStatus } from "../../api/vendors";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../utils/dateUtils";

export default function VendorPortal() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, ticketId: null });
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  function load() {
    return listVendorTickets().then((r) => setTickets(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAccept(ticketId) {
    setProcessing(true);
    try {
      await acceptTicket(ticketId);
      toast("Ticket accepted", "success");
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return toast("Please provide a reject reason", "warning");
    setProcessing(true);
    try {
      await rejectTicket(rejectModal.ticketId, rejectReason);
      toast("Ticket rejected", "success");
      setRejectModal({ open: false, ticketId: null });
      setRejectReason("");
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setProcessing(false);
    }
  }

  async function handleStatus(ticketId, status) {
    setProcessing(true);
    try {
      await updateRepairStatus(ticketId, status);
      toast("Status updated", "success");
      load();
    } catch (e) {
      toast(e.response?.data?.detail || "Failed", "error");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-sm text-gray-500">Tickets assigned to your account</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">🔧</p>
          <p>No tickets assigned to you</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-brand-red">{t.ticket_number}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm text-gray-700">{t.customer_name} — {t.product_type} {t.product_brand}</p>
                <p className="text-xs text-gray-400">{formatDate(t.ticket_date)}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {t.status === "sent_to_vendor" && (
                  <>
                    <button className="btn-primary text-xs" onClick={() => handleAccept(t.id)} disabled={processing}>Accept</button>
                    <button className="btn-outline text-xs" onClick={() => setRejectModal({ open: true, ticketId: t.id })} disabled={processing}>Reject</button>
                  </>
                )}
                {t.status === "vendor_accepted" && (
                  <button className="btn-primary text-xs" onClick={() => handleStatus(t.id, "in_repair")} disabled={processing}>Start Repair</button>
                )}
                {t.status === "in_repair" && (
                  <button className="btn-primary text-xs" onClick={() => handleStatus(t.id, "repaired")} disabled={processing}>Mark Repaired</button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, ticketId: null })} title="Reject Ticket">
        <div className="space-y-4">
          <div>
            <label className="label">Reason for rejection *</label>
            <textarea className="input" rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this ticket cannot be accepted..." />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-ghost" onClick={() => setRejectModal({ open: false, ticketId: null })}>Cancel</button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm" onClick={handleReject} disabled={processing}>
              {processing ? "..." : "Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
