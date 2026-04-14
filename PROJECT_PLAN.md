# PROJECT_PLAN.md — Optical Diffraction Explorer

## Summary

Interactive web app for exploring optical diffraction, branded for the USNA Physics Department. Five visualization pages, dark navy-and-gold theme, Plotly.js charts, Canvas for 2D renders. Deploys as static files.

**Primary deadline:** Teaching demo at USNA, **April 21, 2026**.

---

## Architecture

```
diffraction-app/
├── index.html                       # Vite entry
├── package.json
├── vite.config.js                   # base: './' for static deploy
├── tailwind.config.js               # USNA color palette, Inter font
├── postcss.config.js
├── public/
│   ├── favicon.svg                  # Simple optics/wave icon in USNA navy
│   └── usna-logo.png               # USNA crest (if provided by user)
├── src/
│   ├── main.jsx                     # React root + HashRouter
│   ├── App.jsx                      # Layout wrapper + route definitions
│   ├── index.css                    # Tailwind directives + Inter import + custom slider styles
│   │
│   ├── lib/
│   │   ├── physics.js              # sinc, besselJ1, all intensity functions
│   │   ├── color.js                # wavelengthToRGB (Dan Bruton)
│   │   ├── plotly.js               # Shared Plotly layout, config, trace helpers
│   │   └── canvas.js               # setupCanvas, renderAiryDisk, renderScreenStrip
│   │
│   ├── components/
│   │   ├── Layout.jsx              # Nav bar + page container + footer
│   │   ├── NavLink.jsx             # Styled nav link with gold active state
│   │   ├── Slider.jsx              # Reusable: label, range input, value+unit readout
│   │   ├── ControlPanel.jsx        # Wrapper for sidebar slider group + reset button
│   │   ├── IntensityPlot.jsx       # Plotly wrapper: takes trace data, renders plot
│   │   ├── ScreenStrip.jsx         # Canvas: 1D intensity → brightness strip
│   │   ├── AiryDisk2D.jsx          # Canvas: 2D circular Airy pattern
│   │   ├── Readout.jsx             # Monospace numeric readout with label + unit
│   │   ├── StatusBadge.jsx         # Colored status indicator (Rayleigh page)
│   │   ├── InfoPanel.jsx           # Description text + KaTeX equation
│   │   └── EquationBlock.jsx       # KaTeX rendering wrapper
│   │
│   └── pages/
│       ├── SingleSlit.jsx           # Page 1
│       ├── CircularAperture.jsx     # Page 2
│       ├── Rayleigh.jsx             # Page 3
│       ├── Comparison.jsx           # Page 4
│       └── Sandbox.jsx              # Page 5
│
└── dist/                            # Build output (deploy this folder)
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "react-plotly.js": "^2",
    "plotly.js-basic-dist-min": "^2",
    "katex": "^0.16",
    "react-katex": "^3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "@fontsource/inter": "^5",
    "@fontsource/jetbrains-mono": "^5"
  }
}
```

**Note on Plotly bundle:** Use `plotly.js-basic-dist-min` (not the full `plotly.js`) to keep the bundle small. The basic dist includes scatter, line, and bar charts — everything we need. Import in `IntensityPlot.jsx`:
```javascript
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);
```

---

## Build Phases

### Phase 1: Scaffolding (30 min)

- [ ] `npm create vite@latest diffraction-app -- --template react`
- [ ] Install all dependencies
- [ ] Configure Tailwind with USNA color palette:
  ```javascript
  // tailwind.config.js
  theme: {
    extend: {
      colors: {
        'usna-navy': '#00205B',
        'usna-gold': '#C5B783',
        'usna-gold-light': '#D4C99E',
        'usna-deep': '#001233',
        'usna-card': '#0A1628',
        'usna-plot': '#0D1321',
        'usna-text': '#F0ECE3',
        'usna-muted': '#8B8C8E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  }
  ```
- [ ] Import `@fontsource/inter` and `@fontsource/jetbrains-mono` in `main.jsx`
- [ ] Create `Layout.jsx` with nav bar (USNA navy bg, gold active links) and footer
- [ ] Create 5 stub pages with route definitions in `App.jsx`
- [ ] Configure `vite.config.js` with `base: './'`
- [ ] Verify `npm run dev` — nav works, routes resolve, dark theme renders

### Phase 2: Core Libraries (45 min)

**`src/lib/physics.js`:**
- [ ] `sinc(x)` with x → 0 limit
- [ ] `besselJ1(x)` — A&S rational polynomial approximation
- [ ] `singleSlitIntensity(y, a, lambda, L)` → normalized intensity
- [ ] `airyIntensity(r, D, lambda, L)` → normalized intensity
- [ ] `doubleSlitIntensity(y, a, d, lambda, L)` → combined pattern
- [ ] `nSlitIntensity(y, a, d, N, lambda, L)` → general N-slit
- [ ] All functions take SI units (meters)
- [ ] Sanity checks: central max = 1.0, minima at predicted positions, J₁ zeros

**`src/lib/color.js`:**
- [ ] `wavelengthToRGB(lambdaNm)` → `{ r, g, b }` (0–255)
- [ ] Dan Bruton's algorithm with edge falloff
- [ ] Return neutral gray for wavelengths outside 380–780nm

**`src/lib/plotly.js`:**
- [ ] `baseLayout` object with USNA dark theme colors
- [ ] `plotConfig` with `displayModeBar: false, responsive: true`
- [ ] `makeTrace(x, y, wavelengthNm, options)` helper

**`src/lib/canvas.js`:**
- [ ] `setupCanvas(canvas, width, height)` with retina support
- [ ] `renderScreenStrip(ctx, width, height, intensityFn, xRange, wavelengthNm)`
- [ ] `renderAiryDisk(ctx, size, D, lambda, L, wavelengthNm)`

### Phase 3: Reusable Components (1 hr)

- [ ] **Slider.jsx:** Label, range input, value+unit readout. Gold thumb, navy track. Fires on `input`. Large touch target.
- [ ] **ControlPanel.jsx:** Wraps multiple Sliders in a card with "Reset Defaults" button. Charcoal bg, navy border.
- [ ] **IntensityPlot.jsx:** Wraps `<Plot>` from react-plotly.js. Takes `traces` array and optional `layoutOverrides`. Applies base layout + config.
- [ ] **ScreenStrip.jsx:** Canvas component, renders 1D intensity as a brightness strip with wavelength color.
- [ ] **AiryDisk2D.jsx:** Canvas component, renders 2D Airy pattern via ImageData.
- [ ] **Readout.jsx:** `<span className="font-mono text-lg text-usna-gold">` with label, value, unit.
- [ ] **StatusBadge.jsx:** Pill-shaped badge with dynamic color (red/gold/green) and text.
- [ ] **InfoPanel.jsx:** Card with description text + EquationBlock.
- [ ] **EquationBlock.jsx:** Wraps `<BlockMath>` from react-katex. Handles LaTeX string → rendered equation.

### Phase 4: Single Slit (1 hr)

- [ ] Three sliders (a, λ, L) with defaults from CLAUDE.md spec
- [ ] Compute intensity data (2000 points) on slider change via `useMemo` or `useCallback`
- [ ] Plotly trace with wavelength-colored fill
- [ ] ScreenStrip below plot
- [ ] Annotations: vertical dashed lines at first 3 minima
- [ ] Readouts: y₁ (central max half-width), θ₁ (first minimum angle)
- [ ] InfoPanel with equation and 2-3 sentence description
- [ ] Reset button
- [ ] **Test:** drag sliders continuously, verify smooth 60fps update

### Phase 5: Circular Aperture (1 hr)

- [ ] Three sliders (D, λ, L)
- [ ] 1D Plotly radial profile
- [ ] 2D Canvas Airy disk (400×400)
- [ ] Annotation: first dark ring
- [ ] Readouts: θ₁ = 1.22λ/D, r₁ on screen
- [ ] InfoPanel with Airy function equation

### Phase 6: Rayleigh Criterion (1.5 hr)

- [ ] Three sliders (D, λ, Δθ/θ_c)
- [ ] Combined Plotly profile (sum of two Airy patterns) + individual dashed traces
- [ ] 2D Canvas view with two overlapping disks
- [ ] StatusBadge: Unresolved / Just Resolved / Well Resolved
- [ ] Readouts: θ_c, Δθ, dip depth
- [ ] **Test:** at Δθ = θ_c, dip depth ≈ 74%

### Phase 7: Double vs. Single Comparison (1.5 hr)

- [ ] Three sliders (a, d, λ)
- [ ] Three stacked Plotly subplots (interference / envelope / combined) sharing x-axis
  - Use `Plotly.js` subplot layout with shared xaxis
- [ ] Diffraction envelope as dashed Gold overlay on combined plot
- [ ] Missing order annotations
- [ ] Readouts: d/a ratio, fringe count in central max
- [ ] ScreenStrip for combined pattern

### Phase 8: N-Slit Sandbox (1 hr)

- [ ] Four sliders (N, a, d, λ)
- [ ] N-slit Plotly plot
- [ ] Handle the N=1 → single-slit, N=2 → double-slit transitions gracefully
- [ ] ScreenStrip
- [ ] Info text explaining the approach to diffraction grating

### Phase 9: Polish & Deploy (1.5 hr)

**Visual polish:**
- [ ] Verify consistent card styling across all pages
- [ ] Verify nav bar gold underline tracks active page
- [ ] Verify all text is classroom-readable at 1080p projection
- [ ] Add subtle transitions on slider interaction (e.g., readout value changes)
- [ ] Add favicon

**Testing:**
- [ ] All physics sanity checks pass
- [ ] Chrome, Firefox, Safari
- [ ] 1920×1080 display (primary use case)
- [ ] 125%, 150% scaling
- [ ] 60fps during slider interaction

**Deployment prep:**
- [ ] `npm run build` → verify `dist/` works
- [ ] Open `dist/index.html` as `file://` → all routes work (HashRouter)
- [ ] Add meta tags: `<title>`, `<meta name="description">`, `<meta property="og:title">`
- [ ] Footer: "Built for SP212 · USNA Physics Department · James Kennington"

**Deploy:**
- [ ] Push to GitHub, enable Pages (or upload `dist/` to jwkennington.com)
- [ ] Verify deployed URL works
- [ ] Save `dist/` to USB drive as offline backup for the teaching demo

---

## Timeline

| Date | Milestone |
|------|-----------|
| Apr 14–15 | Phases 1–4: scaffold + libraries + components + single slit |
| Apr 15–16 | Phases 5–7: circular aperture + Rayleigh + comparison |
| Apr 16–17 | Phase 8 (sandbox) + Phase 9 (polish) |
| Apr 18 | Final testing, deploy, USB backup |
| Apr 19 | Dry run of full teaching demo with app projected |
| **Apr 21** | **Teaching demo at USNA** |

---

## Deployment Options

1. **GitHub Pages:** Push repo → Settings → Pages → deploy from `gh-pages` branch or `/dist` folder. Free HTTPS.
2. **jwkennington.com subdirectory:** Copy `dist/` contents to `/diffraction/` on the existing site.
3. **Netlify:** Connect GitHub repo → auto-build on push → free tier with HTTPS and custom domain.

All options serve static files with zero server process. HashRouter ensures routes work on all three.

