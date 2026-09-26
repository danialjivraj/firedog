const BASE_DURATION_MS = 520;
const EXTRA_DURATION_PER_LEAF = 0.18;
const RIFFLE_STAGGER = 0.14;
const MAX_LEAVES = 4;
const STRIP_COUNT = 56;
const MAX_BEND = 0.95;
const PERSPECTIVE = 0.045;
const MAX_SHADE = 0.55;
const GUTTER_SHADOW = 0.32;
const STRIP_OVERLAP = 0.5;

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function clamp01(t) {
    return t < 0 ? 0 : (t > 1 ? 1 : t);
}

let offscreenSupported = null;

function createOffscreen(w, h) {
    if (offscreenSupported === false) return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w));
    canvas.height = Math.max(1, Math.round(h));

    let ctx = null;
    try {
        ctx = canvas.getContext('2d');
    } catch (err) {
        ctx = null;
    }

    offscreenSupported = !!ctx;
    return ctx ? { canvas, ctx } : null;
}

export class BookPageFlip {
    constructor(book) {
        this.book = book;
        this.pool = [];
        this.offscreenBlocked = false;
        this.reset();
    }

    reset() {
        this.running = false;
        this.progress = 0;
        this.direction = 1;
        this.durationMs = BASE_DURATION_MS;
        this.leaves = [];
        this.staticLeftIndex = 0;
        this.staticRightIndex = 1;
        this.toIndex = -1;
        this.category = null;
    }

    isActive() {
        if (!this.running) return false;
        if (this.toIndex !== this.book.currentPage || this.category !== this.book.category) {
            this.reset();
            return false;
        }
        return true;
    }

    ensurePool(count) {
        if (this.offscreenBlocked) return null;

        const w = Math.round(this.book.pageWidth);
        const h = Math.round(this.book.pageHeight);

        if (this.pool.length && (this.pool[0].canvas.width !== w || this.pool[0].canvas.height !== h)) {
            this.pool = [];
        }

        while (this.pool.length < count) {
            const made = createOffscreen(w, h);
            if (!made) {
                this.offscreenBlocked = true;
                this.pool = [];
                return null;
            }
            this.pool.push(made);
        }

        return this.pool;
    }

    start(fromIndex, toIndex) {
        const delta = toIndex - fromIndex;

        if (delta === 0 || delta % 2 !== 0) {
            this.reset();
            return false;
        }

        const spreads = Math.abs(delta) / 2;
        const leafCount = Math.min(MAX_LEAVES, spreads);

        const pool = this.ensurePool(leafCount * 2);
        if (!pool) return false;

        const forward = delta > 0;

        const spreadAt = (i) => fromIndex + Math.round((delta / 2) * (i / leafCount)) * 2;

        const frontSide = forward ? 'right' : 'left';
        const backSide = forward ? 'left' : 'right';

        const leaves = [];
        try {
            for (let i = 0; i < leafCount; i++) {
                const here = spreadAt(i);
                const next = spreadAt(i + 1);

                const front = pool[i * 2];
                const back = pool[i * 2 + 1];

                this.paintFace(front, forward ? here + 1 : here, frontSide);
                this.paintFace(back, forward ? next : next + 1, backSide);

                leaves.push({ front, back, offset: i * RIFFLE_STAGGER });
            }
        } catch (err) {
            this.offscreenBlocked = true;
            this.pool = [];
            this.reset();
            return false;
        }

        this.running = true;
        this.progress = 0;
        this.direction = forward ? 1 : -1;
        this.durationMs = BASE_DURATION_MS * (1 + EXTRA_DURATION_PER_LEAF * (leafCount - 1));
        this.leaves = leaves;

        this.staticLeftIndex = forward ? fromIndex : toIndex;
        this.staticRightIndex = forward ? toIndex + 1 : fromIndex + 1;

        this.toIndex = toIndex;
        this.category = this.book.category;
        return true;
    }

    paintFace(face, pageIndex, side) {
        face.ctx.setTransform(1, 0, 0, 1, 0, 0);
        face.ctx.clearRect(0, 0, face.canvas.width, face.canvas.height);
        this.book.renderPageFace(face.ctx, pageIndex, side);
    }

    update(deltaTime) {
        if (!this.isActive()) return;

        const dt = Number.isFinite(deltaTime) && deltaTime > 0 ? Math.min(deltaTime, 100) : 16.7;
        this.progress += dt / this.durationMs;

        if (this.progress >= 1) this.reset();
    }

    leafProgress(leaf) {
        const span = Math.max(1e-3, 1 - RIFFLE_STAGGER * (this.leaves.length - 1));
        return clamp01((clamp01(this.progress) - leaf.offset) / span);
    }

    draw(context) {
        if (!this.isActive()) return;
        if (!this.leaves.length) return;

        const book = this.book;
        const pageW = book.pageWidth;
        const pageH = book.pageHeight;
        const spineX = book.bookX + pageW;

        const states = this.leaves.map((leaf, index) => {
            const t = this.leafProgress(leaf);
            return { leaf, index, t, theta: Math.PI * smoothstep(t) };
        });

        context.save();

        context.beginPath();
        context.rect(book.bookX, book.bookY - 14, pageW * 2, pageH + 28);
        context.clip();

        const lift = states.reduce((max, s) => Math.max(max, Math.sin(s.theta)), 0);
        if (lift > 0.01) {
            const reach = pageW * 0.5;
            const gradient = context.createLinearGradient(spineX - reach, 0, spineX + reach, 0);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, `rgba(0, 0, 0, ${GUTTER_SHADOW * lift})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            context.fillStyle = gradient;
            context.fillRect(spineX - reach, book.bookY, reach * 2, pageH);
        }

        const landed = states.filter(s => s.t > 0.5).sort((a, b) => a.index - b.index);
        const rising = states.filter(s => s.t <= 0.5).sort((a, b) => b.index - a.index);

        for (const state of landed) this.drawLeaf(context, state);
        for (const state of rising) this.drawLeaf(context, state);

        context.restore();
    }

    drawLeaf(context, state) {
        const book = this.book;
        const pageW = book.pageWidth;
        const pageH = book.pageHeight;
        const spineX = book.bookX + pageW;
        const centerY = book.bookY + pageH / 2;
        const dir = this.direction;

        const theta = state.theta;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const bend = Math.max(1e-4, MAX_BEND * sinTheta);

        const screenX = (u) => spineX + dir * pageW * (Math.sin(theta + bend * u) - sinTheta) / bend;
        const depthAt = (u) => pageW * (cosTheta - Math.cos(theta + bend * u)) / bend;

        for (let i = 0; i < STRIP_COUNT; i++) {
            const u0 = i / STRIP_COUNT;
            const u1 = (i + 1) / STRIP_COUNT;
            const uMid = (u0 + u1) / 2;

            const cosPsi = Math.cos(theta + bend * uMid);
            const showingFront = cosPsi >= 0;
            const face = showingFront ? state.leaf.front : state.leaf.back;

            const spineAtLeftEdge = (dir === 1) ? showingFront : !showingFront;
            const srcAt = spineAtLeftEdge ? (u) => pageW * u : (u) => pageW * (1 - u);

            const sx0 = srcAt(u0);
            const sx1 = srcAt(u1);
            const srcX = Math.min(sx0, sx1);
            const srcW = Math.abs(sx1 - sx0);
            if (srcW <= 0) continue;

            const dx0 = screenX(u0);
            const dx1 = screenX(u1);
            const destX = Math.min(dx0, dx1) - STRIP_OVERLAP;
            const destW = Math.abs(dx1 - dx0) + STRIP_OVERLAP * 2;

            const scale = 1 + PERSPECTIVE * Math.max(0, depthAt(uMid)) / pageW;
            const destH = pageH * scale;
            const destY = centerY - destH / 2;

            context.drawImage(
                face.canvas,
                srcX, 0, srcW, face.canvas.height,
                destX, destY, destW, destH,
            );

            const shade = (1 - Math.abs(cosPsi)) * MAX_SHADE;
            if (shade > 0.004) {
                context.fillStyle = `rgba(26, 18, 8, ${shade})`;
                context.fillRect(destX, destY, destW, destH);
            }
        }
    }
}
