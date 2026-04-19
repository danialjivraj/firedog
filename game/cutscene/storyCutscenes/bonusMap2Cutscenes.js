import { StoryCutscene } from './storyCutsceneBase.js';

// Bonus Map 2 Cutscenes -----------------------------------------------------------------------------------------------------------------------------------------------------
export class BonusMap2StartCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusChapter2');

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            ``,
            ``,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 500, fadeOut: 500,
                    imageId: 'bonusMap2WoodsForest',
                    beforeFade: () => {
                        this.playMusic('birdsChirping', true);
                        this.playMusic('windBreezeSound', true);
                    },
                }),
            },
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `Alright... let's keep moving.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `If I keep following this path, I should eventually reach ${this.springlyLemony}.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `...`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Is this the right path?`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.firedog}`,
            `Oh no... don't tell me I got lost...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.threeDots}`,
            `Traveler!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //7
            `${this.threeDots}`,
            `Please wait!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //9
            `${this.firedog}`,
            `Someone's calling for me?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.threeDots}`,
            `Over here!`,
            this.addImage(this.setfiredogSurprised(), LEFT),
        );
        this.addDialogue( //11
            `${this.firedog}`,
            `Oh, hello there.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Is everything alright?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
        );
        this.addDialogue( //13
            `${this.threeDots}`,
            `My name is ${this.orialis}. Sorry for stopping you so suddenly...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //14
            `${this.firedog}`,
            `Oh, hi. I'm ${this.firedog}. Do you happen to know where ${this.springlyLemony} is? I think I'm lost.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //15
            `${this.orialis}`,
            `We aren't near ${this.springlyLemony} at all...`,
            this.addImage(this.setfiredogPhew(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `Oh great... I had a feeling something wasn't right... Can you tell me how to get back onto the right path?`,
            this.addImage(this.setfiredogSigh(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //17
            `${this.orialis}`,
            `I can... but...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.firedog}`,
            `Uh? You seem nervous. Is everything alright?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //19
            `${this.orialis}`,
            `Yeah... I mean, no... I need... I need help...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.orialis}`,
            `I've been looking for days for anyone around this area. The few travelers I encountered didn't want to help me...`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `What happened?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //22
            `${this.orialis}`,
            `It's my brother, ${this.orelian}. He went toward ${this.crimsonFissure} and never came back.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `${this.crimsonFissure}?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //24
            `${this.firedog}`,
            `I've never heard of that place before.`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //25
            `${this.orialis}`,
            `Most travelers haven't. It lies far to the southeast.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.orialis}`,
            `The land there is scarred by massive fissures and surrounded by mysterious dark crimson waters.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.orialis}`,
            `It was always considered dangerous, but recently it has become much worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.firedog}`,
            `Worse how?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //29
            `${this.orialis}`,
            `The ground has been shaking almost every day.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.orialis}`,
            `Old cracks have widened, and new ones keep opening without warning.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //31
            `${this.orialis}`,
            `In fact, one enormous crack has torn its way all the way up north from the fissure itself, splitting the land as it spread.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.orialis}`,
            `Even from a distance, you can feel the tremors beneath your feet.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //33
            `${this.firedog}`,
            `That sounds really bad...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //34
            `${this.orialis}`,
            `${this.orelian} studies ancient ruins and old writings.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.orialis}`,
            `When the tremors started, he became convinced there was more to this than a natural disaster.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.orialis}`,
            `He said there were old remains hidden near the deepest fissures, and that whatever caused the shaking might be connected to them.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `So he went to investigate by himself...?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orialisWorried', RIGHT),
        );
        this.addDialogue( //38
            `${this.orialis}`,
            `Yes...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.orialis}`,
            `He told me that if he was right, then waiting any longer could make things worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.orialis}`,
            `I tried to follow him after he didn't return, but I couldn't get very far.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.orialis}`,
            `The tremors became so violent that the ground started breaking apart beneath me.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.orialis}`,
            `I barely managed to escape.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //43
            `${this.orialis}`,
            `Please... if there is any chance that he's still alive, I need to know.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.firedog}`,
            `(I'm meant to go toward ${this.infernalCraterPeak}... I don't have time for this...)`,
            { whisper: true },
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //45
            `${this.firedog}`,
            `I'm sorry... I really need to be somewhere els-`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //46
            `${this.orialis}`,
            `Please... I have lost all hope... I've tried going there myself, but I wasn't strong enough to endure the tremors and the fissures...`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('orialisTear', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.orialis}`,
            `I have no one else to ask for help... I beg you to help me!`,
            this.addImage(this.setfiredogDiscomfort(), LEFT),
            this.addImage('orialisTear', RIGHT, { talking: true }),
        );
        this.addDialogue( //48
            `${this.firedog}`,
            `(What have I gotten myself into...)`,
            { whisper: true },
            this.addImage(this.setfiredogDiscomfort(), LEFT, { talking: true }),
            this.addImage('orialisTear', RIGHT),
        );
        this.addDialogue( //49
            `${this.firedog}`,
            `(I guess I can't ignore this...)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('orialisTear', RIGHT),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `(Okay... I'll find ${this.orialis}'s brother quickly, then get back to the main mission.)`,
            { whisper: true },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('orialisTear', RIGHT),
        );
        this.addDialogue( //51
            `${this.firedog}`,
            `Alright, fine... I'll help you.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisTear', RIGHT),
        );
        this.addDialogue( //52
            `${this.orialis}`,
            `Really!?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.firedog}`,
            `Yeah. I can't promise what I'll find, but I can at least look for your brother.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisHappy', RIGHT),
        );
        this.addDialogue( //54
            `${this.orialis}`,
            `Thank you... truly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisHappy', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.orialis}`,
            `Come with me. I'll take you to the edge of ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.firedog}`,
            `Alright. Lead the way.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 2000, fadeOut: 500,
                    imageId: 'bonusMap2GroundFissures',
                    onBlack: () => {
                        this.playSFX('walkingCutsceneSound');
                        this.fadeOutMusic('birdsChirping');
                        this.playMusic('darkTensionRisingSound', true);
                    },
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //57
            `${this.orialis}`,
            `We're close now...`,
            {
                onAdvance: () => {
                    this.playSFX('tremorSound', true);
                    this.game.startShake(0);
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //58
            `${this.orialis}`,
            `Can you feel that?`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('tremorSound');
                    this.game.stopShake();
                },
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.firedog}`,
            `Wow, the ground is shaking!`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //60
            `${this.orialis}`,
            `Yes. The tremors get stronger the closer we get to the fissures.`,
            {
                onAdvance: () => {
                    this.playSFX('tremorSound', true);
                    this.game.startShake(0);
                },
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.firedog}`,
            `Ugh.. this place feels eerie.. the shaking is so aggressive.. this is not normal at all...!`,
            {
                onAdvance: () => {
                    this.fadeOutSFX('tremorSound');
                    this.game.stopShake();
                },
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //62
            `${this.orialis}`,
            `Yeah.. the tremors keep getting worse each day...`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.orialis}`,
            `This is the outer boundary of ${this.crimsonFissure}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.orialis}`,
            `The farther you go, the worse it becomes.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.orialis}`,
            `This is as far as I can take you.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //66
            `${this.firedog}`,
            `Alright... I'll go from here.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisSurprised', RIGHT),
        );
        this.addDialogue( //67
            `${this.orialis}`,
            `Please be careful, ${this.firedog}.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.orialis}`,
            `And please bring ${this.orelian} back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orialisSad', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.firedog}`,
            `I'll do what I can.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
        this.addDialogue( //70
            `${this.firedog}`,
            `(Alright... let's see what kind of place ${this.crimsonFissure} really is.)`,
            { whisper: true },
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orialisSad', RIGHT),
        );
    }
}
export class BonusMap2EndCutscene extends StoryCutscene {
    constructor(game) {
        super(game, true);
        this.backgroundImage = document.getElementById('bonusMap2InsideCabin');
        this.game.audioHandler.cutsceneMusic.playSound('blizzardWindFireplace', true);

        const LEFT = { x: 0, y: 79, width: 590, height: 610 };
        const RIGHT = { x: 1300, y: 79, width: 590, height: 610 };

        this.addDialogue( //0
            `${this.firedog}`,
            `Phew... I finally made it to the cabin.`,
            this.addImage(this.setfiredogTired(), LEFT, { talking: true }),
        );
        this.addDialogue( //1
            `${this.firedog}`,
            `That was rough...`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //2
            `${this.firedog}`,
            `At least I can rest here for a moment.`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
        );
        this.addDialogue( //3
            `${this.firedog}`,
            `Hm?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //4
            `${this.firedog}`,
            `Someone else is here...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
        );
        this.addDialogue( //5
            `${this.threeDots}`,
            `...Ouch...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //6
            `${this.firedog}`,
            `Hey! Are you alright!?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianHurt', RIGHT),
        );
        this.addDialogue( //7
            `${this.threeDots}`,
            `Barely...`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //8
            `${this.firedog}`,
            `Wait... are you... are you ${this.orelian}?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianHurt', RIGHT),
        );
        this.addDialogue( //9
            `${this.orelian}`,
            `How do you know my name?`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //10
            `${this.firedog}`,
            `I ran into your brother ${this.orialis} when I got lost on my way to ${this.springlyLemony}. He asked me to help find you.`,
            this.addImage(this.setfiredogNormal(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //11
            `${this.orelian}`,
            `I see... then you came here to save me?`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //12
            `${this.firedog}`,
            `Indeed I did! I'm ${this.firedog}.`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //13
            `${this.firedog}`,
            `Can you move?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //14
            `${this.orelian}`,
            `A little... but not much.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orelianHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //15
            `${this.orelian}`,
            `I was lucky to make it back here at all.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orelianHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //16
            `${this.firedog}`,
            `What happened?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianHurt', RIGHT),
        );
        this.addDialogue( //17
            `${this.orelian}`,
            `While I was investigating, the fissures grew more violent.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //18
            `${this.orelian}`,
            `I got dangerously close while trying to figure out what was causing the tremors... and I fell into one of the fissures.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideFissures',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //19
            `${this.orelian}`,
            `The fall left me in immense pain... but when I landed, I discovered ancient ruins hidden deep below.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianHurt', RIGHT, { talking: true }),
        );
        this.addDialogue( //20
            `${this.orelian}`,
            `There were old stone pillars, collapsed arches, and inscriptions carved into the rock itself.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //21
            `${this.firedog}`,
            `I saw some small inscriptions on the rocks on my way here, but it all just looks like gibberish to me.`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //22
            `${this.orelian}`,
            `I can understand them.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //23
            `${this.firedog}`,
            `Wait, really!? How?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //24
            `${this.orelian}`,
            `That is what I do. I study ancient ruins, dead civilizations, and forgotten languages.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //25
            `${this.orelian}`,
            `Most people just see strange markings on old stone. I try to understand what they were meant to say.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //26
            `${this.orelian}`,
            `The inscriptions above the surface have little to no useful information.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //27
            `${this.orelian}`,
            `However, when I fell into the fissure, the inscriptions were richer, clearer, and far more detailed. I couldn't believe it!`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //28
            `${this.orelian}`,
            `Some of the symbols were damaged, but there was enough left for me to piece the meaning together.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //29
            `${this.orelian}`,
            `And one name appeared again and again.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //30
            `${this.firedog}`,
            `What name?`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2FissureRockCloseUp',
                    onBlack: () => {
                        this.playMusic('inTheFuture', true);
                    },
                }),
            },
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //31
            `${this.orelian}`,
            `${this.ntharax}.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orelianWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //32
            `${this.firedog}`,
            `${this.ntharax}...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianWorried', RIGHT),
        );
        this.addDialogue( //33
            `${this.orelian}`,
            `Yes. One of the inscriptions read:`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //34
            `${this.orelian}`,
            `"Here lies bound ${this.ntharax}, the Celestial Tyrant, cast from the starless void, unworthy of the living sky."`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //35
            `${this.orelian}`,
            `Another said:`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //36
            `${this.orelian}`,
            `"Let neither stone nor sea forget his name, for should his prison fail, the heavens themselves shall bleed."`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianWorried', RIGHT, { talking: true }),
        );
        this.addDialogue( //37
            `${this.firedog}`,
            `So... this ${this.ntharax} is some kind of ancient celestial tyrant?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //38
            `${this.orelian}`,
            `That is what the inscriptions suggest.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //39
            `${this.orelian}`,
            `A being that did not belong to our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //40
            `${this.orelian}`,
            `From what I could piece together, ${this.ntharax} was banished to another realm long ago in this very place.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //41
            `${this.orelian}`,
            `The ancient civilizations feared that one day he would try to force his way back into our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //42
            `${this.firedog}`,
            `So what role does ${this.crimsonFissure} play in here exactly?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //43
            `${this.orelian}`,
            `${this.crimsonFissure} is the location of the ancient seal created to stop ${this.ntharax} from reopening a gateway to our world.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //44
            `${this.orelian}`,
            `All the strange sigils carved into the stones of ${this.crimsonFissure} are part of that seal.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //45
            `${this.orelian}`,
            `Even the red glow of the lake makes sense now. There must be enormous glowing seal markings buried beneath it.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //46
            `${this.orelian}`,
            `The fissures are not just part of the landscape. They are wounds left behind as the seal starts to fail.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //47
            `${this.firedog}`,
            `So the shaking means the seal is weakening?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //48
            `${this.orelian}`,
            `Exactly.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //49
            `${this.orelian}`,
            `That is why the tremors keep getting worse, and why the cracks keep widening.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //50
            `${this.firedog}`,
            `That's already bad enough...`,
            this.addImage(this.setfiredogPhew(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //51
            `${this.orelian}`,
            `It gets worse.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //52
            `${this.orelian}`,
            `The inscriptions also spoke of what happens when the seal begins to fail.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //53
            `${this.orelian}`,
            `One of them read:`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2WritingsEnergyLeak',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //54
            `${this.orelian}`,
            `"When the red prison cracks, its fire shall flee, and the wound above shall answer."`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //55
            `${this.orelian}`,
            `Another said:`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //56
            `${this.orelian}`,
            `"Follow the escaping energy, for where the seal exhales, the breach shall awaken."`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //57
            `${this.firedog}`,
            `Escaping energy...?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //58
            `${this.orelian}`,
            `Yes.`,
            this.addImage(this.setfiredogCurious(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //59
            `${this.orelian}`,
            `When the seal cracks, energy escapes from it.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2PortalEnergy',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //60
            `${this.orelian}`,
            `That escaping energy does not just vanish. It gathers and forms a breach point.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //61
            `${this.orelian}`,
            `A place where a portal can begin to open.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //62
            `${this.orelian}`,
            `And the deeper inscriptions made it even clearer.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //63
            `${this.orelian}`,
            `One of them read:`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //64
            `${this.orelian}`,
            `"When the fleeing fire finds the thinned sky, the gate of the banished realm shall open once more."`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //65
            `${this.firedog}`,
            `A portal... a portal to his dimension?`,
            this.addImage(this.setfiredogCurious(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //66
            `${this.orelian}`,
            `I think so.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //67
            `${this.orelian}`,
            `If I understood the inscriptions correctly, the escaping energy leads to the place where that portal is beginning to form.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //68
            `${this.orelian}`,
            `And once that breach forms, ${this.ntharax} pushes against it from the other side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //69
            `${this.orelian}`,
            `${this.crimsonFissure}'s seals are what is stopping him from creating a path back.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //70
            `${this.orelian}`,
            `But if the seal weakens enough, the breach answers him... and he can force that opening wider from his side.`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //71
            `${this.firedog}`,
            `That's really bad...`,
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //72
            `${this.orelian}`,
            `There was more.`,
            this.addImage(this.setfiredogHeadache(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //73
            `${this.orelian}`,
            `Another inscription said:`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2Tsunami',
                }),
            },
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //74
            `${this.orelian}`,
            `"Should the breach stand whole, the sealed red sea shall rise in wrath, and tides without end shall swallow every land beneath the broken heavens."`,
            this.addImage(this.setfiredogNormal(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //75
            `${this.firedog}`,
            `And if the breach fully opens...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //76
            `${this.orelian}`,
            `Then ${this.ntharax}'s realm will connect completely to ours.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //77
            `${this.orelian}`,
            `And if those ancient warnings are true, massive tides and endless waves will flood every single land.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //78
            `${this.orelian}`,
            `Not just ${this.crimsonFissure}. Everything.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //79
            `${this.firedog}`,
            `So if that breach fully opens, the whole world could be drowned...`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //80
            `${this.orelian}`,
            `That is exactly what I fear.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //81
            `${this.orelian}`,
            `... Look outside.`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2OutsideCabinWindow',
                }),
            },
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //82
            `${this.firedog}`,
            `That light... is that the energy mentioned in the passages? The energy that is fleeing toward the portal?`,
            this.addImage(this.setfiredogSurprised(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //83
            `${this.orelian}`,
            `It appears to be.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //84
            `${this.orelian}`,
            `The breach point has started to open.`,
            this.addImage(this.setfiredogSurprised(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //85
            `${this.firedog}`,
            `This is bad...`,
            {
                onAdvance: () => this.transitionWithBg({
                    fadeIn: 500, blackDuration: 1000, fadeOut: 500,
                    imageId: 'bonusMap2InsideCabin',
                }),
            },
            this.addImage(this.setfiredogHeadache(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //86
            `${this.firedog}`,
            `Stay here and rest, ${this.orelian}.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //87
            `${this.firedog}`,
            `I'm going to follow the escaping energy.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //88
            `${this.firedog}`,
            `If that portal is where ${this.ntharax} is trying to break through, then that's where I need to be.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //89
            `${this.orelian}`,
            `Be careful... I do not know what waits beyond that breach.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //90
            `${this.orelian}`,
            `But what I do know for sure is that it is extremely dangerous. You may never come back.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //91
            `${this.orelian}`,
            `Are you sure you want to take that risk?`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianSurprised', RIGHT, { talking: true }),
        );
        this.addDialogue( //92
            `${this.firedog}`,
            `It seems the situation has become far more serious than simply rescuing you, which is what I first came here for.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //93
            `${this.firedog}`,
            `But if what you're saying is true, and there is a portal... and there is a celestial tyrant trying to force his way back through it...`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //94
            `${this.firedog}`,
            `Then I have to make sure that stops here.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //95
            `${this.firedog}`,
            `Stay here, ${this.orelian}, and rest. I'll investigate this for you.`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianSurprised', RIGHT),
        );
        this.addDialogue( //96
            `${this.orelian}`,
            `I appreciate your bravery.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //97
            `${this.orelian}`,
            `Thank you for going this far to check on my safety, and thank you for investigating further.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //98
            `${this.firedog}`,
            `Of course!`,
            this.addImage(this.setfiredogHappy(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //99
            `${this.firedog}`,
            `I'll be leaving now then. There's no time to waste!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );
        this.addDialogue( //100
            `${this.orelian}`,
            `Good luck, ${this.firedog}.`,
            this.addImage(this.setfiredogUpset(), LEFT),
            this.addImage('orelianTalking', RIGHT, { talking: true }),
        );
        this.addDialogue( //101
            `${this.firedog}`,
            `Alright, let's go!`,
            this.addImage(this.setfiredogUpset(), LEFT, { talking: true }),
            this.addImage('orelianTalking', RIGHT),
        );

        this.game.bonusMap3Unlocked = true;
        this.game.saveGameState();
    }
}
