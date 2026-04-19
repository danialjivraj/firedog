import { BaseMenu } from '../baseMenu.js';
import { screenColourFadeIn, screenColourFadeOut } from '../../animations/screenColourFade.js';
import { howToPlayPagesMixin } from './howToPlayPages.js';
import { demoUpdatersMixin } from './demoUpdaters.js';
import { tutorialDrawMixin, _setHowToPlayMenuRef } from './tutorialDrawUtils.js';

export class HowToPlayMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Next', 'Previous', 'Go Back'];
        super(game, menuOptions, '');

        this.backgroundImage = document.getElementById('mainmenubackgroundhowtoplay');
        this.showStarsSticker = false;

        this.centerX = this.game.width - 90;
        this.positionOffset = -115;

        this.assets = this._buildAssets();

        this._spriteDemos = new Map();
        this._powerPreview = null;

        this._demoEnergy = this._createEnergyDemoState();
        this._demoDiving = this._createDivingDemoState();
        this._demoFireball = this._createFireballDemoState();
        this._demoInvisible = this._createInvisibleDemoState();
        this._demoDash = this._createDashDemoState();

        this._demoInvisibleColourOpacity = 0;
        this._demoRollingSeq = null;
        this._demoDivingSeq = null;
        this._demoEnergyFireSeq = null;

        this._menuParticles = [];
        this._menuParticleTimers = { poison: 0, slow: 0 };

        this._lastPageIndex = -1;
        this._hitAnimPhaseRef = { phase: 'hit' };
        this._hitAnimResets = [];
        this.pages = this._buildPages();
        this.currentPage = 0;

        this._tintCache = new Map();
    }

    // ---------------- small utilities ----------------
    update(deltaTime) {
        this._lastDt = deltaTime;
        super.update(deltaTime);
    }

    _dt() {
        if (typeof this._lastDt === 'number') return this._lastDt;
        if (typeof this.game.deltaTime === 'number') return this.game.deltaTime;
        return 16;
    }

    _num(v, fallback) {
        return Number.isFinite(Number(v)) ? Number(v) : fallback;
    }

    _clamp(v, a, b) {
        v = Number(v) || 0;
        return Math.max(a, Math.min(b, v));
    }

    _stepFireArcs(arcs, dtScale, gameSpeed = 0) {
        for (const arc of arcs) {
            arc.x -= (arc.speedX + gameSpeed) * dtScale;
            arc.y -= arc.speedY * dtScale;
            arc.size *= Math.pow(0.97, dtScale);
            arc.angle += arc.va * dtScale;
            arc.x += Math.sin(arc.angle * 5) * dtScale;
        }
        return arcs.filter(a => a.size >= 0.5);
    }

    _getTutorialProgressPercentage() {
        const total = Math.max(1, (this.pages?.length ?? 1) - 1);
        const idx = this._clamp(this.currentPage ?? 0, 0, total);
        return (idx / total) * 100;
    }

    // ---------------- navigation ----------------
    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            super.handleMenuSelection();
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            super.handleMenuSelection();
        }
    }

    handleKeyDown(event) {
        super.handleKeyDown(event);
        if (!this.menuActive) return;
        if (event.key === 'ArrowLeft') this.previousPage();
        if (event.key === 'ArrowRight') this.nextPage();
    }

    activateMenu(selectedOption = 0) {
        this.currentPage = 0;
        this._lastPageIndex = -1;
        this._resetDemosOnPageChange();
        super.activateMenu(selectedOption);
    }

    handleMenuSelection() {
        const selected = this.menuOptions[this.selectedOption];
        if (selected === 'Next') return this.nextPage();
        if (selected === 'Previous') return this.previousPage();

        if (selected === 'Go Back') {
            this.currentPage = 0;
            this._lastPageIndex = -1;
            this._resetDemosOnPageChange();
            super.handleMenuSelection();
            this.game.goBackMenu();
        }
    }


    // ---------------- static data ----------------
    static get _PLAYER_ANIM() {
        return {
            STANDING: { frameY: 0, maxFrame: 6 },
            JUMPING: { frameY: 1, maxFrame: 6 },
            FALLING: { frameY: 2, maxFrame: 6 },
            RUNNING: { frameY: 3, maxFrame: 8 },
            DASHING: { frameY: 3, maxFrame: 8 },
            SITTING: { frameY: 5, maxFrame: 4 },
            ROLLING: { frameY: 6, maxFrame: 6 },
            DIVING: { frameY: 6, maxFrame: 6 },
            STUNNED: { frameY: 4, maxFrame: 10 },
            HIT: { frameY: 9, maxFrame: 3 },
        };
    }

    _drawInvisibleTintInternal(isInvisible) {
        if (isInvisible) {
            this._demoInvisibleColourOpacity = screenColourFadeIn(this._demoInvisibleColourOpacity, 0.014);
        } else {
            this._demoInvisibleColourOpacity = screenColourFadeOut(this._demoInvisibleColourOpacity);
        }
    }

    _drawInvisibleTint(ctx) {
        const a = this._demoInvisibleColourOpacity;
        if (!a || a <= 0) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = `rgba(0, 0, 50, ${a})`;
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        ctx.restore();
    }

    // ---------------- player patching ----------------
    _applyPatchToPlayer(patch) {
        const player = this.game.player;
        if (!player || !patch || typeof patch !== 'object') return null;

        const touched = new Map();
        for (const [k, v] of Object.entries(patch)) {
            if (!touched.has(k)) touched.set(k, player[k]);
            player[k] = v;
        }

        return () => {
            for (const [k, v] of touched.entries()) player[k] = v;
        };
    }

    applyDemoPlayerState(demo) {
        const allow = new Set([
            'maxEnergy', 'energy', 'isEnergyExhausted',
            'isBluePotionActive', 'isPoisonedActive', 'isRedPotionActive',
            'isFrozen', 'currentState',
            'isInvisible', 'invisibleTimer', 'invisibleCooldown', 'invisibleActiveCooldownTimer',
            'divingTimer', 'divingCooldown',
            'fireballTimer', 'fireballCooldown',
            'redPotionTimer',
            'dashTimer', 'dashCooldown',
            'dashBetweenTimer', 'dashBetweenCooldown',
            'dashCharges', 'dashAwaitingSecond', 'dashSecondWindowTimer',
        ]);

        if (!demo || typeof demo !== 'object') return null;

        const filtered = {};
        for (const k of Object.keys(demo)) if (allow.has(k)) filtered[k] = demo[k];

        return this._applyPatchToPlayer(filtered);
    }

    applyDemoCooldowns(cooldowns) {
        const player = this.game.player;
        if (!player || !cooldowns || typeof cooldowns !== 'object') return null;

        const touched = new Map();
        const set = (key, value) => {
            if (!touched.has(key)) touched.set(key, player[key]);
            player[key] = value;
        };

        const pairs = {
            fireball: ['fireballCooldown', 'fireballTimer'],
            diving: ['divingCooldown', 'divingTimer'],
            invisible: ['invisibleCooldown', 'invisibleTimer'],
            dash: ['dashCooldown', 'dashTimer'],
            dashBetween: ['dashBetweenCooldown', 'dashBetweenTimer'],
        };

        const setPair = (name, cd, timer) => {
            const p = pairs[name];
            if (!p) return;
            set(p[0], cd);
            set(p[1], timer);
        };

        const apply = (name, { cooldownMs, remainingSec, available } = {}) => {
            if (typeof cooldownMs !== 'number') return;

            const cd = Math.max(0, cooldownMs);
            if (available === true) return setPair(name, cd, cd);

            const remMs = Math.max(0, (Number(remainingSec) || 0) * 1000);
            const timer = Math.max(0, cd - remMs);
            setPair(name, cd, timer);
        };

        for (const [name, cfg] of Object.entries(cooldowns)) apply(name, cfg || {});

        return () => {
            for (const [k, v] of touched.entries()) player[k] = v;
        };
    }

    draw(context) {
        this.drawCurrentPage(context);
        this.drawTopLeftUIOverlay(context);

        const prev = this.menuInGame;
        this.menuInGame = true;
        super.draw(context);
        this.menuInGame = prev;
    }
}


Object.assign(HowToPlayMenu.prototype, howToPlayPagesMixin);
Object.assign(HowToPlayMenu.prototype, demoUpdatersMixin);
Object.assign(HowToPlayMenu.prototype, tutorialDrawMixin);
_setHowToPlayMenuRef(HowToPlayMenu);