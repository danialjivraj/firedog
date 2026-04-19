import {
    Map1PenguinIngameCutscene, Map2PenguinIngameCutscene, Map3PenguinIngameCutscene,
    Map4PenguinIngameCutscene, Map5PenguinIngameCutscene, Map6PenguinIngameCutscene, Map7PenguinIngameCutscene,
    BonusMap1PenguinIngameCutscene, BonusMap2PenguinIngameCutscene, BonusMap3PenguinIngameCutscene,
} from "../cutscene/ingameCutscenes/penguiniCutscenes.js";
import {
    Map1EndCutscene, Map2EndCutscene, Map3EndCutscene,
    Map4EndCutscene, Map5EndCutscene, Map6EndCutscene, Map7EndCutscene,
    BonusMap1EndCutscene, BonusMap2EndCutscene, BonusMap3EndCutscene
} from "../cutscene/storyCutscenes.js";
import {
    Map7ElyvorgIngameCutsceneBeforeFight,
    Map7ElyvorgIngameCutsceneAfterFight
} from "../cutscene/ingameCutscenes/elyvorgCutscenes.js";
import {
    BonusMap1GlacikalIngameCutsceneBeforeFight,
    BonusMap1GlacikalIngameCutsceneAfterFight
} from "../cutscene/ingameCutscenes/glacikalCutscenes.js";
import {
    BonusMap3NTharaxIngameCutsceneBeforeFight,
    BonusMap3NTharaxIngameCutsceneAfterFight
} from "../cutscene/ingameCutscenes/ntharaxCutscene.js";

export const PENGUIN_CUTSCENES = {
    Map1: Map1PenguinIngameCutscene,
    Map2: Map2PenguinIngameCutscene,
    Map3: Map3PenguinIngameCutscene,
    Map4: Map4PenguinIngameCutscene,
    Map5: Map5PenguinIngameCutscene,
    Map6: Map6PenguinIngameCutscene,
    Map7: Map7PenguinIngameCutscene,
    BonusMap1: BonusMap1PenguinIngameCutscene,
    BonusMap2: BonusMap2PenguinIngameCutscene,
    BonusMap3: BonusMap3PenguinIngameCutscene,
};

export const END_CUTSCENES = {
    Map1: Map1EndCutscene,
    Map2: Map2EndCutscene,
    Map3: Map3EndCutscene,
    Map4: Map4EndCutscene,
    Map5: Map5EndCutscene,
    Map6: Map6EndCutscene,
    Map7: Map7EndCutscene,
    BonusMap1: BonusMap1EndCutscene,
    BonusMap2: BonusMap2EndCutscene,
    BonusMap3: BonusMap3EndCutscene,
};

export const BOSS_CUTSCENE_CONFIGS = [
    {
        mapName: "BonusMap1",
        bossId: "glacikal",
        beforeCutscene: BonusMap1GlacikalIngameCutsceneBeforeFight,
        afterCutscene: BonusMap1GlacikalIngameCutsceneAfterFight,
    },
    {
        mapName: "BonusMap3",
        bossId: "ntharax",
        beforeCutscene: BonusMap3NTharaxIngameCutsceneBeforeFight,
        afterCutscene: BonusMap3NTharaxIngameCutsceneAfterFight,
    },
    {
        mapName: "Map7",
        bossId: "elyvorg",
        beforeCutscene: Map7ElyvorgIngameCutsceneBeforeFight,
        afterCutscene: Map7ElyvorgIngameCutsceneAfterFight,
    },
];

export const CABIN_ENTRANCE_OVERRIDES = {
    Map3: { doorSound: "submarineDoorOpening" },
    Map7: { enterOffset: 570, doorSound: "walkingCutsceneSound" },
};
