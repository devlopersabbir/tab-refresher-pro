import Browser from "webextension-polyfill";
import {
  Activity,
  Download,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExtensionSettings,
  OverlayPosition,
  RefreshPreset,
  RefreshUnit,
} from "../@types/refresh.js";
import { Button } from "../components/ui/button.js";
import { RefreshForm } from "../components/refresh-form.js";
import { useStorage } from "../hooks/useStorage.js";
import {
  defaultSettings,
  formatSeconds,
  jobsStorage,
  normalizeJob,
  normalizeSettings,
  secondsFrom,
  settingsStorage,
} from "../services/refresh-storage.js";

const units: RefreshUnit[] = ["seconds", "minutes", "hours"];
const positions: { label: string; value: OverlayPosition }[] = [
  { label: "Top left", value: "top-left" },
  { label: "Top right", value: "top-right" },
  { label: "Bottom left", value: "bottom-left" },
  { label: "Bottom right", value: "bottom-right" },
];

const Setting = () => {
  const [settings, setSettings] = useStorage(settingsStorage);
  const [jobs, setJobs] = useStorage(jobsStorage);
  const [draft, setDraft] = useState<ExtensionSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);
  const [draftPreset, setDraftPreset] = useState<RefreshPreset>({
    id: "",
    label: "",
    value: 30,
    unit: "seconds",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dirty) setDraft(normalizeSettings(settings ?? defaultSettings));
  }, [dirty, settings]);

  const sortedJobs = useMemo(
    () =>
      [...(jobs ?? [])]
        .map((job) => normalizeJob(job))
        .filter((job) => Boolean(job))
        .sort((a, b) => b!.updatedAt - a!.updatedAt),
    [jobs]
  );

  const updateDraft = (next: ExtensionSettings) => {
    setDraft(normalizeSettings(next));
    setDirty(true);
  };

  const persistSettings = async (next = draft) => {
    const normalized = normalizeSettings(next);
    await setSettings(normalized);
    await Browser.runtime.sendMessage({ type: "SAVE_SETTINGS", payload: normalized });
    setDraft(normalized);
    setDirty(false);
    toast.success("Settings saved");
  };

  const addPreset = () => {
    const label = draftPreset.label.trim();
    if (!label || draftPreset.value <= 0) {
      toast.error("Preset needs a label and a positive value");
      return;
    }

    updateDraft({
      ...draft,
      presets: [
        ...draft.presets,
        {
          ...draftPreset,
          id: draftPreset.id || `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          label,
          value: Math.max(1, Math.floor(Number(draftPreset.value) || 1)),
        },
      ],
    });
    setDraftPreset({ id: "", label: "", value: 30, unit: "seconds" });
  };

  const removePreset = (id: string) => {
    updateDraft({ ...draft, presets: draft.presets.filter((preset) => preset.id !== id) });
  };

  const stopJob = async (tabId: number) => {
    await Browser.runtime.sendMessage({ type: "STOP_REFRESH", payload: { tabId } });
    setJobs(((await jobsStorage.value()) ?? []).filter(Boolean));
  };

  const removeJob = async (tabId: number) => {
    await stopJob(tabId);
    const nextJobs = ((await jobsStorage.value()) ?? []).filter((job) => job.tabId !== tabId);
    await setJobs(nextJobs);
  };

  const clearJobs = async () => {
    await Browser.runtime.sendMessage({ type: "CLEAR_JOBS", payload: {} });
    await setJobs([]);
    toast.success("All jobs cleared");
  };

  const exportSettings = () => {
    const data = JSON.stringify({ settings: draft, jobs: jobs ?? [] }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tab-refresher-pro-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = async (file?: File) => {
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const nextSettings = normalizeSettings(parsed.settings);
      await setSettings(nextSettings);
      await Browser.runtime.sendMessage({ type: "SAVE_SETTINGS", payload: nextSettings });
      if (Array.isArray(parsed.jobs)) await setJobs(parsed.jobs);
      setDraft(nextSettings);
      setDirty(false);
      toast.success("Settings imported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resetSettings = () => {
    updateDraft(defaultSettings);
    toast.info("Defaults staged. Save to apply.");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Settings2 className="h-4 w-4" />
              Tab Refresher Pro
            </div>
            <h1 className="mt-2 text-2xl font-bold">Settings</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Configure defaults, presets, overlays, and saved tab jobs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportSettings} variant="outline" className="border-zinc-700 bg-zinc-950">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => fileRef.current?.click()}
              variant="outline"
              className="border-zinc-700 bg-zinc-950"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={resetSettings} variant="outline" className="border-zinc-700 bg-zinc-950">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={() => persistSettings()}
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
            >
              <Save className="h-4 w-4" />
              {dirty ? "Save Changes" : "Saved"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => importSettings(event.target.files?.[0])}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <section className="space-y-5">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Default Refresh Profile</h2>
                <p className="text-sm text-zinc-400">
                  New popup jobs inherit this profile until the user changes it.
                </p>
              </div>
            </div>
            <RefreshForm
              config={draft.defaults}
              presets={draft.presets}
              onChange={(defaults) => updateDraft({ ...draft, defaults })}
            />
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="text-lg font-bold">Page Countdown Overlay</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Position
                </span>
                <select
                  value={draft.overlay.position}
                  onChange={(event) =>
                    updateDraft({
                      ...draft,
                      overlay: {
                        ...draft.overlay,
                        position: event.target.value as OverlayPosition,
                      },
                    })
                  }
                  className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  {positions.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={draft.overlay.compact}
                  onChange={(event) =>
                    updateDraft({
                      ...draft,
                      overlay: { ...draft.overlay, compact: event.target.checked },
                    })
                  }
                  className="h-4 w-4 accent-cyan-400"
                />
                Compact page countdown
              </label>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
            <h2 className="text-lg font-bold">Presets</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_88px_112px_44px]">
              <input
                value={draftPreset.label}
                onChange={(event) => setDraftPreset({ ...draftPreset, label: event.target.value })}
                placeholder="Label"
                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
              />
              <input
                min={1}
                type="number"
                value={draftPreset.value}
                onChange={(event) =>
                  setDraftPreset({
                    ...draftPreset,
                    value: Math.max(1, Math.floor(Number(event.target.value) || 1)),
                  })
                }
                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
              />
              <select
                value={draftPreset.unit}
                onChange={(event) =>
                  setDraftPreset({ ...draftPreset, unit: event.target.value as RefreshUnit })
                }
                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <Button onClick={addPreset} className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {draft.presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold">{preset.label}</p>
                    <p className="text-xs text-zinc-400">
                      {formatSeconds(secondsFrom(preset.value, preset.unit))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePreset(preset.id)}
                    className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-rose-300"
                    title="Remove preset"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Activity className="h-4 w-4 text-cyan-300" />
                Saved Jobs
              </h2>
              <Button variant="outline" onClick={clearJobs} className="border-zinc-700 bg-zinc-950">
                Clear
              </Button>
            </div>

            <div className="space-y-2">
              {sortedJobs.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
                  No saved refresh jobs yet.
                </p>
              ) : (
                sortedJobs.map((job) => (
                  <div key={job!.tabId} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {job!.title || job!.url || `Tab ${job!.tabId}`}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{job!.url}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          job!.active ? "bg-cyan-400 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {job!.active ? "Active" : "Stopped"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-400">
                      <span>{formatSeconds(job!.nextIntervalSeconds)}</span>
                      <span>{job!.refreshCount} runs</span>
                      <span>{job!.hardReload ? "Hard" : "Normal"}</span>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => stopJob(job!.tabId)}
                        className="border-zinc-700 bg-zinc-900"
                      >
                        Stop
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeJob(job!.tabId)}
                        className="border-zinc-700 bg-zinc-900 text-rose-200"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Setting;

