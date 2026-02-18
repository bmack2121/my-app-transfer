import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ManagerRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) return <Navigate to="/login" />;

  // Allow: manager, admin
  if (auth.role !== "manager" && auth.role !== "admin") {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ManagerRoute;