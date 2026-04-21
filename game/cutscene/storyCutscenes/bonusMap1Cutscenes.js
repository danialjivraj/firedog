import { StoryCutscene } from './storyCutsceneBase.js';

// Bonus Map 1 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap1StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusChapter1');
        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'map1InsideCabinNight',
                    beforeFade: () => {
                        this.playMusic('blizzardWindFireplace', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.threeDots}`,
            `Please, you have to help me!`,
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `Ugh... what time is it...?`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `I'm exhausted...`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.penguini}`,
            `No can do. You need to leave ya' fool!`,
            this.addImage(this.setfiredogTired(), LEFT),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `That's ${this.penguini} talking outside... but I don't recognize the other voice.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `Please believe me... There is something unusual going on up in ${this.iceboundCave}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //7
            `${this.penguini}`,
            `Not my problem... unless you have some ${this.coinIcon}${this.coinsLabel}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //8
            `${this.penguini}`,
            `Then maybe I can have one of my brothers up there investigate for you.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //9
            `${this.threeDots}`,
            `I don't have any ${this.coinIcon}${this.coinsLabel} unfortunately...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //10
            `${this.penguini}`,
            `Then I guess you're out of luck!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Ugh.. Seriously.. I'm trying to sleep...`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `I should go outside and see what's going on.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 1000, blackDuration: 1000, fadeOut: 1000,
                    imageId: 'map2outsideCabin',
                    beforeFade: () => {
                        this.fadeOutMusic('exaleDeskant');
                        this.fadeOutMusic('blizzardWindFireplace');
                    },
                    onBlack: () => {
                        this.playSFX('doorOpening');
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Hey, what's going on out here?`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //14
            `${this.threeDots}`,
            `Oh! I'm sorry... I didn't mean to wake anyone.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.firedog}`,
            `It's fine. You sounded desperate. I am ${this.firedog}, and you are?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //16
            `${this.threeDots}`,
            `My name is ${this.aurellia}, and yes... I am desperate...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //17
            `${this.aurellia}`,
            `I came down from the outskirts near ${this.iceboundCave}. Something has changed there.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `${this.iceboundCave}?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //19
            `${this.aurellia}`,
            `Yes. ${this.iceboundCave} is known for its caves and dozens of different entrances. It is a land up north, hard to reach due to how snowy and cold it is.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.aurellia}`,
            `It was always cold, but never like this.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.aurellia}`,
            `The wind there now bites through fur and bone. The paths are freezing over faster than they should.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.aurellia}`,
            `Creatures have been fleeing from the cave... and the few who went inside never returned.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.aurellia}`,
            `There's been a few avalanches that crashed down just a few miles from our village. If it keeps going like this...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.aurellia}`,
            `The whole village may eventually be drowned in snow... This is extremely bad... This is why I am asking for help!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.firedog}`,
            `That doesn't sound normal at all...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //26
            `${this.penguini}`,
            `Well, it would definitely affect my brother's business up in ${this.iceboundCave}... That would be no good.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.penguini}`,
            `Yeah, you should go see what is going on up there, ${this.firedog}.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `What the hell!? Why do I have to go? Just because it would benefit your business if I fixed the problem?`,
            this.addImage(this.setfiredogAngry(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //29
            `${this.penguini}`,
            `Will you really let this disaster happen? Ya' fool!`,
            this.addImage(this.setfiredogAngry(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Why are you making it seem like this is all my fault if I don't go there!?`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('penguiniBatTalkNormal', RIGHT),
        );
        this.addDialogue( //31
            `${this.aurellia}`,
            `Please... I just need to know what is happening there before more people disappear.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.aurellia}`,
            `And if the rumors are true.. then it would explain it...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `Rumors? What rumors?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //34
            `${this.aurellia}`,
            `Some say an ancient ice beast has awakened deep inside the cave.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.aurellia}`,
            `Others say it is a guardian... or a king of frost.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.aurellia}`,
            `They call it ${this.glacikal}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.aurellia}`,
            `It is believed that he is the one causing all the problems...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //38
            `${this.firedog}`,
            `${this.glacikal}...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //39
            `${this.penguini}`,
            `I heard ${this.glacikal} was nothing but an old legend. Even my brothers up in ${this.iceboundCave} have never seen such a monster!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('penguiniBatTalkNormal', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.firedog}`,
            `(Hm... An ice cave... people disappearing...)`,
            { whisper: true },
            this.addImage(this.setfiredogNormalQuestionAndExclamationMark(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //41
            `${this.firedog}`,
            `(This has nothing to do with the ${this.crypticToken}... Do I even have time for this?)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `(But I can't just ignore this either...)`,
            { whisper: true },
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //43
            `${this.firedog}`,
            `(Ugh...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `Okay, fine... I'll go check out ${this.iceboundCave}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //45
            `${this.aurellia}`,
            `Really!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.firedog}`,
            `Yeah. I can't promise anything, but I can at least investigate.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //47
            `${this.aurellia}`,
            `Thank you... truly.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaSmile', RIGHT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `No worries ${this.aurellia}! Lead me to ${this.iceboundCave}!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaSmile', RIGHT),
        );
        this.addDialogue( //49
            `${this.aurellia}`,
            `Yes... Please follow me!`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 5000, fadeOut: 500,
                    imageId: 'bonusMap1Village',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        setTimeout(() => {
                            this.playMusic('tundraSuite', true);
                        }, 5000);
                    },
                }),
            },
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaSmile', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.aurellia}`,
            `We are currently in a small village near ${this.iceboundCave}, this is the village I grew up in!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Oh wow! It is so cold! I never saw so much snow in my life!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //52
            `${this.firedog}`,
            `I had no idea such a village existed.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //53
            `${this.aurellia}`,
            `It is indeed a beautiful place to live in. However, recently, many of the villagers have been preparing to leave.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.aurellia}`,
            `We collect water and find treasures inside the cave, but without being able to go inside...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.aurellia}`,
            `.. there will be no water for us to drink... no treasures for us to find and sell...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.aurellia}`,
            `All the villagers think it's only a matter of time before an avalanche collapses the whole village.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.aurellia}`,
            `I can't blame them... I am scared myself...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //58
            `${this.firedog}`,
            `I see... Things are getting really bad here...`,
            this.addImage(this.setfiredogSad(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Okay... I've made up my mind.. I am stopping whatever is inside that cave and bring back peace to the village!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //60
            `${this.aurellia}`,
            `Thank you so much ${this.firedog}... It means a lot to us.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('aurelliaSmile', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.aurellia}`,
            `Okay, keep following me, I will take you to the main cave entrance.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'bonusMap1CaveEntrance',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        this.fadeOutMusic('tundraSuite');
                        this.playMusic('darkTensionRisingSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.aurellia}`,
            `Okay.. here we are.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.firedog}`,
            `Phew... It got even colder now. Hopefully I don't freeze to death!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //64
            `${this.firedog}`,
            `Before I go, ${this.aurellia}, do you know anything else about ${this.glacikal}? You mentioned it was an ice beast, or a guardian?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //65
            `${this.aurellia}`,
            `Yes.. No one has seen ${this.glacikal} with their own eyes in the village. And to be honest, these are rumors passed down from our ancestors.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.aurellia}`,
            `It is believed ${this.glacikal} rests in the deepest parts of ${this.iceboundCave}, and once he awakens, disaster strikes...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.aurellia}`,
            `The snow falls harder... avalanches come out of nowhere... the wind blows harder... the temperature drops significantly...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.aurellia}`,
            `This is exactly what happened centuries ago.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.aurellia}`,
            `Lost writings were found inside the cave by our ancestors, detailing the dangerous encounter with ${this.glacikal}, with the same exact disasters happening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `I see... so ${this.glacikal} is a legend that may or may not even exist?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //71
            `${this.aurellia}`,
            `Yes.. but I do believe he exists.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //72
            `${this.aurellia}`,
            `It is believed that ${this.glacikal} keeps the icy caves and the surrounding snowy land in balance.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.aurellia}`,
            `As long as he sleeps, the ice remains calm and the caves stay stable.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //74
            `${this.aurellia}`,
            `But why has ${this.glacikal} awakened? And how? I wish I knew...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `(It seems I am dealing with either a real ice monster, or just something completely unrelated...)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //76
            `${this.firedog}`,
            `(Nonetheless, we are already here, so we might as well get to the bottom of the truth!)`,
            { whisper: true },
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //77
            `${this.firedog}`,
            `Thank you for this information, ${this.aurellia}. I think I'm ready to go inside now!`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //78
            `${this.aurellia}`,
            `Before you go, be careful with the ice ground. It is extremely slippery!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `Extremely slippery ground? Doesn't sound too fun...`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //80
            `${this.firedog}`,
            `But nothing that won't stop me!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //81
            `${this.firedog}`,
            `I'll go now!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaTalking', RIGHT),
        );
        this.addDialogue( //82
            `${this.aurellia}`,
            `Please make sure to come back.. you are our only hope...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //83
            `${this.firedog}`,
            `I'll come back, and I'll get to the bottom of these disasters!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
        this.addDialogue( //84
            `${this.aurellia}`,
            `Thank you...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `Alright, let's go!`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSad', RIGHT),
        );
    }
}
export class BonusMap1EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusMap1InsideCabin');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it to the cabin.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That fight with ${this.glacikal} was no joke...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `I should sit here and rest for a bit before I head back.`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `At least things should calm down now that ${this.glacikal} has returned to his deep slumber.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Still... something about all of this feels strange...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Someone went all the way into the deepest part of ${this.iceboundCave} and attacked ${this.glacikal} while he was asleep...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `That couldn't have been an accident...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //7
            `${this.firedog}`,
            `Whoever did it knew exactly where they were going... and knew about ${this.glacikal}'s existence... well possibly.. there's no way to confirm that...`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `But why attack him in the first place just to run away? Maybe they realized it was a mistake messing with ${this.glacikal}!`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Anyways, I should head back to the village and let ${this.aurellia} know it's safe now.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 3000, fadeOut: 500,
                    imageId: 'bonusMap1Village',
                    beforeFade: () => {
                        this.fadeOutMusic('blizzardWindFireplace');
                    },
                    onBlack: () => {
                        this.playMusic('windBreezeSound', true);
                        setTimeout(() => {
                            this.playMusic('tundraSuite', true);
                        }, 3000);
                    },
                }),
            },
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.aurellia}`,
            `${this.firedog}! You came back!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `I did.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //12
            `${this.aurellia}`,
            `What happened? Did you find anything inside ${this.iceboundCave}?`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Yes... and you were right.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `${this.glacikal} does exist.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //15
            `${this.aurellia}`,
            `What!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `He had been awakened from a deep slumber and was consumed by rage.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //17
            `${this.firedog}`,
            `That rage was what caused the freezing winds, the avalanches, and all the chaos around the cave.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //18
            `${this.aurellia}`,
            `So the rumors were true all along...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.firedog}`,
            `Yeah... but he's calmed down now.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //20
            `${this.firedog}`,
            `He told me he was going back to his deep slumber, so things should return to normal.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //21
            `${this.aurellia}`,
            `Now that you mention it... the wind already feels less violent.`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //22
            `${this.aurellia}`,
            `And the air doesn't feel as heavy as before either...`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.aurellia}`,
            `The land really does feel more stable already!`,
            this.addImage(this.setfiredogHappy(), LEFT),
            this.addImage('aurelliaHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `Looks like the village should be safe now.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //25
            `${this.aurellia}`,
            `${this.firedog}... thank you. You saved our village.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.firedog}`,
            `I'm just glad I could help.`,
            this.addImage(this.setfiredogLaugh(), LEFT, { talking: true }),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //27
            `${this.aurellia}`,
            `Please know that everyone here will remember what you did for us.`,
            this.addImage(this.setfiredogLaugh(), LEFT),
            this.addImage('aurelliaSmile', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Thank you, ${this.aurellia}... but I should get going now.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('aurelliaSmile', RIGHT),
        );
        this.addDialogue( //29
            `${this.aurellia}`,
            `Leaving already?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('aurelliaSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `Yeah. I still have my own journey to continue.`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //31
            `${this.firedog}`,
            `But at least now I know this place will be alright.`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('aurelliaSurprised', RIGHT),
        );
        this.addDialogue( //32
            `${this.aurellia}`,
            `Then please travel safely, ${this.firedog}.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.aurellia}`,
            `And if you ever return, you will always be welcome in our village.`,
            this.addImage(this.setfiredogSmile(), LEFT),
            this.addImage('aurelliaHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.firedog}`,
            `I'll remember that.`,
            this.addImage(this.setfiredogSmile(), LEFT, { talking: true }),
            this.addImage('aurelliaHappy', RIGHT),
        );
        this.addDialogue( //35
            `${this.firedog}`,
            `Alright... time for me to head back.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('aurelliaHappy', RIGHT),
        );

        this.game.glacikalDefeated = true;
        this.game.saveGameState();
    }
}
