import React from "react";
// ✅ Updated Router with Future Flags to clear console warnings
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Auth & Context
import { AuthProvider } from "./context/AuthContext"; 
// ✅ FIX: Imported the global mobile-optimized socket provider
import { SocketProvider } from "./context/SocketProvider"; 
import PrivateRoute from "./routes/PrivateRoute";

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
// ✅ FIX: Pointed to the newly created detail page with the Media Uploader
import InventoryDetailPage from "./pages/InventoryDetailPage"; 
import DealDeskPage from "./pages/DealDeskPage";
import TaskPage from "./pages/TaskPage";
import UserPage from "./pages/UserPage";
import FinancingBanksPage from "./pages/FinancingBanksPage";
import CarfaxPage from "./pages/CarfaxPage";
import VinScannerPage from "./pages/VinScannerPage";
import VinResultPage from "./pages/VinResultPage"; 
import LeaseCalculator from "./pages/LeaseCalculator"; 
import LeadIntakePage from './pages/LeadIntakePage';

/**
 * Layout: Handles "Edge-to-Edge" UI and Mobile Safe Areas.
 * Integrates Global Logout behavior for shared devices.
 */
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Routes that should be immersive (Camera, Forms, Login)
  const noNavbarPaths = [
    "/login", 
    "/register", 
    "/forgot-password", 
    "/reset-password", 
    "/vin-scanner", 
    "/vin-result",
    "/lead-intake"
  ];
  
  const isFullScreen = noNavbarPaths.some((path) => location.pathname.startsWith(path));

  return (
    // ✅ FIX: Added 'layout-container' so the global.css can force this transparent during scanning
    <div className={`layout-container min-h-screen flex flex-col overflow-x-hidden text-slate-50 transition-colors ${isFullScreen ? 'bg-transparent' : 'bg-slate-950'}`}>
      {!isFullScreen && <Navbar />}
      
      <main 
        className="flex-grow flex flex-col"
        style={{
          // Immersive view removes all padding for viewfinder coverage
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
    <AuthProvider>
      {/* ✅ FIX: Wrapped the Router in the SocketProvider so all pages can receive live updates */}
      <SocketProvider>
        {/* Enabling Future Flags to resolve React Router v6 deprecation warnings */}
        <Router 
          future={{ 
            v7_startTransition: true, 
            v7_relativeSplatPath: true 
          }}
        >
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin-control" element={<AdminDashboard />} />
                <Route path="/lease-calculator" element={<LeaseCalculator />} />
                
                <Route path="/inventory" element={<InventoryPage />} />
                {/* ✅ FIX: Mapped to the correct Inventory Detail component */}
                <Route path="/inventory/:id" element={<InventoryDetailPage />} />
                
                <Route path="/customers" element={<CustomerPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                
                <Route path="/deals" element={<DealDeskPage />} />
                <Route path="/tasks" element={<TaskPage />} />
                <Route path="/team" element={<UserPage />} />
                <Route path="/financing-banks" element={<FinancingBanksPage />} />
                
                <Route path="/lead-intake" element={<LeadIntakePage />} />
                <Route path="/vin-scanner" element={<VinScannerPage />} />
                <Route path="/vin-result/:vin" element={<VinResultPage />} />
                <Route path="/carfax" element={<CarfaxPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;