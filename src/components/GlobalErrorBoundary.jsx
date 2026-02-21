import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an analytics service here
    console.error("🚨 VinPro Critical UI Crash:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/"; // Force a clean reload
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-6">
            🛠️
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
            Engine Stall
          </h1>
          <p className="text-slate-500 max-w-xs mb-8 text-sm leading-relaxed">
            The UI encountered a data conflict it couldn't resolve. Don't worry, your inventory and leads are safe.
          </p>
          
          <button
            onClick={this.handleReset}
            className="w-full max-w-xs bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-[0.2em]"
          >
            Restart Engine
          </button>
          
          <p className="mt-8 text-[10px] text-slate-300 font-mono uppercase">
            Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default GlobalErrorBoundary;