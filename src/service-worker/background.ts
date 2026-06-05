import Browser from "webextension-polyfill";
import { UIStateMessageType } from "../@types/message.js";
import { RefreshConfig, RefreshJob } from "../@types/refresh.js";
import { CreateMessageResolver } from "../resolvers/message-resolver.js";
import {
  defaultSettings,
  getNextIntervalSeconds,
  jobsStorage,
  normalizeJob,
  normalizeConfig,
  normalizeSettings,
  removeJob,
  settingsStorage,
  upsertJob,
} from "../services/refresh-storage.js";

const { addResolver } = CreateMessageResolver<UIStateMessageType>();

type TimerState = {
  countdownId: ReturnType<typeof setInterval>;
  refreshId: ReturnType<typeof setTimeout>;
  job: RefreshJob;
};

const tabStates = new Map<number, TimerState>();

const getSettings = async () => normalizeSettings((await settingsStorage.value()) ?? defaultSettings);
const getJobs = async () =>
  ((await jobsStorage.value()) ?? [])
    .map((job) => normalizeJob(job))
    .filter((job): job is RefreshJob => Boolean(job));

const badgeText = (seconds: number) => {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
  return `${Math.max(0, seconds)}`;
};

const setIdleBadge = async (tabId: number) => {
  await Browser.action.setBadgeText({ text: "", tabId });
  await Browser.action.setBadgeBackgroundColor({ color: "#64748b", tabId });
};

const publishJob = async (job: RefreshJob) => {
  const settings = await getSettings();

  if (job.showBadgeCountdown) {
    await Browser.action.setBadgeText({
      text: badgeText(job.remainingSeconds),
      tabId: job.tabId,
    });
    await Browser.action.setBadgeBackgroundColor({
      color: "#059669",
      tabId: job.tabId,
    });
  } else {
    await Browser.action.setBadgeText({ text: "", tabId: job.tabId });
  }

  Browser.tabs
    .sendMessage(job.tabId, {
      type: "OVERLAY_UPDATE",
      payload: { job, settings },
    })
    .catch(() => undefined);
};

const stopRefresh = async (tabId: number, remove = false) => {
  const state = tabStates.get(tabId);
  if (state) {
    clearInterval(state.countdownId);
    clearTimeout(state.refreshId);
    tabStates.delete(tabId);
  }

  const jobs = await getJobs();
  const job = jobs.find((item) => item.tabId === tabId);

  if (remove) {
    await removeJob(tabId);
  } else if (job) {
    await upsertJob({ ...job, active: false, remainingSeconds: 0, updatedAt: Date.now() });
  }

  await setIdleBadge(tabId);
  const settings = await getSettings();
  Browser.tabs
    .sendMessage(tabId, {
      type: "OVERLAY_UPDATE",
      payload: { job: undefined, settings },
    })
    .catch(() => undefined);
};

const scheduleRefresh = async (job: RefreshJob) => {
  const activeJob = { ...job, active: true, updatedAt: Date.now() };

  try {
    await Browser.tabs.get(activeJob.tabId);
  } catch {
    await removeJob(activeJob.tabId);
    return;
  }

  if (tabStates.has(activeJob.tabId)) {
    const state = tabStates.get(activeJob.tabId)!;
    clearInterval(state.countdownId);
    clearTimeout(state.refreshId);
  }

  await upsertJob(activeJob);
  await publishJob(activeJob);

  const countdownId = setInterval(async () => {
    const state = tabStates.get(activeJob.tabId);
    if (!state) return;

    state.job = {
      ...state.job,
      remainingSeconds: Math.max(0, state.job.remainingSeconds - 1),
      updatedAt: Date.now(),
    };
    tabStates.set(activeJob.tabId, state);
    await publishJob(state.job);
  }, 1000);

  const runRefresh = async () => {
    const state = tabStates.get(activeJob.tabId);
    if (!state) return;

    try {
      await Browser.tabs.reload(activeJob.tabId, {
        bypassCache: state.job.hardReload,
      });

      const nextIntervalSeconds = getNextIntervalSeconds(state.job);
      const refreshCount = state.job.refreshCount + 1;
      const updatedJob: RefreshJob = {
        ...state.job,
        refreshCount,
        nextIntervalSeconds,
        remainingSeconds: nextIntervalSeconds,
        lastRefreshAt: Date.now(),
        updatedAt: Date.now(),
      };

      await upsertJob(updatedJob);
      state.job = updatedJob;

      if (updatedJob.refreshLimit > 0 && refreshCount >= updatedJob.refreshLimit) {
        await stopRefresh(activeJob.tabId);
        return;
      }

      state.refreshId = setTimeout(runRefresh, nextIntervalSeconds * 1000);
      tabStates.set(activeJob.tabId, state);
      await publishJob(updatedJob);
    } catch {
      await stopRefresh(activeJob.tabId, true);
    }
  };

  const refreshId = setTimeout(runRefresh, activeJob.nextIntervalSeconds * 1000);

  tabStates.set(activeJob.tabId, { countdownId, refreshId, job: activeJob });
};

const startRefresh = async (payload: {
  tabId: number;
  url?: string;
  title?: string;
  config: RefreshConfig;
}) => {
  const config = normalizeConfig(payload.config);
  const nextIntervalSeconds = getNextIntervalSeconds(config);
  const existingJob = (await getJobs()).find((job) => job.tabId === payload.tabId);
  const job: RefreshJob = {
    ...config,
    tabId: payload.tabId,
    url: payload.url,
    title: payload.title,
    active: true,
    refreshCount: existingJob?.refreshCount ?? 0,
    nextIntervalSeconds,
    remainingSeconds: nextIntervalSeconds,
    startedAt: existingJob?.startedAt ?? Date.now(),
    updatedAt: Date.now(),
    lastRefreshAt: existingJob?.lastRefreshAt,
  };

  await scheduleRefresh(job);
  return job;
};

const saveTabConfig = async (payload: {
  tabId: number;
  url?: string;
  title?: string;
  config: RefreshConfig;
}) => {
  const config = normalizeConfig(payload.config);
  const existingJob = (await getJobs()).find((job) => job.tabId === payload.tabId);
  const nextIntervalSeconds = getNextIntervalSeconds(config);
  const job: RefreshJob = {
    ...config,
    tabId: payload.tabId,
    url: payload.url,
    title: payload.title,
    active: false,
    refreshCount: existingJob?.refreshCount ?? 0,
    nextIntervalSeconds,
    remainingSeconds: 0,
    startedAt: existingJob?.startedAt ?? Date.now(),
    updatedAt: Date.now(),
    lastRefreshAt: existingJob?.lastRefreshAt,
  };

  await upsertJob(job);
  await setIdleBadge(payload.tabId);
  return job;
};

const getActiveTab = async () => {
  const [tab] = await Browser.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const getSnapshot = async () => {
  const tab = await getActiveTab();
  const settings = await getSettings();
  const job = tab?.id ? (await getJobs()).find((item) => item.tabId === tab.id) : undefined;

  return {
    tabId: tab?.id,
    url: tab?.url,
    title: tab?.title,
    settings,
    job: tab?.id ? tabStates.get(tab.id)?.job ?? job : undefined,
  };
};

const restoreJobs = async () => {
  const jobs = await getJobs();
  await Promise.all(
    jobs
      .filter((job) => job.active)
      .map((job) => {
        const nextIntervalSeconds = getNextIntervalSeconds(job);
        return scheduleRefresh({
          ...job,
          nextIntervalSeconds,
          remainingSeconds: nextIntervalSeconds,
          updatedAt: Date.now(),
        });
      })
  );
};

addResolver("GET_POPUP_SNAPSHOT", getSnapshot);
addResolver("START_REFRESH", (payload) => startRefresh(payload));
addResolver("STOP_REFRESH", async (payload) => {
  await stopRefresh(payload.tabId);
  return getSnapshot();
});
addResolver("SAVE_TAB_CONFIG", async (payload) => saveTabConfig(payload));
addResolver("REFRESH_ONCE", async (payload) => {
  await Browser.tabs.reload(payload.tabId, { bypassCache: payload.hardReload });
  return getSnapshot();
});
addResolver("SAVE_SETTINGS", async (payload) => {
  const settings = normalizeSettings(payload);
  await settingsStorage.set(settings);
  return settings;
});
addResolver("CLEAR_JOBS", async () => {
  await Promise.all([...tabStates.keys()].map((tabId) => stopRefresh(tabId, true)));
  await jobsStorage.set([]);
  return getSnapshot();
});

Browser.tabs.onRemoved.addListener((tabId) => {
  stopRefresh(tabId, true);
});

Browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await settingsStorage.set(defaultSettings);
  }
  await restoreJobs();
});

Browser.runtime.onStartup.addListener(restoreJobs);
restoreJobs();
