/**
 * plotly.js — Shared Plotly layout, config, and trace helpers.
 */
import { wavelengthToRGB } from './color';

export const baseLayout = {
  paper_bgcolor: '#0D1321',
  plot_bgcolor: '#0D1321',
  font: { family: 'Inter, system-ui, sans-serif', color: '#F0ECE3', size: 14 },
  xaxis: {
    gridcolor: '#1A2332',
    zerolinecolor: '#2A3442',
    title: { font: { size: 16 } },
    tickfont: { size: 13 },
  },
  yaxis: {
    gridcolor: '#1A2332',
    zerolinecolor: '#2A3442',
    title: { text: 'Normalized Intensity', font: { size: 16 } },
    tickfont: { size: 13 },
    range: [0, 1.05],
  },
  margin: { l: 65, r: 20, t: 40, b: 55 },
  showlegend: false,
};

export const plotConfig = {
  responsive: true,
  displayModeBar: false,
  staticPlot: false,
};

/**
 * Build a Plotly trace with wavelength-tinted color and fill.
 */
export function makeTrace(x, y, wavelengthNm, options = {}) {
  const rgb = wavelengthToRGB(wavelengthNm);
  const color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  return {
    x,
    y,
    type: 'scatter',
    mode: 'lines',
    line: { color, width: 2.5, ...options.line },
    fill: options.fill ?? 'tozeroy',
    fillcolor: options.fillcolor ?? `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`,
    ...options,
  };
}

/**
 * Merge overrides into the base layout (shallow per top-level key).
 */
export function mergeLayout(overrides = {}) {
  const merged = { ...baseLayout };
  for (const key of Object.keys(overrides)) {
    if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && baseLayout[key]) {
      merged[key] = { ...baseLayout[key], ...overrides[key] };
    } else {
      merged[key] = overrides[key];
    }
  }
  return merged;
}
