import { useState, useMemo, useRef, useEffect } from 'react';
import ControlPanel from '../components/ControlPanel';
import Slider from '../components/Slider';
import DisplayOptions from '../components/DisplayOptions';
import IntensityPlot from '../components/IntensityPlot';
import StatusBadge from '../components/StatusBadge';
import Readout from '../components/Readout';
import InfoPanel from '../components/InfoPanel';
import { airyIntensity } from '../lib/physics';
import { makeTrace } from '../lib/plotly';
import { setupCanvas } from '../lib/canvas';
import { wavelengthToRGB } from '../lib/color';

const DEFAULTS = { D: 2.0, lambda: 550, sepRatio: 1.0 };

export default function Rayleigh() {
  const [D, setD] = useState(DEFAULTS.D);
  const [lambda, setLambda] = useState(DEFAULTS.lambda);
  const [sepRatio, setSepRatio] = useState(DEFAULTS.sepRatio);
  const [lockAxis, setLockAxis] = useState(false);
  const [gamma, setGamma] = useState(1.0);
  const lockedRange = useRef(null);

  const reset = () => { setD(DEFAULTS.D); setLambda(DEFAULTS.lambda); setSepRatio(DEFAULTS.sepRatio); };

  const D_m = D * 1e-3;
  const lambda_m = lambda * 1e-9;
  const thetaC = (1.22 * lambda_m) / D_m;
  const deltaTheta = sepRatio * thetaC;
  const L = 2.0;
  const sep = deltaTheta * L;

  const autoRMax = 6 * (1.22 * lambda_m * L) / D_m;

  const handleLockAxis = (locked) => {
    if (locked) lockedRange.current = autoRMax;
    setLockAxis(locked);
  };

  const rMax = lockAxis && lockedRange.current ? lockedRange.current : autoRMax;
  const nPts = 2000;

  const { xData, y1, y2, ySum } = useMemo(() => {
    const xs = [];
    const a1 = [];
    const a2 = [];
    const s = [];
    for (let i = 0; i < nPts; i++) {
      const r = -rMax + (2 * rMax * i) / (nPts - 1);
      xs.push(r * 1e3);
      const i1 = airyIntensity(r - sep / 2, D_m, lambda_m, L);
      const i2 = airyIntensity(r + sep / 2, D_m, lambda_m, L);
      a1.push(i1);
      a2.push(i2);
      s.push(i1 + i2);
    }
    const maxS = Math.max(...s);
    return {
      xData: xs,
      y1: a1.map(v => v / maxS),
      y2: a2.map(v => v / maxS),
      ySum: s.map(v => v / maxS),
    };
  }, [D_m, lambda_m, L, sep, rMax]);

  const dipDepth = useMemo(() => {
    const centerIdx = Math.floor(nPts / 2);
    const searchRange = Math.floor(nPts * 0.15);
    let minVal = 1;
    for (let i = centerIdx - searchRange; i <= centerIdx + searchRange; i++) {
      if (i >= 0 && i < nPts && ySum[i] < minVal) minVal = ySum[i];
    }
    return minVal;
  }, [ySum]);

  const traces = useMemo(() => [
    makeTrace(xData, ySum, lambda, { fill: 'tozeroy', line: { width: 3 } }),
    makeTrace(xData, y1, lambda, { fill: 'none', line: { width: 1.5, dash: 'dash' }, fillcolor: 'transparent' }),
    makeTrace(xData, y2, lambda, { fill: 'none', line: { width: 1.5, dash: 'dash' }, fillcolor: 'transparent' }),
  ], [xData, ySum, y1, y2, lambda]);

  const xAxisRange = lockAxis && lockedRange.current
    ? [-lockedRange.current * 1e3, lockedRange.current * 1e3]
    : undefined;

  let status, statusLabel;
  if (sepRatio < 0.95) {
    status = 'unresolved'; statusLabel = 'Unresolved';
  } else if (sepRatio <= 1.05) {
    status = 'rayleigh'; statusLabel = 'Just Resolved — Rayleigh Limit';
  } else {
    status = 'resolved'; statusLabel = 'Well Resolved';
  }

  // 2D canvas with two overlapping Airy disks
  const canvasRef = useRef(null);
  const size = 400;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, size, size);
    const { r: cr, g: cg, b: cb } = wavelengthToRGB(lambda);
    const dpr = window.devicePixelRatio || 1;
    const pxSize = Math.round(size * dpr);
    const imageData = ctx.createImageData(pxSize, pxSize);
    const data = imageData.data;
    const half = pxSize / 2;

    for (let py = 0; py < pxSize; py++) {
      for (let px = 0; px < pxSize; px++) {
        const xPhys = ((px - half) / half) * rMax;
        const yPhys = ((py - half) / half) * rMax;
        const r1d = Math.sqrt((xPhys - sep / 2) ** 2 + yPhys ** 2);
        const r2d = Math.sqrt((xPhys + sep / 2) ** 2 + yPhys ** 2);
        const i1 = airyIntensity(r1d, D_m, lambda_m, L);
        const i2 = airyIntensity(r2d, D_m, lambda_m, L);
        const raw = Math.min(1, (i1 + i2) / 2);
        const I = Math.pow(raw, gamma);

        const rNorm = Math.sqrt(((px - half) / half) ** 2 + ((py - half) / half) ** 2);
        const visible = rNorm <= 1.0;

        const idx = (py * pxSize + px) * 4;
        data[idx] = visible ? Math.round(cr * I) : 0;
        data[idx + 1] = visible ? Math.round(cg * I) : 0;
        data[idx + 2] = visible ? Math.round(cb * I) : 0;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [D_m, lambda_m, L, sep, lambda, rMax, gamma]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <ControlPanel onReset={reset}>
        <Slider label="Aperture diameter (D)" value={D} min={0.1} max={10.0} step={0.1} unit="mm" onChange={setD} />
        <Slider label="Wavelength (λ)" value={lambda} min={380} max={780} step={1} unit="nm" onChange={setLambda} />
        <Slider label="Source separation (Δθ/θ_c)" value={sepRatio} min={0.2} max={3.0} step={0.05} unit="× θ_c" onChange={setSepRatio} />
        <div className="mt-4 space-y-2">
          <StatusBadge status={status} label={statusLabel} />
          <Readout label="θ_c" value={(thetaC * 1e3).toFixed(4)} unit="mrad" />
          <Readout label="Δθ" value={(deltaTheta * 1e3).toFixed(4)} unit="mrad" />
          <Readout label="Dip depth" value={(dipDepth * 100).toFixed(1)} unit="%" />
        </div>
        <DisplayOptions
          lockAxis={lockAxis}
          onLockAxisChange={handleLockAxis}
          gamma={gamma}
          onGammaChange={setGamma}
        />
      </ControlPanel>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: 420 }}>
          <IntensityPlot
            traces={traces}
            layoutOverrides={{
              xaxis: {
                title: { text: 'Screen Position (mm)' },
                ...(xAxisRange && { range: xAxisRange }),
              },
            }}
          />
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded border border-usna-grid"
            style={{ width: size, height: size }}
          />
        </div>

        <InfoPanel
          title="Rayleigh Criterion"
          description="Two point sources are 'just resolved' when the central maximum of one Airy pattern falls on the first dark ring of the other. At this limit, the combined intensity dip between the peaks is about 74% of the maximum."
          equation={String.raw`\theta_c = 1.22\,\frac{\lambda}{D}`}
        />
      </div>
    </div>
  );
}
