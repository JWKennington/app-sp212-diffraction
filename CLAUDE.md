# CLAUDE.md — Optical Diffraction Explorer

## Project Overview

An interactive web application for visualizing optical diffraction phenomena, built for the USNA Physics Department (SP212 — Electricity & Magnetism). Two deployment contexts:

1. **Live teaching demo** — projected from a laptop in Michelson 110 at USNA. ~20 sophomores, faculty observers including the hiring committee. Must be responsive, visually clear from the back of a lecture hall, and work offline or on localhost.
2. **Public educational tool** — hosted at a permanent URL (e.g., `jwkennington.com/diffraction/`) for students and educators.

All math is computed client-side. No server backend. Deploys as static files.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Build** | Vite | Fast dev server, tree-shaking, static output |
| **Framework** | React 18 | Component model for multi-page structure |
| **Routing** | react-router-dom v6 (`HashRouter`) | Client-side nav; hash routing works on any static host and file:// |
| **Styling** | Tailwind CSS | Utility-first, fast iteration, dark theme support |
| **Charts (1D plots)** | Plotly.js via `react-plotly.js` | Publication-quality scientific plots, labeled axes, hover tooltips |
| **2D rendering** | HTML5 Canvas | Pixel-level control for Airy disk images and screen-strip simulations |
| **Equations** | KaTeX (via `react-katex` or CDN) | Fast LaTeX rendering for key equations on each page |
| **Bessel function** | Hand-rolled J₁ (Abramowitz & Stegun) | Avoids importing all of math.js for one function |

### Why Plotly.js

- James already knows Plotly from his Dash apps — the JS API is familiar
- Publication-quality axis labels, gridlines, and tick formatting out of the box
- Supports `paper_bgcolor` / `plot_bgcolor` for seamless dark theme integration
- At ~1000–2000 points per curve, Plotly re-renders in <16ms — well within the 60fps budget
- `config: { responsive: true, displayModeBar: false }` gives clean presentation mode
- Built-in hover tooltips let students inspect exact intensity values

### Why Canvas for 2D Views

Plotly is overkill for pixel-level 2D intensity maps. The Airy disk and screen strips require iterating over pixels, computing intensity at each point, and writing to an ImageData buffer. Canvas is the fastest and most natural tool for this.

### HashRouter

**IMPORTANT:** Use `HashRouter`, not `BrowserRouter`. This ensures all routes work when deployed as static files to any host (GitHub Pages, Netlify, a subfolder on jwkennington.com) and when opened directly as `file://` URLs. BrowserRouter requires server-side redirect configuration.

---

## Visual Design — USNA Physics Branding

### Design Philosophy

The app should feel like it belongs at the Naval Academy — institutional, professional, technically serious. Draw inspiration from the USNA Physics Department website (`usna.edu/PhysicsDepartment/`): clean, structured, navy-and-gold palette, no playfulness. Think "observatory control room at a military institution," not "colorful educational toy."

### Color Palette

**Official USNA Colors (Pantone):**
```
Navy Blue:  #00205B  (PMS 281 C)
Gold:       #C5B783  (PMS 4525 C)
```

**Extended app palette:**
```
Page Background:     #001233   (deep navy, darker than official for screen contrast)
Nav Bar:             #00205B   (official USNA navy)
Card/Panel Bg:       #0A1628   (dark charcoal-navy)
Plot Background:     #0D1321   (very dark, maximizes curve visibility)
Gold Accent:         #C5B783   (slider thumbs, active nav, key annotations, highlights)
Gold Hover:          #D4C99E   (lighter gold for hover/active states)
Primary Text:        #F0ECE3   (warm white — easier on eyes than pure white on dark bg)
Secondary Text:      #8B8C8E   (cool gray — axis labels, descriptions, subtle info)
Grid Lines:          #1A2332   (barely visible, subtle structure)
Zero Lines:          #2A3442   (slightly brighter than grid)
Success (Resolved):  #27AE60
Warning (Rayleigh):  #C5B783   (gold — "just at the limit")
Error (Unresolved):  #C0392B
```

**Plot curve colors:**
- When λ is in the visible range (380–780nm), tint the intensity curve and fill with the actual wavelength color via a `wavelengthToRGB()` conversion. Red light produces wider patterns than blue light, and the color difference should be visible.
- For overlaid comparison curves: Gold (#C5B783) for envelope/reference, steel blue (#5B9BD5) for secondary traces.
- Dashed lines: Gold for diffraction envelopes, gray for annotations.

### Typography

```
Font Stack:   'Inter', system-ui, -apple-system, sans-serif
Headings:     Inter weight 600–700
Body:         Inter weight 400
Numerics:     'JetBrains Mono', 'Fira Code', monospace (slider readouts, computed values)
Equations:    KaTeX rendering
```

Load Inter from Google Fonts (or `@fontsource/inter` via npm). All text must be readable from the back of a classroom when projected at 1080p:
- Body text: minimum 16px
- Axis labels: minimum 14px  
- Slider value readouts: 18–20px, monospace, high contrast
- Page headings: 24–28px

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  Optical Diffraction Explorer    [Nav Links] │  ← Navy bg, gold accents
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌────────────────────────────┐   │
│  │  Controls     │  │  Main Plot (Plotly)         │   │
│  │  ────────     │  │                            │   │
│  │  Slit width   │  │                            │   │
│  │  [====●===]   │  │                            │   │
│  │  0.10 mm      │  │                            │   │
│  │              │  │                            │   │
│  │  Wavelength   │  ├────────────────────────────┤   │
│  │  [====●===]   │  │  Screen Strip (Canvas)     │   │
│  │  550 nm       │  ├────────────────────────────┤   │
│  │              │  │  2D View (Canvas, if appl.) │   │
│  │  Screen dist  │  └────────────────────────────┘   │
│  │  [====●===]   │                                   │
│  │  2.0 m        │  ┌────────────────────────────┐   │
│  │              │  │  Info Panel + Equation       │   │
│  │  [Reset]      │  │  (KaTeX + description)      │   │
│  └──────────────┘  └────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Built for SP212 · USNA Physics · J. Kennington     │  ← subtle footer
└─────────────────────────────────────────────────────┘
```

On narrow screens: stack controls above the plot. But optimize for 1920×1080 projected landscape (the primary use case).

### Nav Bar

- Fixed top, Navy background (#00205B)
- Gold text (#C5B783) for active page link, warm white (#F0ECE3) for inactive
- Subtle gold underline (2px) on active page
- Links: "Single Slit" | "Circular Aperture" | "Rayleigh Criterion" | "Double vs. Single" | "N-Slit Sandbox"
- Left side: optional logo (if provided) + app title "Optical Diffraction Explorer"

### Logo

The user may provide a USNA crest, physics department logo, or similar image file. If provided:
- Place in nav bar, left side, ~32px height, before the title
- Also consider placing in the footer

If not provided, omit entirely. The app should look complete without it.

### Slider Design

- **Track:** Rounded, Navy (#00205B) background, Gold (#C5B783) fill for the active (left-of-thumb) portion
- **Thumb:** Gold circle, at least 20px diameter, slight shadow for depth. On hover: lighter gold (#D4C99E)
- **Label:** Above the slider, Inter weight 500, warm white text
- **Value readout:** Inline to the right of the slider, monospace font (JetBrains Mono), 18px+, showing the current value with units
- **Continuous update:** Fire on every `input` event, not just `change`

---

## Pages / Visualizations

### Page 1: Single-Slit Diffraction Pattern

**Route:** `/single-slit` (also the default landing page at `/`)

**Physics:**
```
I(θ) = I₀ [sin(β) / β]²
where β = (π a sin θ) / λ

Minima at: a sin θ = mλ,  m = ±1, ±2, ±3, ...
Small-angle: sin θ ≈ y/L
```

**Controls:**
| Parameter | Symbol | Range | Default | Step | Unit |
|-----------|--------|-------|---------|------|------|
| Slit width | a | 0.01 – 1.00 | 0.10 | 0.01 | mm |
| Wavelength | λ | 380 – 780 | 550 | 1 | nm |
| Screen distance | L | 0.5 – 10.0 | 2.0 | 0.1 | m |

**Plotly trace:** `scatter` with `mode: 'lines'`, `fill: 'tozeroy'`, fillcolor = semi-transparent wavelength color. ~2000 sample points. X-axis: screen position y (mm). Y-axis: normalized intensity (0–1).

**Additional displays:**
- **Screen strip** (Canvas): ~full-width × 60px, mapping intensity to brightness in wavelength color
- **Annotations:** Plotly `shapes` (vertical dashed lines) at first 3 minima positions, labeled
- **Readouts:** Central max half-width y₁ = λL/a, first minimum angle θ₁ = λ/a (in mrad)
- **Equation:** KaTeX in info panel

### Page 2: Circular Aperture (Airy Pattern)

**Route:** `/circular-aperture`

**Physics:**
```
I(θ) = I₀ [2J₁(u) / u]²
where u = (π D sin θ) / λ

First dark ring: sin θ₁ = 1.22 λ / D
```

**Controls:**
| Parameter | Symbol | Range | Default | Step | Unit |
|-----------|--------|-------|---------|------|------|
| Aperture diameter | D | 0.05 – 5.00 | 1.00 | 0.05 | mm |
| Wavelength | λ | 380 – 780 | 550 | 1 | nm |
| Screen distance | L | 0.5 – 10.0 | 2.0 | 0.1 | m |

**Displays:**
- **Plotly 1D radial profile:** I(r) vs. r
- **Canvas 2D Airy disk:** ~400×400px. Pixel brightness = `airyIntensity(r)` × wavelength color. Concentric ring structure should be visually striking.
- **Readouts:** θ₁ = 1.22λ/D, first ring radius on screen r₁ = 1.22λL/D

### Page 3: Rayleigh Criterion

**Route:** `/rayleigh`

**Physics:**
```
θ_c = 1.22 λ / D

Combined: I(θ) = Airy(θ - Δθ/2) + Airy(θ + Δθ/2)
```

**Controls:**
| Parameter | Symbol | Range | Default | Step | Unit |
|-----------|--------|-------|---------|------|------|
| Aperture diameter | D | 0.1 – 10.0 | 2.0 | 0.1 | mm |
| Wavelength | λ | 380 – 780 | 550 | 1 | nm |
| Source separation | Δθ/θ_c | 0.2 – 3.0 | 1.0 | 0.05 | × θ_c |

Express separation as multiple of θ_c — students immediately see "Rayleigh limit = slider at 1.0."

**Displays:**
- **Plotly combined profile:** Bold summed trace + faint dashed individual Airy patterns
- **Canvas 2D:** Two overlapping Airy disks transitioning from one blob → two disks
- **Status badge:** "Unresolved" (red) | "Just Resolved — Rayleigh Limit" (gold) | "Well Resolved" (green)
- **Readouts:** θ_c, Δθ, dip depth ratio

### Page 4: Double-Slit vs. Single-Slit Comparison

**Route:** `/comparison`

**Physics:**
```
Interference only:  I = cos²(πd sinθ / λ)
Diffraction only:   I = [sin(β)/β]²
Combined:           I = [sin(β)/β]² × cos²(πd sinθ / λ)
```

**Controls:**
| Parameter | Symbol | Range | Default | Step | Unit |
|-----------|--------|-------|---------|------|------|
| Slit width | a | 0.01 – 0.50 | 0.08 | 0.01 | mm |
| Slit separation | d | 0.1 – 2.0 | 0.40 | 0.01 | mm |
| Wavelength | λ | 380 – 780 | 550 | 1 | nm |

**Displays:**
- **Three Plotly subplots** (vertically stacked, shared x-axis): interference / envelope / combined
- **Diffraction envelope** overlaid on combined plot as dashed Gold line
- **Missing orders** annotated where diffraction minima kill interference maxima
- **Readouts:** d/a ratio, number of fringes in central maximum (≈ 2d/a - 1)
- **Screen strip** for combined pattern

### Page 5: N-Slit Explorer / Sandbox

**Route:** `/sandbox`

**Physics:**
```
I = [sin(β)/β]² × [sin(Nψ/2) / sin(ψ/2)]² / N²

where β = (πa sinθ)/λ,  ψ = (πd sinθ)/λ
```

**Controls:**
| Parameter | Symbol | Range | Default | Step | Unit |
|-----------|--------|-------|---------|------|------|
| Number of slits | N | 1 – 20 | 2 | 1 | — |
| Slit width | a | 0.01 – 0.50 | 0.08 | 0.01 | mm |
| Slit separation | d | 0.1 – 2.0 | 0.40 | 0.01 | mm |
| Wavelength | λ | 380 – 780 | 550 | 1 | nm |

**Displays:**
- **Plotly plot:** N-slit pattern showing evolution from single slit (N=1) through double slit (N=2) to diffraction grating (N=20)
- **Screen strip**
- **Info text** explaining the transition

---

## Math Implementation

### Unit Convention

All physics functions take SI units internally (meters). Convert slider display values before calling:
```javascript
const a_m = sliderValue_mm * 1e-3;
const lambda_m = sliderValue_nm * 1e-9;
const L_m = sliderValue_m;
```

### Sinc function
```javascript
function sinc(x) {
  if (Math.abs(x) < 1e-10) return 1.0;
  return Math.sin(x) / x;
}
```

### Bessel J₁ — Abramowitz & Stegun §9.4.4 / §9.4.6

Implement the rational polynomial approximation with two ranges (|x| ≤ 3 and |x| > 3). Cross-check against known values:
- J₁(0) = 0
- J₁(1.8412) ≈ 0.5819 (first maximum)
- J₁(3.8317) ≈ 0 (first zero)
- J₁(7.0156) ≈ 0 (second zero)

### Wavelength to RGB

Use Dan Bruton's algorithm. Include intensity falloff at spectrum edges. Return white/gray for wavelengths outside the visible range.

### Key physics functions

```javascript
function singleSlitIntensity(y, a, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  return sinc(beta) ** 2;
}

function airyIntensity(r, D, lambda, L) {
  const sinTheta = r / Math.sqrt(r * r + L * L);
  const u = (Math.PI * D * sinTheta) / lambda;
  if (Math.abs(u) < 1e-10) return 1.0;
  return (2 * besselJ1(u) / u) ** 2;
}

function doubleSlitIntensity(y, a, d, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  const psi = (Math.PI * d * sinTheta) / lambda;
  return sinc(beta) ** 2 * Math.cos(psi) ** 2;
}

function nSlitIntensity(y, a, d, N, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  const psi = (Math.PI * d * sinTheta) / lambda;
  const diffraction = sinc(beta) ** 2;
  const sinNpsi = Math.sin(N * psi);
  const sinPsi = Math.sin(psi);
  const interference = Math.abs(sinPsi) < 1e-10
    ? N * N
    : (sinNpsi / sinPsi) ** 2;
  return diffraction * interference / (N * N);
}
```

---

## Plotly Configuration

### Shared layout defaults
```javascript
const baseLayout = {
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

const plotConfig = {
  responsive: true,
  displayModeBar: false,
  staticPlot: false,
};
```

### Intensity trace helper
```javascript
function makeTrace(x, y, wavelengthNm, options = {}) {
  const rgb = wavelengthToRGB(wavelengthNm);
  const color = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  return {
    x, y,
    type: 'scatter',
    mode: 'lines',
    line: { color, width: 2.5, ...options.line },
    fill: options.fill ?? 'tozeroy',
    fillcolor: options.fillcolor ?? `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`,
    ...options,
  };
}
```

---

## Canvas Notes

### Retina support
```javascript
function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
```

### 2D Airy disk
Render at ~400×400 display pixels. For each pixel: compute radial distance from center → `airyIntensity(r)` → multiply by wavelength RGB → write to ImageData. Use dirty flag to avoid re-rendering when parameters haven't changed.

### Screen strip
Full-width × 60px. Each column's pixel brightness = `intensity(x) × wavelengthRGB`. Gives the "what the pattern actually looks like on a distant screen" view.

---

## Testing

### Physics
- [ ] Central maxima all return 1.0
- [ ] Single-slit first minimum at y ≈ λL/a (within 1%)
- [ ] Airy first dark ring at r ≈ 1.22λL/D (within 1%)
- [ ] J₁(3.8317) ≈ 0 (within 1e-5)
- [ ] Rayleigh dip at Δθ = θ_c is ~74% of peak (within 2%)
- [ ] N-slit reduces correctly at N=1 and N=2
- [ ] Missing orders in double-slit at correct positions

### Behavior at extremes
- Very narrow slit → pattern spreads enormously
- Very wide slit → pattern collapses to sharp central peak
- Short λ (blue) → narrow pattern; long λ (red) → wide pattern

### Performance
- [ ] 60fps during continuous slider drag (Chrome DevTools)
- [ ] Airy disk 2D renders in <50ms at 400×400

### Cross-browser
- [ ] Chrome, Firefox, Safari
- [ ] Display scaling: 100%, 125%, 150%

### Deployment
- [ ] `npm run build` → working `dist/`
- [ ] `dist/index.html` works as `file://` URL
- [ ] All routes work via HashRouter

---

## Build & Deploy

```bash
npm run dev          # Dev server with HMR
npm run build        # Production → dist/
npx serve dist       # Local production preview
```

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
});
```

