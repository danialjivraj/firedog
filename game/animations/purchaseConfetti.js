export class PurchaseConfetti {
    constructor(game, {
        x = game.width / 2,
        y = game.height / 2,
        count = 42,
        duration = 2600,
        direction = 0,
    } = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.elapsed = 0;
        this.markedForDeletion = false;

        const colors = [
            '#ffe45c',
            '#ff7eb6',
            '#5de6ff',
            '#8cff7a',
            '#ff9f45',
            '#ffffff',
        ];

        this.pieces = Array.from({ length: count }, (_, i) => {
            const angle = -Math.PI / 2 + direction + (Math.random() - 0.5) * 1.05;
            const speed = 230 + Math.random() * 260;

            return {
                x,
                y,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 80,
                vy: Math.sin(angle) * speed - 80 - Math.random() * 90,
                w: 5 + Math.random() * 7,
                h: 8 + Math.random() * 10,
                color: colors[i % colors.length],
                spin: Math.random() * Math.PI * 2,
                spinSpeed: (Math.random() - 0.5) * 0.018,
                gravity: 500 + Math.random() * 210,
                swayPhase: Math.random() * Math.PI * 2,
                swaySpeed: 0.004 + Math.random() * 0.004,
                swayAmount: 10 + Math.random() * 18,
            };
        });
    }

    update(deltaTime) {
        this.elapsed += deltaTime;

        const dt = Math.min(40, Math.max(0, deltaTime)) / 1000;

        for (const p of this.pieces) {
            p.vy += p.gravity * dt;
            p.x += (p.vx + Math.sin(this.elapsed * p.swaySpeed + p.swayPhase) * p.swayAmount) * dt;
            p.y += p.vy * dt;
            p.spin += p.spinSpeed * deltaTime;
        }

        if (this.elapsed >= this.duration) this.markedForDeletion = true;
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        const t = Math.min(1, this.elapsed / this.duration);
        const alpha = t < 0.82 ? 1 : Math.max(0, 1 - (t - 0.82) / 0.18);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = 'rgba(255, 236, 125, 0.28)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        for (const p of this.pieces) {
            const wobble = Math.cos(p.spin);
            const halfW = Math.max(1.5, p.w * (0.45 + Math.abs(wobble) * 0.55));
            const halfH = p.h / 2;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - halfH);
            ctx.lineTo(p.x + halfW, p.y);
            ctx.lineTo(p.x, p.y + halfH);
            ctx.lineTo(p.x - halfW, p.y);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}
