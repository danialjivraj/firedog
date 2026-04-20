import { screenColourFadeIn, screenColourFadeOut } from '../../animations/screenColourFade.js';
import { FIREDOG_FRAME } from '../../config/skinsAndCosmetics.js';
import { normalizeDelta } from '../../config/constants.js';
import { PoisonBubbles, IceCrystalBubbles } from '../../animations/particles.js';
import { BluePotion, RedPotion, HealthLive, Cauldron, BlackHole, IceDrink } from '../../entities/powerUpAndDown.js';

export const tutorialDrawMixin = {
    // ---------------- enemy showcase ----------------
    createClimbThread({ x, yTop = 0, yEnd, lineW = 0.4, alpha = 1 }) {
        return {
            draw: (ctx) => {
                const a = this._num(alpha, 1);
                if (a <= 0) return;

                const dpr = window.devicePixelRatio || 1;

                const x0 = Math.round(Number(x) || 0);
                const y0 = Math.round(Number(yTop) || 0);
                const y1 = Math.round(Number(yEnd) || 0);

                ctx.save();
                ctx.globalAlpha = a;
                ctx.lineWidth = lineW / dpr;
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x0, y1);
                ctx.stroke();
                ctx.restore();
            },
        };
    },

    _getEnemyPreviewSpecs(cx, groundY) {
        const groundLine = groundY + 15;
        const topLine = 20;

        const xSkulnap = cx + 320;
        const xGloomlet = cx + 500;
        const xDuskPlant = cx + 650;
        const xSlow = cx + 500;
        const xFreeze = cx + 720;

        return [
            {
                type: 'yellow',
                label: 'Yellow',
                image: 'skulnap',
                key: 'enemy_skulnap_sleep',
                fps: 20,
                maxFrame: 10,
                frameY: 0,
                frameW: 57,
                frameH: 57,
                w: 57,
                h: 57,
                x: xSkulnap,
                y: groundLine,
                anchor: 'bottomCenter',
                glowColor: 'yellow',
                shadowBlur: 10,
            },
            {
                type: 'red',
                label: 'Red',
                image: 'gloomlet',
                key: 'enemy_gloomlet',
                fps: 10,
                maxFrame: 4,
                frameY: 0,
                frameW: 78,
                frameH: 75,
                w: 78,
                h: 75,
                x: xGloomlet,
                y: groundLine - 250,
                anchor: 'bottomCenter',
                glowColor: 'red',
                shadowBlur: 10,
            },
            {
                type: 'poison',
                label: 'Poison',
                image: 'bigGreener',
                key: 'enemy_biggreener',
                fps: 15,
                maxFrame: 1,
                frameY: 0,
                frameW: 113,
                frameH: 150,
                w: 113,
                h: 150,
                x: xDuskPlant,
                y: groundLine,
                anchor: 'bottomCenter',
                glowColor: 'green',
                shadowBlur: 10,
            },
            {
                type: 'slow',
                label: 'Slow',
                image: 'iceSilknoir',
                key: 'enemy_icesilknoir_slow',
                fps: 20,
                maxFrame: 5,
                frameY: 0,
                frameW: 120,
                frameH: 144,
                w: 120,
                h: 144,
                x: xSlow,
                y: topLine,
                anchor: 'topLeft',
                glowColor: 'blue',
                shadowBlur: 10,
            },
            {
                type: 'freeze',
                label: 'Freeze',
                image: 'crystalWasp',
                key: 'enemy_crystalwasp_freeze',
                fps: 20,
                maxFrame: 5,
                frameY: 0,
                frameW: 111.8333333333333,
                frameH: 110,
                w: 111.8333333333333,
                h: 110,
                x: xFreeze,
                y: topLine + 200,
                anchor: 'topLeft',
                glowColor: '#00eaff',
                shadowBlur: 18,
            },
        ];
    },

    createEnemyTypeShowcase({ focusType = null, dimAlpha = 0.3, cx = 0, groundY = 0 }) {
        const specs = this._getEnemyPreviewSpecs(cx, groundY);
        const isSpider = (t) => t === 'slow';

        const out = [];
        for (const s of specs) {
            const alpha = !focusType ? 1 : (s.type === focusType ? 1 : dimAlpha);

            if (isSpider(s.type)) {
                const threadX = s.x + s.w / 2;
                const threadEndY = s.y + Math.min(60, s.h * 0.55);
                out.push(this.createClimbThread({ x: threadX, yTop: 0, yEnd: threadEndY, lineW: 1, alpha }));
            }

            out.push(this.createAnimatedGlowSpriteWithAlpha({ ...s, alpha }));
        }
        return out;
    },

    // ---------------- page helpers ----------------
    _flattenDrawables(drawables) {
        const out = [];
        const push = (v) => {
            if (!v) return;
            if (Array.isArray(v)) for (const a of v) push(a);
            else out.push(v);
        };
        push(drawables);
        return out;
    },

    createPage(title, drawables = [], ui = null) {
        return { title, drawables: this._flattenDrawables(drawables), ui };
    },

    getAsset(name) {
        return this.assets[name] || null;
    },

    getCurrentPage() {
        return this.pages?.[this.currentPage] || null;
    },

    getCurrentPageUIConfig() {
        return this.getCurrentPage()?.ui || null;
    },

    // ---------------- animated glow sprites ----------------
    _createOrGetSpriteDemoState(key, fps = 4, maxFrame = 0) {
        if (!this._spriteDemos) this._spriteDemos = new Map();

        let s = this._spriteDemos.get(key);
        if (!s) {
            s = { frameX: 0, timer: 0, fps: 4, frameInterval: 250, maxFrame: 0 };
            this._spriteDemos.set(key, s);
        }

        s.fps = Math.max(1, this._num(fps, 4));
        s.frameInterval = 1000 / s.fps;
        s.maxFrame = Math.max(0, this._num(maxFrame, 0));
        return s;
    },

    _drawAnimatedGlowSprite(ctx, o) {
        const img = this.getAsset(o.image);
        if (!img) return;

        const key = String(o.key || o.image || 'sprite');
        const s = this._createOrGetSpriteDemoState(key, o.fps, o.maxFrame);

        s.timer += Math.max(0, this._dt());
        while (s.timer >= s.frameInterval) {
            s.timer -= s.frameInterval;
            s.frameX = (s.frameX < s.maxFrame) ? (s.frameX + 1) : 0;
        }

        const frameW = this._num(o.frameW ?? o.frameWidth ?? img.width, img.width);
        const frameH = this._num(o.frameH ?? o.frameHeight ?? img.height, img.height);
        const frameY = this._num(o.frameY ?? 0, 0);

        const w = this._num(o.w ?? frameW, frameW);
        const h = this._num(o.h ?? frameH, frameH);

        const anchor = o.anchor ?? 'center';

        let dx = this._num(o.x ?? 0, 0);
        let dy = this._num(o.y ?? 0, 0);

        if (anchor === 'center') {
            dx -= w / 2;
            dy -= h / 2;
        } else if (anchor === 'bottomCenter') {
            dx -= w / 2;
            dy -= h;
        }

        const rot = this._num(o.rotation ?? 0, 0);

        ctx.save();
        ctx.shadowColor = o.glowColor || 'yellow';
        ctx.shadowBlur = Number.isFinite(Number(o.shadowBlur)) ? Number(o.shadowBlur) : 10;

        if (rot !== 0) {
            const ccx = dx + w / 2;
            const ccy = dy + h / 2;
            ctx.translate(ccx, ccy);
            ctx.rotate(rot);
            ctx.translate(-ccx, -ccy);
        }

        if (o.flip) {
            const midX = Math.round(dx + w / 2);
            ctx.translate(midX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-midX, 0);
        }

        ctx.drawImage(
            img,
            s.frameX * frameW,
            frameY * frameH,
            frameW,
            frameH,
            Math.round(dx),
            Math.round(dy),
            Math.round(w),
            Math.round(h),
        );

        ctx.restore();
    },

    createAnimatedGlowSprite(o) {
        return { draw: (ctx) => this._drawAnimatedGlowSprite(ctx, o) };
    },

    _drawAnimatedGlowSpriteWithAlpha(ctx, o) {
        const alpha = this._clamp(o.alpha, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        this._drawAnimatedGlowSprite(ctx, o);
        ctx.restore();
    },

    createAnimatedGlowSpriteWithAlpha(o) {
        return { draw: (ctx) => this._drawAnimatedGlowSpriteWithAlpha(ctx, o) };
    },

    // ---------------- animated player sprite ----------------
    createPlayerAnimation({ state = 'STANDING', x, y, anchor = 'bottomCenter', fps = 20, flip = false, scale = 1 } = {}) {
        const cfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        return this.createAnimatedGlowSprite({
            image: 'defaultSkin',
            key: `player_${state}${flip ? '_flip' : ''}_${Math.round(x)}_${Math.round(y)}`,
            frameW: FIREDOG_FRAME.width,
            frameH: FIREDOG_FRAME.height,
            frameY: cfg.frameY,
            maxFrame: cfg.maxFrame,
            fps,
            w: FIREDOG_FRAME.width * scale,
            h: FIREDOG_FRAME.height * scale,
            x,
            y,
            anchor,
            shadowBlur: 0,
            flip,
        });
    },

    createFrozenPlayerAnimation({ x, y, anchor = 'bottomCenter' } = {}) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const hitCfg = HowToPlayMenu._PLAYER_ANIM.HIT;
        let pulseTimer = 0;

        return {
            draw: (ctx) => {
                const dt = Math.max(0, this._dt());
                pulseTimer += dt;

                const phase = pulseTimer * 0.009;
                const dip = 0.5 * (1 - Math.cos(phase));
                let opacity = 0.5 - 0.2 * dip;
                if (opacity < 0.05) opacity = 0.05;
                if (opacity > 0.5) opacity = 0.5;

                let dx = this._num(x, 0);
                let dy = this._num(y, 0);
                if (anchor === 'bottomCenter') { dx -= FW / 2; dy -= FH; }

                const sprite = this.getAsset('defaultSkin');
                if (sprite) {
                    ctx.save();
                    ctx.shadowBlur = 0;
                    ctx.drawImage(sprite, 0, hitCfg.frameY * FH, FW, FH, Math.round(dx), Math.round(dy), FW, FH);
                    ctx.restore();
                }

                const iceImg = this.getAsset('frozenIce');
                if (iceImg) {
                    const iceScale = 1.1;
                    const iceW = FW * iceScale;
                    const iceH = FH * iceScale;
                    const iceX = dx + FW / 2 - iceW / 2;
                    const iceY = dy + FH / 2 - iceH / 2 + 10;
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(iceImg, Math.round(iceX), Math.round(iceY), Math.round(iceW), Math.round(iceH));
                    ctx.restore();
                }
            },
        };
    },

    createHitLoopAnimation({ x, y, anchor = 'bottomCenter', fps = 20, cooldownMs = 2000, delayMs = 700, state = 'HIT', phaseRef = null } = {}) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const hitCfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.HIT;
        const standCfg = HowToPlayMenu._PLAYER_ANIM.STANDING;
        const frameInterval = 1000 / fps;

        let phase = 'delay';
        let delayTimer = 0;
        let frameX = 0;
        let frameTimer = 0;
        let cooldownTimer = 0;

        return {
            draw: (ctx) => {
                const dt = Math.max(0, this._dt());

                if (phase === 'delay') {
                    delayTimer += dt;
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        frameX = (frameX < standCfg.maxFrame) ? frameX + 1 : 0;
                    }
                    if (delayTimer >= delayMs) {
                        phase = 'hit';
                        frameX = 0;
                        frameTimer = 0;
                    }
                } else if (phase === 'hit') {
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        if (frameX < hitCfg.maxFrame) {
                            frameX++;
                        } else {
                            phase = 'standing';
                            frameX = 0;
                            frameTimer = 0;
                            cooldownTimer = 0;
                            break;
                        }
                    }
                } else {
                    frameTimer += dt;
                    while (frameTimer >= frameInterval) {
                        frameTimer -= frameInterval;
                        frameX = (frameX < standCfg.maxFrame) ? frameX + 1 : 0;
                    }
                    cooldownTimer += dt;
                    if (cooldownTimer >= cooldownMs) {
                        phase = 'hit';
                        frameX = 0;
                        frameTimer = 0;
                    }
                }

                if (phaseRef) phaseRef.phase = phase;

                const cfg = (phase === 'hit') ? hitCfg : standCfg;
                let dx = this._num(x, 0);
                let dy = this._num(y, 0);
                if (anchor === 'bottomCenter') { dx -= FW / 2; dy -= FH; }

                const sprite = this.getAsset('defaultSkin');
                if (!sprite) return;

                ctx.save();
                ctx.shadowBlur = 0;
                ctx.drawImage(sprite, frameX * FW, cfg.frameY * FH, FW, FH, Math.round(dx), Math.round(dy), FW, FH);
                ctx.restore();
            },
            reset: () => {
                phase = 'delay';
                delayTimer = 0;
                frameX = 0;
                frameTimer = 0;
                cooldownTimer = 0;
                if (phaseRef) phaseRef.phase = 'delay';
            },
        };
    },

    _drawAnimatedStatusTintedPlayer(ctx, o) {
        const img = this.assets?.defaultSkin;
        if (!img) return;

        const cfg = HowToPlayMenu._PLAYER_ANIM[o.state ?? 'STANDING'] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        const key = `player_tinted_${o.state ?? 'STANDING'}_${Math.round(o.x ?? 0)}_${Math.round(o.y ?? 0)}`;
        const s = this._createOrGetSpriteDemoState(key, o.fps ?? 20, cfg.maxFrame);

        s.timer += Math.max(0, this._dt());
        while (s.timer >= s.frameInterval) {
            s.timer -= s.frameInterval;
            s.frameX = s.frameX < s.maxFrame ? s.frameX + 1 : 0;
        }

        const { width: fw, height: fh } = FIREDOG_FRAME;
        const sx = s.frameX * fw;
        const sy = cfg.frameY * fh;
        const w = o.w ?? fw, h = o.h ?? fh;
        let dx = o.x ?? 0, dy = o.y ?? 0;
        const anchor = o.anchor ?? 'bottomCenter';
        if (anchor === 'center') { dx -= w / 2; dy -= h / 2; }
        else if (anchor === 'bottomCenter') { dx -= w / 2; dy -= h; }
        else if (anchor === 'bottomLeft') { dy -= h; }

        if (!this._playerFrameCanvas) {
            this._playerFrameCanvas = document.createElement('canvas');
            this._playerFrameCanvas.width = FIREDOG_FRAME.width;
            this._playerFrameCanvas.height = 92;
        }
        const fc = this._playerFrameCanvas;
        const fctx = fc.getContext('2d');
        fctx.clearRect(0, 0, fc.width, fc.height);
        fctx.drawImage(img, sx, sy, fw, fh, 0, 0, fc.width, fc.height);

        if (o.poisoned || o.slowed) {
            fctx.globalCompositeOperation = 'source-atop';
            fctx.fillStyle = o.poisoned ? 'rgba(0,100,0,0.40)' : 'rgba(0,120,255,0.35)';
            fctx.fillRect(0, 0, fc.width, fc.height);
            fctx.globalCompositeOperation = 'source-over';
        }

        ctx.save();
        if (o.poisoned) { ctx.shadowColor = 'rgba(0,130,0,1)'; ctx.shadowBlur = 6; }
        else if (o.slowed) { ctx.shadowColor = 'rgba(0,160,255,1)'; ctx.shadowBlur = 6; }
        ctx.drawImage(fc, Math.round(dx), Math.round(dy), Math.round(w), Math.round(h));
        ctx.restore();
    },

    createAnimatedStatusTintedPlayer(o) {
        return { draw: (ctx) => this._drawAnimatedStatusTintedPlayer(ctx, o) };
    },

    // ---------------- sequence demos (rolling / diving / dash) ----------------
    _spawnDemoFireArc(mouthX, mouthY, playerX) {
        const forward = 18 + Math.random() * 50;
        let spawnX = mouthX + forward;
        if (spawnX > this.game.width) spawnX = mouthX - (8 + Math.random() * 24);

        const trail = 1.6 + Math.random() * 2.2;
        const spread = (Math.random() * 24 - 12) * (Math.PI / 180);

        return {
            x: spawnX,
            y: mouthY + (Math.random() * 16 - 8),
            size: 45 + Math.random() * 40,
            speedX: Math.cos(spread) * trail,
            speedY: (1.4 + Math.random() * 2.4) * (Math.random() < 0.5 ? 1 : -1),
            drag: 0.985 + Math.random() * 0.01,
            damp: 0.985 + Math.random() * 0.01,
            angle: Math.random() * Math.PI * 2,
            va: Math.random() * 0.14 - 0.07,
            wobbleAmp: 0.4 + Math.random() * 0.7,
            age: 0,
            followMs: 130 + Math.random() * 90,
            followFactor: 0.95,
            lastPlayerX: playerX,
        };
    },

    createDashSequenceDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_RUNNING = 3, ROW_STANDING = 0;

        return {
            draw: (ctx) => {
                const d = this._demoDash;
                if (!d || !d.active) return;

                const groundY = this.game.height - this.game.groundMargin;
                const img = this.assets?.defaultSkin;
                if (!img) return;

                const isDashing = d.phase === 'dashing1' || d.phase === 'dashing2';
                const spriteRow = isDashing ? ROW_RUNNING : ROW_STANDING;

                for (const g of [...(d.ghosts || [])].reverse()) {
                    ctx.save();
                    ctx.globalAlpha = g.alpha;
                    ctx.drawImage(img, g.frameX * FW, g.frameY * FH, FW, FH,
                        Math.round(g.x - FW / 2), Math.round(groundY - FH), FW, FH);
                    ctx.restore();
                }

                const sx = (d.spriteFrameX || 0) * FW;
                const sy = spriteRow * FH;
                ctx.drawImage(img, sx, sy, FW, FH,
                    Math.round(d.playerX - FW / 2), Math.round(groundY - FH), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of (d.fireArcs || [])) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    },

    createRollingDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_ROLLING = 6, MAX_FRAME = 6;
        const FRAME_INTERVAL = 1000 / 20;
        const FIRE_INTERVAL_MS = 1000 / 31;

        return {
            draw: (ctx) => {
                if (!this._demoRollingSeq) {
                    this._demoRollingSeq = { fireArcs: [], fireTimer: 0, spriteFrameX: 0, spriteFrameTimer: 0 };
                }
                const s = this._demoRollingSeq;
                const dt = Math.max(0, this._dt());
                const dtScale = normalizeDelta(dt);
                const groundY = this.game.height - this.game.groundMargin;
                const playerCX = this.game.width / 2 - 10;
                const playerTopY = groundY - FH;
                const fireCX = playerCX;
                const fireCY = playerTopY + FH * 0.5;

                s.spriteFrameTimer += dt;
                while (s.spriteFrameTimer >= FRAME_INTERVAL) {
                    s.spriteFrameTimer -= FRAME_INTERVAL;
                    s.spriteFrameX = (s.spriteFrameX + 1) % (MAX_FRAME + 1);
                }

                const GAME_SPEED = this.game.normalSpeed ?? 6;

                s.fireTimer += dt;
                while (s.fireTimer >= FIRE_INTERVAL_MS) {
                    s.fireTimer -= FIRE_INTERVAL_MS;
                    s.fireArcs.push({
                        x: fireCX,
                        y: fireCY,
                        size: Math.random() * 100 + 50,
                        speedX: 1,
                        speedY: 1,
                        angle: 0,
                        va: Math.random() * 0.2 - 0.1,
                    });
                }

                s.fireArcs = this._stepFireArcs(s.fireArcs, dtScale, GAME_SPEED);

                const img = this.assets?.defaultSkin;
                if (!img) return;

                ctx.drawImage(img,
                    s.spriteFrameX * FW, ROW_ROLLING * FH, FW, FH,
                    Math.round(playerCX - FW / 2), Math.round(playerTopY), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of s.fireArcs) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    },

    createDivingSequenceDemo() {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const ROW_STANDING = 0, ROW_JUMPING = 1, ROW_DIVING = 6;
        const MAX_FRAME_STAND = 6, MAX_FRAME_JUMP = 6, MAX_FRAME_DIVE = 6;
        const FRAME_INTERVAL = 1000 / 20;
        const FIRE_INTERVAL_MS = 1000 / 31;
        const STAND_MS = 1200, SETTLE_MS = 900;

        return {
            draw: (ctx) => {
                if (!this._demoDivingSeq) {
                    const groundY = this.game.height - this.game.groundMargin;
                    this._demoDivingSeq = {
                        phase: 'stand',   // 'stand' | 'jump' | 'dive' | 'settle'
                        timer: 0,
                        playerTopY: groundY - FH,
                        vy: 0,
                        fireArcs: [],
                        fireTimer: 0,
                        splashArcs: [],
                        spriteFrameX: 0,
                        spriteFrameTimer: 0,
                    };
                }
                const s = this._demoDivingSeq;
                const dt = Math.max(0, this._dt());
                const dtScale = normalizeDelta(dt);
                const groundY = this.game.height - this.game.groundMargin;
                const groundTopY = groundY - FH;
                const playerCX = this.game.width / 2;

                s.timer += dt;

                if (s.phase === 'stand') {
                    s.playerTopY = groundTopY;
                    s.vy = 0;
                    if (s.timer >= STAND_MS) {
                        s.phase = 'jump';
                        s.timer = 0;
                        s.vy = -27;
                        s.spriteFrameX = 0;
                        s.fireArcs = [];
                    }
                } else if (s.phase === 'jump') {
                    s.playerTopY += s.vy * dtScale;
                    s.vy += 1 * dtScale;
                    if (s.vy > 1) {
                        s.phase = 'dive';
                        s.vy = 15;
                        s.timer = 0;
                        s.fireTimer = 0;
                        s.spriteFrameX = 0;
                    }
                } else if (s.phase === 'dive') {
                    s.playerTopY += s.vy * dtScale;
                    s.vy += 1 * dtScale;

                    s.fireTimer += dt;
                    while (s.fireTimer >= FIRE_INTERVAL_MS) {
                        s.fireTimer -= FIRE_INTERVAL_MS;
                        s.fireArcs.push({
                            x: playerCX,
                            y: s.playerTopY + FH * 0.5,
                            size: Math.random() * 100 + 50,
                            speedX: 1, speedY: 1, angle: 0,
                            va: Math.random() * 0.2 - 0.1,
                        });
                    }

                    if (s.playerTopY >= groundTopY) {
                        s.playerTopY = groundTopY;
                        s.phase = 'settle';
                        s.timer = 0;
                        s.fireTimer = 0;
                        const spawnX = playerCX - FW / 2 - 10;
                        const spawnY = groundTopY;
                        for (let i = 0; i < 30; i++) {
                            const size = Math.random() * 40 + 60;
                            s.splashArcs.push({
                                x: spawnX + size * 0.4,
                                y: spawnY + size * 0.5,
                                size,
                                speedX: Math.random() * 6 - 4,
                                speedY: Math.random() * 2 + 2,
                                gravity: 0,
                            });
                        }
                    }
                } else if (s.phase === 'settle') {
                    s.playerTopY = groundTopY;
                    if (s.timer >= SETTLE_MS) {
                        s.phase = 'stand';
                        s.timer = 0;
                        s.spriteFrameX = 0;
                    }
                }

                s.fireArcs = this._stepFireArcs(s.fireArcs, dtScale);

                for (const arc of s.splashArcs) {
                    arc.x -= arc.speedX * dtScale;
                    arc.y -= arc.speedY * dtScale;
                    arc.size *= Math.pow(0.97, dtScale);
                    arc.y += arc.gravity * dtScale;
                    arc.gravity += 0.1 * dtScale;
                }
                s.splashArcs = s.splashArcs.filter(a => a.size >= 0.5);

                const spriteRow = s.phase === 'jump' ? ROW_JUMPING :
                    s.phase === 'dive' ? ROW_DIVING : ROW_STANDING;
                const maxFrame = s.phase === 'jump' ? MAX_FRAME_JUMP :
                    s.phase === 'dive' ? MAX_FRAME_DIVE : MAX_FRAME_STAND;
                s.spriteFrameTimer += dt;
                while (s.spriteFrameTimer >= FRAME_INTERVAL) {
                    s.spriteFrameTimer -= FRAME_INTERVAL;
                    s.spriteFrameX = (s.spriteFrameX + 1) % (maxFrame + 1);
                }

                const img = this.assets?.defaultSkin;
                if (!img) return;

                ctx.drawImage(img,
                    s.spriteFrameX * FW, spriteRow * FH, FW, FH,
                    Math.round(playerCX - FW / 2), Math.round(s.playerTopY), FW, FH);

                const fireImg = document.getElementById('fire');
                if (fireImg) {
                    for (const arc of s.splashArcs) {
                        ctx.drawImage(fireImg, arc.x, arc.y, arc.size, arc.size);
                    }
                    for (const arc of s.fireArcs) {
                        ctx.save();
                        ctx.translate(arc.x, arc.y);
                        ctx.rotate(arc.angle);
                        ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                        ctx.restore();
                    }
                }
            },
        };
    },

    // ---------------- real power entities preview ----------------
    _createPowerPreviewIfNeeded() {
        if (this._powerPreview) return;

        const make = (Cls) => {
            const o = new Cls(this.game);
            const isolatedGame = Object.create(this.game);
            isolatedGame.player = { x: 0, y: 0, isSlowed: false };
            o.game = isolatedGame;
            o.markedForDeletion = false;
            o.isMenuPreview = true;
            return o;
        };

        this._powerPreview = {
            blue: make(BluePotion),
            red: make(RedPotion),
            live: make(HealthLive),
            cauldron: make(Cauldron),
            blackhole: make(BlackHole),
            iceDrink: make(IceDrink),
        };
    },

    createPowerEntityPreview({ key, x, y, anchor = 'center' }) {
        return {
            draw: (ctx) => {
                this._createPowerPreviewIfNeeded();
                const p = this._powerPreview?.[key];
                if (!p) return;

                if (anchor === 'center') {
                    p.x = x - p.width / 2;
                    p.y = y - p.height / 2;
                } else if (anchor === 'bottomCenter') {
                    p.x = x - p.width / 2;
                    p.y = y - p.height;
                } else {
                    p.x = x;
                    p.y = y;
                }

                const dt = this._dt();
                if (typeof p.update === 'function') p.update(dt);
                p.markedForDeletion = false;
                if (typeof p.draw === 'function') p.draw(ctx);
            },
        };
    },

    // ---------------- draw primitives + factories ----------------
    drawImage(ctx, img, x, y, opts = {}) {
        if (!img) return;

        const scale = opts.scale ?? 1;
        const baseW = opts.w ?? img.width;
        const baseH = opts.h ?? img.height;

        const w = Math.round(baseW * scale);
        const h = Math.round(baseH * scale);
        if (!w || !h) return;

        const anchor = opts.anchor ?? 'topLeft';
        const offsetX = opts.offsetX ?? 0;
        const offsetY = opts.offsetY ?? 0;

        let drawX = x;
        let drawY = y;

        if (anchor === 'center') {
            drawX = x - w / 2;
            drawY = y - h / 2;
        } else if (anchor === 'bottomCenter') {
            drawX = x - w / 2;
            drawY = y - h;
        }

        drawX = Math.round(drawX + offsetX);
        drawY = Math.round(drawY + offsetY);

        ctx.drawImage(img, drawX, drawY, w, h);
    },

    drawImageRotatedSquare(ctx, img, x, y, size, angle) {
        if (!img) return;
        const s = Math.max(1, Math.round(size));
        const ccx = x + s / 2;
        const ccy = y + s / 2;

        ctx.save();
        ctx.translate(ccx, ccy);
        ctx.rotate(angle);
        ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.restore();
    },

    wrapLines(ctx, text, maxW) {
        const rawLines = String(text || '').split('\n');
        const out = [];

        for (const raw of rawLines) {
            const words = raw.split(' ');
            let line = '';

            for (const word of words) {
                const test = line ? (line + ' ' + word) : word;
                if (ctx.measureText(test).width <= maxW) {
                    line = test;
                } else {
                    if (line) out.push(line);
                    line = word;
                }
            }

            if (line) out.push(line);
            if (raw === '') out.push('');
        }

        return out;
    },

    _cleanTokenForMatch(token) {
        return String(token || '')
            .replace(/^[^\w]+/g, '')
            .replace(/[^\w]+$/g, '');
    },

    _getTokenFillColour(rawToken) {
        const tRaw = this._cleanTokenForMatch(rawToken);
        if (!tRaw) return null;

        const t = tRaw.toLowerCase();

        const abilitySet = new Set([
            'rolling', 'diving', 'fireball', 'invisible', 'invisibility', 'dashing', 'dash',
            'roll', 'dive',
        ]);
        const energySet = new Set(['energy']);
        const damageSet = new Set(['damage']);
        const exhaustedSet = new Set(['exhausted', 'exhaust']);

        if (abilitySet.has(t)) return '#ff6a00';
        if (energySet.has(t)) return '#00bfff';
        if (damageSet.has(t)) return '#ff0000';
        if (exhaustedSet.has(t)) return '#ff0000';

        const enemyColour = {
            stun: 'rgb(201, 188, 12)',
            red: 'red',
            poison: 'green',
            slow: 'blue',
            frozen: '#20cada',
        };

        return enemyColour[t] || null;
    },

    _splitKeepSpaces(line) {
        return String(line || '').split(/(\s+)/g).filter(s => s !== '');
    },

    _measureRichLineWidth(ctx, tokens) {
        let w = 0;
        for (const tok of tokens) w += ctx.measureText(tok).width;
        return w;
    },

    drawTextBlockImpl(ctx, o) {
        const text = o.text ?? '';
        const x = o.x ?? 0;
        const y = o.y ?? 0;
        const maxW = o.maxW ?? 600;
        const lineH = o.lineH ?? 32;
        const font = o.font ?? 'bold 26px "Gloria Hallelujah"';
        const align = o.align ?? 'left';
        const colourize = o.colourize !== false;

        ctx.save();
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 6;

        const lines = this.wrapLines(ctx, text, maxW);

        const nextNonSpaceToken = (arr, startIndex) => {
            for (let i = startIndex; i < arr.length; i++) {
                if (!/^\s+$/.test(arr[i])) return arr[i];
            }
            return null;
        };

        const isNumberToken = (rawTok) => {
            const t = this._cleanTokenForMatch(rawTok);
            const n = t.replace(/,/g, '');
            return n !== '' && Number.isFinite(Number(n));
        };

        let yy = y;

        for (const line of lines) {
            if (line === '') { yy += lineH; continue; }

            if (!colourize) {
                ctx.textAlign = align;
                ctx.fillStyle = 'black';
                ctx.strokeText(line, x, yy);
                ctx.fillText(line, x, yy);
                yy += lineH;
                continue;
            }

            const tokens = this._splitKeepSpaces(line);
            const lineWpx = this._measureRichLineWidth(ctx, tokens);

            let startX = x;
            if (align === 'center') startX = x - lineWpx / 2;
            if (align === 'right') startX = x - lineWpx;

            ctx.textAlign = 'left';

            let xx = startX;
            for (let i = 0; i < tokens.length; i++) {
                const tok = tokens[i];

                let fill = this._getTokenFillColour(tok);

                if (!fill && isNumberToken(tok)) {
                    const nextTok = nextNonSpaceToken(tokens, i + 1);
                    const nextFill = nextTok ? this._getTokenFillColour(nextTok) : null;
                    if (nextFill) fill = nextFill;
                }

                if (fill) {
                    const leadMatch = tok.match(/^([^\w]*)/);
                    const trailMatch = tok.match(/([^\w]*)$/);
                    const leading = leadMatch ? leadMatch[1] : '';
                    const trailing = trailMatch ? trailMatch[1] : '';
                    const core = tok.slice(leading.length, tok.length - (trailing.length || 0));

                    const parts = [];
                    let px = xx;
                    if (leading) { parts.push({ text: leading, x: px, fill: 'black' }); px += ctx.measureText(leading).width; }
                    if (core) { parts.push({ text: core, x: px, fill }); px += ctx.measureText(core).width; }
                    if (trailing) { parts.push({ text: trailing, x: px, fill: 'black' }); px += ctx.measureText(trailing).width; }

                    for (const p of parts) ctx.strokeText(p.text, p.x, yy);
                    for (const p of parts) { ctx.fillStyle = p.fill; ctx.fillText(p.text, p.x, yy); }

                    xx = px;
                } else {
                    ctx.fillStyle = 'black';
                    ctx.strokeText(tok, xx, yy);
                    ctx.fillText(tok, xx, yy);
                    xx += ctx.measureText(tok).width;
                }
            }

            yy += lineH;
        }

        ctx.restore();
    },

    drawKeycapImpl(ctx, x, y, letter, w = 57, h = 55, imageName = 'keycap') {
        const img = this.getAsset(imageName);
        if (!img) return;

        const drawX = Math.round(x - w / 2);
        const drawY = Math.round(y);

        ctx.save();
        ctx.drawImage(img, drawX, drawY, w, h);

        if (letter) {
            ctx.font = 'bold 22px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(letter, drawX + w / 2 - 2, drawY + h / 2 - 3);
        }

        ctx.restore();
    },

    drawKeyImageImpl(ctx, x, y, imageName = 'enterKeycap', w = null, h = null) {
        const img = this.getAsset(imageName);
        if (!img) return;

        const drawW = w ?? (img.width || 120);
        const drawH = h ?? (img.height || 55);

        const drawX = Math.round(x - drawW / 2);
        const drawY = Math.round(y);

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    },

    drawArrowImpl(ctx, o) {
        const x = o.x ?? 0;
        const y = o.y ?? 0;
        const length = o.length ?? 34;
        const head = o.head ?? 10;
        const rotation = o.rotation ?? 0;

        const lineW = o.lineW ?? 6;
        const outlineW = o.outlineW ?? 10;

        const anchor = o.anchor ?? 'center';

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(rotation);

        let x1, x2;
        if (anchor === 'start') {
            x1 = 0;
            x2 = length;
        } else {
            const half = length / 2;
            x1 = -half;
            x2 = half;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const strokeArrow = () => {
            ctx.beginPath();
            ctx.moveTo(x1, 0);
            ctx.lineTo(x2, 0);
            ctx.moveTo(x2, 0);
            ctx.lineTo(x2 - head, -head * 0.7);
            ctx.moveTo(x2, 0);
            ctx.lineTo(x2 - head, head * 0.7);
            ctx.stroke();
        };

        ctx.strokeStyle = 'white';
        ctx.lineWidth = outlineW;
        strokeArrow();

        ctx.strokeStyle = 'black';
        ctx.lineWidth = lineW;
        strokeArrow();

        ctx.restore();
    },

    createImage(o) {
        return {
            draw: (ctx) => {
                const img = this.getAsset(o.image);
                this.drawImage(ctx, img, o.x, o.y, o);
            },
        };
    },

    createInvisibleDemoPlayerImage(o) {
        const cfg = HowToPlayMenu._PLAYER_ANIM[o.state ?? 'STANDING'] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
        const spriteOpts = {
            image: 'defaultSkin',
            key: `player_invisible_${o.state ?? 'STANDING'}_${Math.round(o.x ?? 0)}_${Math.round(o.y ?? 0)}`,
            frameW: FIREDOG_FRAME.width, frameH: FIREDOG_FRAME.height,
            frameY: cfg.frameY, maxFrame: cfg.maxFrame,
            fps: o.fps ?? 20,
            w: FIREDOG_FRAME.width * (o.scale ?? 1), h: FIREDOG_FRAME.height * (o.scale ?? 1),
            x: o.x, y: o.y,
            anchor: o.anchor ?? 'bottomCenter',
            shadowBlur: 0,
        };
        return {
            draw: (ctx) => {
                const active = this._demoInvisible?.phase === 'active';
                const alpha = active ? (Number.isFinite(Number(o.activeAlpha)) ? Number(o.activeAlpha) : 0.5) : 1;
                ctx.save();
                ctx.globalAlpha = alpha;
                this._drawAnimatedGlowSprite(ctx, spriteOpts);
                ctx.restore();
            },
        };
    },

    createEnergyDemoPlayerImage(o) {
        const { width: FW, height: FH } = FIREDOG_FRAME;
        const FIRE_INTERVAL_MS = 1000 / 31;

        return {
            draw: (ctx) => {
                const e = this._demoEnergy;
                if (!e || !e.active) return;

                const goingDown = (e.dir || 'down') === 'down';
                const state = goingDown ? (o.downState ?? 'ROLLING') : (o.upState ?? 'STANDING');
                const cfg = HowToPlayMenu._PLAYER_ANIM[state] ?? HowToPlayMenu._PLAYER_ANIM.STANDING;
                const x = goingDown ? (o.downX ?? o.x ?? 0) : (o.upX ?? o.x ?? 0);
                const y = goingDown ? (o.downY ?? o.y ?? 0) : (o.upY ?? o.y ?? 0);

                const dt = Math.max(0, this._dt());
                const dtScale = normalizeDelta(dt);
                const GAME_SPEED = this.game.normalSpeed ?? 6;

                const isRolling = state === 'ROLLING';
                if (isRolling) {
                    if (!this._demoEnergyFireSeq) {
                        this._demoEnergyFireSeq = { fireArcs: [], fireTimer: 0 };
                    }
                    const fs = this._demoEnergyFireSeq;

                    const anchor = o.anchor ?? 'bottomCenter';
                    let px = x, py = y;
                    if (anchor === 'bottomCenter') { px -= FW / 2; py -= FH; }
                    else if (anchor === 'center') { px -= FW / 2; py -= FH / 2; }
                    const fireCX = px + FW * 0.5;
                    const fireCY = py + FH * 0.5;

                    fs.fireTimer += dt;
                    while (fs.fireTimer >= FIRE_INTERVAL_MS) {
                        fs.fireTimer -= FIRE_INTERVAL_MS;
                        fs.fireArcs.push({
                            x: fireCX, y: fireCY,
                            size: Math.random() * 100 + 50,
                            speedX: 1, speedY: 1,
                            angle: 0, va: Math.random() * 0.2 - 0.1,
                        });
                    }

                    fs.fireArcs = this._stepFireArcs(fs.fireArcs, dtScale, GAME_SPEED);
                } else if (this._demoEnergyFireSeq?.fireArcs.length) {
                    const fs = this._demoEnergyFireSeq;
                    fs.fireArcs = this._stepFireArcs(fs.fireArcs, dtScale, GAME_SPEED);
                }

                this._drawAnimatedGlowSprite(ctx, {
                    image: 'defaultSkin',
                    key: `player_energy_${state}_${Math.round(x ?? 0)}_${Math.round(y ?? 0)}`,
                    frameW: FW, frameH: FH,
                    frameY: cfg.frameY, maxFrame: cfg.maxFrame,
                    fps: o.fps ?? 20,
                    w: FW, h: FH,
                    x, y,
                    anchor: o.anchor ?? 'bottomCenter',
                    shadowBlur: 0,
                });

                if (this._demoEnergyFireSeq?.fireArcs.length) {
                    const fireImg = document.getElementById('fire');
                    if (fireImg) {
                        for (const arc of this._demoEnergyFireSeq.fireArcs) {
                            ctx.save();
                            ctx.translate(arc.x, arc.y);
                            ctx.rotate(arc.angle);
                            ctx.drawImage(fireImg, -arc.size * 0.5, -arc.size * 0.5, arc.size, arc.size);
                            ctx.restore();
                        }
                    }
                }
            },
        };
    },

    createKey(o) {
        return { draw: (ctx) => this.drawKeycapImpl(ctx, o.x, o.y, o.key, o.w, o.h, o.image || 'keycap') };
    },

    createKeyImage(o) {
        return { draw: (ctx) => this.drawKeyImageImpl(ctx, o.x, o.y, o.image || 'enterKeycap', o.w ?? null, o.h ?? null) };
    },

    createTextBlock(o) {
        return { draw: (ctx) => this.drawTextBlockImpl(ctx, o) };
    },

    createArrow(o) {
        return { draw: (ctx) => this.drawArrowImpl(ctx, o) };
    },

    createFireballDemo(o) {
        return {
            draw: (ctx) => {
                const cfg = this.getCurrentPageUIConfig();
                const fbCfg = cfg?.fireballDemo;
                if (!fbCfg?.enabled) return;

                const img = this.getAsset(o.image || 'fireball');
                if (!img) return;

                const fb = this._demoFireball;
                if (!fb?.active || fb.state !== 'flying') return;

                this.drawImageRotatedSquare(ctx, img, fb.x, fb.y, fb.size, fb.angle);
            },
        };
    },

    // ---------------- particles overlay (menu-only) ----------------
    createStatusParticlesOverlay({
        type,          // 'poison' | 'slow'
        x, y,
        anchor = 'bottomCenter',
        rateMs = null,
        spawn = null,
    } = {}) {
        const rand = (a, b) => a + Math.random() * (b - a);

        const defaults = {
            poison: {
                rateMs: 110,
                dxMin: -35, dxMax: 35,
                dyMin: -130, dyMax: -35,
                kind: 'poison',
            },
            slow: {
                rateMs: 110,
                dxMin: -45, dxMax: 45,
                dyMin: -140, dyMax: -45,
            },
        };

        const cfg = { ...(defaults[type] || {}), ...(spawn || {}) };
        const spawnRate = Math.max(10, Number(rateMs ?? cfg.rateMs ?? 90));

        const getBase = () => ({ bx: x, by: y });

        return {
            draw: (ctx) => {
                const dt = this._dt();
                const paused = this.game.menu.pause?.isPaused === true;

                if (!paused) {
                    const key = type === 'poison' ? 'poison' : 'slow';
                    this._menuParticleTimers[key] = Math.min(
                        (this._menuParticleTimers[key] || 0) + Math.max(0, dt),
                        spawnRate
                    );

                    while (this._menuParticleTimers[key] >= spawnRate) {
                        this._menuParticleTimers[key] -= spawnRate;

                        const { bx, by } = getBase();
                        const sx = bx + rand(cfg.dxMin, cfg.dxMax);
                        const sy = by + rand(cfg.dyMin, cfg.dyMax);

                        let p = null;
                        if (type === 'poison') {
                            p = new PoisonBubbles(this.game, sx, sy, cfg.kind || 'poison');
                            p.parallax = 0;
                        } else if (type === 'slow') {
                            p = new IceCrystalBubbles(this.game, sx, sy);
                            p.parallax = 0;
                        }

                        if (p) this._menuParticles.push(p);
                    }
                }

                for (const p of this._menuParticles) {
                    if (!p) continue;
                    if (!paused && typeof p.update === 'function') p.update();
                    if (typeof p.draw === 'function') p.draw(ctx);
                }

                this._menuParticles = this._menuParticles.filter(p => p && !p.markedForDeletion);
            },
        };
    },

    // ---------------- status tinted image ----------------
    _getTintedCanvas(img, sw, sh, tintKey, paintFn) {
        const key = `${img.id || img.src || 'img'}|${sw}x${sh}|${tintKey}`;
        const cached = this._tintCache.get(key);
        if (cached) return cached;

        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw));
        c.height = Math.max(1, Math.round(sh));
        const cctx = c.getContext('2d');

        cctx.clearRect(0, 0, c.width, c.height);
        cctx.globalCompositeOperation = 'source-over';
        cctx.drawImage(img, 0, 0, c.width, c.height);

        cctx.globalCompositeOperation = 'source-atop';
        paintFn(cctx, c.width, c.height);
        cctx.fillRect(0, 0, c.width, c.height);
        cctx.globalCompositeOperation = 'source-over';

        this._tintCache.set(key, c);
        return c;
    },

    createStatusTintedImage({ image, x, y, w, h, anchor = 'topLeft', poisoned = false, slowed = false }) {
        return {
            draw: (ctx) => {
                const img = this.assets?.[image] || document.getElementById(image);
                if (!img) return;

                const dw = w ?? img.width;
                const dh = h ?? img.height;

                let dx = x;
                let dy = y;

                if (anchor === 'center') {
                    dx = x - dw / 2;
                    dy = y - dh / 2;
                } else if (anchor === 'bottomCenter') {
                    dx = x - dw / 2;
                    dy = y - dh;
                } else if (anchor === 'bottomLeft') {
                    dx = x;
                    dy = y - dh;
                }

                this._drawStatusTintedImage(ctx, img, dx, dy, dw, dh, { poisoned, slowed });
            },
        };
    },

    _drawStatusTintedImage(ctx, img, dx, dy, dw, dh, status) {
        const poisoned = !!status?.poisoned;
        const slowed = !!status?.slowed;

        if (!poisoned && !slowed) {
            ctx.drawImage(img, dx, dy, dw, dh);
            return;
        }

        const drawGlow = (color, blur = 6) => {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = blur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
        };

        if (poisoned && slowed) {
            drawGlow('rgba(0,160,255,1)', 7);

            const oc = this._getTintedCanvas(img, dw, dh, 'poison+slow', (cctx, W, H) => {
                const g = cctx.createLinearGradient(0, 0, W, 0);
                g.addColorStop(0.00, 'rgba(0,100,0,0.40)');
                g.addColorStop(0.50, 'rgba(0,150,120,0.38)');
                g.addColorStop(1.00, 'rgba(0,120,255,0.35)');
                cctx.fillStyle = g;
            });

            ctx.drawImage(oc, dx, dy, dw, dh);
            return;
        }

        if (poisoned) {
            drawGlow('rgba(0,130,0,1)', 6);

            const oc = this._getTintedCanvas(img, dw, dh, 'poison', (cctx) => {
                cctx.fillStyle = 'rgba(0,100,0,0.40)';
            });

            ctx.drawImage(oc, dx, dy, dw, dh);
            return;
        }

        drawGlow('rgba(0,160,255,1)', 6);

        const oc = this._getTintedCanvas(img, dw, dh, 'slow', (cctx) => {
            cctx.fillStyle = 'rgba(0,120,255,0.35)';
        });

        ctx.drawImage(oc, dx, dy, dw, dh);
    },

    // ---------------- drawing ----------------
    drawCurrentPage(ctx) {
        const page = this.pages[this.currentPage];
        if (!page) return;

        if (this.backgroundImage) {
            ctx.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
        }

        this._drawInvisibleTint(ctx);

        for (const d of (page.drawables || [])) {
            if (d && typeof d.draw === 'function') d.draw(ctx);
        }

        const label = `${this.currentPage + 1}/${this.pages.length} - ${page.title ?? ''}`.trim();

        ctx.save();
        ctx.font = 'bold 26px "Gloria Hallelujah"';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'black';

        ctx.strokeText(label, 18, this.game.height - 14);
        ctx.fillText(label, 18, this.game.height - 14);
        ctx.restore();
    },

    _resetDemosOnPageChange() {
        this._hitAnimPhaseRef.phase = 'delay';
        for (const reset of this._hitAnimResets) reset();
        this._demoEnergy = this._createEnergyDemoState();
        this._demoDiving = this._createDivingDemoState();
        this._demoFireball = this._createFireballDemoState();
        this._demoInvisible = this._createInvisibleDemoState();
        this._demoDash = this._createDashDemoState();

        this._demoInvisibleColourOpacity = 0;

        this._spriteDemos?.clear?.();
        this._powerPreview = null;
        this._demoRollingSeq = null;
        this._demoDivingSeq = null;
        this._demoEnergyFireSeq = null;

        this._menuParticles.length = 0;
        this._menuParticleTimers.poison = 0;
        this._menuParticleTimers.slow = 0;
    },

    drawTopLeftUIOverlay(ctx) {
        const ui = this.game.UI;
        if (!ui) return;

        const cfg = this.getCurrentPageUIConfig();
        if ((cfg?.enabled ?? true) !== true) return;

        if (this._lastPageIndex !== this.currentPage) {
            this._resetDemosOnPageChange();
            this._lastPageIndex = this.currentPage;
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        let demoPlayer = cfg?.player ? { ...cfg.player } : null;
        const dt = this._dt();

        const applyDemo = (enabled, fn, demoCfg) => {
            if (enabled === true) {
                const patch = fn.call(this, dt, demoCfg);
                if (patch) demoPlayer = { ...(demoPlayer || {}), ...patch };
            }
        };

        applyDemo(cfg?.energyDemo?.enabled, this._updateEnergyDemo, cfg?.energyDemo);
        applyDemo(cfg?.divingDemo?.enabled, this._updateDivingDemo, cfg?.divingDemo);
        applyDemo(cfg?.fireballDemo?.enabled, this._updateFireballDemo, cfg?.fireballDemo);

        if (cfg?.invisibleDemo?.enabled === true) {
            applyDemo(true, this._updateInvisibleDemo, cfg?.invisibleDemo);
        } else {
            if (this._demoInvisible) {
                this._demoInvisible.active = false;
                this._demoInvisible.phase = 'wait';
                this._demoInvisible.timer = 0;
                this._demoInvisible.activeRemainingMs = 0;
                this._demoInvisible.cooldownElapsedMs = 0;
            }
            this._drawInvisibleTintInternal(false);
        }

        applyDemo(cfg?.dashDemo?.enabled, this._updateDashDemo, cfg?.dashDemo);

        if (cfg?.hitAnimPhaseRef?.phase === 'hit') {
            demoPlayer = { ...(demoPlayer || {}), isFrozen: true };
        }

        const restorePlayer = this.applyDemoPlayerState(demoPlayer);
        const restoreCooldowns = this.applyDemoCooldowns(cfg?.cooldowns);

        const pb = cfg?.progressBar;
        ui.drawTutorialProgressBar(
            ctx,
            this._getTutorialProgressPercentage(),
            pb?.colour ?? '#2ecc71',
        );

        const showTopLeft = cfg?.showTopLeft ?? true;
        const showAbilities = cfg?.showAbilities ?? true;

        if (showTopLeft && typeof ui.drawTopLeftOnly === 'function') {
            let restoreAbilityFn = null;

            if (!showAbilities && typeof ui.firedogAbilityUI === 'function') {
                const old = ui.firedogAbilityUI;
                restoreAbilityFn = () => (ui.firedogAbilityUI = old);
                ui.firedogAbilityUI = () => { };
            }

            if (typeof ui.withHudLayoutStyle === 'function') {
                ui.withHudLayoutStyle('compact', () => ui.drawTopLeftOnly(ctx));
            } else {
                ui.drawTopLeftOnly(ctx);
            }
            if (restoreAbilityFn) restoreAbilityFn();
        } else if (showAbilities && typeof ui.firedogAbilityUI === 'function') {
            if (typeof ui.withHudLayoutStyle === 'function') {
                ui.withHudLayoutStyle('compact', () => ui.firedogAbilityUI(ctx));
            } else {
                ui.firedogAbilityUI(ctx);
            }
        }

        if (restoreCooldowns) restoreCooldowns();
        if (restorePlayer) restorePlayer();

        ctx.restore();
    },
};

// Reference to HowToPlayMenu class for static property access in mixin methods
// This will be resolved at runtime since the mixin is applied after class definition
let HowToPlayMenu;
export function _setHowToPlayMenuRef(cls) { HowToPlayMenu = cls; }
