import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./app/App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(20, 20, 24, 0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(244,244,245,0.95)"
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

