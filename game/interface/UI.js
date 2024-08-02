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
        this.poisonUI = document.getElementById('poisonUI');
        this.gravityUI = document.getElementById('gravityUI');
        this.slashUI = document.getElementById('slashUI');
        this.slashWarningUI = document.getElementById('slashWarningUI');
        this.electricUI = document.getElementById('electricUI');
        this.electricWarningUI = document.getElementById('electricWarningUI');

        this.secondsLeft = 60000;
        this.secondsLeftActivated = false;
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
        //coins score
        context.fillText('Coins: ' + this.game.coins, 20, 50);
        //bars
        this.distanceBar(context);
        this.elyvorgHealthBar(context);
        //time
        this.timer(context);
        //energy
        this.energy(context);
        //lives
        for (let i = 0; i < Math.min(this.game.lives, this.game.maxLives); i++) {
            context.drawImage(this.livesImage, 25 * i + 20, 145, 25, 25);
        }
        context.restore();
        //abilities
        this.firedogAbilityUI(context)
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
        if (!this.game.mapSelected[6]) {
            this.progressBar(
                context,
                Math.min((this.game.background.totalDistanceTraveled / this.game.maxDistance) * 100, 100),
                (this.game.background.totalDistanceTraveled / this.game.maxDistance) * this.barWidth,
                this.barWidth,
                '#2ecc71',
            );
        }
    }

    elyvorgHealthBar(context) {
        if (this.game.elyvorgInFight) {
            const enemy = this.game.enemies.find(e => e instanceof Elyvorg);
            if (!enemy) return;

            let elyvorgLives = enemy.lives - enemy.livesDefeatedAt;

            this.progressBar(
                context,
                enemy.lives > 0 ? Math.max((elyvorgLives / enemy.maxLives) * 100, 1) : 0,
                elyvorgLives > 0 ? Math.max((elyvorgLives / enemy.maxLives) * this.barWidth, 0.01 * this.barWidth) : 0,
                elyvorgLives > 0 ? Math.max((elyvorgLives / enemy.maxLives) * this.barWidth, 0.01 * this.barWidth) : 0,
                'red',
            );
        }
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
        const minutes = Math.floor(time / 60000);
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
            this.game.audioHandler.mapSoundtrack.pauseSound(timeTickingSound);
        } else {
            this.game.audioHandler.mapSoundtrack.resumeSound(timeTickingSound);
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

        const fireballImage = this.game.player.isDarkWhiteBorder ? this.fireballUIWhiteBorder : this.fireballUI;
        const divingImage = this.game.player.isDarkWhiteBorder ? this.divingUIWhiteBorder : this.divingUI;
        const invisibleImage = this.game.player.isDarkWhiteBorder ? this.invisibleUIWhiteBorder : this.invisibleUI;

        //diving ability
        const divingX = 25;
        if (this.game.player.divingTimer < this.game.player.divingCooldown) {
            context.save();
            context.filter = 'grayscale(100%)';
        }
        context.drawImage(divingImage, divingX, yPosition, firedogBorderSize, firedogBorderSize);
        if (this.game.player.divingTimer < this.game.player.divingCooldown) {
            context.restore();
            const divingCooldown = Math.max(0, this.game.player.divingCooldown - this.game.player.divingTimer) / 1000;
            const countdownText = divingCooldown.toFixed(1);
            const textX = divingX + (firedogBorderSize - maxTextWidth) / 2 + 10;
            const textY = yPosition + (50 - 16) / 2 + 16;
            context.fillStyle = 'white';
            context.font = 'bold 20px Arial';
            context.fillText(countdownText, textX, textY);
        }

        //fireball ability
        const fireballX = divingX + firedogBorderSize + spaceBetweenAbilities;
        if (this.game.player.fireballTimer < this.game.player.fireballCooldown || this.game.player.energyReachedZero) {
            context.save();
            context.filter = 'grayscale(100%)';
        }
        if (this.game.player.isRedPotionActive) {
            context.drawImage(this.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, firedogBorderSize);
            context.save();
            const redPotionTimerX = fireballX + firedogBorderSize / 2;
            const redPotionTimerY = yPosition + 70;
            const redPotionCooldown = Math.max(0, this.game.player.redPotionTimer) / 1000;
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

        if (this.game.player.fireballTimer < this.game.player.fireballCooldown || this.game.player.energyReachedZero) {
            context.restore();
            if (this.game.player.fireballTimer < this.game.player.fireballCooldown) {
                const fireballCooldown = Math.max(0, this.game.player.fireballCooldown - this.game.player.fireballTimer) / 1000;
                const countdownText = fireballCooldown.toFixed(1);
                const textX = fireballX + (firedogBorderSize - maxTextWidth) / 2 + 10;
                const textY = yPosition + (50 - 16) / 2 + 16;
                context.fillStyle = 'white';
                context.font = 'bold 20px Arial';
                context.fillText(countdownText, textX, textY);
            }
        }

        //invisible ability
        const invisibleX = fireballX + firedogBorderSize + spaceBetweenAbilities;
        if (this.game.player.invisibleTimer < this.game.player.invisibleCooldown) {
            context.save();
            context.filter = 'grayscale(100%)';
        }
        context.drawImage(invisibleImage, invisibleX, yPosition, firedogBorderSize, firedogBorderSize);
        const invisibleTimerX = invisibleX + firedogBorderSize / 2;
        const invisibleTimerY = yPosition + 70;
        const invisibleCooldown = Math.max(0, this.game.player.invisibleActiveCooldownTimer) / 1000;
        const invisibleCountdownText = invisibleCooldown.toFixed(1);
        if (this.game.player.isInvisible) {
            context.fillStyle = 'white';
            context.shadowColor = 'black';
            context.font = 'bold 21px Arial';
            context.textAlign = 'center';
            context.fillText(invisibleCountdownText, invisibleTimerX, invisibleTimerY);
        }
        if (this.game.player.invisibleTimer < this.game.player.invisibleCooldown) {
            context.restore();
            const invisibleCooldown = Math.max(0, this.game.player.invisibleCooldown - this.game.player.invisibleTimer) / 1000;
            const countdownText = invisibleCooldown.toFixed(1);
            let textXActive;
            if (this.game.player.invisibleTimer <= 30050) {
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
        if (this.game.elyvorgInFight) {
            //poison
            let isPoisonActive;
            let poisonCooldownTime;
            let poisonCooldownTimer;
            //gravity
            let isGravitySpinnerActive;
            let gravityCooldownTime;
            let gravityCooldownTimer;
            //slash
            let slashAttackStateCounter;
            let slashAttackStateCounterLimit;
            let slashAttackOnce;
            //electric
            let electricWheelTimer;
            let isElectricWheelActive;

            for (const enemy of this.game.enemies) {
                if (enemy instanceof Elyvorg) {
                    //poison
                    isPoisonActive = enemy.isPoisonActive;
                    poisonCooldownTime = enemy.poisonCooldown;
                    poisonCooldownTimer = enemy.poisonCooldownTimer;
                    //gravity
                    isGravitySpinnerActive = enemy.isGravitySpinnerActive;
                    gravityCooldownTime = enemy.gravityCooldown;
                    gravityCooldownTimer = enemy.gravityCooldownTimer;
                    //slash
                    slashAttackOnce = enemy.slashAttackOnce;
                    slashAttackStateCounter = enemy.slashAttackStateCounter;
                    slashAttackStateCounterLimit = enemy.slashAttackStateCounterLimit;
                    //electric
                    electricWheelTimer = enemy.electricWheelTimer;
                    isElectricWheelActive = enemy.isElectricWheelActive;
                    break;
                }
            }

            const elyvorgBorderSize = 65;
            const spaceBetweenAbilities = 10;
            const yPosition = 20;

            //poison
            const poisonX = this.game.width - elyvorgBorderSize - spaceBetweenAbilities * 2;
            if (poisonCooldownTimer > 0) {
                if (isPoisonActive) {
                    context.drawImage(this.poisonUI, poisonX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                }
                context.save();
                const poisonTimerX = poisonX + elyvorgBorderSize / 2;
                const poisonTimerY = yPosition + 87;
                const poisonCooldown = Math.max(0, poisonCooldownTime / 1000 - poisonCooldownTimer / 1000);
                const poisonCountdownText = poisonCooldown.toFixed(1);
                context.fillStyle = 'white';
                context.shadowColor = 'black';
                context.font = 'bold 22px Arial';
                context.strokeStyle = 'black';
                context.lineWidth = 2;
                context.textAlign = 'center';
                context.strokeText(poisonCountdownText, poisonTimerX, poisonTimerY);
                context.fillText(poisonCountdownText, poisonTimerX, poisonTimerY);
                context.restore();
            } else {
                context.save();
                context.filter = 'grayscale(100%)';
                context.drawImage(this.poisonUI, poisonX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            }

            //gravity
            const gravityX = poisonX - elyvorgBorderSize - spaceBetweenAbilities;
            if (gravityCooldownTimer > 0) {
                if (isGravitySpinnerActive) {
                    context.drawImage(this.gravityUI, gravityX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                }
                context.save();
                const gravityTimerX = gravityX + elyvorgBorderSize / 2;
                const gravityTimerY = yPosition + 87;
                const gravityCooldown = Math.max(0, gravityCooldownTime / 1000 - gravityCooldownTimer / 1000);
                const gravityCountdownText = gravityCooldown.toFixed(1);
                context.fillStyle = 'white';
                context.shadowColor = 'black';
                context.font = 'bold 22px Arial';
                context.strokeStyle = 'black';
                context.lineWidth = 2;
                context.textAlign = 'center';
                context.strokeText(gravityCountdownText, gravityTimerX, gravityTimerY);
                context.fillText(gravityCountdownText, gravityTimerX, gravityTimerY);
                context.restore();
            } else {
                context.save();
                context.filter = 'grayscale(100%)';
                context.drawImage(this.gravityUI, gravityX, yPosition, elyvorgBorderSize, elyvorgBorderSize);
                context.restore();
            }

            //slash
            const slashX = gravityX - elyvorgBorderSize - spaceBetweenAbilities;
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

            //electric
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
}
