import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../utils/roleUtils";

const NAV = [
  { to: "/", label: "Dashboard", icon: "▦", roles: ["dsm", "admin"] },
  { to: "/tickets", label: "Tickets", icon: "🗒", roles: ["store_staff", "dsm", "admin"] },
  { to: "/gr", label: "Goods Return", icon: "↩", roles: ["store_staff", "dsm", "admin"] },
  { to: "/dc", label: "Damage Control", icon: "🔍", roles: ["dsm", "admin"] },
  { to: "/vendor/tickets", label: "My Tickets", icon: "🔧", roles: ["vendor"] },
  { to: "/reports", label: "Reports", icon: "📊", roles: ["dsm", "admin"] },
  { to: "/admin/users", label: "Users", icon: "👥", roles: ["admin"] },
  { to: "/admin/vendors", label: "Vendors", icon: "🏭", roles: ["admin"] },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AS</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Aftersales</p>
            <p className="text-xs text-gray-400">Repair & Alteration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.filter((n) => !n.roles || can(user, ...n.roles)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${isActive ? "bg-brand-red-light text-brand-red font-semibold" : "text-gray-600 hover:bg-gray-50"}`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
            {user?.full_name?.[0] || user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full btn-ghost text-sm text-left py-2">Sign out</button>
      </div>
    </div>
  );
}
