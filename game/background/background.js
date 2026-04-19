import { normalizeDelta } from '../config/constants.js';
import { Layer, MovingLayer } from './layers.js';
import { BackgroundEffect } from './effects/backgroundEffect.js';
import { RaindropAnimation, SnowflakeAnimation } from './effects/weather.js';

export class Background {
    constructor(game, ...layers) {
        this.game = game;
        this.totalDistanceTraveled = 0;
        this.soundId = undefined;
        this.soundPlayed = false;

        const refDist = this._getOneShotReferenceDistance();
        const pct = 0.40 + Math.random() * 0.40; // spawns between 40% – 80% of map completion
        this._oneShotTriggerDistance = refDist * pct;
        this._oneShotTriggered = false;
        //console.log(`[OneShot] pct=${pct.toFixed(2)})`);
        this.backgroundLayers = layers.map((item) => {
            if (
                item instanceof Layer ||
                item instanceof MovingLayer ||
                item instanceof BackgroundEffect ||
                item instanceof RaindropAnimation ||
                item instanceof SnowflakeAnimation
            ) {
                return item;
            }

            const ids = Array.isArray(item.imageId) ? item.imageId : [item.imageId];
            const images = ids.map((id) => document.getElementById(id)).filter(Boolean);

            if (images.length === 0) {
                throw new Error(
                    `Background: no valid images found for imageId(s): ${JSON.stringify(item.imageId)}`
                );
            }

            const layer = new Layer(this.game, item.bgSpeed, images, { imageIds: ids });

            if (item.zabbyId) {
                const idList = Array.isArray(item.zabbyId) ? item.zabbyId : [item.zabbyId];
                const imgs = idList.map((id) => document.getElementById(id)).filter(Boolean);

                if (imgs.length === 0) {
                    throw new Error(
                        `Background: no valid image found for zabbyId(s): ${JSON.stringify(item.zabbyId)}`
                    );
                }

                layer.setOneShotImages(imgs);
            }

            return layer;
        });
    }

    _getOneShotReferenceDistance() {
        const fallback = Math.max(1, Number(this.game.maxDistance) || 1);

        const bm = this.game.bossManager;
        if (!bm || typeof bm.getGateForMapName !== "function") return fallback;

        const mapName = this.constructor?.name || this.game.currentMap || null;
        const gate = bm.getGateForMapName(mapName);

        const ref = Number(gate?.minDistance);
        if (Number.isFinite(ref) && ref > 0) return ref;

        return fallback;
    }

    resetLayersByImageIds(imageIds) {
        if (!Array.isArray(imageIds)) imageIds = [imageIds];
        const target = new Set(imageIds);

        for (const layer of this.backgroundLayers) {
            if (!layer || !Array.isArray(layer.imageIds) || layer.imageIds.length === 0) continue;

            const matches = layer.imageIds.some((id) => target.has(id));
            if (matches && typeof layer.resetToDefaults === "function") {
                layer.resetToDefaults();
            }
        }
    }

    _maybeTriggerOneShot() {
        if (this._oneShotTriggered) return;
        if (!this.game || this.game.cabin.isFullyVisible || this.game.isBossVisible) return;
        if (this.totalDistanceTraveled < this._oneShotTriggerDistance) return;

        const groups = new Map();

        const addCarrier = (key, obj) => {
            if (!key) return;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(obj);
        };

        for (const obj of this.backgroundLayers) {
            if (!obj) continue;

            const canTrigger =
                typeof obj.scheduleOneShotInsert === "function" ||
                typeof obj.triggerOneShot === "function";

            if (!canTrigger) continue;

            const keys = typeof obj.getOneShotKeys === "function" ? obj.getOneShotKeys() : [];
            if (!keys.length) continue;

            if (typeof obj.hasOneShotCandidate === "function" && !obj.hasOneShotCandidate()) continue;

            for (const key of keys) addCarrier(key, obj);
        }

        if (groups.size === 0) return;

        const keys = Array.from(groups.keys());
        const chosenKey = keys[Math.floor(Math.random() * keys.length)];

        const carriers = groups.get(chosenKey);
        const chosen = carriers[Math.floor(Math.random() * carriers.length)];

        if (typeof chosen.forceOneShotKey === "function") {
            chosen.forceOneShotKey(chosenKey);
        }

        let didTrigger = false;

        if (typeof chosen.scheduleOneShotInsert === "function") {
            didTrigger = chosen.scheduleOneShotInsert();
        } else if (typeof chosen.triggerOneShot === "function") {
            didTrigger = chosen.triggerOneShot();
        }

        if (didTrigger) this._oneShotTriggered = true;
    }


    update(deltaTime) {
        if (!this.soundPlayed) {
            if (!this.game.cabin.isFullyVisible && !this.game.isBossVisible) {
                this.game.audioHandler.mapSoundtrack.playSound(this.soundId, true);
                this.soundPlayed = true;
            }
        } else {
            if (this.game.cabin.isFullyVisible || this.game.isBossVisible) {
                this.game.audioHandler.mapSoundtrack.fadeOutAndStop(this.soundId);
                this.soundPlayed = false;
            }
        }

        let lastGroundLayer = null;

        for (let i = this.backgroundLayers.length - 1; i >= 0; i--) {
            const layer = this.backgroundLayers[i];

            if (!this.game.cabin.isFullyVisible && !this.game.isBossVisible) {
                layer.update(deltaTime);
                if (layer.bgSpeed === 1 && !lastGroundLayer) lastGroundLayer = layer;
            } else {
                layer.groundSpeed = 0;
                if (
                    layer instanceof BackgroundEffect ||
                    layer instanceof RaindropAnimation ||
                    layer instanceof SnowflakeAnimation ||
                    layer instanceof MovingLayer
                ) {
                    layer.update(deltaTime);
                }
            }
        }

        const activeMap =
            this.game.currentMap ||
            (this.game.background && this.game.background.constructor.name) ||
            null;

        const tutorialBlocksScroll = this.game.isTutorialActive && activeMap === 'Map1';

        if (lastGroundLayer && !tutorialBlocksScroll) {
            const dt = normalizeDelta(deltaTime);
            this.totalDistanceTraveled += (this.game.speed / 1000) * dt;
            this.totalDistanceTraveled = Math.round(this.totalDistanceTraveled * 100) / 100;
        }

        if (!tutorialBlocksScroll && lastGroundLayer) {
            this._maybeTriggerOneShot();
        }
    }

    draw(context) {
        this.backgroundLayers.forEach((layer) => layer.draw(context));
    }
}
