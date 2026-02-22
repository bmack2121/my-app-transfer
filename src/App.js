import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Auth & Context
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketProvider";
import PrivateRoute from "./routes/PrivateRoute";

// ✅ Safety Layer
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";

// Components
import Navbar from "./components/Navbar";

// Public Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Unauthorized from "./pages/Unauthorized";

// Private Pages
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerPage from "./pages/CustomerPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import InventoryPage from "./pages/InventoryPage";
import InventoryDetailPage from "./pages/InventoryDetailPage";
import DealDeskPage from "./pages/DealDeskPage";
import TaskPage from "./pages/TaskPage";
import UserPage from "./pages/UserPage";
import FinancingBanksPage from "./pages/FinancingBanksPage";
import CarfaxPage from "./pages/CarfaxPage";
import VinScannerPage from "./pages/VinScannerPage";
import VinResultPage from "./pages/VinResultPage";
import LeaseCalculator from "./pages/LeaseCalculator";
import LeadIntakePage from "./pages/LeadIntakePage";

/* -------------------------------------------
 * ✅ FIX: Move static arrays OUTSIDE the component 
 * ----------------------------------------- */
const noNavbarPaths = [
  "/login", 
  "/register", 
  "/forgot-password", 
  "/reset-password", 
  "/vin-scanner", 
  "/vin-result",
  "/lead-intake"
];

/**
 * Layout: Handles "Edge-to-Edge" UI and Mobile Safe Areas.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Checks if current path starts with any of the restricted paths
  const isFullScreen = noNavbarPaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="layout-container min-h-screen flex flex-col overflow-x-hidden text-slate-50 bg-slate-950">
      {!isFullScreen && <Navbar />}
      
      <main 
        className="flex-grow flex flex-col"
        style={{
          // env(safe-area-inset-...) handles the iPhone Notch and Home Bar
          paddingTop: isFullScreen ? "0" : "calc(4.5rem + env(safe-area-inset-top, 0px))",
          paddingBottom: isFullScreen ? "0" : "env(safe-area-inset-bottom, 20px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)"
        }}
      > 
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      {/* V7 Future Flags handle React Router's upcoming breaking changes 
         to keep the console logs clean.
      */}
      <Router 
        future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}
      >
        <AuthProvider>
          {/* ✅ NOTE: If you are seeing "Invalid Namespace", 
             check the initialization URL inside SocketProvider!
          */}
          <SocketProvider>
            <Layout>
              <Routes>
                {/* Fallback to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin-control" element={<AdminDashboard />} />
                  <Route path="/lease-calculator" element={<LeaseCalculator />} />
                  
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/inventory/:id" element={<InventoryDetailPage />} />
                  
                  <Route path="/customers" element={<CustomerPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  
                  <Route path="/deals" element={<DealDeskPage />} />
                  <Route path="/tasks" element={<TaskPage />} />
                  <Route path="/team" element={<UserPage />} />
                  <Route path="/financing-banks" element={<FinancingBanksPage />} />
                  
                  {/* Immersive / Scanner Routes */}
                  <Route path="/lead-intake" element={<LeadIntakePage />} />
                  <Route path="/vin-scanner" element={<VinScannerPage />} />
                  <Route path="/vin-result/:vin" element={<VinResultPage />} />
                  <Route path="/carfax" element={<CarfaxPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;