import {
    NTharaxCutscene,
    BonusMap3NTharaxIngameCutsceneBeforeFight,
    BonusMap3NTharaxIngameCutsceneAfterFight,
} from '../../game/cutscene/ntharaxCutscene.js';

const createBaseGame = () => {
    const noop = jest.fn();

    return {
        width: 1920,
        height: 689,
        coins: 42,
        winningCoins: 100,

        player: {
            currentState: 'foo',
            states: Array.from({ length: 10 }, (_, i) => `s${i}`),
            setState: jest.fn(),
        },

        menu: {
            pause: { isPaused: false },
            audioSettings: Symbol('settings'),
            wardrobe: {
                getCurrentSkinId: jest.fn(() => 'defaultSkin'),
                getCurrentCosmeticKey: jest.fn(() => 'none'),
                getCurrentCosmeticsChromaState: jest.fn(() => ({})),
            },
        },

        currentMenu: null,
        enterDuringBackgroundTransition: true,
        canvas: {},

        background: {
            resetLayersByImageIds: jest.fn(),
            totalDistanceTraveled: 100,
            constructor: { name: 'BonusMap3' },
        },

        audioHandler: {
            cutsceneSFX: {
                playSound: noop,
                fadeOutAndStop: noop,
                stopAllSounds: noop,
            },
            cutsceneDialogue: {
                playSound: noop,
                stopSound: noop,
                pauseSound: noop,
                stopAllSounds: noop,
            },
            cutsceneMusic: {
                playSound: noop,
                fadeOutAndStop: noop,
                stopAllSounds: noop,
            },
            mapSoundtrack: {
                playSound: noop,
                fadeOutAndStop: noop,
                stopAllSounds: noop,
            },
            firedogSFX: {
                playSound: noop,
                fadeOutAndStop: noop,
                stopAllSounds: noop,
            },
        },

        input: { keys: [] },
        collisions: [],
        maxDistance: 0,

        endCutscene: jest.fn(),
        cutscenes: [],

        boss: {
            id: 'ntharax',
            current: {},
            talkToBoss: true,
            preFight: false,
            postFight: false,
            inFight: false,
            runAway: false,
            isVisible: true,
            progressComplete: false,
        },

        shakeActive: false,
        cutsceneActive: true,
        talkToPenguin: false,
        ignoreCutsceneInputUntil: 0,
    };
};

describe('NTharaxCutscene', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = createBaseGame();
        cutscene = new NTharaxCutscene(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns ntharax as boss id', () => {
        expect(cutscene.getBossId()).toBe('ntharax');
    });

    it('returns ntharax battle theme', () => {
        expect(cutscene.getBattleTheme()).toBe('ntharaxBattleTheme');
    });

    it('returns the reset layer image ids for the fight', () => {
        expect(cutscene.getResetLayerImageIds()).toEqual([
            'bonusMap3Planets',
        ]);
    });

    it('removes the boss after post-fight', () => {
        expect(cutscene.shouldRemoveBossAfterPostFight()).toBe(true);
    });
});

describe('BonusMap3NTharaxIngameCutsceneBeforeFight', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = createBaseGame();
        cutscene = new BonusMap3NTharaxIngameCutsceneBeforeFight(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('registers exactly 16 dialogues', () => {
        expect(cutscene.dialogue).toHaveLength(16);
    });

    it('inherits NTharaxCutscene interaction methods', () => {
        expect(typeof cutscene.enterOrLeftClick).toBe('function');
        expect(typeof cutscene.displayDialogue).toBe('function');
    });

    it('uses ntharax cutscene boss metadata', () => {
        expect(cutscene.getBossId()).toBe('ntharax');
        expect(cutscene.getBattleTheme()).toBe('ntharaxBattleTheme');
        expect(cutscene.getResetLayerImageIds()).toEqual(['bonusMap3Planets']);
        expect(cutscene.shouldRemoveBossAfterPostFight()).toBe(true);
    });

    it('starts with Firedog noticing the celestial tyrant', () => {
        expect(cutscene.dialogue[0]).toMatchObject({
            character: cutscene.firedog,
            dialogue: 'Wait... is that the celestial tyrant?',
        });
    });

    it('ends with NTharax threatening Firedog and fading out the pre-fight music', () => {
        const last = cutscene.dialogue[15];

        expect(last.character).toBe(cutscene.ntharax);
        expect(last.dialogue).toBe('DIE, AND LET YOUR FALL BE THE FINAL STEP IN MY ASCENT.');
        expect(typeof last.onAdvance).toBe('function');
    });

    it('first dialogue onAdvance starts downADarkPath music', () => {
        const playMusicSpy = jest.spyOn(cutscene, 'playMusic');

        cutscene.dialogue[0].onAdvance();

        expect(playMusicSpy).toHaveBeenCalledWith('downADarkPath', true);
    });

    it('last dialogue onAdvance fades out downADarkPath music', () => {
        const fadeOutMusicSpy = jest.spyOn(cutscene, 'fadeOutMusic');

        cutscene.dialogue[15].onAdvance();

        expect(fadeOutMusicSpy).toHaveBeenCalledWith('downADarkPath');
    });

    it('builds the expected image setup for the opening dialogue', () => {
        const first = cutscene.dialogue[0];

        expect(first.images).toHaveLength(1);
        expect(first.images[0]).toEqual({
            id: cutscene.setfiredogSurprisedBorder(),
            x: 100,
            y: 400,
            width: 200,
            height: 200,
            opts: { border: { talking: true } },
        });
    });

    it('builds the expected image setup for an NTharax talking line', () => {
        const line = cutscene.dialogue[2];

        expect(line.images).toHaveLength(2);
        expect(line.images[0]).toEqual({
            id: cutscene.setfiredogSurprisedBorder(),
            x: 100,
            y: 400,
            width: 200,
            height: 200,
        });
        expect(line.images[1]).toEqual({
            id: 'ntharaxNormalBorder',
            x: 1520,
            y: 400,
            width: 200,
            height: 200,
            opts: { border: { talking: true } },
        });
    });
});

describe('BonusMap3NTharaxIngameCutsceneAfterFight', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = createBaseGame();
        cutscene = new BonusMap3NTharaxIngameCutsceneAfterFight(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('registers exactly 9 dialogues', () => {
        expect(cutscene.dialogue).toHaveLength(9);
    });

    it('inherits NTharaxCutscene interaction methods', () => {
        expect(typeof cutscene.enterOrLeftClick).toBe('function');
        expect(typeof cutscene.displayDialogue).toBe('function');
    });

    it('uses ntharax cutscene boss metadata', () => {
        expect(cutscene.getBossId()).toBe('ntharax');
        expect(cutscene.getBattleTheme()).toBe('ntharaxBattleTheme');
        expect(cutscene.getResetLayerImageIds()).toEqual(['bonusMap3Planets']);
        expect(cutscene.shouldRemoveBossAfterPostFight()).toBe(true);
    });

    it('starts with NTharax reacting to defeat', () => {
        expect(cutscene.dialogue[0]).toMatchObject({
            character: cutscene.ntharax,
            dialogue: 'NO...! THIS CANNOT BE...!',
        });
    });

    it('ends with Firedog reflecting that NTharax is gone for now', () => {
        expect(cutscene.dialogue[8]).toMatchObject({
            character: cutscene.firedog,
            dialogue: `Ugh... that was rough... but at least he's gone... well.. at least for now.`,
        });
    });

    it('builds the expected image setup for the opening post-fight dialogue', () => {
        const first = cutscene.dialogue[0];

        expect(first.images).toHaveLength(2);
        expect(first.images[0]).toEqual({
            id: cutscene.setfiredogNormalBorder(),
            x: 100,
            y: 400,
            width: 200,
            height: 200,
        });
        expect(first.images[1]).toEqual({
            id: 'ntharaxHurtBorder',
            x: 950,
            y: 400,
            width: 200,
            height: 200,
            opts: { border: { talking: true } },
        });
    });

    it('final Firedog line only shows Firedog talking image', () => {
        const last = cutscene.dialogue[8];

        expect(last.images).toHaveLength(1);
        expect(last.images[0]).toEqual({
            id: cutscene.setfiredogTiredBorder(),
            x: 100,
            y: 400,
            width: 200,
            height: 200,
            opts: { border: { talking: true } },
        });
    });

    it('dialogue 5 onAdvance starts ntharax disintegration once, fades out music, and plays poof sfx', () => {
        const startDisintegrationSpy = jest.spyOn(cutscene, 'startCurrentBossDisintegration');
        const playSFXSpy = jest.spyOn(cutscene, 'playSFX');

        cutscene.dialogue[5].onAdvance();

        expect(cutscene.ntharaxDisintegrationStarted).toBe(true);
        expect(startDisintegrationSpy).toHaveBeenCalledTimes(1);
        expect(playSFXSpy).toHaveBeenCalledWith('ntharaxExplosionSound');
    });

    it('dialogue 5 onAdvance does not start ntharax disintegration more than once', () => {
        const startDisintegrationSpy = jest.spyOn(cutscene, 'startCurrentBossDisintegration');

        cutscene.dialogue[5].onAdvance();
        cutscene.dialogue[5].onAdvance();

        expect(startDisintegrationSpy).toHaveBeenCalledTimes(1);
    });

    it('skipPostFightToLastDialogue marks ntharax as cutsceneDisintegrating and jumps to the last dialogue', () => {
        game.boss.postFight = true;
        game.boss.current = {};
        cutscene.dialogueIndex = 3;

        jest.spyOn(cutscene, 'transitionWithBg').mockImplementation(({ beforeFade, onBlack }) => {
            if (beforeFade) beforeFade();
            if (onBlack) onBlack();
        });

        const stopAllAudioSpy = jest.spyOn(cutscene, 'stopAllAudio');
        const jumpToDialogueSpy = jest.spyOn(cutscene, 'jumpToDialogue');

        cutscene.skipPostFightToLastDialogue();

        expect(stopAllAudioSpy).toHaveBeenCalled();
        expect(game.boss.current.cutsceneDisintegrating).toBe(true);
        expect(jumpToDialogueSpy).toHaveBeenCalledWith(cutscene.dialogue.length - 1);
    });

    it('skipPostFightToLastDialogue does not remove ntharax immediately', () => {
        game.boss.postFight = true;
        game.boss.current = {};
        cutscene.dialogueIndex = 2;

        jest.spyOn(cutscene, 'transitionWithBg').mockImplementation(({ beforeFade, onBlack }) => {
            if (beforeFade) beforeFade();
            if (onBlack) onBlack();
        });

        cutscene.skipPostFightToLastDialogue();

        expect(game.boss.current).not.toBeNull();
        expect(game.boss.current.cutsceneDisintegrating).toBe(true);
    });

    it('skipPostFightToLastDialogue leaves ntharax present but in a non-drawing cutsceneDisintegrating state', () => {
        game.boss.postFight = true;
        game.boss.current = {
            cutsceneDisintegrating: false,
            draw: jest.fn(),
        };
        cutscene.dialogueIndex = 2;

        jest.spyOn(cutscene, 'transitionWithBg').mockImplementation(({ beforeFade, onBlack }) => {
            if (beforeFade) beforeFade();
            if (onBlack) onBlack();
        });

        cutscene.skipPostFightToLastDialogue();

        expect(game.boss.current).not.toBeNull();
        expect(game.boss.current.cutsceneDisintegrating).toBe(true);
    });
});