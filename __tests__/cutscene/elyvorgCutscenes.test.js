import {
    ElyvorgCutscene,
    Map6ElyvorgIngameCutsceneBeforeFight,
    Map6ElyvorgIngameCutsceneAfterFight
} from '../../game/cutscene/elyvorgCutscenes.js';
import * as fading from '../../game/animations/fading.js';

jest.useFakeTimers();

describe('ElyvorgCutscene', () => {
    let game, cut;

    beforeEach(() => {
        const noop = jest.fn();
        game = {
            player: {
                currentState: 'foo',
                states: Array.from({ length: 10 }, (_, i) => `s${i}`),
                setState: jest.fn()
            },
            menu: {
                pause: { isPaused: false },
                ingameAudioSettings: Symbol('settings')
            },
            currentMenu: null,
            enterDuringBackgroundTransition: true,
            audioHandler: {
                cutsceneSFX: { playSound: noop, stopAllSounds: noop },
                cutsceneDialogue: { playSound: noop, stopAllSounds: noop },
                cutsceneMusic: { playSound: noop, fadeOutAndStop: noop, stopAllSounds: noop },
                mapSoundtrack: { playSound: noop, fadeOutAndStop: noop },
                firedogSFX: { playSound: noop }
            },
            endCutscene: jest.fn(),
            cutscenes: [],
            talkToElyvorg: true,
            elyvorgPreFight: false,
            elyvorgPostFight: false,
            elyvorgInFight: false
        };

        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((canvas, a, b, c, cb) => cb());

        cut = new ElyvorgCutscene(game);

        cut.dialogue = [
            { dialogue: 'Hello...' },
            { dialogue: 'Goodbye.' }
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('invoke cutsceneController, set player state, and flags', () => {
        jest.spyOn(cut, 'cutsceneController');
        cut.textIndex = cut.dialogue[0].dialogue.length;
        cut.dialogueIndex = 0;
        game.player.currentState = 'not-s8';
        cut.enterOrLeftClick('SC');
        expect(cut.cutsceneController).toHaveBeenCalled();
        expect(game.player.setState).toHaveBeenCalledWith(8, 0);
        expect(cut.isEnterPressed).toBe(true);
        expect(cut.playSound2OnDotPause).toBe(false);
    });

    it('skip setting player state when already in state 8', () => {
        game.player.currentState = game.player.states[8];
        cut.textIndex = 0;
        cut.dialogueIndex = 0;
        cut.enterOrLeftClick('SC2');
        expect(game.player.setState).not.toHaveBeenCalled();
    });

    describe('enterOrLeftClick text progression', () => {
        beforeEach(() => {
            cut.dialogue = [
                { dialogue: 'One' },
                { dialogue: 'Two' }
            ];
            cut.dialogueIndex = 0;
            cut.textIndex = 0;
        });

        it('continueDialogue branch advances one character', () => {
            cut.continueDialogue = true;
            cut.textIndex = 2;
            cut.enterOrLeftClick('X');
            expect(cut.pause).toBe(false);
            expect(cut.textIndex).toBe(3);
            expect(cut.continueDialogue).toBe(false);
        });

        it('jumps to end when no punctuation dots present', () => {
            cut.dialogue = [{ dialogue: 'Hello' }];
            cut.dialogueIndex = 0;
            cut.textIndex = 1;
            cut.enterOrLeftClick('X');
            expect(cut.textIndex).toBe(5); // "Hello".length
        });

        it('advances to next dialogue when at end', () => {
            cut.textIndex = cut.dialogue[0].dialogue.length; // 3
            cut.dialogueIndex = 0;
            cut.lastSound2Played = true;
            cut.enterOrLeftClick('X');
            expect(cut.dialogueIndex).toBe(1);
            expect(cut.textIndex).toBe(0);
            expect(cut.fullWordsColor).toEqual(['Two']);
            expect(cut.lastSound2Played).toBe(false);
        });
    });

    describe('final branch: pre‑fight', () => {
        beforeEach(() => {
            game.elyvorgPreFight = true;
            cut.dialogueIndex = 1;
            cut.textIndex = cut.dialogue[1].dialogue.length;
            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');
        });

        it('plays battleStarting SFX, then after 3s ends cutscene and starts fight', () => {
            cut.enterOrLeftClick('ID');
            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('battleStarting');
            jest.advanceTimersByTime(3000);
            expect(game.endCutscene).toHaveBeenCalledWith('ID');
            expect(game.talkToElyvorg).toBe(false);
            expect(game.cutscenes).toEqual([]);
            expect(game.elyvorgInFight).toBe(true);
            expect(game.audioHandler.mapSoundtrack.playSound)
                .toHaveBeenCalledWith('elyvorgBattleTheme', true);
        });
    });

    describe('final branch: post‑fight', () => {
        beforeEach(() => {
            game.elyvorgPostFight = true;
            cut.dialogueIndex = 1;
            cut.textIndex = cut.dialogue[1].dialogue.length;
            jest.spyOn(cut, 'removeEventListeners');
        });

        it('immediately ends cutscene without bg change', () => {
            cut.enterOrLeftClick('END');
            expect(game.endCutscene).toHaveBeenCalledWith('END');
            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(game.cutscenes).toEqual([]);
            expect(game.talkToElyvorg).toBe(false);
        });
    });

    it('reset isEnterPressed via interval at end of a post‑fight line', () => {
        game.elyvorgPostFight = true;
        cut.dialogue = [{ dialogue: 'X' }];
        cut.dialogueIndex = 0;
        cut.textIndex = 1;  // at end
        cut.isEnterPressed = true;
        cut.enterOrLeftClick('ZZ');
        jest.advanceTimersByTime(100);
        expect(cut.isEnterPressed).toBe(false);
    });

    describe('displayDialogue override', () => {
        beforeEach(() => {
            jest.spyOn(cut, 'enterOrLeftClick');
            cut.dialogue = [{ dialogue: 'Hi' }];
            cut.displayDialogue('CS');
        });

        it('Enter invokes enterOrLeftClick', () => {
            cut.isEnterPressed = false;
            cut.handleKeyDown({ key: 'Enter' });
            expect(cut.enterOrLeftClick).toHaveBeenCalledWith('CS');
        });

        it('LeftClick invokes enterOrLeftClick', () => {
            cut.isEnterPressed = false;
            cut.handleLeftClick({ button: 0 });
            expect(cut.enterOrLeftClick).toHaveBeenCalledWith('CS');
        });

        it('Tab in preFight immediately starts battle sequence and jumps to last dialogue', () => {
            game.elyvorgPreFight = true;
            jest.spyOn(cut, 'removeEventListeners');
            jest.spyOn(cut, 'cutsceneBackgroundChange');

            cut.dialogue = [
                { dialogue: 'First' },
                { dialogue: 'Middle' },
                { dialogue: 'Last' }
            ];
            cut.displayDialogue('CS');
            cut.handleKeyDown({ key: 'Tab' });

            expect(cut.removeEventListeners).toHaveBeenCalled();
            expect(cut.cutsceneBackgroundChange).toHaveBeenCalledWith(500, 2500, 200);
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('battleStarting');

            // after 3s, now in‑fight and index jumped
            jest.advanceTimersByTime(3000);
            expect(game.elyvorgInFight).toBe(true);
            expect(cut.dialogueIndex).toBe(2);
        });

        it('does not trigger when paused, in settings, or transition disabled', () => {
            cut.handleKeyDown({ key: 'Enter' });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = true;
            cut.handleKeyDown({ key: 'Enter' });
            cut.handleLeftClick({ button: 0 });
            expect(cut.enterOrLeftClick).toHaveBeenCalledTimes(1);

            game.menu.pause.isPaused = false;
            game.currentMenu = game.menu.ingameAudioSettings;
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
            cut.textIndex = 1; // not at end
            game.elyvorgPreFight = false;
            game.elyvorgPostFight = false;
        });

        it('does nothing when textIndex != dialogue length', () => {
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

        describe('preFight ambience & dream scenes', () => {
            beforeEach(() => {
                game.elyvorgPreFight = true;
                cut.textIndex = cut.dialogue[0].dialogue.length;
            });
            it('dialogueIndex 1 starts dark ambience', () => {
                cut.dialogueIndex = 1;
                cut.cutsceneController();
                expect(game.audioHandler.mapSoundtrack.playSound)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame', true);
            });
            it('dialogueIndex 5 fades out dark ambience', () => {
                cut.dialogueIndex = 5;
                cut.cutsceneController();
                expect(game.audioHandler.mapSoundtrack.fadeOutAndStop)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame');
            });
            [12, 15, 17].forEach(idx => {
                it(`dialogueIndex ${idx} triggers dreamSound and bg change`, () => {
                    jest.spyOn(cut, 'removeEventListeners');
                    jest.spyOn(cut, 'addEventListeners');
                    jest.clearAllTimers();
                    cut.dialogueIndex = idx;
                    cut.cutsceneController();
                    expect(cut.removeEventListeners).toHaveBeenCalled();
                    expect(game.audioHandler.firedogSFX.playSound)
                        .toHaveBeenCalledWith('dreamSoundInGame');
                    expect(fading.fadeInAndOut).toHaveBeenCalled();
                    jest.advanceTimersByTime(1000);
                    expect(cut.addEventListeners).toHaveBeenCalled();
                });
            });
        });

        describe('postFight music transitions', () => {
            beforeEach(() => {
                game.elyvorgPostFight = true;
                cut.textIndex = cut.dialogue[0].dialogue.length;
            });
            it('dialogueIndex 2 starts unboundPurpose', () => {
                cut.dialogueIndex = 2;
                cut.cutsceneController();
                expect(game.audioHandler.cutsceneMusic.playSound)
                    .toHaveBeenCalledWith('unboundPurpose', true);
            });
            it('dialogueIndex 25 starts dark ambience', () => {
                cut.dialogueIndex = 25;
                cut.cutsceneController();
                expect(game.audioHandler.mapSoundtrack.playSound)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame', true);
            });
            it('dialogueIndex 29 fades out dark ambience', () => {
                cut.dialogueIndex = 29;
                cut.cutsceneController();
                expect(game.audioHandler.mapSoundtrack.fadeOutAndStop)
                    .toHaveBeenCalledWith('crypticTokenDarkAmbienceSoundInGame');
            });
            it('dialogueIndex 35 fades out unboundPurpose', () => {
                cut.dialogueIndex = 35;
                cut.cutsceneController();
                expect(game.audioHandler.cutsceneMusic.fadeOutAndStop)
                    .toHaveBeenCalledWith('unboundPurpose');
            });
        });
    });
});

describe('Map6ElyvorgIngameCutsceneBeforeFight', () => {
    let game, m6pre;
    beforeEach(() => {
        game = {
            menu: {
                skins: {
                    defaultSkin: 'default',
                    hatSkin: 'hat',
                    choloSkin: 'cholo',
                    zabkaSkin: 'zabka',
                    shinySkin: 'shiny',
                    currentSkin: 'default'
                }
            }
        };
        m6pre = new Map6ElyvorgIngameCutsceneBeforeFight(game);
    });

    it('registers exactly 29 dialogues', () => {
        expect(m6pre.dialogue.length).toBe(29);
    });

    it('inherits ElyvorgCutscene methods', () => {
        expect(typeof m6pre.enterOrLeftClick).toBe('function');
        expect(typeof m6pre.displayDialogue).toBe('function');
    });
});

describe('Map6ElyvorgIngameCutsceneAfterFight', () => {
    let game, m6post;
    beforeEach(() => {
        game = {
            menu: {
                skins: {
                    defaultSkin: 'default',
                    hatSkin: 'hat',
                    choloSkin: 'cholo',
                    zabkaSkin: 'zabka',
                    shinySkin: 'shiny',
                    currentSkin: 'default'
                }
            },
            elyvorgRunAway: false
        };
        m6post = new Map6ElyvorgIngameCutsceneAfterFight(game);
    });

    it('registers exactly 42 dialogues', () => {
        expect(m6post.dialogue.length).toBe(42);
    });

    it('sets game.elyvorgRunAway flag', () => {
        expect(game.elyvorgRunAway).toBe(true);
    });
});

describe('extra edge cases', () => {
    let game, cut;
    beforeEach(() => {
        const noop = jest.fn();
        game = {
            player: {
                currentState: 'foo',
                states: Array.from({ length: 10 }, (_, i) => `s${i}`),
                setState: jest.fn()
            },
            menu: {
                pause: { isPaused: false },
                ingameAudioSettings: Symbol('settings')
            },
            currentMenu: null,
            enterDuringBackgroundTransition: true,
            audioHandler: {
                cutsceneSFX: { playSound: noop, stopAllSounds: noop },
                cutsceneDialogue: { playSound: noop, stopAllSounds: noop },
                cutsceneMusic: { playSound: noop, fadeOutAndStop: noop, stopAllSounds: noop },
                mapSoundtrack: { playSound: noop, fadeOutAndStop: noop },
                firedogSFX: { playSound: noop }
            },
            endCutscene: jest.fn(),
            cutscenes: [],
            talkToElyvorg: true,
            elyvorgPreFight: false,
            elyvorgPostFight: false,
            elyvorgInFight: false
        };
        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((c, a, b, d, cb) => cb());
        cut = new ElyvorgCutscene(game);
    });

    it('jumps to the next dot when dialogue contains ellipses', () => {
        cut.dialogue = [{ dialogue: 'A...B' }];
        cut.dialogueIndex = 0;
        cut.textIndex = 0;
        cut.enterOrLeftClick('X');
        expect(cut.textIndex).toBe(1);
    });

    it('Tab in displayDialogue does nothing when NOT in pre‑fight', () => {
        game.elyvorgPreFight = false;
        cut.dialogue = [{ dialogue: 'Hello' }];
        cut.displayDialogue('CS');
        const spyRemove = jest.spyOn(cut, 'removeEventListeners');
        const spyStop = jest.spyOn(game.audioHandler.cutsceneDialogue, 'stopAllSounds');
        cut.handleKeyDown({ key: 'Tab' });
        expect(spyRemove).not.toHaveBeenCalled();
        expect(spyStop).not.toHaveBeenCalled();
    });
});
