import { AudioMenu } from '../../game/menu/baseMenu.js';

const createSliderGeometry = (game, optionIndex) => {
    const sliderX = game.width / 2 - 30;
    const sliderY = game.height / 2 + optionIndex * 60 - 155;
    return { sliderX, sliderY };
};

describe('AudioMenu', () => {
    describe('abstract methods enforcement', () => {
        beforeAll(() => {
            document.body.innerHTML = `
        <img id="mainmenubackground" />
        <img id="greenCompleted" />
      `;
        });

        let mockGame;
        beforeEach(() => {
            mockGame = { width: 1920, height: 689 };
        });

        test('throws if initializeVolumeLevels is not implemented in subclass', () => {
            class BadMenu extends AudioMenu {}
            expect(() => new BadMenu(mockGame, [], 'Bad')).toThrow('initializeVolumeLevels');
        });

        test('throws if initializeAudioMap is not implemented in subclass', () => {
            class OnlyLevelsMenu extends AudioMenu {
                initializeVolumeLevels() {}
            }
            expect(() => new OnlyLevelsMenu(mockGame, [], 'Bad')).toThrow('initializeAudioMap');
        });
    });

    describe('volume and interaction logic', () => {
        let menu, mockGame, ctx;

        class DummyAudioMenu extends AudioMenu {
            initializeVolumeLevels() {
                this.volumeLevels = [100, 50, 75];
            }
            initializeAudioMap() {
                this.audioMap = {
                    'Master Volume': 'masterAudio',
                    'Music Volume': 'musicAudio',
                    'SFX Volume': 'sfxAudio',
                };
            }
        }

        beforeAll(() => {
            document.body.innerHTML = `
        <audio id="masterAudio"></audio>
        <audio id="musicAudio"></audio>
        <audio id="sfxAudio"></audio>
        <img id="mainmenubackground" />
        <img id="greenCompleted" />
      `;
        });

        beforeEach(() => {
            mockGame = {
                width: 1920,
                height: 689,
                audioHandler: { menu: { playSound: jest.fn() } },
                menu: { pause: { isPaused: false }, ingameAudioSettings: {} },
                saveGameState: jest.fn(),
                canvas: {
                    width: 1920,
                    height: 689,
                    getBoundingClientRect: () => ({
                        left: 0,
                        top: 0,
                        width: 1920,
                        height: 689,
                    }),
                },
                input: { handleEscapeKey: jest.fn() },
                canSelect: true,
                canSelectForestMap: true,
                isPlayerInGame: true,
                gameCompleted: false,
            };

            ctx = {
                save: jest.fn(),
                restore: jest.fn(),
                drawImage: jest.fn(),
                fillRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                quadraticCurveTo: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),
                closePath: jest.fn(),
                fillText: jest.fn(),
            };

            const options = ['Master Volume', 'Music Volume', 'SFX Volume'];
            menu = new DummyAudioMenu(mockGame, options, 'Audio Test');
            menu.activateMenu();
        });

        test('initializeVolumeLevels sets up default volume levels', () => {
            expect(menu.volumeLevels).toEqual([100, 50, 75]);
        });

        test('updateSingleAudioVolume scales channels by master and propagates master changes', () => {
            menu.volumeLevels = [50, 80, 60];
            menu.updateSingleAudioVolume('masterAudio', 0);
            expect(document.getElementById('musicAudio').volume).toBeCloseTo(0.4);
            expect(document.getElementById('sfxAudio').volume).toBeCloseTo(0.3);
        });

        test('updateAudioVolume updates all audio elements when given an array of IDs', () => {
            document.body.innerHTML += `<audio id="a1"></audio><audio id="a2"></audio>`;
            menu.volumeLevels = [100, 50];
            menu.updateAudioVolume(['a1', 'a2'], 1);
            expect(document.getElementById('a1').volume).toBeCloseTo(0.5);
            expect(document.getElementById('a2').volume).toBeCloseTo(0.5);
        });

        test('updateAudioVolume updates all audio elements when given an object map', () => {
            document.body.innerHTML += `<audio id="l"></audio><audio id="r"></audio>`;
            menu.volumeLevels = [100, 75];
            menu.updateAudioVolume({ left: 'l', right: 'r' }, 1);
            expect(document.getElementById('l').volume).toBeCloseTo(0.75);
            expect(document.getElementById('r').volume).toBeCloseTo(0.75);
        });

        test('missing audio element logs an error', () => {
            console.error = jest.fn();
            menu.updateSingleAudioVolume('noSuchId', 1);
            expect(console.error).toHaveBeenCalledWith('Audio element not found for ID: noSuchId');
        });

        test('roundRect calls context.fill and context.stroke when requested', () => {
            const fctx = {
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                quadraticCurveTo: jest.fn(),
                closePath: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),
            };
            menu.roundRect(fctx, 1, 2, 3, 4, 5, true, true);
            expect(fctx.beginPath).toHaveBeenCalled();
            expect(fctx.fill).toHaveBeenCalled();
            expect(fctx.stroke).toHaveBeenCalled();
        });

        test('draw() renders one slider handle and percentage label per volume level', () => {
            const spyArc = jest.spyOn(ctx, 'arc');
            const spyFillText = jest.spyOn(ctx, 'fillText');
            menu.draw(ctx);
            expect(spyArc).toHaveBeenCalledTimes(menu.volumeLevels.length);
            expect(spyFillText).toHaveBeenCalledWith('100%', expect.any(Number), expect.any(Number));
            expect(spyFillText).toHaveBeenCalledWith('50%', expect.any(Number), expect.any(Number));
            expect(spyFillText).toHaveBeenCalledWith('75%', expect.any(Number), expect.any(Number));
        });

        test('draw() shows in-game overlay when current menu is ingameAudioSettings and paused', () => {
            menu.menuInGame = true;
            mockGame.currentMenu = mockGame.menu.ingameAudioSettings;
            mockGame.menu.pause.isPaused = true;
            menu.draw(ctx);
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, mockGame.width, mockGame.height);
        });

        test('draw() draws greenCompleted badge when gameCompleted and menu is not in-game', () => {
            mockGame.gameCompleted = true;
            menu.menuInGame = false;
            ctx.drawImage.mockClear();
            menu.draw(ctx);
            const calls = ctx.drawImage.mock.calls;
            const last = calls[calls.length - 1];
            expect(last[0]).toBe(menu.greenCompletedImage);
            expect(last[1]).toBe(10);
            expect(last[2]).toBe(10);
        });

        test('getState returns a deep copy and setState restores volume levels', () => {
            menu.volumeLevels = [10, 20, 30];
            const state = menu.getState();
            state.volumeLevels[0] = 999;
            expect(menu.volumeLevels[0]).toBe(10);

            const updSpy = jest.spyOn(menu, 'updateAudioVolume');
            menu.setState({ volumeLevels: [5, 6, 7] });
            expect(menu.volumeLevels).toEqual([5, 6, 7]);
            expect(updSpy).toHaveBeenCalled();
        });

        describe('keyboard volume controls', () => {
            beforeEach(() => {
                menu.selectedOption = 1;
                menu.volumeLevels[0] = 100;
                menu.volumeLevels[1] = 50;
            });

            test('ArrowRight increases volume for selected option and updates audio element', () => {
                menu.handleKeyDown({ key: 'ArrowRight', repeat: false });
                expect(menu.volumeLevels[1]).toBe(51);
                expect(document.getElementById('musicAudio').volume).toBeCloseTo(0.51);
            });

            test('ArrowLeft decreases volume for selected option and clamps at 0', () => {
                menu.volumeLevels[1] = 0;
                menu.handleKeyDown({ key: 'ArrowLeft', repeat: false });
                expect(menu.volumeLevels[1]).toBe(0);
            });

            test('mouse wheel scroll adjusts volume with correct sign', () => {
                menu.menuActive = true;
                menu.selectedOption = 1;
                menu.volumeLevels[1] = 50;
                menu.handleMouseWheel({ deltaY: -1, repeat: false });
                expect(menu.volumeLevels[1]).toBe(51);
                menu.handleMouseWheel({ deltaY: 1, repeat: false });
                expect(menu.volumeLevels[1]).toBe(50);
            });

            test('Enter triggers handleMenuSelection', () => {
                const selSpy = jest.spyOn(menu, 'handleMenuSelection');
                menu.handleKeyDown({ key: 'Enter' });
                expect(selSpy).toHaveBeenCalled();
            });

            test('non-volume keys do not call saveGameState', () => {
                mockGame.saveGameState.mockClear();
                menu.handleKeyDown({ key: 'a' });
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });
        });

        describe('mouse slider interactions', () => {
            test('click on slider updates volume from click position and saves state', () => {
                const { sliderX, sliderY } = createSliderGeometry(mockGame, 0);
                menu.selectedOption = 0;
                menu.volumeLevels[0] = 100;

                menu.handleMouseClick({
                    clientX: sliderX + 150,
                    clientY: sliderY + 12,
                });

                expect(menu.volumeLevels[0]).toBe(50);
                expect(mockGame.saveGameState).toHaveBeenCalled();
            });

            test('handleMouseClick outside slider only triggers base click and does not change volume', () => {
                mockGame.saveGameState.mockClear();
                const before = [...menu.volumeLevels];
                menu.handleMouseClick({ clientX: 0, clientY: 0 });
                expect(menu.volumeLevels).toEqual(before);
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            test('handleMouseClick is ignored when draggingSliderActive is true', () => {
                menu.draggingSliderActive = true;
                mockGame.saveGameState.mockClear();
                const before = [...menu.volumeLevels];
                menu.handleMouseClick({ clientX: 400, clientY: 300 });
                expect(menu.volumeLevels).toEqual(before);
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            test('handleMouseDown + drag + mouseUp adjusts volume and toggles dragging flags', () => {
                menu.selectedOption = 1;
                menu.volumeLevels[1] = 50;

                const { sliderX, sliderY } = createSliderGeometry(mockGame, 1);
                const handleRadius = 25 / 2;
                const handleX = sliderX + (300 - 2 * handleRadius) * 0.5;

                menu.handleMouseDown({
                    clientX: handleX,
                    clientY: sliderY + handleRadius,
                });
                expect(menu.draggingSlider).toBe(true);

                menu.handleMouseDrag({ clientX: sliderX + 300, clientY: 0 });
                expect(menu.volumeLevels[1]).toBe(100);
                expect(menu.draggingSliderActive).toBe(true);

                menu.handleMouseUp();
                expect(menu.draggingSlider).toBe(false);
                expect(menu.draggingSliderIndex).toBe(-1);
            });

            test('handleMouseWheel does nothing on last "Back" option', () => {
                menu.volumeLevels.push(null);
                menu.menuOptions.push('Back');
                menu.selectedOption = menu.menuOptions.length - 1;
                const before = [...menu.volumeLevels];
                menu.handleMouseWheel({ deltaY: -1, repeat: false });
                expect(menu.volumeLevels).toEqual(before);
            });

            test('handleMouseWheel does nothing when menuActive=false', () => {
                menu.menuActive = false;
                const before = [...menu.volumeLevels];
                menu.handleMouseWheel({ deltaY: -1 });
                expect(menu.volumeLevels).toEqual(before);
            });
        });

        describe('update() soundtrack behavior', () => {
            test('plays soundtrack when player is not in game', () => {
                mockGame.isPlayerInGame = false;
                mockGame.audioHandler.menu.playSound.mockClear();
                menu.update(16);
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('soundtrack');
            });

            test('does not play soundtrack when player is in game', () => {
                mockGame.isPlayerInGame = true;
                mockGame.audioHandler.menu.playSound.mockClear();
                menu.update(16);
                expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('soundtrack');
            });
        });

        test('delayedEnablePress sets canPressNow true after 10ms', () => {
            jest.useFakeTimers();
            menu.canPressNow = false;
            menu.delayedEnablePress();
            jest.advanceTimersByTime(10);
            expect(menu.canPressNow).toBe(true);
            jest.useRealTimers();
        });

        describe('saveGameState integration', () => {
            beforeEach(() => {
                mockGame.saveGameState.mockClear();
                menu.menuActive = true;
            });

            test('ArrowRight and ArrowLeft call saveGameState exactly once per key event', () => {
                menu.selectedOption = 1;
                menu.volumeLevels[1] = 50;

                menu.handleKeyDown({ key: 'ArrowRight', repeat: false });
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

                menu.handleKeyDown({ key: 'ArrowLeft', repeat: false });
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(2);
            });

            test('Enter does NOT call saveGameState (delegates to BaseMenu selection behavior only)', () => {
                menu.handleKeyDown({ key: 'Enter' });
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            test('mouse wheel on a volume option updates volume and saves once per event', () => {
                menu.selectedOption = 1;
                menu.volumeLevels[1] = 50;

                menu.handleMouseWheel({ deltaY: -1, repeat: false });
                expect(menu.volumeLevels[1]).toBe(51);
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

                menu.handleMouseWheel({ deltaY: 1, repeat: false });
                expect(menu.volumeLevels[1]).toBe(50);
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(2);
            });

            test('dragging the slider triggers saveGameState during drag updates', () => {
                mockGame.saveGameState.mockClear();

                menu.selectedOption = 1;
                menu.volumeLevels[1] = 50;

                const { sliderX, sliderY } = createSliderGeometry(mockGame, 1);
                const handleRadius = 25 / 2;
                const handleX = sliderX + (300 - 2 * handleRadius) * 0.5;

                menu.handleMouseDown({
                    clientX: handleX,
                    clientY: sliderY + handleRadius,
                });
                expect(menu.draggingSlider).toBe(true);

                menu.handleMouseDrag({ clientX: sliderX + 300, clientY: 0 });
                expect(menu.volumeLevels[1]).toBe(100);
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

                menu.handleMouseUp();
            });

            test('no save when menuActive=false for Arrow keys or mouse wheel', () => {
                menu.menuActive = false;
                mockGame.saveGameState.mockClear();

                menu.handleKeyDown({ key: 'ArrowRight', repeat: false });
                menu.handleMouseWheel({ deltaY: -1, repeat: false });

                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            test('no save on click routed through BaseMenu unless a slider was actually changed', () => {
                mockGame.saveGameState.mockClear();
                menu.handleMouseClick({ clientX: 0, clientY: 0 });
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            test('wheel on last non-volume option does not change volumes but still saves once (current behavior)', () => {
                menu.volumeLevels.push(null);
                menu.menuOptions.push('Back');
                menu.selectedOption = menu.menuOptions.length - 1;

                mockGame.saveGameState.mockClear();
                const before = [...menu.volumeLevels];
                menu.handleMouseWheel({ deltaY: -1, repeat: false });
                expect(menu.volumeLevels).toEqual(before);
                expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
            });
        });
    });
});
