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
    if (socketRef.current) return;

    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const fallbackIP = isLocalhost ? "192.168.0.73" : host; 
    
    // Grab the URL from env or fallback
    let rawUrl = process.env.REACT_APP_API_BASE_URL || `http://${fallbackIP}:5000`;

    /* -------------------------------------------
     * ✅ THE "AUTO-FIX" LOGIC
     * 1. Remove trailing slashes.
     * 2. Remove /api suffix (Socket.io fails with this).
     * ----------------------------------------- */
    const SERVER_URL = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");
    
    console.log(`📡 VinPro Pulse Attempting: ${SERVER_URL}`);

    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'], 
      path: "/socket.io/", 
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      withCredentials: true,
      timeout: 20000,
      forceNew: true 
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('🟢 VinPro Pulse Online:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Socket Connection Error:', err.message);
      // If you still see 'Invalid namespace', double check your backend path config
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🟡 Pulse Offline. Reason:', reason);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    /* -------------------------------------------
     * ✅ CAPACITOR LIFECYCLE
     * ----------------------------------------- */
    let appStateListener = null;

    const handleAppStateChange = ({ isActive }) => {
      if (isActive) {
        console.log("🔄 App Active: Reconnecting Pulse...");
        if (!newSocket.connected) newSocket.connect();
      } else {
        console.log("💤 App Backgrounded: Sleeping Pulse...");
        newSocket.disconnect();
      }
    };

    const setupLifecycle = async () => {
      appStateListener = await CapApp.addListener('appStateChange', handleAppStateChange);
    };

    setupLifecycle();

    return () => {
      console.log("🧹 Cleaning up Socket connection...");
      if (appStateListener) {
        appStateListener.then(l => l.remove());
      }
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []); 

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      <div className="fixed top-2 right-2 z-[9999] flex items-center gap-2 pointer-events-none select-none">
        <span className={`w-2 h-2 rounded-full transition-all duration-500 ${
          isConnected 
            ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
            : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
        }`} />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
          {isConnected ? 'Pulse Live' : 'Pulse Offline'}
        </span>
      </div>
      {children}
    </SocketContext.Provider>
  );
};