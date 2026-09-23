import type { GenKind } from './content';

// Procedural placeholder art for project imagery. Replace with real
// WebP/AVIF work when it exists.

export function drawGen(cv: HTMLCanvasElement, kind: GenKind, seed: number, inv: boolean, acc: string) {
  const w = cv.clientWidth || 400, h = cv.clientHeight || 500, d = Math.min(2, window.devicePixelRatio || 1);
  cv.width = w * d; cv.height = h * d;
  const x = cv.getContext('2d');
  if (!x) return;
  x.setTransform(d, 0, 0, d, 0, 0);
  let s = (seed || 1) * 9301 + 49297;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bone = '#EDE8DF', ink = '#101012', bg = inv ? acc : ink, fg = inv ? ink : bone;
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.lineWidth = 1;

  if (kind === 'flow') {
    for (let i = 0; i < 340; i++) {
      let px = rnd() * w, py = rnd() * h;
      x.beginPath(); x.moveTo(px, py);
      for (let k = 0; k < 80; k++) {
        const a = Math.sin(px * 0.006 + seed) * 2.2 + Math.cos(py * 0.007 - seed * 0.3) * 2.2;
        px += Math.cos(a) * 3; py += Math.sin(a) * 3; x.lineTo(px, py);
      }
      x.strokeStyle = !inv && rnd() > 0.94 ? acc : fg; x.globalAlpha = 0.18 + rnd() * 0.5; x.stroke();
    }
  } else if (kind === 'rings') {
    const cx = w * (0.35 + rnd() * 0.3), cy = h * 0.55, M = Math.hypot(w, h);
    for (let r = 4, j = 0; r < M; r += 6, j++) {
      x.beginPath();
      x.arc(cx + Math.sin(r * 0.018) * 26, cy + Math.cos(r * 0.011) * 14, r, 0, Math.PI * 2);
      x.strokeStyle = fg; x.globalAlpha = j % 7 === 0 ? 0.95 : 0.4; x.lineWidth = j % 7 === 0 ? 2 : 1; x.stroke();
    }
  } else if (kind === 'dunes') {
    const L = 46;
    for (let i = 0; i < L; i++) {
      const y0 = h * 0.12 + i * ((h * 0.84) / L);
      x.beginPath();
      for (let X = 0; X <= w; X += 3) {
        const env = Math.exp(-Math.pow((X - w * 0.5) / (w * 0.22), 2));
        const y = y0 - Math.max(0, Math.sin(X * 0.045 + i * 1.7 + seed) * 0.5 + Math.sin(X * 0.013 + i * 0.4) * 0.8) * env * h * 0.16;
        if (X === 0) x.moveTo(X, y); else x.lineTo(X, y);
      }
      x.lineTo(w, h); x.lineTo(0, h); x.closePath();
      x.globalAlpha = 1; x.fillStyle = bg; x.fill();
      x.strokeStyle = i === 30 ? acc : fg; x.globalAlpha = i === 30 ? 1 : 0.75; x.lineWidth = i === 30 ? 1.6 : 1; x.stroke();
    }
  } else if (kind === 'halftone') {
    const cx = w * 0.5, cy = h * 0.46, R = Math.min(w, h) * 0.38, st = 8, Lx = -0.5, Ly = -0.6, Lz = 0.62;
    for (let yy = st / 2; yy < h; yy += st) {
      for (let xx = st / 2; xx < w; xx += st) {
        const dx = (xx - cx) / R, dy = (yy - cy) / R, rr = dx * dx + dy * dy;
        let rad: number;
        if (rr < 1) {
          const dz = Math.sqrt(1 - rr);
          rad = Math.max(0.3, dx * Lx + dy * Ly + dz * Lz) * st * 0.55; x.fillStyle = fg; x.globalAlpha = 1;
        } else { rad = 0.7; x.fillStyle = fg; x.globalAlpha = 0.35; }
        x.beginPath(); x.arc(xx, yy, rad, 0, Math.PI * 2); x.fill();
      }
    }
    x.globalAlpha = 1; x.strokeStyle = acc; x.lineWidth = 1.5;
    x.beginPath(); x.ellipse(cx, cy, R * 1.35, R * 0.32, -0.35, 0, Math.PI * 2); x.stroke();
  } else if (kind === 'bars') {
    const n = 42, bw = w / n;
    for (let i = 0; i < n; i++) {
      const hh = (0.12 + 0.88 * Math.abs(Math.sin(i * 0.31 + seed) * Math.cos(i * 0.09 + 1))) * h * 0.78;
      x.fillStyle = fg; x.globalAlpha = i === 17 ? 1 : 0.9;
      x.fillRect(i * bw + 1.5, h - hh - h * 0.06, Math.max(1, bw - 3), hh);
    }
    x.globalAlpha = 1; x.fillStyle = fg; x.fillRect(0, h * 0.94, w, 1);
  }
  x.globalAlpha = 1;
}
