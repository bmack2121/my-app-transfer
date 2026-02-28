import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { App as CapApp } from '@capacitor/app';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (socketRef.current) return;

    // ✅ THE CLOUD FIX: Explicitly point to your Render backend
    const CLOUD_URL = "https://autosalespro-backend.onrender.com";
    
    // Grab URL from env or fallback to Render Cloud
    let rawUrl = process.env.REACT_APP_API_BASE_URL || CLOUD_URL;

    /* -------------------------------------------
     * ✅ THE "AUTO-CLEAN" LOGIC
     * Socket.io MUST NOT have /api at the end.
     * ----------------------------------------- */
    const SERVER_URL = rawUrl
      .replace(/\/+$/, "")      // Remove trailing slashes
      .replace(/\/api$/, "");   // Remove /api suffix for socket handshake
    
    console.log(`📡 VinPro Pulse Initializing: ${SERVER_URL}`);

    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'], 
      path: "/socket.io/", 
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20, // Increased for spotty dealership Wi-Fi/5G
      reconnectionDelay: 5000,
      withCredentials: true,
      timeout: 45000, // Higher timeout for Render "Cold Starts"
      forceNew: true 
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('🟢 VinPro Pulse Online:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Pulse Connection Error:', err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🟡 Pulse Offline. Reason:', reason);
      setIsConnected(false);
      
      // If the server kicked us (Render restart), try to get back in
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    /* -------------------------------------------
     * ✅ CAPACITOR LIFECYCLE (Mobile Optimization)
     * ----------------------------------------- */
    let appStateListener = null;

    const handleAppStateChange = (state) => {
      if (state.isActive) {
        console.log("🔄 App Focused: Waking Pulse...");
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      } else {
        // We keep the socket alive briefly, but eventually disconnect 
        // to save the iPhone's battery.
        console.log("💤 App Backgrounded: Sleeping Pulse...");
      }
    };

    const setupLifecycle = async () => {
      appStateListener = await CapApp.addListener('appStateChange', handleAppStateChange);
    };

    setupLifecycle();

    return () => {
      console.log("🧹 Tearing down Pulse connection...");
      if (appStateListener) {
        appStateListener.remove();
      }
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
      socketRef.current = null;
    };
  }, []); 

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {/* 🟢 Connectivity Status Indicator (Fixed to top of screen) */}
      <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2 pointer-events-none opacity-80 scale-90 sm:scale-100">
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
          isConnected 
            ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' 
            : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse'
        }`} />
        <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">
          {isConnected ? 'Pulse Live' : 'Reconnecting...'}
        </span>
      </div>
      {children}
    </SocketContext.Provider>
  );
};