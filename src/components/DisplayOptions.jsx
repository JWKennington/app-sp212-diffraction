/**
 * Display options panel: lock x-axis, log y-scale, brightness (gamma).
 * Sits below the main controls in the ControlPanel.
 */
export default function DisplayOptions({
  lockAxis, onLockAxisChange,
  logScale, onLogScaleChange,
  gamma, onGammaChange,
}) {
  return (
    <div className="mt-5 pt-4 border-t border-usna-grid">
      <h3 className="text-usna-muted text-xs font-semibold uppercase tracking-wider mb-3">
        Display
      </h3>

      {onLockAxisChange && (
        <label className="flex items-center gap-2 mb-3 cursor-pointer text-sm text-usna-text">
          <input
            type="checkbox"
            checked={lockAxis}
            onChange={(e) => onLockAxisChange(e.target.checked)}
            className="accent-usna-gold w-4 h-4"
          />
          Lock x-axis range
        </label>
      )}

      {onLogScaleChange && (
        <label className="flex items-center gap-2 mb-3 cursor-pointer text-sm text-usna-text">
          <input
            type="checkbox"
            checked={logScale}
            onChange={(e) => onLogScaleChange(e.target.checked)}
            className="accent-usna-gold w-4 h-4"
          />
          Log intensity scale
        </label>
      )}

      {onGammaChange && (
        <div className="mb-2">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-usna-text text-sm">Brightness boost</span>
            <span className="font-mono text-sm text-usna-gold tabular-nums">
              {gamma.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={gamma}
            onInput={(e) => onGammaChange(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-usna-muted text-xs mt-1">
            Lower values reveal faint secondary maxima
          </p>
        </div>
      )}
    </div>
  );
}
