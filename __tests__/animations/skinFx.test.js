import { drawSkinFx, hasSkinFx, getSkinFxTint, SKIN_FX_CHANNEL_MENU } from '../../game/animations/skinFx';
import { drawRainbowSkin } from '../../game/animations/rainbowFx';

jest.mock('../../game/animations/rainbowFx', () => ({
    RAINBOW_FX: 'rainbow',
    RAINBOW_FROZEN_MS: 3000,
    drawRainbowSkin: jest.fn(() => true),
    getRainbowTintColor: jest.fn(() => 'rgba(1,2,3,1)'),
}));

jest.mock('../../game/config/skinsAndCosmetics.js', () => ({
    getSkinFxId: jest.fn((key) => (key === 'rainbowSkin' ? 'rainbow' : null)),
}));

jest.mock('../../game/utils/spriteCache.js', () => ({
    getContentBox: jest.fn(() => ({ x0: 0, y0: 0.3, x1: 1, y1: 1 })),
}));

const img = { id: 'rainbowSkin' };
const ctx = {};

describe('skinFx dispatch', () => {
    beforeEach(() => jest.clearAllMocks());

    it('does nothing for a skin without an effect', () => {
        expect(drawSkinFx(ctx, 'defaultSkin', { img })).toBe(false);
        expect(drawRainbowSkin).not.toHaveBeenCalled();
    });

    it('draws for a skin that has one', () => {
        expect(drawSkinFx(ctx, 'rainbowSkin', { img })).toBe(true);
        expect(drawRainbowSkin).toHaveBeenCalled();
    });

    it('reports which skins carry an effect', () => {
        expect(hasSkinFx('rainbowSkin')).toBe(true);
        expect(hasSkinFx('defaultSkin')).toBe(false);
    });

    it('turns freeze into a held instant', () => {
        drawSkinFx(ctx, 'rainbowSkin', { img, freeze: true });
        expect(drawRainbowSkin).toHaveBeenCalledWith(ctx, expect.objectContaining({ freezeMs: 3000 }));

        drawSkinFx(ctx, 'rainbowSkin', { img });
        expect(drawRainbowSkin).toHaveBeenLastCalledWith(ctx, expect.objectContaining({ freezeMs: null }));
    });

    it('measures the content box for portrait art only', () => {
        drawSkinFx(ctx, 'rainbowSkin', { img, art: 'portrait' });
        expect(drawRainbowSkin).toHaveBeenCalledWith(
            ctx,
            expect.objectContaining({ art: 'portrait', content: { x0: 0, y0: 0.3, x1: 1, y1: 1 } })
        );

        drawSkinFx(ctx, 'rainbowSkin', { img, art: 'sprite' });
        expect(drawRainbowSkin).toHaveBeenLastCalledWith(ctx, expect.objectContaining({ content: null }));
    });

    it('gives a stand-in tint only for skins with an effect', () => {
        expect(getSkinFxTint('rainbowSkin', SKIN_FX_CHANNEL_MENU)).toBe('rgba(1,2,3,1)');
        expect(getSkinFxTint('defaultSkin')).toBeNull();
    });
});
