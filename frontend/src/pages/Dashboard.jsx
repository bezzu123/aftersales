import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "../components/ui/Card";
import { getSummary, getRepairTime, getVendorPerformance, getStatusAging } from "../api/dashboard";
import { statusLabel, statusColor } from "../utils/statusUtils";
import { formatDateTime } from "../utils/dateUtils";

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

function KPICard({ label, value, sub, color = "text-gray-900" }) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </Card>
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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const statusPie = Object.entries(summary?.by_status || {}).map(([name, value]) => ({ name: statusLabel(name), value }));
  const buPie = Object.entries(summary?.by_bu || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Repair & Alteration Service Overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Tickets" value={summary?.total} />
        <KPICard label="In Progress" value={summary?.by_status?.in_repair || 0} color="text-orange-600" />
        <KPICard label="Completed" value={summary?.by_status?.completed || 0} color="text-green-600" />
        <KPICard label="Cancelled" value={summary?.by_status?.cancelled || 0} color="text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Repair Time by Vendor */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Avg Repair Days by Vendor</h3>
          {repairTime.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={repairTime}>
                <XAxis dataKey="vendor_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg_days" fill="#c8102e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Status Aging Table */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Tickets Aging in Current Status</h3>
        {aging.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">All caught up!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 font-medium text-gray-500">Ticket</th>
                  <th className="pb-2 font-medium text-gray-500">Status</th>
                  <th className="pb-2 font-medium text-gray-500">Since</th>
                  <th className="pb-2 font-medium text-gray-500">Days</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs">{r.ticket_number}</td>
                    <td className="py-2"><span className={`badge ${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                    <td className="py-2 text-gray-500">{formatDateTime(r.since)}</td>
                    <td className={`py-2 font-semibold ${r.days_in_status > 7 ? "text-red-600" : "text-gray-700"}`}>
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
