import { TIP_PHRASE_COLORS, MAP_TIPS } from './tips.js';
import { drawCoinIcon } from './hudIcons.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Love Ya Like A Sister';
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
        context.font = this.fontSize + 'px ' + this.fontFamily;
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
        const xFont = '22px ' + this.fontFamily;
        const valueFont = '29px ' + this.fontFamily;

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
        const isGainingLife = [...this.lifeGainEndTimes.values()].some((endTime) => now < endTime);

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
        const outlineOffsets = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
        ];

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
            const activeEndTime = Math.max(...this.lifeGainEndTimes.values());
            const t = 1 - (activeEndTime - now) / this.lifeGainDuration;
            const pop = 1.35 - 0.35 * t;
            const pulse = 1 + 0.08 * Math.sin(t * Math.PI * 6);

            context.translate(centerX, centerY);
            context.scale(pop * pulse, pop * pulse);
            context.shadowColor = 'lime';
            context.shadowBlur = 18;
            context.drawImage(this.livesImage, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        } else {
            context.save();
            context.filter = 'brightness(0) invert(1)';
            for (const [ox, oy] of outlineOffsets) {
                context.drawImage(this.livesImage, baseX + ox, baseY + oy, iconSize, iconSize);
            }
            context.restore();
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
            const activeEndTime = Math.max(...this.lifeGainEndTimes.values());
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
        context.font = '18px ' + this.fontFamily;
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

    getRedToGreenGradient(ctx, x, w) {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0.0, 'rgb(255, 45, 45)');
        g.addColorStop(0.5, 'rgb(255, 220, 70)');
        g.addColorStop(1.0, 'rgb(60, 230, 120)');
        return g;
    }

    getBluePotionGradient(ctx, x, w) {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0.0, 'rgb(140, 220, 255)');
        g.addColorStop(1.0, 'rgba(15, 103, 255, 1)');
        return g;
    }

    getPoisonGradient(ctx, x, w) {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0.0, 'rgb(10, 120, 50)');
        g.addColorStop(1.0, 'rgb(140, 255, 160)');
        return g;
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
            const shine = ctx.createLinearGradient(0, iy, 0, iy + shineH);
            shine.addColorStop(0, 'rgba(255,255,255,0.35)');
            shine.addColorStop(1, 'rgba(255,255,255,0.00)');
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
        context.font = this.fontSize * 1 + 'px ' + this.fontFamily;
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

            context.font = this.fontSize * 2 + 'px ' + this.fontFamily;
            context.fillText(blueFireTime, this.game.width / 2 + offsetX, 90 + offsetY);

            const textMetrics = context.measureText(blueFireTime);
            const blueFireTimeWidth = textMetrics.width;
            context.font = this.fontSize * 1.2 + 'px ' + this.fontFamily;
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
        const font = '29px ' + this.fontFamily;

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
        const font = '29px ' + this.fontFamily;

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

    drawAbilityFrame(ctx, x, y, size, {
        fill = 'rgba(18, 0, 20, 0.95)',
        strokeWidth = Math.max(1.5, size * 0.045),
        radius = size * 0.14,
        shadowColor = 'rgba(0,0,0,0.65)',
        shadowBlur = size * 0.14,
        shadowOffsetX = 0,
        shadowOffsetY = 0,
    } = {}) {
        ctx.save();
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;

        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();

        return { strokeWidth, radius };
    }

    getSpinnerPhase(nowMs, speed = 1.0) {
        return ((nowMs / 1000) * speed) % 1;
    }

    strokeRoundedRectSpinner(ctx, x, y, size, radius, color, lineWidth, nowMs, {
        segments = 120,
        speed = 0.45,
        headWidth = 0.18,
        minAlpha = 0.15,
        maxAlpha = 1.0,
        phaseOverride = null,
    } = {}) {
        const r = Math.max(0, Math.min(radius, size / 2));
        const w = size;
        const h = size;

        const straight = Math.max(0, (w - 2 * r));
        const cornerArc = Math.PI / 2;
        const arcLen = r * cornerArc;

        const perim = 2 * straight + 2 * (h - 2 * r) + 4 * arcLen;

        const t = (phaseOverride != null)
            ? phaseOverride
            : (((nowMs / 1000) * speed) % 1);

        const pointAt = (s) => {
            if (s < straight) return { x: x + r + s, y: y };
            s -= straight;

            if (s < arcLen) {
                const u = s / arcLen;
                const ang = (-Math.PI / 2) + u * (Math.PI / 2);
                return { x: x + w - r + Math.cos(ang) * r, y: y + r + Math.sin(ang) * r };
            }
            s -= arcLen;

            const vLen = Math.max(0, h - 2 * r);
            if (s < vLen) return { x: x + w, y: y + r + s };
            s -= vLen;

            if (s < arcLen) {
                const u = s / arcLen;
                const ang = 0 + u * (Math.PI / 2);
                return { x: x + w - r + Math.cos(ang) * r, y: y + h - r + Math.sin(ang) * r };
            }
            s -= arcLen;

            if (s < straight) return { x: x + w - r - s, y: y + h };
            s -= straight;

            if (s < arcLen) {
                const u = s / arcLen;
                const ang = (Math.PI / 2) + u * (Math.PI / 2);
                return { x: x + r + Math.cos(ang) * r, y: y + h - r + Math.sin(ang) * r };
            }
            s -= arcLen;

            if (s < vLen) return { x: x, y: y + h - r - s };
            s -= vLen;

            const u = arcLen > 0 ? (s / arcLen) : 0;
            const ang = Math.PI + u * (Math.PI / 2);
            return { x: x + r + Math.cos(ang) * r, y: y + r + Math.sin(ang) * r };
        };

        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (let i = 0; i < segments; i++) {
            const p0 = (i / segments) * perim;
            const p1 = ((i + 1) / segments) * perim;

            const u = i / segments;
            let d = u - t;
            d = ((d % 1) + 1) % 1;

            let a;
            if (d <= headWidth) {
                const k = 1 - (d / headWidth);
                a = minAlpha + (maxAlpha - minAlpha) * (k * k);
            } else {
                a = minAlpha;
            }

            ctx.strokeStyle = color;
            ctx.globalAlpha = a;

            const A = pointAt(p0);
            const B = pointAt(p1);

            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawAbilityIcon(ctx, img, x, y, size, {
        borderColor = 'black',
        fill = 'rgba(18, 0, 20, 0.95)',
        contentScale = 0.9,
        radius = size * 0.14,
        strokeWidth = Math.max(1.5, size * 0.045),
        insetUnderBorder = 0,

        animatedBorder = false,
        animatedColor = 'red',
        animatedNowMs = 0,
        animatedSettings = null,

        contentFilter = null,
    } = {}) {
        const frame = this.drawAbilityFrame(ctx, x, y, size, { fill, radius, strokeWidth });

        const half = frame.strokeWidth / 2;
        const clipX = x + half;
        const clipY = y + half;
        const clipSize = size - half * 2;

        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        this.roundedRectPath(ctx, clipX, clipY, clipSize, clipSize, Math.max(0, frame.radius - half));
        ctx.clip();

        const inner = size * contentScale;
        const pad = (size - inner) / 2 + insetUnderBorder;

        const prevFilter = ctx.filter;
        if (contentFilter) ctx.filter = contentFilter;

        ctx.drawImage(
            img,
            x + pad,
            y + pad,
            inner - insetUnderBorder * 2,
            inner - insetUnderBorder * 2
        );

        ctx.filter = prevFilter;
        ctx.restore();

        if (animatedBorder) {
            this.strokeRoundedRectSpinner(
                ctx,
                x,
                y,
                size,
                frame.radius,
                animatedColor,
                frame.strokeWidth,
                animatedNowMs,
                animatedSettings || {
                    segments: 140,
                    speed: 0.55,
                    headWidth: 0.22,
                    minAlpha: 0.12,
                    maxAlpha: 1.0,
                }
            );
        } else {
            ctx.save();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = 1;
            ctx.lineWidth = frame.strokeWidth;
            ctx.strokeStyle = borderColor;
            this.roundedRectPath(ctx, x, y, size, size, frame.radius);
            ctx.stroke();
            ctx.restore();
        }
    }

    firedogAbilityUI(context) {
        const maxTextWidth = 50;
        const firedogBorderSize = 50;
        const spaceBetweenAbilities = 10;
        const hudStyle = this.getHudLayoutStyle();
        const yPosition = (hudStyle === 'legacy' ? 168 : 138) + this.topLeftYShift;

        const player = this.game.player;
        const frozen = !!player.isFrozen;
        const hitOrStunned =
            player.currentState === player.states[6] || // stunned
            player.currentState === player.states[7];   // hit

        const borderColor = 'black';

        const fireballImage = this.fireballUI;
        const divingImage = this.divingUI;
        const invisibleImage = this.invisibleUI;
        const dashImage = this.dashingUI;

        const nowMs = this.getUiTime();
        const sharedPhase = this.getSpinnerPhase(nowMs, 0.9);

        const lockContentFilter = 'grayscale(100%)';

        const hourglassYellowAnimOn = !!player.isHourglassActive;
        const yellowCooldownSpin = {
            segments: 140,
            speed: 0.75,
            headWidth: 0.22,
            minAlpha: 0.12,
            maxAlpha: 1.0,
            phaseOverride: sharedPhase,
        };

        // diving ability
        const divingX = 25;
        const divingLocked = frozen || hitOrStunned || player.divingTimer < player.divingCooldown;
        const divingActive = !frozen && player.currentState === player.states[5];

        if (divingActive) {
            this.drawAbilityIcon(context, divingImage, divingX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: divingLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'deepskyblue',
                animatedNowMs: nowMs,
                animatedSettings: {
                    segments: 140,
                    speed: 0.9,
                    headWidth: 0.18,
                    minAlpha: 0.10,
                    maxAlpha: 1.0,
                    phaseOverride: sharedPhase,
                }
            });
        } else {
            this.drawAbilityIcon(context, divingImage, divingX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: divingLocked ? lockContentFilter : null,
            });
        }

        if (player.divingTimer < player.divingCooldown) {
            const divingCooldown = Math.max(0, player.divingCooldown - player.divingTimer) / 1000;
            const countdownText = divingCooldown.toFixed(1);

            context.save();
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowBlur = 4;
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            const cx = divingX + firedogBorderSize / 2;
            const cy = yPosition + firedogBorderSize / 2;

            context.fillText(countdownText, cx, cy);
            context.restore();
        }

        // fireball ability
        const fireballX = divingX + firedogBorderSize + spaceBetweenAbilities;

        const fireballOnCooldown = player.fireballTimer < player.fireballCooldown;
        const fireballLocked =
            frozen ||
            hitOrStunned ||
            fireballOnCooldown ||
            player.isEnergyExhausted;

        const fireballShowYellowCooldownAnim = hourglassYellowAnimOn && fireballOnCooldown;

        if (player.isRedPotionActive) {
            if (fireballShowYellowCooldownAnim) {
                this.drawAbilityIcon(context, this.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, {
                    borderColor,
                    contentFilter: fireballLocked ? lockContentFilter : null,
                    animatedBorder: true,
                    animatedColor: 'yellow',
                    animatedNowMs: nowMs,
                    animatedSettings: yellowCooldownSpin,
                });
            } else {
                this.drawAbilityIcon(context, this.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, {
                    borderColor: 'red',
                    contentFilter: fireballLocked ? lockContentFilter : null,
                    animatedBorder: true,
                    animatedColor: 'red',
                    animatedNowMs: nowMs,
                    animatedSettings: {
                        segments: 140,
                        speed: 0.55,
                        headWidth: 0.22,
                        minAlpha: 0.12,
                        maxAlpha: 1.0,
                        phaseOverride: sharedPhase,
                    }
                });
            }

            context.save();
            const redPotionTimerX = fireballX + firedogBorderSize / 2;
            const redPotionTimerY = yPosition + 70;
            const redPotionCooldown = Math.max(0, player.redPotionTimer) / 1000;
            const redPotionCountdownText = redPotionCooldown.toFixed(1);
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.fillText(redPotionCountdownText, redPotionTimerX, redPotionTimerY);
            context.restore();
        } else {
            if (fireballShowYellowCooldownAnim) {
                this.drawAbilityIcon(context, fireballImage, fireballX, yPosition, firedogBorderSize, {
                    borderColor,
                    contentFilter: fireballLocked ? lockContentFilter : null,
                    animatedBorder: true,
                    animatedColor: 'yellow',
                    animatedNowMs: nowMs,
                    animatedSettings: yellowCooldownSpin,
                });
            } else {
                this.drawAbilityIcon(context, fireballImage, fireballX, yPosition, firedogBorderSize, {
                    borderColor,
                    contentFilter: fireballLocked ? lockContentFilter : null,
                });
            }
        }

        if (fireballOnCooldown) {
            const fireballCooldown = Math.max(0, player.fireballCooldown - player.fireballTimer) / 1000;
            const countdownText = fireballCooldown.toFixed(1);
            const textX = fireballX + (firedogBorderSize - maxTextWidth) / 2 + 10;
            const textY = yPosition + (50 - 16) / 2 + 16;
            context.fillStyle = 'white';
            context.font = 'bold 20px Arial';
            context.fillText(countdownText, textX, textY);
        }

        // invisible ability
        const invisibleX = fireballX + firedogBorderSize + spaceBetweenAbilities;

        const invisibleOnCooldown = !player.isInvisible && (player.invisibleTimer < player.invisibleCooldown);
        const invisibleLocked = invisibleOnCooldown;
        const invisibleActive = !!player.isInvisible && (player.invisibleActiveCooldownTimer > 0);

        const invisibleShowYellowCooldownAnim = hourglassYellowAnimOn && invisibleOnCooldown;

        if (invisibleActive) {
            this.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: invisibleLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'deepskyblue',
                animatedNowMs: nowMs,
                animatedSettings: {
                    segments: 140,
                    speed: 0.9,
                    headWidth: 0.18,
                    minAlpha: 0.10,
                    maxAlpha: 1.0,
                    phaseOverride: sharedPhase,
                }
            });
        } else if (invisibleShowYellowCooldownAnim) {
            this.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: invisibleLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'yellow',
                animatedNowMs: nowMs,
                animatedSettings: yellowCooldownSpin,
            });
        } else {
            this.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: invisibleLocked ? lockContentFilter : null,
            });
        }

        const invisibleTimerX = invisibleX + firedogBorderSize / 2;
        const invisibleTimerY = yPosition + 70;
        const invisibleCooldownSec = Math.max(0, player.invisibleActiveCooldownTimer) / 1000;
        const invisibleCountdownText = invisibleCooldownSec.toFixed(1);

        if (player.isInvisible) {
            context.save();
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.fillText(invisibleCountdownText, invisibleTimerX, invisibleTimerY);
            context.restore();
        }

        if (invisibleLocked) {
            const invisibleCooldownRemaining =
                Math.max(0, player.invisibleCooldown - player.invisibleTimer) / 1000;

            const countdownText = invisibleCooldownRemaining.toFixed(1);

            context.save();
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowBlur = 4;
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';

            const cx = invisibleX + firedogBorderSize / 2;
            const cy = yPosition + firedogBorderSize / 2;

            context.fillText(countdownText, cx, cy);
            context.restore();
        }

        // dash ability
        const dashX = invisibleX + firedogBorderSize + spaceBetweenAbilities;

        const dashShortOnCooldown =
            (player.dashBetweenTimer ?? (player.dashBetweenCooldown ?? 0)) <
            (player.dashBetweenCooldown ?? 0);

        const dashOnCooldown = player.dashTimer < player.dashCooldown;
        const dashNoCharges = (player.dashCharges ?? 0) <= 0;
        const dashNoEnergy = !!player.isEnergyExhausted;

        const dashLocked =
            frozen || hitOrStunned || dashNoEnergy || dashShortOnCooldown || dashOnCooldown || dashNoCharges;

        const dashWindowActive = player.dashAwaitingSecond && !dashOnCooldown;

        const dashShowYellowCooldownAnim = hourglassYellowAnimOn && dashOnCooldown;

        if (dashWindowActive) {
            this.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: dashLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'deepskyblue',
                animatedNowMs: nowMs,
                animatedSettings: {
                    segments: 140,
                    speed: 0.9,
                    headWidth: 0.18,
                    minAlpha: 0.10,
                    maxAlpha: 1.0,
                    phaseOverride: sharedPhase,
                }
            });
        } else if (dashShowYellowCooldownAnim) {
            this.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: dashLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'yellow',
                animatedNowMs: nowMs,
                animatedSettings: yellowCooldownSpin,
            });
        } else {
            this.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: dashLocked ? lockContentFilter : null,
            });
        }

        if (dashLocked) {
            let remainingSec = null;

            if (dashOnCooldown) {
                remainingSec = Math.max(0, player.dashCooldown - player.dashTimer) / 1000;
            } else if (dashShortOnCooldown) {
                remainingSec = Math.max(
                    0,
                    (player.dashBetweenCooldown ?? 0) - (player.dashBetweenTimer ?? 0)
                ) / 1000;
            }

            if (remainingSec != null) {
                const countdownText = remainingSec.toFixed(1);

                context.save();
                context.fillStyle = 'white';
                context.font = 'bold 20px Arial';
                context.shadowColor = 'black';
                context.shadowBlur = 4;
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                const cx = dashX + firedogBorderSize / 2;
                const cy = yPosition + firedogBorderSize / 2;

                context.fillText(countdownText, cx, cy);
                context.restore();
            }
        }

        if (player.dashAwaitingSecond && !dashOnCooldown) {
            const windowLeft = Math.max(0, (player.dashSecondWindowTimer ?? 0)) / 1000;
            const windowText = windowLeft.toFixed(1);

            context.save();
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.fillText(windowText, dashX + firedogBorderSize / 2, yPosition + 70);
            context.restore();
        }

        if (!dashOnCooldown) {
            const charges = player.dashCharges ?? 0;
            context.save();
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 16px Arial';
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText(String(charges), dashX + firedogBorderSize - 4, yPosition + 3);
            context.restore();
        }

        let hourglassBorderBottomY = null;

        if (player.isHourglassActive) {
            const groupLeft = fireballX;
            const groupRight = dashX + firedogBorderSize;

            const padX = 6;
            const padY = 6;

            const showsBelowTimer =
                !!player.isRedPotionActive ||
                !!player.isInvisible ||
                (player.dashAwaitingSecond && !dashOnCooldown);

            const extraDown = showsBelowTimer ? 25 : 0;

            const x = groupLeft - padX;
            const y = yPosition - padY;
            const w = (groupRight - groupLeft) + padX * 2;
            const h = firedogBorderSize + padY * 2 + extraDown;

            const r = (firedogBorderSize * 0.16) + padX;

            const t = (Math.sin(nowMs * 0.010) * 0.5 + 0.5); // 0..1
            const a = 0.15 + 0.55 * t;

            context.save();
            context.shadowColor = 'rgba(255, 215, 0, 1)';
            context.shadowBlur = 10 + 18 * t;

            context.lineWidth = 2;
            context.strokeStyle = 'rgba(255, 215, 0, 1)';
            context.globalAlpha = a;

            this.roundedRectPath(context, x, y, w, h, r);
            context.stroke();
            context.restore();

            hourglassBorderBottomY = y + h;
        }

        if (player.isHourglassActive && hourglassBorderBottomY != null) {
            const msLeft = player.hourglassTimer ?? 0;
            const secsLeft = Math.max(0, msLeft) / 1000;
            const text = `${secsLeft.toFixed(1)}`;

            const groupLeft = fireballX;
            const groupRight = dashX + firedogBorderSize;
            const cx = (groupLeft + groupRight) / 2;

            const cy = hourglassBorderBottomY + 16;

            context.save();
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.shadowBlur = 4;
            context.fillText(text, cx, cy);
            context.restore();
        }

        let abilityBottomY = yPosition + firedogBorderSize;

        if (player.isRedPotionActive) {
            abilityBottomY = Math.max(abilityBottomY, yPosition + 82);
        }

        if (player.isInvisible) {
            abilityBottomY = Math.max(abilityBottomY, yPosition + 82);
        }

        if (player.dashAwaitingSecond && !dashOnCooldown) {
            abilityBottomY = Math.max(abilityBottomY, yPosition + 82);
        }

        if (player.isHourglassActive && hourglassBorderBottomY != null) {
            abilityBottomY = Math.max(abilityBottomY, hourglassBorderBottomY + 30);
        }

        this._abilityUiLayout = {
            x: 25,
            y: yPosition,
            size: 50,
            gap: 10,
            bottomY: abilityBottomY,
        };
    }

    getNegativeStatusSnapshot() {
        const player = this.game.player;

        return [
            {
                key: 'freeze',
                active: !!player.isFrozen && (player.frozenTimer ?? 0) > 0,
                remaining: Math.max(0, player.frozenTimer ?? 0),
                total: Math.max(1, player.frozenDuration ?? player.frozenTimer ?? 1),
                color: 'cyan',
            },
            {
                key: 'poison',
                active: !!player.isPoisonedActive && (player.poisonTimer ?? 0) > 0,
                remaining: Math.max(0, player.poisonTimer ?? 0),
                total: Math.max(1, player.poisonTimer ?? 1),
                color: 'green',
            },
            {
                key: 'slow',
                active: !!player.isSlowed && (player.slowedTimer ?? 0) > 0,
                remaining: Math.max(0, player.slowedTimer ?? 0),
                total: Math.max(1, player.slowedTimer ?? 1),
                color: 'darkblue',
            },
            {
                key: 'confuse',
                active: !!player.isConfused && (player.confuseTimer ?? 0) > 0,
                remaining: Math.max(0, player.confuseTimer ?? 0),
                total: Math.max(1, player.confuseDuration ?? player.confuseTimer ?? 1),
                color: 'yellow',
            },
            {
                key: 'blackHole',
                active: !!player.isBlackHoleActive && (player.blackHoleTimer ?? 0) > 0,
                remaining: Math.max(0, player.blackHoleTimer ?? 0),
                total: Math.max(1, player.blackHoleDuration ?? 1),
                color: 'darkgrey',
            },
        ];
    }

    syncNegativeStatusIndicators() {
        const snapshot = this.getNegativeStatusSnapshot();
        const activeOrder = this.negativeStatusUi.activeOrder;

        for (const status of snapshot) {
            if (!status.active) {
                activeOrder.delete(status.key);
                continue;
            }

            const existing = activeOrder.get(status.key);

            if (!existing) {
                activeOrder.set(status.key, {
                    key: status.key,
                    color: status.color,
                    remaining: status.remaining,
                    total: Math.max(1, status.total, status.remaining),
                    appliedOrder: this.negativeStatusUi.nextOrder++,
                });
                continue;
            }

            existing.color = status.color;
            existing.remaining = status.remaining;

            if (status.remaining > existing.total || status.total > existing.total) {
                existing.total = Math.max(1, status.remaining, status.total);
            }
        }

        return [...activeOrder.values()].sort((a, b) => a.appliedOrder - b.appliedOrder);
    }

    drawNegativeStatusEffect(ctx, x, y, size, effect) {
        const radius = this.negativeStatusUi.radius;
        const remainingRatio = effect.total > 0
            ? this.clamp(effect.remaining / effect.total, 0, 1)
            : 0;

        const themes = {
            freeze: { tint: 'rgba(0, 210, 255, 0.15)', arc: '#00d4ff', glow: 'rgba(0, 210, 255, 0.80)', label: 'F', border: 'rgba(0, 195, 255, 0.55)' },
            poison: { tint: 'rgba(57, 255, 20, 0.14)', arc: '#39ff14', glow: 'rgba(57, 255, 20, 0.70)', label: 'P', border: 'rgba(57, 255, 20, 0.48)' },
            slow: { tint: 'rgba(30, 80, 200, 0.16)', arc: '#3a8fff', glow: 'rgba(40, 120, 255, 0.70)', label: 'S', border: 'rgba(50, 130, 255, 0.52)' },
            confuse: { tint: 'rgba(255, 200, 0, 0.15)', arc: '#ffd700', glow: 'rgba(255, 200, 0, 0.72)', label: 'C', border: 'rgba(255, 200, 0, 0.52)' },
            blackHole: { tint: 'rgba(150, 60, 255, 0.14)', arc: '#c070ff', glow: 'rgba(135, 55, 225, 0.72)', label: 'B', border: 'rgba(155, 72, 225, 0.52)' },
        };

        const theme = themes[effect.key] || {
            tint: 'rgba(128, 128, 128, 0.15)',
            arc: effect.color,
            glow: effect.color,
            label: '!',
            border: 'rgba(180, 180, 180, 0.45)',
        };

        const cx = x + size / 2;
        const cy = y + size / 2;

        ctx.save();

        // dark base
        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.fillStyle = 'rgba(10, 5, 16, 0.92)';
        ctx.fill();

        // colored tint
        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.fillStyle = theme.tint;
        ctx.fill();

        // arc ring clipped to rounded rect
        ctx.save();
        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.clip();

        const arcR = size / 2 - 3;
        const startAngle = -Math.PI / 2;

        // dim track
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.stroke();

        // remaining-time arc
        if (remainingRatio > 0.02) {
            const arcStart = startAngle + (1 - remainingRatio) * Math.PI * 2;
            const arcEnd = startAngle + Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, arcR, arcStart, arcEnd);
            ctx.strokeStyle = theme.arc;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.shadowColor = theme.glow;
            ctx.shadowBlur = 7;
            ctx.stroke();
        }

        ctx.restore();

        // gloss shine
        ctx.save();
        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.clip();
        const gloss = ctx.createLinearGradient(0, y, 0, y + size * 0.5);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
        gloss.addColorStop(1, 'rgba(255, 255, 255, 0.00)');
        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, size, size);
        ctx.restore();

        // center label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.floor(size * 0.38)}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(theme.label, cx, cy);

        // glowing border
        ctx.save();
        this.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    drawNegativeStatusUI(ctx) {
        const activeEffects = this.syncNegativeStatusIndicators();
        if (!activeEffects.length) return;

        const layout = this._abilityUiLayout || {};
        const startX = layout.x ?? 25;
        const startY = (layout.bottomY ?? (168 + this.topLeftYShift + 50)) + this.negativeStatusUi.topSpacing;

        const size = this.negativeStatusUi.size;
        const gap = this.negativeStatusUi.gap;

        for (let i = 0; i < activeEffects.length; i++) {
            const effect = activeEffects[i];
            const x = startX + i * (size + gap);
            const y = startY;

            this.drawNegativeStatusEffect(ctx, x, y, size, effect);
        }
    }

    // for how to play menu
    drawTopLeftOnly(context, options = {}) {
        const previewCoins = options.previewCoins ?? 17;
        const previewLives = options.previewLives ?? 5;
        const previewTime = options.previewTime ?? 157000;
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
        context.font = this.fontSize + 'px ' + this.fontFamily;
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

    drawTutorialProgressBar(context, percentage = 75, colour = '#2ecc71') {
        const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
        const barX = (this.game.width / 2) - (this.barWidth / 2);
        const barY = 10;
        const barHeight = 10;

        const filledWidth = (pct / 100) * this.barWidth;
        const barOrFilledWidth = this.barWidth;

        context.save();

        context.font = '18px ' + this.fontFamily;
        context.fillStyle = this.game.fontColor;
        context.textAlign = 'left';

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;

        context.fillText(Math.floor(pct) + '%', barX + this.barWidth + 5, barY + barHeight);

        context.shadowColor = 'rgba(0, 0, 0, 0)';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

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

        context.restore();
    }

    _measureTipText(context, text) {
        const coinIconWidth = 1 + 6 * 2 + 3; // leadingGap + diameter + trailingGap
        const stripped = text.replace(/[\uE001\uE002]/g, '');
        const iconCount = text.length - stripped.length;
        if (iconCount === 0) return context.measureText(text).width;
        return context.measureText(stripped).width + iconCount * coinIconWidth;
    }

    _buildTipColorSpans(text) {
        const spans = [];
        const keys = Object.keys(TIP_PHRASE_COLORS).sort((a, b) => b.length - a.length);

        for (const key of keys) {
            const color = TIP_PHRASE_COLORS[key];
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(`\\b${escaped}(?:['']s)?\\b`, 'gi');
            let m;
            while ((m = rx.exec(text)) !== null) {
                const start = m.index;
                const end = m.index + m[0].length;
                if (!spans.some(([s, e]) => start < e && end > s)) {
                    spans.push([start, end, color]);
                }
            }
        }
        return spans;
    }

    _renderColoredTipLine(context, lineText, centerX, textY, spans) {
        if (!spans) spans = this._buildTipColorSpans(lineText);

        const COIN = '\uE001';
        const CREDIT_COIN = '\uE002';
        const hasIcon = lineText.includes(COIN) || lineText.includes(CREDIT_COIN);

        if (!hasIcon && spans.length === 0) {
            context.fillStyle = 'white';
            context.fillText(lineText, centerX, textY);
            return;
        }

        const coinR = 6;
        const coinLeadingGap = 1;
        const coinTrailingGap = 3;
        const coinIconWidth = coinLeadingGap + coinR * 2 + coinTrailingGap;

        const segments = [];
        let i = 0;
        while (i < lineText.length) {
            const ch = lineText[i];
            if (ch === COIN || ch === CREDIT_COIN) {
                segments.push({ type: 'coin', palette: ch === CREDIT_COIN ? 'silver' : 'gold' });
                i++;
                continue;
            }
            let color = null;
            for (const [s, e, c] of spans) {
                if (i >= s && i < e) { color = c; break; }
            }
            let j = i + 1;
            while (j < lineText.length && lineText[j] !== COIN && lineText[j] !== CREDIT_COIN) {
                let nextColor = null;
                for (const [s, e, c] of spans) {
                    if (j >= s && j < e) { nextColor = c; break; }
                }
                if (nextColor !== color) break;
                j++;
            }
            segments.push({ type: 'text', text: lineText.slice(i, j), color });
            i = j;
        }

        let totalWidth = 0;
        for (const seg of segments) {
            totalWidth += seg.type === 'coin' ? coinIconWidth : context.measureText(seg.text).width;
        }

        let x = centerX - totalWidth / 2;
        const savedAlign = context.textAlign;
        context.textAlign = 'left';

        for (const seg of segments) {
            if (seg.type === 'coin') {
                drawCoinIcon(context, x + coinLeadingGap + coinR, textY + 6, coinR, { palette: seg.palette });
                x += coinIconWidth;
            } else {
                context.fillStyle = seg.color ?? 'white';
                context.fillText(seg.text, x, textY);
                x += context.measureText(seg.text).width;
            }
        }

        context.textAlign = savedAlign;
    }

    _getTipContext() {
        const boss = this.game.boss;
        if (boss && boss.inFight && boss.id) return boss.id;
        return this.game.currentMap;
    }

    _getTips() {
        const key = this._getTipContext();
        return (key && MAP_TIPS[key]) || [];
    }

    dismissTip() {
        const ts = this.tipState;
        if (ts.phase === 'fadeIn' || ts.phase === 'hold') {
            ts.phase = 'fadeOut';
            ts.timer = 0;
        }
    }

    resetTip() {
        const ts = this.tipState;
        ts.index = -1;
        ts.opacity = 0;
        ts.phase = null;
        ts.timer = 0;
        ts._lastTime = null;
        ts._lastTipContext = null;
    }

    cycleTip() {
        const tips = this._getTips();
        if (!tips.length) return;

        const newContext = this._getTipContext();

        // if context changed (e.g. boss fight started), reset to tip 0 of new context
        if (newContext !== this.tipState._lastTipContext) {
            this.tipState._lastTipContext = newContext;
            this.tipState.index = 0;
        } else if (this.tipState.phase === 'fadeOut') {
            // during fadeOut, re-show the same tip (don't advance)
        } else if (this.tipState.index < 0 || this.tipState.phase === null) {
            this.tipState.index = 0;
        } else {
            this.tipState.index = (this.tipState.index + 1) % tips.length;
        }

        this.tipState.opacity = 0;
        this.tipState.phase = 'fadeIn';
        this.tipState.timer = 0;
        this.tipState._lastTime = null;
    }

    updateTip() {
        const ts = this.tipState;
        if (ts.phase === null) return;

        const now = Date.now();
        if (ts._lastTime === null) {
            ts._lastTime = now;
            return;
        }

        if (this.game.menu.pause.isPaused) {
            ts._lastTime = now;
            return;
        }

        const dt = now - ts._lastTime;
        ts._lastTime = now;
        ts.timer += dt;

        if (ts.phase === 'fadeIn') {
            ts.opacity = Math.min(1, ts.timer / ts.fadeInMs);
            if (ts.timer >= ts.fadeInMs) {
                ts.opacity = 1;
                ts.phase = 'hold';
                ts.timer = 0;
            }
        } else if (ts.phase === 'hold') {
            if (ts.timer >= ts.holdMs) {
                ts.phase = 'fadeOut';
                ts.timer = 0;
            }
        } else if (ts.phase === 'fadeOut') {
            ts.opacity = Math.max(0, 1 - ts.timer / ts.fadeOutMs);
            if (ts.timer >= ts.fadeOutMs) {
                ts.opacity = 0;
                ts.phase = null;
            }
        }
    }

    drawTip(context) {
        const ts = this.tipState;
        if (ts.phase === null || ts.opacity <= 0) return;

        const tips = this._getTips();
        if (!tips.length || ts.index < 0 || ts.index >= tips.length) return;

        const text = tips[ts.index];
        const tipCount = tips.length;

        const padX = 18;
        const padY = 10;
        const barBottom = 22;
        const boxY = barBottom + 20;
        const maxBoxW = this.barWidth + 400;
        const fontSize = 16;
        const lineHeight = 22;

        context.save();
        context.globalAlpha = ts.opacity;
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        const counterText = tipCount > 1 ? `${ts.index + 1}/${tipCount}` : null;
        const counterReserve = counterText ? 48 : 0;

        const maxLineW = maxBoxW - padX * 2 - counterReserve * 2;
        const lines = [];
        for (const paragraph of text.split('\n')) {
            const words = paragraph.split(' ');
            let current = '';
            for (const word of words) {
                const test = current ? current + ' ' + word : word;
                if (this._measureTipText(context, test) > maxLineW && current) {
                    lines.push(current);
                    current = word;
                } else {
                    current = test;
                }
            }
            if (current) lines.push(current);
        }

        const widestLine = Math.max(...lines.map(l => this._measureTipText(context, l)));
        const boxW = Math.min(maxBoxW, widestLine + padX * 2 + counterReserve * 2 + 20);
        const boxX = (this.game.width - boxW) / 2;

        const boxH = padY * 2 + (lines.length - 1) * lineHeight + fontSize;

        // background rectangle
        context.fillStyle = 'rgba(0, 0, 0, 0.65)';
        context.beginPath();
        context.roundRect(boxX, boxY, boxW, boxH, 5);
        context.fill();

        // tip text
        const centerX = boxX + boxW / 2;
        context.shadowColor = 'black';
        context.shadowBlur = 6;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;

        const joinedText = lines.join(' ');
        const allSpans = this._buildTipColorSpans(joinedText);

        let textY = boxY + padY;
        let lineStart = 0;
        for (const line of lines) {
            const lineEnd = lineStart + line.length;
            const lineSpans = allSpans
                .filter(([s, e]) => s < lineEnd && e > lineStart)
                .map(([s, e, c]) => [Math.max(s, lineStart) - lineStart, Math.min(e, lineEnd) - lineStart, c]);
            this._renderColoredTipLine(context, line, centerX, textY, lineSpans);
            lineStart += line.length + 1;
            textY += lineHeight;
        }

        if (counterText) {
            context.font = `bold 14px Arial`;
            context.fillStyle = 'rgba(220, 220, 220, 0.9)';
            context.shadowBlur = 0;
            context.textAlign = 'right';
            context.textBaseline = 'bottom';
            context.fillText(counterText, boxX + boxW - padX, boxY + boxH - padY);
        }

        context.restore();
    }
}
