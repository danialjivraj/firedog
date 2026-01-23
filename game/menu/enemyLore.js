import { isLocalNight } from '../config/timeOfDay.js';
import { BaseMenu } from "./baseMenu.js";

export class EnemyLore extends BaseMenu {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.currentPage = 0;
        this.currentPageMain = 0;
        this.currentPageBonus = 0;

        this.enemyLoreBookBackground = document.getElementById('enemyLoreBookBackground');
        this.leftPageBackground = document.getElementById('enemyLoreLeftPageBackground');
        this.rightPageBackground = document.getElementById('enemyLoreRightPageBackground');

        this.pageWidth = this.game.width * 0.43;
        this.pageHeight = this.game.height * 0.8;
        this.bookX = (this.game.width - 2 * this.pageWidth) / 2;
        this.bookY = (this.game.height - this.pageHeight) / 2 + 10;

        this.category = 'main';
        this.mainPages = [];
        this.bonusPages = [];
        this.pages = this.mainPages;

        this.phraseColors = {
            "EVERYWHERE": { fill: 'black', stroke: 'white', strokeBlur: 5 },
            "LUNAR MOONLIT GLADE": { fill: '#57e2d0ff', stroke: '#06580dff', strokeBlur: 7 },
            "NIGHTFALL PHANTOM GRAVES": { fill: '#a84ffcff', stroke: 'black', strokeBlur: 10 },
            "CORAL ABYSS": { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 5 },
            "VERDANT VINE": { fill: '#61c050ff', stroke: 'black', strokeBlur: 15 },
            "SPRINGLY LEMONY": { fill: 'yellow', stroke: 'orange', strokeBlur: 5 },
            "VENOMVEIL LAKE": { fill: '#39ff14', stroke: '#003b00', strokeBlur: 10 },
            "INFERNAL CRATER PEAK": { fill: '#ff3300ff', stroke: 'black', strokeBlur: 10 },
            "ICEBOUND CAVE": { fill: '#8fd7ff', stroke: '#1c4a7f', strokeBlur: 10 },
            "COSMIC RIFT": { fill: '#ff41ffff', stroke: '#270033', strokeBlur: 10 },
            "CRIMSON FISSURE": { fill: '#ff2c56ff', stroke: '#000000ff', strokeBlur: 10 },
            "RED": { fill: 'red', stroke: 'black', strokeBlur: 1 },
            "STUN": { fill: 'yellow', stroke: 'black', strokeBlur: 1 },
        };

        this.highlightPhrases = this.buildHighlightTokens(this.phraseColors);

        // MAP 1 - Lunar Moonlit Glade
        this.createCoverPage({
            mapKey: 'map1',
            coverTitle: 'LUNAR MOONLIT GLADE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map1Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        // 1
        this.createPage({
            name: "GOBLITO",
            type: "GROUND & NORMAL",
            foundAt: "EVERYWHERE",
            description:
                "THE GOBLITO SPECIES, ONCE NON-THREATENING PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
                + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
                + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.",
            images: [
                this.createImage('goblinSteal', 60.083, 80, 3, this.pageWidth - 135, this.pageHeight - 120, 1.3),
            ],
            mapKey: "map1",
        });

        // 2
        this.createPage({
            name: "DOTTER",
            type: "FLY & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "IT IS SAID THAT DOTTERS HAVE BEEN AROUND FOR THOUSANDS OF YEARS...\n"
                + "EVEN ON THE BRINK OF EXTINCTION, THEY HAVE ALWAYS MANAGED TO SURVIVE.\n"
                + "THESE LITTLE CREATURES CAN BE FOUND ROAMING AROUND PEACEFULLY WITHIN THE FOREST.",
            images: [
                this.createImage('dotter', 60.083, 80, 0, this.pageWidth - 140, 60, 1.4),
            ],
            mapKey: "map1",
        });

        // 3
        this.createPage({
            name: "VERTIBAT",
            type: "FALL & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "THESE VERTIBATS ARE COMMONLY FOUND IN NIGHTFALL PHANTOM GRAVES, HOWEVER, SOMETHING HAS CAUSED MOST OF THEM TO MIGRATE "
                + "TO THE AREA OF LUNAR MOONLIT GLADE.\nIT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCY, WHICH PROBABLY CAUSED "
                + "MOST OF THEM TO FIND REFUGE HERE!\nHIDING ON TOP OF TREES, THESE BATS WAIT FOR MOVEMENT BEFORE THEY FALL ONTO THEIR TARGET.\n",
            images: [
                this.createImage('vertibat', 151.166, 90, 0, this.pageWidth - 210, 40, 1),
            ],
            mapKey: "map1",
        });

        // 4
        this.createPage({
            name: "GHOBAT",
            type: "FLY & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "NOT MUCH IS KNOWN ABOUT THIS GHOST-SHAPED BAT.\n"
                + "ALL THAT IS KNOWN IS THAT IT LIKES TO FLAP ITS WINGS AND CHASE DOTTERS...",
            images: [
                this.createImage('ghobat', 134.33, 84, 0, this.pageWidth - 190, 40, 1.1),
            ],
            mapKey: "map1",
        });

        // 5
        this.createPage({
            name: "RAVENGLOOM",
            type: "FLY & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description: "THIS FLYING CREATURE LIKES TO PEACEFULLY FLY THROUGH TREES!",
            images: [
                this.createImage('ravengloom', 139.66, 100, 0, this.pageWidth - 200, 40, 1),
            ],
            mapKey: "map1",
        });

        // 6
        this.createPage({
            name: "MEAT SOLDIER",
            type: "GROUND & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT ALL LAND.\n"
                + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
                + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.",
            images: [
                this.createImage('meatSoldier', 67.625, 80, 0, this.pageWidth - 150, this.pageHeight - 110, 1.1),
            ],
            mapKey: "map1",
        });

        // 7
        this.createPage({
            name: "SKULNAP",
            type: "GROUND & STUN",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "HE HAD NEVER BEEN IN THIS AREA UNTIL SOME TIME AGO. NO ONE KNOWS HIS ORIGIN, AND IT IS BELIEVED THAT SKULNAP WAS "
                + "AN EXPERIMENT MADE BY ONE OF THE LANDS.\nHE CAN BE FOUND SLEEPING ON THE GROUND, BUT AS SOON AS YOU STEP WITHIN HEARING RANGE, YOU'LL WAKE HIM RIGHT AWAY!",
            images: [
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 100, 1.1, 'stun'),
                this.createImage('skulnapAwake', 104.231, 70, 0, this.pageWidth - 650, this.pageHeight - 110, 1.1, 'stun'),
            ],
            mapKey: "map1",
        });

        // 8
        this.createPage({
            name: "ABYSSAW",
            type: "FLY & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "YOU'LL HEAR THEM BEFORE YOU SEE THEM!\n"
                + "THESE LOUD CREATURES SPIN AGGRESSIVELY LIKE A CHAINSAW AS THEY MOVE THROUGH THE TREES OF THE FOREST.\nWATCH OUT, SO YOU DON'T GET CUT!",
            images: [
                this.createImage('abyssaw', 100.44, 100, 0, this.pageWidth - 160, 40, 1),
            ],
            mapKey: "map1",
        });

        // 9
        this.createPage({
            name: "GLIDOSPIKE",
            type: "FLY & NORMAL",
            foundAt: "LUNAR MOONLIT GLADE",
            description:
                "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
                + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
                + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDESPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!",
            images: [
                this.createImage('glidoSpikeFly', 191.68, 130, 0, this.pageWidth - 220, 30, 1),
                this.createImage('windAttack', 105, 120, 0, this.pageWidth - 200, 120, 1),
            ],
            mapKey: "map1",
        });


        // MAP 2 - Nightfall Phantom Graves
        // 10
        this.createCoverPage({
            mapKey: 'map2',
            coverTitle: 'NIGHTFALL PHANTOM GRAVES',
            category: 'main',
            coverImages: [
                this.createCoverImage('map2Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "DUSK PLANT",
            type: "GROUND & NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "THESE RARE PLANTS ARE DORMANT BY DAY BUT AWAKEN AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH "
                + "OF UNSUSPECTING PREY.\n AS SOON AS THEY DETECT MOVEMENT, DUSK PLANTS WILL LAUNCH A VERY DARK LEAF FROM THEIR MOUTHS, AIMING TO SLICE THROUGH THEIR TARGET!",
            images: [
                this.createImage('duskPlant', 60, 87, 0, this.pageWidth - 150, this.pageHeight - 110, 1),
                this.createImage('darkLeafAttack', 35.416, 45, 0, this.pageWidth - 210, this.pageHeight - 100, 1),
            ],
            mapKey: "map2",
        });

        // 11
        this.createPage({
            name: "SILKNOIR",
            type: "CRAWLER & NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES   ",
            description:
                "THESE BIG SPIDERS APPEAR AT NIGHT, CRAWLING DOWN THE TALLEST TREES FOR SOME PREYS!\n"
                + "SILKNOIRS ARE BIG IN SIZE BECAUSE THEY FEAST ON ANYTHING THEY LAY THEIR EYES ON!",
            images: [
                this.createImage('blackLine', 3, 345, 0, this.pageWidth - 111, 0, 1),
                this.createImage('silknoir', 120, 144, 0, this.pageWidth - 170, 270, 1),
            ],
            mapKey: "map2",
        });

        // 12
        this.createPage({
            name: "WALTER THE GHOST",
            type: "FLY & NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES   ",
            description:
                "WALTER IS A VERY CURIOUS AND SPOOKY GHOST.\nIF HE SPOTS YOU, HE MIGHT CHASE YOU!",
            images: [
                this.createImage('walterTheGhost', 104.83, 84, 0, this.pageWidth - 160, 70, 1),
            ],
            mapKey: "map2",
        });

        // 13
        this.createPage({
            name: "BEN",
            type: "FALL & NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES   ",
            description:
                "BEN IS A SMALL CREATURE WHO SEEMS TO APPEAR OUT OF NOWHERE.\nLITTLE IS KNOWN ABOUT HIS BACKSTORY OR PURPOSE, "
                + "EXCEPT THAT HE DROPS FROM ABOVE AND MOVES CURIOUSLY IN YOUR DIRECTION.",
            images: [
                this.createImage('ben', 61.5, 50, 0, this.pageWidth - 160, 70, 1.3),
            ],
            mapKey: "map2",
        });

        // 13
        this.createPage({
            name: "GLOOMLET",
            type: "FLY & RED",
            foundAt: "NIGHTFALL PHANTOM GRAVES   ",
            description:
                "GLOOMLETS ARE SHADOWS THAT SLIPPED FREE FROM THE WALLS OF NIGHTFALL PHANTOM GRAVES .\n"
                + "THEIR FACES NEVER CHANGE, BUT PEOPLE SWEAR THEIR EXPRESSIONS SHIFT WHEN NO ONE IS LOOKING.\n"
                + "SOME SAY THEY DRIFT TOWARD ANY PLACE WHERE A SECRET WAS ONCE WHISPERED, AS IF STILL LISTENING FOR THE REST OF THE STORY.",
            images: [
                this.createImage('gloomlet', 78, 74, 0, this.pageWidth - 160, 50, 1.3, 'red'),
            ],
            mapKey: "map2",
        });

        // 14
        this.createPage({
            name: "DOLLY",
            type: "FLY & NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES   ",
            description:
                "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
                + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.\nIF YOU SEE DOLLY LAUNCHING A YELLOWISH AURA, "
                + "YOU SHOULD AVOID TOUCHING IT AT ALL COSTS!",
            images: [
                this.createImage('dolly', 88.2, 120, 0, this.pageWidth - 160, 70, 1),
                this.createImage('aura', 52, 50, 0, this.pageWidth - 210, 150, 1, 'stun'),
            ],
            mapKey: "map2",
        });


        // MAP 3 - Coral Abyss
        // 15
        this.createCoverPage({
            mapKey: 'map3',
            coverTitle: 'CORAL ABYSS',
            category: 'main',
            coverImages: [
                this.createCoverImage('map3Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "PIRANHA",
            type: "SWIMMER & NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "PIRANHAS ARE QUICK AND NIPPY FISH.\nTHEIR SHARP TEETH CAN GIVE YOU NASTY BITE, SO KEEP YOUR DISTANCE!",
            images: [
                this.createImage('piranha', 75.167, 50, 0, this.pageWidth - 160, 70, 1),
            ],
            mapKey: "map3",
        });

        // 16
        this.createPage({
            name: "SKELETON FISH",
            type: "SWIMMER & NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "ROAMING THE SEAS FOR THOUSANDS OF YEARS, THESE ANCIENT FISH HAVE ADAPTED TO THEIR UNDERWATER HABITAT.\n"
                + "THEY DON'T HAVE EYES, BUT THEY CAN SENSE MOVEMENT AND WILL BE QUICK AND PERSISTENT IN CHASING YOU DOWN!",
            images: [
                this.createImage('skeletonFish', 55, 39, 0, this.pageWidth - 160, 70, 1),
            ],
            mapKey: "map3",
        });

        // 17
        this.createPage({
            name: "SPEAR FISH",
            type: "GROUND & RED",
            foundAt: "CORAL ABYSS",
            description:
                "ONCE A MIGHTY WARRIOR IN A FORGOTTEN UNDERWATER KINGDOM, THIS FISH HAS ADOPTED A SPEAR AS ITS MOST PRIZED POSSESSION.\n"
                + "WITH A SHARP IMPOSING TIP, THE SPEAR FISH USES ITS WEAPON TO DEFEND ITS TERRITORY AND CHALLENGE ANY INTRUDERS.\n"
                + "LEGEND HAS IT THAT THE SPEAR FISH'S SKILLS WERE MASTERED IN ANCIENT DUELS, AND NOW IT GUARDS THE SEAS WITH A COMBINATION OF ANCIENT FEROCITY "
                + "AND DETERMINATION, RUNNING BRAVELY TOWARDS ITS TARGET!",
            images: [
                this.createImage('spearFish', 91.875, 110, 0, this.pageWidth - 160, this.pageHeight - 130, 1, 'red'),
            ],
            mapKey: "map3",
        });

        // 18
        this.createPage({
            name: "JET FISH",
            type: "SWIMMER & NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "IS IT A JET? IS IT A FISH? NO, IT'S BOTH!\n"
                + "JET FISH BLENDS THE SPEED OF A JET WITH THE SWIFT MOVES OF A FISH, GLIDING THROUGH THE WATERS OF CORAL ABYSS AT SUPERSONIC SPEED!",
            images: [
                this.createImage('jetFish', 142, 55, 0, this.pageWidth - 160, 70, 1),
            ],
            mapKey: "map3",
        });

        // 19
        this.createPage({
            name: "PIPER",
            type: "GROUND & NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "PIPER SEEMS LIKE A HARMLESS ENEMY AT FIRST...\n"
                + "BUT GET TOO CLOSE, AND SHE'LL UNVEIL HER TRUE FORM, EXPANDING TO FIVE TIMES HER ORIGINAL SIZE!",
            images: [
                this.createImage('piperIdle', 87, 67, 0, this.pageWidth - 250, this.pageHeight - 110, 1),
                this.createImage('piperExtended', 82, 234, 10, this.pageWidth - 150, this.pageHeight - 275, 1),
            ],
            mapKey: "map3",
        });

        // 20
        this.createPage({
            name: "VOLTZEEL",
            type: "FALL & STUN",
            foundAt: "CORAL ABYSS",
            description:
                "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
                + "IT IS RUMORED THAT HIS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.",
            images: [
                this.createImage('voltzeel', 107, 87, 4, this.pageWidth - 160, 70, 1, 'stun')
            ],
            mapKey: "map3",
        });

        // 21
        this.createPage({
            name: "GARRY",
            type: "GROUND & NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
                + "TAKES A WHILE TO FADE AWAY!",
            images: [
                this.createImage('paint_splatter_8', 1994, 995, 0, -130, 175, 0.5),
                this.createImage('garry', 165, 122, 0, this.pageWidth - 220, this.pageHeight - 130, 1),
                this.createImage('inkBeam', 77, 34, 2, this.pageWidth - 250, this.pageHeight - 70, 1),
            ],
            mapKey: "map3",
        });


        // MAP 4 - Verdant Vine
        // 22
        this.createCoverPage({
            mapKey: 'map4',
            coverTitle: 'VERDANT VINE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map4Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "BIG GREENER",
            type: "GROUND & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "THE OXYGEN LEVELS IN THIS AREA ARE TWICE AS HIGH COMPARED TO OTHERS DUE TO ITS VAST PLANTATION.\n"
                + "THIS PLANT'S LARGE SIZE IS A RESULT OF THIS ABUNDANT OXYGEN.\nBIG GREENERS CAN THROW TWO LEAVES AT ONCE, SO BE CAREFUL, AS THEY SLICE THROUGH ANYTHING THAT CROSSES THEIR PATH!",
            images: [
                this.createImage('bigGreener', 113, 150, 0, this.pageWidth - 150, this.pageHeight - 170, 1),
                this.createImage('leafAttack', 35.416, 45, 0, this.pageWidth - 200, this.pageHeight - 125, 1),
                this.createImage('leafAttack', 35.416, 45, 8, this.pageWidth - 340, this.pageHeight - 125, 1),
            ],
            mapKey: "map4",
        });

        // 23
        this.createPage({
            name: "CHIQUITA",
            type: "FLY & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n"
                + "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n"
                + "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.",
            images: [
                this.createImage('chiquita', 118.823529411764, 85, 0, this.pageWidth - 190, 40, 1),
            ],
            mapKey: "map4",
        });

        // 24
        this.createPage({
            name: "SLUGGIE",
            type: "GROUND & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW OF THAT "
                + "IF YOU STEP TOO CLOSE TO HIM!",
            images: [
                this.createImage('paint_splatter_4', 1994, 995, 0, -170, 30, 0.9),
                this.createImage('sluggie', 147.33, 110, 0, this.pageWidth - 200, this.pageHeight - 140, 1),
            ],
            mapKey: "map4",
        });

        // 25
        this.createPage({
            name: "LIL HORNET",
            type: "FLY & STUN",
            foundAt: "VERDANT VINE",
            description:
                "WITH A SHARP HORN AT THE TOP OF ITS HEAD, THEY CAN CAUSE SOME SERIOUS DAMAGE IF YOU MAKE CONTACT WITH THEM!\n"
                + "IT IS BELIEVED THAT EVERY CREATURE IN VERDANT VINE IS AFRAID TO ATTACK LIL HORNETS DUE TO THEIR INTIMIDATING HORN!",
            images: [
                this.createImage('lilHornet', 56, 47, 0, this.pageWidth - 170, 50, 1, 'stun'),
            ],
            mapKey: "map4",
        });

        // 26
        this.createPage({
            name: "KARATE CROCO",
            type: "GROUND & RED",
            foundAt: "VERDANT VINE",
            description:
                "THIS CROCODILE USED TO LIVE IN CORAL ABYSS CENTURIES AGO.\n"
                + "LEGENDS SAY AN EARTHQUAKE CAUSED A HUGE TSUNAMI, FLUSHING THE CROCODILE TO THE SHORE OF VERDANT VINE.\nCROCO, IN NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
                + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!",
            images: [
                this.createImage('karateCrocoIdle', 98.25, 140, 0, this.pageWidth - 150, this.pageHeight - 160, 1, 'red'),
            ],
            mapKey: "map4",
        });

        // 27
        this.createPage({
            name: "ZABKOUS",
            type: "GROUND & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "JUMPING AND LEAPING AROUND IS WHAT THIS FROG NORMALLY DOES..."
                + "UNTIL HE SEES A TARGET! HE CAN SPIT POISON OUT OF HIS MOUTH, DRAINING ENERGY RAPIDLY!",
            images: [
                this.createImage('zabkousAttack', 134.0588235294118, 100, 14, this.pageWidth - 200, this.pageHeight - 140, 1),
                this.createImage('poison_spit', 59, 22, 0, this.pageWidth - 260, this.pageHeight - 100, 1, 'poison'),
            ],
            mapKey: "map4",
        });

        // 28
        this.createPage({
            name: "SPIDOLAZER",
            type: "GROUND & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "SPIDOLAZER IS A BIG SPIDER FOUND IN DENSE, PLANT-RICH AREAS.\n"
                + "IT HAS THE UNIQUE ABILITY TO SHOOT FOCUSED LASERS FROM ITS EYE.\nTHERE IS SPECULATION REGARDING THE ORIGINS OF SPIDOLAZER, AS SOME LOCAL RESIDENTS BELIEVE "
                + "THAT THIS SPIDER IS FROM ANOTHER PLANET DUE TO ITS ALIEN-LIKE CHARACTERISTICS.",
            images: [
                this.createImage('spidoLazerAttack', 134.45, 120, 13, this.pageWidth - 210, this.pageHeight - 140, 1),
                this.createImage('laser_beam', 300, 28, 0, this.pageWidth - 440, this.pageHeight - 105, 1),
            ],
            mapKey: "map4",
        });

        // 29
        this.createPage({
            name: "JERRY",
            type: "FLY & NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "JERRY LIKES TO GIVE OUT PRESENTS... BUT NOT THE TYPE OF PRESENTS YOU'D EXPECT!\n"
                + "NO ONE KNOWS HOW HE GOT SO MANY SKULNAPS IN HIS BAG!",
            images: [
                this.createImage('jerry', 185, 103, 4, this.pageWidth - 250, 30, 1),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 170, this.pageHeight - 420, 0.80, 'stun'),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 250, 0.80, 'stun'),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 130, this.pageHeight - 70, 0.80, 'stun'),
                this.createImage('skulnapAwake', 104.23076923076923, 70, 0, this.pageWidth - 280, this.pageHeight - 85, 0.80, 'stun'),
            ],
            mapKey: "map4",
        });


        // MAP 5 - Springly Lemony
        // 30
        this.createCoverPage({
            mapKey: 'map5',
            coverTitle: 'SPRINGLY LEMONY',
            category: 'main',
            coverImages: [
                this.createCoverImage('map5Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "SNAILEY",
            type: "GROUND & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description: "JUST A REGULAR SNAIL...",
            images: [
                this.createImage('snailey', 103, 74, 0, this.pageWidth - 230, this.pageHeight - 100, 1),
            ],
            mapKey: "map5",
        });

        // 31
        this.createPage({
            name: "REDFLYER",
            type: "FLY & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
                + "RAIN EFFECT: SHOOTS LASERS OUT OF ITS EYE!",
            images: [
                this.createImage('redFlyer', 79.3333333, 65, 0, this.pageWidth - 140, 70, 1),
                this.createImage('darkLaser', 63, 40, 0, this.pageWidth - 200, 92, 1),
            ],
            mapKey: "map5",
        });

        // 32
        this.createPage({
            name: "PURPLEFLYER",
            type: "FLY & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
                + "RAIN EFFECT: SHOOTS ICE BALLS OUT OF ITS EYE, SLOWING YOU DOWN IF YOU MAKE CONTACT WITH IT!",
            images: [
                this.createImage('purpleFlyer', 83.33333, 65, 0, this.pageWidth - 140, 70, 1),
                this.createImage('iceBall', 35, 35, 0, this.pageWidth - 180, 100, 1, 'slow'),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 220, 100, 0.05),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 180, 150, 0.05),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 100, 170, 0.05),
            ],
            mapKey: "map5",
        });

        // 33
        this.createPage({
            name: "LAZY MOSQUITO",
            type: "FLY & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description: "JUST A LAZY MOSQUITO...",
            images: [
                this.createImage('lazyMosquito', 67.23076923076923, 50, 0, this.pageWidth - 160, 70, 1.1),
            ],
            mapKey: "map5",
        });

        // 34
        this.createPage({
            name: "LEAF SLUG",
            type: "GROUND & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
                + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDING. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET IT FINDS AHEAD!\n",
            images: [
                this.createImage('leafSlug', 89, 84, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
            ],
            mapKey: "map5",
        });

        // 35
        this.createPage({
            name: "SUNFLORA",
            type: "GROUND & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS MASSIVE, UNIQUELY SHAPED FLOWER ABSORBS SUNLIGHT AT AN EXCEPTIONALLY RAPID RATE COMPARED TO ANY OTHER "
                + "FLOWER IN THE VICINITY.\nRAIN EFFECT: WHEN IT RAINS, SUNFLORA HARNESSES THE STORED SOLAR ENERGY AND RELEASES IT IN THE FORM OF POWERFUL YELLOW LASER BEAMS.",
            images: [
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 210, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 310, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 410, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 510, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 610, 1),
                this.createImage('sunflora', 132, 137, 0, this.pageWidth - 210, this.pageHeight - 150, 1),
            ],
            mapKey: "map5",
        });

        // 36
        this.createPage({
            name: "EGGRY",
            type: "GROUND & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "EGGRY IS THE ANGRY EGG THAT NEVER HATCHED.\n"
                + "NO ONE TRULY KNOWS WHAT EGGRY WOULD HATCH INTO OR WHY IT DECIDES TO REMAIN IN ITS SEMI-CRACKED SHELL, BUT LEGENDS SAY IT’S WAITING FOR THE PERFECT STORM TO FINALLY BREAK FREE.\n"
                + "RAIN EFFECT: DUE TO ITS SOFT SHELL, EGGRY JUMPS ANGRILY IN HOPES OF FINDING SHELTER FROM THE RAIN!",
            images: [
                this.createImage('eggry', 102.6923076923077, 100, 12, this.pageWidth - 180, this.pageHeight - 115, 1),
            ],
            mapKey: "map5",
        });

        // 37
        this.createPage({
            name: "TAURO",
            type: "GROUND & RED",
            foundAt: "SPRINGLY LEMONY",
            description:
                "TAURO IS AN ANGRY CREATURE WHO STOMPS LOUDLY AS HE MOVES FORWARD, KNOCKING EVERYTHING IN HIS PATH DOWN!\n"
                + "LEGENDS SAY HE USED TO LIVE NEAR ACTIVE VOLCANOES, BUT ONCE HIS HABITAT WAS DESTROYED BY THE ERUPTION OF A MASSIVE VOLCANO, HE WAS FORCED TO COME TO SPRINGLY LEMONY.\n"
                + "NOW, HE RESIDES HERE, HIS RAGE FUELED BY THE MEMORY OF HIS LOST HOME AND THE DESTRUCTION CAUSED BY THE ERUPTION!",
            images: [
                this.createImage('tauro', 151, 132, 0, this.pageWidth - 210, this.pageHeight - 150, 1, 'red'),
            ],
            mapKey: "map5",
        });

        // 38
        this.createPage({
            name: "BEE",
            type: "FLY & STUN",
            foundAt: "SPRINGLY LEMONY",
            description:
                "IN THIS AREA RESIDES THOUNSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
                + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!",
            images: [
                this.createImage('bee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
            ],
            mapKey: "map5",
        });

        // 39
        this.createPage({
            name: "ANGRY BEE",
            type: "FLY & STUN",
            foundAt: "SPRINGLY LEMONY",
            description:
                "RAIN EFFECT: THESE FASTER, ANGRIER, AND MORE FEROCIOUS BEES ONLY APPEAR DURING THE RAIN, AS REGULAR BEES SEEK COVER!",
            images: [
                this.createImage('angryBee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
            ],
            mapKey: "map5",
        });

        // 40
        this.createPage({
            name: "HANGING SPIDOLAZER",
            type: "CRAWLER & NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "HAVE YOU EVER SEEN A SPIDER HANGING ON A WEB SHOOTING LASERS!?\n"
                + "THESE HANGING SPIDER-LASERS ARE THE SAME SPECIES AS THE ONES FOUND ON THE GROUND IN VERDANT VINE, BUT HERE THEY CRAWL FROM TREES BECAUSE THEIR LEGS CAN OVERHEAT ON THE "
                + "HOT GROUND.\nTHE STRONG SUN ALSO GIVES THEM A SLIGHT YELLOW TINT TO THEIR SKIN!",
            images: [
                this.createImage('blackLine', 3, 485, 0, this.pageWidth - 120, -30, 1),
                this.createImage('hangingSpidoLazer', 123.2333333333333, 110, 17, this.pageWidth - 180, this.pageHeight - 200, 1),
                this.createImage('laser_beam', 170, 28, 0, this.pageWidth - 340, this.pageHeight - 140, 1),
            ],
            mapKey: "map5",
        });


        // MAP 6 - Venomveil Lake
        // 41
        this.createCoverPage({
            mapKey: 'map6',
            coverTitle: 'VENOMVEIL LAKE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map6Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "CACTUS",
            type: "GROUND & STUN",
            foundAt: "VENOMVEIL LAKE",
            description: "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.",
            images: [
                this.createImage('cactus', 71, 90, 0, this.pageWidth - 180, this.pageHeight - 120, 1, 'stun'),
            ],
            mapKey: "map6",
        });


        // MAP 7 - Infernal Crater Peak
        // 41
        this.createCoverPage({
            mapKey: 'map7',
            coverTitle: 'INFERNAL CRATER PEAK',
            category: 'main',
            coverImages: [
                this.createCoverImage('map7Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "CACTUS",
            type: "GROUND & STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description: "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.",
            images: [
                this.createImage('cactus', 71, 90, 0, this.pageWidth - 180, this.pageHeight - 120, 1, 'stun'),
            ],
            mapKey: "map7",
        });

        // 42
        this.createPage({
            name: "PETROPLANT",
            type: "GROUND & NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "PETROPLANTS EMERGED LONG AFTER THE ERUPTION OF THE VOLCANOES.\n"
                + "THIS UNIQUE PLANT CAN ONLY GROW IN THIS AREA, AS IT IS FUELED BY THE MINERALS IN THE GROUND RATHER THAN DEPENDING ON THE SUNS LIGHT.\n"
                + "THEY CAN THROW DANGEROUS ROCKS FROM THEIR MOUTHS WHEN THEY FEEL THREATENED.",
            images: [
                this.createImage('petroPlant', 91.5555555, 100, 0, this.pageWidth - 180, this.pageHeight - 120, 1),
                this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 240, this.pageHeight - 100, 1, 'stun'),
                this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 430, this.pageHeight - 100, 1, 'stun'),
            ],
            mapKey: "map7",
        });

        // 43
        this.createPage({
            name: "PLAZER",
            type: "GROUND & NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THIS ODD-LOOKING PLANT CANNOT HELP ITSELF BUT SHOOT A LASER OUT OF ITS EYE WHEN IT BLINKS!\n"
                + "BE CAREFUL NOT TO GET CAUGHT BY THE LASER RAYS!",
            images: [
                this.createImage('plazer', 75, 89, 2, this.pageWidth - 150, this.pageHeight - 110, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 250, this.pageHeight - 101, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 450, this.pageHeight - 101, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 650, this.pageHeight - 101, 1),
            ],
            mapKey: "map7",
        });

        // 44
        this.createPage({
            name: "VEYNOCULUS ",
            type: "FLY & NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "RUMOURS HAVE SPREAD ACROSS THE LAND OF THIS INFAMOUS SMALL CREATURE.\n"
                + "IT IS BELIEVED THAT BEFORE THE ERUPTION, VEYNOCULUS USED TO LIVE INSIDE ACTIVE VOLCANOS AND FEED OFF MICRO-ORGANISMS AROUND THE CRATERS.\n"
                + "AFTER THE ERUPTION OF THE VOLCANO, IT BECAME TOO AFRAID TO LIVE INSIDE ANYMORE AND STARTED TO ROAM THE SURROUNDING AREA OF INFERNAL CRATER PEAK!",
            images: [
                this.createImage('veynoculus', 57, 37, 0, this.pageWidth - 140, 70, 1.3),
            ],
            mapKey: "map7",
        });

        // 45
        this.createPage({
            name: "VOLCANURTLE",
            type: "GROUND & RED",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "JUST A BIG AND SLOW TURTLE THAT ALWAYS MARCHES FORWARD...\n"
                + "THIS TYPE OF TURTLE WILL BE IN HIBERNATION FOR MOST OF THE YEAR, SO IF YOU CATCH SIGHT OF ONE, CONSIDER YOURSELF QUITE LUCKY!",
            images: [
                this.createImage('volcanurtle', 177, 107, 4, this.pageWidth - 300, this.pageHeight - 120, 1, 'red'),
            ],
            mapKey: "map7",
        });

        // 46
        this.createPage({
            name: "THE ROCK",
            type: "GROUND & RED",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THE ROCK FORMED FROM VOLCANIC CRATER MATERIAL AND IS SAID TO POSSESS UNIQUE MINERAL PROPERTIES.\n"
                + "IT IS BELIEVED THAT THE ROCK HOLDS SECRETS OF THE REGION'S VOLCANIC HISTORY AND THAT IT WAS FORMED FROM THE ERUPTION OF MULTIPLE VOLCANOES AROUND THE AREA!",
            images: [
                this.createImage('theRock', 132, 132, 0, this.pageWidth - 210, this.pageHeight - 140, 1, 'red'),
            ],
            mapKey: "map7",
        });

        // 47
        this.createPage({
            name: "VOLCANO WASP",
            type: "FLY & STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "IF YOU THOUGHT BEES WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP!\n"
                + "VOLCANO WASPS ARE DEVIOUS MENACES, LOATHING EVERYTHING THAT BREATHES AND STINGING ANY TARGET THEY SPOT!\n"
                + "LITTLE IS KNOWN ABOUT THEM EXCEPT THAT THEY ONCE INHABITED THE LUSH ENVIRONMENT OF VERDANT VINE, BUT SOMETHING FORCED THEM TO MIGRATE TO VOLCANIC AREAS...",
            images: [
                this.createImage('volcanoWasp', 113, 125, 0, this.pageWidth - 170, 70, 1, 'stun'),
            ],
            mapKey: "map7",
        });

        // 48
        this.createPage({
            name: "ROLLHOG",
            type: "GROUND & NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "ROLLHOGS USED TO LIVE UNDERNEATH THE SOIL OF THIS AREA UNTIL THE BIG ERUPTION OCCURRED.\n"
                + "NOW, THE GROUND HAS BECOME TOO HOT FOR ROLLHOG TO HIDE UNDERNEATH.\nTO SURVIVE, HE HAD TO LEARN AN ATTACK... AND SO HE LEARNED TO ROLL HIMSELF FORWARD, KNOCKING OUT "
                + "ANY ENEMY THAT DARES TO STAND IN HIS WAY!",
            images: [
                this.createImage('rollhogWalk', 125, 85, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
                this.createImage('rollhogRoll', 97, 92, 0, this.pageWidth - 510, this.pageHeight - 110, 1),
            ],
            mapKey: "map7",
        });

        // 49
        this.createPage({
            name: "DRAGON",
            type: "FLY & NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "IF THERE IS A CREATURE THAT EVERY BEING FEARS IN INFERNAL CRATER PEAK, IT'S THE DRAGON!\n"
                + "ITS IMPOSING WINGS HAVE THE POWER TO WHIP UP FEROCIOUS TORNADOES, RAGING ACROSS THE LAND.\nIT IS BELIEVED THAT THOUSANDS OF YEARS AGO, THE DRAGON'S ROAR CAUSED "
                + "THE VOLCANOES IN THE AREA TO ERUPT DUE TO THE INTENSITY OF THE FREQUENCY VIBRATIONS!",
            images: [
                this.createImage('dragon', 182, 172, 0, this.pageWidth - 230, 30, 1),
                this.createImage('windAttack', 105, 120, 0, this.pageWidth - 240, 180, 1),
            ],
            mapKey: "map7",
        });


        // BONUS MAP 1 - Icebound Cave
        this.createCoverPage({
            mapKey: 'bonusMap1',
            coverTitle: 'ICEBOUND CAVE',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap1Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "BONUS GOBLITO",
            type: "GROUND & NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "DUMMY LORE: A STRANGER VERSION OF GOBLITO ROAMS THESE LANDS.\n"
                + "DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.",
            images: [
                this.createImage('goblinSteal', 60.083, 80, 3, this.pageWidth - 135, this.pageHeight - 120, 1.3),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });


        // BONUS MAP 2 - Crimson Fissure
        this.createCoverPage({
            mapKey: 'bonusMap2',
            coverTitle: 'CRIMSON FISSURE',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap2Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "BONUS CHIQUITA",
            type: "FLY & NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "DUMMY LORE: DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.\n"
                + "DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.",
            images: [
                this.createImage('chiquita', 118.823529411764, 85, 0, this.pageWidth - 190, 40, 1),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });


        // BONUS MAP 3 - Cosmic Rift
        this.createCoverPage({
            mapKey: 'bonusMap3',
            coverTitle: 'COSMIC RIFT',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap3Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({
            name: "BONUS DOTTER",
            type: "FLY & NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "DUMMY LORE: LOREM IPSUM DOLOR SIT AMET, COSMIC ADIPISCING ADIPISCINCINCING COSMIC RIFT. SED MOLESTIE MI TELLUS.\n"
                + "DUIS ALIQUAM COSMIC IPSUM, EGET RIFT ULLAMCORPER TORTOR COSMIC RIFT POSUERE.",
            images: [
                this.createImage('dotter', 60.083, 80, 0, this.pageWidth - 140, 60, 1.4),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    update() {
        this.game.audioHandler.menu.stopSound('soundtrack');
    }

    isNightMode() {
        const storyNight = this.game.map2Unlocked && this.game.map3Unlocked === false;
        const clockNight = isLocalNight(20, 6);
        return storyNight || clockNight;
    }

    buildHighlightTokens(phraseColors) {
        return Object.entries(phraseColors).map(([phrase, style]) => ({
            phrase,
            words: phrase.trim().split(/\s+/),
            style,
        }));
    }

    createPage({
        name = '',
        type = '',
        foundAt = '',
        description = '',
        images = [],
        mapKey = null,
        category = 'main',
        pageKind = 'enemy',

        coverTitle = null,
        coverImages = [],
    } = {}) {
        const page = {
            pageKind,
            name,
            type,
            foundAt,
            description,
            images,
            category,
            mapKey,

            coverTitle,
            coverImages,
        };

        (category === 'bonus' ? this.bonusPages : this.mainPages).push(page);
    }

    createCoverImage(imageId, x, y, width, height, options = {}) {
        return {
            img: document.getElementById(imageId),
            x, y, width, height,
            alpha: options.alpha ?? 1,
            rotate: options.rotate ?? 0,
            shadowColor: options.shadowColor ?? null,
            shadowBlur: options.shadowBlur ?? 0,
        };
    }

    ensureNextPageIsLeft(category = 'main') {
        const list = (category === 'bonus') ? this.bonusPages : this.mainPages;

        if (list.length % 2 === 1) {
            this.createPage({ category, pageKind: 'blank' });
        }
    }

    getTitleStyle(title) {
        if (!title) return null;
        return this.phraseColors[title] || null;
    }

    createCoverPage({
        mapKey,
        coverTitle,
        category = 'main',
        coverImages = [],
    } = {}) {
        this.ensureNextPageIsLeft(category);

        this.createPage({
            mapKey,
            category,
            pageKind: 'cover',
            coverTitle,
            coverImages,
        });
    }

    createImage(enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, size, type) {
        return {
            enemyImage: document.getElementById(enemyImage),
            frameWidth,
            frameHeight,
            enemyFrame,
            enemyX,
            enemyY,
            size,
            type // 'red' or 'stun' or 'poison' or 'slow' or null
        };
    }

    setCategory(category) {
        if (category !== 'main' && category !== 'bonus') return;
        if (this.category === category) return;

        if (category === 'bonus' && !this.game.bonusMap1Unlocked) return;

        if (this.category === 'main') {
            this.currentPageMain = this.currentPage;
        } else if (this.category === 'bonus') {
            this.currentPageBonus = this.currentPage;
        }

        this.category = category;
        this.pages = (category === 'bonus') ? this.bonusPages : this.mainPages;

        if (this.category === 'main') {
            const maxIndex = Math.max(0, this.mainPages.length - 1);
            this.currentPage = Math.min(this.currentPageMain, maxIndex);
        } else {
            const maxIndex = Math.max(0, this.bonusPages.length - 1);
            this.currentPage = Math.min(this.currentPageBonus, maxIndex);
        }

        this.game.audioHandler.menu.playSound('enemyLoreSwitchTabSound', false, true);
    }

    getMainTabBounds() {
        const tabWidth = 200;
        const tabHeight = 50;
        const x = this.bookX + 40;
        const y = this.bookY - tabHeight - 15;
        return { x, y, width: tabWidth, height: tabHeight };
    }

    getBonusTabBounds() {
        const tabWidth = 200;
        const tabHeight = 50;
        const x = this.bookX + 260;
        const y = this.bookY - tabHeight - 15;
        return { x, y, width: tabWidth, height: tabHeight };
    }

    getMapKeysForCategory(category) {
        if (category === 'bonus') return ['bonusMap1', 'bonusMap2', 'bonusMap3'];
        return ['map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7'];
    }

    isMapKeyUnlocked(mapKey) {
        if (mapKey === 'bonusMap3') {
            return (
                !!this.game.bonusMap3Unlocked &&
                !!this.game.elyvorgDefeated &&
                !!this.game.glacikalDefeated
            );
        }

        const flag = `${mapKey}Unlocked`;

        if (Object.prototype.hasOwnProperty.call(this.game, flag)) {
            return !!this.game[flag];
        }

        if (mapKey === 'map1') return true;
        return false;
    }

    getUnlockedMapKeysForCurrentCategory() {
        const keys = this.getMapKeysForCategory(this.category);
        return keys.filter(k => this.isMapKeyUnlocked(k));
    }

    getFirstPageIndexForMapKey(mapKey) {
        const list = this.pages;
        for (let i = 0; i < list.length; i++) {
            if (list[i]?.mapKey === mapKey) return i;
        }
        return -1;
    }

    getActiveMapKeyForSpread() {
        const left = this.pages[this.currentPage]?.mapKey || null;
        const right = (this.currentPage + 1 < this.pages.length)
            ? (this.pages[this.currentPage + 1]?.mapKey || null)
            : null;

        if (right && right !== left) return right;
        return left;
    }

    getMapNumberTabs() {
        const unlocked = this.getUnlockedMapKeysForCurrentCategory();
        const tabs = [];

        const w = 42;
        const h = 34;

        const MAX_SLOTS = 7;
        const stepX = 4;
        const stepY = 55;

        const lastSlotX = (this.game.width - 55) - w;

        const baseX = lastSlotX - ((MAX_SLOTS - 1) * stepX);
        const baseY = this.bookY + 80;

        const getSlotIndex = (mapKey) => {
            const n = parseInt(
                mapKey.replace('bonusMap', '').replace('map', ''),
                10
            );
            return Number.isFinite(n) ? n - 1 : -1;
        };

        for (const mapKey of unlocked) {
            const slotIndex = getSlotIndex(mapKey);
            if (slotIndex < 0 || slotIndex >= MAX_SLOTS) continue;

            const x = baseX + (slotIndex * stepX);
            const y = baseY + (slotIndex * stepY);

            tabs.push({
                mapKey,
                label: String(slotIndex + 1),
                x,
                y,
                width: w,
                height: h,
            });
        }

        tabs.sort((a, b) => a.y - b.y);

        return tabs;
    }

    drawMapNumberTabs(context) {
        const tabs = this.getMapNumberTabs();
        if (!tabs.length) return;

        const activeMapKey = this.getActiveMapKeyForSpread();

        const drawMiniTab = (tab, isActive) => {
            const r = 8;

            context.beginPath();
            context.moveTo(tab.x, tab.y + tab.height);
            context.lineTo(tab.x, tab.y);
            context.lineTo(tab.x + tab.width - r, tab.y);
            context.quadraticCurveTo(tab.x + tab.width, tab.y, tab.x + tab.width, tab.y + r);
            context.lineTo(tab.x + tab.width, tab.y + tab.height - r);
            context.quadraticCurveTo(tab.x + tab.width, tab.y + tab.height, tab.x + tab.width - r, tab.y + tab.height);
            context.lineTo(tab.x, tab.y + tab.height);
            context.closePath();

            const gradient = context.createLinearGradient(tab.x, tab.y, tab.x, tab.y + tab.height);
            if (isActive) {
                gradient.addColorStop(0, '#f0e6c8');
                gradient.addColorStop(1, '#d2c397');
            } else {
                gradient.addColorStop(0, '#cbc8bd');
                gradient.addColorStop(1, '#afa894');
            }

            context.fillStyle = gradient;
            context.shadowColor = isActive ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)';
            context.shadowBlur = isActive ? 10 : 4;
            context.fill();

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.font = 'bold 18px "Gloria Hallelujah"';
            context.textAlign = 'center';
            context.fillStyle = '#2b2414';
            context.shadowColor = isActive ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)';
            context.shadowBlur = isActive ? 6 : 3;

            const cx = tab.x + tab.width / 2;
            const cy = tab.y + tab.height / 2 + 5;
            context.fillText(tab.label, cx, cy);

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            if (isActive) {
                const textWidth = context.measureText(tab.label).width;
                const underlineY = tab.y + tab.height / 2 + 10;
                const underlineX1 = cx - textWidth / 2;
                const underlineX2 = cx + textWidth / 2;

                context.strokeStyle = '#2b2414';
                context.lineWidth = 2;

                const y1 = underlineY - 1;
                const y2 = underlineY + 0;
                const y3 = underlineY + 1;

                context.beginPath();
                context.moveTo(underlineX1, y1);
                context.lineTo(underlineX1 + textWidth * 0.5, y2);
                context.lineTo(underlineX2, y3);
                context.stroke();
            }
        };

        for (let i = tabs.length - 1; i >= 0; i--) {
            const tab = tabs[i];
            drawMiniTab(tab, tab.mapKey === activeMapKey);
        }
    }

    getMaxValidIndex() {
        return this.pages.length % 2 === 0
            ? this.pages.length - 2
            : this.pages.length - 1;
    }

    drawPageContent(context, pageIndex, x, y) {
        const page = this.pages[pageIndex];
        if (!page) return;

        if (page.pageKind === 'blank') return;

        if (page.pageKind === 'cover') {
            const locked = (typeof page.mapKey === 'string')
                ? !this.isMapKeyUnlocked(page.mapKey)
                : false;

            context.save();
            context.beginPath();
            context.rect(x, y, this.pageWidth, this.pageHeight);
            context.clip();

            const drawCoverImages = (list, blurAmount = 0) => {
                if (!Array.isArray(list) || list.length === 0) return;

                for (const item of list) {
                    if (!item?.img) continue;

                    context.save();

                    context.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
                    context.globalAlpha = item.alpha ?? 1;

                    if (item.shadowColor) {
                        context.shadowColor = item.shadowColor;
                        context.shadowBlur = item.shadowBlur ?? 0;
                    } else {
                        context.shadowColor = 'transparent';
                        context.shadowBlur = 0;
                    }

                    const dx = x + (item.x ?? 0);
                    const dy = y + (item.y ?? 0);
                    const dw = item.width ?? this.pageWidth;
                    const dh = item.height ?? this.pageHeight;

                    const rot = item.rotate ?? 0;
                    if (rot) {
                        const cx = dx + dw / 2;
                        const cy = dy + dh / 2;
                        context.translate(cx, cy);
                        context.rotate(rot);
                        context.drawImage(item.img, -dw / 2, -dh / 2, dw, dh);
                    } else {
                        context.drawImage(item.img, dx, dy, dw, dh);
                    }

                    context.restore();
                }
            };

            drawCoverImages(page.coverImages, locked ? 65 : 0);

            context.filter = 'none';

            const displayTitle = locked ? '???' : (page.coverTitle || page.mapKey || '???');
            const style = this.getTitleStyle(displayTitle) || { fill: '#2b2414', stroke: 'white', strokeBlur: 10 };

            const cx = x + this.pageWidth / 2;
            const cy = y + this.pageHeight / 2;

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = 'bold 44px "Gloria Hallelujah"';

            context.fillStyle = style.fill || 'black';
            context.strokeStyle = style.stroke || 'transparent';
            context.lineWidth = 10;

            context.shadowColor = style.stroke || 'transparent';
            context.shadowBlur = style.strokeBlur || 0;

            if (context.strokeStyle !== 'transparent') context.strokeText(displayTitle, cx, cy);
            context.fillText(displayTitle, cx, cy);

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.restore();
            return;
        }

        context.font = 'bold 21px "Gloria Hallelujah"';
        context.fillStyle = 'black';
        context.textAlign = 'left';

        const locked = page.mapKey ? !this.isMapKeyUnlocked(page.mapKey) : false;

        context.save();
        context.beginPath();
        context.rect(x, y, this.pageWidth, this.pageHeight);
        context.clip();

        if (page.images && page.images.length > 0) {
            page.images.forEach(image => {
                context.filter = locked ? 'blur(15px)' : 'none';

                const scale = image.size || 1;
                const frameWidth = image.frameWidth * scale;
                const frameHeight = image.frameHeight * scale;
                const frameX = image.enemyFrame * image.frameWidth;

                context.shadowColor = 'transparent';
                context.shadowBlur = 0;

                if (image.type === 'red') {
                    context.shadowColor = 'red';
                    context.shadowBlur = 20;
                } else if (image.type === 'stun') {
                    context.shadowColor = 'yellow';
                    context.shadowBlur = 20;
                } else if (image.type === 'poison') {
                    context.shadowColor = 'green';
                    context.shadowBlur = 20;
                } else if (image.type === 'slow') {
                    context.shadowColor = 'blue';
                    context.shadowBlur = 20;
                }

                context.drawImage(
                    image.enemyImage,
                    frameX, 0,
                    image.frameWidth, image.frameHeight,
                    x + image.enemyX, y + image.enemyY,
                    frameWidth, frameHeight
                );

                context.shadowColor = 'transparent';
                context.shadowBlur = 0;
            });
        }

        context.restore();

        const lineHeight = 28;
        const gapHeight = 24;
        const maxWidth = this.pageWidth - 230;

        let offsetY = 50;

        const renderText = (text, startX, startY) => {
            // tokenize text into words/spaces/newlines
            const rawPieces = text.split(' ');
            const tokens = [];

            rawPieces.forEach((piece, idx) => {
                const parts = piece.split('\n');
                for (let i = 0; i < parts.length; i++) {
                    const fragment = parts[i];
                    if (fragment.length > 0) {
                        tokens.push({ type: 'word', text: fragment, style: null });
                    }
                    if (i < parts.length - 1) {
                        tokens.push({ type: 'newline' });
                    }
                }
                if (idx < rawPieces.length - 1) {
                    tokens.push({ type: 'space' });
                }
            });

            // phrase matching across the full word stream
            const normalize = (s) => s.replace(/[^\w]/g, '').toUpperCase();

            const wordIndexes = [];
            tokens.forEach((t, i) => {
                if (t.type === 'word') wordIndexes.push(i);
            });

            this.highlightPhrases.forEach(({ words, style }) => {
                const normPhrase = words.map(w => normalize(w));
                if (!normPhrase.length) return;

                for (let wi = 0; wi <= wordIndexes.length - normPhrase.length; wi++) {
                    let match = true;
                    for (let pi = 0; pi < normPhrase.length; pi++) {
                        const token = tokens[wordIndexes[wi + pi]];
                        if (normalize(token.text) !== normPhrase[pi]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        for (let pi = 0; pi < normPhrase.length; pi++) {
                            const token = tokens[wordIndexes[wi + pi]];
                            token.style = style;
                        }
                    }
                }
            });

            // wrap and draw with styles
            let currentY = startY;
            let lineTokens = [];
            let lineWidthAccum = 0;

            const flushLine = () => {
                let offsetX = startX;
                lineTokens.forEach(token => {
                    if (token.type === 'newline') return;
                    const textPart = token.type === 'space' ? ' ' : token.text;

                    const style = token.style || {};
                    const fillStyle = style.fill || 'black';
                    const strokeStyle = style.stroke || 'transparent';
                    const strokeBlur = style.strokeBlur || 0;

                    context.fillStyle = fillStyle;
                    context.strokeStyle = strokeStyle;
                    context.lineWidth = 4;
                    context.shadowBlur = strokeBlur;
                    context.shadowColor = strokeStyle;

                    context.strokeText(textPart, offsetX, currentY);
                    context.fillText(textPart, offsetX, currentY);

                    offsetX += context.measureText(textPart).width;
                });

                currentY += lineHeight;
                lineTokens = [];
                lineWidthAccum = 0;
            };

            tokens.forEach(token => {
                if (token.type === 'newline') {
                    if (lineTokens.length > 0) flushLine();
                    else currentY += lineHeight;
                    return;
                }

                const textPart = token.type === 'space' ? ' ' : token.text;
                const width = context.measureText(textPart).width;

                if (token.type === 'word' && lineTokens.length > 0 && lineWidthAccum + width > maxWidth) {
                    flushLine();
                }

                lineTokens.push(token);
                lineWidthAccum += width;
            });

            if (lineTokens.length > 0) flushLine();

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
        };

        if (locked) {
            context.fillText(`NAME: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`TYPE: ??? & ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`FOUND AT: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`DESCRIPTION: ???`, x + 20, y + offsetY);
        } else {
            renderText(`NAME: ${page.name}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`TYPE: ${page.type}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`FOUND AT: ${page.foundAt}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`DESCRIPTION:`, x + 20, y + offsetY);
            offsetY += lineHeight;
            renderText(page.description, x + 20, y + offsetY);
        }
    }

    draw(context) {
        if (!this.menuActive) return;

        this.game.audioHandler.menu.stopSound('soundtrack');

        const isNight = this.isNightMode();
        const bg = isNight ? this.backgroundImageNight : this.backgroundImage;
        context.drawImage(bg, 0, 0, this.game.width, this.game.height);

        context.save();

        const mainTab = this.getMainTabBounds();
        const bonusTab = this.getBonusTabBounds();

        const drawTab = (label, tab, isActive) => {
            context.beginPath();
            const r = 8;
            context.moveTo(tab.x, tab.y + tab.height);
            context.lineTo(tab.x, tab.y + r);
            context.quadraticCurveTo(tab.x, tab.y, tab.x + r, tab.y);
            context.lineTo(tab.x + tab.width - r, tab.y);
            context.quadraticCurveTo(tab.x + tab.width, tab.y, tab.x + tab.width, tab.y + r);
            context.lineTo(tab.x + tab.width, tab.y + tab.height);
            context.closePath();

            const gradient = context.createLinearGradient(
                tab.x,
                tab.y,
                tab.x,
                tab.y + tab.height
            );

            if (isActive) {
                gradient.addColorStop(0, '#f0e6c8');
                gradient.addColorStop(1, '#d2c397');
            } else {
                gradient.addColorStop(0, '#cbc8bd');
                gradient.addColorStop(1, '#afa894');
            }

            context.fillStyle = gradient;
            context.shadowColor = isActive ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.25)';
            context.shadowBlur = isActive ? 10 : 4;
            context.fill();
            context.shadowBlur = 0;
            context.shadowColor = 'transparent';

            context.font = 'bold 20px "Gloria Hallelujah"';
            context.textAlign = 'center';
            context.fillStyle = '#2b2414';
            context.shadowColor = isActive ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)';
            context.shadowBlur = isActive ? 6 : 3;
            context.fillText(label, tab.x + tab.width / 2, tab.y + tab.height / 2 + 4);

            if (isActive) {
                const textMetrics = context.measureText(label);
                const textWidth = textMetrics.width;

                const underlineY = tab.y + tab.height / 2 + 8;
                const underlineX1 = tab.x + (tab.width - textWidth) / 2;
                const underlineX2 = underlineX1 + textWidth;

                context.strokeStyle = '#2b2414';
                context.lineWidth = 2;

                const y1 = underlineY - 1;
                const y2 = underlineY + 0;
                const y3 = underlineY + 1;

                context.beginPath();
                context.moveTo(underlineX1, y1);
                context.lineTo(underlineX1 + textWidth * 0.5, y2);
                context.lineTo(underlineX2, y3);
                context.stroke();
            }

            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
        };

        if (!this.game.bonusMap1Unlocked && this.category === 'bonus') {
            this.category = 'main';
            this.pages = this.mainPages;
            this.currentPage = Math.min(this.currentPageMain, Math.max(0, this.mainPages.length - 1));
        }

        drawTab('MAIN STORY', mainTab, this.category === 'main');

        if (this.game.bonusMap1Unlocked) {
            drawTab('BONUS MAPS', bonusTab, this.category === 'bonus');
        }

        const bookBackgroundX = (this.game.width - this.enemyLoreBookBackground.width) / 2;
        const bookBackgroundY = (this.game.height - this.enemyLoreBookBackground.height) / 2 + 10;

        context.drawImage(this.enemyLoreBookBackground, bookBackgroundX, bookBackgroundY);
        context.drawImage(this.leftPageBackground, this.bookX, this.bookY, this.pageWidth, this.pageHeight);
        context.drawImage(this.rightPageBackground, this.bookX + this.pageWidth, this.bookY, this.pageWidth, this.pageHeight);

        this.drawPageContent(context, this.currentPage, this.bookX, this.bookY);
        if (this.currentPage + 1 < this.pages.length) {
            this.drawPageContent(context, this.currentPage + 1, this.bookX + this.pageWidth, this.bookY);
        }

        this.drawMapNumberTabs(context);

        // page numbers
        context.font = '24px "Arial"';
        context.fillStyle = 'black';
        context.textAlign = 'left';
        context.fillText(this.currentPage + 1, this.bookX + 10, this.bookY + this.pageHeight - 10);
        if (this.currentPage + 1 < this.pages.length) {
            context.textAlign = 'right';
            context.fillText(this.currentPage + 2, this.bookX + this.pageWidth * 2 - 10, this.bookY + this.pageHeight - 10);
        }

        context.restore();
    }

    nextPage() {
        const maxValidIndex = this.getMaxValidIndex();
        if (this.currentPage < maxValidIndex) {
            this.currentPage++;
            this.game.audioHandler.menu.playSound('bookFlipForwardSound', false, true);
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.game.audioHandler.menu.playSound('bookFlipBackwardSound', false, true);
        }
    }

    clickNextPage() {
        const maxValidIndex = this.getMaxValidIndex();
        if (this.currentPage < maxValidIndex) {
            this.currentPage += 2;
            this.game.audioHandler.menu.playSound('bookFlipForwardSound', false, true);
        }
    }

    clickPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage = Math.max(0, this.currentPage - 2);
            this.game.audioHandler.menu.playSound('bookFlipBackwardSound', false, true);
        }
    }

    // keyboard
    handleKeyDown(event) {
        if (!this.menuActive) return;

        if (event.key === 'ArrowUp') {
            this.setCategory('main');
            return;
        }

        if (event.key === 'ArrowDown') {
            if (this.game.bonusMap1Unlocked) {
                this.setCategory('bonus');
            }
            return;
        }

        if (event.key === 'ArrowRight') {
            this.nextPage();
        } else if (event.key === 'ArrowLeft') {
            this.previousPage();
        }
    }

    // mouse wheel for pages
    handleMouseWheel(event) {
        if (!this.menuActive) return;

        const delta = Math.sign(event.deltaY);

        if (delta < 0) {
            this.clickNextPage();
        } else if (delta > 0) {
            this.clickPreviousPage();
        }
    }

    // mouse click for tabs + pages
    handleMouseClick(event) {
        if (!this.menuActive) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        const mainTab = this.getMainTabBounds();
        const bonusTab = this.getBonusTabBounds();

        const inTab = (tab) =>
            mouseX >= tab.x &&
            mouseX <= tab.x + tab.width &&
            mouseY >= tab.y &&
            mouseY <= tab.y + tab.height;

        if (inTab(mainTab)) {
            this.setCategory('main');
            return;
        }
        if (inTab(bonusTab)) {
            if (this.game.bonusMap1Unlocked) {
                this.setCategory('bonus');
            }
            return;
        }

        const leftPageBounds = {
            x: this.bookX,
            y: this.bookY,
            width: this.pageWidth,
            height: this.pageHeight
        };

        const rightPageBounds = {
            x: this.bookX + this.pageWidth,
            y: this.bookY,
            width: this.pageWidth,
            height: this.pageHeight
        };

        const mapTabs = this.getMapNumberTabs();
        for (const tab of mapTabs) {
            const inMiniTab =
                mouseX >= tab.x &&
                mouseX <= tab.x + tab.width &&
                mouseY >= tab.y &&
                mouseY <= tab.y + tab.height;

            if (inMiniTab) {
                const firstIndex = this.getFirstPageIndexForMapKey(tab.mapKey);
                if (firstIndex !== -1) {
                    let target = firstIndex;
                    if (target % 2 === 1) target = Math.max(0, target - 1);

                    const maxValidIndex = this.getMaxValidIndex();
                    target = Math.min(target, maxValidIndex);

                    if (target !== this.currentPage) {
                        this.currentPage = target;
                        this.game.audioHandler.menu.playSound('enemyLoreSwitchTabSound', false, true);
                    }
                }
                return;
            }
        }

        if (mouseX >= leftPageBounds.x &&
            mouseX <= leftPageBounds.x + leftPageBounds.width &&
            mouseY >= leftPageBounds.y &&
            mouseY <= leftPageBounds.y + leftPageBounds.height) {
            this.clickPreviousPage();
        } else if (mouseX >= rightPageBounds.x &&
            mouseX <= rightPageBounds.x + rightPageBounds.width &&
            mouseY >= rightPageBounds.y &&
            mouseY <= rightPageBounds.y + rightPageBounds.height) {
            this.clickNextPage();
        }
    }

    handleMouseMove(event) {
        // do nothing
    }
}
