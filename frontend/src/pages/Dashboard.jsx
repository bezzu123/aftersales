import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../components/ui/Card";
import { getSummary, getRepairTime, getStatusAging } from "../api/dashboard";
import { statusShort, statusColor, channelLabel } from "../utils/statusUtils";
import { formatDateTime } from "../utils/dateUtils";

const PIE_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#c8102e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

function KPICard({ label, value, sub, color = "text-gray-900", alert = false }) {
  return (
    <Card className={`flex flex-col gap-1 ${alert && value > 0 ? "border-orange-300 bg-orange-50" : ""}`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color} ${alert && value > 0 ? "text-orange-600" : ""}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </Card>
  );
}

function AlertCard({ label, value, icon, color = "bg-white" }) {
  if (value === 0) return null;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${value > 5 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-xl font-bold ${value > 5 ? "text-red-600" : "text-orange-600"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [repairTime, setRepairTime] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getRepairTime(), getStatusAging()])
      .then(([s, r, a]) => {
        setSummary(s.data);
        setRepairTime(r.data);
        setAging(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลด...</div>;

  const alerts = summary?.alerts || {};
  const statusPie = Object.entries(summary?.by_status || {}).map(([name, value]) => ({ name: statusShort(name), value }));
  const channelPie = Object.entries(summary?.by_channel || {}).map(([name, value]) => ({ name: channelLabel(name), value }));

  const repairChartData = repairTime.map((r) => ({
    name: channelLabel(r.channel),
    วันเฉลี่ย: r.avg_days,
    จำนวน: r.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">ภาพรวมบริการซ่อม · Repair & Alteration Overview</p>
      </div>

      {/* Alert Banners */}
      {(alerts.pending_gr_count > 0 || alerts.pending_bdc_count > 0 || alerts.re_repair_count > 0 || alerts.pending_approval_count > 0) && (
        <div>
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">⚠️ รายการต้องดำเนินการ · Action Required</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <AlertCard icon="📦" label="รอส่ง GR" value={alerts.pending_gr_count} />
            <AlertCard icon="🚚" label="รอ BDC รับ" value={alerts.pending_bdc_count} />
            <AlertCard icon="🔧" label="กับ Vendor" value={alerts.sent_vendor_count} />
            <AlertCard icon="🛍️" label="รอลูกค้ารับ" value={alerts.repaired_pickup_count} />
            <AlertCard icon="🔄" label="ซ่อมซ้ำ" value={alerts.re_repair_count} />
            <AlertCard icon="⏳" label="รออนุมัติ DSM" value={alerts.pending_approval_count} />
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="ตั๋วทั้งหมด · Total" value={summary?.total} />
        <KPICard label="กำลังดำเนินการ" value={
          (summary?.by_status?.waiting_repair || 0) +
          (summary?.by_status?.sent_vendor || 0) +
          (summary?.by_status?.pending_gr || 0) +
          (summary?.by_status?.pending_bdc || 0) +
          (summary?.by_status?.received_bdc || 0)
        } color="text-indigo-600" />
        <KPICard label="เสร็จสิ้น · Completed" value={summary?.by_status?.completed || 0} color="text-green-600" />
        <KPICard label="ยกเลิก · Cancelled" value={summary?.by_status?.cancelled || 0} color="text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">สถานะตั๋ว · Status Distribution</h3>
          {statusPie.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Repair Time by Channel */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">เวลาซ่อมเฉลี่ย · Avg Repair Days by Channel</h3>
          {repairChartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">ยังไม่มีข้อมูล</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={repairChartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="วันเฉลี่ย" fill="#c8102e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Aging Table */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">ตั๋วค้างนาน · Tickets Aging in Current Status</h3>
        {aging.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">✅ ทุกรายการเรียบร้อย</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 font-medium text-gray-500">เลขตั๋ว</th>
                  <th className="pb-2 font-medium text-gray-500">ช่องทาง</th>
                  <th className="pb-2 font-medium text-gray-500">สถานะ</th>
                  <th className="pb-2 font-medium text-gray-500">วันที่เปลี่ยน</th>
                  <th className="pb-2 font-medium text-gray-500">วันค้าง</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-brand-red font-semibold">{r.ticket_number}</td>
                    <td className="py-2 text-xs text-gray-500">{channelLabel(r.channel)}</td>
                    <td className="py-2">
                      <span className={`badge ${statusColor(r.status)}`}>{statusShort(r.status)}</span>
                    </td>
                    <td className="py-2 text-gray-500">{formatDateTime(r.since)}</td>
                    <td className={`py-2 font-semibold ${r.days_in_status > 7 ? "text-red-600" : r.days_in_status > 3 ? "text-orange-500" : "text-gray-700"}`}>
                      {r.days_in_status}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
