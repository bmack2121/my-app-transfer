import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { App as CapApp } from '@capacitor/app';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // ✅ FIX: Use dynamic host detection to prevent IP mismatch
    const host = window.location.hostname;
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || `http://${host}:5000`;
    
    console.log(`📡 Attempting Socket connection to: ${SERVER_URL}`);

    const newSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      // ✅ FIX: Force websocket first to avoid the 'interrupted' upgrade error in Firefox
      transports: ['websocket', 'polling'], 
      // Ensure credentials match your server.js CORS setup
      withCredentials: true,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('🟢 VinPro Pulse Online:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔴 Socket Connection Error:', err.message);
      // If websocket fails, it will automatically try polling because of our transports array
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🟡 Pulse Offline. Reason:', reason);
      setIsConnected(false);
      
      // If the server kicked us (io server disconnect), we manually reconnect
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    // ✅ MOBILE OPTIMIZATION: Lifecycle management
    const setupLifecycle = async () => {
      const appStateListener = await CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          if (!newSocket.connected) {
            console.log("🔄 App Active: Re-syncing Pulse...");
            newSocket.connect();
          }
        } else {
          console.log("💤 App Backgrounded: Sleeping Pulse...");
          newSocket.disconnect();
        }
      });
      return appStateListener;
    };

    const listenerPromise = setupLifecycle();

    return () => {
      listenerPromise.then(l => l.remove());
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {/* ✅ Bonus: Connection Status Dot */}
      <div className="fixed top-2 right-2 z-[9999] flex items-center gap-2 pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 animate-pulse'}`} />
        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      {children}
    </SocketContext.Provider>
  );
};