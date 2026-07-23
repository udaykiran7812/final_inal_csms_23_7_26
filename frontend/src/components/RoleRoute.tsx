import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleRouteProps {
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // If user's role is not authorized, redirect to their home dashboard
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'DEPARTMENT_ADMIN') {
      return <Navigate to="/admin/tickets" replace />;
    } else if (role === 'STAFF') {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (role === 'FACULTY' || role === 'STUDENT') {
      return <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
