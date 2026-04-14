/**
 * physics.js — Pure numerical functions for optical diffraction.
 *
 * All functions accept SI units (meters) internally.
 * No framework dependencies — import directly in tests or UI code.
 */

// ── sinc ────────────────────────────────────────────────────────────────────

/**
 * Normalized sinc: sin(x)/x with the x→0 limit = 1.
 */
export function sinc(x) {
  if (Math.abs(x) < 1e-10) return 1.0;
  return Math.sin(x) / x;
}

// ── Bessel J₁ — Abramowitz & Stegun §9.4.4 / §9.4.6 ───────────────────────

/**
 * Bessel function of the first kind, order 1.
 * Rational polynomial approximation accurate to ~1e-7.
 */
export function besselJ1(x) {
  const ax = Math.abs(x);

  if (ax < 8.0) {
    // A&S §9.4.4 — polynomial for |x| ≤ 8
    const y = x * x;
    const ans1 =
      x *
      (72362614232.0 +
        y *
          (-7895059235.0 +
            y *
              (242396853.1 +
                y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))));
    const ans2 =
      144725228442.0 +
      y *
        (2300535178.0 +
          y *
            (18583304.74 +
              y * (99447.43394 + y * (376.9991397 + y * 1.0))));
    return ans1 / ans2;
  }

  // A&S §9.4.6 — asymptotic for |x| > 8
  const z = 8.0 / ax;
  const y = z * z;
  const xx = ax - 2.356194491;
  const p =
    1.0 +
    y *
      (0.183105e-2 +
        y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * -0.240337019e-6)));
  const q =
    0.04687499995 +
    y *
      (-0.2002690873e-3 +
        y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
  const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * p - z * Math.sin(xx) * q);
  return x < 0 ? -ans : ans;
}

// ── Intensity functions ─────────────────────────────────────────────────────

/**
 * Single-slit Fraunhofer diffraction.
 * @param {number} y  screen position (m)
 * @param {number} a  slit width (m)
 * @param {number} lambda  wavelength (m)
 * @param {number} L  screen distance (m)
 * @returns {number} normalized intensity [0, 1]
 */
export function singleSlitIntensity(y, a, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  return sinc(beta) ** 2;
}

/**
 * Circular aperture (Airy) diffraction.
 * @param {number} r  radial screen position (m)
 * @param {number} D  aperture diameter (m)
 * @param {number} lambda  wavelength (m)
 * @param {number} L  screen distance (m)
 * @returns {number} normalized intensity [0, 1]
 */
export function airyIntensity(r, D, lambda, L) {
  const sinTheta = r / Math.sqrt(r * r + L * L);
  const u = (Math.PI * D * sinTheta) / lambda;
  if (Math.abs(u) < 1e-10) return 1.0;
  return (2 * besselJ1(u) / u) ** 2;
}

/**
 * Double-slit combined (interference × single-slit envelope).
 * @param {number} y  screen position (m)
 * @param {number} a  slit width (m)
 * @param {number} d  slit separation (m, center-to-center)
 * @param {number} lambda  wavelength (m)
 * @param {number} L  screen distance (m)
 * @returns {number} normalized intensity [0, 1]
 */
export function doubleSlitIntensity(y, a, d, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  const psi = (Math.PI * d * sinTheta) / lambda;
  return sinc(beta) ** 2 * Math.cos(psi) ** 2;
}

/**
 * N-slit diffraction (general grating equation).
 * Reduces to single slit at N=1 and double slit at N=2.
 * @param {number} y  screen position (m)
 * @param {number} a  slit width (m)
 * @param {number} d  slit separation (m)
 * @param {number} N  number of slits (integer ≥ 1)
 * @param {number} lambda  wavelength (m)
 * @param {number} L  screen distance (m)
 * @returns {number} normalized intensity [0, 1]
 */
export function nSlitIntensity(y, a, d, N, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const beta = (Math.PI * a * sinTheta) / lambda;
  const psi = (Math.PI * d * sinTheta) / lambda;
  const diffraction = sinc(beta) ** 2;

  const sinNpsi = Math.sin(N * psi);
  const sinPsi = Math.sin(psi);
  const interference =
    Math.abs(sinPsi) < 1e-10 ? N * N : (sinNpsi / sinPsi) ** 2;

  return (diffraction * interference) / (N * N);
}

/**
 * Interference-only factor (no single-slit envelope), for comparison plots.
 */
export function interferenceOnly(y, d, lambda, L) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const psi = (Math.PI * d * sinTheta) / lambda;
  return Math.cos(psi) ** 2;
}

/**
 * Single-slit envelope only, for overlay on comparison plots.
 */
export function envelopeOnly(y, a, lambda, L) {
  return singleSlitIntensity(y, a, lambda, L);
}
