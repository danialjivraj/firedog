export class StatusEffectsUI {
    constructor(ui) {
        this.ui = ui;
        this.game = ui.game;
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
        const activeOrder = this.ui.negativeStatusUi.activeOrder;

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
                    appliedOrder: this.ui.negativeStatusUi.nextOrder++,
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
        const radius = this.ui.negativeStatusUi.radius;
        const remainingRatio = effect.total > 0
            ? this.ui.clamp(effect.remaining / effect.total, 0, 1)
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
        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.fillStyle = 'rgba(10, 5, 16, 0.92)';
        ctx.fill();

        // colored tint
        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
        ctx.fillStyle = theme.tint;
        ctx.fill();

        // arc ring clipped to rounded rect
        ctx.save();
        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
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
        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
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
        this.ui.roundedRectPath(ctx, x, y, size, size, radius);
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

        const layout = this.ui._abilityUiLayout || {};
        const startX = layout.x ?? 25;
        const startY = (layout.bottomY ?? (168 + this.ui.topLeftYShift + 50)) + this.ui.negativeStatusUi.topSpacing;

        const size = this.ui.negativeStatusUi.size;
        const gap = this.ui.negativeStatusUi.gap;

        for (let i = 0; i < activeEffects.length; i++) {
            const effect = activeEffects[i];
            const x = startX + i * (size + gap);
            const y = startY;

            this.ui.drawNegativeStatusEffect(ctx, x, y, size, effect);
        }
    }
}
