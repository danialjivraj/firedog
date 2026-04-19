import { StoryCutscene } from './storyCutsceneBase.js';

// Map 2 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map2StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter2');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1InsideCabinNight',
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `I feel like the moment I close my eyes I'll fall asleep...`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),

        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I need to get the ${this.crypticToken} back...`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),

        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I will... get it... back... I got... thi-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1500, fadeOut: 500,
                    imageId: 'dreamLight1',
                    onBlackDelayMs: 2000,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `... Huh... Where am I?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Am I... dreaming...?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark1',
                    onBlackDelayMs: 1200,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `What...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `I'm... I'm here again...?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `It's much darker now...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Wha-! What is that in that door... eyes...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I am definitely dreaming... But I've never experienced something so lucid before...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.questionMark}`,
            `Are you sure you're dreaming?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `WHAT!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Who are you!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.questionMark}`,
            `Why don't you come here and find out?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `(How does this feel so real... Wait... I can't move my body...)`,
            { whisper: true },
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `(My heartbeat is going crazy... am I really dreaming?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.questionMark}`,
            `Can't move huh? And your heart is beating faster? What are you going to do about it?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `You... you can read my thoughts!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.questionMark}`,
            `Are you too blind to see the truth?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //20
            `${this.questionMark}`,
            `That place was blocking me from entering your mind.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What? What place!? Are you talking about... ${this.lunarGlade}?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.questionMark}`,
            `Hahaha. You're foolish ${this.firedog}. Everything you know is a lie.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `I don't understand... What is going on...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.questionMark}`,
            `Do not wait until morning. Go now.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `What...? I can't go now, especially during the night... this land is full of paranormal stuff... at least that's what ${this.duskmaw} told me.`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Who are you...? Why does this feel so real.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Who I am does not matter right now. Haha... Now ${this.firedog}, wake up.`,
            this.addImage(this.setfiredogNormal(), LEFT),
        );
        this.addDialogue( //28
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `My head... it hurts... I've never felt pain like this before... I... ... my eyes... no-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map1InsideCabinNight',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                    onBlack: () => {
                        this.playMusic('exaleDeskant', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Ouch... I'm... I'm not dreaming anymore? It's pitch black outside...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `What was that... that felt so real... Wait... where is ${this.duskmaw}?`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Why isn't he in the cabin...? Should I really keep going east now...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `It feels so wrong... but for some reason I trust that voice in the dreams...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `Okay... I'll go... The quicker I get to the ${this.temporalTimber} the better anyways.. despite being really tired...`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `I wonder if ${this.penguini} is still outside.`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `I should check it out, okay let's go.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map2outsideCabin',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.fadeOutMusic('exaleDeskant');
                    },
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `Hey ${this.penguini}, how's patrolling goin'?`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.penguini}`,
            `Is that you ${this.firedog}? Why are you awake at this hour?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Well.. I couldn't really sleep.`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `Have you seen huh... ${this.duskmaw} leaving? He's not in the cabin.`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //41
            `${this.penguini}`,
            `Who?`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `${this.duskmaw}...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //43
            `${this.penguini}`,
            `You're the only one in the cabin right now. I'd know if anyone else was there, ya' fool!`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.penguini}`,
            `If you're trying to scare me that ain't gonna work! Nothing scares the almighty ${this.penguini} ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatUp', RIGHT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `(I was alone the whole time?)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `(Well.. ${this.penguini} doesn't seem to be joking as well... nothing here is making sense... shoot.. I'll figure all of this out later, I need to go now.)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `Okay... Anyways I'm leaving now.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatUp', RIGHT),
        );
        this.addDialogue( //48
            `${this.penguini}`,
            `Leaving now? I think it's best to warn you about the paranormal activities that happen at this hour out there.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.penguini}`,
            `You might see ghosts on your way there. Well, if you get killed it ain't my problem, many have gone and never came back ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.penguini}`,
            `Thanks for the ${this.coinIcon}${this.coinsLabel} ya' fool! Now go if you want to get killed! Hahaha!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatLaugh', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `That's what ${this.duskmaw} told me...`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('penguiniBatLaugh', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `Alright... off I go. Stay safe ${this.penguini}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //53
            `${this.penguini}`,
            `You too, ya' fool!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
    }
}
export class Map2EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map2InsideCabinNight');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Okay, let's rest for a bit in here... That was quite a long journey, ${this.duskmaw} and ${this.penguini} were right, that was really spooky!`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `It's so dark I can barely see anything, but well, this time it seems that no one is in the cabin.`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I should definitely sleep now, I am way too tired...`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Huh? What's this...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `A letter? To ${this.firedog}!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `What!? This is from ${this.galadon}! He's been here! I should open this!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Let's see...`,
            {
                onAdvance: () => this.playSFX('cutsceneMapOpening'),
            },
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `"To ${this.firedog},"`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `"I hope this letter gets to you well."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `"I am sending you this letter to warn you about what lies ahead."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `"I met an explorer who informed me that internal conflicts within ${this.coralAbyss} have led to tightened security."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `"This means that you will need to move at night if it's convenient for you to do so, as they might confuse you with an enemy."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `"If you prefer not to wait until nightfall, you can also traverse beneath the waters of ${this.coralAbyss}, which happens to also be a shortcut."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `"There is an exalted sorcerer that can give you temporary powers to stay underwater for a period of time."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `"You should find him if you so decide to take this shortcut."`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `"${this.galadon}"`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `I see... so I assume ${this.galadon} chose the underwater route...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `Ugh... I am really tired, I'm definitely sleeping here, so I am not waiting until tomorrow when the sun sets again, I'll be wasting too much time.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `This leaves me with no other option other than going... underwater...`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Let me scroll this letter back up.`,
            this.addImage(
                'scrollLetterMessageGaladon',
                { x: this.game.width / 2 - 310, y: 0, width: 529, height: 677 }
            ),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `I'll find more about this exalted sorcerer tomorrow. Let's go to sleep now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 500,
                }),
            },
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `Ugh.. my head...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamLight2',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                    onBlack: () => {
                        this.playMusic('echoesOfTime', true);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `This looks familiar... wait. I'm... I'm here again...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Ugh... I don't like this...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `I must resist...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `No... my eyes...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'dreamDark2',
                    onBlackDelayMs: 1700,
                    beforeFade: () => {
                        this.playSFX('dreamSound');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `Not again... my body is paralyzed from fear.. damn it...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.questionMark}`,
            `Did you miss me ${this.firedog}?`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `What the hell do you want from me? Why am I here? What is this place?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //29
            `${this.questionMark}`,
            `Soon enough, I'll get out of your filthy body!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Filthy body? What does that mean? Enough of this. I need an explanation...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.questionMark}`,
            `Don't you know? ${this.valdorin} used you! Hahahahaha!`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `Used me? How? I've known ${this.valdorin} ever since I was born. He took care of me!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.questionMark}`,
            `They blocked your memories.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `What memories?`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `You liar! You're not real.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.questionMark}`,
            `I am very much real. You will soon see how real I am. Now go.`,
            this.addImage(this.setfiredogUpset(), LEFT),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `No. I'm not going until you tell me what's goin-`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.questionMark}`,
            `Wake up...`,
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `Damn it... you're doing that thing again... my head hurts...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.questionMark}`,
            `Wake up... Wake up... Wake up...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 500,
                    onBlack: () => {
                        this.fadeOutMusic('echoesOfTime');
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `Damn it... my eyes... are closing again...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.game.map3Unlocked = true;
        this.game.bonusMap1Unlocked = true;
        this.game.saveGameState();
    }
}
