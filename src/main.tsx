import React from "react";
import ReactDOM from "react-dom/client";
import Setting from "./settings/Setting.js";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster />
    <Setting />
  </React.StrictMode>
);
