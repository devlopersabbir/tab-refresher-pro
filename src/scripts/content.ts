import Browser from "webextension-polyfill";
import { UIStateMessageType } from "../@types/message.js";
import { formatSeconds } from "../services/refresh-storage.js";

const OVERLAY_ID = "tab-refresher-pro-countdown";

const positionStyles: Record<string, Partial<CSSStyleDeclaration>> = {
  "top-left": { top: "18px", left: "18px" },
  "top-right": { top: "18px", right: "18px" },
  "bottom-left": { bottom: "18px", left: "18px" },
  "bottom-right": { bottom: "18px", right: "18px" },
};

const removeOverlay = () => {
  document.getElementById(OVERLAY_ID)?.remove();
};

const ensureOverlay = () => {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) return existing;

  const element = document.createElement("div");
  element.id = OVERLAY_ID;
  document.documentElement.appendChild(element);
  return element;
};

const renderOverlay = (payload: Extract<UIStateMessageType, { type: "OVERLAY_UPDATE" }>["payload"]) => {
  const { job, settings } = payload;
  if (!job?.active || !job.showPageCountdown) {
    removeOverlay();
    return;
  }

  const element = ensureOverlay();
  const compact = settings.overlay.compact;
  const position = settings.overlay.position;

  element.textContent = compact
    ? formatSeconds(job.remainingSeconds)
    : `Next refresh ${formatSeconds(job.remainingSeconds)} (${job.refreshCount}${
        job.refreshLimit ? `/${job.refreshLimit}` : ""
      })`;

  Object.assign(element.style, {
    position: "fixed",
    zIndex: "2147483647",
    padding: compact ? "8px 10px" : "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(15, 23, 42, 0.18)",
    background: "rgba(15, 23, 42, 0.88)",
    color: "#f8fafc",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: compact ? "12px" : "13px",
    fontWeight: "700",
    lineHeight: "1",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.22)",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  Object.assign(element.style, {
    top: "",
    right: "",
    bottom: "",
    left: "",
    ...positionStyles[position],
  });
};

Browser.runtime.onMessage.addListener((message: unknown) => {
  const typedMessage = message as UIStateMessageType;
  if (typedMessage.type === "OVERLAY_UPDATE") {
    renderOverlay(typedMessage.payload);
  }
});
