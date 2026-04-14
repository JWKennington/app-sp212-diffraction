import { useState, useMemo, useCallback } from 'react';
import ControlPanel from '../components/ControlPanel';
import Slider from '../components/Slider';
import IntensityPlot from '../components/IntensityPlot';
import ScreenStrip from '../components/ScreenStrip';
import Readout from '../components/Readout';
import InfoPanel from '../components/InfoPanel';
import { doubleSlitIntensity, interferenceOnly, envelopeOnly } from '../lib/physics';
import { makeTrace } from '../lib/plotly';

const DEFAULTS = { a: 0.08, d: 0.40, lambda: 550 };

export default function Comparison() {
  const [a, setA] = useState(DEFAULTS.a);
  const [d, setD] = useState(DEFAULTS.d);
  const [lambda, setLambda] = useState(DEFAULTS.lambda);

  const reset = () => { setA(DEFAULTS.a); setD(DEFAULTS.d); setLambda(DEFAULTS.lambda); };

  const a_m = a * 1e-3;
  const d_m = d * 1e-3;
  const lambda_m = lambda * 1e-9;
  const L = 2.0;

  const dOverA = d / a;
  const fringesInCentral = Math.max(1, Math.round(2 * d / a - 1));

  // X-range: ~4 single-slit minima
  const y1 = (lambda_m * L) / a_m;
  const xMax = 4 * y1;
  const nPts = 2000;

  const { xData, yInterf, yEnv, yCombined } = useMemo(() => {
    const xs = [];
    const interf = [];
    const env = [];
    const combined = [];
    for (let i = 0; i < nPts; i++) {
      const y = -xMax + (2 * xMax * i) / (nPts - 1);
      xs.push(y * 1e3);
      interf.push(interferenceOnly(y, d_m, lambda_m, L));
      env.push(envelopeOnly(y, a_m, lambda_m, L));
      combined.push(doubleSlitIntensity(y, a_m, d_m, lambda_m, L));
    }
    return { xData: xs, yInterf: interf, yEnv: env, yCombined: combined };
  }, [a_m, d_m, lambda_m, L, xMax]);

  const interfTraces = useMemo(() => [
    makeTrace(xData, yInterf, lambda, { fill: 'tozeroy' }),
  ], [xData, yInterf, lambda]);

  const envTraces = useMemo(() => [
    makeTrace(xData, yEnv, lambda, { fill: 'tozeroy' }),
  ], [xData, yEnv, lambda]);

  const combinedTraces = useMemo(() => [
    makeTrace(xData, yCombined, lambda, { fill: 'tozeroy' }),
    // Diffraction envelope overlay
    {
      x: xData,
      y: yEnv,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#C5B783', width: 2, dash: 'dash' },
      fill: 'none',
    },
  ], [xData, yCombined, yEnv, lambda]);

  const combinedIntensityFn = useCallback(
    (y) => doubleSlitIntensity(y, a_m, d_m, lambda_m, L),
    [a_m, d_m, lambda_m, L]
  );

  const subplotHeight = 200;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <ControlPanel onReset={reset}>
        <Slider label="Slit width (a)" value={a} min={0.01} max={0.50} step={0.01} unit="mm" onChange={setA} />
        <Slider label="Slit separation (d)" value={d} min={0.1} max={2.0} step={0.01} unit="mm" onChange={setD} />
        <Slider label="Wavelength (λ)" value={lambda} min={380} max={780} step={1} unit="nm" onChange={setLambda} />
        <div className="mt-4 space-y-1">
          <Readout label="d/a ratio" value={dOverA.toFixed(1)} unit="" />
          <Readout label="Fringes in central max" value={fringesInCentral} unit="" />
        </div>
      </ControlPanel>

      <div className="flex-1 flex flex-col gap-4">
        {/* Interference only */}
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: subplotHeight }}>
          <IntensityPlot
            traces={interfTraces}
            layoutOverrides={{
              xaxis: { title: { text: '' } },
              yaxis: { title: { text: 'Interference' } },
              margin: { t: 10, b: 25 },
            }}
          />
        </div>

        {/* Envelope only */}
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: subplotHeight }}>
          <IntensityPlot
            traces={envTraces}
            layoutOverrides={{
              xaxis: { title: { text: '' } },
              yaxis: { title: { text: 'Envelope' } },
              margin: { t: 10, b: 25 },
            }}
          />
        </div>

        {/* Combined */}
        <div className="bg-usna-card border border-usna-grid rounded-lg p-4" style={{ height: subplotHeight }}>
          <IntensityPlot
            traces={combinedTraces}
            layoutOverrides={{
              xaxis: { title: { text: 'Screen Position y (mm)' } },
              yaxis: { title: { text: 'Combined' } },
              margin: { t: 10, b: 40 },
            }}
          />
        </div>

        <ScreenStrip
          intensityFn={combinedIntensityFn}
          xRange={[-xMax, xMax]}
          wavelengthNm={lambda}
          width={800}
          height={60}
        />

        <InfoPanel
          title="Double-Slit vs. Single-Slit"
          description="The double-slit pattern is the product of the single-slit diffraction envelope and the two-slit interference pattern. 'Missing orders' occur where diffraction minima suppress interference maxima."
          equation={String.raw`I = \left[\frac{\sin\beta}{\beta}\right]^2 \cos^2\!\left(\frac{\pi d \sin\theta}{\lambda}\right)`}
        />
      </div>
    </div>
  );
}
