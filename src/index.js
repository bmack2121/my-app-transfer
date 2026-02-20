import React from 'react';
import ReactDOM from 'react-dom/client';
// ✅ FIX: Use forward slashes for scoped Capacitor plugins
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

import './index.css';         
import './styles/global.css';  
import App from './App';

const initializeNativeApp = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Set Status Bar Style immediately
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    
    if (Capacitor.getPlatform() === 'android') {
      // Immersive mode: allows app content to sit behind the status bar
      await StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      
      // Handle Capgo NavigationBar specifically
      try {
        const colorCfg = { color: '#020617' };
        // Check for both common naming conventions in v8
        if (NavigationBar.setBackgroundColor) {
          await NavigationBar.setBackgroundColor(colorCfg);
        } else if (NavigationBar.setbackgroundColor) {
          await NavigationBar.setbackgroundColor(colorCfg);
        }
      } catch (e) {
        console.warn("NavigationBar plugin failed to set color.");
      }
    }

    // 2. Lifecycle Listener: Ensures dark mode persists after multitasking
    await CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      }
    });

  } catch (err) {
    console.error("Native initialization sequence failed:", err);
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Fire and forget native init to avoid blocking the UI mount
  initializeNativeApp(); 

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}