import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppThemeProvider } from "./theme/AppThemeProvider.jsx";
import { AuthProvider } from "./state/AuthProvider.jsx";

console.log("Starting RentShield app...");

// Minimal fetch wrapper for debugging: allow localhost and known auth domains, forward other requests unchanged
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === "string") {
    // Allow local dev and common local addresses
    if (url.startsWith("http://localhost") || url.startsWith("https://localhost") || url.includes("127.0.0.1")) {
      return originalFetch.apply(this, args);
    }
    // If you have a real auth domain, add it here, for example: url.includes("your-auth-domain.com")
    // For all other URLs, forward the request to avoid breaking auth initialization
    return originalFetch.apply(this, args);
  }
  return originalFetch.apply(this, args);
};

// Keep global error handlers for visibility but do not swallow errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled rejection:', event.reason);
});
window.addEventListener('error', (event) => {
  console.warn('Global error:', event.message || event.error);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppThemeProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </AppThemeProvider>
);
