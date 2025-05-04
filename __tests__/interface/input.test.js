import { InputHandler } from '../../game/interface/input';

describe('InputHandler', () => {
    let game;
    let ih;

    beforeEach(() => {
        game = {
            enterToTalkToPenguin: false,
            talkToPenguin: false,
            talkToElyvorg: false,
            isElyvorgFullyVisible: false,
            enterDuringBackgroundTransition: true,
            isPlayerInGame: false,
            cutsceneActive: false,
            notEnoughCoins: false,
            gameOver: false,
            currentMenu: null,
            player: { isUnderwater: false },
            tutorial: { tutorialPause: false },
            isTutorialActive: false,
            menu: {
                pause: {
                    isPaused: false,
                    canEscape: true,
                    togglePause: jest.fn(),
                },
                forestMap: {
                    activateMenu: jest.fn(),
                    showSavingSprite: false,
                },
                enemyLore: {
                    activateMenu: jest.fn(),
                    menuActive: false,
                },
                howToPlay: {
                    menuInGame: false,
                    currentImageIndex: 5,
                },
                main: {},
            },
            audioHandler: {
                firedogSFX: { playSound: jest.fn() },
                menu: { playSound: jest.fn() },
                cutsceneSFX: { isPlaying: jest.fn(() => false) },
            },
            saveGameState: jest.fn(),
        };

        ih = new InputHandler(game);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('keydown handling', () => {
        describe('Enter key', () => {
            test('when talkToPenguin & transition, pushes "Enter" and sets enterToTalkToPenguin', () => {
                game.talkToPenguin = true;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                expect(ih.keys).toContain('Enter');
                expect(game.enterToTalkToPenguin).toBe(true);
            });

            test('when not talkToPenguin but transition, pushes "Enter" only', () => {
                game.talkToPenguin = false;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                expect(ih.keys).toContain('Enter');
                expect(game.enterToTalkToPenguin).toBe(false);
            });
        });

        describe('movement keys s/a/d/q/e', () => {
            test('pushes lowercase letters when allowed', () => {
                ['s', 'A', 'd', 'Q', 'e'].forEach(k =>
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
                );
                expect(ih.keys).toEqual(expect.arrayContaining(['s', 'a', 'd', 'q', 'e']));
            });

            test('does not push keys when transition is false', () => {
                game.enterDuringBackgroundTransition = false;
                ih.keys = [];
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
                expect(ih.keys).toEqual([]);
            });

            test('prevents duplicate non-underwater keys', () => {
                ih.keys = [];
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'S' }));
                expect(ih.keys.filter(k => k === 's')).toHaveLength(1);
            });

            test('pushes "w" when not underwater', () => {
                game.player.isUnderwater = false;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
                expect(ih.keys).toContain('w');
            });

            test('when underwater, pushes "w" only once until release', () => {
                game.player.isUnderwater = true;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
                expect(ih.keys).toContain('w');
                expect(ih.isWKeyPressed).toBe(true);

                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
                expect(ih.keys.filter(k => k === 'w')).toHaveLength(1);

                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
                expect(ih.isWKeyPressed).toBe(false);
                expect(ih.keys).not.toContain('w');
            });

            test('when talking to Elyvorg & not fully visible, any movement key pushes "d"', () => {
                game.talkToElyvorg = true;
                game.isElyvorgFullyVisible = false;
                ih.keys = [];
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
                expect(ih.keys).toEqual(['d', 'd']);
            });

            test('when talking to Elyvorg & fully visible, movement keys do nothing', () => {
                game.talkToElyvorg = true;
                game.isElyvorgFullyVisible = true;
                ih.keys = [];
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                expect(ih.keys).toEqual([]);
            });
        });

        describe('b key', () => {
            test('plays barkSound when in game and allowed', () => {
                game.isPlayerInGame = true;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
                expect(game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('barkSound');
            });

            test('does not play barkSound if tutorial paused', () => {
                game.isPlayerInGame = true;
                game.tutorial.tutorialPause = true;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
                expect(game.audioHandler.firedogSFX.playSound).not.toHaveBeenCalled();
            });
        });

        describe('Tab key', () => {
            test('toggles from forestMap to enemyLore when allowed', () => {
                game.canSelectForestMap = true;
                game.currentMenu = game.menu.forestMap;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
                expect(game.menu.enemyLore.activateMenu).toHaveBeenCalled();
            });

            test('toggles back from enemyLore to forestMap', () => {
                game.canSelectForestMap = true;
                game.currentMenu = game.menu.enemyLore;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
                expect(game.menu.forestMap.activateMenu).toHaveBeenCalled();
            });

            test('does nothing when forestMap not selectable', () => {
                game.canSelectForestMap = false;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
                expect(game.menu.enemyLore.activateMenu).not.toHaveBeenCalled();
                expect(game.menu.forestMap.activateMenu).not.toHaveBeenCalled();
            });
        });

        describe('t key', () => {
            test('toggles tutorial state and saves game when on howToPlay', () => {
                game.currentMenu = game.menu.howToPlay;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
                expect(game.isTutorialActive).toBe(true);
                expect(game.tutorial.tutorialPause).toBe(true);
                expect(game.saveGameState).toHaveBeenCalled();

                window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
                expect(game.isTutorialActive).toBe(false);
                expect(game.tutorial.tutorialPause).toBe(false);
            });

            test('does nothing when not on howToPlay menu', () => {
                game.currentMenu = game.menu.main;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
                expect(game.saveGameState).not.toHaveBeenCalled();
                expect(game.isTutorialActive).toBe(false);
            });
        });

        describe('Escape key', () => {
            test('when battleStarting is playing, does nothing', () => {
                game.isPlayerInGame = true;
                game.audioHandler.cutsceneSFX.isPlaying.mockReturnValue(true);
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                expect(game.menu.pause.togglePause).not.toHaveBeenCalled();
            });

            test('when in-game no menu/no blockers, toggles pause', () => {
                game.isPlayerInGame = true;
                game.audioHandler.cutsceneSFX.isPlaying.mockReturnValue(false);
                game.currentMenu = null;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                expect(game.menu.pause.togglePause).toHaveBeenCalled();
            });

            test('when in cutsceneActive & talking to Penguin, toggles pause', () => {
                game.isPlayerInGame = true;
                game.cutsceneActive = true;
                game.talkToPenguin = true;
                game.audioHandler.cutsceneSFX.isPlaying.mockReturnValue(false);
                game.currentMenu = null;
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                expect(game.menu.pause.togglePause).toHaveBeenCalled();
            });

            test('does not call handleEscapeKey when saving sprite shows', () => {
                game.currentMenu = {};
                game.menu.forestMap.showSavingSprite = true;
                const spy = jest.spyOn(ih, 'handleEscapeKey');
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                expect(spy).not.toHaveBeenCalled();
            });

            test('calls handleEscapeKey when in submenu & saving hidden', () => {
                game.currentMenu = {};
                game.menu.forestMap.showSavingSprite = false;
                const spy = jest.spyOn(ih, 'handleEscapeKey');
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                expect(spy).toHaveBeenCalled();
            });
        });
    });

    describe('keyup handling', () => {
        test('removes movement keys and Enter on keyup', () => {
            game.enterDuringBackgroundTransition = true;
            ih.keys = ['s', 'w', 'Enter'];
            ['s', 'w', 'Enter'].forEach(k =>
                window.dispatchEvent(new KeyboardEvent('keyup', { key: k }))
            );
            expect(ih.keys).toEqual([]);
        });

        test('uppercase keyup still removes lowercase key', () => {
            game.enterDuringBackgroundTransition = true;
            ih.keys = ['s'];
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'S' }));
            expect(ih.keys).toEqual([]);
        });

        test('arrowup and arrowdown keyup reset flags', () => {
            ih.arrowUpPressed = true;
            ih.arrowDownPressed = true;
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'arrowup' }));
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'arrowdown' }));
            expect(ih.arrowUpPressed).toBe(false);
            expect(ih.arrowDownPressed).toBe(false);
        });
    });

    describe('mouse handling', () => {
        describe('mousedown', () => {
            test('pushes left/right/scroll clicks when allowed', () => {
                game.talkToElyvorg = false;
                ih.keys = [];
                document.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
                document.dispatchEvent(new MouseEvent('mousedown', { button: 2 }));
                document.dispatchEvent(new MouseEvent('mousedown', { button: 1 }));
                expect(ih.keys).toEqual(expect.arrayContaining(['leftClick', 'rightClick', 'scrollClick']));
            });

            test('does nothing when talking to Elyvorg', () => {
                game.talkToElyvorg = true;
                ih.keys = [];
                document.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
                expect(ih.keys).toEqual([]);
            });

            test('does nothing when transition is false', () => {
                game.enterDuringBackgroundTransition = false;
                ih.keys = [];
                document.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
                expect(ih.keys).toEqual([]);
            });
        });

        describe('mouseup', () => {
            test('removes leftClick & sets enterToTalkToPenguin if talkToPenguin', () => {
                game.enterDuringBackgroundTransition = true;
                game.talkToPenguin = true;
                ih.keys = ['leftClick'];
                document.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
                expect(ih.keys).toEqual([]);
                expect(game.enterToTalkToPenguin).toBe(true);
            });

            test('removes rightClick & does not set enterToTalkToPenguin if not talkToPenguin', () => {
                game.enterDuringBackgroundTransition = true;
                game.talkToPenguin = false;
                ih.keys = ['rightClick'];
                document.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
                expect(ih.keys).toEqual([]);
                expect(game.enterToTalkToPenguin).toBe(false);
            });

            test('removes scrollClick on middle button up', () => {
                game.enterDuringBackgroundTransition = true;
                ih.keys = ['scrollClick'];
                document.dispatchEvent(new MouseEvent('mouseup', { button: 1 }));
                expect(ih.keys).toEqual([]);
            });
        });
    });

    describe('helper methods', () => {
        test('enterOrRightClick', () => {
            expect(ih.enterOrRightClick(['Enter'])).toBe(true);
            expect(ih.enterOrRightClick(['rightClick'])).toBe(true);
            expect(ih.enterOrRightClick(['q'])).toBeUndefined();
        });

        test('eOrScrollClick', () => {
            expect(ih.eOrScrollClick(['e'])).toBe(true);
            expect(ih.eOrScrollClick(['scrollClick'])).toBe(true);
            expect(ih.eOrScrollClick(['a'])).toBeUndefined();
        });

        test('qOrLeftClick', () => {
            expect(ih.qOrLeftClick(['q'])).toBe(true);
            expect(ih.qOrLeftClick(['leftClick'])).toBe(true);
            expect(ih.qOrLeftClick(['e'])).toBeUndefined();
        });
    });

    describe('handleEscapeKey logic', () => {
        test('when in submenu (not enemyLore) resets to main and deactivates active menu', () => {
            const submenu = { menuActive: true, activateMenu: jest.fn() };
            game.menu.testSub = submenu;
            game.menu.enemyLore.menuActive = false;
            game.menu.howToPlay.currentImageIndex = 3;
            game.currentMenu = { menuInGame: false };

            ih.handleEscapeKey();

            expect(submenu.activateMenu).toHaveBeenCalledWith(0);
            expect(game.menu.howToPlay.currentImageIndex).toBe(0);
            expect(game.currentMenu).toBe(game.menu.main);
        });

        test('when in enemyLore submenu flips back to forestMap', () => {
            game.currentMenu = game.menu.enemyLore;
            game.menu.enemyLore.menuInGame = false;
            game.menu.enemyLore.menuActive = true;

            ih.handleEscapeKey();

            expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('bookFlip', false, true);
            expect(game.menu.forestMap.activateMenu).toHaveBeenCalled();
        });

        test('when in-game menu and canEscape toggles pause and clears canEscape', () => {
            game.menu.pause.canEscape = true;
            game.currentMenu = game.menu.pause;
            game.menu.pause.menuInGame = true;
            game.gameOver = false;

            ih.handleEscapeKey();

            expect(game.menu.pause.togglePause).toHaveBeenCalled();
            expect(game.menu.pause.canEscape).toBe(false);
        });
    });
});
