export class BackgroundEffect {
    constructor(game, maxBackgroundEntities) {
        this.game = game;
        this.maxBackgroundEntities = maxBackgroundEntities;

        this._oneShotIds = [];
        this._oneShotPickedId = null;
        this._oneShotShown = false;

        this._oneShotGroupKey = null;
        this._oneShotPreferredId = null;
    }

    setOneShotImageIds(ids) {
        this._oneShotIds = Array.isArray(ids) ? ids.filter(Boolean) : (ids ? [ids] : []);
        this._oneShotPickedId = null;
        return this;
    }

    setOneShotGroup(groupKey, preferredId = null) {
        this._oneShotGroupKey = groupKey || null;
        this._oneShotPreferredId = preferredId || groupKey || null;

        this.setOneShotImageIds(this._oneShotPreferredId ? [this._oneShotPreferredId] : []);
        return this;
    }

    getOneShotKeys() {
        if (this._oneShotGroupKey) return [this._oneShotGroupKey];
        return Array.isArray(this._oneShotIds) ? this._oneShotIds.slice() : [];
    }

    forceOneShotKey(key) {
        if (!key) return false;

        if (this._oneShotGroupKey) {
            if (key !== this._oneShotGroupKey) return false;
            this._oneShotPickedId = this._oneShotPreferredId || this._oneShotGroupKey;
            return true;
        }

        if (this._oneShotIds?.includes(key)) {
            this._oneShotPickedId = key;
            return true;
        }

        return false;
    }

    hasOneShotCandidate() {
        return this.getOneShotKeys().length > 0 && !this._oneShotShown;
    }

    triggerOneShot() {
        return false;
    }
}
