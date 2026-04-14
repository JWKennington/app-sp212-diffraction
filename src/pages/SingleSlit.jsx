import { useState, useMemo, useCallback } from 'react';
import ControlPanel from '../components/ControlPanel';
import Slider from '../components/Slider';
import IntensityPlot from '../components/IntensityPlot';
import ScreenStrip from '../components/ScreenStrip';
import Readout from '../components/Readout';
import InfoPanel from '../components/InfoPanel';
import { singleSlitIntensity } from '../lib/physics';
import { makeTrace } from '../lib/plotly';

const DEFAULTS = { a: 0.10, lambda: 550, L: 2.0 };

export default function SingleSlit() {
  const [a, setA] = useState(DEFAULTS.a);
  const [lambda, setLambda] = useState(DEFAULTS.lambda);
  const [L, setL] = useState(DEFAULTS.L);

  const reset = () => { setA(DEFAULTS.a); setLambda(DEFAULTS.lambda); setL(DEFAULTS.L); };

  // SI units
  const a_m = a * 1e-3;
  const lambda_m = lambda * 1e-9;

  // First minimum position and angle
  const y1 = (lambda_m * L) / a_m;
  const theta1 = lambda_m / a_m; // radians

  // Plot x-range: show ~4 minima
  const xMax = 4 * y1;
  const nPts = 2000;

  const { xData, yData } = useMemo(() => {
    const xs = [];
    const ys = [];
    for (let i = 0; i < nPts; i++) {
      const y = -xMax + (2 * xMax * i) / (nPts - 1);
      xs.push(y * 1e3); // convert to mm for display
      ys.push(singleSlitIntensity(y, a_m, lambda_m, L));
    }
    return { xData: xs, yData: ys };
  }, [a_m, lambda_m, L, xMax]);

  const traces = useMemo(() => {
    const trace = makeTrace(xData, yData, lambda);
    // Minima annotations as vertical lines handled via layout shapes
    return [trace];
  }, [xData, yData, lambda]);

  // Vertical dashed lines at first 3 minima
  const shapes = useMemo(() => {
    const s = [];
    for (let m = 1; m <= 3; m++) {
      const pos = m * y1 * 1e3; // mm
      for (const sign of [1, -1]) {
        s.push({
          type: 'line',
          x0: sign * pos, x1: sign * pos,
          y0: 0, y1: 1.05,
          line: { color: '#C5B783', width: 1, dash: 'dash' },
        });
      }
    }
    return s;
  }, [y1]);

  const intensityFn = useCallback(
    (y) => singleSlitIntensity(y, a_m, lambda_m, L),
    [a_m, lambda_m, L]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <ControlPanel onReset={reset}>
        <Slider label="Slit width (a)" value={a} min={0.01} max={1.0} step={0.01} unit="mm" onChange={setA} />
        <Slider label="Wavelength (λ)" value={lambda} min={380} max={780} step={1} unit="nm" onChange={setLambda} />
        <Slider label="Screen distance (L)" value={L} min={0.5} max={10.0} step={0.1} unit="m" onChange={setL} />
        <div className="mt-4 space-y-1">
          <Readout label="Central max half-width" value={(y1 * 1e3).toFixed(2)} unit="mm" />
          <Readout label="First min angle θ₁" value={(theta1 * 1e3).toFixed(3)} unit="mrad" />
        </div>
      </ControlPanel>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: 420 }}>
          <IntensityPlot
            traces={traces}
            layoutOverrides={{
              xaxis: { title: { text: 'Screen Position y (mm)' } },
              shapes,
            }}
          />
        </div>

        <ScreenStrip
          intensityFn={intensityFn}
          xRange={[-xMax, xMax]}
          wavelengthNm={lambda}
          width={800}
          height={60}
        />

        <InfoPanel
          title="Single-Slit Fraunhofer Diffraction"
          description="Light passing through a narrow slit produces a central bright fringe flanked by progressively weaker secondary maxima. Minima occur where the path difference across the slit equals a whole number of wavelengths."
          equation={String.raw`I(\theta) = I_0 \left[\frac{\sin\beta}{\beta}\right]^2, \quad \beta = \frac{\pi a \sin\theta}{\lambda}`}
        />
      </div>
    </div>
  );
}
