import { BossCutscene } from './bossCutscene.js';

export class GlacikalCutscene extends BossCutscene {
    getBossId() {
        return 'glacikal';
    }

    getBattleTheme() {
        return 'glacikalBattleTheme';
    }

    getResetLayerImageIds() {
        return [
            'bonusMap1IceRings',
            'bonusMap1BigIceCrystal',
        ];
    }

    shouldRemoveBossAfterPostFight() {
        return true;
    }
}

export class BonusMap1GlacikalIngameCutsceneBeforeFight extends GlacikalCutscene {
    constructor(game) {
        super(game);

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const GLACIKAL = { x: 1590, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Oh.. who's that?`,
            {
                onAdvance: () => this.playMusic('thePowerOfDarkness', true),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.threeDots}`,
            `I SENSED A PRESENCE FROM DEEP WITHIN THE CAVE... SO IT WAS YOU.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `Huh...? Who are you?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //3
            `${this.threeDots}`,
            `DO NOT PLAY DUMB WITH ME.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //4
            `${this.threeDots}`,
            `WAS IT YOU WHO AWAKENED ME FROM MY DEEP SLUMBER?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Deep slumber? Wait... are you... are you ${this.glacikal}?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //6
            `${this.glacikal}`,
            `INDEED I AM.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `So you really exist...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Listen, I didn't awaken you. I only came here because disasters have been happening outside the cave.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Are you the one causing all this chaos?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //10
            `${this.glacikal}`,
            `YOU STEP INTO MY DOMAIN, QUESTION ME, AND EXPECT CALM ANSWERS?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //11
            `${this.glacikal}`,
            `I WAS TORN FROM MY DEEP SLEEP BY AN INTRUDER. MY WRATH SHOOK THIS CAVE AND ALL THAT SURROUNDS IT.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //12
            `${this.glacikal}`,
            `AND NOW YOU APPEAR BEFORE ME. WHY SHOULD I NOT BELIEVE IT WAS YOU?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Because I just got here!`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //14
            `${this.glacikal}`,
            `ENOUGH.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //15
            `${this.glacikal}`,
            `IF YOU ARE THE ONE WHO DISTURBED MY SLUMBER, THEN I WILL FREEZE YOU WHERE YOU STAND.`,
            this.addImage(this.setfiredogDiscomfortBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I guess I don't have much choice but to fight you, do I?`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //17
            `${this.glacikal}`,
            `COME THEN. LET THE ICE JUDGE YOUR LIES.`,
            {
                onAdvance: () => this.fadeOutMusic('thePowerOfDarkness'),
            },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
    }
}

export class BonusMap1GlacikalIngameCutsceneAfterFight extends GlacikalCutscene {
    constructor(game) {
        super(game);

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const GLACIKAL = { x: 950, y: 400, width: 200, height: 200 };

        this.addDialogue( //0
            `${this.glacikal}`,
            `Aaarrgh...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Ugh... that was rough...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `Have you calmed down now?`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //3
            `${this.glacikal}`,
            `...Yes.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //4
            `${this.glacikal}`,
            `You fight with conviction... but not with the intent I sensed before.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //5
            `${this.glacikal}`,
            `It seems I was mistaken.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `So you finally believe me? I wasn't the one who woke you.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //7
            `${this.glacikal}`,
            `I believe you.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Then tell me what happened.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //9
            `${this.glacikal}`,
            `I was in a deep slumber, as I had been for a very long time.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //10
            `${this.glacikal}`,
            `Centuries passed in silence while I slept beneath these depths.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //11
            `${this.glacikal}`,
            `Then someone entered this cave.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //12
            `${this.glacikal}`,
            `I did not see them clearly... only a presence. Hostile. Purposeful.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Someone attacked you while you were asleep?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //14
            `${this.glacikal}`,
            `Yes.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //15
            `${this.glacikal}`,
            `I awoke in fury. My anger spread through the cave itself. The cold intensified. The winds howled. The mountain answered my rage.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //16
            `${this.glacikal}`,
            `Yet when I rose from my slumber, the intruder had already fled.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `So the disasters outside... the avalanches, the freezing winds... that was all because of your anger?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //18
            `${this.glacikal}`,
            `Indeed.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Why would someone come all the way down here just to attack you?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //20
            `${this.glacikal}`,
            `I do not know.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //21
            `${this.glacikal}`,
            `But whoever it was did not come here by accident.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //22
            `${this.glacikal}`,
            `They came with intent... and left before I could make them pay.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `(So all of this happened because someone attacked ${this.glacikal} in his sleep...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `The village outside has been suffering because of all this. If you've calmed down now... will the cave calm down as well?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //25
            `${this.glacikal}`,
            `Yes. The storms will settle. The frost will recede. ${this.iceboundCave} will return to the way it once was.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Good. That's all I wanted.`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //27
            `${this.glacikal}`,
            `It has been centuries since I last opened my eyes to this world.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //28
            `${this.glacikal}`,
            `I shall now return to my deep slumber beneath the ice, where I belong.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //29
            `${this.glacikal}`,
            `Now that my fury has faded, I sense no danger here any longer.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //30
            `${this.glacikal}`,
            `Before I go... what is your name?`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `My name is ${this.firedog}.`,
            this.addImage(this.setfiredogLaughBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //32
            `${this.glacikal}`,
            `I see. Then you have my thanks, ${this.firedog}.`,
            this.addImage(this.setfiredogLaughBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //33
            `${this.glacikal}`,
            `You entered these depths, endured my wrath, and still chose to seek the truth.`,
            this.addImage(this.setfiredogLaughBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Yeah... well, I wasn't about to leave without answers.`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG, { talking: true }),
            this.addImage('glacikalBorder', GLACIKAL),
        );
        this.addDialogue( //35
            `${this.glacikal}`,
            `Farewell, ${this.firedog}. May the ice spare your path.`,
            this.addImage(this.setfiredogHappyBorder(), FIREDOG),
            this.addImage('glacikalBorder', GLACIKAL, { talking: true }),
        );
    }
}