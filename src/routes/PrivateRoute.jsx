import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = () => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation(); // 📍 Capture current location

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        {/* Added 'border-blue-500' as a fallback if 'app-accent' isn't in tailwind.config */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 border-app-accent"></div>
      </div>
    );
  }

  // If not authenticated, send to login but save the 'from' path
  return auth.isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;