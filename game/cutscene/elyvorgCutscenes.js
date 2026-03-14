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
        const ELYVORG_TOKEN_RIGHT = { x: 1560, y: 250, width: 200, height: 200 };
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
            `(Ugh... Why did the headache get so intense after seeing the ${this.crypticToken}...?)`,
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
        const ELYVORG = { x: 1100, y: 400, width: 200, height: 200 };

        const ELYVORG_TOKEN = { x: 1100, y: 400, width: 200, height: 200 };
        const TOKEN_SHINE = { x: 800, y: 400, width: 260, height: 260 };

        this.addDialogue( //0
            `${this.elyvorg}`,
            `You're strong.`,
            this.addImage(this.setfiredogNormalBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //1
            `${this.firedog}`,
            `How do you know my fireball ability? How is this possible?`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //2
            `${this.elyvorg}`,
            `You're the other survivor, interesting.`,
            {
                onAdvance: () => this.playMusic('unboundPurpose', true),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
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
            `Why don't you join me ${this.firedog}?`,
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
            `We're not different from each other. You get those voices too don't you?`,
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
            `It's because of ${this.valdorin}. He used you, and he used me.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //9
            `${this.elyvorg}`,
            `You see, ${this.valdorin} inserted the ${this.crypticToken} inside of our hearts.`,
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
            `It's a project dedicated to using children as experiments. Experiments in order to create the ultimate weapon of mass destruction.`,
            this.addImage(this.setfiredogCuriousBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //14
            `${this.elyvorg}`,
            `You and I are nothing but lucky numbers that ended up surviving.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //15
            `${this.elyvorg}`,
            `And this is the reason why we both share similar abilities.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //16
            `${this.elyvorg}`,
            `Because we are both connected to the ${this.crypticToken}. The token that gave me and you these powers.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //17
            `${this.firedog}`,
            `What... I can't believe this...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //18
            `${this.firedog}`,
            `Why do I get these voices?`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //19
            `${this.elyvorg}`,
            `You get them because... there are still fragments of the ${this.crypticToken} inside of you.`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //20
            `${this.firedog}`,
            `What!? How can this be possible...`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //21
            `${this.elyvorg}`,
            `The surgeons that removed the token from our hearts thought they had removed it all completely.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //22
            `${this.elyvorg}`,
            `But the ${this.crypticToken} works in mysterious ways. It seems some fragments remained in our hearts.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //23
            `${this.elyvorg}`,
            `Not even ${this.valdorin} has a clue about this. He doesn't know anything about the ${this.crypticToken}.`,
            {
                onAdvance: () => this.playMusic('crypticTokenDarkAmbienceSound', true),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //24
            `${this.elyvorg}`,
            `You see, this token isn't just an inanimate object.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );

        this.addDialogue( //25
            `${this.elyvorg}`,
            `No... inside here holds the spirits and souls of all that came before the world and what will come after it.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );

        this.addDialogue( //26
            `${this.elyvorg}`,
            `And as long as it's separated from the ${this.temporalTimber}, it will soundlessly scream for it.`,
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );

        this.addDialogue( //27
            `${this.elyvorg}`,
            `Because a part of the ${this.crypticToken} is inside of you... you are able to hear those voices.`,
            {
                onAdvance: () => this.fadeOutMusic('crypticTokenDarkAmbienceSound'),
            },
            this.addImage(this.setfiredogSurprisedBorder(), FIREDOG),
            this.addImage('elyvorgTokenBorder', ELYVORG_TOKEN, { talking: true }),
            this.addImage('crypticTokenShining', TOKEN_SHINE),
        );

        this.addDialogue( //28
            `${this.firedog}`,
            `I can't believe this... So it's true... ${this.valdorin}, why...`,
            this.addImage(this.setfiredogCryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //29
            `${this.firedog}`,
            `How could they do this to me...`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //30
            `${this.elyvorg}`,
            `So, ${this.firedog}. Will you join me, for a world without corruption and suffering. For a world of true peace?`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //31
            `${this.firedog}`,
            `Join... you...?`,
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //32
            `${this.firedog}`,
            `(What do I do?)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //33
            `${this.firedog}`,
            `(I was used, and kept in ${this.lunarGlade} all this time, wrapped in a lie...)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //34
            `${this.firedog}`,
            `(${this.valdorin} could've killed me.. just like the others who didn't make it.)`,
            { whisper: true },
            this.addImage(this.setfiredogCry2Border(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //35
            `${this.firedog}`,
            `(The memories and the voices were all correct after all...)`,
            { whisper: true },
            this.addImage(this.setfiredogCryBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //36
            `${this.firedog}`,
            `(In a way, I sort of understand ${this.elyvorg}...)`,
            { whisper: true },
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //37
            `${this.firedog}`,
            `(Okay... Make a decision...)`,
            { whisper: true },
            this.addImage(this.setfiredogSadBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //38
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //39
            `${this.firedog}`,
            `... ...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //40
            `${this.firedog}`,
            `... ... ...`,
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //41
            `${this.firedog}`,
            `What they did to us is wrong...`,
            {
                onAdvance: () => this.fadeOutMusic('unboundPurpose'),
            },
            this.addImage(this.setfiredogSadBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //42
            `${this.firedog}`,
            `But what you're doing is worse...`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //43
            `${this.firedog}`,
            `I can't join you.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //44
            `${this.firedog}`,
            `Innocent lives will die... that's just not right. You need to stop.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );

        this.addDialogue( //45
            `${this.elyvorg}`,
            `Very well then. I see you've made up your mind.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //46
            `${this.elyvorg}`,
            `Once I find the ${this.temporalTimber}, the world shall come to a peaceful end, and you ${this.firedog}, will die a sacrifice.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //47
            `${this.elyvorg}`,
            `There is no point in meaningless fights. I'm just delaying the inevitable.`,
            this.addImage(this.setfiredogUpsetBorder(), FIREDOG),
            this.addImage('elyvorgBorder', ELYVORG, { talking: true }),
        );

        this.addDialogue( //48
            `${this.firedog}`,
            `Uh? I'm not letting you run away, no!`,
            this.addImage(this.setfiredogAngryBorder(), FIREDOG, { talking: true }),
            this.addImage('elyvorgBorder', ELYVORG),
        );
    }
}