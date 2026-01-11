class Particle {
    constructor(game) {
        this.game = game;
        this.markedForDeletion = false;
    }
    update() {
        if (this.game.cabin.isFullyVisible || this.game.isBossVisible) {
            this.x -= this.speedX;
        } else {
            this.x -= this.speedX + this.game.speed;
        }
        this.y -= this.speedY;
        this.size *= 0.97;
        if (this.size < 0.5) this.markedForDeletion = true;
    }
}

function resolveFireSplashImageId(player) {
    if (player.isUnderwater) {
        return player.isBluePotionActive ? 'bluebubble' : 'bubble';
    } else {
        return player.isBluePotionActive ? 'bluefire' : 'fire';
    }
}

export class Dust extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = (Math.random() * 20 + 10) * 3;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.isUnderwater = this.game.player.isUnderwater;
        this.image = document.getElementById(this.isUnderwater ? 'bubble' : 'dust_black');
        this.createBubble = Math.random() > 0.9;
        this.createDust = Math.random() > 0.6;
    }

    draw(context) {
        if (this.isUnderwater === true) {
            if (this.createBubble) {
                context.drawImage(document.getElementById('bubble'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
            if (this.createDust) {
                context.drawImage(document.getElementById('dust_black'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
        } else {
            context.drawImage(this.image, this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }

        if (!this.game.menu.pause.isPaused && this.createBubble) {
            if (this.isUnderwater === true) {
                this.y -= 2;
            }
        }
    }
}

export class IceCrystal extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 20 + 20;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.image = document.getElementById('ice_crystal');
        this.createIce = Math.random() > 0.5;
    }

    draw(context) {
        if (this.createIce) {
            context.drawImage(document.getElementById('ice_crystal'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }
    }
}

export class Bubble extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = (Math.random() * 20 + 10) * 3;
        this.x = x;
        this.y = y;
        this.speedX = Math.random();
        this.speedY = Math.random();
        this.isUnderwater = this.game.player.isUnderwater;
        this.image = document.getElementById('bubble');
        this.createBubble = Math.random() > 0.9;
    }

    draw(context) {
        if (this.isUnderwater === true) {
            if (this.createBubble) {
                context.drawImage(document.getElementById('bubble'), this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
            }
        } else {
            context.drawImage(this.image, this.x - this.size, this.y - this.size / 1.3, this.size, this.size);
        }

        if (!this.game.menu.pause.isPaused && this.createBubble) {
            if (this.isUnderwater === true) {
                this.y -= 2;
            }
        }
    }
}

export class Splash extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 40 + 60;
        this.x = x + this.size * 0.4;
        this.y = y + this.size * 0.5;
        this.speedX = Math.random() * 6 - 4;
        this.speedY = Math.random() * 2 + 2;
        this.gravity = 0;
        this.imageId = resolveFireSplashImageId(this.game.player);
    }

    update() {
        super.update();
        if (this.game.player.isUnderwater) {
            this.y -= this.gravity * 0.6;
        } else {
            this.y += this.gravity;
        }
        this.gravity += 0.1;
    }

    draw(context) {
        const img = document.getElementById(this.imageId);
        if (!img) return;
        context.drawImage(img, this.x, this.y, this.size, this.size);
    }
}

export class Fire extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 100 + 50;
        this.x = x;
        this.y = y;
        this.speedX = 1;
        this.speedY = 1;
        this.angle = 0;
        this.va = Math.random() * 0.2 - 0.1;
        this.imageId = resolveFireSplashImageId(this.game.player);
    }

    update() {
        super.update();
        if (this.game.player.isUnderwater) {
            this.y = this.y - 4;
        }
        this.angle += this.va;
        this.x += Math.sin(this.angle * 5);
    }

    draw(context) {
        const img = document.getElementById(this.imageId);
        if (!img) return;

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(img, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
        context.restore();
    }
}

export class Fireball extends Particle {
    constructor(game, x, y, image, initialDirection, verticalMovement = 0) {
        super(game);
        this.image = document.getElementById(image);
        this.redPotionModeOrNot();
        this.initialSize = 10;
        this.size = this.initialSize;
        this.updateSize();
        this.updateGrowthRate();
        this.x = x;
        this.y = y;
        this.speedX = 15;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.2;
        this.verticalMovement = verticalMovement;
        this.initialDirection = initialDirection;

        this._cachedSpecks = this.makeSpecks();
    }

    redPotionModeOrNot() {
        this.type = this.game.player.isRedPotionActive ? "redMode" : "normalMode";
    }
    updateSize() {
        this.maxSize = this.game.player.isUnderwater ? 55 : 40;
    }
    updateGrowthRate() {
        this.growthRate = this.game.player.isUnderwater ? 3 : 1;
    }

    makeSpecks() {
        return Array.from({ length: 2 }, () => ({
            a: Math.random() * Math.PI * 2,
            rr: 0.15 + Math.random() * 0.5,
            sz: 1 + Math.random() * 1
        }));
    }

    drawBubbleBall(ctx, x, y, r, variant = 'normal') {
        ctx.save();

        // outer glow
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
        if (variant === 'red') {
            glow.addColorStop(0.0, 'rgba(255,80,80,0.55)');
            glow.addColorStop(0.6, 'rgba(255,0,0,0.35)');
            glow.addColorStop(1.0, 'rgba(0,0,0,0)');
        } else {
            glow.addColorStop(0.0, 'rgba(160,220,255,0.35)');
            glow.addColorStop(1.0, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.fill();

        // shell
        ctx.globalCompositeOperation = 'source-over';
        const shell = ctx.createRadialGradient(x, y, 0, x, y, r);
        if (variant === 'red') {
            shell.addColorStop(0.0, 'rgba(255,230,230,0.45)');
            shell.addColorStop(0.4, 'rgba(255,100,100,0.35)');
            shell.addColorStop(0.75, 'rgba(200,40,40,0.32)');
            shell.addColorStop(1.0, 'rgba(120,0,0,0.30)');
        } else {
            shell.addColorStop(0.0, 'rgba(220,245,255,0.35)');
            shell.addColorStop(0.7, 'rgba(150,210,255,0.25)');
            shell.addColorStop(1.0, 'rgba(80,140,200,0.35)');
        }
        ctx.fillStyle = shell;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

        // specular highlights
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.18, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = (variant === 'red') ? 'rgba(255,120,120,0.35)' : 'rgba(255,255,255,0.22)';
        ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.15, r * 0.28, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    update() {
        if (this.initialDirection === 'right') this.x += this.speedX;
        else if (this.initialDirection === 'left') this.x -= this.speedX;

        this.y += this.verticalMovement;

        if (this.x > this.game.width || this.x + this.size < 0) this.markedForDeletion = true;

        const sizeChange = this.size + this.growthRate > this.maxSize
            ? this.maxSize - this.size
            : this.growthRate;

        this.size += sizeChange;
        this.y -= sizeChange / 2;

        this.rotationAngle += this.rotationSpeed;

        this._cachedSpecks = this.makeSpecks();
    }

    draw(context) {
        const r = this.size * (this.type === 'redMode' ? 0.62 : 0.56);

        context.save();
        context.translate(this.x + this.size / 2, this.y + this.size / 2);
        context.rotate(this.rotationAngle);

        if (this.game.player.isUnderwater) {
            const variant = (this.type === 'redMode') ? 'red' : 'normal';
            this.drawBubbleBall(context, 0, 0, r, variant);
        } else {
            if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
            context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

            // sparkles around the image
            context.globalCompositeOperation = 'lighter';
            context.fillStyle = (this.type === 'redMode')
                ? 'rgba(255,220,180,0.75)'
                : 'rgba(255,240,190,0.75)';

            const spin = this.rotationAngle * 5;

            for (const s of this._cachedSpecks) {
                const rr = r * s.rr;
                const a = s.a + spin;
                const px = Math.cos(a) * rr;
                const py = Math.sin(a) * rr;

                context.beginPath();
                context.arc(px, py, s.sz, 0, Math.PI * 2);
                context.fill();
            }

            context.globalCompositeOperation = 'source-over';
        }

        context.restore();
    }
}

export class CoinLoss extends Particle {
    constructor(game, x, y) {
        super(game);
        this.size = Math.random() * 40 + 60;
        this.x = x + this.size * 0.4;
        this.y = y + this.size * 0.5;
        this.speedX = Math.random() * 6 - 4;
        this.speedY = Math.random() * 2 + 2;
        this.gravity = 0;
        this.image = document.getElementById('singleCoin');
    }
    update() {
        super.update();
        this.gravity += 0.14;
        this.y += this.gravity;
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
}

class FloatingBubbleEffect extends Particle {
    constructor(game, x, y, options = {}) {
        super(game);
        this.x = x;
        this.y = y;

        this.size = options.size ?? (Math.random() * 15 + 10);
        this.speedY = options.speedY ?? -(1.4 + Math.random() * 0.6);
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = options.swaySpeed ?? (0.1 + Math.random() * 0.05);
        this.swayAmount = options.swayAmount ?? (0.6 + Math.random() * 0.4);

        this.life = 1;
        this.fadeSpeed = 0.012 + Math.random() * 0.01;
    }

    update() {
        if (this.game.cabin.isFullyVisible || this.game.isBossVisible) {
            this.x -= this.game.speed * (this.parallax ?? 0.0);
        } else {
            this.x -= this.game.speed * (this.parallax ?? 0.2);
        }

        this.swayAngle += this.swaySpeed;
        this.x += Math.sin(this.swayAngle) * this.swayAmount;
        this.y += this.speedY;

        this.size *= 0.992;
        this.life -= this.fadeSpeed;

        if (this.size < 2 || this.life <= 0) this.markedForDeletion = true;
    }
}

export class PoisonBubbles extends FloatingBubbleEffect {
    constructor(game, x, y, kind = 'poison') {
        super(game, x, y);
        this.kind = kind;

        this.speedX = (Math.random() * 0.6 - 0.3);
        this.swaySpeed *= 0.016;

        this.shadowBlur = 10;
        const isPoison = kind === 'poison';
        this.shadowColor = isPoison ? 'rgba(0,160,0,0.9)' : 'rgba(90,180,255,0.9)';
        this.fill = isPoison ? 'rgba(0,200,0,0.8)' : 'rgba(120,200,255,0.8)';
        this.stroke = isPoison ? 'rgba(0,255,0,0.9)' : 'rgba(160,220,255,0.9)';
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);

        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.fill;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = this.stroke;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.18, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        ctx.restore();
    }
}

export class IceCrystalBubbles extends FloatingBubbleEffect {
    constructor(game, x, y) {
        super(game, x, y, { size: Math.random() * 25 + 10 });
        this.image = document.getElementById('ice_crystal');
        this.alpha = 1;
    }

    update() {
        super.update();
        this.alpha = this.life;
    }
    draw(ctx) {
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

export class SpinningChicks extends Particle {
    constructor(game) {
        super(game);
        this.count = 4;
        this.radiusX = 36;
        this.radiusY = 10;
        this.angularSpeed = 0.07;
        this.baseAngle = 0;
        this.rockAmp = 4;
        this.rockSpeed = 0.05;
        this.rockPhase = 0;
        this.size = 12;
        this.headOffsetX = 10;
        this.headOffsetYRatioStand = 0.3;
        this.headOffsetYRatioSit = 0.15;
        this.headOffsetYLerp = 0.15;
        this._headOffsetYRatio = this.headOffsetYRatioStand;
        this.TWO_PI = Math.PI * 2;
    }

    update() {
        const player = this.game.player;

        if (!player.isConfused || this.game.gameOver) {
            this.markedForDeletion = true;
            return;
        }
        if (!this.game.menu.pause.isPaused) {
            this.baseAngle += this.angularSpeed;
            this.rockPhase += this.rockSpeed;
        }

        const isSitting = player.currentState === player.states[0];
        const target = isSitting ? this.headOffsetYRatioSit : this.headOffsetYRatioStand;
        this._headOffsetYRatio += (target - this._headOffsetYRatio) * this.headOffsetYLerp;
    }

    drawChick(ctx, x, y, s) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        // body
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, this.TWO_PI);
        ctx.fillStyle = 'rgba(255,215,0,0.95)';
        ctx.fill();
        // highlight
        ctx.beginPath();
        ctx.arc(-2.5, -2.5, 1.6, 0, this.TWO_PI);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
        // beak
        ctx.beginPath();
        ctx.moveTo(5.4, 0);
        ctx.lineTo(8.4, -1.2);
        ctx.lineTo(5.4, 1.2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,140,0,0.95)';
        ctx.fill();
        // eye
        ctx.beginPath();
        ctx.arc(2.3, -1.7, 0.9, 0, this.TWO_PI);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fill();
        ctx.restore();
    }

    draw(ctx) {
        const p = this.game.player;

        const px = p.x + p.width * 0.5 + this.headOffsetX;
        const py = p.y + p.height * (0.5 - this._headOffsetYRatio);

        // glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(px, py, 0, px, py, this.radiusX + 18);
        glow.addColorStop(0.0, 'rgba(255, 80, 80, 0.13)');
        glow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, this.radiusX + 18, 0, this.TWO_PI);
        ctx.fill();
        ctx.restore();

        for (let i = 0; i < this.count; i++) {
            const a = this.baseAngle + i * (this.TWO_PI / this.count);
            const ex = Math.cos(a) * this.radiusX;
            const ey = Math.sin(a) * this.radiusY;

            const rock = -this.rockAmp * Math.cos(a) * Math.sin(this.rockPhase);

            const cx = px + ex;
            const cy = py + ey + rock;

            ctx.save();
            ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
            ctx.shadowBlur = 8;
            this.drawChick(ctx, cx, cy, this.size / 12);
            ctx.restore();
        }
    }
}


export class DashGhost extends Particle {
    constructor(game, snapshot) {
        super(game);

        this.img = snapshot.img;

        this.sx = snapshot.sx;
        this.sy = snapshot.sy;
        this.sw = snapshot.sw;
        this.sh = snapshot.sh;

        this.x = snapshot.x;
        this.y = snapshot.y;

        this.dw = snapshot.dw;
        this.dh = snapshot.dh;

        this.facingRight = snapshot.facingRight;

        this.speedX = 0;
        this.speedY = 0;

        this.life = 1.0;
        this.fadeSpeed = 0.06;
        this.scale = 1.0;
        this.shrink = 0.992;
        this.alpha = 0.55;
    }

    update() {
        if (this.game.cabin.isFullyVisible || this.game.isBossVisible) {
            this.x -= this.speedX;
        } else {
            this.x -= this.speedX + this.game.speed;
        }
        this.y -= this.speedY;

        this.life -= this.fadeSpeed;
        this.scale *= this.shrink;

        if (this.life <= 0.02) this.markedForDeletion = true;
    }

    draw(ctx) {
        if (!this.img) return;

        const cx = this.x + this.dw / 2;
        const cy = this.y + this.dh / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(this.facingRight ? 1 : -1, 1);

        ctx.globalAlpha = Math.max(0, this.life) * this.alpha;

        const dw = this.dw * this.scale;
        const dh = this.dh * this.scale;

        ctx.drawImage(
            this.img,
            this.sx, this.sy, this.sw, this.sh,
            -dw / 2, -dh / 2,
            dw, dh
        );

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

export class DashFireArc extends Particle {
    constructor(game, x, y, facingRight = true, worldStopped = false) {
        super(game);

        const p = this.game.player;

        this.imageId = resolveFireSplashImageId(p);

        this.worldStopped = worldStopped;

        this.spawnDashInstanceId = p ? p.dashInstanceId : 0;

        this.facingRight = !!facingRight;
        this.dir = this.facingRight ? 1 : -1;

        const baseX = x;
        const baseY = y;

        const forward = 18 + Math.random() * 50;
        let spawnX = baseX + this.dir * forward;

        if (spawnX < 0 || spawnX > this.game.width) {
            const safeForward = 8 + Math.random() * 24;
            spawnX = baseX - this.dir * safeForward;
        }

        this.x = spawnX;
        this.y = baseY + (Math.random() * 16 - 8);

        this.size = Math.random() * 40 + 45;

        const trail = 1.6 + Math.random() * 2.2;
        const spread = (Math.random() * 24 - 12) * (Math.PI / 180);

        this.baseSpeedX = this.dir * (Math.cos(spread) * trail);
        this.startSpeedX = this.baseSpeedX * (0.08 + Math.random() * 0.16);
        this.speedX = this.startSpeedX;

        this.curveSign = Math.random() < 0.5 ? 1 : -1;
        this.speedY = (1.4 + Math.random() * 2.4) * this.curveSign;

        this.age = 0;
        this.boostMs = 160 + Math.random() * 120;
        this.boost = 0.045 + Math.random() * 0.055;

        this.damp = 0.985 + Math.random() * 0.01;
        this.drag = 0.985 + Math.random() * 0.01;

        this.angle = Math.random() * Math.PI * 2;
        this.va = Math.random() * 0.14 - 0.07;
        this.wobbleAmp = 0.4 + Math.random() * 0.7;

        this.followMs = 130 + Math.random() * 90;
        this.followFactor = 0.95;
        this._lastPlayerX = p ? p.x : 0;

        this.rampMs = 90 + Math.random() * 70;

        this._dashScrollSpeed = (this.game.normalSpeed ?? 6) * 3;
    }

    update() {
        super.update();

        if (this.game.menu.pause.isPaused) return;

        const dt = this.game.deltaTime ?? 16;
        const dtScale = dt / 16;
        this.age += dt;

        const p = this.game.player;

        const sameDash = p.isDashing && p.dashInstanceId === this.spawnDashInstanceId;

        if (this.worldStopped && sameDash) {
            this.x -= (this._dashScrollSpeed * dtScale) * this.dir;
        }

        if (sameDash && this.age < this.followMs) {
            const dx = p.x - this._lastPlayerX;
            this.x += dx * this.followFactor;
            this._lastPlayerX = p.x;
        }

        if (this.age < this.rampMs) {
            const t = Math.min(1, this.age / this.rampMs);
            this.speedX = this.startSpeedX + (this.baseSpeedX - this.startSpeedX) * t;
        } else {
            this.speedX = this.baseSpeedX;
        }

        if (this.age < this.boostMs) {
            const t = this.age / this.boostMs;
            const easeOut = 1 - t;
            const step = dtScale * this.boost * easeOut;

            this.speedY += this.curveSign * step;
            this.speedX *= (1 - 0.0025 * dtScale);
        }

        this.speedX *= this.drag;
        this.speedY *= this.damp;

        if (p.isUnderwater) {
            this.y -= 0.35;
        }

        this.angle += this.va;
        this.x += Math.sin(this.angle * 4) * this.wobbleAmp;
    }

    draw(ctx) {
        const img = document.getElementById(this.imageId);
        if (!img) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(img, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
        ctx.restore();
    }
}
