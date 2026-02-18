import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { MdDashboard, MdOutlineContactPhone } from "react-icons/md";
import { FaCarSide, FaClipboardList, FaUserTie, FaUniversity, FaFileAlt, FaUserPlus } from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { AiOutlineScan } from "react-icons/ai";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { setAuth } = useContext(AuthContext);
  useDarkMode();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // 1. Physical feedback for the salesman
      try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {}

      // 2. Wipe storage
      localStorage.removeItem('token');
      localStorage.removeItem('user'); 

      // 3. Reset React Context
      setAuth({ user: null, token: null, isAuthenticated: false });

      // 4. Force hard-reload to Login to clear all sensitive cache
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = '/login'; // Fallback
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard /> },
    { name: 'Inventory', path: '/inventory', icon: <FaCarSide /> },
    { name: 'Deals', path: '/deals', icon: <RiMoneyDollarCircleFill /> },
    { name: 'VIN Scan', path: '/vin-scanner', icon: <AiOutlineScan /> },
    { name: 'Leads', path: '/lead-intake', icon: <FaUserPlus /> },
    { name: 'CRM', path: '/customers', icon: <MdOutlineContactPhone /> },
  ];

  const adminLinks = [
    { name: 'Tasks', path: '/tasks', icon: <FaClipboardList /> },
    { name: 'Banks', path: '/financing-banks', icon: <FaUniversity /> },
    { name: 'Carfax', path: '/carfax', icon: <FaFileAlt /> },
    { name: 'Team', path: '/team', icon: <FaUserTie /> },
  ];

  const NavItem = ({ link, isMobile = false }) => {
    const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
    
    return (
      <Link
        to={link.path}
        onClick={async () => {
          if (isMobile) setOpen(false);
          try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
        }}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="text-base">{link.icon}</span>
        {link.name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6">
      {/* Safe Area Inset Top for Mobile Status Bars */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

        {/* Branding */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 font-black italic transition-transform group-active:scale-90">
            V
          </div>
          <span className="font-heading text-lg font-black tracking-tighter text-white uppercase italic">
            VIN<span className="text-blue-500">PRO</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map(link => <NavItem key={link.path} link={link} />)}
          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          {adminLinks.map(link => <NavItem key={link.path} link={link} />)}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="hidden md:block text-[9px] font-black uppercase text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-colors"
          >
            Exit Session
          </button>

          <button
            className="xl:hidden text-white text-xl p-2.5 bg-slate-900 rounded-xl border border-white/5 active:scale-90 transition-transform"
            onClick={async () => {
              setOpen(!open);
              try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
            }}
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Mega-Menu */}
      {open && (
        <div className="xl:hidden fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top,0px))] bg-slate-950 border-b border-white/10 p-6 shadow-2xl animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {[...navLinks, ...adminLinks].map(link => (
              <NavItem key={link.path} link={link} isMobile={true} />
            ))}
            <button
              onClick={handleLogout}
              className="col-span-2 mt-6 p-5 bg-rose-600/10 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-rose-500/20 active:bg-rose-600/20 transition-all"
            >
              Terminate Session
            </button>
          </div>
          {/* Ensure space for bottom home bars */}
          <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;