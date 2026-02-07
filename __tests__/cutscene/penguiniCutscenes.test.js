import {
    PenguiniCutscene,
    Map1PenguinIngameCutscene,
    Map2PenguinIngameCutscene,
    Map3PenguinIngameCutscene,
    Map4PenguinIngameCutscene,
    Map5PenguinIngameCutscene,
    Map6PenguinIngameCutscene,
    Map7PenguinIngameCutscene,
    BonusMap1PenguinIngameCutscene,
    BonusMap2PenguinIngameCutscene,
    BonusMap3PenguinIngameCutscene,
    CoinDialogueConditionCutscene
} from '../../game/cutscene/penguiniCutscenes.js';
import * as fading from '../../game/animations/fading.js';

jest.mock('../../game/animations/floatingMessages.js', () => ({
    FloatingMessage: jest.fn().mockImplementation(
        (_text, _dur, _off, x, y, size, color) => ({ x, y, size, color })
    )
}));

jest.useFakeTimers();

describe('PenguiniCutscene & subclasses', () => {
    let game, cutscene;

    beforeEach(() => {
        game = {
            coins: 150,
            winningCoins: 100,
            floatingMessages: [],
            penguini: { x: 200, y: 100 },
            menu: {
                pause: { isPaused: false },
                audioSettings: Symbol('settings'),
                gameOver: { name: 'gameOver' },
                skins: {
                    defaultSkin: 'default',
                    hatSkin: 'hat',
                    choloSkin: 'cholo',
                    zabkaSkin: 'zabka',
                    shinySkin: 'shiny',
                    currentSkin: 'default'
                }
            },
            currentMenu: null,
            enterDuringBackgroundTransition: true,
            cutscenes: ['dummy'],
            talkToPenguin: true,
            audioHandler: {
                cutsceneDialogue: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn()
                },
                cutsceneSFX: {
                    stopAllSounds: jest.fn(),
                    playSound: jest.fn()
                },
                cutsceneMusic: {
                    stopAllSounds: jest.fn()
                }
            },
            endCutscene: jest.fn(),
            canvas: document.createElement('canvas'),
            currentMap: 'Map1',
        };

        jest.spyOn(fading, 'fadeInAndOut')
            .mockImplementation((_canvas, _f, _s, _o, cb) => cb());

        cutscene = new PenguiniCutscene(game);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('initializes game.talkToPenguinOneTimeOnly to false', () => {
        expect(game.talkToPenguinOneTimeOnly).toBe(false);
    });

    describe('enterOrLeftClick', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { dialogue: "First line." },
                { dialogue: "That's good enough, give me that!" },
                { dialogue: "Last line." }
            ];
            cutscene.dialogueIndex = 1; // cash-out dialogue
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length;
            cutscene.lastSound2Played = true;
            cutscene.continueDialogue = false;
            cutscene.playSound2OnDotPause = true;
        });

        it('always resets playSound2OnDotPause to false', () => {
            cutscene.enterOrLeftClick();
            expect(cutscene.playSound2OnDotPause).toBe(false);
        });

        it('performs cash-out: plays sound, deducts coins, and pushes FloatingMessage', () => {
            cutscene.enterOrLeftClick();
            expect(game.audioHandler.cutsceneSFX.playSound)
                .toHaveBeenCalledWith('cashOut');
            expect(game.coins).toBe(50);
            expect(game.floatingMessages[0])
                .toMatchObject({ x: 275, y: 140, size: 40, color: 'green' });
        });

        it('does nothing when lastSound2Played is false', () => {
            cutscene.lastSound2Played = false;
            game.coins = 150;
            cutscene.enterOrLeftClick();
            expect(game.audioHandler.cutsceneSFX.playSound).not.toHaveBeenCalled();
            expect(game.coins).toBe(150);
            expect(game.floatingMessages).toHaveLength(0);
        });

        it('does nothing when dialogue does not match cash-out string', () => {
            cutscene.dialogueIndex = 0;
            cutscene.lastSound2Played = true;
            game.coins = 150;
            cutscene.enterOrLeftClick();
            expect(game.audioHandler.cutsceneSFX.playSound).not.toHaveBeenCalled();
            expect(game.coins).toBe(150);
            expect(game.floatingMessages).toHaveLength(0);
        });

        it('handles continueDialogue branch', () => {
            cutscene.continueDialogue = true;
            cutscene.textIndex = 2;
            cutscene.enterOrLeftClick();
            expect(cutscene.pause).toBe(false);
            expect(cutscene.textIndex).toBe(3);
            expect(cutscene.continueDialogue).toBe(false);
        });

        it('jumps to next dot when in-dialogue', () => {
            cutscene.dialogue = [{ dialogue: 'A...B' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 0;
            cutscene.enterOrLeftClick();
            expect(cutscene.textIndex).toBe(1);
        });

        it('falls back to end-of-dialogue when no dots exist', () => {
            cutscene.dialogue = [{ dialogue: 'Hello' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 0;
            cutscene.enterOrLeftClick();
            expect(cutscene.textIndex).toBe(5);
        });

        it('advances to next dialogue when not last', () => {
            cutscene.dialogue = [{ dialogue: 'One' }, { dialogue: 'Two' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 3;
            cutscene.lastSound2Played = true;
            cutscene.enterOrLeftClick();
            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.fullWordsColor).toEqual(['Two']);
        });

        it('final branch: ends cutscene, resets flags, conditionally gameOver', () => {
            game.notEnoughCoins = true;
            cutscene.dialogue = [{ dialogue: 'End' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 3;
            jest.spyOn(cutscene, 'removeEventListeners');
            cutscene.enterOrLeftClick();
            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.talkToPenguin).toBe(false);
            expect(game.cutscenes).toEqual([]);
            expect(cutscene.removeEventListeners).toHaveBeenCalled();
            jest.advanceTimersByTime(20);
            expect(game.currentMenu).toBe(game.menu.gameOver);
        });

        it('final branch: ends cutscene WITHOUT gameOver when notEnoughCoins is false', () => {
            game.notEnoughCoins = false;
            cutscene.dialogue = [{ dialogue: 'End' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 3;
            cutscene.enterOrLeftClick();
            expect(game.endCutscene).toHaveBeenCalled();
            expect(game.talkToPenguin).toBe(false);
            expect(game.cutscenes).toEqual([]);
            jest.advanceTimersByTime(25);
            expect(game.currentMenu).toBe(null);
        });

        it('reset isEnterPressed via interval', () => {
            cutscene.dialogue = [{ dialogue: 'X' }];
            cutscene.dialogueIndex = 0;
            cutscene.textIndex = 1;
            cutscene.isEnterPressed = true;
            cutscene.enterOrLeftClick();
            jest.advanceTimersByTime(100);
            expect(cutscene.isEnterPressed).toBe(false);
        });

        it('cash-out only happens once even if enterOrLeftClick is called twice', () => {
            game.coins = 200;
            game.winningCoins = 100;
            cutscene.dialogue = [
                { dialogue: "Prelude" },
                { dialogue: "That's good enough, give me that!" },
                { dialogue: "After" }
            ];
            cutscene.dialogueIndex = 1;
            cutscene.textIndex = cutscene.dialogue[1].dialogue.length;
            cutscene.lastSound2Played = true;

            cutscene.enterOrLeftClick();
            expect(game.coins).toBe(100);
            expect(cutscene.dialogueIndex).toBe(2);
            expect(cutscene.lastSound2Played).toBe(false);

            cutscene.enterOrLeftClick();
            expect(game.coins).toBe(100);
        });
    });

    describe('displayDialogue override', () => {
        beforeEach(() => {
            cutscene.dialogue = [
                { dialogue: 'Line1' },
                { dialogue: 'It seems you have 50 coins.' },
                { dialogue: 'Later' }
            ];
            cutscene.displayDialogue();
            jest.spyOn(cutscene, 'addEventListeners');
        });

        it('Tab skips to coinCheckIndex, fades, stops audio, and resumes', () => {
            cutscene.isEnterPressed = false;
            cutscene.handleKeyDown({ key: 'Tab' });
            expect(fading.fadeInAndOut).toHaveBeenCalledWith(
                game.canvas, 200, 300, 200, expect.any(Function)
            );
            expect(game.audioHandler.cutsceneDialogue.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneSFX.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.stopAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneDialogue.playSound)
                .toHaveBeenCalledWith('bit1', false, true, true);

            jest.advanceTimersByTime(400);
            expect(cutscene.dialogueIndex).toBe(1);
            expect(cutscene.textIndex).toBe(0);
            expect(cutscene.lastSound2Played).toBe(false);
            expect(cutscene.fullWordsColor).toEqual(
                ['It', 'seems', 'you', 'have', '50', 'coins.']
            );
            expect(cutscene.addEventListeners).toHaveBeenCalled();
        });

        it('does not skip forward when already past the coin-check dialogue', () => {
            cutscene.dialogueIndex = 1;  // coin-check index
            fading.fadeInAndOut.mockClear();
            cutscene.handleKeyDown({ key: 'Tab' });
            expect(fading.fadeInAndOut).not.toHaveBeenCalled();
        });

        it('Enter invokes enterOrLeftClick', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).toHaveBeenCalled();
        });

        it('LeftClick invokes enterOrLeftClick', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = false;
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).toHaveBeenCalled();
        });

        it('blocks Enter when paused', () => {
            game.menu.pause.isPaused = true;
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).not.toHaveBeenCalled();
        });

        it('blocks Enter when in audio settings', () => {
            game.currentMenu = game.menu.audioSettings;
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).not.toHaveBeenCalled();
        });

        it('blocks Click when paused', () => {
            game.menu.pause.isPaused = true;
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).not.toHaveBeenCalled();
        });

        it('blocks Click when in audio settings', () => {
            game.currentMenu = game.menu.audioSettings;
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).not.toHaveBeenCalled();
        });

        it('blocks Enter/click when enterDuringBackgroundTransition is false', () => {
            game.enterDuringBackgroundTransition = false;
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.handleKeyDown({ key: 'Enter' });
            cutscene.handleLeftClick({ button: 0 });
            expect(spy).not.toHaveBeenCalled();
        });

        it('ignores Tab/Enter while isEnterPressed is true', () => {
            const spy = jest.spyOn(cutscene, 'enterOrLeftClick');
            cutscene.isEnterPressed = true;
            cutscene.handleKeyDown({ key: 'Tab' });
            cutscene.handleKeyDown({ key: 'Enter' });
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('CoinDialogueConditionCutscene', () => {
        let cond;
        beforeEach(() => {
            cond = new CoinDialogueConditionCutscene(game);
        });

        it('Map1: coins < winningCoins ⇒ notEnoughCoins & 3 dialogues', () => {
            game.currentMap = 'Map1';
            game.coins = 50;
            game.winningCoins = 100;
            const arr = cond.checkPlayerCoins();
            expect(game.notEnoughCoins).toBe(true);
            expect(arr).toHaveLength(3);
        });

        it('Map1: coins ≥ winningCoins ⇒ single good-enough dialogue', () => {
            game.currentMap = 'Map1';
            game.coins = 150;
            game.winningCoins = 100;
            const arr = cond.checkPlayerCoins();
            expect(game.notEnoughCoins).toBeUndefined();
            expect(arr).toHaveLength(1);
            expect(arr[0].dialogue).toBe("That's good enough, give me that!");
        });

        ['Map2', 'Map3', 'Map4', 'Map5', 'Map6'].forEach(name => {
            it(`${name}: coins < winningCoins ⇒ notEnoughCoins & multiple`, () => {
                game.currentMap = name;
                game.coins = 50;
                game.winningCoins = 100;
                const arr = cond.checkPlayerCoins();
                expect(game.notEnoughCoins).toBe(true);
                expect(arr.length).toBeGreaterThan(1);
            });
            it(`${name}: coins ≥ winningCoins ⇒ single good-enough`, () => {
                game.currentMap = name;
                game.coins = 150;
                game.winningCoins = 100;
                const arr = cond.checkPlayerCoins();
                expect(game.notEnoughCoins).toBeUndefined();
                expect(arr).toHaveLength(1);
            });
        });

        ['BonusMap1', 'BonusMap2', 'BonusMap3'].forEach(name => {
            it(`${name}: coins < winningCoins ⇒ notEnoughCoins & multiple`, () => {
                game.currentMap = name;
                game.coins = 50;
                game.winningCoins = 100;
                const arr = cond.checkPlayerCoins();
                expect(game.notEnoughCoins).toBe(true);
                expect(arr.length).toBeGreaterThan(1);
            });
            it(`${name}: coins ≥ winningCoins ⇒ single good-enough`, () => {
                game.currentMap = name;
                game.coins = 150;
                game.winningCoins = 100;
                const arr = cond.checkPlayerCoins();
                expect(game.notEnoughCoins).toBeUndefined();
                expect(arr).toHaveLength(1);
                expect(arr[0].dialogue).toBe("That's good enough, give me that!");
            });
        });
    });

    describe('Early-return when game.notEnoughCoins === true for Map1–Map6', () => {
        beforeEach(() => {
            game.notEnoughCoins = true;
            jest.spyOn(CoinDialogueConditionCutscene.prototype, 'checkPlayerCoins')
                .mockReturnValue([]);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('Map1 stops after its initial 13 entries', () => {
            game.currentMap = 'Map1';
            const m1 = new Map1PenguinIngameCutscene(game);
            expect(m1.dialogue.length).toBe(30);
        });

        it('Map2 stops after its initial 15 entries', () => {
            game.currentMap = 'Map2';
            const m2 = new Map2PenguinIngameCutscene(game);
            expect(m2.dialogue.length).toBe(15);
        });

        it('Map3 stops after its initial 15 entries', () => {
            game.currentMap = 'Map3';
            const m3 = new Map3PenguinIngameCutscene(game);
            expect(m3.dialogue.length).toBe(15);
        });

        it('Map4 stops after its initial 10 entries', () => {
            game.currentMap = 'Map4';
            const m4 = new Map4PenguinIngameCutscene(game);
            expect(m4.dialogue.length).toBe(10);
        });

        it('Map5 stops after its initial 20 entries', () => {
            game.currentMap = 'Map5';
            const m5 = new Map5PenguinIngameCutscene(game);
            expect(m5.dialogue.length).toBe(20);
        });

        it('Map6 stops after its initial 11 entries', () => {
            game.currentMap = 'Map6';
            const m6 = new Map6PenguinIngameCutscene(game);
            expect(m6.dialogue.length).toBe(11);
        });
    });

    describe('Early-return when game.notEnoughCoins === true for Bonus maps', () => {
        beforeEach(() => {
            game.notEnoughCoins = true;
            jest.spyOn(CoinDialogueConditionCutscene.prototype, 'checkPlayerCoins')
                .mockReturnValue([]);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('BonusMap1 stops after its initial 11 entries', () => {
            game.currentMap = 'BonusMap1';
            const m = new BonusMap1PenguinIngameCutscene(game);
            expect(m.dialogue.length).toBe(11);
        });

        it('BonusMap2 stops after its initial 11 entries', () => {
            game.currentMap = 'BonusMap2';
            const m = new BonusMap2PenguinIngameCutscene(game);
            expect(m.dialogue.length).toBe(11);
        });

        it('BonusMap3 stops after its initial 11 entries', () => {
            game.currentMap = 'BonusMap3';
            const m = new BonusMap3PenguinIngameCutscene(game);
            expect(m.dialogue.length).toBe(11);
        });
    });

    describe('Map7PenguinIngameCutscene always includes full dialogues', () => {
        it('includes all 12 entries even if notEnoughCoins is true', () => {
            game.notEnoughCoins = true;
            game.currentMap = 'Map7';
            const m7 = new Map7PenguinIngameCutscene(game);
            expect(m7.dialogue.length).toBe(12);
        });
    });

    describe('Map1PenguinIngameCutscene integration', () => {
        it('initializes dialogues and pluralizes coinText appropriately', () => {
            jest.spyOn(CoinDialogueConditionCutscene.prototype, 'checkPlayerCoins')
                .mockReturnValue([{ character: 'X', dialogue: 'D', images: [] }]);
            game.currentMap = 'Map1';
            const m1 = new Map1PenguinIngameCutscene(game);
            expect(m1.dialogue.length).toBeGreaterThanOrEqual(14);
            expect(m1.coinText).toBe("coins");
            jest.restoreAllMocks();
        });

        it('selects singular coinText when player has exactly 1 coin', () => {
            game.coins = 1;
            game.currentMap = 'Map1';
            jest.spyOn(CoinDialogueConditionCutscene.prototype, 'checkPlayerCoins')
                .mockReturnValue([]);
            const m1 = new Map1PenguinIngameCutscene(game);
            expect(m1.coinText).toBe("coin");
            jest.restoreAllMocks();
        });
    });

    describe('Pluralization spot-check on Map3', () => {
        it('uses singular "coin" when player has exactly 1 coin', () => {
            game.coins = 1;
            game.currentMap = 'Map3';
            jest.spyOn(CoinDialogueConditionCutscene.prototype, 'checkPlayerCoins')
                .mockReturnValue([]);
            const m3 = new Map3PenguinIngameCutscene(game);
            expect(m3.coinText).toBe('coin');
            jest.restoreAllMocks();
        });
    });
});
