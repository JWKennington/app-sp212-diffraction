/**
 * Monospace numeric readout with label and unit.
 */
export default function Readout({ label, value, unit }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-usna-muted text-sm">{label}:</span>
      <span className="font-mono text-lg text-usna-gold tabular-nums">{value}</span>
      <span className="text-usna-muted text-sm">{unit}</span>
    </div>
  );
}
