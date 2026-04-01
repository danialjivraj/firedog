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
            "LUNAR GLADE": { fill: '#57e2d0ff', stroke: '#06580dff', strokeBlur: 7 },
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
            "POISON": { fill: '#a8ffb0', stroke: '#1a5e20', strokeBlur: 4 },
            "SLOW": { fill: '#c5d8ff', stroke: '#1a2a6e', strokeBlur: 4 },
            "FROZEN": { fill: '#dff4ff', stroke: '#2a7aaa', strokeBlur: 4 },
        };

        this.highlightPhrases = this.buildHighlightTokens(this.phraseColors);

        // MAP 1 - Lunar Glade
        this.createCoverPage({
            mapKey: 'map1',
            coverTitle: 'LUNAR GLADE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map1Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        // 1
        this.createPage({
            name: "GOBLITO",
            type: "NORMAL",
            foundAt: "EVERYWHERE",
            description:
                "THE GOBLITO SPECIES, ONCE NON-THREATENING PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
                + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
                + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.",
            images: [
                this.createImage('goblinSteal', 60.083, 80, 3, 'right', 'bottom'),
            ],
            mapKey: "map1",
        });

        // 2
        this.createPage({
            name: "DOTTER",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "IT IS SAID THAT DOTTERS HAVE BEEN AROUND FOR THOUSANDS OF YEARS...\n"
                + "EVEN ON THE BRINK OF EXTINCTION, THEY HAVE ALWAYS MANAGED TO SURVIVE.\n"
                + "THESE LITTLE CREATURES CAN BE FOUND ROAMING AROUND PEACEFULLY WITHIN THE FOREST.",
            images: [
                this.createImage('dotter', 60.083, 80, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        // 4
        this.createPage({
            name: "GHOBAT",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "NOT MUCH IS KNOWN ABOUT THIS GHOST-SHAPED BAT.\n"
                + "ALL THAT IS KNOWN IS THAT IT LIKES TO FLAP ITS WINGS AND CHASE DOTTERS...",
            images: [
                this.createImage('ghobat', 134.33, 84, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        // 5
        this.createPage({
            name: "RAVENGLOOM",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description: "THIS FLYING CREATURE LIKES TO PEACEFULLY FLY THROUGH TREES!",
            images: [
                this.createImage('ravengloom', 139.66, 100, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        // 6
        this.createPage({
            name: "MEAT SOLDIER",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT ALL LAND.\n"
                + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
                + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.",
            images: [
                this.createImage('meatSoldier', 67.625, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "map1",
        });

        this.createPage({
            name: "GEARGLE",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "A PECULIAR MECHANICAL CREATURE BUILT FROM GEARS, BOLTS, AND A SINGLE OVERSIZED EYE.\n"
                + "NOBODY KNOWS WHO BUILT IT OR WHY, BUT GEARGLE DESCENDS FROM ABOVE IN A WAVY PATTERN, SCANNING EVERYTHING IN ITS PATH.\n"
                + "LEGENDS SAY ITS DESIGN WAS INSPIRED BY VEYNOCULUS, A MYSTERIOUS GALACTICAL CREATURE WHOSE EXISTENCE FEW DARE TO BELIEVE.",
            images: [
                this.createImage('geargle', 64.5, 100, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        // 7
        this.createPage({
            name: "SKULNAP",
            type: "STUN",
            foundAt: "LUNAR GLADE",
            description:
                "HE HAD NEVER BEEN IN THIS AREA UNTIL SOME TIME AGO. NO ONE KNOWS HIS ORIGIN, AND IT IS BELIEVED THAT SKULNAP WAS "
                + "AN EXPERIMENT MADE BY ONE OF THE LANDS.\nHE CAN BE FOUND SLEEPING ON THE GROUND, BUT AS SOON AS YOU STEP WITHIN HEARING RANGE, YOU'LL WAKE HIM RIGHT AWAY!",
            images: [
                this.createImage('skulnap', 57, 57, 0, 'right', 'bottom', 'stun'),
            ],
            mapKey: "map1",
        });

        // 8
        this.createPage({
            name: "ABYSSAW",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "YOU'LL HEAR THEM BEFORE YOU SEE THEM!\n"
                + "THESE LOUD CREATURES SPIN AGGRESSIVELY LIKE A CHAINSAW AS THEY MOVE THROUGH THE TREES OF THE FOREST.\nWATCH OUT, SO YOU DON'T GET CUT!",
            images: [
                this.createImage('abyssaw', 100.44, 100, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        // 9
        this.createPage({
            name: "GLIDOSPIKE",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
                + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
                + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDESPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!",
            images: [
                this.createImage('glidoSpike', 191.68, 130, 0, 'right', 'top'),
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
            name: "VERTIBAT",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "VERTIBATS MAKE THEIR HOME IN NIGHTFALL PHANTOM GRAVES, HIDING ON TOP OF TREES AS THEY WAIT FOR MOVEMENT BELOW.\n"
                + "IT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCY, WHICH DRAWS THEM TO THIS HAUNTED LAND.\n"
                + "AS SOON AS THEY DETECT MOVEMENT, THEY FALL ONTO THEIR TARGET.",
            images: [
                this.createImage('vertibat', 151.166, 90, 0, 'right', 'top'),
            ],
            mapKey: "map2",
        });

        this.createPage({
            name: "DUSK PLANT",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "THESE RARE PLANTS ARE DORMANT BY DAY BUT AWAKEN AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH "
                + "OF UNSUSPECTING PREY.\n AS SOON AS THEY DETECT MOVEMENT, DUSK PLANTS WILL LAUNCH A VERY DARK LEAF FROM THEIR MOUTHS, AIMING TO SLICE THROUGH THEIR TARGET!",
            images: [
                this.createImage('duskPlant', 60, 87, 0, 'right', 'bottom'),
            ],
            mapKey: "map2",
        });

        // 11
        this.createPage({
            name: "SILKNOIR",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "THESE BIG SPIDERS APPEAR AT NIGHT, CRAWLING DOWN THE TALLEST TREES FOR SOME PREYS!\n"
                + "SILKNOIRS ARE BIG IN SIZE BECAUSE THEY FEAST ON ANYTHING THEY LAY THEIR EYES ON!",
            images: [
                this.createLine(this.pageWidth - 110, 0, 345),
                this.createImage('silknoir', 120, 144, 0, 'right', 270),
            ],
            mapKey: "map2",
        });

        // 12
        this.createPage({
            name: "WALTER THE GHOST",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "WALTER IS A VERY CURIOUS AND SPOOKY GHOST.\nIF HE SPOTS YOU, HE MIGHT CHASE YOU!",
            images: [
                this.createImage('walterTheGhost', 104.83, 84, 0, 'right', 'top'),
            ],
            mapKey: "map2",
        });

        // 13
        this.createPage({
            name: "BEN",
            type: "POISON",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "BEN IS A SMALL CREATURE WHO SEEMS TO APPEAR OUT OF NOWHERE.\nLITTLE IS KNOWN ABOUT HIS BACKSTORY OR PURPOSE, "
                + "EXCEPT THAT HE DROPS FROM ABOVE AND MOVES CURIOUSLY IN YOUR DIRECTION.",
            images: [
                this.createImage('ben', 61.5, 50, 0, 'right', 'top', 'poison'),
            ],
            mapKey: "map2",
        });

        // 13
        this.createPage({
            name: "GLOOMLET",
            type: "RED",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "GLOOMLETS ARE SHADOWS THAT SLIPPED FREE FROM THE WALLS OF NIGHTFALL PHANTOM GRAVES .\n"
                + "THEIR FACES NEVER CHANGE, BUT PEOPLE SWEAR THEIR EXPRESSIONS SHIFT WHEN NO ONE IS LOOKING.\n"
                + "SOME SAY THEY DRIFT TOWARD ANY PLACE WHERE A SECRET WAS ONCE WHISPERED, AS IF STILL LISTENING FOR THE REST OF THE STORY.",
            images: [
                this.createImage('gloomlet', 78, 74, 0, 'right', 'top', 'red'),
            ],
            mapKey: "map2",
        });

        // 14
        this.createPage({
            name: "DOLLY",
            type: "STUN",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
                + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.\nIF YOU SEE DOLLY LAUNCHING A YELLOWISH AURA, "
                + "YOU SHOULD AVOID TOUCHING IT AT ALL COSTS!",
            images: [
                this.createImage('dolly', 88.2, 120, 0, 'right', 'top'),
            ],
            mapKey: "map2",
        });

        this.createPage({
            name: "SKELLY",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "SKELLY IS A RESTLESS SKELETON THAT HAS WANDERED THESE GROUNDS FOR CENTURIES.\n"
                + "THOUGH IT MOVES FORWARD AT A STEADY PACE, SKELLY CAN LEAP GREAT DISTANCES WITHOUT WARNING, MAKING IT HARD TO PREDICT WHERE IT WILL LAND NEXT!",
            images: [
                this.createImage('skelly', 57.5, 60, 0, 'right', 'bottom'),
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
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "PIRANHAS ARE QUICK AND NIPPY FISH.\nTHEIR SHARP TEETH CAN GIVE YOU NASTY BITE, SO KEEP YOUR DISTANCE!",
            images: [
                this.createImage('piranha', 100, 70, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        // 16
        this.createPage({
            name: "SKELETON FISH",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "ROAMING THE SEAS FOR THOUSANDS OF YEARS, THESE ANCIENT FISH HAVE ADAPTED TO THEIR UNDERWATER HABITAT.\n"
                + "THEY DON'T HAVE EYES, BUT THEY CAN SENSE MOVEMENT AND WILL BE QUICK AND PERSISTENT IN CHASING YOU DOWN!",
            images: [
                this.createImage('skeletonFish', 55, 39, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        // 17
        this.createPage({
            name: "SPEAR FISH",
            type: "RED",
            foundAt: "CORAL ABYSS",
            description:
                "ONCE A MIGHTY WARRIOR IN A FORGOTTEN UNDERWATER KINGDOM, THIS FISH HAS ADOPTED A SPEAR AS ITS MOST PRIZED POSSESSION.\n"
                + "WITH A SHARP IMPOSING TIP, THE SPEAR FISH USES ITS WEAPON TO DEFEND ITS TERRITORY AND CHALLENGE ANY INTRUDERS.\n"
                + "LEGEND HAS IT THAT THE SPEAR FISH'S SKILLS WERE MASTERED IN ANCIENT DUELS, AND NOW IT GUARDS THE SEAS WITH A COMBINATION OF ANCIENT FEROCITY "
                + "AND DETERMINATION, RUNNING BRAVELY TOWARDS ITS TARGET!",
            images: [
                this.createImage('spearFish', 91.875, 110, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "map3",
        });

        // 18
        this.createPage({
            name: "JET FISH",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "IS IT A JET? IS IT A FISH? NO, IT'S BOTH!\n"
                + "JET FISH BLENDS THE SPEED OF A JET WITH THE SWIFT MOVES OF A FISH, GLIDING THROUGH THE WATERS OF CORAL ABYSS AT SUPERSONIC SPEED!",
            images: [
                this.createImage('jetFish', 124.5, 75, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        // 19
        this.createPage({
            name: "PIPER",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "PIPER SEEMS LIKE A HARMLESS ENEMY AT FIRST...\n"
                + "BUT GET TOO CLOSE, AND SHE'LL UNVEIL HER TRUE FORM, EXPANDING TO FIVE TIMES HER ORIGINAL SIZE!",
            images: [
                this.createImage('piper', 87, 67, 0, 'right', 'bottom'),
            ],
            mapKey: "map3",
        });

        // 21
        this.createPage({
            name: "JELLION",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "DRIFTING THROUGH THE DEPTHS IN LONG, HYPNOTIC WAVES, JELLION IS A CREATURE OF PURE RHYTHM.\n"
                + "DON'T BE FOOLED BY ITS GRACEFUL MOVEMENT - ITS UNDULATING PATH MAKES IT SURPRISINGLY HARD TO AVOID!",
            images: [
                this.createImage('jellion', 98.5, 120, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        // 22
        this.createPage({
            name: "VOLTZEEL",
            type: "STUN",
            foundAt: "CORAL ABYSS",
            description:
                "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
                + "IT IS RUMORED THAT HIS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.",
            images: [
                this.createImage('voltzeel', 81, 100, 4, 'right', 'top', 'stun')
            ],
            mapKey: "map3",
        });

        // 23
        this.createPage({
            name: "GARRY",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
                + "TAKES A WHILE TO FADE AWAY!",
            images: [
                this.createImage('paint_splatter_8', 1994, 995, 0, -130, 175, null, 0, 0.5),
                this.createImage('garry', 165, 122, 0, 'right', 'bottom'),
                this.createImage('inkBeam', 77, 34, 2, this.pageWidth - 250, 'bottom'),
            ],
            mapKey: "map3",
        });

        // MAP 4 - Verdant Vine
        // 23
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
            type: "POISON",
            foundAt: "VERDANT VINE",
            description:
                "THE OXYGEN LEVELS IN THIS AREA ARE TWICE AS HIGH COMPARED TO OTHERS DUE TO ITS VAST PLANTATION.\n"
                + "THIS PLANT'S LARGE SIZE IS A RESULT OF THIS ABUNDANT OXYGEN.\nBIG GREENERS CAN THROW TWO LEAVES AT ONCE, SO BE CAREFUL, AS THEY SLICE THROUGH ANYTHING THAT CROSSES THEIR PATH!",
            images: [
                this.createImage('bigGreener', 113, 150, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "map4",
        });

        // 23
        this.createPage({
            name: "CHIQUITA",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n"
                + "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n"
                + "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.",
            images: [
                this.createImage('chiquita', 95.05882352941176, 68, 0, 'right', 'top'),
            ],
            mapKey: "map4",
        });

        // 23
        this.createPage({
            name: "FOFINHA",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "FOFINHA BELONGS TO THE SAME SPECIES AS CHIQUITA, BUT WITH A FAR MORE FIERY TEMPER.\n"
                + "HIS FLIGHTS ARE QUICKER AND LESS GRACEFUL, OFTEN DARTING THROUGH THE SKY WITH SUDDEN BURSTS OF SPEED.\n"
                + "HE MAY LOOK JUST AS CHARMING, BUT GET TOO CLOSE AND YOU’LL SEE HE’S NOT AS GENTLE AS HIS COUNTERPART.",
            images: [
                this.createImage('fofinha', 118.823529411764, 85, 0, 'right', 'top'),
            ],
            mapKey: "map4",
        });

        // 24
        this.createPage({
            name: "SLUGGIE",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW OF THAT "
                + "IF YOU STEP TOO CLOSE TO HIM!",
            images: [
                this.createImage('paint_splatter_4', 1994, 995, 0, -170, 30, null, 0, 0.9),
                this.createImage('sluggie', 147.33, 110, 0, 'right', 'bottom'),
            ],
            mapKey: "map4",
        });

        // 25
        this.createPage({
            name: "LIL HORNET",
            type: "STUN",
            foundAt: "VERDANT VINE",
            description:
                "WITH A SHARP HORN AT THE TOP OF ITS HEAD, THEY CAN CAUSE SOME SERIOUS DAMAGE IF YOU MAKE CONTACT WITH THEM!\n"
                + "IT IS BELIEVED THAT EVERY CREATURE IN VERDANT VINE IS AFRAID TO ATTACK LIL HORNETS DUE TO THEIR INTIMIDATING HORN!",
            images: [
                this.createImage('lilHornet', 56, 47, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map4",
        });

        // 26
        this.createPage({
            name: "KARATE CROCO",
            type: "RED",
            foundAt: "VERDANT VINE",
            description:
                "THIS CROCODILE USED TO LIVE IN CORAL ABYSS CENTURIES AGO.\n"
                + "LEGENDS SAY AN EARTHQUAKE CAUSED A HUGE TSUNAMI, FLUSHING THE CROCODILE TO THE SHORE OF VERDANT VINE.\nCROCO, IN NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
                + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!",
            images: [
                this.createImage('karateCroco', 98.25, 140, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "map4",
        });

        // 28
        this.createPage({
            name: "SPIDOLAZER",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "SPIDOLAZER IS A BIG SPIDER FOUND IN DENSE, PLANT-RICH AREAS.\n"
                + "IT HAS THE UNIQUE ABILITY TO SHOOT FOCUSED LASERS FROM ITS EYE.\nTHERE IS SPECULATION REGARDING THE ORIGINS OF SPIDOLAZER, AS SOME LOCAL RESIDENTS BELIEVE "
                + "THAT THIS SPIDER IS FROM ANOTHER PLANET DUE TO ITS ALIEN-LIKE CHARACTERISTICS.",
            images: [
                this.createImage('spidoLazer', 134.45, 120, 13, 'right', 'bottom', null, 120),
            ],
            mapKey: "map4",
        });

        // 29
        this.createPage({
            name: "JERRY",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "JERRY LIKES TO GIVE OUT PRESENTS... BUT NOT THE TYPE OF PRESENTS YOU'D EXPECT!\n"
                + "NO ONE KNOWS HOW HE GOT SO MANY SKULNAPS IN HIS BAG!",
            images: [
                this.createImage('jerry', 185, 103, 4, 'right', 'top'),
            ],
            mapKey: "map4",
        });

        this.createPage({
            name: "VINELASH",
            type: "POISON",
            foundAt: "VERDANT VINE",
            description:
                "VINELASH LIES DORMANT BENEATH THE SOIL OF VERDANT VINE, WAITING FOR SOMETHING TO WANDER TOO CLOSE.\n"
                + "WHEN IT ERUPTS, IT HOLDS ITS GROUND AND IS NOT EASY TO TAKE DOWN — IT TAKES MORE THAN ONE HIT TO STOP IT.",
            images: [
                this.createImage('vinelash', 221, 200, 0, 'right', 'bottom', 'poison', 0, 0.9),
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
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description: "JUST A REGULAR SNAIL...",
            images: [
                this.createImage('snailey', 103, 74, 0, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        // 31
        this.createPage({
            name: "REDFLYER",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
                + "RAIN EFFECT: SHOOTS LASERS OUT OF ITS EYE!",
            images: [
                this.createImage('redFlyer', 79.3333333, 65, 0, 'right', 'top'),
            ],
            mapKey: "map5",
        });

        // 32
        this.createPage({
            name: "PURPLEFLYER",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
                + "RAIN EFFECT: SHOOTS ICE BALLS OUT OF ITS EYE, SLOWING YOU DOWN IF YOU MAKE CONTACT WITH IT!",
            images: [
                this.createImage('purpleFlyer', 83.33333, 65, 0, 'right', 'top'),
            ],
            mapKey: "map5",
        });

        // 33
        this.createPage({
            name: "LAZY MOSQUITO",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description: "JUST A LAZY MOSQUITO...",
            images: [
                this.createImage('lazyMosquito', 67.23076923076923, 50, 0, 'right', 'top'),
            ],
            mapKey: "map5",
        });

        // 34
        this.createPage({
            name: "LEAF SLUG",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
                + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDING. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET IT FINDS AHEAD!\n",
            images: [
                this.createImage('leafSlug', 89, 84, 0, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        // 35
        this.createPage({
            name: "SUNFLORA",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS MASSIVE, UNIQUELY SHAPED FLOWER ABSORBS SUNLIGHT AT AN EXCEPTIONALLY RAPID RATE COMPARED TO ANY OTHER "
                + "FLOWER IN THE VICINITY.\nRAIN EFFECT: WHEN IT RAINS, SUNFLORA HARNESSES THE STORED SOLAR ENERGY AND RELEASES IT IN THE FORM OF POWERFUL YELLOW LASER BEAMS.",
            images: [
                this.createImage('sunflora', 132, 137, 0, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        // 36
        this.createPage({
            name: "EGGRY",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "EGGRY IS THE ANGRY EGG THAT NEVER HATCHED.\n"
                + "NO ONE TRULY KNOWS WHAT EGGRY WOULD HATCH INTO OR WHY IT DECIDES TO REMAIN IN ITS SEMI-CRACKED SHELL, BUT LEGENDS SAY IT’S WAITING FOR THE PERFECT STORM TO FINALLY BREAK FREE.\n"
                + "RAIN EFFECT: DUE TO ITS SOFT SHELL, EGGRY JUMPS ANGRILY IN HOPES OF FINDING SHELTER FROM THE RAIN!",
            images: [
                this.createImage('eggry', 102.6923076923077, 100, 12, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        // 38
        this.createPage({
            name: "BEE",
            type: "STUN",
            foundAt: "SPRINGLY LEMONY",
            description:
                "IN THIS AREA RESIDES THOUNSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
                + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!",
            images: [
                this.createImage('bee', 55.23, 57, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map5",
        });

        // 39
        this.createPage({
            name: "ANGRY BEE",
            type: "STUN",
            foundAt: "SPRINGLY LEMONY",
            description:
                "RAIN EFFECT: THESE FASTER, ANGRIER, AND MORE FEROCIOUS BEES ONLY APPEAR DURING THE RAIN, AS REGULAR BEES SEEK COVER!",
            images: [
                this.createImage('angryBee', 55.23, 57, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map5",
        });

        // 40
        this.createPage({
            name: "STRAWSPIDER",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "A SMALL SPIDER WITH A BODY RESEMBLING A RIPE STRAWBERRY.\n"
                + "IT SKITTERS THROUGH THE FOLIAGE, BLENDING IN WITH THE FRUIT AROUND IT.\n"
                + "DON’T BE FOOLED BY ITS SWEET APPEARANCE! IT’S QUICK, CURIOUS, AND ALWAYS ON THE MOVE.",
            images: [
                this.createLine(this.pageWidth - 110, -30, 265),
                this.createImage('strawspider', 93.83333333333333, 110, 0, 'right', this.pageHeight - 400),
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
            name: "LARVOX",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "A SLOW-MOVING LARVA THAT CRAWLS ALONG THE GROUND AT A STEADY PACE.\n"
                + "DON'T LET ITS SIZE FOOL YOU — IT IS STURDIER THAN IT LOOKS.",
            images: [
                this.createImage('larvox', 114.75, 70, 0, 'right', 'bottom'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "VENFLORA",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENFLORA IS A CARNIVOROUS PLANT ROOTED TO THE LAKE FLOOR.\n"
                + "IT SWAYS AND PULSES AS PREY APPROACHES, WAITING FOR THE PERFECT MOMENT TO STRIKE.",
            images: [
                this.createImage('venflora', 98.28571428571429, 150, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "VENARACH",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENARACH CLINGS TO WALLS AND CEILINGS, CREEPING DOWNWARD IN A SWAYING MOTION.\n"
                + "ITS RHYTHMIC MOVEMENT IS ALMOST HYPNOTIC — UNTIL IT LANDS RIGHT ON TOP OF YOU.",
            images: [
                this.createLine(this.pageWidth - 110, -30, 265),
                this.createImage('venarach', 124.25, 150, 0, 'right', this.pageHeight - 400, 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "VENOBLITZ",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENOBLITZ CHARGES ACROSS THE GROUND AT ALARMING SPEED.\n"
                + "BY THE TIME YOU SEE IT, IT IS ALREADY TOO LATE TO GET OUT OF THE WAY.",
            images: [
                this.createImage('venoblitz', 133.5, 100, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "VIREFLY",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VIREFLY DRIFTS THROUGH THE AIR IN A DAZED, ERRATIC PATTERN — AS IF IT CAN'T QUITE DECIDE WHERE IT IS GOING.\n"
                + "ITS UNPREDICTABLE MOVEMENT MAKES IT ONE OF THE TRICKIEST ENEMIES TO DODGE.",
            images: [
                this.createImage('virefly', 100, 120, 0, 'right', 'top'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "TOXWING",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "TOXWING DESCENDS FROM ABOVE IN AN UNPREDICTABLE SIDE-TO-SIDE WEAVE.\n"
                + "ITS ERRATIC PATH MAKES IT HARD TO ANTICIPATE WHERE IT WILL END UP.",
            images: [
                this.createImage('toxwing', 121.5, 100, 0, 'right', 'top'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "WOXIN",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "WOXIN IS A VENOMOUS WASP THAT LOCKS ONTO ITS TARGET AND DIVES IN AT HIGH SPEED.\n"
                + "A SINGLE STING IS ENOUGH TO POISON YOU — AND IT NEVER MISSES TWICE.",
            images: [
                this.createImage('woxin', 79, 85, 0, 'right', 'top', 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "ZABKOUS",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "JUMPING AND LEAPING AROUND IS WHAT THIS FROG NORMALLY DOES...\n"
                + "UNTIL HE SEES A TARGET! HE CAN SPIT POISON OUT OF HIS MOUTH, DRAINING ENERGY RAPIDLY!\n"
                + "VENOMVEIL LAKE IS THE PERFECT HOME FOR ZABKOUS — ITS TOXIC WATERS MATCH HIS POISONOUS NATURE.",
            images: [
                this.createImage('zabkous', 134.0588235294118, 100, 2, 'right', 'bottom', null, 150),
            ],
            mapKey: "map6",
        });

        this.createPage({
            name: "MYCORA",
            type: "RED",
            foundAt: "VENOMVEIL LAKE",
            description:
                "MYCORA IS A TOWERING FUNGAL CREATURE THAT DOMINATES THE LAKE FLOOR.\n"
                + "IT TAKES MORE THAN A SINGLE HIT TO BRING IT DOWN — AND IT DOESN'T MOVE AN INCH.",
            images: [
                this.createImage('mycora', 165.125, 200, 1, 'right', 'bottom', 'red'),
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
            name: "VOLCANO FLY",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THESE HARDY FLIES HAVE EVOLVED HEAT-RESISTANT WINGS THAT ALLOW THEM TO SOAR THROUGH THE SCORCHING SKIES ABOVE THE CRATERS.\n"
                + "THEY ARE RELENTLESS IN THEIR PURSUIT OF ANY INTRUDER WHO ENTERS THEIR TERRITORY.",
            images: [
                this.createImage('volcanoFly', 85.5, 100, 0, 'right', 'top'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "VOLCANO BEETLE",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THESE BEETLES ARE COVERED IN A THICK VOLCANIC SHELL THAT PROTECTS THEM FROM THE INTENSE HEAT.\n"
                + "WHAT THEY LACK IN INTELLIGENCE, THEY MAKE UP FOR IN SHEER SPEED — THEY COME CHARGING FORWARD WITHOUT HESITATION!",
            images: [
                this.createImage('volcanoBeetle', 90.25, 60, 0, 'right', 'bottom'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "BLAZICE",
            type: "FROZEN",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "BLAZICE IS A RARE FROZEN CREATURE ENCASED IN VOLCANIC ROCK, AS IF FIRE AND ICE WERE FORCED TO EXIST IN THE SAME BODY.\n"
                + "DESPITE THE SCORCHING HEAT OF INFERNAL CRATER PEAK, ITS ICY CORE NEVER MELTS.",
            images: [
                this.createImage('blazice', 103, 90, 1, 'right', 'bottom', 'frozen'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "CACTUS",
            type: "STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description: "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.\nTHEY BLEND IN PERFECTLY WITH THE ROCKY VOLCANIC TERRAIN — WATCH WHERE YOU STEP!",
            images: [
                this.createImage('cactus', 115.3, 130, 0, 'right', 'bottom', 'stun'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "VOLCANIC PLANT",
            type: "RED",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THESE ANCIENT PLANTS HAVE ADAPTED TO THE EXTREME HEAT OF THE VOLCANIC SOIL.\n"
                + "THEY BUBBLE WITH SUPERHEATED LIQUID AND LAUNCH VOLATILE BUBBLES THAT EXPLODE ON CONTACT!",
            images: [
                this.createImage('volcanicPlant', 167, 130, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "VOLCANURTLE",
            type: "RED",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "JUST A BIG AND SLOW TURTLE THAT ALWAYS MARCHES FORWARD...\n"
                + "THIS TYPE OF TURTLE WILL BE IN HIBERNATION FOR MOST OF THE YEAR, SO IF YOU CATCH SIGHT OF ONE, CONSIDER YOURSELF QUITE LUCKY!",
            images: [
                this.createImage('volcanurtle', 152.25, 100, 4, 'right', 'bottom', 'red'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "BLOBURN",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "A GLOWING EMBER THAT DRIFTS THROUGH THE VOLCANIC AIR, BLOBURN HOMES IN ON ANY WARM PRESENCE IT DETECTS.\n"
                + "ONCE IT LOCKS ON, IT WILL RELENTLESSLY CHASE ITS TARGET ACROSS THE CRATER!",
            images: [
                this.createImage('bloburn', 52, 50, 0, 'right', 'top'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "VOLCANO WASP",
            type: "STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "IF YOU THOUGHT BEES WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP!\n"
                + "VOLCANO WASPS ARE DEVIOUS MENACES, LOATHING EVERYTHING THAT BREATHES AND STINGING ANY TARGET THEY SPOT!\n"
                + "LITTLE IS KNOWN ABOUT THEM EXCEPT THAT THEY ONCE INHABITED THE LUSH ENVIRONMENT OF VERDANT VINE, BUT SOMETHING FORCED THEM TO MIGRATE TO VOLCANIC AREAS...",
            images: [
                this.createImage('volcanoWasp', 93, 90, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "VOLCANO SCORPION",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THE VOLCANO SCORPION HAS THRIVED IN THE SCORCHING TERRAIN OF INFERNAL CRATER PEAK FOR MILLENNIA.\n"
                + "WHEN THREATENED, IT LAUNCHES TOXIC VENOM FROM ITS TAIL — CONTACT WITH THE VENOM WILL DRAIN YOUR ENERGY RAPIDLY!",
            images: [
                this.createImage('volcanoScorpion', 161, 150, 0, 'right', 'bottom'),
            ],
            mapKey: "map7",
        });

        this.createPage({
            name: "LAVA COBRA",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THE LAVA COBRA LURKS BENEATH THE VOLCANIC SOIL, WAITING FOR THE PERFECT MOMENT TO STRIKE.\n"
                + "WHEN A TARGET APPROACHES, IT RISES FROM THE GROUND AND LAUNCHES SCORCHING LAVA BALLS AT ITS PREY!",
            images: [
                this.createImage('lavaCobra', 176.5, 160, 0, 'right', 'bottom'),
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
            name: "ICE PLANT",
            type: "FROZEN",
            foundAt: "ICEBOUND CAVE",
            description:
                "ROOTED IN THE PERMAFROST, THE ICE PLANT SURVIVES BY ABSORBING AMBIENT COLD ENERGY.\n"
                + "IT LAUNCHES RAZOR-SHARP ICE SHARDS AT ANYTHING THAT PASSES TOO CLOSE — KEEP YOUR DISTANCE!",
            images: [
                this.createImage('icePlant', 78.42857142857143, 115, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "ICE CENTIPEDE",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "THIS ELONGATED CREATURE SCUTTLES ACROSS THE ICY CAVE FLOOR AT REMARKABLE SPEED.\n"
                + "ITS MANY LEGS GIVE IT PERFECT GRIP ON THE SLIPPERY ICE, MAKING IT NEARLY IMPOSSIBLE TO OUTRUN.",
            images: [
                this.createImage('iceCentipede', 126, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "ICE SILKNOIR",
            type: "SLOW",
            foundAt: "ICEBOUND CAVE",
            description:
                "A FROZEN RELATIVE OF THE SILKNOIR, ADAPTED TO THE ICY DEPTHS OF THE CAVE.\n"
                + "IT DESCENDS SILENTLY FROM THE STALACTITES ABOVE, SWAYING GENTLY AS IT WAITS FOR PREY TO PASS BELOW.",
            images: [
                this.createLine(this.pageWidth - 110, 0, 345),
                this.createImage('iceSilknoir', 120, 144, 0, 'right', 270, 'slow'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "FROSTLING",
            type: "SLOW",
            foundAt: "ICEBOUND CAVE",
            description:
                "FROSTLINGS HANG SILENTLY FROM THE CAVE CEILING, BLENDING IN WITH THE ICE.\n"
                + "THEY SUDDENLY BREAK AWAY AND DROP WITHOUT WARNING.\n"
                + "WHAT LOOKS LIKE A SIMPLE ICICLE MAY NOT BE SO PASSIVE AFTER ALL.",
            images: [
                this.createImage('frostling', 46.5, 100, 0, 'right', 'top', 'slow'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "ICE BAT",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "NATIVE TO THE FROZEN CAVERNS OF ICEBOUND CAVE, THE ICE BAT SWOOPS THROUGH THE FRIGID AIR WITH EASE.\n"
                + "ITS WINGS ARE ENCRUSTED WITH FROST THAT NEVER MELTS, EVEN AS IT DIVES TOWARD ITS TARGET.",
            images: [
                this.createImage('iceBat', 156.75, 130, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "CRYSTAL WASP",
            type: "FROZEN",
            foundAt: "ICEBOUND CAVE",
            description:
                "THE CRYSTAL WASP IS A FORMIDABLE PREDATOR OF THE ICE CAVES.\n"
                + "ITS CRYSTALLINE WINGS HUM WITH COLD ENERGY, AND CONTACT WITH IT WILL LEAVE YOU FROZEN IN PLACE!",
            images: [
                this.createImage('crystalWasp', 111.8333333333333, 110, 0, 'right', 'top', 'frozen'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "GLOBBY",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "GLOBBY IS A GELATINOUS CREATURE THAT OOZES THROUGH THE ICE CAVES.\n"
                + "DESPITE ITS SLOW APPEARANCE, IT CAN MOVE SURPRISINGLY FAST WHEN IT SPOTS A TARGET!",
            images: [
                this.createImage('globby', 115, 110, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({
            name: "DRILL ICE",
            type: "SLOW",
            foundAt: "ICEBOUND CAVE",
            description:
                "DRILL ICE BURROWS BENEATH THE FROZEN GROUND, WAITING FOR THE RIGHT MOMENT TO SPIRAL UPWARD AND IMPALE ANYTHING ABOVE.\n"
                + "CONTACT WITH IT WILL SLOW YOU DOWN — IT LEAVES ICE CRYSTALS EMBEDDED IN YOUR PATH!",
            images: [
                this.createImage('drillice', 197, 115, 0, 'right', 'bottom', 'slow'),
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
            name: "CRYPTIC SLIME",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "CRYPTIC SLIMES APPEAR FROM ABOVE, FALLING FROM THE FISSURE CEILINGS BEFORE QUICKLY SCUTTLING TOWARD ANY PREY THEY DETECT ON THE GROUND.\n"
                + "THEIR ORIGIN IS UNKNOWN — THEY SEEM TO MATERIALISE OUT OF THIN AIR.",
            images: [
                this.createImage('crypticSlime', 124, 50, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "PETROPLANT",
            type: "FROZEN",
            foundAt: "CRIMSON FISSURE",
            description:
                "PETROPLANTS GROW IN MINERAL-RICH VOLCANIC SOIL, FUELED BY THE EARTH RATHER THAN SUNLIGHT.\n"
                + "THEY CAN THROW DANGEROUS ROCKS FROM THEIR MOUTHS WHEN THEY FEEL THREATENED.",
            images: [
                this.createImage('petroPlant', 91.5555555, 100, 0, 'right', 'bottom', 'frozen'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "CRYPTIC SPIDER",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "THE CRYPTIC SPIDER SKITTERS THROUGH THE CRIMSON FISSURE AT SURPRISING SPEED.\n"
                + "IT WEAVES BETWEEN THE ROCKS AND RUBBLE WITH EASE, MAKING IT DIFFICULT TO AVOID IN THE NARROW PASSAGES.",
            images: [
                this.createImage('crypticSpider', 98.66666666666667, 70, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "CRYPTIC FLY",
            type: "RED",
            foundAt: "CRIMSON FISSURE",
            description:
                "THIS EERIE FLY DRIFTS THROUGH THE FISSURE WITH AN OTHERWORLDLY GLOW.\n"
                + "CONTACT WITH IT IS PARTICULARLY DANGEROUS — ITS CRIMSON AURA WILL LEAVE A BURNING MARK!",
            images: [
                this.createImage('crypticFly', 128, 100, 0, 'right', 'top', 'red'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "CRYPTIC GECKO",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "THE CRYPTIC GECKO LURKS IN THE SHADOWS OF THE FISSURE, WAITING PATIENTLY BEFORE LAUNCHING ITSELF AT ITS TARGET.\n"
                + "WHEN IT SPOTS PREY, IT LEAPS THROUGH THE AIR IN A POWERFUL ARC — THERE IS LITTLE TIME TO REACT!",
            images: [
                this.createImage('crypticGecko', 124.5, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "SIGILASH",
            type: "STUN",
            foundAt: "CRIMSON FISSURE",
            description:
                "SIGILASH IS A LIGHT-WEIGHT FLY THAT PLUMMETS FROM THE SKY AT HIGH SPEED.\n"
                + "IT DIVES DIAGONALLY WITH NO WARNING. BE CAREFUL AS GETTING CAUGHT UNDERNEATH IT WILL LEAVE YOU STUNNED!",
            images: [
                this.createImage('sigilash', 99, 100, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "CRYPTIC ROCKY",
            type: "RED",
            foundAt: "CRIMSON FISSURE",
            description:
                "CRYPTIC ROCKY IS A DENSE, CRYSTALLIZED ROCK FORMATION THAT HAS SOMEHOW GAINED THE ABILITY TO MOVE.\n"
                + "IT ZIGZAGS ERRATICALLY THROUGH THE TERRAIN — CONTACT WITH IT IS PARTICULARLY PAINFUL!",
            images: [
                this.createImage('crypticRocky', 152, 140, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "ONE EYE SNAKE",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "A MASSIVE SERPENT WITH A SINGLE GLOWING EYE THAT PIERCES THROUGH THE CRIMSON HAZE.\n"
                + "IT MOVES SWIFTLY ACROSS THE FISSURE FLOOR — ITS ENORMOUS SIZE MAKES IT VERY HARD TO AVOID!",
            images: [
                this.createImage('oneEyeSnake', 217, 100, 0, 'right', 'bottom', null, 0, 0.9),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({
            name: "DRAGON",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "IF THERE IS A CREATURE THAT EVERY BEING FEARS IN THE CRIMSON FISSURE, IT'S THE DRAGON!\n"
                + "ITS IMPOSING WINGS HAVE THE POWER TO WHIP UP FEROCIOUS TORNADOES, RAGING ACROSS THE LAND.\nIT IS BELIEVED THAT THOUSANDS OF YEARS AGO, THE DRAGON'S ROAR CAUSED "
                + "THE VOLCANOES IN THE AREA TO ERUPT DUE TO THE INTENSITY OF THE FREQUENCY VIBRATIONS!",
            images: [
                this.createImage('dragon', 182, 172, 0, 'right', 'top'),
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
            name: "GALACTIC PLANT",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "ROOTED TO THE RIFT FLOOR, THE GALACTIC PLANT STANDS COMPLETELY STILL — UNTIL SOMETHING GETS TOO CLOSE.\n"
                + "WHAT IT LACKS IN MOBILITY, IT MORE THAN MAKES UP FOR IN PATIENCE.",
            images: [
                this.createImage('galacticPlant', 95.75, 150, 1, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "VEYNOCULUS",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "RUMOURS HAVE SPREAD ACROSS THE LAND OF THIS INFAMOUS SMALL CREATURE.\n"
                + "IT IS BELIEVED THAT BEFORE A CATACLYSMIC EVENT, VEYNOCULUS LIVED INSIDE ACTIVE VOLCANOS AND FED OFF MICRO-ORGANISMS AROUND THE CRATERS.\n"
                + "NOW DISPLACED, IT DRIFTS THROUGH THE COSMIC RIFT, DRAWN TO ITS STRANGE ENERGY.",
            images: [
                this.createImage('veynoculus', 78.6, 50, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "PLAZER",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "THIS ODD-LOOKING PLANT CANNOT HELP ITSELF BUT SHOOT A LASER OUT OF ITS EYE WHEN IT BLINKS!\n"
                + "BE CAREFUL NOT TO GET CAUGHT BY THE LASER RAYS!",
            images: [
                this.createImage('plazer', 61.33333333333333, 90, 2, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "JOHNNY",
            type: "STUN",
            foundAt: "COSMIC RIFT",
            description:
                "JOHNNY IS A RELENTLESS PURSUER.\n"
                + "ONCE IT LOCKS EYES ON A TARGET, IT WILL CHASE IT ACROSS THE ENTIRE RIFT WITHOUT HESITATION — AND IT IS FAST!",
            images: [
                this.createImage('johnny', 98, 80, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "SPACE CRAB",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "SPACE CRABS DESCEND FROM THE UPPER REACHES OF THE COSMIC RIFT, DROPPING DOWN AT TERRIFYING SPEED.\n"
                + "THEIR ARMORED SHELLS PROTECT THEM AS THEY PLUMMET TOWARD ANYTHING BELOW.",
            images: [
                this.createImage('spaceCrab', 125.6666666666667, 130, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "SPINDLE",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "SPINDLE IS A SPINDLY CREATURE THAT MOVES AT ALARMING SPEED ACROSS THE RIFT FLOOR.\n"
                + "IT SKITTERS FORWARD IN ERRATIC BURSTS, MAKING IT EXTREMELY HARD TO PREDICT OR AVOID!",
            images: [
                this.createImage('spindle', 99.69230769230769, 90, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "LANCER",
            type: "STUN",
            foundAt: "COSMIC RIFT",
            description:
                "LANCER IS ONE OF THE FASTEST THREATS IN THE RIFT, ROCKETING THROUGH THE WATERS AT BLISTERING SPEED.\n"
                + "ITS STUNNING IMPACT LEAVES YOU MOMENTARILY HELPLESS — BLINK AND YOU WILL MISS IT.",
            images: [
                this.createImage('lancer', 181.25, 70, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "GALACTIC FROG",
            type: "RED",
            foundAt: "COSMIC RIFT",
            description:
                "THE GALACTIC FROG WAITS ON THE RIFT FLOOR UNTIL IT SPOTS ITS TARGET — THEN IT LEAPS.\n"
                + "IT JUMPS IN A PRECISE ARC TOWARD WHEREVER YOU ARE, AND WILL KEEP JUMPING UNTIL IT IS STOPPED.",
            images: [
                this.createImage('galacticFrog', 96.5, 100, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "VESPION",
            type: "SLOW",
            foundAt: "COSMIC RIFT",
            description:
                "VESPION CUTS THROUGH THE RIFT IN A SHARP, RELENTLESS ZIGZAG — UP AND DOWN, UP AND DOWN.\n"
                + "ITS ERRATIC FLIGHT PATH MAKES IT NEARLY IMPOSSIBLE TO DODGE WITHOUT CAREFUL TIMING.",
            images: [
                this.createImage('vespion', 117, 100, 0, 'right', 'top', 'slow'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "OCULITH",
            type: "POISON",
            foundAt: "COSMIC RIFT",
            description:
                "OCULITH LURKS BENEATH THE RIFT FLOOR, WAITING IN SILENCE.\n"
                + "WHEN IT SENSES A PRESENCE ABOVE, IT BURSTS UPWARD AND KEEPS RISING — NEVER RETREATING, NEVER STOPPING.",
            images: [
                this.createImage('oculith', 93, 80, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "GALACTIC SPIDER",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "THE GALACTIC SPIDER CRAWLS ACROSS THE RIFT FLOOR WITH UNSETTLING CONFIDENCE.\n"
                + "IT TAKES MORE THAN ONE HIT TO BRING DOWN, AND IT FIRES GLOWING ORBS FROM ITS CRYSTAL EYE WITHOUT WARNING.",
            images: [
                this.createImage('galacticSpider', 160.5, 120, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({
            name: "BORION",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "BORION IS A COLOSSAL BEAST THAT HIDES JUST BELOW THE SURFACE OF THE RIFT.\n"
                + "WHEN TRIGGERED, IT ERUPTS FROM THE GROUND AND HOLDS ITS GROUND, BLOCKING EVERYTHING IN ITS PATH.",
            images: [
                this.createImage('borion', 228, 150, 0, 'right', 'bottom', null, 0, 0.9),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    update() {
        this.game.audioHandler.menu.stopSound('criminalitySoundtrack');
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

    createImage(enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, type, srcY = 0, size = 1) {
        const renderedWidth = frameWidth * size;
        const renderedHeight = frameHeight * size;

        let resolvedX = enemyX;
        if (enemyX === 'right') resolvedX = this.pageWidth - 110 - renderedWidth / 2;

        let resolvedY = enemyY;
        if (enemyY === 'top') resolvedY = 90 - renderedHeight / 2;
        else if (enemyY === 'bottom') resolvedY = this.pageHeight - renderedHeight - 30;

        return {
            enemyImage: document.getElementById(enemyImage),
            frameWidth,
            frameHeight,
            enemyFrame,
            enemyX: resolvedX,
            enemyY: resolvedY,
            size,
            type, // 'red' or 'stun' or 'poison' or 'slow' or null
            srcY,
        };
    }

    createLine(x, y, length, lineWidth = 2) {
        return { kind: 'line', lineX: x, lineY: y, lineLength: length, lineWidth };
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

                if (image.kind === 'line') {
                    context.save();
                    context.strokeStyle = 'black';
                    context.lineWidth = image.lineWidth;
                    context.beginPath();
                    context.moveTo(x + image.lineX, y + image.lineY);
                    context.lineTo(x + image.lineX, y + image.lineY + image.lineLength);
                    context.stroke();
                    context.restore();
                    return;
                }

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
                } else if (image.type === 'frozen') {
                    context.shadowColor = 'cyan';
                    context.shadowBlur = 20;
                }

                context.drawImage(
                    image.enemyImage,
                    frameX, image.srcY ?? 0,
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

        this.game.audioHandler.menu.stopSound('criminalitySoundtrack');

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
