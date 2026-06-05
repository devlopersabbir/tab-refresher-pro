import Browser from "webextension-polyfill";
import { Pause, Play, RefreshCw, Settings, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PopupSnapshot, RefreshConfig } from "../@types/refresh.js";
import { Button } from "../components/ui/button.js";
import { RefreshForm } from "../components/refresh-form.js";
import {
  defaultRefreshConfig,
  formatSeconds,
  normalizeConfig,
  normalizeSettings,
} from "../services/refresh-storage.js";

const Popup = () => {
  const [snapshot, setSnapshot] = useState<PopupSnapshot>();
  const [config, setConfig] = useState<RefreshConfig>(defaultRefreshConfig);
  const [busy, setBusy] = useState(false);
  const dirtyRef = useRef(false);
  const hydratedTabRef = useRef<number | undefined>(undefined);

  const active = Boolean(snapshot?.job?.active);
  const title = snapshot?.title || snapshot?.url || "Current tab";
  const settings = snapshot?.settings;

  const loadSnapshot = async () => {
    const next = (await Browser.runtime.sendMessage({
      type: "GET_POPUP_SNAPSHOT",
      payload: {},
    })) as PopupSnapshot;
    const normalized = { ...next, settings: normalizeSettings(next.settings) };

    setSnapshot(normalized);
    if (!dirtyRef.current || hydratedTabRef.current !== normalized.tabId) {
      setConfig(normalizeConfig(normalized.job ?? normalized.settings.defaults));
      dirtyRef.current = false;
      hydratedTabRef.current = normalized.tabId;
    }
  };

  useEffect(() => {
    loadSnapshot();
    const id = window.setInterval(loadSnapshot, 1000);
    return () => window.clearInterval(id);
  }, []);

  const statusText = useMemo(() => {
    if (!snapshot?.job?.active) return "Ready";
    return `Next in ${formatSeconds(snapshot.job.remainingSeconds)}`;
  }, [snapshot?.job]);

  const run = async (action: "start" | "stop" | "once" | "save") => {
    if (!snapshot?.tabId) {
      toast.error("No active tab found");
      return;
    }

    setBusy(true);
    try {
      if (action === "start") {
        await Browser.runtime.sendMessage({
          type: "START_REFRESH",
          payload: {
            tabId: snapshot.tabId,
            url: snapshot.url,
            title: snapshot.title,
            config: normalizeConfig(config),
          },
        });
        dirtyRef.current = false;
        toast.success("Refresh job started");
      }

      if (action === "save") {
        await Browser.runtime.sendMessage({
          type: "SAVE_TAB_CONFIG",
          payload: {
            tabId: snapshot.tabId,
            url: snapshot.url,
            title: snapshot.title,
            config: normalizeConfig(config),
          },
        });
        dirtyRef.current = false;
        toast.success("Tab profile saved");
      }

      if (action === "stop") {
        await Browser.runtime.sendMessage({
          type: "STOP_REFRESH",
          payload: { tabId: snapshot.tabId },
        });
        dirtyRef.current = false;
        toast.success("Refresh job stopped");
      }

      if (action === "once") {
        await Browser.runtime.sendMessage({
          type: "REFRESH_ONCE",
          payload: { tabId: snapshot.tabId, hardReload: config.hardReload },
        });
      }

      await loadSnapshot();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const openOptions = () => Browser.runtime.openOptionsPage();

  return (
    <main className="w-[420px] max-w-[100vw] bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Zap className="h-4 w-4" />
              Tab Refresher Pro
            </div>
            <h1 className="mt-2 truncate text-base font-bold" title={title}>
              {title}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{statusText}</p>
          </div>
          <button
            type="button"
            onClick={openOptions}
            className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:border-cyan-400 hover:text-cyan-300"
            title="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {snapshot?.job ? (
          <div className="grid grid-cols-3 gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-center">
            <div>
              <p className="text-lg font-bold text-white">{snapshot.job.refreshCount}</p>
              <p className="text-xs text-zinc-400">Refreshes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {snapshot.job.refreshLimit || "Unlimited"}
              </p>
              <p className="text-xs text-zinc-400">Limit</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {formatSeconds(snapshot.job.nextIntervalSeconds)}
              </p>
              <p className="text-xs text-zinc-400">Interval</p>
            </div>
          </div>
        ) : null}

        <RefreshForm
          compact
          config={config}
          presets={settings?.presets}
          onChange={(next) => {
            dirtyRef.current = true;
            setConfig(next);
          }}
        />

        <div className="grid grid-cols-3 gap-2">
          <Button
            disabled={busy}
            onClick={() => run(active ? "stop" : "start")}
            className={
              active
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
            }
          >
            {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {active ? "Stop" : "Start"}
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => run("save")}
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
          >
            Save
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => run("once")}
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Once
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Popup;
