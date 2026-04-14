/**
 * Sidebar wrapper for a group of sliders + reset button.
 */
export default function ControlPanel({ children, onReset }) {
  return (
    <div className="bg-usna-card border border-usna-grid rounded-lg p-5 min-w-[260px]">
      <h2 className="text-usna-gold text-sm font-semibold uppercase tracking-wider mb-4">
        Controls
      </h2>
      {children}
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 w-full py-2 rounded bg-usna-navy text-usna-text text-sm font-medium hover:bg-usna-gold hover:text-usna-deep transition-colors"
        >
          Reset Defaults
        </button>
      )}
    </div>
  );
}
