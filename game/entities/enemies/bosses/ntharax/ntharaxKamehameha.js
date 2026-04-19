import { Enemy } from "../../enemies.js";

export class Kamehameha extends Enemy {
    constructor(
        game,
        boss,
        {
            // timings
            chargeMs = 950,
            burstGrowMs = 170,
            duration = 4200,
            fadeOutMs = 260,
            // geometry / render
            thickness = 56,
            coreThicknessMult = 0.3,
            auraThicknessMult = 1.55,
            bloomThicknessMult = 2.55,
            sourceAlphaMult = 1,
            // noise / feel
            turbulence = 1.15,
            flicker = 1.15,
            beamJaggedness = 1.0,
            beamSegmentPx = 36,
            // particles
            sparksPerSecond = 260,
            impactSparksPerSecond = 380,
            chargeSparksPerSecond = 420,
            chargeArcsPerSecond = 90,
            // sweep path + bounds
            startSide = null,
            edgeMargin = 90,
            topMargin = 40,
            groundMarginExtra = 10,
            endUpStop = 140,
            endUpBreathingRoom = 140,
            // override
            y = null,
            speed = null,
            // aim modes
            pattern = "sweep",
            fixedEndX = null,
            fixedEndY = null,
            targetPlayer = false,
            // mouth positioning smoothing
            mouthFlipSmoothMs = 50,
            // twin beams (fixed only)
            twinFixed = false,
            twinSeparationPx = null,
            // fixed-beam motion modes
            beamMotionMode = "none",
            followTurnRateRadPerSec = 0.35,
            followDeadzoneRad = 0.003,
            // alternate mode params
            alternateOscMs = 1400,
            alternateCloseFrac = 0.18,
            alternateOpenFrac = 0.18,
            alternateFullCloseIfOffsetBelowRad = 0.035,
            alternateOscAngleRad = 0.11,
            alternateMirrorMidX = null,
            alternateMirrorMidY = null,
        } = {}
    ) {
        super();
        this.game = game;
        this.boss = boss;
        this.isKamehameha = true;
        this._chargeSoundPlayed = false;
        this._attackSoundPlayed = false;
        // timings
        this.chargeMs = chargeMs;
        this.burstGrowMs = burstGrowMs;
        this.duration = duration;
        this.fadeOutMs = fadeOutMs;
        // geometry / render
        this.thickness = thickness;
        this.coreThicknessMult = coreThicknessMult;
        this.auraThicknessMult = auraThicknessMult;
        this.bloomThicknessMult = bloomThicknessMult;
        this.sourceAlphaMult = Number.isFinite(sourceAlphaMult) ? sourceAlphaMult : 1;
        // noise / feel
        this.turbulence = turbulence;
        this.flicker = flicker;
        this.beamJaggedness = beamJaggedness;
        this.beamSegmentPx = beamSegmentPx;
        // particles
        this.sparksPerSecond = sparksPerSecond;
        this.impactSparksPerSecond = impactSparksPerSecond;
        this.chargeSparksPerSecond = chargeSparksPerSecond;
        this.chargeArcsPerSecond = chargeArcsPerSecond;
        // twin beams
        this.twinFixed = !!twinFixed;
        this.twinSeparationPx = Number.isFinite(twinSeparationPx) ? twinSeparationPx : null;
        // sweep / bounds
        this.side = startSide ?? (Math.random() < 0.5 ? "left" : "right");
        this.edgeMargin = edgeMargin;
        this.topMargin = topMargin;
        this.groundMarginExtra = groundMarginExtra;
        this.endUpStop = endUpStop;
        this.endUpBreathingRoom = endUpBreathingRoom;
        // time
        this.elapsed = 0;
        this._seed = Math.random() * 10000;
        // overrides
        this._fixedBeamY = y;
        this._speedOverride = speed;
        this._durationComputed = false;
        // mode
        this.pattern = pattern === "fixed" ? "fixed" : "sweep";

        this._fixedAim = null;
        this._fixedEnd = null;
        if (this.pattern === "fixed") {
            let ax = Number.isFinite(fixedEndX) ? fixedEndX : null;
            let ay = Number.isFinite(fixedEndY) ? fixedEndY : null;

            if ((ax == null || ay == null) && targetPlayer && this.game.player) {
                const p = this.game.player;
                ax = (Number.isFinite(p.x) ? p.x : 0) + (Number.isFinite(p.width) ? p.width : 0) * 0.5;
                ay = (Number.isFinite(p.y) ? p.y : 0) + (Number.isFinite(p.height) ? p.height : 0) * 0.5;
            }
            if (ax != null && ay != null) this._fixedAim = { x: ax, y: ay };
        }

        // mouth
        this.mouthFlipSmoothMs = Math.max(1, mouthFlipSmoothMs);
        this._mouthSide = null;
        this.mouthX = 0;
        this.mouthY = 0;
        // beam end
        this.endX = 0;
        this.endY = 0;
        // aabb for collisions
        this.x = 0;
        this.y = 0;
        this.width = 1;
        this.height = 1;
        this._aabbDebug = null;
        // prevent Enemy auto-removal rules
        this.autoRemoveOnZeroLives = false;
        this.autoRemoveOffTop = false;
        this.lives = 9000;
        // particles containers
        this._sparks = [];
        this._sparkCarry = 0;
        this._impactCarry = 0;
        this._chargeCarry = 0;
        this._arcCarry = 0;
        this._rings = [];
        this._ringCarry = 0;
        // phases
        this._phase = "charge";
        this._phaseStart = 0;
        this._fadeStart = null;
        this._burstTarget = null;
        // fixed-beam motion
        this.beamMotionMode = beamMotionMode === "normal" || beamMotionMode === "alternate" ? beamMotionMode : "none";
        this.followTurnRateRadPerSec = Math.max(0.01, followTurnRateRadPerSec);
        this.followDeadzoneRad = Math.max(0, followDeadzoneRad);
        // alternate motion params
        this.alternateOscMs = Math.max(1, alternateOscMs);
        this.alternateOscAngleRad = Math.max(0, alternateOscAngleRad);
        this.alternateCloseFrac = Math.max(0, Math.min(0.95, alternateCloseFrac));
        this.alternateOpenFrac = Math.max(0, Math.min(0.95, alternateOpenFrac));
        this.alternateFullCloseIfOffsetBelowRad = Math.max(0, alternateFullCloseIfOffsetBelowRad);
        this.alternateMirrorMidX = Number.isFinite(alternateMirrorMidX) ? alternateMirrorMidX : null;
        this.alternateMirrorMidY = Number.isFinite(alternateMirrorMidY) ? alternateMirrorMidY : null;
        // angles
        this._fixedBaseAngle = null;
        this._dynAngle = null;
        this._altAngle = null;
        this._mirrorBaseOffset = null;
    }

    _getTwinHalfSep() {
        const sep = this.twinSeparationPx != null ? this.twinSeparationPx : this.thickness * 0.85;
        return Math.max(2, sep * 0.5);
    }

    _getBeamVariants(mx, my, ex, ey) {
        const useTwin = this.pattern === "fixed" && this.twinFixed;
        if (!useTwin) return [{ mx, my, ex, ey }];

        const dx = ex - mx,
            dy = ey - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / len,
            ny = dx / len;

        const off = this._getTwinHalfSep();

        return [
            { mx: mx + nx * off, my: my + ny * off, ex: ex + nx * off, ey: ey + ny * off },
            { mx: mx - nx * off, my: my - ny * off, ex: ex - nx * off, ey: ey - ny * off },
        ];
    }

    _computeMouth(deltaTime = 16) {
        const b = this.boss;

        const bx = Number.isFinite(b.x) ? b.x : 0;
        const by = Number.isFinite(b.y) ? b.y : 0;
        const bw = Number.isFinite(b.width) ? b.width : 0;
        const bh = Number.isFinite(b.height) ? b.height : 0;

        this.mouthY = by + bh * 0.5;

        const invert = !!b.shouldInvert;
        const targetSide = invert ? 1 : -1;

        if (this._mouthSide == null) this._mouthSide = targetSide;

        const k = 1 - Math.exp(-deltaTime / this.mouthFlipSmoothMs);
        this._mouthSide += (targetSide - this._mouthSide) * k;

        const mouthOffset = bw * 0.28;
        this.mouthX = bx + bw * 0.5 + this._mouthSide * mouthOffset;

        if (Number.isFinite(this._fixedBeamY)) this.mouthY = this._fixedBeamY;
    }

    _getPlayerCenter() {
        const p = this.game && this.game.player;
        if (!p) return null;
        const px = (Number.isFinite(p.x) ? p.x : 0) + (Number.isFinite(p.width) ? p.width : 0) * 0.5;
        const py = (Number.isFinite(p.y) ? p.y : 0) + (Number.isFinite(p.height) ? p.height : 0) * 0.5;
        return { x: px, y: py };
    }

    _pointOnSweepPath(t) {
        const W = Number.isFinite(this.game.width) ? this.game.width : 0;
        const H = Number.isFinite(this.game.height) ? this.game.height : 0;
        const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;

        const G = H - gm - this.groundMarginExtra;

        const leftX = this.edgeMargin;
        const rightX = W - this.edgeMargin;

        const startX = this.side === "left" ? leftX : rightX;
        const otherX = this.side === "left" ? rightX : leftX;

        const targetUpY = Math.max(this.endUpStop, this.topMargin + this.endUpBreathingRoom);

        const L1 = Math.max(1, G - this.topMargin);
        const L2 = Math.max(1, Math.abs(otherX - startX));
        const L3 = Math.max(1, G - targetUpY);

        const total = L1 + L2 + L3;
        let d = t * total;

        if (d <= L1) return { x: startX, y: this.topMargin + d };
        d -= L1;

        if (d <= L2) {
            const u = d / L2;
            return { x: startX + (otherX - startX) * u, y: G };
        }
        d -= L2;

        const y = G - d;
        return { x: otherX, y: Math.max(targetUpY, y) };
    }

    _getBoundsRect() {
        const W = Number.isFinite(this.game.width) ? this.game.width : 0;
        const H = Number.isFinite(this.game.height) ? this.game.height : 0;
        const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;

        const bottom = H - gm - this.groundMarginExtra;

        return {
            left: this.edgeMargin,
            right: W - this.edgeMargin,
            top: this.topMargin,
            bottom,
        };
    }

    _computeFixedEndFromAim(mx, my) {
        if (!this._fixedAim) return null;

        const bounds = this._getBoundsRect();

        let dx = this._fixedAim.x - mx;
        let dy = this._fixedAim.y - my;

        const len = Math.hypot(dx, dy);
        if (len < 0.001) {
            dx = 1;
            dy = 0;
        } else {
            dx /= len;
            dy /= len;
        }

        return this._computeRayEndToBounds(
            mx,
            my,
            dx,
            dy,
            bounds.left,
            bounds.right,
            bounds.top,
            bounds.bottom,
            this._fixedAim
        );
    }

    _computeRayEndToBounds(mx, my, dx, dy, left, right, top, bottom, fallbackPoint = null) {
        const candidates = [];
        const pushIfValid = (t) => {
            if (!(t > 0)) return;
            const x = mx + dx * t;
            const y = my + dy * t;
            if (x >= left - 0.01 && x <= right + 0.01 && y >= top - 0.01 && y <= bottom + 0.01) {
                candidates.push({ t, x, y });
            }
        };

        if (Math.abs(dx) > 1e-6) {
            pushIfValid((left - mx) / dx);
            pushIfValid((right - mx) / dx);
        }
        if (Math.abs(dy) > 1e-6) {
            pushIfValid((top - my) / dy);
            pushIfValid((bottom - my) / dy);
        }

        if (!candidates.length) {
            if (fallbackPoint) {
                const cx = Math.max(left, Math.min(right, fallbackPoint.x));
                const cy = Math.max(top, Math.min(bottom, fallbackPoint.y));
                return { x: cx, y: cy };
            }
            return { x: mx + dx * 10, y: my + dy * 10 };
        }

        candidates.sort((a, b) => a.t - b.t);
        return { x: candidates[0].x, y: candidates[0].y };
    }

    _wrapAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }

    _pointOnPath(t) {
        if (this.pattern === "fixed" && this._fixedEnd) return { x: this._fixedEnd.x, y: this._fixedEnd.y };
        return this._pointOnSweepPath(t);
    }

    _spawnSpark(x, y, isImpact = false, opts = null) {
        const o = opts || {};
        const ang = o.ang != null ? o.ang : Math.random() * Math.PI * 2;
        const spdBase = isImpact ? 520 : 360;
        const spdJit = isImpact ? 980 : 560;
        const spd = o.spd != null ? o.spd : spdBase + Math.random() * spdJit;

        const vx = Math.cos(ang) * spd + (o.vx || 0);
        const vy = Math.sin(ang) * spd + (o.vy || 0);

        const lifeBase = isImpact ? 300 : 240;
        const lifeJit = isImpact ? 320 : 240;
        const life = o.life != null ? o.life : lifeBase + Math.random() * lifeJit;

        const sizeBase = isImpact ? 2.4 : 1.7;
        const sizeJit = isImpact ? 3.6 : 2.5;
        const size = o.size != null ? o.size : sizeBase + Math.random() * sizeJit;

        this._sparks.push({
            x,
            y,
            vx,
            vy,
            life: 0,
            maxLife: life,
            size,
            alpha: 1,
            kind: o.kind || "spark",
        });
    }

    _spawnRing(x, y, kind = "charge") {
        const maxLife = kind === "impact" ? 260 + Math.random() * 180 : 420 + Math.random() * 260;
        const r0 = kind === "impact" ? this.thickness * 0.5 : this.thickness * 0.8;
        const vr = kind === "impact" ? 820 + Math.random() * 520 : 520 + Math.random() * 420;

        this._rings.push({
            x,
            y,
            r: r0,
            vr,
            life: 0,
            maxLife,
            alpha: 1,
            kind,
        });
    }

    _updateSparks(deltaTime) {
        if (!this._sparks.length) return;
        const dt = deltaTime / 1000;

        for (let i = 0; i < this._sparks.length; i++) {
            const p = this._sparks[i];
            p.life += deltaTime;

            const t = p.life / p.maxLife;
            p.alpha = Math.max(0, 1 - t * 1.25);

            const drag = p.kind === "arc" ? 0.84 : 0.9;
            p.vx *= drag;
            p.vy *= drag;

            const grav = p.kind === "arc" ? -18 : -22;
            p.vy -= grav * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        this._sparks = this._sparks.filter((p) => p.life < p.maxLife && p.alpha > 0.01);
    }

    _updateRings(deltaTime) {
        if (!this._rings.length) return;
        const dt = deltaTime / 1000;

        for (let i = 0; i < this._rings.length; i++) {
            const r = this._rings[i];
            r.life += deltaTime;

            const t = r.life / r.maxLife;
            r.alpha = Math.max(0, 1 - t);

            r.r += r.vr * dt;
            r.vr *= 0.92;
        }

        this._rings = this._rings.filter((r) => r.life < r.maxLife && r.alpha > 0.01);
    }

    _setAabb(mx, my, ex, ey, pad) {
        const minX = Math.min(mx, ex) - pad;
        const minY = Math.min(my, ey) - pad;
        const maxX = Math.max(mx, ex) + pad;
        const maxY = Math.max(my, ey) + pad;

        this._aabbDebug = {
            x: minX,
            y: minY,
            w: Math.max(1, maxX - minX),
            h: Math.max(1, maxY - minY),
        };

        this.x = minX;
        this.y = minY;
        this.width = this._aabbDebug.w;
        this.height = this._aabbDebug.h;
    }

    _fireBurst(mx, my) {
        this._spawnRing(mx, my, "impact");

        const burstCount = 34;
        for (let i = 0; i < burstCount; i++) {
            const ang = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
            const spd = 420 + Math.random() * 1200;
            this._spawnSpark(mx, my, true, {
                ang,
                spd,
                life: 240 + Math.random() * 260,
                size: 2.3 + Math.random() * 4.2,
                kind: "spark",
            });
        }

        const arcCount = 18;
        for (let i = 0; i < arcCount; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 260 + Math.random() * 520;
            this._spawnSpark(mx, my, false, {
                ang,
                spd,
                life: 160 + Math.random() * 160,
                size: 1.4 + Math.random() * 2.2,
                kind: "arc",
            });
        }

        if (!this._attackSoundPlayed) {
            this._attackSoundPlayed = true;
            this.game.audioHandler.enemySFX.playSound("kamehamehaBeamAttackSound", false, true);
        }

        this.game.startShake(0);
    }

    update(deltaTime) {
        if (!this.boss || this.boss.markedForDeletion) {
            this.game.stopShake();
            this.markedForDeletion = true;
            return;
        }

        this.elapsed += deltaTime;
        this._computeMouth(deltaTime);

        // fixed endpoint setup
        if (this.pattern === "fixed" && !this._fixedEnd) {
            const end = this._computeFixedEndFromAim(this.mouthX, this.mouthY);
            if (end) this._fixedEnd = end;
        }

        // base angle once (fixed only)
        if (this.pattern === "fixed" && this._fixedEnd && this._fixedBaseAngle == null) {
            const dx = this._fixedEnd.x - this.mouthX;
            const dy = this._fixedEnd.y - this.mouthY;
            this._fixedBaseAngle = Math.atan2(dy, dx);
            this._dynAngle = this._fixedBaseAngle;
            this._altAngle = this._fixedBaseAngle;
        }

        // derive duration from speed (sweep only)
        if (this.pattern === "sweep" && this._speedOverride && !this._durationComputed) {
            const W = Number.isFinite(this.game.width) ? this.game.width : 0;
            const H = Number.isFinite(this.game.height) ? this.game.height : 0;
            const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;
            const G = H - gm - this.groundMarginExtra;

            const targetUpY = Math.max(this.endUpStop, this.topMargin + this.endUpBreathingRoom);

            const L1 = Math.max(1, G - this.topMargin);
            const L2 = Math.max(1, W - this.edgeMargin - this.edgeMargin);
            const L3 = Math.max(1, G - targetUpY);

            const total = L1 + L2 + L3;
            this.duration = (total / this._speedOverride) * 1000;
            this._durationComputed = true;
        }

        const mx = this.mouthX,
            my = this.mouthY;

        // charge
        if (this._phase === "charge") {
            this.endX = mx;
            this.endY = my;

            const dt = deltaTime / 1000;

            if (!this._chargeSoundPlayed) {
                this._chargeSoundPlayed = true;
                this.game.audioHandler.enemySFX.playSound("kamehamehaBeamChargeSound", false, true);
            }

            const chargeT = Math.min(1, this.elapsed / Math.max(1, this.chargeMs));
            this._ringCarry += (0.9 + 1.6 * chargeT) * dt;
            while (this._ringCarry >= 1) {
                this._ringCarry -= 1;
                this._spawnRing(mx + (Math.random() - 0.5) * 10, my + (Math.random() - 0.5) * 10, "charge");
            }

            this._chargeCarry += this.chargeSparksPerSecond * dt;
            while (this._chargeCarry >= 1) {
                this._chargeCarry -= 1;

                const r = this.thickness * 0.35 + Math.random() * (this.thickness * 1.1);
                const a = Math.random() * Math.PI * 2;
                const px = mx + Math.cos(a) * r;
                const py = my + Math.sin(a) * r;

                const tang = a + Math.PI / 2;
                const spd = 260 + Math.random() * 640;
                const vx = Math.cos(tang) * spd + (mx - px) * 6;
                const vy = Math.sin(tang) * spd + (my - py) * 6;

                this._spawnSpark(px, py, false, {
                    vx,
                    vy,
                    spd: 0,
                    life: 180 + Math.random() * 220,
                    size: 1.1 + Math.random() * 2.2,
                    kind: "spark",
                });
            }

            this._arcCarry += this.chargeArcsPerSecond * dt;
            while (this._arcCarry >= 1) {
                this._arcCarry -= 1;

                const a = Math.random() * Math.PI * 2;
                const r = this.thickness * 0.25 + Math.random() * (this.thickness * 0.95);
                const px = mx + Math.cos(a) * r;
                const py = my + Math.sin(a) * r;

                this._spawnSpark(px, py, false, {
                    ang: a + Math.PI,
                    spd: 120 + Math.random() * 420,
                    life: 90 + Math.random() * 140,
                    size: 0.9 + Math.random() * 1.8,
                    kind: "arc",
                });
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);

            let pad = Math.max(16, this.thickness * 0.9);
            if (this.pattern === "fixed" && this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, mx, my, pad);

            if (this.elapsed >= this.chargeMs) {
                this._phase = "burst";
                this._phaseStart = this.elapsed;

                this._burstTarget = this._pointOnPath(0);
                this._fireBurst(mx, my);
            }

            return;
        }

        // burst
        if (this._phase === "burst") {
            const t = Math.min(1, (this.elapsed - this._phaseStart) / Math.max(1, this.burstGrowMs));
            const ease = 1 - Math.pow(1 - t, 3);

            const p0 = this._burstTarget || this._pointOnPath(0);

            const ox = p0.x - mx;
            const oy = p0.y - my;
            const overshoot = t < 1 ? 0.1 * Math.sin(t * Math.PI) * (0.6 + 0.4 * this.turbulence) : 0;

            this.endX = mx + ox * ease * (1 + overshoot);
            this.endY = my + oy * ease * (1 + overshoot);

            let pad = Math.max(10, this.thickness * 0.55);
            if (this.pattern === "fixed" && this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, this.endX, this.endY, pad);

            const dt = deltaTime / 1000;

            const dx = this.endX - mx,
                dy = this.endY - my;
            const segLen = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / segLen,
                ny = dx / segLen;

            this._sparkCarry += this.sparksPerSecond * 1.35 * dt;
            while (this._sparkCarry >= 1) {
                this._sparkCarry -= 1;
                const u = Math.random() * 0.9;
                const px = mx + dx * u;
                const py = my + dy * u;
                const spread = this.thickness * 0.55 * (0.3 + Math.random());
                this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);

            if (t >= 1) {
                this._phase = "beam";
                this._phaseStart = this.elapsed;
            }

            return;
        }

        // beam
        if (this._phase !== "beam") return;

        // fixed
        if (this.pattern === "fixed" && this._fixedEnd && this._fixedBaseAngle != null) {
            const bounds = this._getBoundsRect();
            const dtSec = deltaTime / 1000;

            // fade logic
            const beginFade = () => {
                if (!this._fadeStart) this._fadeStart = this.elapsed;
                if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                    this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                    this.game.stopShake();
                    this.markedForDeletion = true;
                    return true;
                }
                return false;
            };

            if (this.beamMotionMode === "normal") {
                let desiredAngle = this._fixedBaseAngle;
                const pc = this._getPlayerCenter();
                if (pc) desiredAngle = Math.atan2(pc.y - my, pc.x - mx);

                if (this._dynAngle == null) this._dynAngle = this._fixedBaseAngle;

                let diff = this._wrapAngle(desiredAngle - this._dynAngle);
                if (Math.abs(diff) > this.followDeadzoneRad) {
                    const maxStep = this.followTurnRateRadPerSec * dtSec;
                    if (Math.abs(diff) <= maxStep) this._dynAngle = desiredAngle;
                    else this._dynAngle += Math.sign(diff) * maxStep;
                }

                const useAngle = this._dynAngle;
                const dx = Math.cos(useAngle);
                const dy = Math.sin(useAngle);

                const end = this._computeRayEndToBounds(mx, my, dx, dy, bounds.left, bounds.right, bounds.top, bounds.bottom, this._fixedEnd);
                this.endX = end.x;
                this.endY = end.y;

                const heldFor = this.elapsed - this._phaseStart;
                if (heldFor >= this.duration) {
                    if (beginFade()) return;
                }

                let pad = Math.max(10, this.thickness * 0.55);
                if (this.twinFixed) pad += this._getTwinHalfSep();
                this._setAabb(mx, my, this.endX, this.endY, pad);

                const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
                for (const v of variants) {
                    const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                    const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                    const segLen = Math.max(1, Math.hypot(dx2, dy2));
                    const nx = -dy2 / segLen, ny = dx2 / segLen;

                    this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                    while (this._sparkCarry >= 1) {
                        this._sparkCarry -= 1;
                        const u = Math.random() * 0.94;
                        const px = mx2 + dx2 * u;
                        const py = my2 + dy2 * u;
                        const spread = this.thickness * 0.55 * (0.25 + Math.random());
                        this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                    }

                    this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                    while (this._impactCarry >= 1) {
                        this._impactCarry -= 1;
                        const jitter = this.thickness * 0.35;
                        this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                    }

                    if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
                }

                this._updateSparks(deltaTime);
                this._updateRings(deltaTime);
                return;
            }

            if (this.beamMotionMode === "alternate") {
                const tOsc = (this.elapsed - this._phaseStart) / Math.max(1, this.alternateOscMs);

                // one oscillation then fade
                if (tOsc >= 1) {
                    if (beginFade()) return;
                }

                const wob = tOsc < 1 ? Math.sin(tOsc * Math.PI * 2) : 0;

                let desiredAngle = this._fixedBaseAngle;

                if (this.alternateMirrorMidX != null && this.alternateMirrorMidY != null) {
                    const midAngle = Math.atan2(this.alternateMirrorMidY - my, this.alternateMirrorMidX - mx);

                    if (this._mirrorBaseOffset == null) {
                        this._mirrorBaseOffset = this._wrapAngle(this._fixedBaseAngle - midAngle);
                    }

                    const baseOff = this._mirrorBaseOffset;
                    const baseAbs = Math.abs(baseOff);

                    let closeFrac = this.alternateCloseFrac;
                    const openFrac = this.alternateOpenFrac;

                    if (baseAbs <= this.alternateFullCloseIfOffsetBelowRad) {
                        const tt = baseAbs / Math.max(1e-6, this.alternateFullCloseIfOffsetBelowRad);
                        closeFrac = closeFrac + (1.0 - closeFrac) * (1.0 - tt);
                    }

                    const factor = wob >= 0 ? (1 - wob * closeFrac) : (1 + (-wob) * openFrac);

                    desiredAngle = midAngle + baseOff * factor;
                } else {
                    desiredAngle = this._fixedBaseAngle + wob * this.alternateOscAngleRad;
                }

                if (this._altAngle == null) this._altAngle = this._fixedBaseAngle;

                let diff = this._wrapAngle(desiredAngle - this._altAngle);
                if (Math.abs(diff) > this.followDeadzoneRad) {
                    const maxStep = this.followTurnRateRadPerSec * dtSec;
                    if (Math.abs(diff) <= maxStep) this._altAngle = desiredAngle;
                    else this._altAngle += Math.sign(diff) * maxStep;
                }

                const useAngle = this._altAngle;
                const dx = Math.cos(useAngle);
                const dy = Math.sin(useAngle);

                const end = this._computeRayEndToBounds(mx, my, dx, dy, bounds.left, bounds.right, bounds.top, bounds.bottom, this._fixedEnd);
                this.endX = end.x;
                this.endY = end.y;

                let pad = Math.max(10, this.thickness * 0.55);
                if (this.twinFixed) pad += this._getTwinHalfSep();
                this._setAabb(mx, my, this.endX, this.endY, pad);

                const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
                for (const v of variants) {
                    const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                    const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                    const segLen = Math.max(1, Math.hypot(dx2, dy2));
                    const nx = -dy2 / segLen, ny = dx2 / segLen;

                    this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                    while (this._sparkCarry >= 1) {
                        this._sparkCarry -= 1;
                        const u = Math.random() * 0.94;
                        const px = mx2 + dx2 * u;
                        const py = my2 + dy2 * u;
                        const spread = this.thickness * 0.55 * (0.25 + Math.random());
                        this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                    }

                    this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                    while (this._impactCarry >= 1) {
                        this._impactCarry -= 1;
                        const jitter = this.thickness * 0.35;
                        this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                    }

                    if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
                }

                this._updateSparks(deltaTime);
                this._updateRings(deltaTime);
                return;
            }

            // fixed, no motion
            this.endX = this._fixedEnd.x;
            this.endY = this._fixedEnd.y;

            const heldFor = this.elapsed - this._phaseStart;
            if (heldFor >= this.duration) {
                if (!this._fadeStart) this._fadeStart = this.elapsed;

                if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                    this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                    this.game.stopShake();
                    this.markedForDeletion = true;
                    return;
                }
            }

            let pad = Math.max(10, this.thickness * 0.55);
            if (this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, this.endX, this.endY, pad);

            const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
            for (const v of variants) {
                const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                const segLen = Math.max(1, Math.hypot(dx2, dy2));
                const nx = -dy2 / segLen, ny = dx2 / segLen;

                this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                while (this._sparkCarry >= 1) {
                    this._sparkCarry -= 1;
                    const u = Math.random() * 0.94;
                    const px = mx2 + dx2 * u;
                    const py = my2 + dy2 * u;
                    const spread = this.thickness * 0.55 * (0.25 + Math.random());
                    this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                }

                this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                while (this._impactCarry >= 1) {
                    this._impactCarry -= 1;
                    const jitter = this.thickness * 0.35;
                    this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                }

                if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);
            return;
        }

        // sweep beam
        const t = Math.min(1, (this.elapsed - this._phaseStart) / Math.max(1, this.duration));
        const p = this._pointOnSweepPath(t);

        this.endX = p.x;
        this.endY = p.y;

        if (t >= 1) {
            if (!this._fadeStart) this._fadeStart = this.elapsed;

            if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                this.game.stopShake();
                this.markedForDeletion = true;
                return;
            }
        }

        const pad = Math.max(10, this.thickness * 0.55);
        this._setAabb(mx, my, this.endX, this.endY, pad);

        const dt2 = deltaTime / 1000;
        const ex = this.endX,
            ey = this.endY;

        const dx = ex - mx,
            dy = ey - my;
        const segLen = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / segLen,
            ny = dx / segLen;

        this._sparkCarry += this.sparksPerSecond * dt2;
        while (this._sparkCarry >= 1) {
            this._sparkCarry -= 1;
            const u = Math.random() * 0.94;
            const px = mx + dx * u;
            const py = my + dy * u;
            const spread = this.thickness * 0.55 * (0.25 + Math.random());
            this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
        }

        this._impactCarry += this.impactSparksPerSecond * dt2;
        while (this._impactCarry >= 1) {
            this._impactCarry -= 1;
            const jitter = this.thickness * 0.35;
            this._spawnSpark(ex + (Math.random() - 0.5) * jitter, ey + (Math.random() - 0.5) * jitter, true);
        }

        if (Math.random() < 0.07) this._spawnRing(ex, ey, "impact");

        this._updateSparks(deltaTime);
        this._updateRings(deltaTime);
    }

    // telegraph helpers
    _fract(n) {
        return n - Math.floor(n);
    }
    _hash(n) {
        return this._fract(Math.sin(n) * 43758.5453123);
    }

    _buildBoltSegment(mx, my, tx, ty, u0, u1, ampPx, phase) {
        const dx = tx - mx,
            dy = ty - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len,
            uy = dy / len;
        const nx = -uy,
            ny = ux;

        const a = Math.max(0, Math.min(1, u0));
        const b = Math.max(0, Math.min(1, u1));
        const s0 = a * len;
        const s1 = b * len;

        const segPx = 16;
        const steps = Math.max(4, Math.min(22, Math.floor(Math.abs(s1 - s0) / segPx)));

        const pts = [];
        const time = this.elapsed * 0.001;

        for (let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 0 : i / steps;
            const s = s0 + (s1 - s0) * t;

            const px = mx + ux * s;
            const py = my + uy * s;

            const w1 = Math.sin(phase + time * 22.0 + t * 18.0);
            const w2 = Math.sin(phase * 0.73 + time * 31.0 + t * 37.0);
            const wob = w1 * 0.65 + w2 * 0.35;

            const mid = 1 - Math.abs(0.5 - t) * 2;
            const off = wob * ampPx * (0.25 + 0.75 * mid);

            pts.push({ x: px + nx * off, y: py + ny * off });
        }

        return pts;
    }

    _strokePolyline(ctx, pts) {
        if (!pts || pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
    }

    _drawSparkDisc(ctx, x, y, r, a) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.0);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
        g.addColorStop(0.25, `rgba(190,250,255,${0.45 * a})`);
        g.addColorStop(1, `rgba(0,160,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawTelegraphThreat(ctx, mx, my, tx, ty, tele, tCharge) {
        const dx = tx - mx,
            dy = ty - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len,
            uy = dy / len;
        const nx = -uy,
            ny = ux;

        const time = this.elapsed * 0.001;

        const ramp = Math.pow(Math.min(1, Math.max(0, (tCharge - 0.05) / 0.95)), 1.35);
        const power = tele * (0.7 + 0.7 * ramp);

        // baseline glow
        {
            const g = ctx.createLinearGradient(mx, my, tx, ty);
            g.addColorStop(0.0, `rgba(180,245,255,${0.03 * power})`);
            g.addColorStop(0.55, `rgba(120,220,255,${0.07 * power})`);
            g.addColorStop(1.0, `rgba(255,255,255,${0.09 * power})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = Math.max(8, this.thickness * (0.28 + 0.20 * ramp));
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }

        // strands
        {
            const strands = 6;
            for (let s = 0; s < strands; s++) {
                const phase = this._seed * 9.7 + s * 123.4;
                const pts = this._buildBoltSegment(
                    mx,
                    my,
                    tx,
                    ty,
                    0.0,
                    1.0,
                    this.thickness * (0.10 + 0.05 * s) * (0.75 + 0.65 * ramp),
                    phase
                );

                ctx.lineWidth = Math.max(2.0, this.thickness * 0.055);
                ctx.strokeStyle = `rgba(170,245,255,${0.18 * power})`;
                this._strokePolyline(ctx, pts);
            }
        }

        // surges
        {
            const surges = 8;
            const speed = 1.7 + 1.2 * this.turbulence;
            const segU = Math.min(0.24, Math.max(0.11, 300 / Math.max(1, len)));

            for (let i = 0; i < surges; i++) {
                const uHead = this._fract(time * speed + i * 0.19 + this._seed * 0.11);
                const u0 = Math.max(0, uHead - segU);
                const u1 = Math.min(1, uHead);

                const amp =
                    this.thickness *
                    (0.16 + 0.26 * ramp) *
                    (0.75 + 0.35 * this._hash(i * 77.7 + Math.floor(time * 10)));

                const phase = this._seed * 50 + i * 777.7;
                const pts = this._buildBoltSegment(mx, my, tx, ty, u0, u1, amp, phase);

                const sHead = u1 * len;
                const hx = mx + ux * sHead;
                const hy = my + uy * sHead;

                const ax = pts[0].x,
                    ay = pts[0].y;
                const bx = pts[pts.length - 1].x,
                    by = pts[pts.length - 1].y;

                const pulse = 0.65 + 0.35 * Math.sin(phase + time * 14.0);
                const aCore = (0.35 + 0.65 * ramp) * power * (0.55 + 0.45 * pulse);

                {
                    const g = ctx.createLinearGradient(ax, ay, bx, by);
                    g.addColorStop(0.0, `rgba(120,220,255,0)`);
                    g.addColorStop(0.55, `rgba(140,235,255,${0.18 * aCore})`);
                    g.addColorStop(1.0, `rgba(255,255,255,${0.45 * aCore})`);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = Math.max(4.0, this.thickness * (0.095 + 0.035 * ramp));
                    this._strokePolyline(ctx, pts);
                }

                {
                    const g = ctx.createLinearGradient(ax, ay, bx, by);
                    g.addColorStop(0.0, `rgba(255,255,255,0)`);
                    g.addColorStop(0.65, `rgba(210,255,255,${0.28 * aCore})`);
                    g.addColorStop(1.0, `rgba(255,255,255,${1.0 * aCore})`);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = Math.max(2.2, this.thickness * (0.050 + 0.020 * ramp));
                    this._strokePolyline(ctx, pts);
                }

                this._drawSparkDisc(ctx, hx, hy, Math.max(2.2, this.thickness * 0.040), 0.95 * aCore);

                const crumbs = 8 + Math.floor(10 * ramp);
                for (let c = 0; c < crumbs; c++) {
                    const rr = this._hash(i * 999 + c * 37 + Math.floor(time * 18));
                    const uu = u0 + (u1 - u0) * rr;
                    const ss = uu * len;

                    const baseX = mx + ux * ss;
                    const baseY = my + uy * ss;

                    const side =
                        (this._hash(rr * 1000 + c * 13.1) - 0.5) *
                        this.thickness *
                        (0.45 + 0.75 * ramp);
                    const fore = (this._hash(rr * 2000 + c * 9.2) - 0.5) * 22;

                    const px = baseX + nx * side + ux * fore;
                    const py = baseY + ny * side + uy * fore;

                    const a = aCore * (0.20 + 0.35 * this._hash(c * 7.7 + i * 1.3));
                    const r =
                        Math.max(1.2, this.thickness * 0.014) *
                        (1.0 + 1.8 * this._hash(c * 44.4 + i * 2.2));

                    this._drawSparkDisc(ctx, px, py, r, a);
                }
            }
        }

        // impact crackle at target
        {
            const jitter = this.thickness * (0.40 + 0.55 * ramp);
            const crack = 0.42 * power * (0.35 + 0.65 * ramp);

            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * Math.PI * 2 + Math.sin(this._seed + time * 6) * 0.2;
                const r0 = jitter * (0.35 + 0.25 * this._hash(k * 9.1));
                const r1 = jitter * (1.05 + 0.45 * this._hash(k * 19.7));

                const ax = tx + Math.cos(ang) * r0;
                const ay = ty + Math.sin(ang) * r0;
                const bx = tx + Math.cos(ang) * r1;
                const by = ty + Math.sin(ang) * r1;

                ctx.lineWidth = Math.max(2.2, this.thickness * 0.042);
                ctx.strokeStyle = `rgba(255,255,255,${crack})`;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }

            this._drawSparkDisc(ctx, tx, ty, Math.max(3.6, this.thickness * 0.060), 1.0 * crack);
        }
    }

    _buildBeamPolyline(mx, my, ex, ey, intensity) {
        const dx = ex - mx,
            dy = ey - my;
        const len = Math.max(1, Math.hypot(dx, dy));

        const seg = Math.max(16, Math.min(64, Math.floor(len / Math.max(14, this.beamSegmentPx))));
        const nx = -dy / len,
            ny = dx / len;

        const pts = [];
        const time = this.elapsed;

        const ampBase =
            this.thickness *
            0.28 *
            (0.35 + 0.65 * this.turbulence) *
            (0.55 + 0.45 * this.beamJaggedness);

        for (let i = 0; i <= seg; i++) {
            const t = i / seg;

            const px = mx + dx * t;
            const py = my + dy * t;

            const w1 = Math.sin(this._seed * 0.7 + time * 0.02 + t * 10.5);
            const w2 = Math.sin(this._seed * 1.3 + time * 0.028 + t * 17.0);
            const w3 = Math.sin(this._seed * 2.1 + time * 0.016 + t * 6.0);

            const midBoost = 1 - Math.abs(0.5 - t) * 2;
            const amp = ampBase * (0.35 + 0.65 * midBoost) * (0.6 + 0.4 * intensity);

            const off = (w1 * 0.55 + w2 * 0.3 + w3 * 0.15) * amp;

            pts.push({ x: px + nx * off, y: py + ny * off });
        }

        return pts;
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        const mx = this.mouthX,
            my = this.mouthY;
        const ex = this.endX,
            ey = this.endY;
        if (![mx, my, ex, ey].every(Number.isFinite)) return;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        let fade = 1;
        if (this._fadeStart) {
            const t = (this.elapsed - this._fadeStart) / Math.max(1, this.fadeOutMs);
            fade = Math.max(0, 1 - t);
        }

        const flick = 0.82 + 0.18 * Math.sin((this._seed + this.elapsed) * 0.034 * (0.7 + this.flicker));

        const phaseBoost =
            this._phase === "charge"
                ? 0.25 + 0.75 * Math.min(1, this.elapsed / Math.max(1, this.chargeMs))
                : this._phase === "burst"
                    ? 1.15
                    : 1;

        const intensity = fade * flick * phaseBoost;

        // charge
        if (this._phase === "charge") {
            const t = Math.min(1, this.elapsed / Math.max(1, this.chargeMs));
            const pulse = 0.5 + 0.5 * Math.sin((this._seed + this.elapsed) * 0.025);
            const grow = (0.65 + 0.55 * t) * (0.82 + 0.18 * pulse);

            const rCore = this.thickness * (1.05 * grow);
            const rAura = this.thickness * (2.35 * grow);
            const rBloom = this.thickness * (3.65 * grow);

            // bloom
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rBloom);
                g.addColorStop(0.0, `rgba(255,255,255,${0.22 * intensity})`);
                g.addColorStop(0.18, `rgba(160,240,255,${0.20 * intensity})`);
                g.addColorStop(0.45, `rgba(40,170,255,${0.16 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rBloom, 0, Math.PI * 2);
                ctx.fill();
            }
            // aura
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rAura);
                g.addColorStop(0.0, `rgba(255,255,255,${0.38 * intensity})`);
                g.addColorStop(0.22, `rgba(180,245,255,${0.30 * intensity})`);
                g.addColorStop(0.55, `rgba(40,170,255,${0.24 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rAura, 0, Math.PI * 2);
                ctx.fill();
            }
            // core
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rCore);
                g.addColorStop(0.0, `rgba(255,255,255,${0.98 * intensity})`);
                g.addColorStop(0.35, `rgba(220,252,255,${0.78 * intensity})`);
                g.addColorStop(0.75, `rgba(120,220,255,${0.55 * intensity})`);
                g.addColorStop(1.0, `rgba(0,140,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rCore, 0, Math.PI * 2);
                ctx.fill();
            }
            // rings
            for (let i = 0; i < this._rings.length; i++) {
                const r = this._rings[i];
                if (r.kind !== "charge") continue;

                const a = r.alpha * intensity;
                if (a <= 0.01) continue;

                ctx.lineWidth = Math.max(2, this.thickness * 0.1);

                const ringG = ctx.createRadialGradient(r.x, r.y, Math.max(0, r.r * 0.6), r.x, r.y, r.r);
                ringG.addColorStop(0.0, `rgba(255,255,255,0)`);
                ringG.addColorStop(0.7, `rgba(180,245,255,${0.16 * a})`);
                ringG.addColorStop(1.0, `rgba(0,140,255,0)`);
                ctx.strokeStyle = ringG;

                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            // sparks
            for (let i = 0; i < this._sparks.length; i++) {
                const p = this._sparks[i];
                const a = p.alpha * intensity;
                if (a <= 0.01) continue;

                const rr = p.size;
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.4);

                if (p.kind === "arc") {
                    grad.addColorStop(0, `rgba(255,255,255,${0.65 * a})`);
                    grad.addColorStop(0.25, `rgba(190,250,255,${0.42 * a})`);
                    grad.addColorStop(1, `rgba(0,160,255,0)`);
                } else {
                    grad.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
                    grad.addColorStop(0.3, `rgba(160,240,255,${0.55 * a})`);
                    grad.addColorStop(1, `rgba(0,140,255,0)`);
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rr * 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
            // telegraph
            {
                const p0 = this._pointOnPath(0);
                const tele = intensity * (t * t);
                if (tele > 0.02) {
                    const variants = this._getBeamVariants(mx, my, p0.x, p0.y);
                    for (const v of variants) {
                        this._drawTelegraphThreat(ctx, v.mx, v.my, v.ex, v.ey, tele, t);
                    }
                }
            }

            if (this.game.debug) {
                ctx.globalCompositeOperation = "source-over";
                if (this._aabbDebug) {
                    ctx.strokeStyle = "rgba(0,255,255,0.6)";
                    ctx.strokeRect(this._aabbDebug.x, this._aabbDebug.y, this._aabbDebug.w, this._aabbDebug.h);
                }
            }

            ctx.restore();
            return;
        }

        // beam/burst/fade
        const beamLen = Math.max(1, Math.hypot(ex - mx, ey - my));
        const sourceAtten = Math.min(1, beamLen / (this.thickness * 6));

        const auraW = this.thickness * this.auraThicknessMult;
        const bloomW = this.thickness * this.bloomThicknessMult;
        const coreW = Math.max(3, this.thickness * this.coreThicknessMult);

        const variants = this._getBeamVariants(mx, my, ex, ey);

        const variantNorm = 1 / Math.max(1, variants.length);

        const mouthIntensity =
            intensity *
            (0.25 + 0.75 * sourceAtten) *
            (this.sourceAlphaMult ?? 1) *
            variantNorm;

        for (const v of variants) {
            const mx2 = v.mx,
                my2 = v.my,
                ex2 = v.ex,
                ey2 = v.ey;

            const pts = this._buildBeamPolyline(mx2, my2, ex2, ey2, intensity);

            // bloom
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.10 * mouthIntensity})`);
                g.addColorStop(0.12, `rgba(150,235,255,${0.30 * intensity})`);
                g.addColorStop(0.55, `rgba(40,170,255,${0.26 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,${0.10 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = bloomW;
                this._strokePolyline(ctx, pts);
            }
            // aura
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.16 * mouthIntensity})`);
                g.addColorStop(0.18, `rgba(140,225,255,${0.48 * intensity})`);
                g.addColorStop(0.62, `rgba(20,155,255,${0.38 * intensity})`);
                g.addColorStop(1.0, `rgba(0,110,255,${0.20 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = auraW;
                this._strokePolyline(ctx, pts);
            }
            // strands
            {
                const strands = 7;
                for (let s = 0; s < strands; s++) {
                    const phase = this._seed + s * 199.9;

                    ctx.strokeStyle = `rgba(200,250,255,${0.11 * intensity})`;
                    ctx.lineWidth = Math.max(1.5, this.thickness * 0.08);

                    const strandPts = [];
                    for (let i = 0; i < pts.length; i++) {
                        const t = i / Math.max(1, pts.length - 1);

                        const p = pts[i];
                        const pPrev = pts[Math.max(0, i - 1)];
                        const pNext = pts[Math.min(pts.length - 1, i + 1)];

                        const dx = pNext.x - pPrev.x;
                        const dy = pNext.y - pPrev.y;
                        const L = Math.max(1, Math.hypot(dx, dy));
                        const nx = -dy / L,
                            ny = dx / L;

                        const w =
                            Math.sin(phase + this.elapsed * 0.03 + t * (10 + s * 0.8)) *
                            Math.sin(phase * 0.7 + this.elapsed * 0.02 + t * (6 + s * 0.6));

                        const midBoost = 1 - Math.abs(0.5 - t) * 2;
                        const amp =
                            this.thickness *
                            0.26 *
                            (0.25 + 0.75 * midBoost) *
                            (0.35 + 0.65 * this.turbulence);

                        const off = w * amp * (0.28 + 0.18 * s);
                        strandPts.push({ x: p.x + nx * off, y: p.y + ny * off });
                    }

                    this._strokePolyline(ctx, strandPts);
                }
            }
            // core
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.35 * mouthIntensity})`);
                g.addColorStop(0.20, `rgba(255,255,255,${0.98 * intensity})`);
                g.addColorStop(0.55, `rgba(215,250,255,${0.92 * intensity})`);
                g.addColorStop(0.80, `rgba(120,220,255,${0.78 * intensity})`);
                g.addColorStop(1.0, `rgba(255,255,255,${0.62 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = coreW;
                this._strokePolyline(ctx, pts);
            }
            // mouth flare
            {
                const pulse = 0.65 + 0.35 * Math.sin((this._seed + this.elapsed) * 0.03);

                const r1 = this.thickness * (1.05 + 0.18 * pulse);
                const flare = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, r1 * 2.2);

                flare.addColorStop(0, `rgba(255,255,255,${0.45 * mouthIntensity})`);
                flare.addColorStop(0.18, `rgba(190,248,255,${0.32 * mouthIntensity})`);
                flare.addColorStop(0.52, `rgba(40,170,255,${0.22 * mouthIntensity})`);
                flare.addColorStop(1, `rgba(0,140,255,0)`);

                ctx.fillStyle = flare;
                ctx.beginPath();
                ctx.arc(mx2, my2, r1 * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            // impact flare
            {
                const r2 = this.thickness * 1.25;
                const impact = ctx.createRadialGradient(ex2, ey2, 0, ex2, ey2, r2 * 4.2);
                impact.addColorStop(0, `rgba(255,255,255,${0.90 * intensity})`);
                impact.addColorStop(0.14, `rgba(190,250,255,${0.68 * intensity})`);
                impact.addColorStop(0.36, `rgba(70,210,255,${0.52 * intensity})`);
                impact.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = impact;
                ctx.beginPath();
                ctx.arc(ex2, ey2, r2 * 4.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // impact rings
        for (let i = 0; i < this._rings.length; i++) {
            const r = this._rings[i];
            if (r.kind !== "impact") continue;

            const a = r.alpha * intensity;
            if (a <= 0.01) continue;

            ctx.lineWidth = Math.max(2, this.thickness * 0.12);
            const ringG = ctx.createRadialGradient(r.x, r.y, Math.max(0, r.r * 0.5), r.x, r.y, r.r);
            ringG.addColorStop(0.0, `rgba(255,255,255,0)`);
            ringG.addColorStop(0.72, `rgba(200,250,255,${0.18 * a})`);
            ringG.addColorStop(1.0, `rgba(0,140,255,0)`);
            ctx.strokeStyle = ringG;

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        // sparks
        for (let i = 0; i < this._sparks.length; i++) {
            const p = this._sparks[i];
            const a = p.alpha * intensity;
            if (a <= 0.01) continue;

            const rr = p.size;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.25);
            grad.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
            grad.addColorStop(0.3, `rgba(160,240,255,${0.55 * a})`);
            grad.addColorStop(1, `rgba(0,140,255,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rr * 2.25, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.game.debug) {
            ctx.globalCompositeOperation = "source-over";
            if (this._aabbDebug) {
                ctx.strokeStyle = "rgba(0,255,255,0.6)";
                ctx.strokeRect(this._aabbDebug.x, this._aabbDebug.y, this._aabbDebug.w, this._aabbDebug.h);
            }
        }

        ctx.restore();
    }
}
