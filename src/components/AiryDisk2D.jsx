import { useRef, useEffect } from 'react';
import { setupCanvas, renderAiryDisk } from '../lib/canvas';

/**
 * Canvas component that renders a 2D Airy disk pattern.
 */
export default function AiryDisk2D({ intensityFn, rMax, wavelengthNm, size = 400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, size, size);
    renderAiryDisk(ctx, size, intensityFn, rMax, wavelengthNm);
  }, [intensityFn, rMax, wavelengthNm, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-usna-grid"
      style={{ width: size, height: size }}
    />
  );
}
