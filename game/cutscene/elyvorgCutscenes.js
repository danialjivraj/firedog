import { BossCutscene } from './bossCutscene.js';

export class ElyvorgCutscene extends BossCutscene {
    getBossId() {
        return 'elyvorg';
    }

    getBattleTheme() {
        return 'elyvorgBattleTheme';
    }

    getResetLayerImageIds() {
        return [
            'map7spikeStones',
            'map7cactus',
            'map7rocks1',
            'map7rocks3',
        ];
    }

    shouldRemoveBossAfterPostFight() {
        return false;
    }
}

// Map 7 Elyvorg Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map7ElyvorgIngameCutsceneBeforeFight extends ElyvorgCutscene {
    constructor(game) {
        super(game);

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const ELYVORG_RIGHT = { x: 1560, y: 400, width: 200, height: 200 };
        const ELYVORG_TOKEN_RIGHT = { x: 1500, y: 400, width: 200, height: 200 };
        const TOKEN_SHINE_RIGHT = { x: 1620, y: 400, width: 260, height: 260 };

        this.addDialogue( //0
            `${this.firedog}`,
            `A hooded individual- So it's you...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `You are the one who stole the ${this.crypticToken} weren't you?`,
            {
                onAdvance: () => this.playMusic('crypticTokenDarkAmbienceSound', true),
            },
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //2
            `${this.questionMark}`,
            `Oh, you mean this?`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN_RIGHT, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE_RIGHT),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `That's the... The ${this.crypticToken}! You need to give that back!`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN_RIGHT),
            this.addImage('crypticTokenShining', TOKEN_SHINE_RIGHT),
        );
        this.addDialogue( //4
            `${this.questionMark}`,
            `Hm, no.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN_RIGHT, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE_RIGHT),
        );
        this.addDialogue( //5
            `${this.questionMark}`,
            `I'll keep this with me. Let me put it back in my pocket.`,
            {
                onAdvance: () => this.fadeOutMusic('crypticTokenDarkAmbienceSound'),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN_RIGHT, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE_RIGHT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `You-`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `You attacked ${this.valdorin}, and also ${this.galadon} back in ${this.verdantVine}.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
        );
        this.addDialogue( //8
            `${this.questionMark}`,
            `Indeed, I did.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `You're going to pay for what you did! Who are you!?`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //10
            `${this.questionMark}`,
            `I'm ${this.elyvorg}.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );

        this.addDialogue( //11
            `${this.elyvorg}`,
            `Nothing you do is going to stop what's coming. All your efforts in trying to stop me will be in vain.`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I'll stop y-`,
            {
                onAdvance: () => {
                    this.playSFX('dreamSound');
                    this.removeEventListeners();
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => this.addEventListeners(), 1000);
                },
            },
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `(Ugh... it's happening again... it feels unbelievably strong this time...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(This is not good... If I pass out here I'm sure to die...)`,
            {
                whisper: true,
                onAdvance: () => {
                    this.playSFX('dreamSound');
                    this.removeEventListeners();
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => this.addEventListeners(), 1000);
                },
            },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `(Ugh... Why did the headache get so intense after seeing the ${this.crypticToken}?)`,
            {
                whisper: true,
                onAdvance: () => {
                    this.playSFX('dreamSound');
                    this.removeEventListeners();
                    this.cutsceneBackgroundChange(500, 500, 500);
                    setTimeout(() => this.addEventListeners(), 1000);
                },
            },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `(My heart is beating so fast... just like in the dreams...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `(Relax...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `(I'm not going to lose now, after all the trouble I went through to get here!)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `(Okay... I think it went away...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //23
            `${this.elyvorg}`,
            `Lost your words, huh? Are you regretting coming all the way here, now that death is all that awaits you? Hahaha!`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `I can't let you leave with what you stole. It all ends here.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //25
            `${this.elyvorg}`,
            `You're right. It all ends here... for you.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `You're wrong... I will take you down right here, right now!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT),
        );
        this.addDialogue( //27
            `${this.elyvorg}`,
            `You're confident, but that only takes you so far.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.elyvorg}`,
            `Show me what you've got!`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG_RIGHT, { talking: true }),
        );
    }
}

export class Map7ElyvorgIngameCutsceneAfterFight extends ElyvorgCutscene {
    constructor(game) {
        super(game);

        const FIREDOG = { x: 100, y: 400, width: 200, height: 200 };
        const ELYVORG = { x: 950, y: 400, width: 200, height: 200 };

        const ELYVORG_TOKEN = { x: 930, y: 400, width: 200, height: 200 };
        const TOKEN_SHINE = { x: 1030, y: 400, width: 260, height: 260 };

        this.addDialogue( //0
            `${this.elyvorg}`,
            `You're strong.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Ugh... what a tough fight...`,
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //2
            `${this.elyvorg}`,
            `You're the other survivor... interesting.`,
            {
                onAdvance: () => this.playMusic('unboundPurpose', true),
            },
            this.addImage(this.setfiredogHeadacheBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `What are you talking about?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //4
            `${this.elyvorg}`,
            `Why don't you join me, ${this.firedog}?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What... how do you know my name!? And why would I join you!?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //6
            `${this.elyvorg}`,
            `We're not different from each other. You get those voices too, don't you?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `What!? How do you know about that?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //8
            `${this.elyvorg}`,
            `Because of ${this.valdorin}. He used you, and he used me.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //9
            `${this.elyvorg}`,
            `You see, ${this.valdorin} used both of us for his experiments with the ${this.crypticToken}.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `What!? So it's true...?`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //11
            `${this.elyvorg}`,
            `Yes. His secret. The ${this.projectCryptoterraGenesis}.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `The ${this.projectCryptoterraGenesis}? What is that?`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //13
            `${this.elyvorg}`,
            `It was a project built around exposing living beings to the ${this.crypticToken}'s energy and forcing their bodies to contain it.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //14
            `${this.elyvorg}`,
            `All of the test subjects ended up dying. Except for you and me.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `What... I can't believe this...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Why do I get these voices?`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //17
            `${this.elyvorg}`,
            `Some of the ${this.crypticToken}'s energy is still inside you. That is what lets the voice reach you.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `What!? I can't believe this...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //19
            `${this.elyvorg}`,
            `It seems ${this.valdorin} was recklessly experimenting with its power, without understanding the consequences.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //20
            `${this.elyvorg}`,
            `The token cannot move on its own, but the will inside it can still reach those marked by its energy.`,
            {
                onAdvance: () => this.playMusic('crypticTokenDarkAmbienceSound', true),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );
        this.addDialogue( //21
            `${this.elyvorg}`,
            `It keeps calling out. Again and again. It wants to be made whole. It wants the ${this.temporalTimber}.`,
            {
                onAdvance: () => this.fadeOutMusic('crypticTokenDarkAmbienceSound'),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `But why did I only start hearing the voices after I left ${this.lunarGlade}?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //23
            `${this.elyvorg}`,
            `The ${this.crypticToken} was surrounded by a powerful magical barrier.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //24
            `${this.elyvorg}`,
            `Inside the safe room, the ${this.crypticToken}'s influence was being suppressed.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //25
            `${this.elyvorg}`,
            `Since I removed the ${this.crypticToken} from it's safe, and since you stepped outside ${this.lunarGlade}'s barrier... the connection returned.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I can't believe this... So it's true... ${this.valdorin}, why...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `How could they do this to me...`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //28
            `${this.elyvorg}`,
            `Once I find the ${this.temporalTimber}, the ${this.crypticToken}'s true power will awaken. Then this corrupt world can finally be brought to an end.`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //29
            `${this.elyvorg}`,
            `So, ${this.firedog}. Will you join me? You and I are not very different from each other.`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Join... you...?`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `But wouldn't your plan destroy the world? Why would you want that!?`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //32
            `${this.elyvorg}`,
            `Destroy it? Hah... This world destroyed us long ago.`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //33
            `${this.elyvorg}`,
            `I have no remorse left for a world that never showed any to me. Nor should you.`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `(What do I do?)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `(I was used and kept in ${this.lunarGlade} all this time, wrapped in a lie...)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `(${this.valdorin} could've killed me... just like the others who didn't make it.)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `(The memories and the voices were all correct after all...)`,
            { whisper: true },
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `(In a way... I understand why ${this.elyvorg} hates them...)`,
            { whisper: true },
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `(Okay... make a decision...)`,
            { whisper: true },
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `... ...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `... ... ...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `What they did to us is wrong...`,
            {
                onAdvance: () => this.fadeOutMusic('unboundPurpose'),
            },
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `But what you're doing is worse...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I won't let you decide that everyone has to die just because this world wronged us.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `I can't join you.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Innocent lives will die... that's just not right. You need to stop.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
        this.addDialogue( //48
            `${this.elyvorg}`,
            `Very well then. I see you've made up your mind.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //49
            `${this.elyvorg}`,
            `Once I find the ${this.temporalTimber}, the world shall come to a peaceful end, and you, ${this.firedog}, will die a sacrifice.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //50
            `${this.elyvorg}`,
            `There is no point in meaningless fights. I'm only delaying the inevitable.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Uh? I'm not letting you run away, no!`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
    }
}