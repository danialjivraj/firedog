import { Elyvorg } from "./elyvorg/elyvorg.js";
import { Glacikal } from "./glacikal/glacikal.js";
import { NTharax } from "./ntharax/ntharax.js";
import { screenColourFadeIn, screenColourFadeOut } from "../../../animations/screenColourFade.js";
import { FULL_ENERGY } from "../../../config/constants.js";
import { formatTimeMs } from "../../../utils/formatTime.js";

const BOSS_CONFIG = {
    BonusMap1: {
        id: "glacikal",
        type: Glacikal,
        gate: {
            mode: "coinsAndDistance",
            minDistance: 200,
            minCoins: 200,
        },
    },
    Map7: {
        id: "elyvorg",
        type: Elyvorg,
        gate: {
            mode: "coinsAndDistance",
            minDistance: 220,
            minCoins: 240,
        },
    },
    BonusMap3: {
        id: "ntharax",
        type: NTharax,
        gate: {
            mode: "coinsAndDistance",
            minDistance: 240,
            minCoins: 260,
        },
    },
};

function createInitialScreenEffect() {
    return {
        active: false,
        rgb: [0, 50, 0],
        opacity: 0,
        fadeInSpeed: 0.00298,
        currentId: null,
        stack: [],
        fromRgb: null,
        targetRgb: null,
        colorLerpT: 1,
        colorLerpSpeed: 0.04,
    };
}

export class BossManager {
    constructor(game) {
        this.game = game;
        this.bossTime = 0;
        this._bossFightWasActive = false;
        this._bossDefeatRecorded = false;
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
            screenEffect: createInitialScreenEffect(),
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

    getGateForMapName(mapName) {
        if (!mapName) return null;
        const cfg = BOSS_CONFIG[mapName];
        return cfg && cfg.gate ? cfg.gate : null;
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

        if (game.powerUps.length !== 0 || game.powerDowns.length !== 0) return false;

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

    requestScreenEffect(id, { rgb, fadeInSpeed, colorLerpSpeed } = {}) {
        const effect = this.state.screenEffect;

        const idx = effect.stack.findIndex(e => e.id === id);
        const layer = {
            id,
            rgb: rgb ?? (idx !== -1 ? effect.stack[idx].rgb : effect.rgb),
            fadeInSpeed: fadeInSpeed ?? effect.fadeInSpeed,
            colorLerpSpeed: colorLerpSpeed ?? effect.colorLerpSpeed,
        };

        if (idx !== -1) {
            effect.stack[idx] = layer;
        } else {
            effect.stack.push(layer);
        }

        const prevId = effect.currentId;
        const hadPrev = effect.active && prevId != null;

        const top = effect.stack[effect.stack.length - 1];

        effect.currentId = top.id;
        effect.active = true;

        effect.fadeInSpeed = top.fadeInSpeed;
        effect.colorLerpSpeed = top.colorLerpSpeed;

        if (!hadPrev) {
            effect.rgb = top.rgb;
            effect.fromRgb = top.rgb;
            effect.targetRgb = top.rgb;
            effect.colorLerpT = 1;
            effect.opacity = 0;
            return;
        }

        if (prevId === top.id) {
            effect.rgb = top.rgb;
            effect.fromRgb = top.rgb;
            effect.targetRgb = top.rgb;
            effect.colorLerpT = 1;
            return;
        }

        effect.fromRgb = effect.rgb || top.rgb;
        effect.targetRgb = top.rgb;
        effect.colorLerpT = 0;
    }

    releaseScreenEffect(id) {
        const effect = this.state.screenEffect;
        const prevId = effect.currentId;

        effect.stack = effect.stack.filter(e => e.id !== id);

        if (effect.stack.length === 0) {
            effect.currentId = null;
            effect.active = false;
            return;
        }

        const top = effect.stack[effect.stack.length - 1];
        const hadPrev = effect.active && prevId != null;

        effect.currentId = top.id;
        effect.active = true;
        effect.fadeInSpeed = top.fadeInSpeed;
        effect.colorLerpSpeed = top.colorLerpSpeed;
        if (!hadPrev) {
            effect.rgb = top.rgb;
            effect.fromRgb = top.rgb;
            effect.targetRgb = top.rgb;
            effect.colorLerpT = 1;
            effect.opacity = 0;
            return;
        }
        if (prevId === top.id) {
            return;
        }
        effect.fromRgb = effect.rgb || top.rgb;
        effect.targetRgb = top.rgb;
        effect.colorLerpT = 0;
    }

    preparePlayerForBossFight() {
        const game = this.game;
        game.player.clearAllStatusEffects();
        game.player.energy = FULL_ENERGY;
        const targetLives = game.menu.difficulty.getConfiguredLives();
        if (game.player.lives < targetLives) {
            game.player.lives = targetLives;
        }
        game.UI.dismissTip();
    }

    updateScreenEffect() {
        const effect = this.state.screenEffect;

        if (
            effect.colorLerpT != null &&
            effect.colorLerpT < 1 &&
            effect.fromRgb &&
            effect.targetRgb
        ) {
            const speed = effect.colorLerpSpeed ?? 0.04;
            effect.colorLerpT = Math.min(1, effect.colorLerpT + speed);
            const t = effect.colorLerpT;
            const [r0, g0, b0] = effect.fromRgb;
            const [r1, g1, b1] = effect.targetRgb;
            effect.rgb = [
                Math.round(r0 + (r1 - r0) * t),
                Math.round(g0 + (g1 - g0) * t),
                Math.round(b0 + (b1 - b0) * t),
            ];
        }

        if (this.bossInFight && effect.active) {
            effect.opacity = screenColourFadeIn(effect.opacity, effect.fadeInSpeed ?? 0.00298);
        } else {
            effect.opacity = screenColourFadeOut(effect.opacity);
        }
    }

    resetBossTimer() {
        this.bossTime = 0;
        this._bossFightWasActive = false;
        this._bossDefeatRecorded = false;
    }

    updateBossTimers(deltaTime) {
        const fightActive = this.bossInFight;

        if (fightActive && !this._bossFightWasActive) {
            this.bossTime = 0;
            this._bossDefeatRecorded = false;
            this._bossFightWasActive = true;
        }

        if (fightActive && !this.game.gameOver) {
            this.bossTime += deltaTime;
        }

        if (!fightActive && this._bossFightWasActive) {
            this._bossFightWasActive = false;
        }
    }

    onBossDefeated(bossId) {
        if (this._bossDefeatRecorded) return;
        this._bossDefeatRecorded = true;

        const game = this.game;
        if (!game.hasMetWinningCoins()) return;

        const mapKey = game.currentMap;
        if (!mapKey || !game.records || !game.records[mapKey]) return;

        const newMs = Math.max(0, Math.floor(this.bossTime));
        const prev = game.records[mapKey].bossMs;

        if (prev == null || newMs < prev) {
            game.records[mapKey].bossMs = newMs;
            game.saveGameState();

            const t = formatTimeMs(newMs, 2);
            game.showAnimatedToast([
                [{ text: "NEW RECORD!", fill: "yellow" }],
                [{ text: "FINAL BOSS BEATEN IN ", fill: "yellow" }, { text: t, fill: "orange" }],
            ], 1000);
        }
    }

    resetState() {
        this.bossTime = 0;
        this._bossFightWasActive = false;
        this._bossDefeatRecorded = false;
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
            screenEffect: createInitialScreenEffect(),
            dialogueBeforeOnce: true,
            dialogueAfterOnce: false,
            dialogueAfterLeaving: false,
            startAfterDialogueWhenAnimEnds: false,
            progressComplete: false,
        };
    }
}
