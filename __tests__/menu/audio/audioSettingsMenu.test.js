import { AudioSettingsMenu } from '../../../game/menu/audio/audioSettingsMenu.js';

describe('AudioSettingsMenu', () => {
  let menu, mockGame;
  const menuMapping = { m1: 'm1', m2: 'm2' };
  const cutsceneMusicMapping = { cm1: 'cm1' };
  const cutsceneSFXMapping = { cs1: 'cs1' };
  const cutsceneDialogueMapping = { cd1: 'cd1' };

  beforeAll(() => {
    document.body.innerHTML = `
      <img id="mainmenubackground" />
      <img id="greenCompleted" />
    `;
  });

  beforeEach(() => {
    mockGame = {
      width: 1920, height: 689,
      audioHandler: {
        menu: {
          getSoundsMapping: jest.fn(() => menuMapping),
          soundsMapping: {
            optionSelectedSound: 'selSound',
            optionHoveredSound: 'hovSound',
            soundtrack: 'trackSound'
          },
          playSound: jest.fn()
        },
        cutsceneMusic: {
          getSoundsMapping: jest.fn(() => cutsceneMusicMapping)
        },
        cutsceneSFX: {
          getSoundsMapping: jest.fn(() => cutsceneSFXMapping)
        },
        cutsceneDialogue: {
          getSoundsMapping: jest.fn(() => cutsceneDialogueMapping)
        }
      },
      menu: {
        main: { activateMenu: jest.fn() },
        settings: { activateMenu: jest.fn() }
      },
      saveGameState: jest.fn(),
      canvas: {
        width: 1920, height: 689,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 })
      },
      input: { handleEscapeKey: jest.fn() },
      canSelect: true,
      canSelectForestMap: true,
      isPlayerInGame: true,
      gameCompleted: false
    };

    menu = new AudioSettingsMenu(mockGame);
    menu.activateMenu();
  });

  test('constructor sets menuOptions, title, and default selectedOption', () => {
    expect(menu.menuOptions).toEqual([
      'Master Volume',
      'Menu Music',
      'Option Selected',
      'Cutscene Music',
      'Cutscene SFX',
      'Cutscene Dialogue',
      'Go Back'
    ]);
    expect(menu.title).toBe('Audio Settings');
    expect(menu.selectedOption).toBe(0);
  });

  test('initializeVolumeLevels sets the correct defaults and aligns with menu options', () => {
    expect(menu.volumeLevels).toEqual([75, 10, 90, 90, 70, 60, null]);
    expect(menu.volumeLevels.length).toBe(menu.menuOptions.length);
    const goBackIndex = menu.menuOptions.indexOf('Go Back');
    expect(menu.volumeLevels[goBackIndex]).toBeNull();
  });

  test('initializeAudioMap merges all mappings correctly', () => {
    const map = menu.audioMap;

    expect(map['Master Volume']).toEqual({
      ...menuMapping,
      ...cutsceneMusicMapping,
      ...cutsceneSFXMapping,
      ...cutsceneDialogueMapping
    });

    expect(map['Option Selected']).toEqual([
      'selSound',
      'hovSound'
    ]);
    expect(map['Option Selected']).toHaveLength(2);

    expect(map['Menu Music']).toBe('trackSound');
    expect(map['Cutscene Music']).toEqual(cutsceneMusicMapping);
    expect(map['Cutscene SFX']).toEqual(cutsceneSFXMapping);
    expect(map['Cutscene Dialogue']).toEqual(cutsceneDialogueMapping);
  });

  describe('handleMenuSelection()', () => {
    beforeEach(() => {
      mockGame.audioHandler.menu.playSound.mockClear();
      mockGame.menu.main.activateMenu.mockClear();
      mockGame.menu.settings.activateMenu.mockClear();
      menu.canPressNow = false;
    });

    test('non-"Go Back" options do nothing special (no navigation)', () => {
      menu.selectedOption = 2;
      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
      expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();
      expect(mockGame.menu.settings.activateMenu).not.toHaveBeenCalled();
      expect(menu.canPressNow).toBe(false);
    });

    test('"Go Back" option plays select sound (via super), navigates to Settings(0), and sets canPressNow', () => {
      const goBackIndex = menu.menuOptions.indexOf('Go Back');
      menu.selectedOption = goBackIndex;

      menu.handleMenuSelection();

      expect(mockGame.audioHandler.menu.playSound)
        .toHaveBeenCalledWith('optionSelectedSound', false, true);

      expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(0);
      expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();

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
