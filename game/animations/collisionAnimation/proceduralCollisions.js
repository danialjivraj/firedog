import { normalizeDelta } from "../../config/constants.js";

function _makeOffscreenCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}

function _snapshotDrawable(source, w, h, options = {}) {
    const c = _makeOffscreenCanvas(w, h);
    const ctx = c.getContext("2d");

    const sx = options.sourceX ?? source.x ?? 0;
    const sy = options.sourceY ?? source.y ?? 0;

    ctx.save();
    ctx.translate(-sx, -sy);

    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;

    source.draw(ctx);

    ctx.globalAlpha = prevAlpha;
    ctx.restore();

    return c;
}

function _resolveSourceOpts(source, options) {
    let image = options.image || source.image || null;

    if (!image && source && typeof source.draw === "function") {
        const snapW =
            options.snapshotWidth ??
            options.width ??
            source.width ??
            source.spriteWidth ??
            0;
        const snapH =
            options.snapshotHeight ??
            options.height ??
            source.height ??
            source.spriteHeight ??
            0;

        if (snapW > 0 && snapH > 0) {
            image = _snapshotDrawable(source, snapW, snapH, {
                sourceX: options.sourceX,
                sourceY: options.sourceY,
            });
            options.frameX ??= 0;
            options.frameY ??= 0;
            options.spriteWidth ??= image.width;
            options.spriteHeight ??= image.height;
            options.width ??= image.width;
            options.height ??= image.height;
        }
    }

    const spriteWidth =
        options.spriteWidth ??
        source.width ??
        source.spriteWidth ??
        (image ? image.width : 0);

    const spriteHeight =
        options.spriteHeight ??
        source.height ??
        source.spriteHeight ??
        (image ? image.height : 0);

    const width = options.width ?? source.width ?? spriteWidth;
    const height = options.height ?? source.height ?? spriteHeight;

    const x = options.x ?? (source.x ?? 0) + (source.width ?? width) * 0.5;
    const y = options.y ?? (source.y ?? 0) + (source.height ?? height) * 0.5;

    const frameX = options.frameX ?? source.frameX ?? 0;
    const frameY = options.frameY ?? source.frameY ?? 0;

    const drawInfo = source.collisionDrawInfo || {};

    let angle;
    if (typeof options.angle === "number") {
        angle = options.angle;
    } else if (typeof drawInfo.angle === "number") {
        angle = drawInfo.angle;
    } else if (typeof source.angle === "number") {
        angle = source.angle;
    } else {
        const vx = drawInfo.vx ?? source.speedX ?? source.vx ?? 0;
        const vy = drawInfo.vy ?? source.speedY ?? source.vy ?? 0;
        angle = (vx || vy) ? Math.atan2(vy, vx) : 0;
    }

    const direction =
        options.direction ?? drawInfo.direction ?? source.direction ?? false;

    return { image, spriteWidth, spriteHeight, width, height, x, y, frameX, frameY, angle, direction };
}

export class GhostFadeOut {
    constructor(game, enemy) {
        this.game = game;

        this.image = enemy.image;
        this.spriteWidth = enemy.width;
        this.spriteHeight = enemy.height;

        this.frameX = enemy.frameX || 0;
        this.frameY = enemy.frameY || 0;

        this.width = enemy.width;
        this.height = enemy.height;

        this.x = enemy.x;
        this.y = enemy.y;

        this.inverted = enemy.incrementMovement > 0;

        this.duration = 450;
        this.timer = 0;
        this.alpha = 1;

        this.bands = [];
        const bandCount = 12;
        const bandHeight = this.spriteHeight / bandCount;

        const baseSy = this.frameY * this.spriteHeight;

        for (let i = 0; i < bandCount; i++) {
            const sy = baseSy + i * bandHeight;
            const sh = i === bandCount - 1
                ? this.spriteHeight - i * bandHeight
                : bandHeight;

            this.bands.push({
                sy,
                sh,
                offsetX: 0,
                offsetY: 0,
                jitterStrength: 3 + Math.random() * 12,
                flicker: Math.random() * 0.6 + 0.4,
                phase: Math.random() * Math.PI * 2,
                currentAlpha: 1,
            });
        }

        this.markedForDeletion = false;
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        this.x -= this.game.speed * dt;

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        this.alpha = 1 - t;

        const time = this.timer / 60;

        for (let i = 0; i < this.bands.length; i++) {
            const band = this.bands[i];
            const f = i / this.bands.length;

            const noise = Math.sin(time * 0.9 + band.phase + f * 6);
            band.offsetX = noise * band.jitterStrength * (1 + t * 2);

            const noiseY = Math.cos(time * 1.3 + band.phase * 1.5);
            band.offsetY = noiseY * 1.3;

            band.currentAlpha =
                this.alpha *
                (0.3 +
                    band.flicker *
                    (0.7 + 0.3 * Math.sin(time * 3 + f * 10)));
        }

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        const centerX = this.x + this.width * 0.5;
        const centerY = this.y + this.height * 0.5;

        if (this.game.debug) {
            context.strokeRect(this.x, this.y, this.width, this.height);
        }

        context.translate(centerX, centerY);
        context.scale(this.inverted ? -1 : 1, 1);

        const baseSx = this.frameX * this.spriteWidth;

        const scaleY = this.height / this.spriteHeight;

        for (let i = 0; i < this.bands.length; i++) {
            const band = this.bands[i];
            const dyTop =
                -this.height / 2 +
                (band.sy - this.frameY * this.spriteHeight) * scaleY;
            const sh = band.sh;

            const destBandHeight = sh * scaleY;

            context.save();
            context.globalAlpha = band.currentAlpha;

            const dx = -this.width / 2 + band.offsetX;
            const dy = dyTop + band.offsetY;

            context.drawImage(
                this.image,
                baseSx,
                band.sy,
                this.spriteWidth,
                sh,
                dx,
                dy,
                this.width,
                destBandHeight
            );
            context.restore();

            context.save();
            context.globalAlpha = band.currentAlpha * 0.55;

            const dx2 = -this.width / 2 - band.offsetX * 0.7;
            const dy2 = dyTop - band.offsetY * 0.7;

            context.drawImage(
                this.image,
                baseSx,
                band.sy,
                this.spriteWidth,
                sh,
                dx2,
                dy2,
                this.width,
                destBandHeight
            );
            context.restore();
        }

        context.restore();
    }
}

export class DisintegrateCollision {
    constructor(game, source, options = {}) {
        this.game = game;
        this.followTarget = options.followTarget || null;

        const resolved = _resolveSourceOpts(source, options);
        this.image = resolved.image;
        this.spriteWidth = resolved.spriteWidth;
        this.spriteHeight = resolved.spriteHeight;
        this.width = resolved.width;
        this.height = resolved.height;
        this.x = resolved.x;
        this.y = resolved.y;
        this.frameX = resolved.frameX;
        this.frameY = resolved.frameY;
        this.angle = resolved.angle;
        this.direction = resolved.direction;

        this.duration = options.duration ?? 450;
        this.timer = 0;
        this.markedForDeletion = false;

        const cols = options.cols ?? 7;
        const rows = options.rows ?? 4;

        const shardW = this.spriteWidth / cols;
        const shardH = this.spriteHeight / rows;

        this.shards = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = col * shardW;
                const sy = row * shardH;

                const sw = (col === cols - 1) ? this.spriteWidth - sx : shardW;
                const sh = (row === rows - 1) ? this.spriteHeight - sy : shardH;

                const fx = (col + 0.5) / cols - 0.5;
                const fy = (row + 0.5) / rows - 0.5;

                let dirX = fx;
                let dirY = fy;

                const len = Math.hypot(dirX, dirY) || 1;
                dirX /= len;
                dirY /= len;

                const jitterAngle = (Math.random() - 0.5) * 0.6;
                const cosA = Math.cos(jitterAngle);
                const sinA = Math.sin(jitterAngle);
                const jx = dirX * cosA - dirY * sinA;
                const jy = dirX * sinA + dirY * cosA;

                const baseSpeed =
                    (options.minShardSpeed ?? 25) +
                    Math.random() *
                    ((options.maxShardSpeed ?? 60) - (options.minShardSpeed ?? 25));

                this.shards.push({
                    sx,
                    sy,
                    sw,
                    sh,
                    dirX: jx,
                    dirY: jy,
                    baseSpeed,
                    jitterPhase: Math.random() * Math.PI * 2,
                    jitterStrength:
                        (options.jitterStrengthBase ?? 1) +
                        Math.random() * (options.jitterStrengthRange ?? 1.5),
                    alpha: 1,
                    scale: 1,
                    offsetX: 0,
                    offsetY: 0,
                });
            }
        }
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        if (this.followTarget) {
            this.x = this.followTarget.x + this.followTarget.width * 0.5;
            this.y = this.followTarget.y + this.followTarget.height * 0.5;
        } else {
            this.x -= this.game.speed * dt;
        }

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        const travelFactor = t * t;

        this.shards.forEach(shard => {
            const baseDist = shard.baseSpeed * travelFactor;

            let dx = shard.dirX * baseDist;
            let dy = shard.dirY * baseDist;

            const time = this.timer * 0.01;
            const wiggle = Math.sin(time + shard.jitterPhase) * shard.jitterStrength;
            dx += -shard.dirY * wiggle * 0.5;
            dy += shard.dirX * wiggle * 0.5;

            shard.offsetX = dx;
            shard.offsetY = dy;

            shard.rotation += shard.spin * dt;

            shard.alpha = 1 - t * 1.1;
            shard.scale = 1 - t * 0.85;

            if (shard.alpha < 0) shard.alpha = 0;
            if (shard.scale < 0) shard.scale = 0;
        });

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.image) return;

        context.save();

        if (this.game.debug) {
            context.strokeRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }

        context.translate(this.x, this.y);

        if (this.direction) {
            context.scale(-1, -1);
        } else {
            context.scale(1, -1);
        }
        context.rotate(this.angle);

        const baseSx = this.frameX * this.spriteWidth;
        const baseSy = this.frameY * this.spriteHeight;

        const widthScale = this.width / this.spriteWidth;
        const heightScale = this.height / this.spriteHeight;

        for (const shard of this.shards) {
            if (shard.alpha <= 0 || shard.scale <= 0) continue;

            const localCenterX =
                -this.width / 2 +
                (shard.sx + shard.sw * 0.5) * widthScale;

            const localCenterY =
                -this.height / 2 +
                (shard.sy + shard.sh * 0.5) * heightScale;

            const dx = localCenterX + shard.offsetX;
            const dy = localCenterY + shard.offsetY;

            const dw = shard.sw * widthScale * shard.scale;
            const dh = shard.sh * heightScale * shard.scale;

            context.save();
            context.globalAlpha = shard.alpha;

            context.drawImage(
                this.image,
                baseSx + shard.sx,
                baseSy + shard.sy,
                shard.sw,
                shard.sh,
                dx - dw / 2,
                dy - dh / 2,
                dw,
                dh
            );

            context.restore();
        }

        context.restore();
    }
}

export class NuclearDisintegrationCollision {
    constructor(game, source, options = {}) {
        this.game = game;
        this.followTarget = options.followTarget || null;
        this.flipY = options.flipY ?? false;

        const resolved = _resolveSourceOpts(source, options);
        this.image = resolved.image;
        this.spriteWidth = resolved.spriteWidth;
        this.spriteHeight = resolved.spriteHeight;
        this.width = resolved.width;
        this.height = resolved.height;
        this.x = resolved.x;
        this.y = resolved.y;
        this.frameX = resolved.frameX;
        this.frameY = resolved.frameY;
        this.angle = resolved.angle;
        this.direction = resolved.direction;

        this.duration = options.duration ?? 3000;
        this.fadeOutDuration = options.fadeOutDuration ?? 700;
        this.totalDuration = this.duration + this.fadeOutDuration;

        this.timer = 0;
        this.markedForDeletion = false;

        this.fadeMultiplier = options.fadeMultiplier ?? 0.55;
        this.scaleMultiplier = options.scaleMultiplier ?? 0.18;

        const cols = options.cols ?? 18;
        const rows = options.rows ?? 14;

        const shardW = this.spriteWidth / cols;
        const shardH = this.spriteHeight / rows;

        this.shards = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = col * shardW;
                const sy = row * shardH;

                const sw = (col === cols - 1) ? this.spriteWidth - sx : shardW;
                const sh = (row === rows - 1) ? this.spriteHeight - sy : shardH;

                const fx = (col + 0.5) / cols - 0.5;
                const fy = (row + 0.5) / rows - 0.5;

                let dirX = fx + (Math.random() - 0.5) * 1.4;
                let dirY = fy + (Math.random() - 0.5) * 1.4;

                const len = Math.hypot(dirX, dirY) || 1;
                dirX /= len;
                dirY /= len;

                const minShardSpeed = options.minShardSpeed ?? 95;
                const maxShardSpeed = options.maxShardSpeed ?? 260;

                const baseSpeed =
                    minShardSpeed +
                    Math.random() * (maxShardSpeed - minShardSpeed);

                this.shards.push({
                    sx,
                    sy,
                    sw,
                    sh,
                    dirX,
                    dirY,
                    baseSpeed,
                    alpha: 1,
                    scale: 1,
                    offsetX: 0,
                    offsetY: 0,
                    delay: Math.random() * (options.maxShardDelay ?? 120),
                    spin: (Math.random() - 0.5) * 0.28,
                    rotation: 0,
                    wobblePhase: Math.random() * Math.PI * 2,
                    wobbleStrength: 4 + Math.random() * 10,
                });
            }
        }

        this.orbParticles = [];
        const orbCount = options.orbCount ?? 260;

        for (let i = 0; i < orbCount; i++) {
            const spawnR = Math.random() * Math.min(this.width, this.height) * 0.35;
            const spawnA = Math.random() * Math.PI * 2;

            const px = Math.cos(spawnA) * spawnR;
            const py = Math.sin(spawnA) * spawnR;

            let dirX = Math.cos(spawnA);
            let dirY = Math.sin(spawnA);

            dirX += (Math.random() - 0.5) * 0.8;
            dirY += (Math.random() - 0.5) * 0.8;

            const len = Math.hypot(dirX, dirY) || 1;
            dirX /= len;
            dirY /= len;

            const orbSpeedMin = options.orbSpeedMin ?? 240;
            const orbSpeedMax = options.orbSpeedMax ?? 620;

            const speed =
                orbSpeedMin +
                Math.random() * (orbSpeedMax - orbSpeedMin);

            this.orbParticles.push({
                x: px,
                y: py,
                vx: dirX * speed,
                vy: dirY * speed,
                drift: (Math.random() - 0.5) * (options.orbDrift ?? 42),
                radius:
                    (options.orbRadiusMin ?? 4) +
                    Math.random() * ((options.orbRadiusMax ?? 13) - (options.orbRadiusMin ?? 4)),
                baseAlpha:
                    (options.orbAlphaMin ?? 0.70) +
                    Math.random() * ((options.orbAlphaMax ?? 1.0) - (options.orbAlphaMin ?? 0.70)),
                alpha: 1,
                life: 0,
                delay: Math.random() * (options.orbMaxDelay ?? 120),
                pulse: Math.random() * Math.PI * 2,
            });
        }

        this.orbGlowColor = options.orbGlowColor || '255, 60, 240';
        this.orbCoreColor = options.orbCoreColor || '255, 255, 255';
    }

    getGlobalFadeAlpha() {
        if (this.timer <= this.duration) return 1;

        const fadeTimer = this.timer - this.duration;
        const t = Math.min(1, fadeTimer / Math.max(1, this.fadeOutDuration));

        return 1 - t;
    }

    update(deltaTime) {
        const dtScale = normalizeDelta(deltaTime);
        if (this.followTarget) {
            this.x = this.followTarget.x + this.followTarget.width * 0.5;
            this.y = this.followTarget.y + this.followTarget.height * 0.5;
        } else {
            this.x -= this.game.speed * dtScale;
        }

        this.timer += deltaTime;
        const dt = deltaTime / 1000;
        const globalFadeAlpha = this.getGlobalFadeAlpha();

        this.shards.forEach(shard => {
            const activeTime = Math.max(0, this.timer - shard.delay);
            const localDuration = Math.max(1, this.duration - shard.delay);
            const t = Math.min(1, activeTime / localDuration);

            const travelFactor = 1 - Math.pow(1 - t, 2.4);
            const dist = shard.baseSpeed * travelFactor * 8.0;

            let dx = shard.dirX * dist;
            let dy = shard.dirY * dist;

            const wobble = Math.sin(this.timer * 0.01 + shard.wobblePhase) * shard.wobbleStrength;
            dx += wobble;
            dy += Math.cos(this.timer * 0.008 + shard.wobblePhase) * shard.wobbleStrength * 0.65;

            shard.offsetX = dx;
            shard.offsetY = dy;
            shard.rotation += shard.spin;

            const localAlpha = Math.max(0, 1 - t * this.fadeMultiplier);
            shard.alpha = localAlpha * globalFadeAlpha;
            shard.scale = Math.max(0, 1 - t * this.scaleMultiplier);
        });

        this.orbParticles.forEach(p => {
            if (this.timer < p.delay) return;

            p.life += deltaTime;

            const age = Math.max(0, this.timer - p.delay);
            const t = Math.min(1, age / Math.max(1, this.duration - p.delay));

            p.x += (p.vx + Math.sin(this.timer * 0.006 + p.pulse) * p.drift) * dt;
            p.y += (p.vy + Math.cos(this.timer * 0.004 + p.pulse) * p.drift * 0.35) * dt;

            p.vx *= Math.pow(0.992, dtScale);
            p.vy *= Math.pow(0.992, dtScale);

            const localAlpha = Math.max(0, (1 - t * 0.85) * p.baseAlpha);
            p.alpha = localAlpha * globalFadeAlpha;
        });

        if (this.timer >= this.totalDuration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.image) return;

        const globalFadeAlpha = this.getGlobalFadeAlpha();
        if (globalFadeAlpha <= 0) return;

        context.save();
        context.translate(this.x, this.y);

        const scaleX = this.direction ? -1 : 1;
        const scaleY = this.flipY ? -1 : 1;
        context.scale(scaleX, scaleY);
        context.rotate(this.angle);

        const baseSx = this.frameX * this.spriteWidth;
        const baseSy = this.frameY * this.spriteHeight;

        const widthScale = this.width / this.spriteWidth;
        const heightScale = this.height / this.spriteHeight;

        for (const shard of this.shards) {
            if (shard.alpha <= 0 || shard.scale <= 0) continue;

            const localCenterX =
                -this.width / 2 +
                (shard.sx + shard.sw * 0.5) * widthScale;

            const localCenterY =
                -this.height / 2 +
                (shard.sy + shard.sh * 0.5) * heightScale;

            const dx = localCenterX + shard.offsetX;
            const dy = localCenterY + shard.offsetY;

            const dw = shard.sw * widthScale * shard.scale;
            const dh = shard.sh * heightScale * shard.scale;

            context.save();
            context.globalAlpha = shard.alpha;
            context.translate(dx, dy);
            context.rotate(shard.rotation);

            const r = Math.min(dw, dh) * 0.5;
            context.beginPath();
            context.arc(0, 0, r, 0, Math.PI * 2);
            context.clip();

            context.drawImage(
                this.image,
                baseSx + shard.sx,
                baseSy + shard.sy,
                shard.sw,
                shard.sh,
                -dw / 2,
                -dh / 2,
                dw,
                dh
            );

            context.restore();
        }

        context.save();
        context.globalCompositeOperation = 'lighter';

        for (const p of this.orbParticles) {
            if (this.timer < p.delay) continue;
            if (p.alpha <= 0.01 || p.radius <= 0.1) continue;

            const glowR = p.radius * 3.8;

            const gradient = context.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, glowR
            );

            gradient.addColorStop(0, `rgba(${this.orbCoreColor}, ${Math.min(1, p.alpha)})`);
            gradient.addColorStop(0.20, `rgba(${this.orbGlowColor}, ${Math.min(1, p.alpha * 0.95)})`);
            gradient.addColorStop(1, `rgba(${this.orbGlowColor}, 0)`);

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
        context.restore();
    }
}

export class BallParticleBurstCollision {
    constructor(game, x, y, options = {}) {
        this.game = game;

        this.x = x;
        this.y = y;

        this.followTarget = options.followTarget ?? null;

        this.color = options.color ?? "magenta";
        this.count = options.count ?? 24;
        this.minRadius = options.minRadius ?? 2;
        this.maxRadius = options.maxRadius ?? 6;

        this.duration = options.duration ?? 520;
        this.timer = 0;
        this.markedForDeletion = false;

        this.scrollsWithWorld = options.scrollsWithWorld ?? true;

        this.minSpeed = options.minSpeed ?? 2.5;
        this.maxSpeed = options.maxSpeed ?? 7.5;

        this.gravity = options.gravity ?? 0.35;
        this.drag = options.drag ?? 0.985;

        this.angle = options.angle ?? (-Math.PI / 2);
        this.spread = options.spread ?? (Math.PI * 0.95);

        this.spawnJitter = options.spawnJitter ?? 3;

        this.fadeStart = options.fadeStart ?? 0.25;

        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            const a =
                this.angle +
                (Math.random() - 0.5) * this.spread;

            const speed =
                this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);

            const r =
                this.minRadius + Math.random() * (this.maxRadius - this.minRadius);

            const jx = (Math.random() - 0.5) * this.spawnJitter;
            const jy = (Math.random() - 0.5) * this.spawnJitter;

            this.particles.push({
                x: jx,
                y: jy,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                r,
                baseAlpha: 0.85 + Math.random() * 0.15,
                drawAlpha: 1,
            });
        }
    }

    _centerFromTarget(t) {
        const cx = (t.x ?? 0) + (t.width ?? 0) * 0.5;
        const cy = (t.y ?? 0) + (t.height ?? 0) * 0.5;
        return { cx, cy };
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);

        if (this.followTarget && !this.followTarget.markedForDeletion) {
            const { cx, cy } = this._centerFromTarget(this.followTarget);
            this.x = cx;
            this.y = cy;
        } else if (this.scrollsWithWorld) {
            this.x -= this.game.speed * dt;
        }

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        let fade = 1;
        if (t >= this.fadeStart) {
            const ft = (t - this.fadeStart) / (1 - this.fadeStart);
            fade = Math.max(0, 1 - ft);
        }

        for (const p of this.particles) {
            p.vx *= Math.pow(this.drag, dt);
            p.vy *= Math.pow(this.drag, dt);
            p.vy += this.gravity * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            p.drawAlpha = p.baseAlpha * fade;
        }

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.particles.length) return;

        context.save();
        context.translate(this.x, this.y);

        context.fillStyle = this.color;

        for (const p of this.particles) {
            if (p.drawAlpha <= 0) continue;

            context.globalAlpha = p.drawAlpha;
            context.beginPath();
            context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }
}
