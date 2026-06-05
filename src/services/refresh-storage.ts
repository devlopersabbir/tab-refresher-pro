import {
  ExtensionSettings,
  RefreshConfig,
  RefreshJob,
  RefreshPreset,
} from "../@types/refresh.js";
import { StorageService } from "./storage-service.js";

export const secondsFrom = (value: number, unit: RefreshConfig["intervalUnit"]) => {
  const safeValue = Math.max(1, Math.floor(Number(value) || 1));
  if (unit === "hours") return safeValue * 60 * 60;
  if (unit === "minutes") return safeValue * 60;
  return safeValue;
};

export const formatSeconds = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const defaultRefreshConfig: RefreshConfig = {
  timingMode: "fixed",
  intervalValue: 30,
  intervalUnit: "seconds",
  randomMinValue: 20,
  randomMaxValue: 60,
  randomUnit: "seconds",
  hardReload: false,
  refreshLimit: 0,
  showBadgeCountdown: true,
  showPageCountdown: true,
};

export const defaultSettings: ExtensionSettings = {
  defaults: defaultRefreshConfig,
  presets: [
    { id: "5s", label: "5 sec", value: 5, unit: "seconds" },
    { id: "30s", label: "30 sec", value: 30, unit: "seconds" },
    { id: "2m", label: "2 min", value: 2, unit: "minutes" },
    { id: "5m", label: "5 min", value: 5, unit: "minutes" },
  ],
  overlay: {
    position: "bottom-right",
    compact: false,
  },
};

export const settingsStorage = new StorageService<ExtensionSettings>(
  "trp_settings",
  defaultSettings
);

export const jobsStorage = new StorageService<RefreshJob[]>("trp_jobs", []);

export const normalizeConfig = (config: Partial<RefreshConfig> = {}): RefreshConfig => {
  const merged = { ...defaultRefreshConfig, ...config };
  const min = Math.max(1, Math.floor(Number(merged.randomMinValue) || 1));
  const max = Math.max(min, Math.floor(Number(merged.randomMaxValue) || min));

  return {
    ...merged,
    intervalValue: Math.max(1, Math.floor(Number(merged.intervalValue) || 1)),
    randomMinValue: min,
    randomMaxValue: max,
    refreshLimit: Math.max(0, Math.floor(Number(merged.refreshLimit) || 0)),
  };
};

export const normalizeSettings = (
  settings: Partial<ExtensionSettings> = {}
): ExtensionSettings => ({
  defaults: normalizeConfig(settings.defaults),
  presets:
    Array.isArray(settings.presets) && settings.presets.length > 0
      ? settings.presets
          .filter((preset): preset is RefreshPreset =>
            Boolean(preset?.id && preset.label && preset.value && preset.unit)
          )
          .map((preset) => ({
            ...preset,
            value: Math.max(1, Math.floor(Number(preset.value) || 1)),
          }))
      : defaultSettings.presets,
  overlay: {
    ...defaultSettings.overlay,
    ...(settings.overlay ?? {}),
  },
});

export const normalizeJob = (job: Partial<RefreshJob>): RefreshJob | undefined => {
  if (typeof job.tabId !== "number") return undefined;
  const config = normalizeConfig(job);
  const nextIntervalSeconds = Math.max(
    1,
    Math.floor(Number(job.nextIntervalSeconds) || getNextIntervalSeconds(config))
  );

  return {
    ...config,
    tabId: job.tabId,
    url: job.url,
    title: job.title,
    active: Boolean(job.active),
    refreshCount: Math.max(0, Math.floor(Number(job.refreshCount) || 0)),
    nextIntervalSeconds,
    remainingSeconds: Math.max(
      0,
      Math.floor(Number(job.remainingSeconds) || nextIntervalSeconds)
    ),
    startedAt: Number(job.startedAt) || Date.now(),
    updatedAt: Number(job.updatedAt) || Date.now(),
    lastRefreshAt: job.lastRefreshAt,
  };
};

export const getNextIntervalSeconds = (config: RefreshConfig) => {
  const normalized = normalizeConfig(config);
  if (normalized.timingMode === "random") {
    const min = secondsFrom(normalized.randomMinValue, normalized.randomUnit);
    const max = secondsFrom(normalized.randomMaxValue, normalized.randomUnit);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return secondsFrom(normalized.intervalValue, normalized.intervalUnit);
};

export const upsertJob = async (job: RefreshJob) => {
  const jobs = (await jobsStorage.value()) ?? [];
  await jobsStorage.set([job, ...jobs.filter((item) => item.tabId !== job.tabId)]);
};

export const removeJob = async (tabId: number) => {
  const jobs = (await jobsStorage.value()) ?? [];
  await jobsStorage.set(jobs.filter((job) => job.tabId !== tabId));
};
