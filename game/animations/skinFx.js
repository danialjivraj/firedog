import { getSkinFxId } from '../config/skinsAndCosmetics.js';
import { getContentBox } from '../utils/spriteCache.js';
import {
    RAINBOW_FX,
    RAINBOW_FROZEN_MS,
    drawRainbowSkin,
    getRainbowTintColor,
} from './rainbowFx.js';

export const SKIN_FX_CHANNEL_PLAYER = 'player';
export const SKIN_FX_CHANNEL_MENU = 'menu';

export function hasSkinFx(skinKey) {
    return getSkinFxId(skinKey) === RAINBOW_FX;
}

export function drawSkinFx(ctx, skinKey, opts) {
    if (getSkinFxId(skinKey) !== RAINBOW_FX) return false;

    const art = opts?.art || 'sprite';

    return drawRainbowSkin(ctx, {
        ...opts,
        art,
        freezeMs: opts?.freeze ? RAINBOW_FROZEN_MS : null,
        content: opts?.content
            || (art === 'portrait' ? getContentBox(opts?.img) : null),
    });
}

export function getSkinFxTint(skinKey, channel = SKIN_FX_CHANNEL_PLAYER) {
    if (getSkinFxId(skinKey) !== RAINBOW_FX) return null;
    return getRainbowTintColor(channel);
}
