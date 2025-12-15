import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found. Ensure index.html has <div id=\"root\"></div>");
}
createRoot(rootEl).render(
  <React.StrictMode>
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      <App />
    </div>
  </React.StrictMode>
);
