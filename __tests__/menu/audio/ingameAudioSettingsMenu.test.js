import { IngameAudioSettingsMenu } from '../../../game/menu/audio/ingameAudioSettingsMenu.js';

describe('IngameAudioSettingsMenu', () => {
    let menu, mockGame;
    const mapSoundtrackMapping = { ms1: 'ms1' };
    const enemySFXMapping = { es1: 'es1' };
    const firedogSFXMapping = { fs1: 'fs1' };
    const explosionSFXMapping = { ex1: 'ex1' };
    const powerUpAndDownSFXMapping = { pu1: 'pu1' };

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackground" />
      <img id="greenCompleted" />
    `;
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,
            audioHandler: {
                mapSoundtrack: { getSoundsMapping: jest.fn(() => mapSoundtrackMapping) },
                enemySFX: { getSoundsMapping: jest.fn(() => enemySFXMapping) },
                firedogSFX: { getSoundsMapping: jest.fn(() => firedogSFXMapping) },
                explosionSFX: { getSoundsMapping: jest.fn(() => explosionSFXMapping) },
                powerUpAndDownSFX: { getSoundsMapping: jest.fn(() => powerUpAndDownSFXMapping) },
                menu: { playSound: jest.fn() }
            },
            menu: {
                pause: { activateMenu: jest.fn() }
            },
            saveGameState: jest.fn(),
            canvas: {
                width: 1920, height: 689,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
            },
            input: { handleEscapeKey: jest.fn() },
            canSelect: true,
            canSelectForestMap: true,
            isPlayerInGame: true,
            gameCompleted: false
        };

        menu = new IngameAudioSettingsMenu(mockGame);
        menu.activateMenu();
    });

    test('constructor sets menuOptions, title, menuInGame flag, and selectedOption', () => {
        expect(menu.menuOptions).toEqual([
            'In-game Master Volume',
            'Map Soundtrack',
            'Firedog SFX',
            'Enemy SFX',
            'Collision SFX',
            'Power Up/Down SFX',
            'Go Back'
        ]);
        expect(menu.title).toBe('Ingame Audio Settings');
        expect(menu.menuInGame).toBe(true);
        expect(menu.selectedOption).toBe(0);
    });

    test('initializeVolumeLevels sets up correct defaults', () => {
        expect(menu.volumeLevels).toEqual([30, 80, 60, 40, 80, 65, null]);
    });

    test('initializeAudioMap merges all mappings correctly', () => {
        const map = menu.audioMap;

        expect(map['In-game Master Volume']).toEqual({
            ...mapSoundtrackMapping,
            ...enemySFXMapping,
            ...firedogSFXMapping,
            ...explosionSFXMapping,
            ...powerUpAndDownSFXMapping
        });

        expect(map['Map Soundtrack']).toEqual(mapSoundtrackMapping);
        expect(map['Firedog SFX']).toEqual(firedogSFXMapping);
        expect(map['Enemy SFX']).toEqual(enemySFXMapping);
        expect(map['Collision SFX']).toEqual(explosionSFXMapping);
        expect(map['Power Up/Down SFX']).toEqual(powerUpAndDownSFXMapping);
        expect(map['Go Back']).toBeUndefined();
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            mockGame.audioHandler.menu.playSound.mockClear();
            mockGame.menu.pause.activateMenu.mockClear();
            menu.canPressNow = true;
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.useRealTimers();
        });

        test('does nothing for non‑"Go Back" options', () => {
            menu.selectedOption = 2; // Firedog SFX
            menu.handleMenuSelection();

            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
            expect(mockGame.menu.pause.activateMenu).not.toHaveBeenCalled();
            expect(menu.canPressNow).toBe(true);
        });

        test('"Go Back" triggers sound, delayedEnablePress, pause.activateMenu(2), and resets canPressNow', () => {
            const backIndex = menu.menuOptions.indexOf('Go Back');
            menu.selectedOption = backIndex;

            menu.handleMenuSelection();

            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);

            expect(menu.canPressNow).toBe(false);

            expect(mockGame.menu.pause.activateMenu).toHaveBeenCalledWith(2);

            jest.advanceTimersByTime(10);
            expect(menu.canPressNow).toBe(true);
        });
    });

    test('null volume level for "Go Back" means no slider exists', () => {
        const goBackIndex = menu.menuOptions.indexOf('Go Back');
        expect(menu.volumeLevels[goBackIndex]).toBeNull();
        expect(() => menu.updateAudioVolume(menu.audioMap['Go Back'], goBackIndex))
            .not.toThrow();
    });
});
