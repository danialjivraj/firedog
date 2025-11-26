import { Elyvorg } from "./elyvorg.js";
import { Glacikal } from "./glacikal.js";

const BOSS_CONFIG = {
    BonusMap1: {
        id: "glacikal",
        type: Glacikal,
        gate: {
            mode: "coinsAndDistance",
            minDistance: 100,
            minCoins: 100,
        },
    },
    Map6: {
        id: "elyvorg",
        type: Elyvorg,
        gate: {
            mode: "coinsAndDistance",
            minDistance: 100,
            minCoins: 100,
        },
    },
};

export class BossManager {
    constructor(game) {
        this.game = game;
        this.state = {
            current: null,
            id: null,
            map: null,
            spawned: false,
            isVisible: false,
            talkToBoss: false,
            preFight: false,
            inFight: false,
            postFight: false,
            runAway: false,
            screenEffect: {
                active: false,
                rgb: [0, 50, 0],
                opacity: 0,
                fadeInSpeed: 0.00298,
            },
            dialogueBeforeOnce: true,
            dialogueAfterOnce: false,
            dialogueAfterLeaving: false,
            startAfterDialogueWhenAnimEnds: false,
            progressComplete: false,
        };
    }

    get hasActiveBoss() {
        return !!this.state.current;
    }

    get isBossVisible() {
        return this.state.isVisible;
    }

    get bossInFight() {
        return this.state.inFight;
    }

    getConfigForCurrentMap() {
        const game = this.game;

        const mapName =
            game.currentMap ||
            (game.background &&
                game.background.constructor &&
                game.background.constructor.name) ||
            null;

        if (!mapName) return null;

        const cfg = BOSS_CONFIG[mapName];
        if (!cfg || !cfg.gate) return null;

        return {
            id: cfg.id,
            type: cfg.type,
            gate: cfg.gate,
        };
    }

    getGateForCurrentMap() {
        const cfg = this.getConfigForCurrentMap();
        return cfg ? cfg.gate : null;
    }

    hasBossConfiguredForCurrentMap() {
        return !!this.getConfigForCurrentMap();
    }

    bossIsEngaged() {
        const boss = this.state;
        if (!boss.id) return false;

        const config = this.getConfigForCurrentMap();
        if (!config || boss.map !== this.game.currentMap) return false;

        return (
            boss.talkToBoss ||
            boss.preFight ||
            boss.inFight ||
            boss.postFight ||
            boss.runAway
        );
    }

    bossGateReached() {
        const gate = this.getGateForCurrentMap();
        if (!gate) return false;

        const coins = this.game.coins;
        const dist =
            (this.game.background &&
                this.game.background.totalDistanceTraveled) ||
            0;

        const minCoins = gate.minCoins ?? 0;
        const minDistance = gate.minDistance ?? 0;

        switch (gate.mode) {
            case "coins":
                return coins >= minCoins;

            case "distance":
                return dist >= minDistance;

            case "coinsAndDistance":
                return coins >= minCoins && dist >= minDistance;

            default:
                return coins >= minCoins;
        }
    }

    spawnBossIfNeeded() {
        const game = this.game;
        const config = this.getConfigForCurrentMap();
        if (!config) return false;

        if (this.state.spawned || this.hasActiveBoss) return false;

        if (!this.bossGateReached()) return false;

        if (game.enemies.length !== 0) return false;

        const bossInstance = new config.type(game);

        this.state.current = bossInstance;
        this.state.id = config.id;
        this.state.map = game.currentMap;
        this.state.spawned = true;
        this.state.talkToBoss = true;

        game.enemies.push(bossInstance);
        return true;
    }

    canSpawnNormalEnemies() {
        if (!this.hasBossConfiguredForCurrentMap()) return true;

        if (this.bossIsEngaged()) return false;

        if (this.bossGateReached()) return false;

        return true;
    }

    resetState() {
        this.state = {
            current: null,
            id: null,
            map: null,
            spawned: false,
            isVisible: false,
            talkToBoss: false,
            preFight: false,
            inFight: false,
            postFight: false,
            runAway: false,
            screenEffect: {
                active: false,
                rgb: [0, 50, 0],
                opacity: 0,
                fadeInSpeed: 0.00298,
            },
            dialogueBeforeOnce: true,
            dialogueAfterOnce: false,
            dialogueAfterLeaving: false,
            startAfterDialogueWhenAnimEnds: false,
            progressComplete: false,
        };
    }
}
