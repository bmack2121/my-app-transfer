import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ✅ Heroicons v24
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  HomeIcon,
  CheckCircleIcon,
  BanknotesIcon,
  DocumentMagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
  IdentificationIcon,
  QrCodeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

// ✅ Direct Capacitor Haptics
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useContext(AuthContext);

  const links = [
    { label: "Dashboard", icon: HomeIcon, path: "/dashboard" },
    { label: "Inventory", icon: CubeIcon, path: "/inventory" },
    { label: "VIN Scanner", icon: QrCodeIcon, path: "/vin-scanner" },
    { label: "Lead Intake", icon: IdentificationIcon, path: "/lead-intake" },
    { label: "Deal Desk", icon: ClipboardDocumentListIcon, path: "/deals" },
    { label: "CRM / Leads", icon: UserGroupIcon, path: "/customers" },
    { label: "Tasks", icon: CheckCircleIcon, path: "/tasks" },
    // ✅ Specifically verified path for the Banks page
    { label: "Banks", icon: BanknotesIcon, path: "/financing-banks" },
    { label: "Carfax", icon: DocumentMagnifyingGlassIcon, path: "/carfax" },
    { label: "Admin Control", icon: ShieldCheckIcon, path: "/admin-control" }
  ];

  const handleNavigation = async (path) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) { /* Web fallback */ }
    
    // ✅ Logic to ensure navigation triggers even if path is similar
    navigate(path);
    
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) { /* Web fallback */ }
    
    localStorage.removeItem("token");
    setAuth({ token: null, user: null, isAuthenticated: false });
    navigate("/login");
  };

  return (
    <>
      {/* 📱 Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* 🏗️ Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-[120] w-64 bg-slate-900 border-r border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out
        pt-safe pb-safe
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black italic text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">V</div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">
                Vin<span className="text-blue-500">Pro</span>
              </h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                Jason Lucas Vision v8.1
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {links.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group active:scale-95 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_10px_15px_-3px_rgba(37,99,235,0.4)]"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-500 hover:bg-rose-600/10 hover:text-rose-500 transition-all active:scale-95 group"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Exit Session
            </span>
          </button>
        </div>
      </aside>

      {/* Global CSS for the scrollbar to keep it sleek */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </>
  );
};

export default Sidebar;