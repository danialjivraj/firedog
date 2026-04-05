import { BossCutscene } from './bossCutscene.js';

export class NTharaxCutscene extends BossCutscene {
    constructor(game) {
        super(game);
    }

    getBossId() {
        return 'ntharax';
    }

    getBattleTheme() {
        return 'ntharaxBattleTheme';
    }

    getResetLayerImageIds() {
        return [
            'bonusMap3Planets',
        ];
    }

    shouldRemoveBossAfterPostFight() {
        return true;
    }
}

export class BonusMap3NTharaxIngameCutsceneBeforeFight extends NTharaxCutscene {
    constructor(game) {
        super(game);

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const NTHARAX_RIGHT = { x: 1520, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Wait... is that the celestial tyrant?`,
            {
                onAdvance: () => this.playMusic('downADarkPath', true),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Are you ${this.ntharax}...?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.ntharax}`,
            `SO... THE CREATURE WHO DARED ENTER MY REALM HAS FINALLY REACHED ME.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I'm here to stop you from breaking through that portal into our world.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT),
        );
        this.addDialogue( //4
            `${this.ntharax}`,
            `STOP ME?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.ntharax}`,
            `I HAVE WAITED THROUGH AGES OF SILENCE TO TEAR OPEN THE WAY BACK.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.ntharax}`,
            `YOUR WORLD WAS NEVER MEANT TO ESCAPE ME FOREVER.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Not happening.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT),
        );
        this.addDialogue( //8
            `${this.ntharax}`,
            `WHEN MY ENERGY STABILIZES THE BREACH, YOUR SKIES WILL BREAK AND YOUR SEAS WILL RISE.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.ntharax}`,
            `ALL THINGS BENEATH THEM WILL DROWN.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Then I'll stop you here.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT),
        );
        this.addDialogue( //11
            `${this.ntharax}`,
            `YOU STAND IN A REALM SHAPED BY MY WILL, LITTLE FOOL.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.ntharax}`,
            `I AM ${this.ntharax}, THE CELESTIAL TYRANT. CIVILIZATIONS ONCE TREMBLED AT THE SHADOW OF MY RETURN.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Then I'll make sure you never return!`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT),
        );
        this.addDialogue( //14
            `${this.ntharax}`,
            `COME, THEN.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.ntharax}`,
            `DIE, AND LET YOUR FALL BE THE FINAL STEP IN MY ASCENT.`,
            {
                onAdvance: () => this.fadeOutMusic('downADarkPath'),
            },
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('ntharaxNormalBorder', NTHARAX_RIGHT, { talking: true }),
        );
    }
}

export class BonusMap3NTharaxIngameCutsceneAfterFight extends NTharaxCutscene {
    constructor(game) {
        super(game);

        this.ntharaxDisintegrationStarted = false;

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const NTHARAX = { x: 950, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.ntharax}`,
            `NO...! THIS CANNOT BE...!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //1
            `${this.ntharax}`,
            `MY RETURN... I WAS SO CLOSE!`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `It's over, ${this.ntharax}.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('ntharaxHurtBorder', NTHARAX),
        );
        this.addDialogue( //3
            `${this.ntharax}`,
            `OVER?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //4
            `${this.ntharax}`,
            `YOU HAVE DELAYED ME... NOTHING MORE...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //5
            `${this.ntharax}`,
            `THE VOID DOES NOT FORGET... AND ONE DAY... I WILL RETURN...`,
            {
                onAdvance: () => {
                    if (this.ntharaxDisintegrationStarted) return;
                    this.ntharaxDisintegrationStarted = true;
                    this.startCurrentBossDisintegration();
                    this.playSFX('ntharaxExplosionSound');
                },
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //6
            `${this.ntharax}`,
            `NOOOOOOOO...!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //7
            `${this.ntharax}`,
            `I WILL BE BACK...!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('ntharaxHurtBorder', NTHARAX, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Ugh... that was rough... but at least he's gone... well.. at least for now.`,
            this.addImage(this.setfiredogTiredBorder(), FIREDOG, { talking: true }),
        );
    }
}