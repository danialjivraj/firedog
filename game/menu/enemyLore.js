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

        this.mapColors = {
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
        };

        this.typeColors = {
            "RED": { fill: 'red', stroke: 'black', strokeBlur: 1 },
            "STUN": { fill: 'yellow', stroke: 'black', strokeBlur: 1 },
            "POISON": { fill: '#a8ffb0', stroke: '#1a5e20', strokeBlur: 4 },
            "SLOW": { fill: '#c5d8ff', stroke: '#1a2a6e', strokeBlur: 4 },
            "FROZEN": { fill: '#dff4ff', stroke: '#2a7aaa', strokeBlur: 4 },
        };

        this.phraseColors = { ...this.mapColors, ...this.typeColors };
        this.highlightPhrases = this.buildHighlightTokens(this.mapColors);
        this.typeHighlightPhrases = this.buildHighlightTokens(this.typeColors);

        // MAP 1 - Lunar Glade
        this.createCoverPage({ //1
            mapKey: 'map1',
            coverTitle: 'LUNAR GLADE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map1Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //2
            name: "GOBLITO",
            type: "NORMAL",
            foundAt: "EVERYWHERE",
            description:
                "THE GOBLITO SPECIES, ONCE NON-THREATENING, PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
                + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
                + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.",
            images: [
                this.createImage('goblinSteal', 60.083, 80, 3, 'right', 'bottom'),
            ],
            mapKey: "map1",
        });

        this.createPage({ //3
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

        this.createPage({ //4
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

        this.createPage({ //5
            name: "RAVENGLOOM",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "LITTLE IS KNOWN ABOUT THE RAVENGLOOM, A SHADOWY BIRD THAT DRIFTS SILENTLY BETWEEN THE TREES.\n"
                + "LOCALS BELIEVE THAT WHEREVER IT FLIES, THE LIGHT DIMS JUST A LITTLE BIT BEHIND IT.",
            images: [
                this.createImage('ravengloom', 139.66, 100, 0, 'right', 'top'),
            ],
            mapKey: "map1",
        });

        this.createPage({ //6
            name: "MEAT SOLDIER",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT THE LAND.\n"
                + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
                + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.",
            images: [
                this.createImage('meatSoldier', 67.625, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "map1",
        });

        this.createPage({ //7
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

        this.createPage({ //8
            name: "SKULNAP",
            type: "STUN",
            foundAt: "LUNAR GLADE",
            description:
                "SKULNAP APPEARED WITHOUT WARNING OR EXPLANATION.\n"
                + "SOME BELIEVE IT WAS THE RESULT OF AN EXPERIMENT CONDUCTED IN A DISTANT LAND, THOUGH NO ONE HAS EVER COME FORWARD TO CLAIM RESPONSIBILITY.\n"
                + "IT CAN BE FOUND SLEEPING ON THE GROUND, PERFECTLY STILL. BUT THE MOMENT YOU STRAY TOO CLOSE, IT STIRS. AND IT IS NOT HAPPY ABOUT BEING WOKEN.",
            images: [
                this.createImage('skulnap', 57, 57, 0, 'right', 'bottom', 'stun'),
            ],
            mapKey: "map1",
        });

        this.createPage({ //9
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

        this.createPage({ //10
            name: "GLIDOSPIKE",
            type: "NORMAL",
            foundAt: "LUNAR GLADE",
            description:
                "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
                + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
                + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDOSPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!",
            images: [
                this.createImage('glidoSpike', 191.68, 130, 0, 'right', 'top'),
            ],
            mapKey: "map1",
            projectile: 'normal',
        });

        // MAP 2 - Nightfall Phantom Graves
        this.createCoverPage({ //11
            mapKey: 'map2',
            coverTitle: 'NIGHTFALL PHANTOM GRAVES',
            category: 'main',
            coverImages: [
                this.createCoverImage('map2Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //12
            name: "VERTIBAT",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "VERTIBATS ARE KNOWN FOR HIDING ON TOP OF TREES AS THEY WAIT FOR MOVEMENT BELOW.\n"
                + "IT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCIES, WHICH DRAWS THEM TO THIS HAUNTED LAND.\n"
                + "AS SOON AS THEY DETECT MOVEMENT, THEY FALL ONTO THEIR TARGET.",
            images: [
                this.createImage('vertibat', 132.3333333333333, 70, 0, 'right', 'top'),
            ],
            mapKey: "map2",
        });

        this.createPage({ //13
            name: "DUSK PLANT",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "DORMANT BY DAY, DUSK PLANTS STIR TO LIFE AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH OF UNSUSPECTED PREY.\n"
                + "ANCIENT TALES CLAIM THEY WERE ONCE ORDINARY FLOWERS THAT ABSORBED SO MUCH DARKNESS OVER THE CENTURIES THAT THEY LOST THEIR COLOR ENTIRELY.",
            images: [
                this.createImage('duskPlant', 60, 87, 0, 'right', 'bottom'),
            ],
            mapKey: "map2",
            projectile: 'normal',
        });

        this.createPage({ //14
            name: "SILKNOIR",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "IT IS BELIEVED THAT SILKNOIRS' PITCH-BLACK APPEARANCE CAME FROM DECADES OF FEEDING ON SHADOW-BORN CREATURES, SLOWLY ABSORBING THEIR DARKNESS UNTIL NO LIGHT REMAINED IN THEM.\n"
                + "THEY DESCEND FROM THE TALLEST TREES AT NIGHT, HUNTING ANYTHING THAT STIRS BELOW.",
            images: [
                this.createLine(this.pageWidth - 110, 0, 345),
                this.createImage('silknoir', 120, 144, 0, 'right', 270),
            ],
            mapKey: "map2",
        });

        this.createPage({ //15
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

        this.createPage({ //16
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

        this.createPage({ //17
            name: "GLOOMLET",
            type: "RED",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "GLOOMLETS WANDER THE DEPTHS OF THE CEMETERY WITH NO CLEAR PURPOSE, DRIFTING PAST GRAVESTONES AND THROUGH HOLLOW TREES.\n"
                + "THE ONLY THING KNOWN FOR CERTAIN IS THAT EVERY CREATURE IN THE AREA GOES QUIET WHEN ONE PASSES BY.",
            images: [
                this.createImage('gloomlet', 78, 74, 0, 'right', 'top', 'red'),
            ],
            mapKey: "map2",
        });

        this.createPage({ //18
            name: "DOLLY",
            type: "NORMAL",
            foundAt: "NIGHTFALL PHANTOM GRAVES",
            description:
                "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
                + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.",
            images: [
                this.createImage('dolly', 88.2, 120, 0, 'right', 'top'),
            ],
            mapKey: "map2",
            projectile: 'stun',
        });

        this.createPage({ //19
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
        this.createCoverPage({ //20
            mapKey: 'map3',
            coverTitle: 'CORAL ABYSS',
            category: 'main',
            coverImages: [
                this.createCoverImage('map3Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //21
            name: "RAZORFIN",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "ONE OF THE MOST COMMON FISH AROUND HERE, AND YET SOMEHOW STILL UNDERESTIMATED.\n"
                + "RAZORFINS ARE QUICK, NIPPY, AND HAVE TEETH SHARP ENOUGH TO PROVE A POINT!",
            images: [
                this.createImage('razorfin', 100, 70, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        this.createPage({ //22
            name: "SKELETON FISH",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "LEGENDS SAY THAT SKELETON FISH WERE ONCE ORDINARY DEEP-SEA CREATURES THAT VENTURED TOO CLOSE TO AN ANCIENT CURSED CURRENT.\n"
                + "THE CURRENT STRIPPED THEM OF THEIR FLESH AND SIGHT, LEAVING ONLY BONE BEHIND.\n"
                + "YET SOMEHOW, THEY STILL SWIM AND STILL HUNT, SENSING EVERY MOVEMENT WITH SOMETHING FAR OLDER THAN EYES.",
            images: [
                this.createImage('skeletonFish', 55, 39, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        this.createPage({ //23
            name: "SPEAR FISH",
            type: "RED",
            foundAt: "CORAL ABYSS",
            description:
                "ONCE A WARRIOR OF A LOST UNDERWATER KINGDOM, THIS FISH MASTERED ITS SKILLS IN ANCIENT DUELS.\n"
                + "NOW IT WIELDS ITS SPEAR WITH PRECISION, CHARGING ANY WHO ENTER ITS DOMAIN.", images: [
                    this.createImage('spearFish', 91.875, 110, 0, 'right', 'bottom', 'red'),
                ],
            mapKey: "map3",
        });

        this.createPage({ //24
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

        this.createPage({ //25
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

        this.createPage({ //26
            name: "JELLION",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "DRIFTING THROUGH THE DEPTHS IN LONG, HYPNOTIC WAVES, JELLION IS A CREATURE OF PURE RHYTHM.\n"
                + "DON'T BE FOOLED BY ITS GRACEFUL MOVEMENT. ITS UNDULATING PATH MAKES IT SURPRISINGLY HARD TO AVOID!",
            images: [
                this.createImage('jellion', 98.5, 120, 0, 'right', 'top'),
            ],
            mapKey: "map3",
        });

        this.createPage({ //27
            name: "VOLTZEEL",
            type: "STUN",
            foundAt: "CORAL ABYSS",
            description:
                "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
                + "IT IS RUMORED THAT ITS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.",
            images: [
                this.createImage('voltzeel', 81, 100, 4, 'right', 'top', 'stun')
            ],
            mapKey: "map3",
        });

        this.createPage({ //28
            name: "GARRY",
            type: "NORMAL",
            foundAt: "CORAL ABYSS",
            description:
                "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
                + "TAKES A WHILE TO FADE AWAY!",
            images: [
                this.createImage('paint_splatter_8', 1994, 995, 0, -130, 175, null, 0, 0.5),
                this.createImage('garry', 165, 122, 0, 'right', 'bottom'),
            ],
            mapKey: "map3",
            projectile: 'normal',
        });

        // MAP 4 - Verdant Vine
        this.createCoverPage({ //29
            mapKey: 'map4',
            coverTitle: 'VERDANT VINE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map4Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //30
            name: "BIG GREENER",
            type: "POISON",
            foundAt: "VERDANT VINE",
            description:
                "THE OXYGEN LEVELS HERE ARE TWICE AS HIGH AS ANYWHERE ELSE, AND BIG GREENERS ARE LIVING PROOF.\n"
                + "CENTURIES OF THRIVING IN ALL THAT ABUNDANT AIR GAVE THEM THEIR ENORMOUS SIZE.",
            images: [
                this.createImage('bigGreener', 113, 150, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "map4",
            projectile: 'normal',
        });

        this.createPage({ //31
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

        this.createPage({ //32
            name: "FOFINHA",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "FOFINHA BELONGS TO THE SAME SPECIES AS CHIQUITA, BUT WITH A FAR MORE FIERY TEMPER.\n"
                + "HIS FLIGHTS ARE QUICKER AND LESS GRACEFUL, OFTEN DARTING THROUGH THE SKY WITH SUDDEN BURSTS OF SPEED.\n"
                + "HE MAY LOOK JUST AS CHARMING, BUT GET TOO CLOSE AND YOU'LL SEE HE’S NOT AS GENTLE AS HIS COUNTERPART!",
            images: [
                this.createImage('fofinha', 118.823529411764, 85, 0, 'right', 'top'),
            ],
            mapKey: "map4",
        });

        this.createPage({ //33
            name: "SLUGGIE",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW THAT "
                + "IF YOU STEP TOO CLOSE TO HIM!",
            images: [
                this.createImage('paint_splatter_4', 1994, 995, 0, -170, 30, null, 0, 0.9),
                this.createImage('sluggie', 147.33, 110, 0, 'right', 'bottom'),
            ],
            mapKey: "map4",
        });

        this.createPage({ //34
            name: "LIL HORNET",
            type: "STUN",
            foundAt: "VERDANT VINE",
            description:
                "DON'T LET THE NAME FOOL YOU.\n"
                + "THE LIL HORNET CARRIES ONE OF THE MOST FEARED HORNS AROUND, SAID TO HAVE EVOLVED OVER THOUSANDS OF YEARS AS A RESPONSE TO MUCH LARGER PREDATORS.\n"
                + "IT NOW WEARS THAT HORN WITH IMMENSE PRIDE. EVEN THE BIGGEST CREATURES KEEP THEIR DISTANCE.",
            images: [
                this.createImage('lilHornet', 56, 47, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map4",
        });

        this.createPage({ //35
            name: "JERRY",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "JERRY IS A MYSTERIOUS AIRBORNE FIGURE WHO DRIFTS LAZILY ABOVE THE TREETOPS.\n"
                + "HE HAS A LONG-STANDING REPUTATION FOR DROPPING UNWELCOME SURPRISES ON ANYONE WHO PASSES BELOW.\n"
                + "WHERE HE CAME FROM AND WHY HE DOES IT REMAINS A COMPLETE MYSTERY.",
            images: [
                this.createImage('jerry', 185, 103, 4, 'right', 'top'),
            ],
            mapKey: "map4",
            projectile: 'stun',
        });

        this.createPage({ //36
            name: "BRAMBLE",
            type: "NORMAL",
            foundAt: "VERDANT VINE",
            description:
                "BRAMBLE IS A LARGE SPIDER FOUND DEEP WITHIN THE DENSE, OVERGROWN PARTS OF THE FOREST.\n"
                + "IT IS BELIEVED THAT GENERATIONS OF FEEDING ON THE ANCIENT TREES CAUSED ITS SKIN TO GRADUALLY HARDEN INTO WOOD, MAKING IT AS MUCH PLANT AS CREATURE.",
            images: [
                this.createLine(this.pageWidth - 110, -30, 200),
                this.createImage('bramble', 174.2, 140, 0, 'right', this.pageHeight - 450),
            ],
            mapKey: "map4",
            projectile: 'normal',
        });

        this.createPage({ //37
            name: "KARATE CROCO",
            type: "RED",
            foundAt: "VERDANT VINE",
            description:
                "ONCE FROM CORAL ABYSS, THIS CROCODILE WAS SWEPT TO VERDANT VINE BY A GREAT TSUNAMI.\n" +
                "CROCO, IN A NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
                + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!",
            images: [
                this.createImage('karateCroco', 98.25, 140, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "map4",
        });

        this.createPage({ //38
            name: "VINELASH",
            type: "POISON",
            foundAt: "VERDANT VINE",
            description:
                "VINELASH SLEEPS BENEATH THE SOIL, PATIENT AND STILL.\n"
                + "IT IS BELIEVED TO BE AN ANCIENT MASS OF VINES AND WOOD THAT GREW TOGETHER OVER CENTURIES UNTIL IT DEVELOPED A WILL OF ITS OWN.\n"
                + "WHEN SOMETHING WANDERS CLOSE ENOUGH, IT ERUPTS FROM THE GROUND IN A SUDDEN AND VIOLENT BURST.",
            images: [
                this.createImage('vinelash', 221, 200, 0, 'right', 'bottom', 'poison', 0, 0.9),
            ],
            mapKey: "map4",
        });

        // MAP 5 - Springly Lemony
        this.createCoverPage({ //39
            mapKey: 'map5',
            coverTitle: 'SPRINGLY LEMONY',
            category: 'main',
            coverImages: [
                this.createCoverImage('map5Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //40
            name: "SNAILEY",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "SLOW AS IT MAY BE, SNAILEY HAS OUTLASTED COUNTLESS FASTER CREATURES BY SIMPLY NEVER STOPPING.\n"
                + "IF YOU SEE ONE, IT HAS PROBABLY BEEN WATCHING YOU FAR LONGER THAN YOU THINK.",
            images: [
                this.createImage('snailey', 103, 74, 0, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        this.createPage({ //41
            name: "CITRIFLY",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "NOBODY KNOWS HOW A FLY ENDS UP LOOKING EXACTLY LIKE A LEMON.\n"
                + "THE CITRIFLY CERTAINLY DOESN'T. IT JUST FLIES AROUND, COMPLETELY UNBOTHERED.",
            images: [
                this.createImage('citrifly', 80.5, 90, 0, 'right', 'top'),
            ],
            mapKey: "map5",
            projectile: 'normal',
        });

        this.createPage({ //42
            name: "BERRIFLY",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "IT IS SAID THAT BERRIFLIES WERE ONCE ORDINARY FLIES.\n"
                + "CENTURIES OF NESTING DEEP INSIDE BLUEBERRY BUSHES AND FEEDING ON NOTHING BUT THE FRUIT EVENTUALLY CHANGED THEM FOREVER.\n"
                + "NOW THEY ARE PRACTICALLY INDISTINGUISHABLE FROM THE BERRIES THEMSELVES.",
            images: [
                this.createImage('berrifly', 84, 75, 0, 'right', 'top'),
            ],
            mapKey: "map5",
            projectile: 'slow',
        });

        this.createPage({ //43
            name: "LAZY MOSQUITO",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description: "JUST A LAZY MOSQUITO...",
            images: [
                this.createImage('lazyMosquito', 67.23076923076923, 50, 0, 'right', 'top'),
            ],
            mapKey: "map5",
        });

        this.createPage({ //44
            name: "LEAF SLUG",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
                + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDINGS. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET THEY FINDS AHEAD!\n",
            images: [
                this.createImage('leafSlug', 89, 84, 0, 'right', 'bottom'),
            ],
            mapKey: "map5",
        });

        this.createPage({ //45
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
            projectile: 'normal',
        });

        this.createPage({ //46
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

        this.createPage({ //47
            name: "BEE",
            type: "STUN",
            foundAt: "SPRINGLY LEMONY",
            description:
                "IN THIS AREA RESIDES THOUSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
                + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!",
            images: [
                this.createImage('bee', 55.23, 57, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map5",
        });

        this.createPage({ //48
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

        this.createPage({ //49
            name: "STRAWSPIDER",
            type: "NORMAL",
            foundAt: "SPRINGLY LEMONY",
            description:
                "THE STRAWSPIDER IS THOUGHT TO HAVE SPENT SO MANY GENERATIONS HIDING AMONG STRAWBERRY PATCHES THAT ITS BODY EVENTUALLY MIRRORED ITS SURROUNDINGS.\n"
                + "IT SITS PERFECTLY STILL AMONG THE FRUIT, WAITING WITH A PATIENCE THAT FEELS ALMOST PERSONAL.\n"
                + "MOST ONLY NOTICE IT WHEN IT IS ALREADY TOO LATE.",
            images: [
                this.createLine(this.pageWidth - 110, -30, 265),
                this.createImage('strawspider', 93.83333333333333, 110, 0, 'right', this.pageHeight - 400),
            ],
            mapKey: "map5",
        });

        // MAP 6 - Venomveil Lake
        this.createCoverPage({ //50
            mapKey: 'map6',
            coverTitle: 'VENOMVEIL LAKE',
            category: 'main',
            coverImages: [
                this.createCoverImage('map6Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });


        this.createPage({ //51
            name: "LARVOX",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "LARVOX MOVES ACROSS THE GROUND AT A SLOW, DELIBERATE PACE, DECEPTIVELY STURDY FOR ITS SIZE.\n"
                + "IT IS BELIEVED TO BE IN A PERMANENT STATE OF METAMORPHOSIS, NEVER QUITE BECOMING WHATEVER IT IS SUPPOSED TO BE.\n"
                + "TRAVELERS HAVE WATCHED IT FOR YEARS AND ARE NO CLOSER TO AN ANSWER.",
            images: [
                this.createImage('larvox', 114.75, 70, 0, 'right', 'bottom'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //52
            name: "VENFLORA",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENFLORA IS A CARNIVOROUS PLANT ROOTED DEEP IN THE TOXIC SOIL.\n"
                + "THOSE WHO HAVE STUDIED IT FROM A SAFE DISTANCE BELIEVE IT IS ONE OF THE OLDEST KNOWN PLANT SPECIES IN THE REGION.",
            images: [
                this.createImage('venflora', 98.28571428571429, 150, 0, 'right', 'bottom'),
            ],
            mapKey: "map6",
            projectile: 'red',
        });

        this.createPage({ //53
            name: "VENARACH",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENARACH MAKES ITS HOME IN THE DEAD TREES OF THE LAKE, BLENDING INTO THE ROTTING BARK AS IF IT WERE PART OF THE WOOD ITSELF.\n"
                + "IT DESCENDS SLOWLY ON A THREAD OF SILK, SWAYING WITH THE STILLNESS OF SOMETHING THAT HAS NEVER NEEDED TO RUSH.\n"
                + "THOSE WHO HAVE FELT ITS VENOM DESCRIBE A SLOW, CREEPING SENSATION, MUCH LIKE THE WAY IT HUNTS.",
            images: [
                this.createLine(this.pageWidth - 110, -30, 265),
                this.createImage('venarach', 124.25, 150, 0, 'right', this.pageHeight - 400, 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //54
            name: "VENOBLITZ",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "VENOBLITZ IS SAID TO BE THE FASTEST CREATURE IN THE AREA.\n"
                + "IT IS BELIEVED THAT IT DEVELOPED ITS EXTREME SPEED AS AN EVOLUTIONARY RESPONSE TO THE TOXIC GROUND THAT LINES THE LAKE.\n"
                + "THE LESS TIME SPENT TOUCHING THE SURFACE, THE LESS VENOM ABSORBED, AND SO VENOBLITZ SIMPLY NEVER SLOWS DOWN.",
            images: [
                this.createImage('venoblitz', 133.5, 100, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //55
            name: "VIREFLY",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "THE VIREFLY HAS SPENT ITS ENTIRE LIFE FEEDING ON TOXIC FUMES THAT RISE FROM THE LAKE SURFACE.\n"
                + "THE CONSTANT EXPOSURE TO POISON HAS LEFT IT IN A PERMANENT STATE OF DIZZINESS, CAUSING IT TO DRIFT THROUGH THE AIR IN AN ERRATIC, SWAYING PATH.\n"
                + "THOSE WHO ENCOUNTER IT OFTEN FIND ITS UNPREDICTABLE MOVEMENT FAR HARDER TO AVOID THAN ANYTHING MORE DELIBERATE.",
            images: [
                this.createImage('virefly', 100, 120, 0, 'right', 'top'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //56
            name: "TOXWING",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "TOXWING DESCENDS FROM ABOVE IN AN UNPREDICTABLE SIDE-TO-SIDE WEAVE.\n"
                + "ITS ERRATIC PATH MAKES IT HARD TO ANTICIPATE WHERE IT WILL END UP.",
            images: [
                this.createImage('toxwing', 127, 105, 0, 'right', 'top'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //57
            name: "WOXIN",
            type: "POISON",
            foundAt: "VENOMVEIL LAKE",
            description:
                "WOXIN IS A VENOMOUS WASP THAT LOCKS ONTO ITS TARGET AND DIVES IN AT HIGH SPEED.\n"
                + "A SINGLE STING IS ENOUGH TO POISON YOU, AND IT RARELY MISSES.",
            images: [
                this.createImage('woxin', 79, 85, 0, 'right', 'top', 'poison'),
            ],
            mapKey: "map6",
        });

        this.createPage({ //58
            name: "ZABKOUS",
            type: "NORMAL",
            foundAt: "VENOMVEIL LAKE",
            description:
                "LEGENDS SAY ZABKOUS HAS BATHED IN THE POISONED WATERS FOR SO LONG THAT ITS VERY SALIVA BECAME VENOMOUS, CAPABLE OF DRAINING THE STRENGTH OF ANYTHING IT HITS.\n",
            images: [
                this.createImage('zabkous', 134.0588235294118, 100, 2, 'right', 'bottom', null, 150),
            ],
            mapKey: "map6",
            projectile: 'poison',
        });

        this.createPage({ //59
            name: "MYCORA",
            type: "RED",
            foundAt: "VENOMVEIL LAKE",
            description:
                "MOST FUNGI IN THE AREA HAVE TURNED GREEN FROM ABSORBING THE TOXIC POISON AROUND THEM.\n"
                + "MYCORA IS DIFFERENT. CENTURIES OF EXPOSURE MUTATED IT INTO SOMETHING LARGER AND STRANGER THAN ANY MUSHROOM HAS A RIGHT TO BE, TURNING IT A DEEP, UNNATURAL SHADE OF PURPLE.\n"
                + "WHY MYCORA TURNED OUT SO DIFFERENTLY FROM EVERY OTHER MUSHROOM IN THE AREA REMAINS A MYSTERY TO THIS DAY.",
            images: [
                this.createImage('mycora', 165.125, 200, 1, 'right', 'bottom', 'red'),
            ],
            mapKey: "map6",
            projectile: 'poison',
        });

        // MAP 7 - Infernal Crater Peak
        this.createCoverPage({ //60
            mapKey: 'map7',
            coverTitle: 'INFERNAL CRATER PEAK',
            category: 'main',
            coverImages: [
                this.createCoverImage('map7Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //61
            name: "EMBER FLY",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THE EMBER FLY HAS ADAPTED TO THE VOLCANIC HEAT LIKE NO OTHER CREATURE.\n"
                + "ITS WINGS ARE LINED WITH A HEAT-RESISTANT COATING THAT LETS IT SOAR THROUGH THE SMOKE WITH EASE.\n"
                + "IT DRIFTS THROUGH THE SCORCHING AIR ABOVE THE CRATERS, INDIFFERENT TO THE WORLD BELOW.",
            images: [
                this.createImage('emberFly', 85.5, 100, 0, 'right', 'top'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //62
            name: "SCORBLE",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THESE BEETLES ARE COVERED IN A THICK VOLCANIC SHELL THAT PROTECTS THEM FROM THE INTENSE HEAT.\n"
                + "WHAT THEY LACK IN INTELLIGENCE, THEY MORE THAN MAKE UP FOR IN SHEER SPEED, CHARGING FORWARD WITHOUT HESITATION!",
            images: [
                this.createImage('scorble', 90.25, 60, 0, 'right', 'bottom'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //63
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

        this.createPage({ //64
            name: "CACTRIX",
            type: "STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "MOST CACTI ARE CONTENT TO STAND IN PLACE FOR CENTURIES. CACTRIX NEVER GOT THAT MEMO.\n"
                + "IT IS BELIEVED THAT THE INTENSE HEAT OF THE VOLCANIC SOIL SEEPED INTO ITS ROOTS OVER GENERATIONS, GIVING IT AN ENERGY IT SIMPLY CANNOT CONTAIN.\n"
                + "IT CHARGES FORWARD WITH RECKLESS SPEED, AND ITS VIBRANT FORM MAKES IT EASY TO SPOT. JUST NOT ALWAYS EASY TO AVOID.",
            images: [
                this.createImage('cactrix', 115.3, 130, 0, 'right', 'bottom', 'stun'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //65
            name: "MAGMAPOD",
            type: "RED",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "MAGMAPOD EMERGED FROM THE DEPTHS OF A DORMANT VOLCANIC VENT LONG BEFORE THIS PLACE WAS EVER EXPLORED.\n"
                + "OVER MILLENNIA, IT FUSED WITH THE SURROUNDING ROCK, ROOTING ITSELF TO THE VOLCANIC SOIL AND FEEDING ON THE GEOTHERMAL HEAT BELOW.\n"
                + "THE SUPERHEATED LIQUID THAT BUILDS INSIDE IT EVENTUALLY FORCES ITS WAY TO THE SURFACE IN VOLATILE BUBBLES.",
            images: [
                this.createImage('magmapod', 167, 130, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "map7",
            projectile: 'red',
        });

        this.createPage({ //66
            name: "VOLCANURTLE",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "THE VOLCANURTLE HAS SURVIVED EVERY ERUPTION THIS VOLCANO HAS EVER PRODUCED.\n"
                + "CENTURIES OF ERUPTIONS CRACKED ITS SHELL OVER AND OVER, UNTIL LAVA SEEPED INTO EVERY FISSURE AND HARDENED THERE, FUSING WITH IT PERMANENTLY.\n"
                + "DESPITE THIS, IT KEEPS ON GOING, SLOWLY BUT RELENTLESSLY, UNBOTHERED BY THE SCORCHING HEAT.",
            images: [
                this.createImage('volcanurtle', 152.25, 100, 4, 'right', 'bottom'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //67
            name: "BLOBURN",
            type: "POISON",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "BLOBURNS FORM DEEP INSIDE ACTIVE VOLCANOES, BUBBLING TOGETHER FROM HEAT AND PRESSURE UNTIL AN ERUPTION LAUNCHES THEM INTO THE AIR.\n"
                + "THEY NEVER ASKED FOR THIS. THEY SIMPLY END UP HERE, DRIFTING AND SPINNING THROUGH THE TERRAIN.\n"
                + "SOMEWHERE ALONG THE WAY, THEY DECIDED THAT CHASING THINGS WAS A PERFECTLY GOOD USE OF THEIR TIME.",
            images: [
                this.createImage('bloburn', 52, 50, 0, 'right', 'top', 'poison'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //68
            name: "VOLCANO WASP",
            type: "STUN",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "IF YOU THOUGHT REGULAR WASPS WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP.\n"
                + "ONCE NATIVE TO THE SUNNY FIELDS OF SPRINGLY LEMONY, SOMETHING DROVE THEM TO MIGRATE DEEP INTO VOLCANIC TERRITORY.\n"
                + "THE EXTREME HEAT ONLY SHARPENED THEIR AGGRESSION, AS THEY STING ANYTHING THAT CROSSES THEIR PATH WITHOUT HESITATION.",
            images: [
                this.createImage('volcanoWasp', 93, 90, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "map7",
        });

        this.createPage({ //69
            name: "SCORVEX",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "SCORVEX HAS NOT MOVED FROM ITS SPOT FOR WHAT IS BELIEVED TO BE CENTURIES, YET IT SHOWS NO SIGNS OF IMPATIENCE.\n"
                + "IT SITS WITH ITS VENOMOUS TAIL COILED AND READY, CONTENT TO LET EVERYTHING ELSE COME TO IT.\n"
                + "THE VOLCANIC HEAT KEEPS ITS VENOM POTENT AND ITS PATIENCE ENDLESS.",
            images: [
                this.createImage('scorvex', 161, 150, 0, 'right', 'bottom'),
            ],
            mapKey: "map7",
            projectile: 'poison',
        });

        this.createPage({ //70
            name: "LAVARYN",
            type: "NORMAL",
            foundAt: "INFERNAL CRATER PEAK",
            description:
                "LAVARYN IS AN ANCIENT VOLCANIC BEAST THAT HAS LIVED BENEATH THE SURFACE FOR THOUSANDS OF YEARS.\n"
                + "IT SLEEPS DEEP IN THE MOLTEN ROCK, RISING ONLY WHEN IT SENSES SOMETHING MOVING ABOVE.\n"
                + "THOSE WHO HAVE SURVIVED AN ENCOUNTER DESCRIBE IT AS PART BEAST, PART ERUPTION.",
            images: [
                this.createImage('lavaryn', 176.5, 160, 1, 'right', 'bottom'),
            ],
            mapKey: "map7",
            projectile: 'normal',
        });

        // BONUS MAP 1 - Icebound Cave
        this.createCoverPage({ //1
            mapKey: 'bonusMap1',
            coverTitle: 'ICEBOUND CAVE',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap1Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //2
            name: "ICE PLANT",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "THE ICE PLANT WAS NOT ALWAYS COVERED IN ICE.\n"
                + "CENTURIES OF ABSORBING THE CAVE'S COLD ENERGY SLOWLY COATED IT IN FROST, UNTIL THE ICE GREW SO THICK IT BECAME IMPOSSIBLE TO TELL WHERE THE PLANT ENDS AND THE ICE BEGINS.",
            images: [
                this.createImage('icePlant', 78.42857142857143, 115, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
            projectile: 'slow',
        });

        this.createPage({ //3
            name: "CRYOPEDE",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "THIS ELONGATED CREATURE SCUTTLES ACROSS THE ICY CAVE FLOOR WITH SURPRISING STEADINESS.\n"
                + "ITS MANY LEGS GIVE IT PERFECT GRIP ON THE SLIPPERY ICE, MOVING WITH A PERSISTENCE THAT IS HARD TO SHAKE OFF.",
            images: [
                this.createImage('cryopede', 126, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({ //4
            name: "ICE SILKNOIR",
            type: "SLOW",
            foundAt: "ICEBOUND CAVE",
            description:
                "IT IS BELIEVED THAT A GROUP OF SILKNOIRS WANDERED TOO FAR FROM NIGHTFALL PHANTOM GRAVES AND BECAME TRAPPED IN ICEBOUND CAVE.\n"
                + "OVER GENERATIONS, THE RELENTLESS COLD BLEACHED THEIR DARKNESS AWAY AND COATED THEM IN FROST, TURNING THEM INTO SOMETHING ENTIRELY NEW.\n"
                + "THEY STILL DESCEND SILENTLY FROM ABOVE, SWAYING AS THEY WAIT. OLD HABITS DIE HARD.",
            images: [
                this.createLine(this.pageWidth - 110, 0, 345),
                this.createImage('iceSilknoir', 120, 144, 0, 'right', 270, 'slow'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({ //5
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

        this.createPage({ //6
            name: "FROBAT",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "FROBATS ARE BELIEVED TO HAVE ONCE BEEN ORDINARY CAVE BATS BEFORE THE TEMPERATURES IN ICEBOUND CAVE DROPPED TO LEVELS THAT SHOULD HAVE KILLED THEM.\n"
                + "INSTEAD, THEY ADAPTED. THEIR WINGS HARDENED WITH FROST, THEIR BODIES GREW RESISTANT TO THE COLD, AND THEY KEPT FLYING.\n"
                + "SOME SAY THE FROST ON THEIR WINGS HAS NOT MELTED IN THOUSANDS OF YEARS.",
            images: [
                this.createImage('frobat', 156.75, 130, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({ //7
            name: "CRYSTAL WASP",
            type: "FROZEN",
            foundAt: "ICEBOUND CAVE",
            description:
                "THE CRYSTAL WASP IS ONE OF THE MORE AGGRESSIVE CREATURES IN THE CAVE, LOCKING ONTO ANYTHING THAT MOVES WITH FIERCE DETERMINATION.\n"
                + "THE COLD, HOWEVER, HAS TAKEN ITS TOLL. ITS CRYSTALLINE WINGS ARE HEAVY WITH FROST, AND EVERY FLAP IS A STRUGGLE.\n"
                + "IT WILL REACH YOU EVENTUALLY. IT JUST TAKES A WHILE.",
            images: [
                this.createImage('crystalWasp', 111.8333333333333, 110, 0, 'right', 'top', 'frozen'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({ //8
            name: "GLOBBY",
            type: "NORMAL",
            foundAt: "ICEBOUND CAVE",
            description:
                "NOBODY IS QUITE SURE HOW GLOBBY CAME TO EXIST. THE LEADING THEORY IS THAT A CHUNK OF ICE SIMPLY ROLLED AROUND THE CAVE FOR LONG ENOUGH THAT IT DEVELOPED A PERSONALITY!",
            images: [
                this.createImage('globby', 115, 110, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        this.createPage({ //9
            name: "DRILLICE",
            type: "SLOW",
            foundAt: "ICEBOUND CAVE",
            description:
                "IT IS BELIEVED THAT DRILLICE FORMED FROM ICE THAT SPUN INSIDE THE CAVE'S UNDERGROUND CURRENTS FOR SO LONG THAT IT HARDENED INTO A LIVING, SPIRALING CREATURE.\n"
                + "IT LIES DORMANT BENEATH THE SURFACE UNTIL IT SENSES MOVEMENT ABOVE, THEN DRILLS UPWARD AND BURSTS THROUGH THE ICE.",
            images: [
                this.createImage('drillice', 197, 115, 0, 'right', 'bottom', 'slow'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        });

        // BONUS MAP 2 - Crimson Fissure
        this.createCoverPage({ //10
            mapKey: 'bonusMap2',
            coverTitle: 'CRIMSON FISSURE',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap2Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //11
            name: "SIGILFLY",
            type: "RED",
            foundAt: "CRIMSON FISSURE",
            description:
                "THE SIGILFLY WAS ONCE A PERFECTLY ORDINARY FLY, WANDERING THROUGH THE FISSURE WITH NO PARTICULAR AGENDA.\n"
                + "UNFORTUNATELY, IT HAPPENED TO BE IN EXACTLY THE WRONG SPOT WHEN PART OF AN ANCIENT SEAL BEGAN TO CRACK, RELEASING A BURST OF ENERGY THAT HIT THE FLY DIRECTLY.\n"
                + "WHAT EMERGED WAS NO LONGER ORDINARY.",
            images: [
                this.createImage('sigilfly', 128, 100, 0, 'right', 'top', 'red'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //12
            name: "OOZEL",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "OOZELS APPEAR FROM ABOVE, FALLING FROM THE SKIES BEFORE QUICKLY SCUTTLING TOWARD ANY PREY THEY DETECT ON THE GROUND.\n"
                + "THEY SEEM TO MATERIALIZE OUT OF THIN AIR, DROPPING WITHOUT WARNING AS IF THEY APPEARED FROM NOWHERE.",
            images: [
                this.createImage('oozel', 124, 50, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //13
            name: "MAWRUNE",
            type: "FROZEN",
            foundAt: "CRIMSON FISSURE",
            description:
                "MAWRUNE GROWS IN SOIL WHERE NOTHING ELSE DOES, SUSTAINED ENTIRELY BY THE ENERGY THAT SEEPS UPWARD FROM THE ANCIENT SEALS BURIED BENEATH IT.\n"
                + "THAT ENERGY, HOWEVER, RUNS AT SUBZERO TEMPERATURES, AND CENTURIES OF ABSORBING IT HAVE LEFT PALE BLUE MARKINGS ACROSS ITS BODY, A PERMANENT SIGN OF THE FREEZING POWER THAT KEEPS IT ALIVE.",
            images: [
                this.createImage('mawrune', 108.5, 120, 0, 'right', 'bottom', 'frozen'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
            projectile: 'stun',
        });

        this.createPage({ //14
            name: "RUNESPIDER",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "THE RUNESPIDER IS SMALL, FAST, AND DEEPLY COMMITTED TO BEING IN YOUR WAY.\n"
                + "IT SKITTERS THROUGH THE FISSURE WITH THE ENERGY OF SOMETHING THAT HAS SOMEWHERE VERY IMPORTANT TO BE, EVEN THOUGH IT CLEARLY DOES NOT.",
            images: [
                this.createImage('runespider', 98.66666666666667, 70, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //15
            name: "RUNECKO",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "THE RUNECKO LURKS IN THE SHADOWS OF THE FISSURE, WAITING PATIENTLY BEFORE LAUNCHING ITSELF AT ITS TARGET.\n"
                + "WHEN IT SPOTS PREY, IT LEAPS THROUGH THE AIR WITH ALL ITS MIGHT!",
            images: [
                this.createImage('runecko', 124.5, 80, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //16
            name: "SIGILASH",
            type: "STUN",
            foundAt: "CRIMSON FISSURE",
            description:
                "SIGILASH IS A LIGHTWEIGHT FLY THAT PLUMMETS FROM THE SKY AT HIGH SPEED.\n"
                + "UNLIKE THE SIGILFLY, SIGILASH WAS NOT AN ACCIDENT. IT CARRIES A MORE VOLATILE STRAIN OF THE SEAL'S ENERGY AND MOVES WITH AN AGGRESSION THAT FEELS ENTIRELY DELIBERATE.",
            images: [
                this.createImage('sigilash', 99, 100, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //17
            name: "GOLEX",
            type: "RED",
            foundAt: "CRIMSON FISSURE",
            description:
                "GOLEX IS A DENSE ROCK FORMATION THAT CAME TO LIFE AS THE ANCIENT SEAL WITHIN CRIMSON FISSURE BEGAN TO CRACK, ITS ENERGY SEEPING INTO THE SURROUNDING STONE.\n"
                + "WHAT WAS ONCE AN ORDINARY CHUNK OF ROCK NOW MOVES WITH AN ERRATIC, UNPREDICTABLE WILL OF ITS OWN.",
            images: [
                this.createImage('golex', 152, 140, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //18
            name: "VOIDSERP",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "VOIDSERP IS A BIG SERPENT THAT ROAMS THE FISSURE FLOOR WITH A SINGLE GLOWING EYE.\n"
                + "NOBODY KNOWS WHAT HAPPENED TO THE OTHER ONE. NOBODY HAS BEEN CLOSE ENOUGH TO ASK.",
            images: [
                this.createImage('voidserp', 217, 100, 0, 'right', 'bottom', null, 0, 0.9),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
        });

        this.createPage({ //19
            name: "WARDRAKE",
            type: "NORMAL",
            foundAt: "CRIMSON FISSURE",
            description:
                "LEGENDS SAY THAT A GROUP OF ANCIENT SORCERERS BOUND WARDRAKES TO CRIMSON FISSURE LONG AGO, TASKING THEM WITH GUARDING THE ANCIENT SEALS FOUND WITHIN IT.\n"
                + "WHAT THOSE SORCERERS KNEW ABOUT THE SEALS, AND WHY THEY FELT THEY NEEDED PROTECTING, HAS BEEN LOST TO TIME.\n"
                + "THE WARDRAKES, HOWEVER, HAVE NOT FORGOTTEN THEIR PURPOSE.",
            images: [
                this.createImage('wardrake', 182, 172, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap2",
            category: "bonus",
            projectile: 'red',
        });

        // BONUS MAP 3 - Cosmic Rift
        this.createCoverPage({ //20
            mapKey: 'bonusMap3',
            coverTitle: 'COSMIC RIFT',
            category: 'bonus',
            coverImages: [
                this.createCoverImage('bonusMap3Cover', 0, 0, this.pageWidth, this.pageHeight, { alpha: 1 }),
            ],
        });

        this.createPage({ //21
            name: "NEBULURE",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "NEBULURE IS NATIVE TO THE COSMIC RIFT, A CREATURE THAT HAS NEVER KNOWN ANY WORLD OTHER THAN THIS ONE.\n"
                + "ROOTED TO THE RIFT FLOOR, IT STANDS COMPLETELY STILL, BLENDING INTO THE ALIEN LANDSCAPE AS IF IT GREW FROM IT.\n"
                + "THOSE WHO STUMBLE TOO CLOSE QUICKLY LEARN THAT STILLNESS DOES NOT MEAN HARMLESS.",
            images: [
                this.createImage('nebulure', 95.75, 150, 1, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //22
            name: "VEYNOCULUS",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "VEYNOCULUS IS ONE OF THE MOST COMMONLY SPOTTED CREATURES IN THE COSMIC RIFT.\n"
                + "IT DRIFTS THROUGH THE AIR WITHOUT PURPOSE OR AGGRESSION, ENTIRELY INDIFFERENT TO WHATEVER ELSE IS HAPPENING AROUND IT.\n"
                + "IN A PLACE AS HOSTILE AS THE RIFT, VEYNOCULUS IS A RARE REMINDER THAT NOT EVERYTHING HERE WANTS TO CAUSE HARM.",
            images: [
                this.createImage('veynoculus', 78.6, 50, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //23
            name: "PLAZER",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "PLAZER IS A PLANT NATIVE TO THE COSMIC RIFT, BELIEVED TO HAVE EVOLVED ITS SINGLE EYE TO ABSORB THE RIFT'S CONCENTRATED ENERGY.\n"
                + "OVER TIME, THAT ENERGY BUILT UP FASTER THAN THE PLANT COULD CONTAIN IT, AND BLINKING BECAME THE ONLY WAY TO RELEASE IT.",
            images: [
                this.createImage('plazer', 61.33333333333333, 90, 2, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'normal',
        });

        this.createPage({ //24
            name: "JOHNNY",
            type: "STUN",
            foundAt: "COSMIC RIFT",
            description:
                "JOHNNY IS A RELENTLESS PURSUER.\n"
                + "ONCE IT LOCKS ITS EYES ON A TARGET, IT WILL CHASE IT ACROSS THE ENTIRE RIFT WITHOUT HESITATION. AND IT IS FAST!",
            images: [
                this.createImage('johnny', 98, 80, 0, 'right', 'top', 'stun'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //25
            name: "CRABULA",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "CRABULAS SPEND MOST OF THEIR LIVES DRIFTING THROUGH THE UPPER LAYERS OF THE COSMIC RIFT, FAR OUT OF SIGHT.\n"
                + "WHEN ONE DROPS, IT IS NOT BY ACCIDENT. IT HAS SPOTTED SOMETHING BELOW AND DECIDED TO INVESTIGATE AT FULL SPEED.\n"
                + "THEIR THICK SHELLS WERE NOT BUILT FOR GRACE. THEY WERE BUILT FOR EXACTLY THIS.",
            images: [
                this.createImage('crabula', 125.6666666666667, 130, 0, 'right', 'top'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //26
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

        this.createPage({ //27
            name: "LANCER",
            type: "FROZEN",
            foundAt: "COSMIC RIFT",
            description:
                "LANCER IS ONE OF THE FASTEST THREATS IN THE RIFT, ROCKETING THROUGH THE AIR AT BLISTERING SPEED.\n"
                + "ITS FROZEN IMPACT LEAVES YOU MOMENTARILY HELPLESS. BLINK AND YOU WILL MISS IT.",
            images: [
                this.createImage('lancer', 181.25, 70, 0, 'right', 'top', 'frozen'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //28
            name: "FROGULA",
            type: "RED",
            foundAt: "COSMIC RIFT",
            description:
                "A FROG. IN ANOTHER DIMENSION. NOBODY QUESTIONED IT, AND FROGULA CERTAINLY IS NOT EXPLAINING ITSELF.\n"
                + "IT SIMPLY WAITS ON THE RIFT FLOOR UNTIL SOMETHING MOVES, THEN LEAPS WITH THE CONFIDENCE OF SOMETHING THAT BELONGS HERE.",
            images: [
                this.createImage('frogula', 96.5, 100, 0, 'right', 'bottom', 'red'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //29
            name: "VESPION",
            type: "SLOW",
            foundAt: "COSMIC RIFT",
            description:
                "VESPION CUTS THROUGH THE RIFT IN A SHARP, RELENTLESS ZIGZAG. UP AND DOWN, UP AND DOWN.\n"
                + "ITS ERRATIC FLIGHT PATH MAKES IT NEARLY IMPOSSIBLE TO DODGE WITHOUT CAREFUL TIMING.",
            images: [
                this.createImage('vespion', 117, 100, 0, 'right', 'top', 'slow'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //30
            name: "OCULITH",
            type: "POISON",
            foundAt: "COSMIC RIFT",
            description:
                "OCULITH LURKS BENEATH THE RIFT FLOOR, WAITING IN SILENCE.\n"
                + "WHEN IT SENSES A PRESENCE ABOVE, IT BURSTS UPWARD AND KEEPS RISING. NEVER RETREATING, NEVER STOPPING.",
            images: [
                this.createImage('oculith', 93, 80, 0, 'right', 'bottom', 'poison'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
        });

        this.createPage({ //31
            name: "ASTRAIDER",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "ASTRAIDER IS BELIEVED TO BE ONE OF THE OLDEST NATIVE SPECIES OF THE COSMIC RIFT.\n"
                + "IT CRAWLS ACROSS THE RIFT FLOOR WITH AN UNSETTLING CONFIDENCE, AS IF IT KNOWS NOTHING HERE CAN THREATEN IT.",
            images: [
                this.createImage('astraider', 160.5, 120, 0, 'right', 'bottom'),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'frozen',
        });

        this.createPage({ //32
            name: "BORION",
            type: "NORMAL",
            foundAt: "COSMIC RIFT",
            description:
                "BORION IS BELIEVED TO BE THE OLDEST LIVING CREATURE IN THE COSMIC RIFT, A COLOSSAL BEAST THAT HAS LURKED BENEATH ITS SURFACE SINCE LONG BEFORE ANYTHING ELSE ARRIVED.\n"
                + "IT IS CONSIDERED THE APEX PREDATOR OF THE RIFT, HAVING MASTERED EVERY ELEMENT KNOWN TO EXIST WITHIN IT AND UNLEASHING THEM ALL AT WILL.",
            images: [
                this.createImage('borion', 228, 150, 0, 'right', 'bottom', null, 0, 0.9),
            ],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'all',
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
        projectile = undefined,

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
            projectile,

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
        return this.mapColors[title] || this.typeColors[title] || null;
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

    drawProjectileIcon(context, cx, cy, projectileType) {
        const imageIds = {
            normal: 'normalProjectile',
            red: 'redProjectile',
            stun: 'stunProjectile',
            poison: 'poisonProjectile',
            slow: 'slowProjectile',
            frozen: 'frozenProjectile',
            all: 'allProjectile',
        };

        context.save();

        const imageId = imageIds[projectileType];
        if (imageId) {
            const img = document.getElementById(imageId);
            if (img) {
                const scale = 0.9;
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                context.drawImage(img, cx - w / 2, cy - h / 2, w, h);
            }
        }

        context.restore();
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

        const renderText = (text, startX, startY, extraPhrases = []) => {
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

            [...this.highlightPhrases, ...extraPhrases].forEach(({ words, style }) => {
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
            renderText(`TYPE: ${page.type}`, x + 20, y + offsetY, this.typeHighlightPhrases);
            offsetY += lineHeight + gapHeight;
            renderText(`FOUND AT: ${page.foundAt}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            renderText(`DESCRIPTION:`, x + 20, y + offsetY);
            offsetY += lineHeight;
            renderText(page.description, x + 20, y + offsetY);

            if (page.projectile !== undefined && page.projectile !== null) {
                const iconCX = x + 20 + maxWidth - 50;
                const iconCY = y + 50;
                this.drawProjectileIcon(context, iconCX, iconCY, page.projectile);
            }
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

    handleMouseMove() {
        // do nothing
    }
}
