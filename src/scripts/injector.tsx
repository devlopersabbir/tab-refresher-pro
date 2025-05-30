import { createRoot, Root } from "react-dom/client";
import ContentContainer from "./content-container.js";
import { Toaster } from "sonner";
import React from "react";

const container = document.createElement("div");
container.id = "container";
// style fixed position on the right side of the screen
container.style.position = "fixed";
container.style.bottom = "50";
container.style.right = "50px";
container.style.borderRadius = "0.25rem";
container.style.zIndex = "99";
// state variables
let root: Root;

function inject() {
  root = createRoot(container);
  document.body.appendChild(container);

  root.render(
    <React.StrictMode>
      <Toaster position="bottom-center" />
      <ContentContainer />
    </React.StrictMode>
  );
}

export function deject() {
  root.unmount();
}

export function main() {
  inject();
}
