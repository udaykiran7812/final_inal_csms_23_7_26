import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/auth/Login';

// Super Admin Pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import RoleManagement from '../pages/superadmin/RoleManagement';
import DepartmentManagement from '../pages/superadmin/DepartmentManagement';
import SlaManagement from '../pages/superadmin/SlaManagement';
import PriorityManagement from '../pages/superadmin/PriorityManagement';
import EscalationManagement from '../pages/superadmin/EscalationManagement';
import CalendarManagement from '../pages/superadmin/CalendarManagement';
import AuditLogManagement from '../pages/superadmin/AuditLogManagement';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStaff from '../pages/admin/Staff';
import AdminDepartments from '../pages/admin/Departments';
import AdminIssueCategories from '../pages/admin/IssueCategories';
import AdminRoles from '../pages/admin/Roles';
import AdminTickets from '../pages/admin/Tickets';
import AdminTicketDetails from '../pages/admin/TicketDetails';
import AssetManagement from '../pages/admin/AssetManagement';

// Staff Pages
import StaffDashboard from '../pages/staff/Dashboard';
import StaffMyTickets from '../pages/staff/MyTickets';
import StaffTicketDetails from '../pages/staff/TicketDetails';

// User Pages
import UserDashboard from '../pages/user/Dashboard';
import CreateTicket from '../pages/user/CreateTicket';
import MyTickets from '../pages/user/MyTickets';
import TicketDetails from '../pages/user/TicketDetails';

import { useAuth } from '../context/AuthContext';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              role === 'SUPER_ADMIN' ? (
                <Navigate to="/super-admin/dashboard" replace />
              ) : role === 'ADMIN' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : role === 'DEPARTMENT_ADMIN' ? (
                <Navigate to="/admin/tickets" replace />
              ) : role === 'STAFF' ? (
                <Navigate to="/staff/dashboard" replace />
              ) : (
                <Navigate to="/user/dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        
        {/* Super Admin Explicit Routes */}
        <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/users" element={<AdminUsers />} />
            <Route path="/super-admin/roles" element={<RoleManagement />} />
            <Route path="/super-admin/departments" element={<DepartmentManagement />} />
            <Route path="/super-admin/sla" element={<SlaManagement />} />
            <Route path="/super-admin/priorities" element={<PriorityManagement />} />
            <Route path="/super-admin/escalations" element={<EscalationManagement />} />
            <Route path="/super-admin/calendar" element={<CalendarManagement />} />
            <Route path="/super-admin/audit-logs" element={<AuditLogManagement />} />
          </Route>
        </Route>

        {/* Admin Configuration Routes */}
        <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DEPARTMENT_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/department/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/assets" element={<AssetManagement />} />
            <Route path="/admin/categories" element={<AdminIssueCategories />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
          </Route>
        </Route>

        {/* Ticket Operations Routes (Admin & Department Admin) */}
        <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DEPARTMENT_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/tickets/:id" element={<AdminTicketDetails />} />
          </Route>
        </Route>

        {/* Staff Routes */}
        <Route element={<RoleRoute allowedRoles={['STAFF']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/my-tickets" element={<StaffMyTickets />} />
            <Route path="/staff/tickets/:id" element={<StaffTicketDetails />} />
          </Route>
        </Route>

        {/* Faculty & Student User Routes */}
        <Route element={<RoleRoute allowedRoles={['FACULTY', 'STUDENT', 'USER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/create-ticket" element={<CreateTicket />} />
            <Route path="/user/my-tickets" element={<MyTickets />} />
            <Route path="/user/tickets/:id" element={<TicketDetails />} />
          </Route>
        </Route>

      </Route>

      {/* Fallback Redirect */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            role === 'SUPER_ADMIN' ? (
              <Navigate to="/super-admin/dashboard" replace />
            ) : role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : role === 'DEPARTMENT_ADMIN' ? (
              <Navigate to="/admin/tickets" replace />
            ) : role === 'STAFF' ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <Navigate to="/user/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};
export default AppRoutes;
