import {
    GlacikalCutscene,
    BonusMap1GlacikalIngameCutsceneBeforeFight,
    BonusMap1GlacikalIngameCutsceneAfterFight
} from '../../game/cutscene/glacikalCutscenes.js';
import * as fading from '../../game/animations/fading.js';

jest.useFakeTimers();

const createBaseGame = () => {
    const noop = jest.fn();
    return {
        player: {
            currentState: 'foo',
            states: Array.from({ length: 10 }, (_, i) => `s${i}`),
            setState: jest.fn(),
        },
        menu: {
            pause: { isPaused: false },
            audioSettings: Symbol('settings'),
        },
        currentMenu: null,
        enterDuringBackgroundTransition: true,
        canvas: {},

        audioHandler: {
            cutsceneSFX: { playSound: noop, stopAllSounds: noop },
            cutsceneDialogue: { playSound: noop, stopAllSounds: noop },
            cutsceneMusic: {
                playSound: noop,
                fadeOutAndStop: noop,
                stopAllSounds: noop,
            },
            mapSoundtrack: {
                playSound: noop,
                fadeOutAndStop: noop,
            },
            firedogSFX: { playSound: noop },
        },

        input: { keys: ['a'] },
        background: { totalDistanceTraveled: 100 },
        maxDistance: 0,

        endCutscene: jest.fn(),
        cutscenes: [],
        boss: {
            id: 'glacikal',
            current: {},
            talkToBoss: true,
            preFight: false,
            postFight: false,
            inFight: false,
            runAway: false,
            isVisible: true,
            progressComplete: false,
        },
    };
};

const createMap = (overrides = {}) => ({
    menu: {
        skins: {
            defaultSkin: 'default',
            hatSkin: 'hat',
            choloSkin: 'cholo',
            zabkaSkin: 'zabka',
            shinySkin: 'shiny',
            currentSkin: 'default',
        },
    },
    ...overrides,
});

describe('GlacikalCutscene', () => {
    let game, cut;

    beforeEach(() => {
        game = createBaseGame();

        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((canvas, a, b, c, cb) => cb && cb());

        cut = new GlacikalCutscene(game);

        cut.dialogue = [
            { dialogue: 'Hello...' },
            { dialogue: 'Goodbye.' },
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('invokes cutsceneController, updates player state, and sets flags', () => {
        jest.spyOn(cut, 'cutsceneController');
        cut.textIndex = cut.dialogue[0].dialogue.length;
        cut.dialogueIndex = 0;
        game.player.currentState = 'not-s8';

        cut.enterOrLeftClick();

        expect(cut.cutsceneController).toHaveBeenCalled();
        expect(game.player.setState).toHaveBeenCalledWith(8, 0);
        expect(cut.isEnterPressed).toBe(true);
        expect(cut.playSound2OnDotPause).toBe(false);
    });

    it('does not change player state when already in state 8', () => {
        game.player.currentState = game.player.states[8];
        cut.textIndex = 0;
        cut.dialogueIndex = 0;

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

        it('continueDialogue branch advances one character', () => {
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

        it('advances to next dialogue when current line is fully revealed', () => {
            cut.textIndex = cut.dialogue[0].dialogue.length; // 3
            cut.dialogueIndex = 0;
            cut.lastSound2Played = true;

            cut.enterOrLeftClick();

            expect(cut.dialogueIndex).toBe(1);
            expect(cut.textIndex).toBe(0);
            expect(cut.fullWordsColor).toEqual(['Two']);
            expect(cut.lastSound2Played).toBe(false);
        });
    });

    describe('final branch delegation', () => {
        it('calls startBossFight in pre-fight when all dialogue is done', () => {
            game.boss.preFight = true;
            game.boss.postFight = false;
            game.boss.current = {};
            cut.dialogue = [{ dialogue: 'Line' }];
            cut.dialogueIndex = 0;
            cut.textIndex = cut.dialogue[0].dialogue.length;

            const spyStart = jest.spyOn(cut, 'startBossFight');

            cut.enterOrLeftClick();

            expect(spyStart).toHaveBeenCalledWith(game.boss);
        });

        it('calls finishPostFight in post-fight when all dialogue is done', () => {
            game.boss.preFight = false;
            game.boss.postFight = true;
            game.boss.current = {};
            cut.dialogue = [{ dialogue: 'Line' }];
            cut.dialogueIndex = 0;
            cut.textIndex = cut.dialogue[0].dialogue.length;

            const spyFinish = jest.spyOn(cut, 'finishPostFight');

            cut.enterOrLeftClick();

            expect(spyFinish).toHaveBeenCalledWith(game.boss);
        });
    });

    describe('startBossFight()', () => {
        beforeEach(() => {
            game.boss.preFight = true;
            game.boss.current = {};
        });

        it('plays battleStarting and after 3s starts fight and ends cutscene', () => {
            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');

            cut.startBossFight(game.boss);

            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('battleStarting');

            jest.advanceTimersByTime(3000);

            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.boss.talkToBoss).toBe(false);
            expect(game.boss.preFight).toBe(false);
            expect(game.boss.inFight).toBe(true);
            expect(game.boss.progressComplete).toBe(true);
            expect(game.cutscenes).toEqual([]);
            expect(game.audioHandler.mapSoundtrack.playSound)
                .toHaveBeenCalledWith('elyvorgBattleTheme', true);
        });
    });

    describe('finishPostFight()', () => {
        beforeEach(() => {
            game.boss.postFight = true;
            game.boss.current = {};
            game.input.keys = ['x', 'y'];
            game.enterDuringBackgroundTransition = true;
        });

        it('cleans up boss, updates maxDistance, and uses fadeInAndOut', () => {
            const boss = game.boss;
            const enemy = boss.current;

            jest.spyOn(cut, 'removeEventListeners');

            cut.finishPostFight(boss);

            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(game.enterDuringBackgroundTransition).toBe(true);
            expect(game.input.keys).toEqual([]);
            expect(fading.fadeInAndOut)
                .toHaveBeenCalledWith(game.canvas, 500, 250, 500, expect.any(Function));
            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.cutscenes).toEqual([]);

            jest.advanceTimersByTime(470); // fadeIn - 30

            expect(enemy.markedForDeletion).toBe(true);
            expect(boss.isVisible).toBe(false);
            expect(boss.current).toBeNull();
            expect(game.maxDistance).toBe(105); // 100 + 5
        });
    });

    it('resets isEnterPressed via interval when at end of a line', () => {
        cut.dialogue = [{ dialogue: 'X' }];
        cut.dialogueIndex = 0;
        cut.textIndex = 1; // at end
        cut.isEnterPressed = true;

        cut.enterOrLeftClick();

        jest.advanceTimersByTime(100);

        expect(cut.isEnterPressed).toBe(false);
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

        it('left mouse click invokes enterOrLeftClick when allowed', () => {
            cut.isEnterPressed = false;

            cut.handleLeftClick({ button: 0 });

            expect(cut.enterOrLeftClick).toHaveBeenCalled();
        });

        it('Tab in pre-fight uses skipPreFightAndStartBattle and jumps to last dialogue', () => {
            game.boss.preFight = true;
            game.boss.current = {};
            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');
            jest.spyOn(cut, 'stopAllAudio');

            cut.dialogue = [
                { dialogue: 'First' },
                { dialogue: 'Middle' },
                { dialogue: 'Last' },
            ];
            cut.displayDialogue();

            cut.handleKeyDown({ key: 'Tab' });

            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(cut.stopAllAudio).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('battleStarting');

            jest.advanceTimersByTime(3000);

            expect(game.boss.inFight).toBe(true);
            expect(game.boss.talkToBoss).toBe(false);
            expect(game.boss.preFight).toBe(false);
            expect(game.cutscenes).toEqual([]);
            expect(cut.dialogueIndex).toBe(2);
            expect(game.audioHandler.mapSoundtrack.playSound)
                .toHaveBeenCalledWith('elyvorgBattleTheme', true);
        });

        it('Tab does nothing when not in pre-fight', () => {
            game.boss.preFight = false;
            const spyRemove = jest.spyOn(cut, 'removeEventListeners');
            const spyStopAll = jest.spyOn(cut, 'stopAllAudio');

            cut.handleKeyDown({ key: 'Tab' });

            expect(spyRemove).not.toHaveBeenCalled();
            expect(spyStopAll).not.toHaveBeenCalled();
        });

        it('does not trigger Enter/Click handlers when paused, in settings, or transition disabled', () => {
            cut.handleKeyDown({ key: 'Enter' });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = true;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick({ button: 0 });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = false;
            game.currentMenu = game.menu.audioSettings;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick({ button: 0 });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.currentMenu = null;
            game.enterDuringBackgroundTransition = false;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick({ button: 0 });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('cutsceneController()', () => {
        beforeEach(() => {
            cut.dialogue = Array.from({ length: 40 }, () => ({ dialogue: 'X' }));
            cut.textIndex = 1;
            game.boss.preFight = false;
            game.boss.postFight = false;
        });

        it('does nothing when not in pre/post-fight modes', () => {
            Object.values(game.audioHandler).forEach(h => {
                if (h.playSound) h.playSound.mockClear();
                if (h.fadeOutAndStop) h.fadeOutAndStop.mockClear();
            });

            cut.cutsceneController();

            Object.values(game.audioHandler).forEach(h => {
                if (h.playSound) expect(h.playSound).not.toHaveBeenCalled();
                if (h.fadeOutAndStop) expect(h.fadeOutAndStop).not.toHaveBeenCalled();
            });
        });

        describe('pre-fight ambience & dream scenes', () => {
            beforeEach(() => {
                game.boss.preFight = true;
                game.boss.current = {};
                cut.textIndex = cut.dialogue[0].dialogue.length;
            });

            it('dialogueIndex 1 starts dark ambience', () => {
                cut.dialogueIndex = 1;

                cut.cutsceneController();

                expect(game.audioHandler.mapSoundtrack.playSound)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame', true);
            });

            it('dialogueIndex 5 fades out dark ambience', () => {
                cut.dialogueIndex = 5;

                cut.cutsceneController();

                expect(game.audioHandler.mapSoundtrack.fadeOutAndStop)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame');
            });

            [12, 15, 17].forEach(idx => {
                it(`dialogueIndex ${idx} triggers dream sound and background change`, () => {
                    jest.spyOn(cut, 'removeEventListeners');
                    jest.spyOn(cut, 'addEventListeners');
                    jest.spyOn(cut, 'cutsceneBackgroundChange');
                    jest.clearAllTimers();
                    cut.dialogueIndex = idx;

                    cut.cutsceneController();

                    expect(cut.removeEventListeners).toHaveBeenCalled();
                    expect(game.audioHandler.firedogSFX.playSound)
                        .toHaveBeenCalledWith('dreamSoundInGame');
                    expect(cut.cutsceneBackgroundChange)
                        .toHaveBeenCalledWith(500, 500, 500);

                    jest.advanceTimersByTime(1000);

                    expect(cut.addEventListeners).toHaveBeenCalled();
                });
            });
        });

        describe('post-fight music transitions', () => {
            beforeEach(() => {
                game.boss.postFight = true;
                game.boss.current = {};
                cut.textIndex = cut.dialogue[0].dialogue.length;
            });

            it('dialogueIndex 2 starts unboundPurpose music', () => {
                cut.dialogueIndex = 2;

                cut.cutsceneController();

                expect(game.audioHandler.cutsceneMusic.playSound)
                    .toHaveBeenCalledWith('unboundPurpose', true);
            });

            it('dialogueIndex 25 starts dark ambience', () => {
                cut.dialogueIndex = 25;

                cut.cutsceneController();

                expect(game.audioHandler.mapSoundtrack.playSound)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame', true);
            });

            it('dialogueIndex 29 fades out dark ambience', () => {
                cut.dialogueIndex = 29;

                cut.cutsceneController();

                expect(game.audioHandler.mapSoundtrack.fadeOutAndStop)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame');
            });

            it('dialogueIndex 37 fades out unboundPurpose', () => {
                cut.dialogueIndex = 37;

                cut.cutsceneController();

                expect(game.audioHandler.cutsceneMusic.fadeOutAndStop)
                    .toHaveBeenCalledWith('unboundPurpose');
            });
        });
    });
});

describe('BonusMap1GlacikalIngameCutsceneBeforeFight', () => {
    let game, m6pre;

    beforeEach(() => {
        game = createMap();
        m6pre = new BonusMap1GlacikalIngameCutsceneBeforeFight(game);
    });

    it('registers exactly 3 dialogues', () => {
        expect(m6pre.dialogue.length).toBe(3);
    });

    it('inherits GlacikalCutscene interaction methods', () => {
        expect(typeof m6pre.enterOrLeftClick).toBe('function');
        expect(typeof m6pre.displayDialogue).toBe('function');
    });
});

describe('BonusMap1GlacikalIngameCutsceneAfterFight', () => {
    let game, m6post;

    beforeEach(() => {
        game = createMap();
        m6post = new BonusMap1GlacikalIngameCutsceneAfterFight(game);
    });

    it('registers exactly 2 dialogues', () => {
        expect(m6post.dialogue.length).toBe(2);
    });

    it('inherits GlacikalCutscene interaction methods', () => {
        expect(typeof m6post.enterOrLeftClick).toBe('function');
        expect(typeof m6post.displayDialogue).toBe('function');
    });
});
