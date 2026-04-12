import {
    ElyvorgCutscene,
    Map7ElyvorgIngameCutsceneBeforeFight,
    Map7ElyvorgIngameCutsceneAfterFight,
} from '../../game/cutscene/elyvorgCutscenes.js';
import * as fading from '../../game/animations/fading.js';

jest.useFakeTimers();

const createBaseGame = () => {
    const noop = jest.fn();

    return {
        canvas: {},
        width: 1920,
        height: 1080,
        gameHeight: 1080,
        coins: 0,
        winningCoins: 100,
        currentMap: 'Map7',
        input: { keys: [] },

        player: {
            currentState: 'foo',
            states: Array.from({ length: 10 }, (_, i) => `s${i}`),
            setState: jest.fn(),
        },

        menu: {
            pause: { isPaused: false },
            audioSettings: Symbol('settings'),
            wardrobe: {
                defaultSkin: 'default',
                hatSkin: 'hat',
                choloSkin: 'cholo',
                zabkaSkin: 'zabka',
                shinySkin: 'shiny',
                currentSkin: 'default',
            },
        },

        currentMenu: null,
        enterDuringBackgroundTransition: true,
        maxDistance: 0,
        cutsceneActive: false,
        talkToPenguin: false,
        shakeActive: false,

        background: {
            totalDistanceTraveled: 42,
            resetLayersByImageIds: jest.fn(),
            constructor: { name: 'Map7' },
        },

        audioHandler: {
            cutsceneSFX: {
                playSound: noop,
                stopAllSounds: noop,
                fadeOutAndStop: noop,
            },
            cutsceneDialogue: {
                playSound: noop,
                stopSound: noop,
                stopAllSounds: noop,
                pauseSound: noop,
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
                stopAllSounds: noop,
            },
        },

        endCutscene: jest.fn(),
        cutscenes: [],

        boss: {
            id: 'elyvorg',
            current: {},
            talkToBoss: true,
            preFight: false,
            postFight: false,
            inFight: false,
            progressComplete: false,
            runAway: false,
            isVisible: true,
        },
    };
};

const createMapGame = (overrides = {}) => {
    const base = createBaseGame();

    return {
        ...base,
        ...overrides,
        menu: {
            ...base.menu,
            ...(overrides.menu || {}),
            wardrobe: {
                ...base.menu.wardrobe,
                ...((overrides.menu && overrides.menu.wardrobe) || {}),
            },
        },
        background: {
            ...base.background,
            ...(overrides.background || {}),
        },
        audioHandler: {
            ...base.audioHandler,
            ...(overrides.audioHandler || {}),
        },
        player: {
            ...base.player,
            ...(overrides.player || {}),
        },
        boss: {
            ...base.boss,
            ...(overrides.boss || {}),
        },
        input: {
            ...base.input,
            ...(overrides.input || {}),
        },
    };
};

beforeAll(() => {
    if (!document.getElementById) {
        document.getElementById = jest.fn(() => ({}));
    } else {
        jest.spyOn(document, 'getElementById').mockImplementation(() => ({}));
    }
});

afterAll(() => {
    if (document.getElementById.mockRestore) {
        document.getElementById.mockRestore();
    }
});

describe('ElyvorgCutscene', () => {
    let game;
    let cut;

    beforeEach(() => {
        game = createBaseGame();

        jest.spyOn(fading, 'fadeInAndOut').mockImplementation((canvas, fadeIn, stayBlack, fadeOut, cb) => {
            if (cb) cb();
        });

        cut = new ElyvorgCutscene(game);
        cut.dialogue = [
            { dialogue: 'Hello...', onAdvance: jest.fn() },
            { dialogue: 'Goodbye.' },
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('uses Elyvorg boss metadata', () => {
        expect(cut.getBossId()).toBe('elyvorg');
        expect(cut.getBattleTheme()).toBe('elyvorgBattleTheme');
        expect(cut.getResetLayerImageIds()).toEqual([
            'map7spikeStones',
            'map7cactus',
            'map7rocks1',
            'map7rocks3',
        ]);
        expect(cut.shouldRemoveBossAfterPostFight()).toBe(false);
    });

    it('runs current dialogue onAdvance, updates player state, and advances to the next dialogue state correctly', () => {
        cut.textIndex = cut.dialogue[0].dialogue.length;
        cut.dialogueIndex = 0;
        game.player.currentState = 'not-s8';

        cut.enterOrLeftClick();

        expect(cut.dialogue[0].onAdvance).toHaveBeenCalled();
        expect(game.player.setState).toHaveBeenCalledWith(8, 0);
        expect(cut.playSound2OnDotPause).toBe(false);
        expect(cut.dialogueIndex).toBe(1);
        expect(cut.textIndex).toBe(0);
        expect(cut.isEnterPressed).toBe(false);
    });

    it('does not change player state when already in state 8', () => {
        game.player.currentState = game.player.states[8];
        cut.dialogueIndex = 0;
        cut.textIndex = 0;

        cut.enterOrLeftClick();

        expect(game.player.setState).not.toHaveBeenCalled();
    });

    describe('enterOrLeftClick text progression', () => {
        beforeEach(() => {
            cut.dialogue = [
                { dialogue: 'One' },
                { dialogue: 'Two' },
            ];
            cut.dialogueIndex = 0;
            cut.textIndex = 0;
        });

        it('continueDialogue branch advances one character and clears the flag', () => {
            cut.continueDialogue = true;
            cut.textIndex = 2;

            cut.enterOrLeftClick();

            expect(cut.pause).toBe(false);
            expect(cut.textIndex).toBe(3);
            expect(cut.continueDialogue).toBe(false);
        });

        it('jumps to end when no punctuation dots are present', () => {
            cut.dialogue = [{ dialogue: 'Hello' }];
            cut.dialogueIndex = 0;
            cut.textIndex = 1;

            cut.enterOrLeftClick();

            expect(cut.textIndex).toBe(5);
        });

        it('jumps to the next dot when dialogue contains ellipses', () => {
            cut.dialogue = [{ dialogue: 'A...B' }];
            cut.dialogueIndex = 0;
            cut.textIndex = 0;

            cut.enterOrLeftClick();

            expect(cut.textIndex).toBe(1);
        });

        it('advances to the next dialogue when current line is already fully revealed', () => {
            cut.textIndex = cut.dialogue[0].dialogue.length;
            cut.dialogueIndex = 0;
            cut.lastSound2Played = true;

            cut.enterOrLeftClick();

            expect(cut.dialogueIndex).toBe(1);
            expect(cut.textIndex).toBe(0);
            expect(cut.fullWordsColor).toEqual(['Two']);
            expect(cut.lastSound2Played).toBe(false);
        });
    });

    describe('final branch: pre-fight', () => {
        beforeEach(() => {
            game.boss.preFight = true;
            game.boss.current = {};
            cut.dialogueIndex = 1;
            cut.textIndex = cut.dialogue[1].dialogue.length;

            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');
        });

        it('plays battleStarting SFX, then begins the boss fight after 3 seconds', () => {
            cut.enterOrLeftClick();

            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(game.audioHandler.cutsceneSFX.playSound).toHaveBeenCalledWith('battleStarting');

            jest.advanceTimersByTime(3000);

            expect(game.background.resetLayersByImageIds).toHaveBeenCalledWith([
                'map7spikeStones',
                'map7cactus',
                'map7rocks1',
                'map7rocks3',
            ]);
            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.boss.talkToBoss).toBe(false);
            expect(game.boss.preFight).toBe(false);
            expect(game.boss.inFight).toBe(true);
            expect(game.boss.progressComplete).toBe(true);
            expect(game.cutscenes).toEqual([]);
            expect(game.audioHandler.mapSoundtrack.playSound).toHaveBeenCalledWith('elyvorgBattleTheme', true);
        });
    });

    describe('final branch: post-fight', () => {
        beforeEach(() => {
            game.boss.postFight = true;
            game.boss.current = {};
            cut.dialogueIndex = 1;
            cut.textIndex = cut.dialogue[1].dialogue.length;

            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'onPostFightFinished');
        });

        it('ends the cutscene, makes the boss run away, and updates maxDistance', () => {
            cut.enterOrLeftClick();

            expect(game.endCutscene).toHaveBeenCalled();
            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(game.cutscenes).toEqual([]);
            expect(game.boss.talkToBoss).toBe(false);
            expect(game.boss.postFight).toBe(false);
            expect(game.boss.runAway).toBe(true);
            expect(game.maxDistance).toBe(47);
            expect(cut.onPostFightFinished).toHaveBeenCalled();
        });
    });

    it('resets isEnterPressed via interval once the line is fully revealed', () => {
        cut.dialogue = [{ dialogue: 'X' }];
        cut.dialogueIndex = 0;
        cut.textIndex = 1;
        cut.isEnterPressed = true;

        cut.enterOrLeftClick();

        jest.advanceTimersByTime(100);

        expect(cut.isEnterPressed).toBe(false);
    });

    it('finishPostFightWithBossRemoval removes the boss and updates distance', () => {
        class RemovingElyvorgCutscene extends ElyvorgCutscene {
            shouldRemoveBossAfterPostFight() {
                return true;
            }
        }

        const removeGame = createBaseGame();
        removeGame.boss.postFight = true;
        removeGame.boss.current = { markedForDeletion: false };

        const removeCut = new RemovingElyvorgCutscene(removeGame);
        removeCut.dialogue = [{ dialogue: 'Done.' }];
        removeCut.dialogueIndex = 0;
        removeCut.textIndex = 5;

        jest.spyOn(removeCut, 'removeEventListeners');
        jest.spyOn(removeCut, 'onPostFightFinished');

        removeCut.enterOrLeftClick();

        expect(removeCut.removeEventListeners).toHaveBeenCalled();
        expect(removeGame.enterDuringBackgroundTransition).toBe(true);
        expect(removeGame.input.keys).toEqual([]);
        expect(removeGame.endCutscene).toHaveBeenCalled();
        expect(removeGame.cutscenes).toEqual([]);

        jest.advanceTimersByTime(470);

        expect(removeGame.boss.current).toBeNull();
        expect(removeGame.boss.isVisible).toBe(false);
        expect(removeGame.maxDistance).toBe(47);
        expect(removeCut.onPostFightFinished).toHaveBeenCalled();
    });

    describe('displayDialogue event handling', () => {
        beforeEach(() => {
            jest.spyOn(cut, 'enterOrLeftClick');
            cut.dialogue = [{ dialogue: 'Hi' }];
            cut.displayDialogue();
        });

        it('pressing Enter invokes enterOrLeftClick when allowed', () => {
            cut.isEnterPressed = false;

            cut.handleKeyDown({ key: 'Enter' });

            expect(cut.enterOrLeftClick).toHaveBeenCalled();
        });

        it('left click invokes enterOrLeftClick when allowed', () => {
            cut.isEnterPressed = false;

            cut.handleLeftClick();

            expect(cut.enterOrLeftClick).toHaveBeenCalled();
        });

        it('Tab in pre-fight skips to the last dialogue and starts battle after 3 seconds', () => {
            game.boss.preFight = true;
            game.boss.current = {};
            cut.dialogue = [
                { dialogue: 'First' },
                { dialogue: 'Middle' },
                { dialogue: 'Last' },
            ];

            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');

            const preventDefault = jest.fn();

            cut.displayDialogue();
            cut.handleKeyDown({ key: 'Tab', preventDefault });

            expect(preventDefault).toHaveBeenCalled();
            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.stopSound).toHaveBeenCalledWith('bit1');
            expect(game.audioHandler.cutsceneSFX.playSound).toHaveBeenCalledWith('battleStarting');

            jest.advanceTimersByTime(3000);

            expect(cut.dialogueIndex).toBe(2);
            expect(game.boss.inFight).toBe(true);
            expect(game.boss.talkToBoss).toBe(false);
            expect(game.boss.preFight).toBe(false);
            expect(game.cutscenes).toEqual([]);
            expect(game.audioHandler.mapSoundtrack.playSound).toHaveBeenCalledWith('elyvorgBattleTheme', true);
        });

        it('Tab in post-fight before the last dialogue skips to the final dialogue', () => {
            game.boss.postFight = true;
            game.boss.current = {};
            cut.dialogue = [
                { dialogue: 'First' },
                { dialogue: 'Middle' },
                { dialogue: 'Last' },
            ];
            cut.dialogueIndex = 0;

            jest.spyOn(cut, 'transitionWithBg').mockImplementation(({ beforeFade, onBlack }) => {
                beforeFade();
                onBlack();
            });

            const preventDefault = jest.fn();

            cut.displayDialogue();
            cut.handleKeyDown({ key: 'Tab', preventDefault });

            expect(preventDefault).toHaveBeenCalled();
            expect(cut.transitionWithBg).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.stopSound).toHaveBeenCalledWith('bit1');
            expect(cut.dialogueIndex).toBe(2);
        });

        it('Tab does nothing when boss does not match Elyvorg', () => {
            game.boss.id = 'someOtherBoss';
            game.boss.preFight = true;

            const spySkip = jest.spyOn(cut, 'skipPreFightAndStartBattle');

            cut.handleKeyDown({ key: 'Tab', preventDefault: jest.fn() });

            expect(spySkip).not.toHaveBeenCalled();
        });

        it('does not trigger Enter or click while paused, in settings, or when transition is disabled', () => {
            cut.handleKeyDown({ key: 'Enter' });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = true;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick();
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = false;
            game.currentMenu = game.menu.audioSettings;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick();
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.currentMenu = null;
            game.enterDuringBackgroundTransition = false;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick();
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);
        });
    });
});

describe('Map7ElyvorgIngameCutsceneBeforeFight', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = createMapGame();
        cutscene = new Map7ElyvorgIngameCutsceneBeforeFight(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('inherits ElyvorgCutscene interaction methods', () => {
        expect(typeof cutscene.enterOrLeftClick).toBe('function');
        expect(typeof cutscene.displayDialogue).toBe('function');
    });

    it('uses Elyvorg boss metadata', () => {
        expect(cutscene.getBossId()).toBe('elyvorg');
        expect(cutscene.getBattleTheme()).toBe('elyvorgBattleTheme');
    });

    it('registers exactly 29 dialogues', () => {
        expect(cutscene.dialogue.length).toBe(29);
    });

    it('first dialogue is Firedog recognizing the hooded individual', () => {
        expect(cutscene.dialogue[0].dialogue).toBe(`A hooded individual- So it's you...`);
    });

    it('dialogue 1 starts crypticTokenDarkAmbienceSound', () => {
        jest.spyOn(cutscene, 'playMusic');

        cutscene.dialogue[1].onAdvance();

        expect(cutscene.playMusic).toHaveBeenCalledWith('crypticTokenDarkAmbienceSound', true);
    });

    it('dialogue 5 fades out crypticTokenDarkAmbienceSound', () => {
        jest.spyOn(cutscene, 'fadeOutMusic');

        cutscene.dialogue[5].onAdvance();

        expect(cutscene.fadeOutMusic).toHaveBeenCalledWith('crypticTokenDarkAmbienceSound');
    });

    it('dialogues 12, 15, and 17 trigger the dream transition sequence', () => {
        [12, 15, 17].forEach((idx) => {
            jest.spyOn(cutscene, 'playSFX');
            jest.spyOn(cutscene, 'removeEventListeners');
            jest.spyOn(cutscene, 'cutsceneBackgroundChange');
            jest.spyOn(cutscene, 'addEventListeners');

            cutscene.dialogue[idx].onAdvance();

            expect(cutscene.playSFX).toHaveBeenCalledWith('dreamSound');
            expect(cutscene.removeEventListeners).toHaveBeenCalled();
            expect(cutscene.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 500, 500);

            jest.advanceTimersByTime(1000);

            expect(cutscene.addEventListeners).toHaveBeenCalled();

            jest.clearAllMocks();
            jest.clearAllTimers();
        });
    });

    it('dialogues 14, 15, 17, 19, 20, 21, and 22 are whisper dialogues where expected', () => {
        [14, 15, 17, 19, 20, 21, 22].forEach((idx) => {
            expect(cutscene.dialogue[idx].whisper).toBe(true);
        });

        expect(cutscene.dialogue[13].whisper).not.toBe(true);
        expect(cutscene.dialogue[18].whisper).not.toBe(true);
        expect(cutscene.dialogue[23].whisper).not.toBe(true);
    });
});

describe('Map7ElyvorgIngameCutsceneAfterFight', () => {
    let game;
    let cutscene;

    beforeEach(() => {
        game = createMapGame();
        cutscene = new Map7ElyvorgIngameCutsceneAfterFight(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('inherits ElyvorgCutscene interaction methods', () => {
        expect(typeof cutscene.enterOrLeftClick).toBe('function');
        expect(typeof cutscene.displayDialogue).toBe('function');
    });
});