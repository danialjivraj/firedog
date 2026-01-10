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
        this.secondsLeftActivated = false;

        this.uiTime = 0;
        this.uiLastRealTime = null;

        this.prevLives = this.game.lives;

        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = 0;
        this.lifeBlinkDuration = 400;

        this.lifeGainDuration = 400;
        this.lifeGainEndTimes = new Map();

        this.energyBar = {
            x: 20,
            y: 92 + this.topLeftYShift,
            w: 240,
            h: 32,
            radius: 10,

            shineHeightRatio: 0.45,
            pulseLowThreshold: 20,
            pulseSpeed: 0.012,
        };
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

        this.prevLives = this.game.lives;

        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = now;
        if (this.lifeGainEndTimes) this.lifeGainEndTimes.clear();
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
        context.fillText('Coins: ' + this.game.coins, 20, 38 + this.topLeftYShift);

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
    }

    drawLives(context) {
        const now = this.getUiTime();

        const prev = this.prevLives;
        const curr = this.game.lives;

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

        let gainMaxIndex = -1;
        for (const idx of this.lifeGainEndTimes.keys()) {
            if (idx > gainMaxIndex) gainMaxIndex = idx;
        }

        const heartsToDraw = Math.min(
            this.game.maxLives,
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
        if (showLowWarning && !paused) {
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
        if (showLowWarning && !paused) {
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

        ctx.save();
        ctx.lineWidth = 2;

        const strokeColor =
            showExhaustedMarker
                ? 'rgba(255, 40, 40, 0.95)'
                : (ratio01 <= (this.energyBar.pulseLowThreshold / 100) && !statusActive)
                    ? 'rgba(255, 220, 70, 0.95)'
                    : (status === 'blue')
                        ? 'rgba(80, 180, 255, 0.95)'
                        : (status === 'poison')
                            ? 'rgba(19, 216, 19, 0.95)'
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

        const energy = this.clamp(player.energy ?? 0, 0, maxEnergy);
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
            context.font = 'bold 13px Arial';
            context.fillText(valueText, barX + w / 2, barY + h / 2);
        }

        context.restore();
    }

    timer(context) {
        context.font = this.fontSize * 1 + 'px ' + this.fontFamily;
        let formattedTime;
        let time;

        if (this.game.player.isUnderwater) {
            time = Math.max(this.game.maxTime - this.game.time, 0);

            let dynamicColor = 'red';
            if (time <= this.secondsLeft && time % 2000 < 1000) {
                dynamicColor = 'white';
            }
            context.save();

            if (dynamicColor === 'red') {
                context.fillStyle = 'red';
                context.shadowColor = 'black';
            } else {
                context.fillStyle = 'white';
                context.shadowColor = 'black';
            }
            if (time <= 0) {
                context.fillStyle = 'red';
                context.shadowColor = 'black';
            }
        } else {
            time = this.game.time;
        }

        if (this.game.player.isUnderwater && time > this.secondsLeft) {
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

        context.fillText('Time: ' + formattedTime, 20, 78 + this.topLeftYShift);

        if (this.game.player.isUnderwater && time <= this.secondsLeft && time > this.secondsLeft - 60000) {
            this.secondsLeftActivated = true;
            this.game.audioHandler.mapSoundtrack.playSound('timeTickingSound', true);
        } else {
            this.game.audioHandler.mapSoundtrack.stopSound('timeTickingSound');
            this.secondsLeftActivated = false;
        }
        if (this.game.cabin.isFullyVisible || this.game.gameOver) {
            this.game.audioHandler.mapSoundtrack.stopSound('timeTickingSound');
        }
        if (this.game.menu.pause.isPaused) {
            this.game.audioHandler.mapSoundtrack.pauseSound('timeTickingSound');
        } else {
            this.game.audioHandler.mapSoundtrack.resumeSound('timeTickingSound');
        }
        if (this.game.player.isUnderwater) {
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
        const yPosition = 168 + this.topLeftYShift;

        const player = this.game.player;
        const frozen = !!player.isFrozen;
        const hitOrStunned =
            player.currentState === player.states[6] || // stunned
            player.currentState === player.states[7];   // hit

        const borderColor = player.isDarkWhiteBorder ? 'white' : 'black';

        const fireballImage = this.fireballUI;
        const divingImage = this.divingUI;
        const invisibleImage = this.invisibleUI;
        const dashImage = this.dashingUI;

        const nowMs = this.getUiTime();
        const sharedPhase = this.getSpinnerPhase(nowMs, 0.9);

        const lockContentFilter = 'grayscale(100%)';

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
        const fireballLocked =
            frozen ||
            hitOrStunned ||
            player.fireballTimer < player.fireballCooldown ||
            player.isEnergyExhausted;

        if (player.isRedPotionActive) {
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
            this.drawAbilityIcon(context, fireballImage, fireballX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: fireballLocked ? lockContentFilter : null,
            });
        }

        if (player.fireballTimer < player.fireballCooldown) {
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
        const invisibleLocked = !player.isInvisible && (player.invisibleTimer < player.invisibleCooldown);
        const invisibleActive = !!player.isInvisible && (player.invisibleActiveCooldownTimer > 0);

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
            context.fillText(String(charges), dashX + firedogBorderSize - 4, yPosition + 16);
            context.restore();
        }
    }
}
