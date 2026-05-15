import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/tickets/TicketList";
import TicketCreate from "./pages/tickets/TicketCreate";
import TicketDetail from "./pages/tickets/TicketDetail";
import GRList from "./pages/gr/GRList";
import GRCreate from "./pages/gr/GRCreate";
import GRDetail from "./pages/gr/GRDetail";
import DCList from "./pages/dc/DCList";
import DCCreate from "./pages/dc/DCCreate";
import UserManagement from "./pages/admin/UserManagement";
import VendorManagement from "./pages/admin/VendorManagement";
import ReportExport from "./pages/reports/ReportExport";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              {/* Dashboard — DSM & Admin only */}
              <Route path="/" element={<ProtectedRoute roles={["dsm", "admin"]}><Dashboard /></ProtectedRoute>} />

              {/* Tickets — all roles can view */}
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/create" element={<ProtectedRoute roles={["pc", "admin"]}><TicketCreate /></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<TicketDetail />} />

              {/* Goods Return — GR, BDC, DSM, Admin */}
              <Route path="/gr" element={<ProtectedRoute roles={["gr", "bdc", "dsm", "admin"]}><GRList /></ProtectedRoute>} />
              <Route path="/gr/create" element={<ProtectedRoute roles={["gr", "admin"]}><GRCreate /></ProtectedRoute>} />
              <Route path="/gr/:id" element={<ProtectedRoute roles={["gr", "bdc", "dsm", "admin"]}><GRDetail /></ProtectedRoute>} />

              {/* Damage Control — BDC, DSM, Admin */}
              <Route path="/dc" element={<ProtectedRoute roles={["bdc", "dsm", "admin"]}><DCList /></ProtectedRoute>} />
              <Route path="/dc/create" element={<ProtectedRoute roles={["bdc", "admin"]}><DCCreate /></ProtectedRoute>} />

              {/* Reports — DSM, Admin */}
              <Route path="/reports" element={<ProtectedRoute roles={["dsm", "admin"]}><ReportExport /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/vendors" element={<ProtectedRoute roles={["admin"]}><VendorManagement /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/tickets" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
