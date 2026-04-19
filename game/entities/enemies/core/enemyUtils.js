export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
export const angleTo = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
export const moveAlongAngle = (obj, angle, speed, dt = 1) => {
    obj.x += Math.cos(angle) * speed * dt;
    obj.y += Math.sin(angle) * speed * dt;
};
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const withCtx = (ctx, fn) => {
    ctx.save();
    try {
        fn();
    } finally {
        ctx.restore();
    }
};
export const drawSprite = (ctx, image, sx, sy, sw, sh, dx, dy, dw, dh) =>
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
export const setShadow = (ctx, color = 'transparent', blur = 0) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
};
export const getImg = (id) => document.getElementById(id);
