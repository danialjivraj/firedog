export class AbilityUI {
    constructor(ui) {
        this.ui = ui;
        this.game = ui.game;
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

        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
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
        this.ui.roundedRectPath(ctx, clipX, clipY, clipSize, clipSize, Math.max(0, frame.radius - half));
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
            this.ui.roundedRectPath(ctx, x, y, size, size, frame.radius);
            ctx.stroke();
            ctx.restore();
        }
    }

    firedogAbilityUI(context) {
        const maxTextWidth = 50;
        const firedogBorderSize = 50;
        const spaceBetweenAbilities = 10;
        const hudStyle = this.ui.getHudLayoutStyle();
        const yPosition = (hudStyle === 'legacy' ? 168 : 138) + this.ui.topLeftYShift;

        const player = this.game.player;
        const frozen = !!player.isFrozen;
        const hitOrStunned =
            player.currentState === player.states[6] || // stunned
            player.currentState === player.states[7];   // hit

        const borderColor = 'black';

        const fireballImage = this.ui.fireballUI;
        const divingImage = this.ui.divingUI;
        const invisibleImage = this.ui.invisibleUI;
        const dashImage = this.ui.dashingUI;

        const nowMs = this.ui.getUiTime();
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
            this.ui.drawAbilityIcon(context, divingImage, divingX, yPosition, firedogBorderSize, {
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
            this.ui.drawAbilityIcon(context, divingImage, divingX, yPosition, firedogBorderSize, {
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
                this.ui.drawAbilityIcon(context, this.ui.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, {
                    borderColor,
                    contentFilter: fireballLocked ? lockContentFilter : null,
                    animatedBorder: true,
                    animatedColor: 'yellow',
                    animatedNowMs: nowMs,
                    animatedSettings: yellowCooldownSpin,
                });
            } else {
                this.ui.drawAbilityIcon(context, this.ui.fireballRedPotionUI, fireballX, yPosition, firedogBorderSize, {
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
                this.ui.drawAbilityIcon(context, fireballImage, fireballX, yPosition, firedogBorderSize, {
                    borderColor,
                    contentFilter: fireballLocked ? lockContentFilter : null,
                    animatedBorder: true,
                    animatedColor: 'yellow',
                    animatedNowMs: nowMs,
                    animatedSettings: yellowCooldownSpin,
                });
            } else {
                this.ui.drawAbilityIcon(context, fireballImage, fireballX, yPosition, firedogBorderSize, {
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
            this.ui.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
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
            this.ui.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: invisibleLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'yellow',
                animatedNowMs: nowMs,
                animatedSettings: yellowCooldownSpin,
            });
        } else {
            this.ui.drawAbilityIcon(context, invisibleImage, invisibleX, yPosition, firedogBorderSize, {
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
            this.ui.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
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
            this.ui.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
                borderColor,
                contentFilter: dashLocked ? lockContentFilter : null,
                animatedBorder: true,
                animatedColor: 'yellow',
                animatedNowMs: nowMs,
                animatedSettings: yellowCooldownSpin,
            });
        } else {
            this.ui.drawAbilityIcon(context, dashImage, dashX, yPosition, firedogBorderSize, {
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

            this.ui.roundedRectPath(context, x, y, w, h, r);
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

        this.ui._abilityUiLayout = {
            x: 25,
            y: yPosition,
            size: 50,
            gap: 10,
            bottomY: abilityBottomY,
        };
    }
}
