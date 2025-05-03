import { AudioMenu } from '../../game/menu/baseMenu.js';

describe('AudioMenu abstract methods enforcement', () => {
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

    test('throws if initializeVolumeLevels not implemented', () => {
        class BadMenu extends AudioMenu { }
        expect(() => new BadMenu(mockGame, [], 'Bad'))
            .toThrow('initializeVolumeLevels');
    });

    test('throws if initializeAudioMap not implemented', () => {
        class OnlyLevelsMenu extends AudioMenu {
            initializeVolumeLevels() { }
        }
        expect(() => new OnlyLevelsMenu(mockGame, [], 'Bad'))
            .toThrow('initializeAudioMap');
    });
});

describe('AudioMenu volume logic', () => {
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
                width: 1920, height: 689,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 689 })
            },
            input: { handleEscapeKey: jest.fn() },
            canSelect: true,
            canSelectForestMap: true,
            isPlayerInGame: true,
            gameCompleted: false
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
            fillText: jest.fn()
        };

        const options = ['Master Volume', 'Music Volume', 'SFX Volume'];
        menu = new DummyAudioMenu(mockGame, options, 'Audio Test');
        menu.activateMenu();
    });

    test('initializeVolumeLevels sets up default levels', () => {
        expect(menu.volumeLevels).toEqual([100, 50, 75]);
    });

    test('updateSingleAudioVolume scales channels by master and propagates', () => {
        menu.volumeLevels = [50, 80, 60];
        menu.updateSingleAudioVolume('masterAudio', 0);
        expect(document.getElementById('musicAudio').volume).toBeCloseTo(0.4);
        expect(document.getElementById('sfxAudio').volume).toBeCloseTo(0.3);
    });

    test('updateAudioVolume accepts array of IDs', () => {
        document.body.innerHTML += `<audio id="a1"></audio><audio id="a2"></audio>`;
        menu.volumeLevels = [100, 50];
        menu.updateAudioVolume(['a1', 'a2'], 1);
        expect(document.getElementById('a1').volume).toBeCloseTo(0.5);
        expect(document.getElementById('a2').volume).toBeCloseTo(0.5);
    });

    test('updateAudioVolume accepts object maps', () => {
        document.body.innerHTML += `<audio id="l"></audio><audio id="r"></audio>`;
        menu.volumeLevels = [100, 75];
        menu.updateAudioVolume({ left: 'l', right: 'r' }, 1);
        expect(document.getElementById('l').volume).toBeCloseTo(0.75);
        expect(document.getElementById('r').volume).toBeCloseTo(0.75);
    });

    test('missing audio element logs an error', () => {
        console.error = jest.fn();
        menu.updateSingleAudioVolume('noSuchId', 1);
        expect(console.error)
            .toHaveBeenCalledWith('Audio element not found for ID: noSuchId');
    });

    test('roundRect calls context.fill and stroke when requested', () => {
        const fctx = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            quadraticCurveTo: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn()
        };
        menu.roundRect(fctx, 1, 2, 3, 4, 5, true, true);
        expect(fctx.beginPath).toHaveBeenCalled();
        expect(fctx.fill).toHaveBeenCalled();
        expect(fctx.stroke).toHaveBeenCalled();
    });

    test('draw() renders one slider handle and percentage per level', () => {
        const spyArc = jest.spyOn(ctx, 'arc');
        const spyFillText = jest.spyOn(ctx, 'fillText');
        menu.draw(ctx);
        expect(spyArc).toHaveBeenCalledTimes(menu.volumeLevels.length);
        expect(spyFillText).toHaveBeenCalledWith('100%', expect.any(Number), expect.any(Number));
        expect(spyFillText).toHaveBeenCalledWith('50%', expect.any(Number), expect.any(Number));
        expect(spyFillText).toHaveBeenCalledWith('75%', expect.any(Number), expect.any(Number));
    });

    test('draw() shows in‑game overlay when paused', () => {
        menu.menuInGame = true;
        mockGame.currentMenu = mockGame.menu.ingameAudioSettings;
        mockGame.menu.pause.isPaused = true;
        menu.draw(ctx);
        expect(ctx.fillRect).toHaveBeenCalledWith(
            0, 0, mockGame.width, mockGame.height
        );
    });

    test('draw() draws greenCompleted badge when gameCompleted and not in‑game', () => {
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

    test('getState returns a deep copy and setState restores volumes', () => {
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

        test('ArrowRight increases volume and updates audio', () => {
            menu.handleKeyDown({ key: 'ArrowRight', repeat: false });
            expect(menu.volumeLevels[1]).toBe(51);
            expect(document.getElementById('musicAudio').volume).toBeCloseTo(0.51);
        });

        test('ArrowLeft decreases volume and clamps at 0', () => {
            menu.volumeLevels[1] = 0;
            menu.handleKeyDown({ key: 'ArrowLeft', repeat: false });
            expect(menu.volumeLevels[1]).toBe(0);
        });

        test('scroll up/down adjusts volume sign‑correctly', () => {
            menu.menuActive = true;
            menu.selectedOption = 1;
            menu.volumeLevels[1] = 50;
            menu.handleMouseWheel({ deltaY: -1, repeat: false }); // up
            expect(menu.volumeLevels[1]).toBe(51);
            menu.handleMouseWheel({ deltaY: 1, repeat: false });  // down
            expect(menu.volumeLevels[1]).toBe(50);
        });

        test('Enter triggers handleMenuSelection', () => {
            const selSpy = jest.spyOn(menu, 'handleMenuSelection');
            menu.handleKeyDown({ key: 'Enter' });
            expect(selSpy).toHaveBeenCalled();
        });

        test('always calls saveGameState at end of keyDown', () => {
            mockGame.saveGameState.mockClear();
            menu.handleKeyDown({ key: 'a' });
            expect(mockGame.saveGameState).toHaveBeenCalled();
        });
    });

    describe('mouse slider interactions', () => {
        test('click on slider updates volume and saves state', () => {
            const sliderX = mockGame.width / 2 - 30;
            const sliderY = mockGame.height / 2 - 155;
            menu.selectedOption = 0;
            menu.volumeLevels[0] = 100;
            menu.handleMouseClick({
                clientX: sliderX + 150,
                clientY: sliderY + 12
            });
            expect(menu.volumeLevels[0]).toBe(50);
            expect(mockGame.saveGameState).toHaveBeenCalled();
        });

        test('handleMouseClick outside slider only triggers base click once', () => {
            mockGame.saveGameState.mockClear();
            const before = [...menu.volumeLevels];
            menu.handleMouseClick({ clientX: 0, clientY: 0 });
            expect(menu.volumeLevels).toEqual(before);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        test('handleMouseClick is ignored when draggingSliderActive', () => {
            menu.draggingSliderActive = true;
            mockGame.saveGameState.mockClear();
            const before = [...menu.volumeLevels];
            menu.handleMouseClick({ clientX: 400, clientY: 300 });
            expect(menu.volumeLevels).toEqual(before);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        test('handleMouseDown + drag + up works end‑to‑end', () => {
            menu.selectedOption = 1;
            menu.volumeLevels[1] = 50;
            const sliderX = mockGame.width / 2 - 30;
            const sliderY = mockGame.height / 2 + 60 - 155;
            const handleRadius = 25 / 2;
            const handleX = sliderX + (300 - 2 * handleRadius) * 0.5;

            menu.handleMouseDown({
                clientX: handleX,
                clientY: sliderY + handleRadius
            });
            expect(menu.draggingSlider).toBe(true);

            menu.handleMouseDrag({ clientX: sliderX + 300, clientY: 0 });
            expect(menu.volumeLevels[1]).toBe(100);
            expect(menu.draggingSliderActive).toBe(true);

            menu.handleMouseUp();
            expect(menu.draggingSlider).toBe(false);
            expect(menu.draggingSliderIndex).toBe(-1);
        });

        test('handleMouseWheel does nothing on last option', () => {
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

    describe('update() sound playback', () => {
        test('plays soundtrack when not in game', () => {
            mockGame.isPlayerInGame = false;
            mockGame.audioHandler.menu.playSound.mockClear();
            menu.update(16);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('soundtrack');
        });

        test('does not play soundtrack when in game', () => {
            mockGame.isPlayerInGame = true;
            mockGame.audioHandler.menu.playSound.mockClear();
            menu.update(16);
            expect(mockGame.audioHandler.menu.playSound)
                .not.toHaveBeenCalledWith('soundtrack');
        });
    });

    test('delayedEnablePress sets canPressNow after 10ms', () => {
        jest.useFakeTimers();
        menu.canPressNow = false;
        menu.delayedEnablePress();
        jest.advanceTimersByTime(10);
        expect(menu.canPressNow).toBe(true);
        jest.useRealTimers();
    });
});
