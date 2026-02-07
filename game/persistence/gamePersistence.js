import { getDefaultKeyBindings } from "../config/keyBindings.js";
import { COSMETIC_SLOTS } from "../config/skins.js";

const SAVE_KEY = "gameState";

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
        glacikalDefeated: game.glacikalDefeated,
        elyvorgDefeated: game.elyvorgDefeated,
        ntharaxDefeated: game.ntharaxDefeated,

        audioSettingsState: game.menu.audioSettings.getState(),

        currentSkinId: game.menu.skins.getCurrentSkinId(),
        currentCosmetics: {
            [COSMETIC_SLOTS.HEAD]: game.menu.skins.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD),
            [COSMETIC_SLOTS.NECK]: game.menu.skins.getCurrentCosmeticKey(COSMETIC_SLOTS.NECK),
            [COSMETIC_SLOTS.EYES]: game.menu.skins.getCurrentCosmeticKey(COSMETIC_SLOTS.EYES),
            [COSMETIC_SLOTS.FACE]: game.menu.skins.getCurrentCosmeticKey(COSMETIC_SLOTS.FACE),
        },

        selectedDifficulty: game.selectedDifficulty,
        keyBindings: game.keyBindings,
        records: game.records,
    };
}

export function saveGameState(game) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(buildGameState(game)));
    } catch (e) {
        console.warn("Failed to save game state:", e);
    }
}

export function loadGameState(game) {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
        clearSavedData(game);
        return;
    }

    try {
        const gameState = JSON.parse(saved);

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

        game.glacikalDefeated = gameState.glacikalDefeated ?? game.glacikalDefeated;
        game.elyvorgDefeated = gameState.elyvorgDefeated ?? game.elyvorgDefeated;
        game.ntharaxDefeated = gameState.ntharaxDefeated ?? game.ntharaxDefeated;

        if (gameState.audioSettingsState) {
            game.menu.audioSettings.setState(gameState.audioSettingsState);
        }

        game.menu.skins.setCurrentSkinById(gameState.currentSkinId || "defaultSkin");

        const c = gameState.currentCosmetics || {};
        game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, c[COSMETIC_SLOTS.HEAD] || "none");
        game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.NECK, c[COSMETIC_SLOTS.NECK] || "none");
        game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.EYES, c[COSMETIC_SLOTS.EYES] || "none");
        game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.FACE, c[COSMETIC_SLOTS.FACE] || "none");

        if (gameState.selectedDifficulty) {
            game.menu.levelDifficulty.setDifficulty(gameState.selectedDifficulty);
            game.selectedDifficulty = gameState.selectedDifficulty;
        }

        if (gameState.keyBindings) {
            const defaults = getDefaultKeyBindings();
            game.keyBindings = { ...defaults, ...gameState.keyBindings };
        }

        if (gameState.records) {
            game.records = { ...game.records, ...gameState.records };
        }
    } catch (e) {
        console.warn("Failed to load game state, clearing corrupted data:", e);
        localStorage.removeItem(SAVE_KEY);
        clearSavedData(game);
    }
}

export function clearSavedData(game) {
    localStorage.removeItem(SAVE_KEY);

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
    game.glacikalDefeated = false;
    game.elyvorgDefeated = false;
    game.ntharaxDefeated = false;

    game.menu.forestMap.resetSelectedCircleIndex();
    game.menu.enemyLore.currentPage = 0;

    game.menu.levelDifficulty.setDifficulty("Normal");
    game.selectedDifficulty = "Normal";

    game.menu.skins.setCurrentSkinById("defaultSkin");
    game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, "none");
    game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.NECK, "none");
    game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.EYES, "none");
    game.menu.skins.setCurrentCosmeticByKey(COSMETIC_SLOTS.FACE, "none");

    game.menu.audioSettings.setState({
        tabData: {
            MENU: {
                volumeLevels: [50, 50, 50, 50, null],
                muted: [false, false, false, false, null],
            },
            CUTSCENE: {
                volumeLevels: [50, 50, 50, 50, null],
                muted: [false, false, false, false, null],
            },
            INGAME: {
                volumeLevels: [50, 50, 50, 50, 50, 50, null],
                muted: [false, false, false, false, false, false, null],
            },
        },
    });

    game.keyBindings = getDefaultKeyBindings();

    game.records = {
        Map1: { clearMs: null, bossMs: null },
        Map2: { clearMs: null, bossMs: null },
        Map3: { clearMs: null, bossMs: null },
        Map4: { clearMs: null, bossMs: null },
        Map5: { clearMs: null, bossMs: null },
        Map6: { clearMs: null, bossMs: null },
        Map7: { clearMs: null, bossMs: null },
        BonusMap1: { clearMs: null, bossMs: null },
        BonusMap2: { clearMs: null, bossMs: null },
        BonusMap3: { clearMs: null, bossMs: null },
    };

    saveGameState(game);
}
