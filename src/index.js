import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

// ✅ STEP 1: Import the PWA Elements loader
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import './index.css';         
import './styles/global.css';  
import App from './App';

/**
 * 🛠️ Native Initialization
 * Handles the "Edge-to-Edge" look for Android/iOS
 */
const initializeNativeApp = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Status Bar: Set to Dark (White text) for Slate-950 background
    await StatusBar.setStyle({ style: Style.Dark }).catch(console.warn);
    
    if (Capacitor.getPlatform() === 'android') {
      // Overlays allow the UI to sit behind the clock/battery icons
      await StatusBar.setOverlaysWebView({ overlay: true }).catch(console.warn);
      
      // ✅ STEP 2: Handle Android Navigation Bar (The bottom buttons)
      try {
        const navColor = '#020617'; // Matches Tailwind bg-slate-950
        
        // Using the recommended Capgo setBackgroundColor method
        if (NavigationBar.setBackgroundColor) {
          await NavigationBar.setBackgroundColor({ color: navColor });
          await NavigationBar.setButtonsColor({ dark: false }); // Ensure buttons are white
        }
      } catch (e) {
        console.warn("NavigationBar plugin error:", e);
      }
    }

    // 2. Lifecycle: Re-apply styles when the salesman returns to the app
    CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        StatusBar.setStyle({ style: Style.Dark }).catch(console.warn);
      }
    });

  } catch (err) {
    console.error("Native initialization failed:", err);
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // ✅ STEP 3: Register PWA Elements and start Native Init
  // This allows the camera modal to show up in browsers/webviews
  defineCustomElements(window);
  initializeNativeApp(); 
}