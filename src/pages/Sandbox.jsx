import { useState, useMemo, useCallback, useRef } from 'react';
import ControlPanel from '../components/ControlPanel';
import Slider from '../components/Slider';
import DisplayOptions from '../components/DisplayOptions';
import IntensityPlot from '../components/IntensityPlot';
import ScreenStrip from '../components/ScreenStrip';
import InfoPanel from '../components/InfoPanel';
import { nSlitIntensity } from '../lib/physics';
import { makeTrace } from '../lib/plotly';

const DEFAULTS = { N: 2, a: 0.08, d: 0.40, lambda: 550 };

export default function Sandbox() {
  const [N, setN] = useState(DEFAULTS.N);
  const [a, setA] = useState(DEFAULTS.a);
  const [d, setD] = useState(DEFAULTS.d);
  const [lambda, setLambda] = useState(DEFAULTS.lambda);
  const [lockAxis, setLockAxis] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [gamma, setGamma] = useState(0.5);
  const lockedRange = useRef(null);

  const reset = () => { setN(DEFAULTS.N); setA(DEFAULTS.a); setD(DEFAULTS.d); setLambda(DEFAULTS.lambda); };

  const a_m = a * 1e-3;
  const d_m = d * 1e-3;
  const lambda_m = lambda * 1e-9;
  const L = 2.0;

  const y1 = (lambda_m * L) / a_m;
  const autoXMax = 4 * y1;

  const handleLockAxis = (locked) => {
    if (locked) lockedRange.current = autoXMax;
    setLockAxis(locked);
  };

  const xMax = lockAxis && lockedRange.current ? lockedRange.current : autoXMax;
  const dataXMax = Math.max(xMax, autoXMax);
  const nPts = 2000;

  const { xData, yData } = useMemo(() => {
    const xs = [];
    const ys = [];
    for (let i = 0; i < nPts; i++) {
      const y = -dataXMax + (2 * dataXMax * i) / (nPts - 1);
      xs.push(y * 1e3);
      ys.push(nSlitIntensity(y, a_m, d_m, N, lambda_m, L));
    }
    return { xData: xs, yData: ys };
  }, [a_m, d_m, N, lambda_m, L, dataXMax]);

  const traces = useMemo(() => {
    if (logScale) {
      const yLog = yData.map(v => v > 0 ? Math.log10(v) : -6);
      return [makeTrace(xData, yLog, lambda, { fill: 'none' })];
    }
    return [makeTrace(xData, yData, lambda)];
  }, [xData, yData, lambda, logScale]);

  const xAxisRange = lockAxis && lockedRange.current
    ? [-lockedRange.current * 1e3, lockedRange.current * 1e3]
    : undefined;

  const intensityFn = useCallback(
    (y) => nSlitIntensity(y, a_m, d_m, N, lambda_m, L),
    [a_m, d_m, N, lambda_m, L]
  );

  const infoText = N === 1
    ? 'With a single slit, only the diffraction envelope is visible.'
    : N === 2
    ? 'Two slits produce the classic Young\'s interference fringes modulated by the single-slit envelope.'
    : N <= 5
    ? `With ${N} slits, principal maxima sharpen and ${N - 2} secondary maxima appear between them.`
    : `With ${N} slits, the pattern approaches a diffraction grating: very sharp principal maxima with ${N - 2} secondary maxima between each pair.`;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <ControlPanel onReset={reset}>
        <Slider label="Number of slits (N)" value={N} min={1} max={20} step={1} unit="" onChange={setN} />
        <Slider label="Slit width (a)" value={a} min={0.01} max={0.50} step={0.01} unit="mm" onChange={setA} />
        <Slider label="Slit separation (d)" value={d} min={0.1} max={2.0} step={0.01} unit="mm" onChange={setD} />
        <Slider label="Wavelength (λ)" value={lambda} min={380} max={780} step={1} unit="nm" onChange={setLambda} />
        <DisplayOptions
          lockAxis={lockAxis}
          onLockAxisChange={handleLockAxis}
          logScale={logScale}
          onLogScaleChange={setLogScale}
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
                title: { text: 'Screen Position y (mm)' },
                ...(xAxisRange && { range: xAxisRange }),
              },
              ...(logScale && {
                yaxis: { title: { text: 'log₁₀ Intensity' }, range: [-6, 0.05] },
              }),
            }}
          />
        </div>

        <ScreenStrip
          intensityFn={intensityFn}
          xRange={[-xMax, xMax]}
          wavelengthNm={lambda}
          gamma={gamma}
          width={800}
          height={60}
        />

        <InfoPanel
          title="N-Slit Explorer"
          description={infoText}
          equation={String.raw`I = \left[\frac{\sin\beta}{\beta}\right]^2 \frac{1}{N^2}\left[\frac{\sin(N\psi/2)}{\sin(\psi/2)}\right]^2`}
        />
      </div>
    </div>
  );
}
