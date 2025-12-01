import { Elyvorg } from "../entities/enemies/elyvorg.js";

export class UI {
    constructor(game) {
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Love Ya Like A Sister';
        this.barWidth = 500;

        this.livesImage = document.getElementById('firedogHead');
        this.fireballUI = document.getElementById('fireballUI');
        this.fireballUIWhiteBorder = document.getElementById('fireballUIWhiteBorder');
        this.fireballRedPotionUI = document.getElementById('fireballRedPotionUI');
        this.divingUI = document.getElementById('divingUI');
        this.divingUIWhiteBorder = document.getElementById('divingUIWhiteBorder');
        this.invisibleUI = document.getElementById('invisibleUI');
        this.invisibleUIWhiteBorder = document.getElementById('invisibleUIWhiteBorder');
        this.slashUI = document.getElementById('slashUI');
        this.slashWarningUI = document.getElementById('slashWarningUI');
        this.electricUI = document.getElementById('electricUI');
        this.electricWarningUI = document.getElementById('electricWarningUI');

        this.secondsLeft = 60000;
        this.secondsLeftActivated = false;

        this.uiTime = 0;
        this.uiLastRealTime = null;

        this.prevLives = this.game.lives;
        this.lifeBlinkIndex = -1;
        this.lifeBlinkEndTime = 0;
        this.lifeBlinkDuration = 400;
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
        context.fillText('Coins: ' + this.game.coins, 20, 50);

        // bars
        this.distanceBar(context);
        this.bossHealthBar(context);

        // time
        this.timer(context);

        // energy
        this.energy(context);

        // lives
        const now = this.getUiTime();

        if (this.game.lives < this.prevLives) {
            this.lifeBlinkIndex = Math.max(0, this.prevLives - 1);
            this.lifeBlinkEndTime = now + this.lifeBlinkDuration;
        }
        this.prevLives = this.game.lives;

        const heartsToDraw = Math.min(
            this.game.maxLives,
            Math.max(this.game.lives, this.lifeBlinkIndex + 1)
        );

        for (let i = 0; i < heartsToDraw; i++) {
            const baseX = 25 * i + 20;
            const baseY = 145;
            const isBlinkingLostHeart =
                i === this.lifeBlinkIndex &&
                now < this.lifeBlinkEndTime &&
                i >= this.game.lives;

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
            } else if (i < this.game.lives) {
                context.drawImage(this.livesImage, baseX, baseY, 25, 25);
            }

            context.restore();
        }

        if (now >= this.lifeBlinkEndTime) {
            this.lifeBlinkIndex = -1;
        }

        context.restore();

        // abilities
        this.firedogAbilityUI(context);
        this.elyvorgAbilityUI(context);
    }

    progressBar(context, percentage, filledWidth, barOrFilledWidth, colour) {
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

        this.filledWidth = filledWidth;

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
        context.lineTo(barX + this.filledWidth - 5, barY);
        context.arcTo(barX + this.filledWidth, barY, barX + this.filledWidth, barY + 5, 5);
        context.lineTo(barX + this.filledWidth, barY + barHeight - 5);
        context.arcTo(barX + this.filledWidth, barY + barHeight, barX + this.filledWidth - 5, barY + barHeight, 5);
        context.lineTo(barX + 5, barY + barHeight);
        context.arcTo(barX, barY + barHeight, barX, barY + barHeight - 5, 5);
        context.lineTo(barX, barY + 5);
        context.arcTo(barX, barY, barX + 10, barY, 5);
        context.closePath();
        context.fill();
        context.restore();
    }

    distanceBar(context) {
        if (this.game.bossInFight) return;
        if (!this.game.background) return;
        if (this.game.boss && this.game.boss.progressComplete) return;

        const totalDist = this.game.background.totalDistanceTraveled || 0;
        const fallbackMaxDist = Math.max(1, this.game.maxDistance || 1);

        const gate = this.game.bossManager
            ? this.game.bossManager.getGateForCurrentMap()
            : null;

        let distanceTarget = fallbackMaxDist;
        let minCoins = 0;

        if (gate) {
            const gateMinDistance = gate.minDistance ?? 0;
            if (gateMinDistance > 0) {
                distanceTarget = gateMinDistance;
            }
            minCoins = gate.minCoins ?? 0;
        }

        // distance
        const clampedDistanceTarget = Math.max(1, distanceTarget);
        const traveled = Math.min(totalDist, clampedDistanceTarget);
        const distanceProgress = traveled / clampedDistanceTarget;

        const pct = Math.min(Math.max(distanceProgress * 100, 0), 100);
        const filledDistance = distanceProgress * this.barWidth;

        this.progressBar(
            context,
            pct,
            filledDistance,
            this.barWidth,
            '#2ecc71'
        );

        // coins
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
                context.quadraticCurveTo(
                    rightX,
                    stripeY,
                    rightX,
                    stripeY + stripeHeight / 2
                );
                context.quadraticCurveTo(
                    rightX,
                    stripeY + stripeHeight,
                    rightX - radius,
                    stripeY + stripeHeight
                );
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

        const rawMaxLives = boss.maxLives ?? boss.lives ?? 1;
        const maxLives = Math.max(1, rawMaxLives);

        const rawLives = boss.lives ?? maxLives;
        const currentLives = Math.max(0, Math.min(rawLives, maxLives));

        const ratio = currentLives / maxLives;
        const pct = ratio * 100;

        const isAlive = currentLives > 0;

        const displayPct = isAlive ? Math.max(pct, 1) : 0;

        const filledWidth = isAlive
            ? Math.max(ratio * this.barWidth, 0.01 * this.barWidth)
            : 0;

        this.progressBar(
            context,
            displayPct,
            filledWidth,
            this.barWidth,
            'red'
        );
    }

    energy(context) {
        let textColor = 'black';
        let shadowColor = 'white';

        if (this.game.player.isBluePotionActive === true) {
            textColor = 'blue';
            shadowColor = 'black';
        } else if (this.game.player.isPoisonedActive === true) {
            textColor = 'darkgreen';
            shadowColor = 'black';
        } else if (this.game.player.energyReachedZero === false && this.game.player.energy < 20.00) {
            textColor = 'black';
            shadowColor = 'gold';
        } else if (this.game.player.energyReachedZero === true) {
            textColor = 'red';
            shadowColor = 'black';
        }

        context.save();
        const shakeAmount = this.game.player.isBluePotionActive ? 3 : 0;
        const shakeFrequency = 0.1;
        const shakeDirectionX = Math.random() > 0.5 ? 1 : -1;
        const shakeDirectionY = Math.random() > 0.5 ? 1 : -1;

        let offsetX = 0;
        let offsetY = 0;

        if (!this.game.menu.pause.isPaused) {
            offsetX = shakeAmount * shakeDirectionX * Math.sin(Date.now() * shakeFrequency);
            offsetY = shakeAmount * shakeDirectionY * Math.cos(Date.now() * shakeFrequency);
        }

        context.font = this.fontSize * 1.2 + 'px ' + this.fontFamily;
        context.fillStyle = textColor;
        context.shadowColor = shadowColor;

        context.fillText('Energy: ' + this.game.player.energy.toFixed(1), 20 + offsetX, 130 + offsetY);

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

        context.fillText('Time: ' + formattedTime, 20, 90);

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

    firedogAbilityUI(context) {
        const maxTextWidth = 50;
        const firedogBorderSize = 50;
        const spaceBetweenAbilities = 10;
        const yPosition = 180;

        const player = this.game.player;
        const frozen = !!player.isFrozen;

        const fireballImage = player.isDarkWhiteBorder ? this.fireballUIWhiteBorder : this.fireballUI;
        const divingImage = player.isDarkWhiteBorder ? this.divingUIWhiteBorder : this.divingUI;
        const invisibleImage = player.isDarkWhiteBorder ? this.invisibleUIWhiteBorder : this.invisibleUI;

        // diving ability
        const divingX = 25;
        const divingLocked = frozen || player.divingTimer < player.divingCooldown;

        if (divingLocked) {
            context.save();
            context.filter = 'grayscale(100%)';
        }
        context.drawImage(divingImage, divingX, yPosition, firedogBorderSize, firedogBorderSize);

        if (divingLocked) {
            context.restore();

            if (!frozen && player.divingTimer < player.divingCooldown) {
                const divingCooldown = Math.max(0, player.divingCooldown - player.divingTimer) / 1000;
                const countdownText = divingCooldown.toFixed(1);
                const textX = divingX + (firedogBorderSize - maxTextWidth) / 2 + 10;
                const textY = yPosition + (50 - 16) / 2 + 16;
                context.fillStyle = 'white';
                context.font = 'bold 20px Arial';
                context.fillText(countdownText, textX, textY);
            }
        }

        // fireball ability
        const fireballX = divingX + firedogBorderSize + spaceBetweenAbilities;
        const fireballLocked =
            frozen ||
            player.fireballTimer < player.fireballCooldown ||
            player.energyReachedZero;

        if (fireballLocked) {
            context.save();
            context.filter = 'grayscale(100%)';
        }

        if (player.isRedPotionActive) {
            context.drawImage(this.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, firedogBorderSize);
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
            context.drawImage(fireballImage, fireballX, yPosition, firedogBorderSize, firedogBorderSize);
        }

        if (fireballLocked) {
            context.restore();

            if (!frozen && player.fireballTimer < player.fireballCooldown) {
                const fireballCooldown =
                    Math.max(0, player.fireballCooldown - player.fireballTimer) / 1000;
                const countdownText = fireballCooldown.toFixed(1);
                const textX = fireballX + (firedogBorderSize - maxTextWidth) / 2 + 10;
                const textY = yPosition + (50 - 16) / 2 + 16;
                context.fillStyle = 'white';
                context.font = 'bold 20px Arial';
                context.fillText(countdownText, textX, textY);
            }
        }

        // invisible ability
        const invisibleX = fireballX + firedogBorderSize + spaceBetweenAbilities;
        if (player.invisibleTimer < player.invisibleCooldown) {
            context.save();
            context.filter = 'grayscale(100%)';
        }
        context.drawImage(invisibleImage, invisibleX, yPosition, firedogBorderSize, firedogBorderSize);
        const invisibleTimerX = invisibleX + firedogBorderSize / 2;
        const invisibleTimerY = yPosition + 70;
        const invisibleCooldown = Math.max(0, player.invisibleActiveCooldownTimer) / 1000;
        const invisibleCountdownText = invisibleCooldown.toFixed(1);
        if (player.isInvisible) {
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.fillText(invisibleCountdownText, invisibleTimerX, invisibleTimerY);
        }
        if (player.invisibleTimer < player.invisibleCooldown) {
            context.restore();
            const invisibleCooldownRemaining =
                Math.max(0, player.invisibleCooldown - player.invisibleTimer) / 1000;
            const countdownText = invisibleCooldownRemaining.toFixed(1);
            let textXActive;
            if (player.invisibleTimer <= 30050) {
                textXActive = 150.537109375;
            } else {
                textXActive = 156.0986328125;
            }
            const textY = yPosition + (firedogBorderSize - 16) / 2 + 16;
            context.fillStyle = 'white';
            context.font = 'bold 20px Arial';
            context.fillText(countdownText, textXActive, textY);
        }
    }

    elyvorgAbilityUI(context) {
        if (!this.game.bossInFight) return;

        let elyvorg = null;
        if (this.game.boss && this.game.boss.current instanceof Elyvorg) {
            elyvorg = this.game.boss.current;
        } else {
            elyvorg = this.game.enemies.find(e => e instanceof Elyvorg) || null;
        }

        if (!elyvorg) return;

        // slash
        const slashAttackOnce = elyvorg.slashAttackOnce;
        const slashAttackStateCounter = elyvorg.slashAttackStateCounter;
        const slashAttackStateCounterLimit = elyvorg.slashAttackStateCounterLimit;
        // electric
        const electricWheelTimer = elyvorg.electricWheelTimer;
        const isElectricWheelActive = elyvorg.isElectricWheelActive;

        const elyvorgBorderSize = 65;
        const spaceBetweenAbilities = 10;
        const yPosition = 20;

        // slash
        const slashX = this.game.width - elyvorgBorderSize - spaceBetweenAbilities;
        if (slashAttackOnce) {
            context.drawImage(this.slashUI, slashX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
        } else {
            if (slashAttackStateCounter >= slashAttackStateCounterLimit - 2) {
                context.save();
                context.drawImage(this.slashWarningUI, slashX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            } else {
                context.save();
                context.filter = 'grayscale(100%)';
                context.drawImage(this.slashUI, slashX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            }
        }

        // electric
        const electricX = slashX - elyvorgBorderSize - spaceBetweenAbilities;
        if (isElectricWheelActive) {
            context.drawImage(this.electricUI, electricX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
        } else {
            if (electricWheelTimer > 0) {
                context.save();
                context.drawImage(this.electricWarningUI, electricX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            } else {
                context.save();
                context.filter = 'grayscale(100%)';
                context.drawImage(this.electricUI, electricX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            }
        }
    }
}
