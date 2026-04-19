import { normalizeDelta } from '../../config/constants.js';
import { screenColourFadeIn, screenColourFadeOut } from '../../animations/screenColourFade.js';
import { FIREDOG_FRAME } from '../../config/skinsAndCosmetics.js';

export const demoUpdatersMixin = {
    // ---------------- demo State Factories ----------------
    _createEnergyDemoState() {
        return { active: false, timer: 0, value: 35, dir: 'down', exhausted: false };
    },

    _createDivingDemoState() {
        return {
            active: false,
            phase: 'wait',
            timer: 0,
            waitMs: 2000,
            activeMs: 500,
            cooldownMs: 300,
            activeRemainingMs: 0,
            cooldownElapsedMs: 0,
        };
    },

    _createFireballDemoState() {
        return {
            active: false,
            state: 'idle',
            x: 0,
            y: 0,
            size: 10,
            angle: 0,
            timer: 0,
            cdTimer: 0,
            cooldownMs: 1200,
            energy: 100,
        };
    },

    _createInvisibleDemoState() {
        return {
            active: false,
            phase: 'wait',
            timer: 0,
            waitMs: 1000,
            activeMs: 5000,
            cooldownMs: 35000,
            activeRemainingMs: 0,
            cooldownElapsedMs: 0,
        };
    },

    _createDashDemoState() {
        return {
            active: false,
            phase: 'wait',   // 'wait' | 'dashing1' | 'afterFirst' | 'dashing2' | 'cooldown'
            timer: 0,
            waitMs: 1000,
            dashDuration: 180,
            betweenMs: 500,
            secondWindowMs: 7000,
            simulateSecondAtMs: 5000,
            cooldownMs: 60000,
            betweenElapsedMs: 0,
            secondWindowRemainingMs: 0,
            energy: 100,
            maxEnergy: 100,
            // visual
            playerX: 120,
            startX: 120,
            spriteFrameX: 0,
            spriteFrameTimer: 0,
            fireArcs: [],
            fireTimer: 0,
            ghosts: [],
            ghostTimer: 0,
        };
    },

    // ---------------- energy demo UI-only ----------------
    _resetEnergyDemo(cfg) {
        const safeStart = Number.isFinite(Number(cfg?.start)) ? Number(cfg.start) : 35;
        const e = this._demoEnergy;
        e.active = true;
        e.timer = 0;
        e.value = safeStart;
        e.dir = 'down';
        e.exhausted = false;
    },

    _updateEnergyDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoEnergy.active) {
            this._resetEnergyDemo(cfg);
        }

        const min = this._num(cfg.min, 0);
        const max = this._num(cfg.max, 35);
        const recoverAt = this._num(cfg.recoverAt, 20);

        const drainTickMs = Math.max(1, this._num(cfg.drainTickMs, 100));
        const drainPerTick = this._num(cfg.drainPerTick, 0.4);

        const regenTickMs = Math.max(1, this._num(cfg.regenTickMs, 70));
        const regenPerTick = this._num(cfg.regenPerTick, 0.4);

        const dt = Math.max(0, Number(deltaTime) || 0);
        const e = this._demoEnergy;
        e.timer += dt;

        const alwaysDown = cfg?.alwaysDown === true;

        while (true) {
            const tickMs = alwaysDown ? drainTickMs : (e.dir === 'down' ? drainTickMs : regenTickMs);
            if (e.timer < tickMs) break;
            e.timer -= tickMs;

            if (alwaysDown) {
                e.value -= drainPerTick;
                if (e.value <= min + 1e-9) e.value = max;
            } else if (e.dir === 'down') {
                e.value = Math.max(min, e.value - drainPerTick);
                if (e.value <= min + 1e-9) { e.value = min; e.dir = 'up'; }
            } else {
                e.value = Math.min(max, e.value + regenPerTick);
                if (e.value >= max - 1e-9) { e.value = max; e.dir = 'down'; }
            }
        }

        const value = e.value;

        if (alwaysDown) {
            e.exhausted = false;
        } else {
            if (value <= min + 1e-9) e.exhausted = true;
            if (e.exhausted && value >= recoverAt) e.exhausted = false;
        }

        return { maxEnergy: 100, energy: value, isEnergyExhausted: e.exhausted };
    },

    // ---------------- fireball demo UI-only ----------------
    _resetFireballDemo(cfg) {
        const maxEnergy = Number.isFinite(Number(cfg?.maxEnergy)) ? Number(cfg.maxEnergy) : 100;
        const startEnergy = Number.isFinite(Number(cfg?.startEnergy)) ? Number(cfg.startEnergy) : maxEnergy;

        const initialSize = Number.isFinite(Number(cfg?.initialSize)) ? Number(cfg.initialSize) : 10;
        const cooldownMs = Number.isFinite(Number(cfg?.cooldownMs)) ? Number(cfg.cooldownMs) : 1200;

        const f = this._demoFireball;
        f.active = true;
        f.state = 'idle';
        f.timer = 0;

        f.energy = startEnergy;

        f.cooldownMs = Math.max(0, cooldownMs);
        f.cdTimer = f.cooldownMs;

        f.x = Number(cfg?.startX) || 0;
        f.y = Number(cfg?.startY) || 0;

        f.size = initialSize;
        f.angle = 0;
    },

    _updateFireballDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoFireball.active) {
            this._resetFireballDemo(cfg);
        }

        const dt = Math.max(0, Number(deltaTime) || 0);
        const dtSec = dt / 1000;

        const maxEnergy = this._num(cfg.maxEnergy, 100);
        const cost = this._num(cfg.energyCost, 8);
        const regenPerSec = this._num(cfg.regenPerSec, 6);
        const shotDelayMs = Math.max(0, this._num(cfg.shotDelayMs, 200));

        const speedPxPerSec = this._num(cfg.speedPxPerSec, 900);
        const dir = (cfg.direction === 'left') ? -1 : 1;

        const offscreenPad = this._num(cfg.offscreenPad, 120);

        const initialSize = this._num(cfg.initialSize, 10);
        const maxSize = this._num(cfg.maxSize, 40);
        const growthPerSec = this._num(cfg.growthPerSec, 60);
        const rotationPerSec = this._num(cfg.rotationPerSec, 12);

        const cooldownMs = this._num(cfg.cooldownMs, this._demoFireball.cooldownMs ?? 1200);

        const f = this._demoFireball;
        f.cooldownMs = Math.max(0, cooldownMs);

        if (f.cdTimer < f.cooldownMs) f.cdTimer = Math.min(f.cooldownMs, f.cdTimer + dt);
        f.energy = Math.min(maxEnergy, f.energy + Math.max(0, regenPerSec) * dtSec);

        f.timer += dt;

        const atFullEnergy = f.energy >= (maxEnergy - 1e-6);
        const cooldownReady = f.cdTimer >= (f.cooldownMs - 1e-6);

        if (f.state === 'idle') {
            if (atFullEnergy && cooldownReady && f.timer >= shotDelayMs) {
                f.timer = 0;
                f.state = 'flying';

                f.energy = Math.max(0, f.energy - cost);
                f.cdTimer = 0;

                f.size = initialSize;
                f.angle = 0;

                const sx = Number(cfg.startX);
                const sy = Number(cfg.startY);
                if (Number.isFinite(sx)) f.x = sx;
                if (Number.isFinite(sy)) f.y = sy;
            }
            if (!atFullEnergy || !cooldownReady) f.timer = 0;
        } else if (f.state === 'flying') {
            f.x += dir * (speedPxPerSec * dtSec);
            f.angle += rotationPerSec * dtSec;

            if (f.size < maxSize) {
                const sizeChange = Math.min(maxSize - f.size, growthPerSec * dtSec);
                f.size += sizeChange;
                f.y -= sizeChange / 2;
            }

            const outRight = (f.x - f.size) > (this.game.width + offscreenPad);
            const outLeft = (f.x + f.size) < (0 - offscreenPad);

            if ((dir === 1 && outRight) || (dir === -1 && outLeft)) {
                f.state = 'idle';
                f.timer = 0;

                const sx = Number(cfg.startX);
                const sy = Number(cfg.startY);
                if (Number.isFinite(sx)) f.x = sx;
                if (Number.isFinite(sy)) f.y = sy;

                f.size = initialSize;
                f.angle = 0;
            }
        }

        return {
            maxEnergy,
            energy: f.energy,
            isEnergyExhausted: false,
            fireballCooldown: f.cooldownMs,
            fireballTimer: f.cdTimer,
        };
    },

    // ---------------- timed phase helpers (invisible/diving) ----------------
    _resetTimedPhases(state, cfg, defaults) {
        const waitMs = Math.max(0, this._num(cfg?.waitMs, defaults.waitMs));
        const activeMs = Math.max(0, this._num(cfg?.activeMs, defaults.activeMs));
        const cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, defaults.cooldownMs));

        state.active = true;
        state.phase = 'wait';
        state.timer = 0;

        state.waitMs = waitMs;
        state.activeMs = activeMs;
        state.cooldownMs = cooldownMs;

        state.activeRemainingMs = activeMs;
        state.cooldownElapsedMs = 0;
    },

    _updateTimedPhases(state, deltaTime, cfg, defaults) {
        const dt = Math.max(0, Number(deltaTime) || 0);

        state.waitMs = Math.max(0, this._num(cfg?.waitMs, state.waitMs || defaults.waitMs));
        state.activeMs = Math.max(0, this._num(cfg?.activeMs, state.activeMs || defaults.activeMs));
        state.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, state.cooldownMs || defaults.cooldownMs));

        if (state.phase === 'wait') {
            state.timer += dt;
            if (state.timer >= state.waitMs) {
                state.phase = 'active';
                state.timer = 0;
                state.activeRemainingMs = state.activeMs;
            }
        } else if (state.phase === 'active') {
            state.activeRemainingMs = Math.max(0, state.activeRemainingMs - dt);
            if (state.activeRemainingMs <= 0) {
                state.phase = 'cooldown';
                state.timer = 0;
                state.cooldownElapsedMs = 0;
            }
        } else if (state.phase === 'cooldown') {
            state.cooldownElapsedMs = Math.min(state.cooldownMs, state.cooldownElapsedMs + dt);
            if (state.cooldownElapsedMs >= state.cooldownMs) {
                state.phase = 'wait';
                state.timer = 0;
            }
        }

        return dt;
    },

    // ---------------- invisible demo UI-only ----------------
    _resetInvisibleDemo(cfg) {
        this._resetTimedPhases(this._demoInvisible, cfg, { waitMs: 1000, activeMs: 5000, cooldownMs: 35000 });
        this._demoInvisibleColourOpacity = 0;
    },

    _updateInvisibleDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoInvisible.active) {
            this._resetInvisibleDemo(cfg);
        }

        const i = this._demoInvisible;
        this._updateTimedPhases(i, deltaTime, cfg, { waitMs: 1000, activeMs: 5000, cooldownMs: 35000 });

        if (i.phase === 'cooldown' && i.cooldownElapsedMs >= 10000) {
            this._resetInvisibleDemo(cfg);
        }

        const isActive = i.phase === 'active';
        this._drawInvisibleTintInternal(isActive);

        const cooldownMs = i.cooldownMs;

        if (isActive) {
            return {
                isInvisible: true,
                invisibleActiveCooldownTimer: i.activeRemainingMs,
                invisibleCooldown: cooldownMs,
                invisibleTimer: cooldownMs,
            };
        }

        const longCdElapsed = (i.phase === 'cooldown') ? i.cooldownElapsedMs : cooldownMs;

        return {
            isInvisible: false,
            invisibleActiveCooldownTimer: 0,
            invisibleCooldown: cooldownMs,
            invisibleTimer: Math.min(cooldownMs, longCdElapsed),
        };
    },

    // ---------------- diving demo UI-only ----------------
    _resetDivingDemo(cfg) {
        this._resetTimedPhases(this._demoDiving, cfg, { waitMs: 2000, activeMs: 500, cooldownMs: 300 });
    },

    _updateDivingDemo(_deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        const COOLDOWN_MS = this._num(cfg?.cooldownMs, 300);
        const seq = this._demoDivingSeq;
        const divingState = this.game.player?.states?.[5];

        const isActive = seq?.phase === 'dive';
        const inCooldown = seq?.phase === 'settle';
        const cooldownElapsed = inCooldown ? Math.min(seq.timer, COOLDOWN_MS) : COOLDOWN_MS;

        return {
            currentState: isActive && divingState
                ? divingState
                : (this.game.player?.states?.[8] ?? this.game.player?.currentState),
            divingCooldown: COOLDOWN_MS,
            divingTimer: cooldownElapsed,
        };
    },

    // ---------------- dash demo UI-only ----------------
    _resetDashDemo(cfg) {
        const d = this._demoDash;

        d.active = true;
        d.phase = 'wait';
        d.timer = 0;

        d.waitMs = Math.max(0, this._num(cfg?.waitMs, 1000));
        d.betweenMs = Math.max(0, this._num(cfg?.betweenMs, 500));
        d.secondWindowMs = Math.max(0, this._num(cfg?.secondWindowMs, 7000));
        d.simulateSecondAtMs = Math.max(0, this._num(cfg?.simulateSecondAtMs, 2000));
        d.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, 60000));

        d.betweenElapsedMs = d.betweenMs;
        d.secondWindowRemainingMs = 0;
        d.dashCooldownElapsedMs = d.cooldownMs;

        d.playerX = d.startX;
        d.spriteFrameX = 0;
        d.spriteFrameTimer = 0;
        d.fireArcs = [];
        d.fireTimer = 0;
        d.ghosts = [];
        d.ghostTimer = 0;

        const maxEnergy = Number.isFinite(Number(cfg?.maxEnergy)) ? Number(cfg.maxEnergy) : 100;
        const startEnergy = Number.isFinite(Number(cfg?.startEnergy)) ? Number(cfg.startEnergy) : maxEnergy;

        d.maxEnergy = maxEnergy;
        d.energy = Math.min(maxEnergy, Math.max(0, startEnergy));
    },

    _updateDashDemo(deltaTime, cfg) {
        if (!cfg || cfg.enabled !== true) return null;

        if (this._lastPageIndex !== this.currentPage || !this._demoDash.active) {
            this._resetDashDemo(cfg);
        }

        const d = this._demoDash;
        const dt = Math.max(0, Number(deltaTime) || 0);
        const dtSec = dt / 1000;
        const dtScale = normalizeDelta(dt);

        d.waitMs = Math.max(0, this._num(cfg?.waitMs, d.waitMs || 1000));
        d.betweenMs = Math.max(0, this._num(cfg?.betweenMs, d.betweenMs || 500));
        d.secondWindowMs = Math.max(0, this._num(cfg?.secondWindowMs, d.secondWindowMs || 7000));
        d.simulateSecondAtMs = Math.max(0, this._num(cfg?.simulateSecondAtMs, d.simulateSecondAtMs || 5000));
        d.cooldownMs = Math.max(0, this._num(cfg?.cooldownMs, d.cooldownMs || 60000));

        const maxEnergy = this._num(cfg?.maxEnergy, d.maxEnergy ?? 100);
        d.maxEnergy = maxEnergy;
        const energyCost = this._num(cfg?.energyCost, 15);
        const regenPerSec = this._num(cfg?.regenPerSec, 5.7);

        d.energy = Math.min(maxEnergy,
            (Number.isFinite(Number(d.energy)) ? d.energy : maxEnergy) + Math.max(0, regenPerSec) * dtSec);

        const canSpend = () => d.energy >= (energyCost - 1e-6);
        const spend = () => { d.energy = Math.max(0, d.energy - energyCost); };

        const DASH1_VX = 1.8;
        const DASH2_VX = 3.15;
        const DASH_DURATION = 180;
        const FIRE_INTERVAL_MS = 16;
        const GHOST_INTERVAL_MS = 20;
        const MAX_GHOSTS = 4;
        const { height: FH } = FIREDOG_FRAME;
        const ROW_RUNNING = 3;
        const FRAME_INTERVAL_DASH = 1000 / 20;
        const FRAME_INTERVAL_IDLE = 1000 / 20;
        const MAX_FRAME_RUNNING = 8;
        const MAX_FRAME_STANDING = 6;
        const ROW_STANDING = 0;

        const isDashing = d.phase === 'dashing1' || d.phase === 'dashing2';
        const groundY = this.game.height - this.game.groundMargin;
        const mouthX = d.playerX + 48;
        const mouthY = groundY - FH + FH * 0.52;

        // ---- sprite frame ----
        const spriteRow = isDashing ? ROW_RUNNING : ROW_STANDING;
        const maxFrame = isDashing ? MAX_FRAME_RUNNING : MAX_FRAME_STANDING;
        const frameInterval = isDashing ? FRAME_INTERVAL_DASH : FRAME_INTERVAL_IDLE;
        if (!Array.isArray(d.fireArcs)) d.fireArcs = [];
        if (!Array.isArray(d.ghosts)) d.ghosts = [];
        d.spriteFrameTimer = (d.spriteFrameTimer || 0) + dt;
        while (d.spriteFrameTimer >= frameInterval) {
            d.spriteFrameTimer -= frameInterval;
            d.spriteFrameX = ((d.spriteFrameX || 0) + 1) % (maxFrame + 1);
        }

        // ---- fire and ghost spawning during dash phases ----
        if (isDashing) {
            d.fireTimer = (d.fireTimer || 0) + dt;
            while (d.fireTimer >= FIRE_INTERVAL_MS) {
                d.fireTimer -= FIRE_INTERVAL_MS;
                d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                if (Math.random() < 0.35) {
                    d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                    d.fireArcs.push(this._spawnDemoFireArc(mouthX, mouthY, d.playerX));
                }
            }
            d.ghostTimer = (d.ghostTimer || 0) + dt;
            while (d.ghostTimer >= GHOST_INTERVAL_MS) {
                d.ghostTimer -= GHOST_INTERVAL_MS;
                d.ghosts.unshift({ x: d.playerX, frameX: d.spriteFrameX, frameY: spriteRow, alpha: 0.55 });
                if (d.ghosts.length > MAX_GHOSTS) d.ghosts.pop();
            }
        }

        const GAME_SPEED = this.game.normalSpeed ?? 6;

        // ---- update fire arcs ----
        for (const arc of d.fireArcs) {
            arc.age += dt;
            if (arc.age < arc.followMs) {
                arc.x += (d.playerX - arc.lastPlayerX) * arc.followFactor;
                arc.lastPlayerX = d.playerX;
            }
            arc.speedX *= Math.pow(arc.drag, dtScale);
            arc.speedY *= Math.pow(arc.damp, dtScale);
            arc.x -= (arc.speedX + GAME_SPEED) * dtScale;
            arc.y -= arc.speedY * dtScale;
            arc.size *= Math.pow(0.97, dtScale);
            arc.angle += arc.va * dtScale;
            arc.x += Math.sin(arc.angle * 4) * arc.wobbleAmp;
        }
        d.fireArcs = d.fireArcs.filter(a => a.size >= 0.5);

        // ---- update ghosts ----
        for (const g of d.ghosts) g.alpha = Math.max(0, g.alpha - 0.06 * dtScale);
        d.ghosts = d.ghosts.filter(g => g.alpha > 0.02);

        // ---- phase transitions ----
        d.timer += dt;

        if (d.phase === 'wait') {
            if (d.timer >= d.waitMs) {
                if (canSpend()) spend();
                d.phase = 'dashing1';
                d.timer = 0;
                d.fireTimer = 0;
                d.ghostTimer = 0;
                d.spriteFrameX = 0;
                d.playerX = d.startX;
                d.betweenElapsedMs = 0;
                d.secondWindowRemainingMs = d.secondWindowMs;
            }
        } else if (d.phase === 'dashing1') {
            d.playerX += DASH1_VX * dt;
            d.betweenElapsedMs = Math.min(d.betweenMs, d.betweenElapsedMs + dt);
            d.secondWindowRemainingMs = Math.max(0, d.secondWindowRemainingMs - dt);
            if (d.timer >= DASH_DURATION) {
                d.phase = 'afterFirst';
                d.timer = 0;
            }
        } else if (d.phase === 'afterFirst') {
            d.betweenElapsedMs = Math.min(d.betweenMs, d.betweenElapsedMs + dt);
            d.secondWindowRemainingMs = Math.max(0, d.secondWindowRemainingMs - dt);

            if (d.secondWindowRemainingMs <= 0) {
                d.phase = 'cooldown';
                d.timer = 0;
                d.playerX = d.startX;
            } else {
                const betweenReady = d.betweenElapsedMs >= (d.betweenMs - 1e-6);
                if (betweenReady && d.timer >= d.simulateSecondAtMs) {
                    if (canSpend()) spend();
                    d.phase = 'dashing2';
                    d.timer = 0;
                    d.dashCooldownElapsedMs = 0;
                    d.fireTimer = 0;
                    d.ghostTimer = 0;
                    d.spriteFrameX = 0;
                }
            }
        } else if (d.phase === 'dashing2') {
            d.playerX += DASH2_VX * dt;
            d.dashCooldownElapsedMs = Math.min(d.cooldownMs, d.dashCooldownElapsedMs + dt);
            if (d.timer >= DASH_DURATION) {
                d.phase = 'stopped';
                d.timer = 0;
                d.betweenElapsedMs = 0;
                d.secondWindowRemainingMs = 0;
                d.spriteFrameX = 0;
            }
        } else if (d.phase === 'stopped') {
            d.dashCooldownElapsedMs = Math.min(d.cooldownMs, d.dashCooldownElapsedMs + dt);
            if (d.timer >= 10000) {
                d.phase = 'wait';
                d.timer = 0;
                d.betweenElapsedMs = d.betweenMs;
                d.dashCooldownElapsedMs = d.cooldownMs;
                d.secondWindowRemainingMs = 0;
                d.playerX = d.startX;
                d.energy = d.maxEnergy;
                d.fireArcs = [];
                d.ghosts = [];
            }
        } else if (d.phase === 'cooldown') {
            if (d.timer >= d.cooldownMs) {
                d.phase = 'wait';
                d.timer = 0;
                d.betweenElapsedMs = d.betweenMs;
                d.secondWindowRemainingMs = 0;
                d.playerX = d.startX;
                d.fireArcs = [];
                d.ghosts = [];
            }
        }

        const awaitingSecond = d.phase === 'afterFirst' || d.phase === 'dashing1';
        const inCooldown = d.phase === 'cooldown';
        const inDashing1 = d.phase === 'dashing1';
        const inDashing2 = d.phase === 'dashing2';
        const inStopped = d.phase === 'stopped';

        const dashCharges = (inCooldown || inDashing2 || inStopped) ? 0 : (awaitingSecond || inDashing1) ? 1 : 2;
        const dashTimer = inCooldown ? d.timer : (inDashing2 || inStopped) ? d.dashCooldownElapsedMs : d.cooldownMs;
        const dashBetweenTimer = (awaitingSecond || inDashing1) ? d.betweenElapsedMs : d.betweenMs;

        return {
            maxEnergy: d.maxEnergy ?? 100,
            energy: d.energy ?? (d.maxEnergy ?? 100),
            isEnergyExhausted: false,
            dashCharges,
            dashAwaitingSecond: awaitingSecond,
            dashCooldown: d.cooldownMs,
            dashTimer,
            dashBetweenCooldown: d.betweenMs,
            dashBetweenTimer,
            dashSecondWindowTimer: awaitingSecond ? d.secondWindowRemainingMs : 0,
        };
    },
};
