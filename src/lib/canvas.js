/**
 * canvas.js — Canvas setup and rendering utilities.
 */
import { wavelengthToRGB } from './color';

/**
 * Set up a canvas for retina / high-DPI displays.
 * Returns the 2D context with the scale already applied.
 */
export function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

/**
 * Render a 1D intensity distribution as a horizontal brightness strip.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width   display width (px)
 * @param {number} height  display height (px)
 * @param {function} intensityFn  (x) => intensity in [0,1], where x spans xRange
 * @param {[number, number]} xRange  [xMin, xMax] in same units as intensityFn expects
 * @param {number} wavelengthNm
 */
export function renderScreenStrip(ctx, width, height, intensityFn, xRange, wavelengthNm) {
  const { r, g, b } = wavelengthToRGB(wavelengthNm);
  const dpr = window.devicePixelRatio || 1;
  const imgWidth = Math.round(width * dpr);
  const imgHeight = Math.round(height * dpr);
  const imageData = ctx.createImageData(imgWidth, imgHeight);
  const data = imageData.data;
  const [xMin, xMax] = xRange;

  for (let px = 0; px < imgWidth; px++) {
    const x = xMin + (px / (imgWidth - 1)) * (xMax - xMin);
    const I = Math.max(0, Math.min(1, intensityFn(x)));
    const pr = Math.round(r * I);
    const pg = Math.round(g * I);
    const pb = Math.round(b * I);
    for (let py = 0; py < imgHeight; py++) {
      const idx = (py * imgWidth + px) * 4;
      data[idx] = pr;
      data[idx + 1] = pg;
      data[idx + 2] = pb;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Render a 2D Airy disk pattern on a square canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size  display size (px, square)
 * @param {function} intensityFn  (r) => intensity in [0,1]
 * @param {number} rMax  maximum radial distance mapped to canvas edge
 * @param {number} wavelengthNm
 */
export function renderAiryDisk(ctx, size, intensityFn, rMax, wavelengthNm) {
  const { r: cr, g: cg, b: cb } = wavelengthToRGB(wavelengthNm);
  const dpr = window.devicePixelRatio || 1;
  const pxSize = Math.round(size * dpr);
  const imageData = ctx.createImageData(pxSize, pxSize);
  const data = imageData.data;
  const half = pxSize / 2;

  for (let py = 0; py < pxSize; py++) {
    for (let px = 0; px < pxSize; px++) {
      const dx = (px - half) / half;
      const dy = (py - half) / half;
      const rNorm = Math.sqrt(dx * dx + dy * dy);
      const rPhys = rNorm * rMax;
      const I = rNorm <= 1.0 ? Math.max(0, Math.min(1, intensityFn(rPhys))) : 0;
      const idx = (py * pxSize + px) * 4;
      data[idx] = Math.round(cr * I);
      data[idx + 1] = Math.round(cg * I);
      data[idx + 2] = Math.round(cb * I);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
