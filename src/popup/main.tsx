import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import Popup from "./Popup.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster richColors position="top-center" />
    <Popup />
  </React.StrictMode>
);

