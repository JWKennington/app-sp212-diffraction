/**
 * Reusable slider with label, value readout, and USNA styling.
 */
export default function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-usna-text text-sm font-medium">{label}</label>
        <span className="font-mono text-lg text-usna-gold tabular-nums">
          {value} <span className="text-sm text-usna-muted">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
