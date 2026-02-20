import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { App as CapApp } from '@capacitor/app';

// Create the Context
const SocketContext = createContext();

// Custom hook for easy access in your components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Initialize the Socket
    // Uses your environment variable, falling back to your local test IP
    const SERVER_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000";
    
    const newSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Polling fallback is crucial for mobile networks that block raw WebSockets
      transports: ['websocket', 'polling'], 
    });

    // 2. Standard Connection Listeners
    newSocket.on('connect', () => {
      console.log('🟢 VinPro Socket Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('🔴 VinPro Socket Disconnected. Reason:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // 3. The Magic: Capacitor Lifecycle Hooks
    // This tells the socket to shut down cleanly when the app goes to the background,
    // and immediately reconnect when the salesman opens the app again.
    const appStateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log("App Foregrounded: Reconnecting Socket...");
        if (newSocket && !newSocket.connected) {
          newSocket.connect();
        }
      } else {
        console.log("App Backgrounded: Suspending Socket...");
        if (newSocket && newSocket.connected) {
          // Disconnect gracefully so the Node server doesn't hold a ghost connection
          newSocket.disconnect();
        }
      }
    });

    // 4. Cleanup on Unmount
    return () => {
      appStateListener.then(listener => listener.remove());
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};