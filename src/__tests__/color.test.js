import { describe, it, expect } from 'vitest';
import { wavelengthToRGB } from '../lib/color.js';

describe('wavelengthToRGB', () => {
  it('returns gray for wavelengths below 380 nm', () => {
    const c = wavelengthToRGB(300);
    expect(c).toEqual({ r: 180, g: 180, b: 180 });
  });

  it('returns gray for wavelengths above 780 nm', () => {
    const c = wavelengthToRGB(800);
    expect(c).toEqual({ r: 180, g: 180, b: 180 });
  });

  it('red region (~650 nm) has high R, low G and B', () => {
    const c = wavelengthToRGB(650);
    expect(c.r).toBeGreaterThan(200);
    expect(c.g).toBeLessThan(30);
    expect(c.b).toBeLessThan(30);
  });

  it('green region (~550 nm) has high G', () => {
    const c = wavelengthToRGB(550);
    expect(c.g).toBeGreaterThan(150);
  });

  it('blue region (~450 nm) has high B', () => {
    const c = wavelengthToRGB(450);
    expect(c.b).toBeGreaterThan(150);
  });

  it('all channels are 0–255 integers across spectrum', () => {
    for (let nm = 380; nm <= 780; nm += 10) {
      const c = wavelengthToRGB(nm);
      for (const ch of [c.r, c.g, c.b]) {
        expect(Number.isInteger(ch)).toBe(true);
        expect(ch).toBeGreaterThanOrEqual(0);
        expect(ch).toBeLessThanOrEqual(255);
      }
    }
  });
});
