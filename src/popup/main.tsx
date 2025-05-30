import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEle = document.querySelector("#root");
if (!rootEle) {
  console.info("body tag not found!");
} else {
  ReactDOM.createRoot(rootEle!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
