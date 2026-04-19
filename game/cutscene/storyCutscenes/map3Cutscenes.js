import { StoryCutscene } from './storyCutsceneBase.js';

// Map 3 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map3StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter3');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map2InsideCabin',
                    beforeFade: () => {
                        this.playMusic('birdsChirping', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's morning now...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I feel so much more energized now.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But it happened again... that dream... why does it feel so real? And what or who is that voice...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Why is this happening to me now ever since I left home...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `I wish there was a way to reach out to ${this.valdorin} and ask him about these dreams...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `But anyways, let's get back to the mission!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `So before I went to sleep... right, ${this.galadon} left the scroll letter for me.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `I need to refresh my mind. Let me open the scroll letter again.`,
            {
                onAdvance: () => this.playSFX('cutsceneMapOpening'),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Let's see...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Right. I need to find this sorcerer... I think it's best if I ask ${this.penguini} about this sorcerer.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Alright, let's go outside.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3OutsideCabin',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Hello ${this.penguini}, did you sleep well?`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.penguini}`,
            `I don't sleep ya' fool! Patrol life I chose fool!`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `Oh okay... Anyways, do you know of an exalted sorcerer around that helps explorers to get past the waters of ${this.coralAbyss} by any chance?`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.penguini}`,
            `Exalted sorcerer? Do you mean ${this.zephyrion}?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `I think so...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `I received a letter from my friend ${this.galadon}, and he told me to find this sorcerer that can cast a spell on me to temporarily be underwater.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.penguini}`,
            `Yes, indeed he was talking about ${this.zephyrion} ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Oh... so you know this sorcerer!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //21
            `${this.penguini}`,
            `Yes I do, ya' fool! Let's just say that me and ${this.zephyrion} used to do business back in the days!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatLaugh', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Huh? What kind of business?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('penguiniBatLaugh', RIGHT),
        );
        this.addDialogue( //23
            `${this.penguini}`,
            `... Highly confidential ya' fool!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `What... Why even mention it if you're not even gonna say it.. ugh.`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //25
            `${this.penguini}`,
            `If you follow this river path and continue heading east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.penguini}`,
            `Enough said ya' fool!`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Whatever, I'll go on my way then. So all I have to do is follow the river path and continue going east.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Okay let's go!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 2500, fadeOut: 1000,
                    imageId: 'map3Sorcerer',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Oh.. I see someone.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Hello there, is this ${this.zephyrion}?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.zephyrion}`,
            `Who are you? I have never seen you before.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `(Well ${this.penguini} was right, he does look like a sorcerer...)`,
            { whisper: true },
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `I'm ${this.firedog}. I need you to take me underwater.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.zephyrion}`,
            `Underwater? I'm sorry I don't know what you're talking about.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Quit playing games! I know you're ${this.zephyrion}. Look, my friend ${this.galadon} wrote me this letter, he told me to find you.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionEyesClosed', RIGHT),
        );
        this.addDialogue( //41
            `${this.zephyrion}`,
            `Hmm I see, I see. How many ${this.coinIcon}${this.coinsLabel} do you have?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `${this.coinIcon}${this.coinsLabel}? I don't have any right now...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.zephyrion}`,
            `I'm afraid I won't be able to help you then.`,
            this.addImage(this.setfiredogSad(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `What!?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `${this.penguini} told me to go towards this way and I would be able to get your help...`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //46
            `${this.zephyrion}`,
            `Oh, ${this.penguini} directed you to me?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Yes, he did.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //48
            `${this.zephyrion}`,
            `Well if he did it's your lucky day, however, you could be lying. Touch my hand.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Your hand...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //50
            `${this.zephyrion}`,
            `Yes, that's the only way I can confirm you're telling me the truth.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Well... okay...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3OutsideCabin',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('sorcererEnteringMindSound');
                        this.fadeOutMusic('birdsChirping');
                        this.fadeOutMusic('windBreezeSound');
                    },
                    onBlack: () => {
                        this.isCharacterBlackAndWhite = true;
                        this.isBackgroundBlackAndWhite = true;
                    },
                }),
            },
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //52
            `${this.penguini}`,
            `If you follow this river path and continue to follow up east you will meet ${this.zephyrion}. He can help you.`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `Okay, great. What does he look like?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //54
            `${this.penguini}`,
            `A sorcerer.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.firedog}`,
            `He looks like a ... sorcerer?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //56
            `${this.penguini}`,
            `Yeah.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `What the hell!? What kind of description is that ${this.penguini}!?`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //58
            `${this.penguini}`,
            `Enough said ya' fool!`,
            {
                onAdvance: () => {
                    this.isCharacterBlackAndWhite = false;
                },
            },
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.zephyrion}`,
            `I see. ${this.firedog} was telling the truth.`,
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.zephyrion}`,
            `Hold on... I feel something.`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.zephyrion}`,
            `What is this?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight3',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.isBackgroundBlackAndWhite = false;
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.zephyrion}`,
            `Where am I? Is this inside ${this.firedog}? His heart?`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.zephyrion}`,
            `I feel a presence.`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.zephyrion}`,
            `Is that you ${this.firedog}?`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.questionMark}`,
            `Hahahaha. You filthy sorcerer.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark3',
                    onBlackDelayMs: 1700,
                }),
            },
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //66
            `${this.zephyrion}`,
            `Who's that? What? Why did it get so much darker?`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.questionMark}`,
            `You don't come knock on my door and have the audacity to ask who I am.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //68
            `${this.questionMark}`,
            `But I do appreciate the visit! Now, come here!`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //69
            `${this.zephyrion}`,
            `This is not good, I need to leave quickly.`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.questionMark}`,
            `No, you won't.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //71
            `${this.questionMark}`,
            `I'm going to kill you, filthy sorcerer.`,
            this.addImage('zephyrionDistraught', RIGHT),
        );
        this.addDialogue( //72
            `${this.zephyrion}`,
            `This is bad.`,
            this.addImage('zephyrionDistraught', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.zephyrion}`,
            `I have no other choice.`,
            this.addImage('zephyrionEyesClosed', RIGHT, { talking: true }),
        );
        this.addDialogue( //74
            `${this.zephyrion}`,
            `Somnolence Shroud: Evanescent Dreamweave!`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 250, 250);
                    this.playSFX('sorcererTeleportBackSound');
                },
            },
            this.addImage('zephyrionCastingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.questionMark}`,
            `Oh? He's got tricks, lucky you, ${this.zephyrion}, you've gotten away.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map3Sorcerer',
                    onBlackDelayMs: 1700,
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //76
            `${this.zephyrion}`,
            `Wha!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionTerrified', RIGHT, { talking: true }),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Huh? Everything okay ${this.zephyrion}?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('zephyrionTerrified', RIGHT),
        );
        this.addDialogue( //78
            `${this.zephyrion}`,
            `(What was that? It was inside ${this.firedog}? Inside of his thoughts? His heart?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('zephyrionTerrified', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.zephyrion}`,
            `Yeah. Everything is fine. You were telling the truth. ${this.penguini} did in fact tell you to come here.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.zephyrion}`,
            `In this case, I won't charge you!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `Really!?`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //82
            `${this.zephyrion}`,
            `Yep! I will need to cast a spell on you in order for you to be able to breathe underwater.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //83
            `${this.zephyrion}`,
            `But be wary, you must be quick to reach the other side, the spell only lasts 7 minutes and 30 seconds.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.zephyrion}`,
            `If you surface back up you will get spotted by the guards of ${this.coralAbyss}, and they won't hesitate to kill you.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.zephyrion}`,
            `So I recommend you to stay underwater and only come out once it's safe.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //86
            `${this.zephyrion}`,
            `Do you want me to cast the spell on you now?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `Wha- Now?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `Ugh... I hate water... But I have no choice...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //89
            `${this.firedog}`,
            `Okay... I'm all set.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('zephyrionNormal', RIGHT),
        );
        this.addDialogue( //90
            `${this.zephyrion}`,
            `Okay, get ready.`,
            {
                onAdvance: () => this.playSFX('sorcererWaterSpellSound'),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionCastingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //91
            `${this.zephyrion}`,
            `Hydroaetherial Breath: Aquatic Veil!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionCastingSpell', RIGHT, { talking: true }),
        );
        this.addDialogue( //92
            `${this.zephyrion}`,
            `Okay... The spell has been cast. You can breathe underwater now.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //93
            `${this.zephyrion}`,
            `Don't waste too much time here on land! Every second counts!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `Awesome. Thank you so much for the help ${this.zephyrion}!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //95
            `${this.firedog}`,
            `I'll go now! Adios!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //96
            `${this.firedog}`,
            `Woohoo!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    onBlack: () => {
                        this.playSFX('waterSplashSound');
                    },
                }),
            },
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('zephyrionHappy', RIGHT),
        );
        this.addDialogue( //97
            `${this.zephyrion}`,
            `I wonder what that was.`,
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //98
            `${this.zephyrion}`,
            `That voice. I have never seen that before in all my years of sorcery.`,
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //99
            `${this.zephyrion}`,
            `Was that really inside of him?`,
            {
                onAdvance: () => {
                    this.fadeOutMusic('birdsChirping');
                    this.fadeOutMusic('windBreezeSound');
                },
            },
            this.addImage('zephyrionNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //100
            `${this.zephyrion}`,
            `Haha! You sure are an interesting soul, ${this.firedog}.`,
            this.addImage('zephyrionHappy', RIGHT, { talking: true }),
        );
    }
}
export class Map3EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map3InsideSubmarine');
        this.game.audioHandler.cutsceneMusic.playSound('submarineSonarUnderwaterSound', true);
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };
        this.addDialogue( //0
            `${this.firedog}`,
            `That was a close call. I almost lost my breath there.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `This space is tight. I'm definitely feeling a little bit claustrophobic in here.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I've never been in a submarine before... What a view!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `But terrifying at the same time!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `I guess I have to wait for ${this.penguini} to come inside for us to take off.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Which means I probably have some time alone in here.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `I wonder where ${this.galadon} is right now. Hopefully I can catch up to him soon.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'blackBackground',
                    beforeFade: () => {
                        this.fadeOutMusic('submarineSonarUnderwaterSound');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.galadon}`,
            `Ugh... I can barely feel my legs...`,
        );
        this.addDialogue( //8
            `${this.galadon}`,
            `I'm so close to the cabin... I need to get there before I pass out...`,
        );
        this.addDialogue( //9
            `${this.galadon}`,
            `If I lose consciousness here I'm certain to be dead...`,
        );
        this.addDialogue( //10
            `${this.galadon}`,
            `Who was that... ugh... I got no time to think now... I'm almost there...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map3InsideSubmarine',
                    onBlack: () => {
                        this.playMusic('submarineSonarUnderwaterSound');
                    },
                }),
            },
        );
        this.addDialogue( //11
            `${this.penguini}`,
            `Ready to rock and roll ${this.firedog}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Oh, we're going now!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //13
            `${this.penguini}`,
            `We sure are ya' fool! Buckle up!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Buckle up!? Do I need to wear a seat belt for this!? Wha-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 8000, fadeOut: 1000,
                    imageId: 'blackBackground',
                    onBlack: () => {
                        this.playSFX('submarineRevving', true);
                    },
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //15
            `${this.penguini}`,
            `We're on the surface now. We're almost reaching land.`,
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Wow, that was quick.`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.fadeOutSFX('submarineRevving');
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.penguini}`,
            `We're here, you can leave now ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Okay, how do I open this thing u-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    onBlack: () => {
                        this.playSFX('submarineDoorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Okay that works.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map3ForestRiver',
                    beforeFade: () => {
                        this.fadeOutMusic('submarineSonarUnderwaterSound');
                    },
                    onBlack: () => {
                        this.playMusic('windBreezeSound');
                    },
                }),
            },
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Back on land we are!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Wow! It's so much greener here. I guess we're in ${this.verdantVine}.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Good thing I took that underwater shortcut. That should get us closer to the thief. I should keep going.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Let's go!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
        );
        this.game.map4Unlocked = true;
        this.game.saveGameState();
    }
}
