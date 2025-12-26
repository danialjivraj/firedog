function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(t) {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}

const DEBUG_VORTEX_CLEAR = false;

export class DistortionEffect {
  constructor(game, options = {}) {
    this.game = game;

    this.quality = options.quality ?? 1.0;

    this.vortexCount = options.vortexCount ?? 1;
    this.maxAngle = options.maxAngle ?? 1.25;

    this.minRadius = options.minRadius ?? 500;
    this.maxRadius = options.maxRadius ?? 610;

    this.bandSpeed = options.bandSpeed ?? 260;
    this.applyIntervalMs = options.applyIntervalMs ?? 33;

    this.inSpeed = options.inSpeed ?? 0.002;
    this.outSpeed = options.outSpeed ?? 0.0016;

    this.bandMargin = options.bandMargin ?? 12;

    this.amount = 0;
    this._timeSinceApply = 0;
    this._w = 0;
    this._h = 0;

    this.bandX = 0;
    this.bandDir = 1;
    this._wasActive = false;

    this.srcCanvas = document.createElement("canvas");
    this.dstCanvas = document.createElement("canvas");

    this.srcCtx = this.srcCanvas.getContext("2d", { willReadFrequently: true });
    this.dstCtx = this.dstCanvas.getContext("2d");

    this.dstImageData = null;

    const baseArr = [];
    this.vortices = DEBUG_VORTEX_CLEAR
      ? new Proxy(baseArr, {
        set: (arr, prop, value) => {
          if (prop === "length" && value === 0) {
            console.trace("DistortionEffect.vortices cleared!");
          }
          arr[prop] = value;
          return true;
        },
      })
      : baseArr;
  }

  _initVortices() {
    this.vortices.length = 0;

    const W = this.game.width;
    const H = this.game.height;

    this.bandX = clamp(this.bandX || W * 0.5, 0, W);

    const spacing = H / Math.max(1, this.vortexCount);
    const minR = this.minRadius;
    const maxR = this.maxRadius;

    for (let i = 0; i < this.vortexCount; i++) {
      const y = (i + 0.5) * spacing;
      const r = minR + Math.random() * (maxR - minR);
      const spin = i % 2 === 0 ? 1 : -1;

      this.vortices.push({ x: this.bandX, y, r, spin });
    }
  }

  _ensureSize(canvas) {
    const w = Math.max(1, Math.floor(canvas.width * this.quality));
    const h = Math.max(1, Math.floor(canvas.height * this.quality));

    if (w === this._w && h === this._h) return;

    this._w = w;
    this._h = h;

    this.srcCanvas.width = w;
    this.srcCanvas.height = h;
    this.dstCanvas.width = w;
    this.dstCanvas.height = h;

    this.dstImageData = this.srcCtx.createImageData(w, h);
  }

  _startBandAtPlayer() {
    const W = this.game.width;
    const p = this.game.player;
    const px = p ? p.x + p.width * 0.5 : W * 0.5;

    this.bandX = clamp(px, 0, W);
    this.bandDir = this.bandX < W * 0.5 ? 1 : -1;

    for (const v of this.vortices) v.x = this.bandX;
  }

  update(deltaTime) {
    const activeNow = !!this.game.distortionActive;

    if (activeNow && (!this._wasActive || this.vortices.length === 0)) {
      this._startBandAtPlayer();
      this._initVortices();
    }

    this._wasActive = activeNow;

    const target = activeNow ? 1 : 0;
    const speed = target > this.amount ? this.inSpeed : this.outSpeed;

    this.amount += (target - this.amount) * (1 - Math.exp(-speed * deltaTime * 6));
    this.amount = clamp(this.amount, 0, 1);

    if (this.amount > 0.001) {
      const dt = deltaTime / 1000;
      const W = this.game.width;

      const bossState = this.game.boss;
      const boss = bossState?.current;
      const mode2Mult =
        bossState.id === "ntharax" && boss && (boss.mode2Active ?? boss.mode2) ? 2 : 1;

      this.bandX += this.bandDir * (this.bandSpeed * mode2Mult) * dt;

      if (this.bandX <= 0) {
        this.bandX = 0;
        this.bandDir = 1;
      } else if (this.bandX >= W) {
        this.bandX = W;
        this.bandDir = -1;
      }

      for (const v of this.vortices) v.x = this.bandX;
    }

    this._timeSinceApply += deltaTime;
  }

  get isVisible() {
    return this.amount > 0.04;
  }

  apply(ctx) {
    if (!this.isVisible) return;

    if (this.vortices.length === 0) {
      return;
    }

    if (this._timeSinceApply < this.applyIntervalMs) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        this.dstCanvas,
        0,
        0,
        this._w,
        this._h,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      ctx.restore();
      return;
    }

    this._timeSinceApply = 0;

    const canvas = ctx.canvas;
    this._ensureSize(canvas);

    const W = this._w;
    const H = this._h;
    const q = this.quality;

    this.srcCtx.clearRect(0, 0, W, H);
    this.srcCtx.drawImage(canvas, 0, 0, W, H);

    const src = this.srcCtx.getImageData(0, 0, W, H);
    const dst = this.dstImageData;

    dst.data.set(src.data);

    const a = smoothstep(this.amount);
    if (a <= 0.0001) {
      this.dstCtx.putImageData(dst, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.dstCanvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      return;
    }

    const vort = [];
    let maxScaledR = 0;

    for (const v of this.vortices) {
      const vx = v.x * q;
      const vy = v.y * q;
      const r = v.r * q;
      const r2 = r * r;
      vort.push({ vx, vy, r, r2, spin: v.spin });
      if (r > maxScaledR) maxScaledR = r;
    }

    const cx = this.bandX * q;
    const margin = this.bandMargin;
    const x0 = Math.max(0, Math.floor(cx - maxScaledR - margin));
    const x1 = Math.min(W - 1, Math.ceil(cx + maxScaledR + margin));

    for (let y = 0; y < H; y++) {
      const rowOff = y * W * 4;

      for (let x = x0; x <= x1; x++) {
        let fx = x;
        let fy = y;

        for (let k = 0; k < vort.length; k++) {
          const v = vort[k];

          const dx = fx - v.vx;
          const dy = fy - v.vy;

          const d2 = dx * dx + dy * dy;

          if (d2 < v.r2 && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const t = 1 - d / v.r;

            const ang = v.spin * this.maxAngle * t * t * a;

            const ca = Math.cos(ang);
            const sa = Math.sin(ang);

            fx = v.vx + dx * ca - dy * sa;
            fy = v.vy + dx * sa + dy * ca;
          }
        }

        fx = clamp(fx, 0, W - 1);
        fy = clamp(fy, 0, H - 1);

        const sx = fx | 0;
        const sy = fy | 0;

        const iSrc = (sy * W + sx) * 4;
        const iDst = rowOff + x * 4;

        dst.data[iDst] = src.data[iSrc];
        dst.data[iDst + 1] = src.data[iSrc + 1];
        dst.data[iDst + 2] = src.data[iSrc + 2];
        dst.data[iDst + 3] = 255;
      }
    }

    this.dstCtx.putImageData(dst, 0, 0);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.dstCanvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  reset() {
    this.amount = 0;
    this._timeSinceApply = 0;
    this.vortices.length = 0;

    this._wasActive = false;

    if (this.dstCtx) this.dstCtx.clearRect(0, 0, this._w, this._h);
    if (this.srcCtx) this.srcCtx.clearRect(0, 0, this._w, this._h);
  }
}
