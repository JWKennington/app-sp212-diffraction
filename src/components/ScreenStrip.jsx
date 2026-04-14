import { useRef, useEffect } from 'react';
import { setupCanvas, renderScreenStrip } from '../lib/canvas';

/**
 * Canvas component that renders a 1D intensity distribution as a brightness strip.
 */
export default function ScreenStrip({ intensityFn, xRange, wavelengthNm, width = 800, height = 60 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, width, height);
    renderScreenStrip(ctx, width, height, intensityFn, xRange, wavelengthNm);
  }, [intensityFn, xRange, wavelengthNm, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-usna-grid"
      style={{ width, height }}
    />
  );
}
