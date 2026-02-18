import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SalesRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) return <Navigate to="/login" />;

  // Allow: sales, manager, admin
  if (!["sales", "manager", "admin"].includes(auth.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default SalesRoute;