import { getDefaultKeyBindings } from "../config/keyBindings.js";

function buildGameState(game) {
    return {
        currentMap: game.currentMap,
        isTutorialActive: game.isTutorialActive,

        map1Unlocked: game.map1Unlocked,
        map2Unlocked: game.map2Unlocked,
        map3Unlocked: game.map3Unlocked,
        map4Unlocked: game.map4Unlocked,
        map5Unlocked: game.map5Unlocked,
        map6Unlocked: game.map6Unlocked,
        map7Unlocked: game.map7Unlocked,
        bonusMap1Unlocked: game.bonusMap1Unlocked,
        bonusMap2Unlocked: game.bonusMap2Unlocked,
        bonusMap3Unlocked: game.bonusMap3Unlocked,
        gameCompleted: game.gameCompleted,

        audioSettingsState: game.menu.audioSettings.getState(),
        ingameAudioSettingsState: game.menu.ingameAudioSettings.getState(),
        currentSkin: game.menu.skins.currentSkin.id,
        selectedDifficulty: game.selectedDifficulty,

        keyBindings: game.keyBindings,
    };
}

export function saveGameState(game) {
    const gameState = buildGameState(game);

    try {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    } catch (e) {
        console.warn('Failed to save game state:', e);
    }
}

export function loadGameState(game) {
    const savedGameState = localStorage.getItem('gameState');
    if (!savedGameState) return;

    try {
        const gameState = JSON.parse(savedGameState);

        game.currentMap = gameState.currentMap ?? game.currentMap;
        game.isTutorialActive = gameState.isTutorialActive ?? game.isTutorialActive;

        game.map1Unlocked = gameState.map1Unlocked ?? game.map1Unlocked;
        game.map2Unlocked = gameState.map2Unlocked ?? game.map2Unlocked;
        game.map3Unlocked = gameState.map3Unlocked ?? game.map3Unlocked;
        game.map4Unlocked = gameState.map4Unlocked ?? game.map4Unlocked;
        game.map5Unlocked = gameState.map5Unlocked ?? game.map5Unlocked;
        game.map6Unlocked = gameState.map6Unlocked ?? game.map6Unlocked;
        game.map7Unlocked = gameState.map7Unlocked ?? game.map7Unlocked;
        game.bonusMap1Unlocked = gameState.bonusMap1Unlocked ?? game.bonusMap1Unlocked;
        game.bonusMap2Unlocked = gameState.bonusMap2Unlocked ?? game.bonusMap2Unlocked;
        game.bonusMap3Unlocked = gameState.bonusMap3Unlocked ?? game.bonusMap3Unlocked;
        game.gameCompleted = gameState.gameCompleted ?? game.gameCompleted;

        if (gameState.audioSettingsState) {
            game.menu.audioSettings.setState(gameState.audioSettingsState);
        }
        if (gameState.ingameAudioSettingsState) {
            game.menu.ingameAudioSettings.setState(gameState.ingameAudioSettingsState);
        }
        if (gameState.currentSkin) {
            const skinId = gameState.currentSkin;
            game.menu.skins.setCurrentSkinById(skinId);
        }
        if (gameState.selectedDifficulty) {
            game.menu.levelDifficulty.setDifficulty(gameState.selectedDifficulty);
            game.selectedDifficulty = gameState.selectedDifficulty;
        }

        if (gameState.keyBindings) {
            const defaults = getDefaultKeyBindings();
            game.keyBindings = { ...defaults, ...gameState.keyBindings };
        }
    } catch (e) {
        console.warn('Failed to load game state, clearing corrupted data:', e);
        localStorage.removeItem('gameState');
    }
}

export function clearSavedData(game) {
    localStorage.removeItem('gameState');
    game.isTutorialActive = true;

    game.map1Unlocked = true;
    game.map2Unlocked = false;
    game.map3Unlocked = false;
    game.map4Unlocked = false;
    game.map5Unlocked = false;
    game.map6Unlocked = false;
    game.map7Unlocked = false;
    game.bonusMap1Unlocked = false;
    game.bonusMap2Unlocked = false;
    game.bonusMap3Unlocked = false;
    game.gameCompleted = false;

    game.menu.forestMap.resetSelectedCircleIndex();
    game.menu.enemyLore.currentPage = 0;
    game.menu.levelDifficulty.setDifficulty('Normal');
    game.selectedDifficulty = 'Normal';

    game.menu.skins.currentSkin = game.menu.skins.defaultSkin;
    game.menu.skins.setCurrentSkinById('defaultSkin');

    game.menu.audioSettings.setState({
        volumeLevels: [75, 10, 90, 90, 70, 60, null],
    });
    game.menu.ingameAudioSettings.setState({
        volumeLevels: [30, 80, 60, 40, 80, 65, null],
    });

    game.keyBindings = getDefaultKeyBindings();

    saveGameState(game);
}
