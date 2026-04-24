import { StoryCutscene } from './storyCutsceneBase.js';

// Map 6 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class Map6StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('chapter6');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map5InsideCabin',
                    beforeFade: () => {
                        this.playMusic('blizzardWindFireplace', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `(Okay, I need to get going soon... but I can rest for just a little bit longer.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.craggle}`,
            `234... 235... 236... 237...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `(He's still counting those rocks...)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //4
            `${this.craggle}`,
            `238... 239... 240...`,
            this.addImage(this.setfiredogSigh(), LEFT),
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `(Why does that sound so familiar all of a sudden?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //7
            `${this.craggle}`,
            `241... 242... 243...`,
            {
                onAdvance: () => {
                    this.cutsceneBackgroundChange(500, 500, 500);
                    this.playSFX('dreamSound', false, true);
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `(Ugh...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `(No... not again...)`,
            {
                whisper: true,
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map6OperatingBed',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;
                        this.fadeOutMusic('blizzardWindFireplace');

                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //10
            `${this.nysera}`,
            `Pulse is unstable...`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.valdorin}`,
            `Count again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.nysera}`,
            `241... 242... 243...`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //13
            `${this.nysera}`,
            `It keeps getting higher. We might lose him! What do we do?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `It hurts...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.nysera}`,
            `The ${this.crypticToken} is reacting.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //16
            `${this.nysera}`,
            `If we continue, we may lose him.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //17
            `${this.valdorin}`,
            `Continue.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.valdorin}`,
            `After many failures, ${this.firedog} is the second one to have gotten this far.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.valdorin}`,
            `He seemed like a success. He could become the weapon of mass destruction we need to strike fear and conquer the other lands.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.valdorin}`,
            `Damn it... he's becoming less like himself... But we can't give up. He may be our last chance to create the weapon we need.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.valdorin}`,
            `Do whatever it takes to bring him back to himself again.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `Aaaaaaaargh!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 3500, fadeOut: 500,
                    imageId: 'blackBackground',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.playSFX('flashbackEnd', false, true);
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `What? Am I inside a lost memory again...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Why is everything black now... I can't see a thing...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Wait... I feel something...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I feel like I'm both awake and asleep... I feel so dizzy...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 1000,
                    imageId: 'map5InsideGlassChamber',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.isCharacterSepia = true;
                        this.isBackgroundSepia = true;

                        setTimeout(() => {
                            this.playSFX('flashbackStart', false, true);
                        }, 200);
                        setTimeout(() => {
                            this.playMusic('insideGlassChamberBubbleSound', true);
                        }, 1600);
                    },
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.valdorin}`,
            `The removal of the ${this.crypticToken}'s energy was successful.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.nysera}`,
            `But look at him. He can barely breathe.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.valdorin}`,
            `He survived. That is more than the others did.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.nysera}`,
            `And if he remembers any of this?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.valdorin}`,
            `He must not.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.nysera}`,
            `Will you erase his memories?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //33
            `${this.valdorin}`,
            `We have no other choice.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.nysera}`,
            `And if he starts showing signs again?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //35
            `${this.valdorin}`,
            `We will have to keep him inside ${this.lunarGlade}.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.nysera}`,
            `For how long?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //37
            `${this.valdorin}`,
            `For as long as it takes.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.nysera}`,
            `And if he starts asking questions when he's older?`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //39
            `${this.valdorin}`,
            `Then we lie.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `...Why...?`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.nysera}`,
            `Oh, he's awake.`,
            this.addImage('nyseraNormal', LEFT, { talking: true }),
            this.addImage('valdorinNormal', RIGHT),
        );
        this.addDialogue( //42
            `${this.valdorin}`,
            `No. He's only semi-conscious.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.valdorin}`,
            `What a shame... another failure. I really thought ${this.firedog} was the one who could control its power.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.valdorin}`,
            `But maybe no one can.`,
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.valdorin}`,
            `Prepare the memory spell, ${this.nysera}.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1500, fadeOut: 500,
                    imageId: 'map4InsideCabin',
                    onBlackDelayMs: 1000,
                    onBlack: () => {
                        this.playSFX('flashbackEnd', false, true);
                        this.fadeOutMusic('insideGlassChamberBubbleSound');
                        this.playMusic('blizzardWindFireplace', true);
                        this.isCharacterSepia = false;
                        this.isBackgroundSepia = false;
                    },
                }),
            },
            this.addImage('nyseraNormal', LEFT),
            this.addImage('valdorinNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Aaaah!`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.craggle}`,
            `Hey! You are interrupting my counting again!`,
            {
                onAdvance: () => this.playMusic('iSawSomethingAgain', true),
            },
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('craggleUpset', RIGHT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `(It happened again... I just had another flashback...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `(And ${this.valdorin}... he erased all my memories?)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `(That would explain why I don't recall any of these memories... was I meant to never remember this?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `(He also said that if I ever started showing signs again, they would keep me inside ${this.lunarGlade}...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `(So all those years... was I really trapped there because of what they did to me?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `(${this.valdorin} said I was the second one to get that far... Who was the first?)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //54
            `${this.firedog}`,
            `(I hate this feeling... was I really used as an experiment?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //55
            `${this.firedog}`,
            `(It all seems to make sense... But ${this.valdorin} always took care of me... I really don't want to believe this until I get a chance to talk to him...)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `(But at the same time, is it safe for me to come back to ${this.lunarGlade}?)`,
            { whisper: true },
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `(I don't want to ignore these flashbacks I just had, but I have no time to think now. I need to get going.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `(After all, if the ${this.crypticToken} is in the wrong hands, it doesn't matter what is true or not. The whole world could be at stake right now.)`,
            {
                whisper: true,
                onAdvance: () => this.fadeOutMusic('iSawSomethingAgain'),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Alright...`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //60
            `${this.firedog}`,
            `I think I've rested long enough.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('craggleCountingRocks', RIGHT),
        );
        this.addDialogue( //61
            `${this.craggle}`,
            `Leaving already?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.firedog}`,
            `Yeah. I still have a long way to go.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //63
            `${this.craggle}`,
            `Where are you headed?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `I'm trying to reach a cave near ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //65
            `${this.craggle}`,
            `${this.infernalCraterPeak}?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.craggle}`,
            `How interesting.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.craggle}`,
            `A strange traveler passed by near here not too long ago. They looked a bit intimidating, but I saw them from the cabin's window.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.craggle}`,
            `It seemed that they were running toward ${this.venomveilLake}.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.craggle}`,
            `So I can only assume they were heading toward ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `Wait... what did they look like?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //71
            `${this.craggle}`,
            `Hard to say exactly as I only saw them from afar.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.craggle}`,
            `But they were wearing a dark hood. Well, that's all I could make out.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.firedog}`,
            `A dark hood...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //74
            `${this.craggle}`,
            `Yeah, that's what it looked like to me.`,
            {
                onAdvance: () => this.playMusic('ohNo', true),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `(Wait... that's the thief!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `Oh no! How long ago did you see this traveler?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //77
            `${this.craggle}`,
            `It must've been a couple of hours ago, I'd say.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.firedog}`,
            `(Damn it... a couple of hours... I'm still so far behind!)`,
            { whisper: true },
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //79
            `${this.craggle}`,
            `Why do you look so worried? Do you know this traveler?`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `Something like that. But I have no time to waste. I need to leave right now.`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //81
            `${this.craggle}`,
            `Are you sure? You still look exhausted.`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `Exhausted or not, if I don't go now, this could be the end for everyone!`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //83
            `${this.craggle}`,
            `I... don't understand...`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.firedog}`,
            `Thanks for letting me know, ${this.craggle}. I have to go now!`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('craggleSurprised', RIGHT),
        );
        this.addDialogue( //85
            `${this.craggle}`,
            `Oh... alright. If you find any precious rocks, please keep some for m-`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 250, blackDuration: 500, fadeOut: 250,
                    onBlackDelayMs: 600,
                    beforeFade: () => {
                        this.fadeOutMusic('ohNo');
                        this.playSFX('doorOpening');
                    },
                }),
            },
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //86
            `${this.craggle}`,
            `Oh... ${this.firedog} just left...`,
            this.addImage('craggleSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //87
            `${this.craggle}`,
            `Now then... where was I?`,
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
        this.addDialogue( //88
            `${this.craggle}`,
            `247... 248... 249...`,
            this.addImage('craggleCountingRocks', RIGHT, { talking: true }),
        );
    }
}
export class Map6EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('map6InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That was rough. ${this.venomveilLake} is no joke...`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `At least this cabin is empty. I can rest for a moment.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I've come so far in such a short time... farther than I ever imagined I would.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `A few days ago I had never even stepped outside ${this.lunarGlade}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Now I've crossed the haunted graves of ${this.nightfallPhantomGraves}, traveled beneath the waters of ${this.coralAbyss}, passed through the dense jungle of ${this.verdantVine}.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Survived the wild weather of ${this.springlyLemony}, and barely made it through the poisonous lake of ${this.venomveilLake}.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `It almost feels unreal... like my whole life changed the moment I left home.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `And maybe that's exactly when all of this started getting worse.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `The dreams... the voice... the headaches... the flashbacks...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `Back in ${this.nightfallPhantomGraves}, I thought it was just a nightmare. Something strange, but still only a dream.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `But after that, it kept happening. And each time it felt more real than the last.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Then in ${this.verdantVine}, it happened while I was awake.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `That was when I knew this wasn't just my imagination.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `And the voice... it kept saying the same thing. That I have to keep going.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `And that ${this.valdorin} used me. That he did experiments on me with the ${this.crypticToken}.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `At first I refused to believe any of it.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `But then the flashbacks started... first when I was with ${this.galadon} in the cabin at ${this.verdantVine}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `And then again when I was with ${this.craggle} in ${this.springlyLemony}.`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Not dreams. Memories. Triggered by words.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `Memories of me inside a glass chamber full of liquid... memories of me in an operating bed... in pain...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `And the worst part is... those memories line up with what the voice has been telling me.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.firedog}`,
            `So if those flashbacks are real... then ${this.valdorin} and ${this.nysera} know far more than they've ever told me.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `And maybe that is the real reason I was never allowed to leave ${this.lunarGlade}.`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Not because the world was too dangerous... but because leaving might lead me to the truth.`,
            this.addImage(this.setfiredogCry(), LEFT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `Maybe they were afraid of that. But if that's true... then why let me leave for this mission at all?`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `The farther I get from home, the stronger these visions become.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.firedog}`,
            `Maybe it's because I'm farther from ${this.lunarGlade}... or maybe it's because I'm getting closer to the ${this.crypticToken}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Either way, this can't be a coincidence anymore.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //29
            `${this.firedog}`,
            `Then there's the thief...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `The one who stole the ${this.crypticToken}, attacked ${this.valdorin}, and left ${this.galadon} barely able to move.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `Every clue points to the same person. A hooded figure using electric attacks... and moving toward ${this.infernalCraterPeak}.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `And now I know for certain that this thief is ahead of me.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `If they are heading for the cave, then they must know about the ${this.temporalTimber}.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `But only the higher-ups in ${this.lunarGlade} were supposed to know where it was hidden.`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `So either someone from home betrayed us... or the thief is connected to ${this.lunarGlade} in a way I still don't understand.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.firedog}`,
            `And somehow... it feels like all of this connects back to me too.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `The voice. The experiments. The missing memories. The token. The thief.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `It's all tied together somehow. I'm sure of it now.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.firedog}`,
            `But no matter how much I think about it, I'm still missing too many pieces.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `I still don't know who that voice truly is.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `And I still don't know whether I can trust ${this.valdorin} anymore...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `...but I also can't forget that he raised me.`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `Damn it... none of this is simple anymore.`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `Still... one thing is clear.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `If the thief reaches the cave first and connects the ${this.crypticToken} to the ${this.temporalTimber}... then none of these questions will matter.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Because if that happens, everything could be over before I ever learn the truth.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `So for now, I can't let myself get lost in all these thoughts.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `First I stop the thief. First I protect the world.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `Then... once this is over... I'll get my answers.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `Hopefully ${this.galadon} can catch up soon... but until then, I have to keep moving.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Alright... just a little more rest... then I'm leaving.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );

        this.game.map7Unlocked = true;
        this.game.saveGameState();
    }
}
