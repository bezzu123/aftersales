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
import VendorPortal from "./pages/vendor/VendorPortal";
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
              <Route path="/" element={<ProtectedRoute roles={["dsm", "admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/create" element={<ProtectedRoute roles={["store_staff","admin"]}><TicketCreate /></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/gr" element={<GRList />} />
              <Route path="/gr/create" element={<ProtectedRoute roles={["store_staff","admin"]}><GRCreate /></ProtectedRoute>} />
              <Route path="/gr/:id" element={<GRDetail />} />
              <Route path="/dc" element={<ProtectedRoute roles={["dsm","admin"]}><DCList /></ProtectedRoute>} />
              <Route path="/dc/create" element={<ProtectedRoute roles={["store_staff","admin"]}><DCCreate /></ProtectedRoute>} />
              <Route path="/vendor/tickets" element={<ProtectedRoute roles={["vendor"]}><VendorPortal /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute roles={["dsm","admin"]}><ReportExport /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/vendors" element={<ProtectedRoute roles={["admin"]}><VendorManagement /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
