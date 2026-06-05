import { RefreshConfig, RefreshPreset, RefreshUnit } from "../@types/refresh.js";
import { formatSeconds, secondsFrom } from "../services/refresh-storage.js";

const units: RefreshUnit[] = ["seconds", "minutes", "hours"];

type Props = {
  config: RefreshConfig;
  presets?: RefreshPreset[];
  onChange: (config: RefreshConfig) => void;
  compact?: boolean;
};

const numberValue = (value: string, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

export const RefreshForm = ({ config, presets = [], onChange, compact = false }: Props) => {
  const patch = (value: Partial<RefreshConfig>) => onChange({ ...config, ...value });
  const optionGrid = compact
    ? "grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  const wrapperSpacing = compact ? "space-y-3" : "space-y-4";
  const controlHeight = compact ? "h-9" : "h-10";
  const labelText = "text-[11px] font-bold uppercase tracking-wide text-zinc-500";

  return (
    <div className={wrapperSpacing}>
      <div className="grid grid-cols-2 gap-2 rounded-md bg-zinc-900/70 p-1">
        {(["fixed", "random"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => patch({ timingMode: mode })}
            className={`${compact ? "h-8 text-xs" : "h-9 text-sm"} rounded-md font-semibold transition ${
              config.timingMode === mode
                ? "bg-cyan-400 text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {mode === "fixed" ? "Fixed" : "Random"}
          </button>
        ))}
      </div>

      {config.timingMode === "fixed" ? (
        <div className="grid grid-cols-[1fr_130px] gap-2">
          <label className="space-y-1">
            <span className={labelText}>
              Interval
            </span>
            <input
              min={1}
              type="number"
              value={config.intervalValue}
              onChange={(event) =>
                patch({ intervalValue: Math.max(1, numberValue(event.target.value, 1)) })
              }
              className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
            />
          </label>
          <label className="space-y-1">
            <span className={labelText}>
              Unit
            </span>
            <select
              value={config.intervalUnit}
              onChange={(event) => patch({ intervalUnit: event.target.value as RefreshUnit })}
              className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_1fr_130px] gap-2">
          <label className="space-y-1">
            <span className={labelText}>
              Min
            </span>
            <input
              min={1}
              type="number"
              value={config.randomMinValue}
              onChange={(event) =>
                patch({ randomMinValue: Math.max(1, numberValue(event.target.value, 1)) })
              }
              className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
            />
          </label>
          <label className="space-y-1">
            <span className={labelText}>
              Max
            </span>
            <input
              min={1}
              type="number"
              value={config.randomMaxValue}
              onChange={(event) =>
                patch({ randomMaxValue: Math.max(1, numberValue(event.target.value, 1)) })
              }
              className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
            />
          </label>
          <label className="space-y-1">
            <span className={labelText}>
              Unit
            </span>
            <select
              value={config.randomUnit}
              onChange={(event) => patch({ randomUnit: event.target.value as RefreshUnit })}
              className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {presets.length > 0 ? (
        <div className={`grid grid-cols-4 ${compact ? "gap-1.5" : "gap-2"}`}>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                patch({
                  timingMode: "fixed",
                  intervalValue: preset.value,
                  intervalUnit: preset.unit,
                })
              }
              className={`${compact ? "min-h-8 px-1.5" : "min-h-9 px-2"} rounded-md border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:border-cyan-400 hover:text-cyan-300`}
              title={formatSeconds(secondsFrom(preset.value, preset.unit))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`grid gap-3 ${optionGrid}`}>
        {[
          ["hardReload", "Hard reload"],
          ["showBadgeCountdown", "Badge"],
          ["showPageCountdown", "Page timer"],
        ].map(([key, label]) => (
          <label
            key={key}
            className={`${compact ? "min-h-9 px-2 text-xs" : "min-h-11 px-3 text-sm"} flex min-w-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 text-zinc-200`}
          >
            <input
              type="checkbox"
              checked={Boolean(config[key as keyof RefreshConfig])}
              onChange={(event) => patch({ [key]: event.target.checked } as Partial<RefreshConfig>)}
              className="h-4 w-4 accent-cyan-400"
            />
            {label}
          </label>
        ))}
        <label className="space-y-1">
          <span className={labelText}>
            Limit
          </span>
          <input
            min={0}
            type="number"
            value={config.refreshLimit}
            onChange={(event) =>
              patch({ refreshLimit: Math.max(0, numberValue(event.target.value, 0)) })
            }
            className={`${controlHeight} w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400`}
          />
        </label>
      </div>
    </div>
  );
};
