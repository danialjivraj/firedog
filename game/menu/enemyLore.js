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
            "NIGHTFALL CITY PHANTOM": { fill: '#a84ffcff', stroke: 'black', strokeBlur: 10 },
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
        // 1
        this.createPage(
            "GOBLITO",
            "GROUND & NORMAL",
            "EVERYWHERE",
            "THE GOBLITO SPECIES, ONCE NON-THREATENING PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
            + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
            + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.",
            [
                this.createImage('goblinSteal', 60.083, 80, 3, this.pageWidth - 135, this.pageHeight - 120, 1.3),
            ],
            "map1"
        );
        // 2
        this.createPage(
            "DOTTER",
            "FLY & NORMAL",
            "LUNAR MOONLIT GLADE",
            "IT IS SAID THAT DOTTERS HAVE BEEN AROUND FOR THOUSANDS OF YEARS...\n"
            + "EVEN ON THE BRINK OF EXTINCTION, THEY HAVE ALWAYS MANAGED TO SURVIVE.\n"
            + "THESE LITTLE CREATURES CAN BE FOUND ROAMING AROUND PEACEFULLY WITHIN THE FOREST.",
            [
                this.createImage('dotter', 60.083, 80, 0, this.pageWidth - 140, 60, 1.4),
            ],
            "map1"
        );
        // 3
        this.createPage(
            "VERTIBAT",
            "FALL & NORMAL",
            "LUNAR MOONLIT GLADE",
            "THESE VERTIBATS ARE COMMONLY FOUND IN NIGHTFALL CITY PHANTOM, HOWEVER, SOMETHING HAS CAUSED MOST OF THEM TO MIGRATE "
            + "TO THE AREA OF LUNAR MOONLIT GLADE.\nIT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCY, WHICH PROBABLY CAUSED "
            + "MOST OF THEM TO FIND REFUGE HERE!\nHIDING ON TOP OF TREES, THESE BATS WAIT FOR MOVEMENT BEFORE THEY FALL ONTO THEIR TARGET.\n",
            [
                this.createImage('vertibat', 151.166, 90, 0, this.pageWidth - 210, 40, 1),
            ],
            "map1"
        );
        // 4
        this.createPage(
            "GHOBAT",
            "FLY & NORMAL",
            "LUNAR MOONLIT GLADE",
            "NOT MUCH IS KNOWN ABOUT THIS GHOST-SHAPED BAT.\n"
            + "ALL THAT IS KNOWN IS THAT IT LIKES TO FLAP ITS WINGS AND CHASE DOTTERS...",
            [
                this.createImage('ghobat', 134.33, 84, 0, this.pageWidth - 190, 40, 1.1),
            ],
            "map1"
        );
        // 5
        this.createPage(
            "RAVENGLOOM",
            "FLY & NORMAL",
            "LUNAR MOONLIT GLADE",
            "THIS FLYING CREATURE LIKES TO PEACEFULLY FLY THROUGH TREES!",
            [
                this.createImage('ravengloom', 139.66, 100, 0, this.pageWidth - 200, 40, 1),
            ],
            "map1"
        );
        // 6
        this.createPage(
            "MEAT SOLDIER",
            "GROUND & NORMAL",
            "LUNAR MOONLIT GLADE",
            "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT ALL LAND.\n"
            + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
            + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.",
            [
                this.createImage('meatSoldier', 67.625, 80, 0, this.pageWidth - 150, this.pageHeight - 110, 1.1),
            ],
            "map1"
        );
        // 7
        this.createPage(
            "SKULNAP",
            "GROUND & STUN",
            "LUNAR MOONLIT GLADE",
            "HE HAD NEVER BEEN IN THIS AREA UNTIL SOME TIME AGO. NO ONE KNOWS HIS ORIGIN, AND IT IS BELIEVED THAT SKULNAP WAS "
            + "AN EXPERIMENT MADE BY ONE OF THE LANDS.\nHE CAN BE FOUND SLEEPING ON THE GROUND, BUT AS SOON AS YOU STEP WITHIN HEARING RANGE, YOU'LL WAKE HIM RIGHT AWAY!",
            [
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 100, 1.1, 'stun'),
                this.createImage('skulnapAwake', 104.231, 70, 0, this.pageWidth - 650, this.pageHeight - 110, 1.1, 'stun'),
            ],
            "map1"
        );
        // 8
        this.createPage(
            "ABYSSAW",
            "FLY & NORMAL",
            "LUNAR MOONLIT GLADE",
            "YOU'LL HEAR THEM BEFORE YOU SEE THEM!\n"
            + "THESE LOUD CREATURES SPIN AGGRESSIVELY LIKE A CHAINSAW AS THEY MOVE THROUGH THE TREES OF THE FOREST.\nWATCH OUT, SO YOU DON'T GET CUT!",
            [
                this.createImage('abyssaw', 100.44, 100, 0, this.pageWidth - 160, 40, 1),
            ],
            "map1"
        );
        // 9
        this.createPage(
            "GLIDOSPIKE",
            "FLY & NORMAL",
            "LUNAR MOONLIT GLADE",
            "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
            + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
            + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDESPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!",
            [
                this.createImage('glidoSpikeFly', 191.68, 130, 0, this.pageWidth - 220, 30, 1),
                this.createImage('windAttack', 105, 120, 0, this.pageWidth - 200, 120, 1),
            ],
            "map1"
        );

        // MAP 2 - Nightfall City Phantom
        // 10
        this.createPage(
            "DUSK PLANT",
            "GROUND & NORMAL",
            "NIGHTFALL CITY PHANTOM",
            "THESE RARE PLANTS ARE DORMANT BY DAY BUT AWAKEN AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH "
            + "OF UNSUSPECTING PREY.\n AS SOON AS THEY DETECT MOVEMENT, DUSK PLANTS WILL LAUNCH A VERY DARK LEAF FROM THEIR MOUTHS, AIMING TO SLICE THROUGH THEIR TARGET!",
            [
                this.createImage('duskPlant', 60, 87, 0, this.pageWidth - 150, this.pageHeight - 110, 1),
                this.createImage('darkLeafAttack', 35.416, 45, 0, this.pageWidth - 210, this.pageHeight - 100, 1),
            ],
            "map2"
        );
        // 11
        this.createPage(
            "SILKNOIR",
            "CRAWLER & NORMAL",
            "NIGHTFALL CITY PHANTOM",
            "THESE BIG SPIDERS APPEAR AT NIGHT, CRAWLING DOWN THE TALLEST TREES FOR SOME PREYS!\n"
            + "SILKNOIRS ARE BIG IN SIZE BECAUSE THEY FEAST ON ANYTHING THEY LAY THEIR EYES ON!",
            [
                this.createImage('blackLine', 3, 345, 0, this.pageWidth - 111, 0, 1),
                this.createImage('silknoir', 120, 144, 0, this.pageWidth - 170, 270, 1),
            ],
            "map2"
        );
        // 12
        this.createPage(
            "WALTER THE GHOST",
            "FLY & NORMAL",
            "NIGHTFALL CITY PHANTOM",
            "WALTER IS A VERY CURIOUS AND SPOOKY GHOST.\nIF HE SPOTS YOU, HE MIGHT CHASE YOU!",
            [
                this.createImage('walterTheGhost', 104.83, 84, 0, this.pageWidth - 160, 70, 1),
            ],
            "map2"
        );
        // 13
        this.createPage(
            "BEN",
            "FALL & NORMAL",
            "NIGHTFALL CITY PHANTOM",
            "BEN IS A SMALL CREATURE WHO SEEMS TO APPEAR OUT OF NOWHERE.\nLITTLE IS KNOWN ABOUT HIS BACKSTORY OR PURPOSE, "
            + "EXCEPT THAT HE DROPS FROM ABOVE AND MOVES CURIOUSLY IN YOUR DIRECTION.",
            [
                this.createImage('ben', 61.5, 50, 0, this.pageWidth - 160, 70, 1.3),
            ],
            "map2"
        );
        // 13b
        this.createPage(
            "GLOOMLET",
            "FLY & RED",
            "NIGHTFALL CITY PHANTOM",
            "GLOOMLETS ARE SHADOWS THAT SLIPPED FREE FROM THE WALLS OF NIGHTFALL CITY PHANTOM.\n"
            + "THEIR FACES NEVER CHANGE, BUT PEOPLE SWEAR THEIR EXPRESSIONS SHIFT WHEN NO ONE IS LOOKING.\n"
            + "SOME SAY THEY DRIFT TOWARD ANY PLACE WHERE A SECRET WAS ONCE WHISPERED, AS IF STILL LISTENING FOR THE REST OF THE STORY.",
            [
                this.createImage('gloomlet', 78, 74, 0, this.pageWidth - 160, 50, 1.3, 'red'),
            ],
            "map2"
        );
        // 14
        this.createPage(
            "DOLLY",
            "FLY & NORMAL",
            "NIGHTFALL CITY PHANTOM",
            "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
            + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.\nIF YOU SEE DOLLY LAUNCHING A YELLOWISH AURA, "
            + "YOU SHOULD AVOID TOUCHING IT AT ALL COSTS!",
            [
                this.createImage('dolly', 88.2, 120, 0, this.pageWidth - 160, 70, 1),
                this.createImage('aura', 52, 50, 0, this.pageWidth - 210, 150, 1, 'stun'),
            ],
            "map2"
        );

        // MAP 3 - Coral Abyss
        // 15
        this.createPage(
            "PIRANHA",
            "SWIMMER & NORMAL",
            "CORAL ABYSS",
            "PIRANHAS ARE QUICK AND NIPPY FISH.\nTHEIR SHARP TEETH CAN GIVE YOU NASTY BITE, SO KEEP YOUR DISTANCE!",
            [
                this.createImage('piranha', 75.167, 50, 0, this.pageWidth - 160, 70, 1),
            ],
            "map3"
        );
        // 16
        this.createPage(
            "SKELETON FISH",
            "SWIMMER & NORMAL",
            "CORAL ABYSS",
            "ROAMING THE SEAS FOR THOUSANDS OF YEARS, THESE ANCIENT FISH HAVE ADAPTED TO THEIR UNDERWATER HABITAT.\n"
            + "THEY DON'T HAVE EYES, BUT THEY CAN SENSE MOVEMENT AND WILL BE QUICK AND PERSISTENT IN CHASING YOU DOWN!",
            [
                this.createImage('skeletonFish', 55, 39, 0, this.pageWidth - 160, 70, 1),
            ],
            "map3"
        );
        // 17
        this.createPage(
            "SPEAR FISH",
            "GROUND & RED",
            "CORAL ABYSS",
            "ONCE A MIGHTY WARRIOR IN A FORGOTTEN UNDERWATER KINGDOM, THIS FISH HAS ADOPTED A SPEAR AS ITS MOST PRIZED POSSESSION.\n"
            + "WITH A SHARP IMPOSING TIP, THE SPEAR FISH USES ITS WEAPON TO DEFEND ITS TERRITORY AND CHALLENGE ANY INTRUDERS.\n"
            + "LEGEND HAS IT THAT THE SPEAR FISH'S SKILLS WERE MASTERED IN ANCIENT DUELS, AND NOW IT GUARDS THE SEAS WITH A COMBINATION OF ANCIENT FEROCITY "
            + "AND DETERMINATION, RUNNING BRAVELY TOWARDS ITS TARGET!",
            [
                this.createImage('spearFish', 91.875, 110, 0, this.pageWidth - 160, this.pageHeight - 130, 1, 'red'),
            ],
            "map3"
        );
        // 18
        this.createPage(
            "JET FISH",
            "SWIMMER & NORMAL",
            "CORAL ABYSS",
            "IS IT A JET? IS IT A FISH? NO, IT'S BOTH!\n"
            + "JET FISH BLENDS THE SPEED OF A JET WITH THE SWIFT MOVES OF A FISH, GLIDING THROUGH THE WATERS OF CORAL ABYSS AT SUPERSONIC SPEED!",
            [
                this.createImage('jetFish', 142, 55, 0, this.pageWidth - 160, 70, 1),
            ],
            "map3"
        );
        // 19
        this.createPage(
            "PIPER",
            "GROUND & NORMAL",
            "CORAL ABYSS",
            "PIPER SEEMS LIKE A HARMLESS ENEMY AT FIRST...\n"
            + "BUT GET TOO CLOSE, AND SHE'LL UNVEIL HER TRUE FORM, EXPANDING TO FIVE TIMES HER ORIGINAL SIZE!",
            [
                this.createImage('piperIdle', 87, 67, 0, this.pageWidth - 250, this.pageHeight - 110, 1),
                this.createImage('piperExtended', 82, 234, 10, this.pageWidth - 150, this.pageHeight - 275, 1),
            ],
            "map3"
        );
        // 20
        this.createPage(
            "VOLTZEEL",
            "FALL & STUN",
            "CORAL ABYSS",
            "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
            + "IT IS RUMORED THAT HIS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.",
            [
                this.createImage('voltzeel', 107, 87, 4, this.pageWidth - 160, 70, 1, 'stun')
            ],
            "map3"
        );
        // 21
        this.createPage(
            "GARRY",
            "GROUND & NORMAL",
            "CORAL ABYSS",
            "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
            + "TAKES A WHILE TO FADE AWAY!",
            [
                this.createImage('paint_splatter_8', 1994, 995, 0, -130, 175, 0.5),
                this.createImage('garry', 165, 122, 0, this.pageWidth - 220, this.pageHeight - 130, 1),
                this.createImage('inkBeam', 77, 34, 2, this.pageWidth - 250, this.pageHeight - 70, 1),
            ],
            "map3"
        );

        // MAP 4 - Verdant Vine
        // 22
        this.createPage(
            "BIG GREENER",
            "GROUND & NORMAL",
            "VERDANT VINE",
            "THE OXYGEN LEVELS IN THIS AREA ARE TWICE AS HIGH COMPARED TO OTHERS DUE TO ITS VAST PLANTATION.\n"
            + "THIS PLANT'S LARGE SIZE IS A RESULT OF THIS ABUNDANT OXYGEN.\nBIG GREENERS CAN THROW TWO LEAVES AT ONCE, SO BE CAREFUL, AS THEY SLICE THROUGH ANYTHING THAT CROSSES THEIR PATH!",
            [
                this.createImage('bigGreener', 113, 150, 0, this.pageWidth - 150, this.pageHeight - 170, 1),
                this.createImage('leafAttack', 35.416, 45, 0, this.pageWidth - 200, this.pageHeight - 125, 1),
                this.createImage('leafAttack', 35.416, 45, 8, this.pageWidth - 340, this.pageHeight - 125, 1),
            ],
            "map4"
        );
        // 23
        this.createPage(
            "CHIQUITA",
            "FLY & NORMAL",
            "VERDANT VINE",
            "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n"
            + "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n"
            + "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.",
            [
                this.createImage('chiquita', 118.823529411764, 85, 0, this.pageWidth - 190, 40, 1),
            ],
            "map4"
        );
        // 24
        this.createPage(
            "SLUGGIE",
            "GROUND & NORMAL",
            "VERDANT VINE",
            "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW OF THAT "
            + "IF YOU STEP TOO CLOSE TO HIM!",
            [
                this.createImage('paint_splatter_4', 1994, 995, 0, -170, 30, 0.9),
                this.createImage('sluggie', 147.33, 110, 0, this.pageWidth - 200, this.pageHeight - 140, 1),
            ],
            "map4"
        );
        // 25
        this.createPage(
            "LIL HORNET",
            "FLY & STUN",
            "VERDANT VINE",
            "WITH A SHARP HORN AT THE TOP OF ITS HEAD, THEY CAN CAUSE SOME SERIOUS DAMAGE IF YOU MAKE CONTACT WITH THEM!\n"
            + "IT IS BELIEVED THAT EVERY CREATURE IN VERDANT VINE IS AFRAID TO ATTACK LIL HORNETS DUE TO THEIR INTIMIDATING HORN!",
            [
                this.createImage('lilHornet', 56, 47, 0, this.pageWidth - 170, 50, 1, 'stun'),
            ],
            "map4"
        );
        // 26
        this.createPage(
            "KARATE CROCO",
            "GROUND & RED",
            "VERDANT VINE",
            "THIS CROCODILE USED TO LIVE IN CORAL ABYSS CENTURIES AGO.\n"
            + "LEGENDS SAY AN EARTHQUAKE CAUSED A HUGE TSUNAMI, FLUSHING THE CROCODILE TO THE SHORE OF VERDANT VINE.\nCROCO, IN NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
            + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!",
            [
                this.createImage('karateCrocoIdle', 98.25, 140, 0, this.pageWidth - 150, this.pageHeight - 160, 1, 'red'),
            ],
            "map4"
        );
        // 27
        this.createPage(
            "ZABKOUS",
            "GROUND & NORMAL",
            "VERDANT VINE",
            "JUMPING AND LEAPING AROUND IS WHAT THIS FROG NORMALLY DOES..."
            + "UNTIL HE SEES A TARGET! HE CAN SPIT POISON OUT OF HIS MOUTH, DRAINING ENERGY RAPIDLY!",
            [
                this.createImage('zabkousAttack', 134.0588235294118, 100, 14, this.pageWidth - 200, this.pageHeight - 140, 1),
                this.createImage('poison_spit', 59, 22, 0, this.pageWidth - 260, this.pageHeight - 100, 1, 'poison'),
            ],
            "map4"
        );
        // 28
        this.createPage(
            "SPIDOLAZER",
            "GROUND & NORMAL",
            "VERDANT VINE",
            "SPIDOLAZER IS A BIG SPIDER FOUND IN DENSE, PLANT-RICH AREAS.\n"
            + "IT HAS THE UNIQUE ABILITY TO SHOOT FOCUSED LASERS FROM ITS EYE.\nTHERE IS SPECULATION REGARDING THE ORIGINS OF SPIDOLAZER, AS SOME LOCAL RESIDENTS BELIEVE "
            + "THAT THIS SPIDER IS FROM ANOTHER PLANET DUE TO ITS ALIEN-LIKE CHARACTERISTICS.",
            [
                this.createImage('spidoLazerAttack', 134.45, 120, 13, this.pageWidth - 210, this.pageHeight - 140, 1),
                this.createImage('laser_beam', 300, 28, 0, this.pageWidth - 440, this.pageHeight - 105, 1),
            ],
            "map4"
        );
        // 29
        this.createPage(
            "JERRY",
            "FLY & NORMAL",
            "VERDANT VINE",
            "JERRY LIKES TO GIVE OUT PRESENTS... BUT NOT THE TYPE OF PRESENTS YOU'D EXPECT!\n"
            + "NO ONE KNOWS HOW HE GOT SO MANY SKULNAPS IN HIS BAG!",
            [
                this.createImage('jerry', 185, 103, 4, this.pageWidth - 250, 30, 1),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 170, this.pageHeight - 420, 0.80, 'stun'),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 250, 0.80, 'stun'),
                this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 130, this.pageHeight - 70, 0.80, 'stun'),
                this.createImage('skulnapAwake', 104.23076923076923, 70, 0, this.pageWidth - 280, this.pageHeight - 85, 0.80, 'stun'),
            ],
            "map4"
        );

        // MAP 5 - Springly Lemony
        // 30
        this.createPage(
            "SNAILEY",
            "GROUND & NORMAL",
            "SPRINGLY LEMONY",
            "JUST A REGULAR SNAIL...",
            [
                this.createImage('snailey', 103, 74, 0, this.pageWidth - 230, this.pageHeight - 100, 1),
            ],
            "map5"
        );
        // 31
        this.createPage(
            "REDFLYER",
            "FLY & NORMAL",
            "SPRINGLY LEMONY",
            "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
            + "RAIN EFFECT: SHOOTS LASERS OUT OF ITS EYE!",
            [
                this.createImage('redFlyer', 79.3333333, 65, 0, this.pageWidth - 140, 70, 1),
                this.createImage('darkLaser', 63, 40, 0, this.pageWidth - 200, 92, 1),
            ],
            "map5"
        );
        // 32
        this.createPage(
            "PURPLEFLYER",
            "FLY & NORMAL",
            "SPRINGLY LEMONY",
            "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
            + "RAIN EFFECT: SHOOTS ICE BALLS OUT OF ITS EYE, SLOWING YOU DOWN IF YOU MAKE CONTACT WITH IT!",
            [
                this.createImage('purpleFlyer', 83.33333, 65, 0, this.pageWidth - 140, 70, 1),
                this.createImage('iceBall', 35, 35, 0, this.pageWidth - 180, 100, 1, 'slow'),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 220, 100, 0.05),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 180, 150, 0.05),
                this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 100, 170, 0.05),
            ],
            "map5"
        );
        // 33
        this.createPage(
            "LAZY MOSQUITO",
            "FLY & NORMAL",
            "SPRINGLY LEMONY",
            "JUST A LAZY MOSQUITO...",
            [
                this.createImage('lazyMosquito', 67.23076923076923, 50, 0, this.pageWidth - 160, 70, 1.1),
            ],
            "map5"
        );
        // 34
        this.createPage(
            "LEAF SLUG",
            "GROUND & NORMAL",
            "SPRINGLY LEMONY",
            "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
            + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDING. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET IT FINDS AHEAD!\n",
            [
                this.createImage('leafSlug', 89, 84, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
            ],
            "map5"
        );
        // 35
        this.createPage(
            "SUNFLORA",
            "GROUND & NORMAL",
            "SPRINGLY LEMONY",
            "THIS MASSIVE, UNIQUELY SHAPED FLOWER ABSORBS SUNLIGHT AT AN EXCEPTIONALLY RAPID RATE COMPARED TO ANY OTHER "
            + "FLOWER IN THE VICINITY.\nRAIN EFFECT: WHEN IT RAINS, SUNFLORA HARNESSES THE STORED SOLAR ENERGY AND RELEASES IT IN THE FORM OF POWERFUL YELLOW LASER BEAMS.",
            [
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 210, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 310, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 410, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 510, 1),
                this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 610, 1),
                this.createImage('sunflora', 132, 137, 0, this.pageWidth - 210, this.pageHeight - 150, 1),
            ],
            "map5"
        );
        // 36
        this.createPage(
            "EGGRY",
            "GROUND & NORMAL",
            "SPRINGLY LEMONY",
            "EGGRY IS THE ANGRY EGG THAT NEVER HATCHED.\n"
            + "NO ONE TRULY KNOWS WHAT EGGRY WOULD HATCH INTO OR WHY IT DECIDES TO REMAIN IN ITS SEMI-CRACKED SHELL, BUT LEGENDS SAY IT’S WAITING FOR THE PERFECT STORM TO FINALLY BREAK FREE.\n"
            + "RAIN EFFECT: DUE TO ITS SOFT SHELL, EGGRY JUMPS ANGRILY IN HOPES OF FINDING SHELTER FROM THE RAIN!",
            [
                this.createImage('eggry', 102.6923076923077, 100, 12, this.pageWidth - 180, this.pageHeight - 115, 1),
            ],
            "map5"
        );
        // 37
        this.createPage(
            "TAURO",
            "GROUND & RED",
            "SPRINGLY LEMONY",
            "TAURO IS AN ANGRY CREATURE WHO STOMPS LOUDLY AS HE MOVES FORWARD, KNOCKING EVERYTHING IN HIS PATH DOWN!\n"
            + "LEGENDS SAY HE USED TO LIVE NEAR ACTIVE VOLCANOES, BUT ONCE HIS HABITAT WAS DESTROYED BY THE ERUPTION OF A MASSIVE VOLCANO, HE WAS FORCED TO COME TO SPRINGLY LEMONY.\n"
            + "NOW, HE RESIDES HERE, HIS RAGE FUELED BY THE MEMORY OF HIS LOST HOME AND THE DESTRUCTION CAUSED BY THE ERUPTION!",
            [
                this.createImage('tauro', 151, 132, 0, this.pageWidth - 210, this.pageHeight - 150, 1, 'red'),
            ],
            "map5"
        );
        // 38
        this.createPage(
            "BEE",
            "FLY & STUN",
            "SPRINGLY LEMONY",
            "IN THIS AREA RESIDES THOUNSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
            + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!",
            [
                this.createImage('bee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
            ],
            "map5"
        );
        // 39
        this.createPage(
            "ANGRY BEE",
            "FLY & STUN",
            "SPRINGLY LEMONY",
            "RAIN EFFECT: THESE FASTER, ANGRIER, AND MORE FEROCIOUS BEES ONLY APPEAR DURING THE RAIN, AS REGULAR BEES SEEK COVER!",
            [
                this.createImage('angryBee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
            ],
            "map5"
        );
        // 40
        this.createPage(
            "HANGING SPIDOLAZER",
            "CRAWLER & NORMAL",
            "SPRINGLY LEMONY",
            "HAVE YOU EVER SEEN A SPIDER HANGING ON A WEB SHOOTING LASERS!?\n"
            + "THESE HANGING SPIDER-LASERS ARE THE SAME SPECIES AS THE ONES FOUND ON THE GROUND IN VERDANT VINE, BUT HERE THEY CRAWL FROM TREES BECAUSE THEIR LEGS CAN OVERHEAT ON THE "
            + "HOT GROUND.\nTHE STRONG SUN ALSO GIVES THEM A SLIGHT YELLOW TINT TO THEIR SKIN!",
            [
                this.createImage('blackLine', 3, 485, 0, this.pageWidth - 120, -30, 1),
                this.createImage('hangingSpidoLazer', 123.2333333333333, 110, 17, this.pageWidth - 180, this.pageHeight - 200, 1),
                this.createImage('laser_beam', 170, 28, 0, this.pageWidth - 340, this.pageHeight - 140, 1),
            ],
            "map5"
        );

        // MAP 6 - Venomveil Lake
        // 41
        this.createPage(
            "CACTUS",
            "GROUND & STUN",
            "VENOMVEIL LAKE",
            "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.",
            [
                this.createImage('cactus', 71, 90, 0, this.pageWidth - 180, this.pageHeight - 120, 1, 'stun'),
            ],
            "map6"
        );

        // MAP 7 - Infernal Crater Peak
        // 41
        this.createPage(
            "CACTUS",
            "GROUND & STUN",
            "INFERNAL CRATER PEAK",
            "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.",
            [
                this.createImage('cactus', 71, 90, 0, this.pageWidth - 180, this.pageHeight - 120, 1, 'stun'),
            ],
            "map7"
        );
        // 42
        this.createPage(
            "PETROPLANT",
            "GROUND & NORMAL",
            "INFERNAL CRATER PEAK",
            "PETROPLANTS EMERGED LONG AFTER THE ERUPTION OF THE VOLCANOES.\n"
            + "THIS UNIQUE PLANT CAN ONLY GROW IN THIS AREA, AS IT IS FUELED BY THE MINERALS IN THE GROUND RATHER THAN DEPENDING ON THE SUNS LIGHT.\n"
            + "THEY CAN THROW DANGEROUS ROCKS FROM THEIR MOUTHS WHEN THEY FEEL THREATENED.",
            [
                this.createImage('petroPlant', 91.5555555, 100, 0, this.pageWidth - 180, this.pageHeight - 120, 1),
                this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 240, this.pageHeight - 100, 1, 'stun'),
                this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 430, this.pageHeight - 100, 1, 'stun'),
            ],
            "map7"
        );
        // 43
        this.createPage(
            "PLAZER",
            "GROUND & NORMAL",
            "INFERNAL CRATER PEAK",
            "THIS ODD-LOOKING PLANT CANNOT HELP ITSELF BUT SHOOT A LASER OUT OF ITS EYE WHEN IT BLINKS!\n"
            + "BE CAREFUL NOT TO GET CAUGHT BY THE LASER RAYS!",
            [
                this.createImage('plazer', 75, 89, 2, this.pageWidth - 150, this.pageHeight - 110, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 250, this.pageHeight - 101, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 450, this.pageHeight - 101, 1),
                this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 650, this.pageHeight - 101, 1),
            ],
            "map7"
        );
        // 44
        this.createPage(
            "VEYNOCULUS ",
            "FLY & NORMAL",
            "INFERNAL CRATER PEAK",
            "RUMOURS HAVE SPREAD ACROSS THE LAND OF THIS INFAMOUS SMALL CREATURE.\n"
            + "IT IS BELIEVED THAT BEFORE THE ERUPTION, VEYNOCULUS USED TO LIVE INSIDE ACTIVE VOLCANOS AND FEED OFF MICRO-ORGANISMS AROUND THE CRATERS.\n"
            + "AFTER THE ERUPTION OF THE VOLCANO, IT BECAME TOO AFRAID TO LIVE INSIDE ANYMORE AND STARTED TO ROAM THE SURROUNDING AREA OF INFERNAL CRATER PEAK!",
            [
                this.createImage('veynoculus', 57, 37, 0, this.pageWidth - 140, 70, 1.3),
            ],
            "map7"
        );
        // 45
        this.createPage(
            "VOLCANURTLE",
            "GROUND & RED",
            "INFERNAL CRATER PEAK",
            "JUST A BIG AND SLOW TURTLE THAT ALWAYS MARCHES FORWARD...\n"
            + "THIS TYPE OF TURTLE WILL BE IN HIBERNATION FOR MOST OF THE YEAR, SO IF YOU CATCH SIGHT OF ONE, CONSIDER YOURSELF QUITE LUCKY!",
            [
                this.createImage('volcanurtle', 177, 107, 4, this.pageWidth - 300, this.pageHeight - 120, 1, 'red'),
            ],
            "map7"
        );
        // 46
        this.createPage(
            "THE ROCK",
            "GROUND & RED",
            "INFERNAL CRATER PEAK",
            "THE ROCK FORMED FROM VOLCANIC CRATER MATERIAL AND IS SAID TO POSSESS UNIQUE MINERAL PROPERTIES.\n"
            + "IT IS BELIEVED THAT THE ROCK HOLDS SECRETS OF THE REGION'S VOLCANIC HISTORY AND THAT IT WAS FORMED FROM THE ERUPTION OF MULTIPLE VOLCANOES AROUND THE AREA!",
            [
                this.createImage('theRock', 132, 132, 0, this.pageWidth - 210, this.pageHeight - 140, 1, 'red'),
            ],
            "map7"
        );
        // 47
        this.createPage(
            "VOLCANO WASP",
            "FLY & STUN",
            "INFERNAL CRATER PEAK",
            "IF YOU THOUGHT BEES WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP!\n"
            + "VOLCANO WASPS ARE DEVIOUS MENACES, LOATHING EVERYTHING THAT BREATHES AND STINGING ANY TARGET THEY SPOT!\n"
            + "LITTLE IS KNOWN ABOUT THEM EXCEPT THAT THEY ONCE INHABITED THE LUSH ENVIRONMENT OF VERDANT VINE, BUT SOMETHING FORCED THEM TO MIGRATE TO VOLCANIC AREAS...",
            [
                this.createImage('volcanoWasp', 113, 125, 0, this.pageWidth - 170, 70, 1, 'stun'),
            ],
            "map7"
        );
        // 48
        this.createPage(
            "ROLLHOG",
            "GROUND & NORMAL",
            "INFERNAL CRATER PEAK",
            "ROLLHOGS USED TO LIVE UNDERNEATH THE SOIL OF THIS AREA UNTIL THE BIG ERUPTION OCCURRED.\n"
            + "NOW, THE GROUND HAS BECOME TOO HOT FOR ROLLHOG TO HIDE UNDERNEATH.\nTO SURVIVE, HE HAD TO LEARN AN ATTACK... AND SO HE LEARNED TO ROLL HIMSELF FORWARD, KNOCKING OUT "
            + "ANY ENEMY THAT DARES TO STAND IN HIS WAY!",
            [
                this.createImage('rollhogWalk', 125, 85, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
                this.createImage('rollhogRoll', 97, 92, 0, this.pageWidth - 510, this.pageHeight - 110, 1),
            ],
            "map7"
        );
        // 49
        this.createPage(
            "DRAGON",
            "FLY & NORMAL",
            "INFERNAL CRATER PEAK",
            "IF THERE IS A CREATURE THAT EVERY BEING FEARS IN INFERNAL CRATER PEAK, IT'S THE DRAGON!\n"
            + "ITS IMPOSING WINGS HAVE THE POWER TO WHIP UP FEROCIOUS TORNADOES, RAGING ACROSS THE LAND.\nIT IS BELIEVED THAT THOUSANDS OF YEARS AGO, THE DRAGON'S ROAR CAUSED "
            + "THE VOLCANOES IN THE AREA TO ERUPT DUE TO THE INTENSITY OF THE FREQUENCY VIBRATIONS!",
            [
                this.createImage('dragon', 182, 172, 0, this.pageWidth - 230, 30, 1),
                this.createImage('windAttack', 105, 120, 0, this.pageWidth - 240, 180, 1),
            ],
            "map7"
        );

        // BONUS MAPS 1 - Icebound Cave
        this.createPage(
            "BONUS GOBLITO",
            "GROUND & NORMAL",
            "ICEBOUND CAVE",
            "DUMMY LORE: A STRANGER VERSION OF GOBLITO ROAMS THESE LANDS.\n"
            + "DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.",
            [
                this.createImage('goblinSteal', 60.083, 80, 3, this.pageWidth - 135, this.pageHeight - 120, 1.3),
            ],
            "bonusMap1",
            "bonus"
        );

        // BONUS MAPS 2 - Crimson Fissure
        this.createPage(
            "BONUS CHIQUITA",
            "FLY & NORMAL",
            "CRIMSON FISSURE",
            "DUMMY LORE: DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.\n"
            + "DUIS ALIQUAM EGESTAS IPSUM, EGET ULLAMCORPER TORTOR GRAVIDA POSUERE.",
            [
                this.createImage('chiquita', 118.823529411764, 85, 0, this.pageWidth - 190, 40, 1),
            ],
            "bonusMap2",
            "bonus"
        );

        // BONUS MAPS 3 - Cosmic Rift
        this.createPage(
            "BONUS DOTTER",
            "FLY & NORMAL",
            "COSMIC RIFT",
            "DUMMY LORE: LOREM IPSUM DOLOR SIT AMET, COSMIC ADIPISCING ADIPISCINCINCING COSMIC RIFT. SED MOLESTIE MI TELLUS.\n"
            + "DUIS ALIQUAM COSMIC IPSUM, EGET RIFT ULLAMCORPER TORTOR COSMIC RIFT POSUERE.",
            [
                this.createImage('dotter', 60.083, 80, 0, this.pageWidth - 140, 60, 1.4),
            ],
            "bonusMap3",
            "bonus"
        );

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    update() {
        this.game.audioHandler.menu.stopSound('soundtrack');
    }

    isNightMode() {
        const forestMenu = this.game.menu?.forestMap;
        if (forestMenu && typeof forestMenu.isNightMode === 'function') {
            return forestMenu.isNightMode();
        }

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

    createPage(name, type, foundAt, description, images, mapKey, category = 'main') {
        const unlockFlag = mapKey ? `${mapKey}Unlocked` : null;

        const page = {
            name,
            type,
            foundAt,
            description,
            images,
            unlockFlag,
            category,
        };

        if (category === 'bonus') {
            this.bonusPages.push(page);
        } else {
            this.mainPages.push(page);
        }
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

    getMaxValidIndex() {
        return this.pages.length % 2 === 0
            ? this.pages.length - 2
            : this.pages.length - 1;
    }

    drawPageContent(context, pageIndex, x, y) {
        const page = this.pages[pageIndex];
        if (!page) return;

        context.font = 'bold 21px "Gloria Hallelujah"';
        context.fillStyle = 'black';
        context.textAlign = 'left';

        let locked = false;
        if (page.unlockFlag) {
            locked = !this.game[page.unlockFlag];
        }

        context.save();
        context.beginPath();
        context.rect(x, y, this.pageWidth, this.pageHeight);
        context.clip();

        if (page.images && page.images.length > 0) {
            page.images.forEach(image => {
                if (locked) {
                    context.filter = 'blur(15px)';
                } else {
                    context.filter = 'none';
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
                    if (lineTokens.length > 0) {
                        flushLine();
                    } else {
                        // empty line
                        currentY += lineHeight;
                    }
                    return;
                }

                const textPart = token.type === 'space' ? ' ' : token.text;
                const width = context.measureText(textPart).width;

                // wrap before this word if exceeding maxWidth
                if (token.type === 'word' && lineTokens.length > 0 && lineWidthAccum + width > maxWidth) {
                    flushLine();
                }

                lineTokens.push(token);
                lineWidthAccum += width;
            });

            if (lineTokens.length > 0) {
                flushLine();
            }
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
