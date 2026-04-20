import { drawCoinIcon } from './coinIcon.js';
import { TipRenderer } from './tipRenderer.js';
import { AbilityUI } from './abilityUI.js';
import { StatusEffectsUI } from './statusEffectsUI.js';
import { getFilteredOutline, OUTLINE_OFFSETS } from '../utils/spriteCache.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Love Ya Like A Sister';
        this.fontString = this.fontSize + 'px ' + this.fontFamily;
        this._font18 = '18px ' + this.fontFamily;
        this._font22 = '22px ' + this.fontFamily;
        this._font29 = '29px ' + this.fontFamily;
        this._font30 = this.fontSize + 'px ' + this.fontFamily;
        this._font36 = (this.fontSize * 1.2) + 'px ' + this.fontFamily;
        this._font60 = (this.fontSize * 2) + 'px ' + this.fontFamily;
        this.barWidth = 500;

        this.topLeftYShift = 0;

        this.livesImage = document.getElementById('firedogHead');

        this.fireballUI = document.getElementById('fireballUI');
        this.fireballRedPotionUI = document.getElementById('fireballRedPotionUI');
        this.divingUI = document.getElementById('divingUI');
        this.invisibleUI = document.getElementById('invisibleUI');
        this.dashingUI = document.getElementById('dashingUI');

        this.secondsLeft = 60000;
        this.timerFlash = null; // { color, endTime }
        this.nextUnderwaterTickSoundIndex = 0;
        this.lastUnderwaterTickRemainingTime = null;

        this.uiTime = 0;
        this.uiLastRealTime = null;
        this.prevCoins = this.game.coins;
        this.coinPulseDuration = 220;
        this.coinPulseEndTime = 0;
        this.coinPulseType = null;

        this.prevLives = this.game.player.lives;

        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = 0;
        this.lifeBlinkDuration = 400;

        this.lifeGainDuration = 400;
        this.lifeGainEndTimes = new Map();

        this.energyBar = {
            x: 20,
            y: 93 + this.topLeftYShift,
            w: 240,
            h: 32,
            radius: 10,

            shineHeightRatio: 0.45,
            pulseLowThreshold: 20,
            pulseSpeed: 0.012,
        };

        this.negativeStatusUi = {
            size: 30,
            gap: 6,
            radius: 7,
            topSpacing: 12,
            activeOrder: new Map(),
            nextOrder: 0,
        };

        this._abilityUiLayout = {
            x: 25,
            y: 138 + this.topLeftYShift,
            size: 50,
            gap: 10,
            bottomY: 138 + this.topLeftYShift + 50,
        };

        this.anchors = {
            coins: { targetX: 96, targetY: 30 + this.topLeftYShift },
            timer: { targetX: 96, targetY: 78 + this.topLeftYShift },
            energy: { targetX: 250, targetY: 111 + this.topLeftYShift },
        };

        this.tipState = {
            index: -1,
            opacity: 0,
            phase: null,
            timer: 0,
            _lastTime: null,
            _lastTipContext: null,
            fadeInMs: 300,
            holdMs: 10000,
            fadeOutMs: 800,
        };

        this._tipRenderer = new TipRenderer(this);
        this._abilityUI = new AbilityUI(this);
        this._statusEffectsUI = new StatusEffectsUI(this);
    }

    getHudLayoutStyle() {
        return this.game?.uiLayoutStyle === 'legacy' ? 'legacy' : 'compact';
    }

    withHudLayoutStyle(style, callback) {
        const previous = this.game.uiLayoutStyle;
        this.game.uiLayoutStyle = style === 'legacy' ? 'legacy' : 'compact';
        try {
            return callback?.();
        } finally {
            this.game.uiLayoutStyle = previous;
        }
    }

    getUiTime() {
        const realNow = Date.now();

        if (this.uiLastRealTime === null) {
            this.uiLastRealTime = realNow;
            return this.uiTime;
        }

        const dt = realNow - this.uiLastRealTime;
        this.uiLastRealTime = realNow;

        if (!this.game.menu.pause.isPaused) {
            this.uiTime += Math.max(0, dt);
        }

        return this.uiTime;
    }

    syncLivesState() {
        const now = this.getUiTime();

        this.prevLives = this.game.player.lives;

        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = now;
        if (this.lifeGainEndTimes) this.lifeGainEndTimes.clear();
    }

    syncCoinsState() {
        this.prevCoins = this.game.coins ?? 0;
        this.coinPulseEndTime = 0;
        this.coinPulseType = null;
    }

    resetTransientUiState() {
        this.timerFlash = null;
        this.nextUnderwaterTickSoundIndex = 0;
        this.lastUnderwaterTickRemainingTime = null;
        this.game.audioHandler.mapSoundtrack.stopSound('timeTicking1Sound');
        this.game.audioHandler.mapSoundtrack.stopSound('timeTicking2Sound');
        this.syncCoinsState();
    }

    draw(context) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;
        context.font = this.fontString;
        context.textAlign = 'left';
        context.fillStyle = this.game.fontColor;

        // coins score
        this.drawCoinsUI(context);

        // bars
        this.distanceBar(context);
        this.bossHealthBar(context);

        // time
        this.timer(context);

        // energy
        this.energy(context);

        // lives
        this.drawLives(context);

        context.restore();

        // abilities
        this.firedogAbilityUI(context);

        // negative status effects
        this.drawNegativeStatusUI(context);

        // tips overlay
        this.updateTip();
        this.drawTip(context);
    }

    drawLivesCountText(context, x, centerY, value, {
        scale = 1,
        fillStyle = '#fff5bf',
        glowColor = null,
        glowBlur = 0,
    } = {}) {
        const xFont = this._font22;
        const valueFont = this._font29;

        context.save();
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        context.fillStyle = fillStyle;

        context.font = xFont;
        const xMetrics = context.measureText('x');

        context.font = valueFont;
        const valueMetrics = context.measureText(String(value));

        const ascent = Math.max(
            xMetrics.actualBoundingBoxAscent ?? 16,
            valueMetrics.actualBoundingBoxAscent ?? 21
        );
        const descent = Math.max(
            xMetrics.actualBoundingBoxDescent ?? 5,
            valueMetrics.actualBoundingBoxDescent ?? 6
        );
        const spacing = 2;
        const totalWidth = xMetrics.width + spacing + valueMetrics.width;
        const baselineY = centerY + ((ascent - descent) / 2);

        context.translate(x + totalWidth / 2, centerY);
        context.scale(scale, scale);

        context.shadowColor = glowColor ?? 'rgba(0, 0, 0, 0.9)';
        context.shadowBlur = glowBlur || 3;
        context.shadowOffsetX = glowColor ? 0 : 1;
        context.shadowOffsetY = glowColor ? 0 : 1;

        context.font = xFont;
        context.fillStyle = '#ffffff';
        context.strokeText('x', -totalWidth / 2, baselineY - centerY);
        context.fillText('x', -totalWidth / 2, baselineY - centerY);

        context.font = valueFont;
        context.fillStyle = '#ffffff';
        context.strokeText(String(value), -totalWidth / 2 + xMetrics.width + spacing, baselineY - centerY);
        context.fillText(String(value), -totalWidth / 2 + xMetrics.width + spacing, baselineY - centerY);
        context.restore();
    }

    drawLives(context) {
        const now = this.getUiTime();
        const hudStyle = this.getHudLayoutStyle();

        const prev = this.prevLives;
        const curr = this.game.player.lives;

        if (curr < prev) {
            this.lifeBlinkIndex = Math.max(0, prev - 1);
            this.lifeBlinkEndTime = now + this.lifeBlinkDuration;

            for (const idx of this.lifeGainEndTimes.keys()) {
                if (idx >= curr) this.lifeGainEndTimes.delete(idx);
            }
        }

        if (curr > prev) {
            for (let i = prev; i < curr; i++) {
                this.lifeGainEndTimes.set(i, now + this.lifeGainDuration);
            }
        }

        this.prevLives = curr;

        for (const [idx, endTime] of this.lifeGainEndTimes.entries()) {
            if (now >= endTime || idx >= curr) {
                this.lifeGainEndTimes.delete(idx);
            }
        }

        const isBlinkingLostLife = now < this.lifeBlinkEndTime && this.lifeBlinkIndex >= curr;
        let isGainingLife = false;
        for (const endTime of this.lifeGainEndTimes.values()) {
            if (now < endTime) { isGainingLife = true; break; }
        }

        if (hudStyle === 'legacy') {
            let gainMaxIndex = -1;
            for (const idx of this.lifeGainEndTimes.keys()) {
                if (idx > gainMaxIndex) gainMaxIndex = idx;
            }

            const maxLives = this.game.maxLives ?? this.game.player?.maxLives ?? curr;
            const heartsToDraw = Math.min(
                maxLives,
                Math.max(curr, this.lifeBlinkIndex + 1, gainMaxIndex + 1)
            );

            for (let i = 0; i < heartsToDraw; i++) {
                const baseX = 25 * i + 20;
                const baseY = 131 + this.topLeftYShift;

                const isBlinkingLostHeart =
                    i === this.lifeBlinkIndex &&
                    now < this.lifeBlinkEndTime &&
                    i >= curr;

                const gainEndTime = this.lifeGainEndTimes.get(i);
                const isGainingHeart = gainEndTime != null && now < gainEndTime && i < curr;

                context.save();

                if (isBlinkingLostHeart) {
                    const t = 1 - (this.lifeBlinkEndTime - now) / this.lifeBlinkDuration;
                    const pulse = 0.9 + 0.2 * Math.sin(t * Math.PI * 4);

                    context.translate(baseX + 12.5, baseY + 12.5);
                    context.scale(pulse, pulse);

                    context.shadowColor = 'red';
                    context.shadowBlur = 18;
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;

                    context.drawImage(this.livesImage, -12.5, -12.5, 25, 25);
                } else if (i < curr) {
                    if (isGainingHeart) {
                        const t = 1 - (gainEndTime - now) / this.lifeGainDuration;

                        const pop = 1.35 - 0.35 * t;
                        const pulse = 1 + 0.08 * Math.sin(t * Math.PI * 6);

                        context.translate(baseX + 12.5, baseY + 12.5);
                        context.scale(pop * pulse, pop * pulse);

                        context.shadowColor = 'lime';
                        context.shadowBlur = 18;
                        context.shadowOffsetX = 0;
                        context.shadowOffsetY = 0;

                        context.drawImage(this.livesImage, -12.5, -12.5, 25, 25);
                    } else {
                        context.drawImage(this.livesImage, baseX, baseY, 25, 25);
                    }
                }

                context.restore();
            }

            if (now >= this.lifeBlinkEndTime) {
                this.lifeBlinkIndex = -1;
            }
            return;
        }

        const baseX = 154;
        const baseY = 57 + this.topLeftYShift;
        const iconSize = 25;
        const centerX = baseX + iconSize / 2;
        const centerY = baseY + iconSize / 2;

        context.save();
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        if (isBlinkingLostLife) {
            const t = 1 - (this.lifeBlinkEndTime - now) / this.lifeBlinkDuration;
            const pulse = 0.9 + 0.2 * Math.sin(t * Math.PI * 4);

            context.translate(centerX, centerY);
            context.scale(pulse, pulse);
            context.shadowColor = 'red';
            context.shadowBlur = 18;
            context.drawImage(this.livesImage, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        } else if (isGainingLife) {
            let activeEndTime = 0;
            for (const et of this.lifeGainEndTimes.values()) { if (et > activeEndTime) activeEndTime = et; }
            const t = 1 - (activeEndTime - now) / this.lifeGainDuration;
            const pop = 1.35 - 0.35 * t;
            const pulse = 1 + 0.08 * Math.sin(t * Math.PI * 6);

            context.translate(centerX, centerY);
            context.scale(pop * pulse, pop * pulse);
            context.shadowColor = 'lime';
            context.shadowBlur = 18;
            context.drawImage(this.livesImage, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        } else {
            const outlineCanvas = getFilteredOutline(
                this.livesImage, iconSize, iconSize, 'brightness(0) invert(1)'
            );
            if (outlineCanvas) {
                context.drawImage(outlineCanvas, baseX - 1, baseY - 1, outlineCanvas.width, outlineCanvas.height);
            } else {
                context.save();
                context.filter = 'brightness(0) invert(1)';
                for (const [ox, oy] of OUTLINE_OFFSETS) {
                    context.drawImage(this.livesImage, baseX + ox, baseY + oy, iconSize, iconSize);
                }
                context.restore();
            }
            context.drawImage(this.livesImage, baseX, baseY, iconSize, iconSize);
        }
        context.restore();

        let textScale = 1;
        let textGlowColor = null;
        let textGlowBlur = 0;

        if (isBlinkingLostLife) {
            const t = 1 - (this.lifeBlinkEndTime - now) / this.lifeBlinkDuration;
            textScale = 0.95 + 0.14 * Math.sin(t * Math.PI * 4);
            textGlowColor = 'red';
            textGlowBlur = 14;
        } else if (isGainingLife) {
            let activeEndTime = 0;
            for (const et of this.lifeGainEndTimes.values()) { if (et > activeEndTime) activeEndTime = et; }
            const t = 1 - (activeEndTime - now) / this.lifeGainDuration;
            textScale = 1 + 0.12 * Math.sin(t * Math.PI * 6);
            textGlowColor = 'lime';
            textGlowBlur = 14;
        }

        this.drawLivesCountText(context, baseX + 31, centerY + 2, curr, {
            scale: textScale,
            glowColor: textGlowColor,
            glowBlur: textGlowBlur,
        });

        if (now >= this.lifeBlinkEndTime) {
            this.lifeBlinkIndex = -1;
        }
    }

    progressBar(
        context,
        percentage,
        filledWidth,
        barOrFilledWidth,
        colour,
        overhealFilledWidth = 0,
        overhealColour = 'rgba(120, 120, 120, 0.9)'
    ) {
        this.percentage = percentage;
        const barHeight = 10;
        const barX = (this.game.width / 2) - (this.barWidth / 2);
        const barY = 10;

        context.save();
        context.font = this._font18;
        context.fillStyle = this.game.fontColor;
        context.textAlign = 'left';
        context.fillText(Math.floor(percentage) + '%', barX + this.barWidth + 5, barY + barHeight);

        context.shadowColor = 'rgba(0, 0, 0, 0)';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        // background bar
        context.fillStyle = 'rgba(255, 255, 255, 0.25)';
        context.beginPath();
        context.moveTo(barX + 5, barY);
        context.lineTo(barX + this.barWidth - 5, barY);
        context.arcTo(barX + this.barWidth, barY, barX + this.barWidth, barY + 5, 5);
        context.lineTo(barX + this.barWidth, barY + barHeight - 5);
        context.arcTo(barX + this.barWidth, barY + barHeight, barX + this.barWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 5, barY, 5);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(barX + 5, barY);
        context.lineTo(barX + barOrFilledWidth - 5, barY);
        context.arcTo(barX + barOrFilledWidth, barY, barX + barOrFilledWidth, barY + 5, 5);
        context.lineTo(barX + barOrFilledWidth, barY + barHeight - 5);
        context.arcTo(barX + barOrFilledWidth, barY + barHeight, barX + barOrFilledWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 5, barY, 5);
        context.closePath();
        context.clip();

        context.fillStyle = colour;
        context.beginPath();
        context.moveTo(barX + 10, barY);
        context.lineTo(barX + filledWidth - 5, barY);
        context.arcTo(barX + filledWidth, barY, barX + filledWidth, barY + 5, 5);
        context.lineTo(barX + filledWidth, barY + barHeight - 5);
        context.arcTo(barX + filledWidth, barY + barHeight, barX + filledWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 10, barY, 5);
        context.closePath();
        context.fill();

        if (overhealFilledWidth > 0.5) {
            const endX = barX + this.barWidth;
            const startX = Math.max(barX, endX - overhealFilledWidth);

            const grey = 'rgba(170, 170, 170, 0.92)';

            context.fillStyle = grey;
            context.fillRect(startX, barY, endX - startX, barHeight);

            const feather = Math.min(2, overhealFilledWidth);

            if (feather > 0) {
                const g = context.createLinearGradient(startX - feather, 0, startX, 0);
                g.addColorStop(0, 'rgba(170, 170, 170, 0)');
                g.addColorStop(1, grey);
                context.fillStyle = g;
                context.fillRect(startX - feather, barY, feather, barHeight);
            }
        }
        context.restore();
    }

    distanceBar(context) {
        if (this.game.bossInFight) return;
        if (!this.game.background) return;
        if (this.game.boss && this.game.boss.progressComplete) return;

        const totalDist = this.game.background.totalDistanceTraveled || 0;
        const fallbackMaxDist = Math.max(1, this.game.maxDistance || 1);

        const gate = this.game.bossManager ? this.game.bossManager.getGateForCurrentMap() : null;

        let distanceTarget = fallbackMaxDist;
        let minCoins = 0;

        if (gate) {
            const gateMinDistance = gate.minDistance ?? 0;
            if (gateMinDistance > 0) distanceTarget = gateMinDistance;
            minCoins = gate.minCoins ?? 0;
        }

        const clampedDistanceTarget = Math.max(1, distanceTarget);
        const traveled = Math.min(totalDist, clampedDistanceTarget);
        const distanceProgress = traveled / clampedDistanceTarget;

        const pct = Math.min(Math.max(distanceProgress * 100, 0), 100);
        const filledDistance = distanceProgress * this.barWidth;

        this.progressBar(context, pct, filledDistance, this.barWidth, '#2ecc71');

        if (gate && minCoins > 0) {
            const coinsProgress = Math.min(this.game.coins / minCoins, 1);
            if (coinsProgress <= 0) return;

            const coinsFilled = coinsProgress * this.barWidth;

            const barHeight = 10;
            const barX = (this.game.width / 2) - (this.barWidth / 2);
            const barY = 10;

            const stripeHeight = barHeight * 0.4;
            const stripeY = barY + barHeight - stripeHeight;

            context.save();

            context.beginPath();
            context.moveTo(barX + 5, barY);
            context.lineTo(barX + this.barWidth - 5, barY);
            context.arcTo(barX + this.barWidth, barY, barX + this.barWidth, barY + 5, 5);
            context.lineTo(barX + this.barWidth, barY + barHeight - 5);
            context.arcTo(barX + this.barWidth, barY + barHeight, barX + this.barWidth - 5, barY + barHeight, 5);
            context.lineTo(barX + 5, barY + barHeight);
            context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
            context.lineTo(barX, barY + 5);
            context.arcTo(barX, barY, barX + 5, barY, 5);
            context.closePath();
            context.clip();

            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
            context.fillStyle = 'orange';

            const rightX = barX + coinsFilled;
            const radius = stripeHeight / 2;

            if (coinsFilled <= radius * 2) {
                context.fillRect(barX, stripeY, coinsFilled, stripeHeight);
            } else {
                context.beginPath();
                context.moveTo(barX, stripeY);
                context.lineTo(rightX - radius, stripeY);
                context.quadraticCurveTo(rightX, stripeY, rightX, stripeY + stripeHeight / 2);
                context.quadraticCurveTo(rightX, stripeY + stripeHeight, rightX - radius, stripeY + stripeHeight);
                context.lineTo(barX, stripeY + stripeHeight);
                context.closePath();
                context.fill();
            }

            context.restore();
        }
    }

    bossHealthBar(context) {
        if (!this.game.bossInFight) return;

        const bossState = this.game.boss;
        const boss = bossState && bossState.current;
        if (!boss) return;

        const rawBaseMax = boss.maxLives ?? boss.lives ?? 1;
        const baseMaxLives = Math.max(1, rawBaseMax);

        const overhealPercent = boss.overhealPercent ?? 0;
        const overhealCapLives = baseMaxLives * (1 + overhealPercent);

        const rawLives = boss.lives ?? baseMaxLives;
        const currentLives = Math.max(0, Math.min(rawLives, overhealCapLives));

        const pct = (currentLives / baseMaxLives) * 100;

        const isAlive = currentLives > 0;

        const baseFillRatio = Math.min(currentLives / baseMaxLives, 1);
        const filledWidth = isAlive ? Math.max(baseFillRatio * this.barWidth, 0.01 * this.barWidth) : 0;

        const overhealLives = Math.max(0, currentLives - baseMaxLives);
        const overhealMaxLives = Math.max(1, overhealCapLives - baseMaxLives);
        const overhealRatio = overhealPercent > 0 ? (overhealLives / overhealMaxLives) : 0;

        const overhealSegmentMaxWidth = this.barWidth * overhealPercent;
        const overhealFilledWidth = overhealSegmentMaxWidth * overhealRatio;

        const displayPct = isAlive ? Math.max(pct, 1) : 0;

        this.progressBar(
            context,
            displayPct,
            filledWidth,
            this.barWidth,
            'red',
            overhealFilledWidth,
            'rgba(120, 120, 120, 0.9)'
        );
    }

    clamp(n, a, b) {
        return Math.max(a, Math.min(b, n));
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    _getCachedGradient(ctx, key, buildX, buildW, stops) {
        if (!this._gradientCache) this._gradientCache = new Map();
        const fullKey = `${key}|${buildX}|${buildW}`;
        let g = this._gradientCache.get(fullKey);
        if (g) return g;
        g = ctx.createLinearGradient(buildX, 0, buildX + buildW, 0);
        if (!g) return null;
        for (const [offset, color] of stops) g.addColorStop(offset, color);
        if (this._gradientCache.size > 32) {
            const firstKey = this._gradientCache.keys().next().value;
            if (firstKey !== undefined) this._gradientCache.delete(firstKey);
        }
        this._gradientCache.set(fullKey, g);
        return g;
    }

    getRedToGreenGradient(ctx, x, w) {
        return this._getCachedGradient(ctx, 'rg', x, w, [
            [0.0, 'rgb(255, 45, 45)'],
            [0.5, 'rgb(255, 220, 70)'],
            [1.0, 'rgb(60, 230, 120)'],
        ]) ?? (() => {
            const g = ctx.createLinearGradient(x, 0, x + w, 0);
            g.addColorStop(0.0, 'rgb(255, 45, 45)');
            g.addColorStop(0.5, 'rgb(255, 220, 70)');
            g.addColorStop(1.0, 'rgb(60, 230, 120)');
            return g;
        })();
    }

    getBluePotionGradient(ctx, x, w) {
        return this._getCachedGradient(ctx, 'bp', x, w, [
            [0.0, 'rgb(140, 220, 255)'],
            [1.0, 'rgba(15, 103, 255, 1)'],
        ]) ?? (() => {
            const g = ctx.createLinearGradient(x, 0, x + w, 0);
            g.addColorStop(0.0, 'rgb(140, 220, 255)');
            g.addColorStop(1.0, 'rgba(15, 103, 255, 1)');
            return g;
        })();
    }

    getPoisonGradient(ctx, x, w) {
        return this._getCachedGradient(ctx, 'po', x, w, [
            [0.0, 'rgb(10, 120, 50)'],
            [1.0, 'rgb(140, 255, 160)'],
        ]) ?? (() => {
            const g = ctx.createLinearGradient(x, 0, x + w, 0);
            g.addColorStop(0.0, 'rgb(10, 120, 50)');
            g.addColorStop(1.0, 'rgb(140, 255, 160)');
            return g;
        })();
    }

    drawEnergyBar(ctx, x, y, w, h, ratio01, status, showExhaustedMarker, thresholdRatio01) {
        const r = this.energyBar.radius;
        const nowRaw = this.getUiTime();
        const paused = !!this.game.menu.pause.isPaused;

        const now = paused ? 0 : (nowRaw % 60000);

        const low = ratio01 <= (this.energyBar.pulseLowThreshold / 100);
        const pulseT = paused ? 0 : (Math.sin(now * this.energyBar.pulseSpeed) * 0.5 + 0.5);
        const pulse = low ? this.lerp(0.35, 1.0, pulseT) : 0;

        const statusActive = (status === 'blue' || status === 'poison');
        const statusSpeed =
            status === 'blue' ? (this.energyBar.pulseSpeed ?? 0.012) :
                status === 'poison' ? ((this.energyBar.pulseSpeed ?? 0.012) * 0.85) :
                    0;

        const statusPulseT = paused ? 0 : (Math.sin(now * statusSpeed) * 0.5 + 0.5);
        const statusPulse = statusActive ? this.lerp(0.35, 1.0, statusPulseT) : 0;

        const statusColor =
            status === 'blue' ? 'rgba(80, 180, 255, 1)' :
                status === 'poison' ? 'rgba(19, 216, 19, 1)' :
                    null;

        const showLowWarning = low && !statusActive;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        this.roundedRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = 'rgba(18, 0, 20, 0.78)';
        ctx.fill();

        const inset = 2;
        const ix = x + inset;
        const iy = y + inset;
        const iw = w - inset * 2;
        const ih = h - inset * 2;
        const ir = Math.max(0, r - inset);

        this.roundedRectPath(ctx, ix, iy, iw, ih, ir);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fill();

        ctx.save();
        this.roundedRectPath(ctx, ix, iy, iw, ih, ir);
        ctx.clip();

        let fillGradient;
        if (status === 'blue') fillGradient = this.getBluePotionGradient(ctx, ix, iw);
        else if (status === 'poison') fillGradient = this.getPoisonGradient(ctx, ix, iw);
        else fillGradient = this.getRedToGreenGradient(ctx, ix, iw);

        const fillW = Math.max(0, Math.min(iw, iw * ratio01));
        if (fillW > 0.5) {
            ctx.fillStyle = fillGradient;
            ctx.fillRect(ix, iy, fillW, ih);

            const shineH = ih * this.energyBar.shineHeightRatio;
            let shine = this._shineCache?.get(`${iy}|${shineH}`);
            if (!shine) {
                shine = ctx.createLinearGradient(0, iy, 0, iy + shineH);
                if (shine) {
                    shine.addColorStop(0, 'rgba(255,255,255,0.35)');
                    shine.addColorStop(1, 'rgba(255,255,255,0.00)');
                    if (!this._shineCache) this._shineCache = new Map();
                    if (this._shineCache.size > 16) {
                        const firstKey = this._shineCache.keys().next().value;
                        if (firstKey !== undefined) this._shineCache.delete(firstKey);
                    }
                    this._shineCache.set(`${iy}|${shineH}`, shine);
                }
            }
            ctx.fillStyle = shine;
            ctx.fillRect(ix, iy, fillW, shineH);
        }

        if (showExhaustedMarker && typeof thresholdRatio01 === 'number' && thresholdRatio01 > 0 && thresholdRatio01 < 1) {
            const mx = ix + iw * thresholdRatio01;

            ctx.save();
            ctx.strokeStyle = 'rgba(255, 40, 40, 0.9)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(mx, iy);
            ctx.lineTo(mx, iy + ih);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 40, 40, 0.9)';
            ctx.beginPath();
            ctx.moveTo(mx, iy);
            ctx.lineTo(mx - 6, iy);
            ctx.lineTo(mx, iy + 7);
            ctx.lineTo(mx + 6, iy);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // status blink
        if (statusActive && !paused && statusColor) {
            ctx.save();
            this.roundedRectPath(ctx, x, y, w, h, r);

            ctx.lineWidth = 3;
            ctx.strokeStyle = statusColor;

            ctx.globalAlpha = 0.30 + 0.45 * statusPulse;
            ctx.shadowColor = statusColor;
            ctx.shadowBlur = 14 + 16 * statusPulse;

            ctx.stroke();
            ctx.restore();
        }

        // <20 warning
        if (showLowWarning && !paused && !this.game.player.isHourglassActive) {
            ctx.save();
            this.roundedRectPath(ctx, x, y, w, h, r);

            const warningColor = showExhaustedMarker ? 'rgba(255, 40, 40, 1)' : 'rgba(255, 200, 40, 1)';

            ctx.lineWidth = 3;
            ctx.strokeStyle = warningColor;

            ctx.globalAlpha = 0.30 + 0.45 * pulse;
            ctx.shadowColor = warningColor;
            ctx.shadowBlur = 14 + 16 * pulse;

            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();

        // status low-energy glow
        if (statusActive && !paused && statusColor) {
            ctx.save();
            this.roundedRectPath(ctx, x, y, w, h, r);

            ctx.strokeStyle = statusColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.12 + 0.22 * statusPulse;
            ctx.shadowColor = statusColor;
            ctx.shadowBlur = 8 + 8 * statusPulse;

            ctx.stroke();
            ctx.restore();
        }

        // low-energy glow
        if (showLowWarning && !paused && !this.game.player.isHourglassActive) {
            ctx.save();
            this.roundedRectPath(ctx, x, y, w, h, r);

            const glow = 'rgba(255,45,45,1)';
            ctx.strokeStyle = glow;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.12 + 0.22 * pulse;
            ctx.shadowColor = glow;
            ctx.shadowBlur = 8 + 8 * pulse;

            ctx.stroke();
            ctx.restore();
        }

        // hourglass active
        if (this.game.player.isHourglassActive && !paused && !showExhaustedMarker && !statusActive) {
            const t = Math.sin(nowRaw * 0.010) * 0.5 + 0.5;
            const a = 0.15 + 0.55 * t;

            ctx.save();
            ctx.shadowColor = 'rgba(255, 215, 0, 1)';
            ctx.shadowBlur = 10 + 18 * t;
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 215, 0, 1)';
            ctx.globalAlpha = a;
            this.roundedRectPath(ctx, x, y, w, h, r);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.lineWidth = 2;

        const strokeColor =
            showExhaustedMarker
                ? 'rgba(255, 40, 40, 0.95)'
                : (status === 'blue')
                    ? 'rgba(80, 180, 255, 0.95)'
                    : (status === 'poison')
                        ? 'rgba(19, 216, 19, 0.95)'
                        : this.game.player.isHourglassActive
                            ? 'rgba(0, 0, 0, 0)'
                            : (ratio01 <= (this.energyBar.pulseLowThreshold / 100))
                                ? 'rgba(255, 220, 70, 0.95)'
                                : 'rgba(0, 0, 0, 0.90)';

        ctx.strokeStyle = strokeColor;

        this.roundedRectPath(ctx, x, y, w, h, r);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    energy(context) {
        const player = this.game.player;

        let status = 'normal';
        if (player.isBluePotionActive === true) status = 'blue';
        else if (player.isPoisonedActive === true) status = 'poison';

        const maxEnergy =
            (typeof player.maxEnergy === 'number' && player.maxEnergy > 0) ? player.maxEnergy : 100;

        const realEnergy = this.clamp(player.energy ?? 0, 0, maxEnergy);

        // lerp toward real value each frame
        const now = Date.now();
        if (this._smoothEnergy === undefined) {
            this._smoothEnergy = realEnergy;
            this._smoothEnergyTime = now;
        }
        const dt = Math.min((now - this._smoothEnergyTime) / 1000, 0.1);
        this._smoothEnergyTime = now;
        this._smoothEnergy += (realEnergy - this._smoothEnergy) * (1 - Math.exp(-60 * dt));
        this._smoothEnergy = this.clamp(this._smoothEnergy, 0, maxEnergy);

        const energy = this._smoothEnergy;
        const ratio = maxEnergy > 0 ? (energy / maxEnergy) : 0;

        const exhausted = player.isEnergyExhausted === true;
        const thresholdRatio = this.clamp(20 / maxEnergy, 0, 1);

        const paused = !!this.game.menu.pause.isPaused;

        const shakeAmount = player.isBluePotionActive ? 3.2 : 0;
        const shakeFrequency = 0.10;

        let offsetX = 0;
        let offsetY = 0;

        if (!paused && shakeAmount > 0) {
            const sx = Math.random() > 0.5 ? 1 : -1;
            const sy = Math.random() > 0.5 ? 1 : -1;
            offsetX = shakeAmount * sx * Math.sin(Date.now() * shakeFrequency);
            offsetY = shakeAmount * sy * Math.cos(Date.now() * shakeFrequency);
        }

        const { x, y, w, h } = this.energyBar;
        const barX = x + offsetX;
        const barY = y + offsetY;

        this.drawEnergyBar(
            context,
            barX,
            barY,
            w,
            h,
            ratio,
            status,
            exhausted,
            thresholdRatio
        );

        const valueText = (player.energy ?? 0).toFixed(1);

        context.save();
        context.shadowColor = 'black';
        context.shadowBlur = 4;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        if (exhausted) {
            context.font = 'bold 13px Arial';
            context.fillText(valueText, barX + w / 2, barY + h * 0.38);

            context.font = 'bold 10px Arial';
            context.fillText('EXHAUSTED', barX + w / 2, barY + h * 0.72);
        } else {
            const label =
                status === 'poison' ? 'POISONED' :
                    status === 'blue' ? 'BOOSTED' :
                        null;

            if (label) {
                context.font = 'bold 13px Arial';
                context.fillText(valueText, barX + w / 2, barY + h * 0.38);

                context.font = 'bold 10px Arial';
                context.fillText(label, barX + w / 2, barY + h * 0.72);
            } else {
                context.font = 'bold 13px Arial';
                context.fillText(valueText, barX + w / 2, barY + h / 2);
            }
        }

        context.restore();
    }

    triggerTimerFlash(color, pulseCount = 5, pulseDurationMs = 260) {
        const startTime = this.getUiTime();
        this.timerFlash = {
            color,
            startTime,
            pulseCount,
            pulseDurationMs,
            endTime: startTime + (pulseCount * pulseDurationMs),
        };
    }

    timer(context) {
        context.font = this._font30;
        let formattedTime;
        let time;
        const player = this.game.player;
        const isUnderwater = !!player?.isUnderwater;
        const criticalBlinkOn = !!player?.isUnderwaterCriticalBlinkOn?.();
        const inCriticalBlink = !!player?.isUnderwaterCriticalTime?.();

        if (isUnderwater) {
            time = player.getUnderwaterRemainingTime?.() ?? Math.max(this.game.maxTimeUnderwater - this.game.time, 0);

            let dynamicColor = '#FF5555';
            if (criticalBlinkOn) {
                dynamicColor = '#88CCFF';
            }
            context.save();

            if (dynamicColor === '#FF5555') {
                context.fillStyle = 'red';
                context.shadowColor = 'black';
            } else {
                context.fillStyle = dynamicColor;
                context.shadowColor = 'black';
            }
            if (time <= 0) {
                context.fillStyle = 'red';
                context.shadowColor = 'black';
            }
        } else {
            time = this.game.time;
        }

        if (isUnderwater && time > this.secondsLeft) {
            context.fillStyle = 'black';
            context.shadowColor = 'white';
        }

        let minutes = Math.floor(time / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        if (seconds === 60) {
            seconds = 0;
            minutes += 1;
        }
        formattedTime = `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;

        const now = this.getUiTime();
        const flashActive = this.timerFlash && now < this.timerFlash.endTime;
        let panelTextColor = 'white';
        let panelBorderColor = 'rgba(255, 255, 255, 0.4)';
        let flashPulseScale = 1;

        if (isUnderwater) {
            if (time <= 0) {
                panelTextColor = '#FF5555';
                panelBorderColor = 'rgba(255, 60, 60, 0.85)';
            } else if (time <= this.secondsLeft) {
                panelTextColor = criticalBlinkOn ? '#88CCFF' : '#FF5555';
                panelBorderColor = 'rgba(255, 60, 60, 0.85)';
            } else {
                panelTextColor = '#88CCFF';
                panelBorderColor = 'rgba(80, 160, 255, 0.6)';
            }
        }

        if (flashActive && !inCriticalBlink) {
            const flashElapsed = now - this.timerFlash.startTime;
            const pulseDurationMs = this.timerFlash.pulseDurationMs;
            const pulseLocalT = (flashElapsed % pulseDurationMs) / pulseDurationMs;
            const blinkOn = pulseLocalT < 0.5;

            if (blinkOn) {
                panelTextColor = this.timerFlash.color;
                panelBorderColor = this.timerFlash.color;
            }

            flashPulseScale = 1 + 0.08 * Math.sin(pulseLocalT * Math.PI);
        }

        this._drawTimerPanel(context, formattedTime, panelTextColor, flashPulseScale);

        const canTrackUnderwaterWarning =
            isUnderwater &&
            time > 0 &&
            !this.game.cabin.isFullyVisible &&
            !this.game.gameOver;

        const canPlayUnderwaterTick =
            isUnderwater &&
            inCriticalBlink &&
            time > 0 &&
            !this.game.cabin.isFullyVisible &&
            !this.game.gameOver &&
            !this.game.menu.pause.isPaused;

        if (canPlayUnderwaterTick) {
            const warningTimeJumped =
                this.lastUnderwaterTickRemainingTime != null &&
                Math.abs(time - this.lastUnderwaterTickRemainingTime) >= 5000;

            const enteredCriticalNaturally =
                this.lastUnderwaterTickRemainingTime != null &&
                this.lastUnderwaterTickRemainingTime > this.secondsLeft &&
                time <= this.secondsLeft &&
                !warningTimeJumped;
            const previousSecond = this.lastUnderwaterTickRemainingTime == null
                ? null
                : Math.floor(this.lastUnderwaterTickRemainingTime / 1000);
            const currentSecond = Math.floor(time / 1000);
            const crossedSecondBoundaryNaturally =
                previousSecond != null &&
                currentSecond < previousSecond &&
                !warningTimeJumped;

            if (enteredCriticalNaturally || crossedSecondBoundaryNaturally) {
                const tickSound = this.nextUnderwaterTickSoundIndex === 0 ? 'timeTicking1Sound' : 'timeTicking2Sound';
                this.game.audioHandler.mapSoundtrack.playSound(tickSound, false, true);
                this.nextUnderwaterTickSoundIndex = this.nextUnderwaterTickSoundIndex === 0 ? 1 : 0;
            }
            this.lastUnderwaterTickRemainingTime = time;
        } else if (canTrackUnderwaterWarning) {
            this.lastUnderwaterTickRemainingTime = time;
        } else {
            this.lastUnderwaterTickRemainingTime = null;
        }
        if (isUnderwater) {
            context.restore();
        }

        if (this.game.player.isBluePotionActive) {
            context.save();

            const shakeAmount = 3;
            const shakeFrequency = 0.1;

            let offsetX = 0;
            let offsetY = 0;

            if (!this.game.menu.pause.isPaused) {
                const shakeDirectionX = Math.random() > 0.5 ? 1 : -1;
                const shakeDirectionY = Math.random() > 0.5 ? 1 : -1;
                offsetX = shakeAmount * shakeDirectionX * Math.sin(Date.now() * shakeFrequency);
                offsetY = shakeAmount * shakeDirectionY * Math.cos(Date.now() * shakeFrequency);
            }

            const blueFireTime = (this.game.player.blueFireTimer / 1000).toFixed(1);

            context.fillStyle = 'blue';
            context.shadowColor = 'white';
            context.textAlign = 'center';

            context.font = this._font60;
            context.fillText(blueFireTime, this.game.width / 2 + offsetX, 90 + offsetY);

            const textMetrics = context.measureText(blueFireTime);
            const blueFireTimeWidth = textMetrics.width;
            context.font = this._font36;
            context.fillText(' s', this.game.width / 2 + offsetX + blueFireTimeWidth / 2 + 5, 90 + offsetY);

            context.restore();
        }
    }

    drawCoinsUI(context) {
        context.save();
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        const now = this.getUiTime();
        const currentCoins = this.game.coins ?? 0;
        if (currentCoins > this.prevCoins) {
            this.coinPulseEndTime = now + this.coinPulseDuration;
            this.coinPulseType = 'gain';
        } else if (currentCoins < this.prevCoins) {
            this.coinPulseEndTime = now + this.coinPulseDuration;
            this.coinPulseType = 'loss';
        }
        this.prevCoins = currentCoins;

        const coinScale = this.coinPulseEndTime > now
            ? 1 + 0.12 * Math.sin((1 - ((this.coinPulseEndTime - now) / this.coinPulseDuration)) * Math.PI)
            : 1;
        const isLossPulse = this.coinPulseEndTime > now && this.coinPulseType === 'loss';

        const panelX = 20;
        const panelY = 7 + this.topLeftYShift;
        const panelH = 40;
        const iconD = 24;
        const paddingL = 10;
        const gap = 11;
        const font = this._font29;

        context.font = font;
        const coinText = '' + this.game.coins;

        // Coin icon
        const iconR = iconD / 2;
        const cx = panelX + paddingL + iconR;
        const cy = panelY + panelH / 2;
        drawCoinIcon(context, cx, cy, iconR, { isLoss: isLossPulse, scale: coinScale });

        const valueX = panelX + paddingL + iconD + gap + 5;
        const valueY = cy + 2;

        // Coin count
        context.save();
        context.translate(valueX, valueY);
        context.scale(coinScale, coinScale);
        context.font = font;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillStyle = isLossPulse ? '#ff6f6f' : '#FFD15A';
        context.strokeStyle = isLossPulse ? 'rgba(90, 12, 12, 0.92)' : 'rgba(90, 55, 0, 0.8)';
        context.lineWidth = 2;
        context.shadowColor = 'rgba(0, 0, 0, 0.9)';
        context.shadowBlur = 3 + ((coinScale - 1) * 20);
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.strokeText(coinText, 0, 0);
        context.fillText(coinText, 0, 0);
        context.restore();

        context.restore();
    }

    _drawTimerPanel(context, formattedTime, textColor, valueScale = 1) {
        context.save();
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        const panelX = 20;
        const panelY = 50 + this.topLeftYShift;
        const panelH = 40;
        const iconD = 24;
        const paddingL = 10;
        const gap = 11;
        const font = this._font29;

        context.font = font;
        // Clock icon
        const iconR = iconD / 2;
        const icx = panelX + paddingL + iconR;
        const icy = panelY + panelH / 2;

        context.save();
        context.translate(icx, icy);
        context.scale(valueScale, valueScale);
        context.beginPath();
        context.arc(0, 0, iconR, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.08)';
        context.fill();
        context.strokeStyle = textColor;
        context.lineWidth = 1.8;
        context.stroke();

        context.lineCap = 'round';
        context.strokeStyle = textColor;

        const hourAngle = -Math.PI / 2 - Math.PI / 3;
        context.beginPath();
        context.lineWidth = 1.5;
        context.moveTo(0, 0);
        context.lineTo(iconR * 0.5 * Math.cos(hourAngle), iconR * 0.5 * Math.sin(hourAngle));
        context.stroke();

        const minAngle = -Math.PI / 2 + Math.PI / 3;
        context.beginPath();
        context.lineWidth = 1;
        context.moveTo(0, 0);
        context.lineTo(iconR * 0.7 * Math.cos(minAngle), iconR * 0.7 * Math.sin(minAngle));
        context.stroke();

        context.beginPath();
        context.arc(0, 0, 1.5, 0, Math.PI * 2);
        context.fillStyle = textColor;
        context.fill();
        context.restore();

        const valueX = panelX + paddingL + iconD + gap + 4;
        const valueY = icy + 2;

        // Time text
        context.save();
        context.translate(valueX, valueY);
        context.scale(valueScale, valueScale);
        context.font = font;
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillStyle = textColor;
        context.strokeStyle = textColor === '#111111'
            ? 'rgba(255,255,255,0.55)'
            : 'rgba(0, 0, 0, 0.85)';
        context.lineWidth = 2;
        context.shadowColor = 'rgba(0, 0, 0, 0.9)';
        context.shadowBlur = 3 + ((valueScale - 1) * 24);
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.strokeText(formattedTime, 0, 0);
        context.fillText(formattedTime, 0, 0);
        context.restore();

        context.restore();
    }

    roundedRectPath(ctx, x, y, w, h, r) {
        const radius = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // AbilityUI
    drawAbilityFrame(ctx, x, y, size, opts) { return this._abilityUI.drawAbilityFrame(ctx, x, y, size, opts); }
    getSpinnerPhase(nowMs, speed) { return this._abilityUI.getSpinnerPhase(nowMs, speed); }
    strokeRoundedRectSpinner(ctx, x, y, size, radius, color, lineWidth, nowMs, opts) { return this._abilityUI.strokeRoundedRectSpinner(ctx, x, y, size, radius, color, lineWidth, nowMs, opts); }
    drawAbilityIcon(ctx, img, x, y, size, opts) { return this._abilityUI.drawAbilityIcon(ctx, img, x, y, size, opts); }
    firedogAbilityUI(context) { return this._abilityUI.firedogAbilityUI(context); }

    // StatusEffectsUI
    getNegativeStatusSnapshot() { return this._statusEffectsUI.getNegativeStatusSnapshot(); }
    syncNegativeStatusIndicators() { return this._statusEffectsUI.syncNegativeStatusIndicators(); }
    drawNegativeStatusEffect(ctx, x, y, size, effect) { return this._statusEffectsUI.drawNegativeStatusEffect(ctx, x, y, size, effect); }
    drawNegativeStatusUI(ctx) { return this._statusEffectsUI.drawNegativeStatusUI(ctx); }

    // TipRenderer
    _measureTipText(context, text) { return this._tipRenderer._measureTipText(context, text); }
    _buildTipColorSpans(text) { return this._tipRenderer._buildTipColorSpans(text); }
    _renderColoredTipLine(context, lineText, centerX, textY, spans) { return this._tipRenderer._renderColoredTipLine(context, lineText, centerX, textY, spans); }
    _getTipContext() { return this._tipRenderer._getTipContext(); }
    _getTips() { return this._tipRenderer._getTips(); }
    dismissTip() { return this._tipRenderer.dismissTip(); }
    resetTip() { return this._tipRenderer.resetTip(); }
    cycleTip() { return this._tipRenderer.cycleTip(); }
    updateTip() { return this._tipRenderer.updateTip(); }
    drawTip(context) { return this._tipRenderer.drawTip(context); }
    drawTutorialProgressBar(context, percentage, colour) { return this._tipRenderer.drawTutorialProgressBar(context, percentage, colour); }

    // for how to play menu
    drawTopLeftOnly(context, options = {}) {
        const previewCoins = options.previewCoins ?? 217;
        const previewLives = options.previewLives ?? 5;
        const previewTime = options.previewTime ?? 228000;
        const previewPlayerPatch = options.previewPlayerPatch ?? null;
        const drawAbilitiesWithPreviewState = options.drawAbilitiesWithPreviewState === true;

        const originalCoins = this.game.coins;
        const originalTime = this.game.time;
        const originalLives = this.game.player?.lives;
        const originalPlayerValues = new Map();
        const originalPrevCoins = this.prevCoins;
        const originalCoinPulseEndTime = this.coinPulseEndTime;
        const originalCoinPulseType = this.coinPulseType;
        const originalPrevLives = this.prevLives;
        const originalLifeBlinkIndex = this.lifeBlinkIndex;
        const originalLifeBlinkEndTime = this.lifeBlinkEndTime;
        const originalLifeGainEndTimes = new Map(this.lifeGainEndTimes);
        const originalTimerFlash = this.timerFlash;
        const originalSmoothEnergy = this._smoothEnergy;
        const originalSmoothEnergyTime = this._smoothEnergyTime;

        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;
        context.font = this.fontString;
        context.textAlign = 'left';
        context.fillStyle = this.game.fontColor;

        this.game.coins = previewCoins;
        this.game.time = previewTime;

        if (this.game.player) {
            this.game.player.lives = previewLives;
            if (previewPlayerPatch && typeof previewPlayerPatch === 'object') {
                for (const [key, value] of Object.entries(previewPlayerPatch)) {
                    originalPlayerValues.set(key, this.game.player[key]);
                    this.game.player[key] = value;
                }
            }
        }

        this.prevCoins = previewCoins;
        this.coinPulseEndTime = 0;
        this.coinPulseType = null;
        this.prevLives = previewLives;
        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = 0;
        this.lifeGainEndTimes.clear();
        this.timerFlash = null;
        if (this.game.player) {
            const previewEnergy = Number.isFinite(Number(this.game.player.energy)) ? Number(this.game.player.energy) : 100;
            this._smoothEnergy = previewEnergy;
            this._smoothEnergyTime = Date.now();
        }

        this.drawCoinsUI(context);
        this.timer(context);
        if (this.game.player) this.energy(context);
        if (this.game.player) this.drawLives(context);
        if (drawAbilitiesWithPreviewState && this.game.player) this.firedogAbilityUI(context);

        context.restore();

        this.game.coins = originalCoins;
        this.game.time = originalTime;
        if (this.game.player && typeof originalLives === 'number') {
            this.game.player.lives = originalLives;
            for (const [key, value] of originalPlayerValues.entries()) {
                this.game.player[key] = value;
            }
        }

        this.prevCoins = originalPrevCoins;
        this.coinPulseEndTime = originalCoinPulseEndTime;
        this.coinPulseType = originalCoinPulseType;
        this.prevLives = originalPrevLives;
        this.lifeBlinkIndex = originalLifeBlinkIndex;
        this.lifeBlinkEndTime = originalLifeBlinkEndTime;
        this.lifeGainEndTimes = originalLifeGainEndTimes;
        this.timerFlash = originalTimerFlash;
        this._smoothEnergy = originalSmoothEnergy;
        this._smoothEnergyTime = originalSmoothEnergyTime;

        if (!drawAbilitiesWithPreviewState && this.game.player) this.firedogAbilityUI(context);
    }
}
