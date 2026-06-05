export type RefreshTimingMode = "fixed" | "random";
export type RefreshUnit = "seconds" | "minutes" | "hours";
export type OverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type RefreshPreset = {
  id: string;
  label: string;
  value: number;
  unit: RefreshUnit;
};

export type RefreshConfig = {
  timingMode: RefreshTimingMode;
  intervalValue: number;
  intervalUnit: RefreshUnit;
  randomMinValue: number;
  randomMaxValue: number;
  randomUnit: RefreshUnit;
  hardReload: boolean;
  refreshLimit: number;
  showBadgeCountdown: boolean;
  showPageCountdown: boolean;
};

export type ExtensionSettings = {
  defaults: RefreshConfig;
  presets: RefreshPreset[];
  overlay: {
    position: OverlayPosition;
    compact: boolean;
  };
};

export type RefreshJob = RefreshConfig & {
  tabId: number;
  url?: string;
  title?: string;
  active: boolean;
  refreshCount: number;
  nextIntervalSeconds: number;
  remainingSeconds: number;
  startedAt: number;
  updatedAt: number;
  lastRefreshAt?: number;
};

export type RefreshRuntimeState = {
  jobs: RefreshJob[];
};

export type PopupSnapshot = {
  tabId?: number;
  url?: string;
  title?: string;
  settings: ExtensionSettings;
  job?: RefreshJob;
};

