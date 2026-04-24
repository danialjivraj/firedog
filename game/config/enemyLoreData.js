import { MAP_DISPLAY_NAMES_UPPER } from './constants.js';

const EVERYWHERE = 'EVERYWHERE';

export function buildPageDefs(pageWidth, pageHeight) {
    const line = (x, y, length, lineWidth = 2) => ({
        kind: 'line', lineX: x, lineY: y, lineLength: length, lineWidth,
    });

    const img = (enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, type, srcY = 0, size = 1) => ({
        kind: 'image', enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, type, srcY, size,
    });

    const coverImg = (imageId, x, y, width, height, options = {}) => ({
        kind: 'coverImage', imageId, x, y, width, height, options,
    });

    return [
        // ── MAP 1 - Lunar Glade ──────────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map1',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map1,
            category: 'main',
            coverImages: [coverImg('map1Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "GOBLITO",
            type: "NORMAL",
            foundAt: EVERYWHERE,
            description:
                "THE GOBLITO SPECIES, ONCE NON-THREATENING, PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
                + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
                + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.",
            images: [img('goblinSteal', 60.083, 80, 3, 'right', 'bottom')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "DOTTER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "IT IS SAID THAT DOTTERS HAVE BEEN AROUND FOR THOUSANDS OF YEARS...\n"
                + "EVEN ON THE BRINK OF EXTINCTION, THEY HAVE ALWAYS MANAGED TO SURVIVE.\n"
                + "THESE LITTLE CREATURES CAN BE FOUND ROAMING AROUND PEACEFULLY WITHIN THE FOREST.",
            images: [img('dotter', 60.083, 80, 0, 'right', 'top')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "MOONSECT",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "NOT MUCH IS KNOWN ABOUT THIS MOON-SHAPED INSECT.\n"
                + "ALL THAT IS KNOWN IS THAT IT LIKES TO FLAP ITS WINGS AND CHASE DOTTERS...",
            images: [img('moonsect', 91.5, 100, 0, 'right', 'top')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "LUNNY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "LEGENDS SAY THE LUNNY WAS ONCE A PIECE OF THE MOON THAT BROKE OFF, FELL TO THE WORLD, AND SOMEHOW GAINED A CONSCIOUSNESS OF ITS OWN.\n"
                + "NOW IT GLIDES THROUGH THE NIGHT, AS IF STILL SEARCHING FOR ITS WAY BACK TO THE SKY.",
            images: [img('lunny', 122, 100, 0, 'right', 'top')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "MEAT SOLDIER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT THE LAND.\n"
                + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
                + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.",
            images: [img('meatSoldier', 67.625, 80, 0, 'right', 'bottom')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "GEARGLE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "A PECULIAR MECHANICAL CREATURE BUILT FROM GEARS, BOLTS, AND A SINGLE OVERSIZED EYE.\n"
                + "NOBODY KNOWS WHO BUILT IT OR WHY, BUT GEARGLE DESCENDS FROM ABOVE IN A WAVY PATTERN, SCANNING EVERYTHING IN ITS PATH.\n"
                + "LEGENDS SAY ITS DESIGN WAS INSPIRED BY VEYNOCULUS, A MYSTERIOUS GALACTICAL CREATURE WHOSE EXISTENCE FEW DARE TO BELIEVE.",
            images: [img('geargle', 64.5, 100, 0, 'right', 'top')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "SKULNAP",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "SKULNAP APPEARED WITHOUT WARNING OR EXPLANATION.\n"
                + "SOME BELIEVE IT WAS THE RESULT OF AN EXPERIMENT CONDUCTED IN A DISTANT LAND, THOUGH NO ONE HAS EVER COME FORWARD TO CLAIM RESPONSIBILITY.\n"
                + "IT CAN BE FOUND SLEEPING ON THE GROUND, PERFECTLY STILL. BUT THE MOMENT YOU STRAY TOO CLOSE, IT STIRS. AND IT IS NOT HAPPY ABOUT BEING WOKEN.",
            images: [img('skulnap', 57, 57, 0, 'right', 'bottom', 'stun')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "ABYSSAW",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "YOU'LL HEAR THEM BEFORE YOU SEE THEM!\n"
                + "THESE LOUD CREATURES SPIN AGGRESSIVELY LIKE A CHAINSAW AS THEY MOVE THROUGH THE TREES OF THE FOREST.\nWATCH OUT, SO YOU DON'T GET CUT!",
            images: [img('abyssaw', 100.44, 100, 0, 'right', 'top')],
            mapKey: "map1",
        },
        {
            kind: 'page',
            name: "GLIDOSPIKE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map1,
            description:
                "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
                + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
                + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDOSPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!",
            images: [img('glidoSpike', 191.68, 130, 0, 'right', 'top')],
            mapKey: "map1",
            projectile: 'normal',
        },

        // ── MAP 2 - Nightfall Phantom Graves ─────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map2',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map2,
            category: 'main',
            coverImages: [coverImg('map2Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "VERTIBAT",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "VERTIBATS ARE KNOWN FOR HIDING ON TOP OF TREES AS THEY WAIT FOR MOVEMENT BELOW.\n"
                + "IT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCIES, WHICH DRAWS THEM TO THIS HAUNTED LAND.\n"
                + "AS SOON AS THEY DETECT MOVEMENT, THEY FALL ONTO THEIR TARGET.",
            images: [img('vertibat', 132.3333333333333, 70, 0, 'right', 'top')],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "DUSK PLANT",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "DORMANT BY DAY, DUSK PLANTS STIR TO LIFE AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH OF UNSUSPECTED PREY.\n"
                + "ANCIENT TALES CLAIM THEY WERE ONCE ORDINARY FLOWERS THAT ABSORBED SO MUCH DARKNESS OVER THE CENTURIES THAT THEY LOST THEIR COLOR ENTIRELY.",
            images: [img('duskPlant', 60, 87, 0, 'right', 'bottom')],
            mapKey: "map2",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "SILKNOIR",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "IT IS BELIEVED THAT SILKNOIRS' PITCH-BLACK APPEARANCE CAME FROM DECADES OF FEEDING ON SHADOW-BORN CREATURES, SLOWLY ABSORBING THEIR DARKNESS UNTIL NO LIGHT REMAINED IN THEM.\n"
                + "THEY DESCEND FROM THE TALLEST TREES AT NIGHT, HUNTING ANYTHING THAT STIRS BELOW.",
            images: [
                line(pageWidth - 110, 0, 315),
                img('silknoir', 120, 144, 0, 'right', 270),
            ],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "WALTER THE GHOST",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "WALTER IS A VERY CURIOUS AND SPOOKY GHOST.\nIF HE SPOTS YOU, HE MIGHT CHASE YOU!",
            images: [img('walterTheGhost', 104.83, 84, 0, 'right', 'top')],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "BEN",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "BEN IS A SMALL CREATURE WHO SEEMS TO APPEAR OUT OF NOWHERE.\nLITTLE IS KNOWN ABOUT HIS BACKSTORY OR PURPOSE, "
                + "EXCEPT THAT HE DROPS FROM ABOVE AND MOVES CURIOUSLY IN YOUR DIRECTION.",
            images: [img('ben', 61.5, 50, 0, 'right', 'top', 'poison')],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "GLOOMLET",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "GLOOMLETS WANDER THE DEPTHS OF THE CEMETERY WITH NO CLEAR PURPOSE, DRIFTING PAST GRAVESTONES AND THROUGH HOLLOW TREES.\n"
                + "THE ONLY THING KNOWN FOR CERTAIN IS THAT EVERY CREATURE IN THE AREA GOES QUIET WHEN ONE PASSES BY.",
            images: [img('gloomlet', 78, 74, 0, 'right', 'top', 'red')],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "SKELLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "SKELLY IS A RESTLESS SKELETON THAT HAS WANDERED THESE GROUNDS FOR CENTURIES.\n"
                + "THOUGH IT MOVES FORWARD AT A STEADY PACE, SKELLY CAN LEAP GREAT DISTANCES WITHOUT WARNING, MAKING IT HARD TO PREDICT WHERE IT WILL LAND NEXT!",
            images: [img('skelly', 57.5, 60, 0, 'right', 'bottom')],
            mapKey: "map2",
        },
        {
            kind: 'page',
            name: "DOLLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map2,
            description:
                "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
                + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.",
            images: [img('dolly', 88.2, 120, 0, 'right', 'top')],
            mapKey: "map2",
            projectile: 'stun',
        },

        // ── MAP 3 - Coral Abyss ──────────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map3',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map3,
            category: 'main',
            coverImages: [coverImg('map3Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "RAZORFIN",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "ONE OF THE MOST COMMON FISH AROUND HERE, AND YET SOMEHOW STILL UNDERESTIMATED.\n"
                + "RAZORFINS ARE QUICK, NIPPY, AND HAVE TEETH SHARP ENOUGH TO PROVE A POINT!",
            images: [img('razorfin', 100, 70, 0, 'right', 'top')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "SKELETON FISH",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "LEGENDS SAY THAT SKELETON FISH WERE ONCE ORDINARY DEEP-SEA CREATURES THAT VENTURED TOO CLOSE TO AN ANCIENT CURSED CURRENT.\n"
                + "THE CURRENT STRIPPED THEM OF THEIR FLESH AND SIGHT, LEAVING ONLY BONE BEHIND.\n"
                + "YET SOMEHOW, THEY STILL SWIM AND STILL HUNT, SENSING EVERY MOVEMENT WITH SOMETHING FAR OLDER THAN EYES.",
            images: [img('skeletonFish', 55, 39, 0, 'right', 'top')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "SPEAR FISH",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "ONCE A WARRIOR OF A LOST UNDERWATER KINGDOM, THIS FISH MASTERED ITS SKILLS IN ANCIENT DUELS.\n"
                + "NOW IT WIELDS ITS SPEAR WITH PRECISION, CHARGING ANY WHO ENTER ITS DOMAIN.",
            images: [img('spearFish', 91.875, 110, 0, 'right', 'bottom', 'red')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "JET FISH",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "IS IT A JET? IS IT A FISH? NO, IT'S BOTH!\n"
                + "JET FISH BLENDS THE SPEED OF A JET WITH THE SWIFT MOVES OF A FISH, GLIDING THROUGH THE WATERS OF CORAL ABYSS AT SUPERSONIC SPEED!",
            images: [img('jetFish', 124.5, 75, 0, 'right', 'top')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "PIPER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "PIPER SEEMS LIKE A HARMLESS ENEMY AT FIRST...\n"
                + "BUT GET TOO CLOSE, AND SHE'LL UNVEIL HER TRUE FORM, EXPANDING TO FIVE TIMES HER ORIGINAL SIZE!",
            images: [img('piper', 87, 67, 0, 'right', 'bottom')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "JELLION",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "DRIFTING THROUGH THE DEPTHS IN LONG, HYPNOTIC WAVES, JELLION IS A CREATURE OF PURE RHYTHM.\n"
                + "DON'T BE FOOLED BY ITS GRACEFUL MOVEMENT. ITS UNDULATING PATH MAKES IT SURPRISINGLY HARD TO AVOID!",
            images: [img('jellion', 98.5, 120, 0, 'right', 'top')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "VOLTZEEL",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
                + "IT IS RUMORED THAT ITS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.",
            images: [img('voltzeel', 81, 100, 4, 'right', 'top', 'stun')],
            mapKey: "map3",
        },
        {
            kind: 'page',
            name: "GARRY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map3,
            description:
                "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
                + "TAKES A WHILE TO FADE AWAY!",
            images: [
                img('paint_splatter_8', 1994, 995, 0, -130, 175, null, 0, 0.5),
                img('garry', 165, 122, 0, 'right', 'bottom'),
            ],
            mapKey: "map3",
            projectile: 'normal',
        },

        // ── MAP 4 - Verdant Vine ─────────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map4',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map4,
            category: 'main',
            coverImages: [coverImg('map4Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "BIG GREENER",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "THE OXYGEN LEVELS HERE ARE TWICE AS HIGH AS ANYWHERE ELSE, AND BIG GREENERS ARE LIVING PROOF.\n"
                + "CENTURIES OF THRIVING IN ALL THAT ABUNDANT AIR GAVE THEM THEIR ENORMOUS SIZE.",
            images: [img('bigGreener', 113, 150, 0, 'right', 'bottom', 'poison')],
            mapKey: "map4",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "CHIQUITA",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n"
                + "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n"
                + "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.",
            images: [img('chiquita', 95.05882352941176, 68, 0, 'right', 'top')],
            mapKey: "map4",
        },
        {
            kind: 'page',
            name: "FOFINHA",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "FOFINHA BELONGS TO THE SAME SPECIES AS CHIQUITA, BUT WITH A FAR MORE FIERY TEMPER.\n"
                + "HIS FLIGHTS ARE QUICKER AND LESS GRACEFUL, OFTEN DARTING THROUGH THE SKY WITH SUDDEN BURSTS OF SPEED.\n"
                + "HE MAY LOOK JUST AS CHARMING, BUT GET TOO CLOSE AND YOU'LL SEE HE'S NOT AS GENTLE AS HIS COUNTERPART!",
            images: [img('fofinha', 118.823529411764, 85, 0, 'right', 'top')],
            mapKey: "map4",
        },
        {
            kind: 'page',
            name: "SLUGGIE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW THAT "
                + "IF YOU STEP TOO CLOSE TO HIM!",
            images: [
                img('paint_splatter_4', 1994, 995, 0, -170, 30, null, 0, 0.9),
                img('sluggie', 147.33, 110, 0, 'right', 'bottom'),
            ],
            mapKey: "map4",
        },
        {
            kind: 'page',
            name: "LIL HORNET",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "DON'T LET THE NAME FOOL YOU.\n"
                + "THE LIL HORNET CARRIES ONE OF THE MOST FEARED HORNS AROUND, SAID TO HAVE EVOLVED OVER THOUSANDS OF YEARS AS A RESPONSE TO MUCH LARGER PREDATORS.\n"
                + "IT NOW WEARS THAT HORN WITH IMMENSE PRIDE. EVEN THE BIGGEST CREATURES KEEP THEIR DISTANCE.",
            images: [img('lilHornet', 56, 47, 0, 'right', 'top', 'stun')],
            mapKey: "map4",
        },
        {
            kind: 'page',
            name: "JERRY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "JERRY IS A MYSTERIOUS AIRBORNE FIGURE WHO DRIFTS LAZILY ABOVE THE TREETOPS.\n"
                + "HE HAS A LONG-STANDING REPUTATION FOR DROPPING UNWELCOME SURPRISES ON ANYONE WHO PASSES BELOW.\n"
                + "WHERE HE CAME FROM AND WHY HE DOES IT REMAINS A COMPLETE MYSTERY.",
            images: [img('jerry', 185, 103, 4, 'right', 'top')],
            mapKey: "map4",
            projectile: 'stun',
        },
        {
            kind: 'page',
            name: "BRAMBLE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "BRAMBLE IS A LARGE SPIDER FOUND DEEP WITHIN THE DENSE, OVERGROWN PARTS OF THE FOREST.\n"
                + "IT IS BELIEVED THAT GENERATIONS OF FEEDING ON THE ANCIENT TREES CAUSED ITS SKIN TO GRADUALLY HARDEN INTO WOOD, MAKING IT AS MUCH PLANT AS CREATURE.",
            images: [
                line(pageWidth - 110, -30, 150),
                img('bramble', 174.2, 140, 0, 'right', pageHeight - 450),
            ],
            mapKey: "map4",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "KARATE CROCO",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "ONCE FROM CORAL ABYSS, THIS CROCODILE WAS SWEPT TO VERDANT VINE BY A GREAT TSUNAMI.\n"
                + "CROCO, IN A NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
                + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!",
            images: [img('karateCroco', 98.25, 140, 0, 'right', 'bottom', 'red')],
            mapKey: "map4",
        },
        {
            kind: 'page',
            name: "VINELASH",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map4,
            description:
                "VINELASH SLEEPS BENEATH THE SOIL, PATIENT AND STILL.\n"
                + "IT IS BELIEVED TO BE AN ANCIENT MASS OF VINES AND WOOD THAT GREW TOGETHER OVER CENTURIES UNTIL IT DEVELOPED A WILL OF ITS OWN.\n"
                + "WHEN SOMETHING WANDERS CLOSE ENOUGH, IT ERUPTS FROM THE GROUND IN A SUDDEN AND VIOLENT BURST.",
            images: [img('vinelash', 221, 200, 0, 'right', 'bottom', 'poison', 0, 0.9)],
            mapKey: "map4",
        },

        // ── MAP 5 - Springly Lemony ──────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map5',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map5,
            category: 'main',
            coverImages: [coverImg('map5Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "SNAILEY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "SLOW AS IT MAY BE, SNAILEY HAS OUTLASTED COUNTLESS FASTER CREATURES BY SIMPLY NEVER STOPPING.\n"
                + "IF YOU SEE ONE, IT HAS PROBABLY BEEN WATCHING YOU FAR LONGER THAN YOU THINK.",
            images: [img('snailey', 103, 74, 0, 'right', 'bottom')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "CITRIFLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "NOBODY KNOWS HOW A FLY ENDS UP LOOKING EXACTLY LIKE A LEMON.\n"
                + "THE CITRIFLY CERTAINLY DOESN'T. IT JUST FLIES AROUND, COMPLETELY UNBOTHERED.\n\n"
                + "RAIN EFFECT: THE CITRIFLY FIRES DARK LASER BOLTS, AIMING DIRECTLY AT ITS TARGET.",
            images: [img('citrifly', 80.5, 90, 0, 'right', 'top')],
            mapKey: "map5",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "BERRIFLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "CENTURIES OF NESTING IN BLUEBERRY BUSHES AND FEEDING ON NOTHING BUT THE FRUIT HAVE CHANGED THOSE ONCE-REGULAR FLIES FOREVER.\n"
                + "NOW THEY ARE PRACTICALLY INDISTINGUISHABLE FROM THE BERRIES THEMSELVES.\n\n"
                + "RAIN EFFECT: THE BERRIFLY HURLS ICE BALLS THAT SLOW ANYTHING THEY HIT.",
            images: [img('berrifly', 84, 75, 0, 'right', 'top')],
            mapKey: "map5",
            projectile: 'slow',
        },
        {
            kind: 'page',
            name: "LAZY MOSQUITO",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description: "RAINING OR NOT, LAZY MOSQUITO WON'T CHASE YOU. IT'S TOO MUCH EFFORT...",
            images: [img('lazyMosquito', 67.23076923076923, 50, 0, 'right', 'top')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "LEAF SLUG",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
                + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDINGS. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET THEY FINDS AHEAD!\n",
            images: [img('leafSlug', 89, 84, 0, 'right', 'bottom')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "SUNFLORA",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "THIS MASSIVE, UNIQUELY SHAPED FLOWER ABSORBS SUNLIGHT AT AN EXCEPTIONALLY RAPID RATE COMPARED TO ANY OTHER "
                + "FLOWER IN THE VICINITY.\n\nRAIN EFFECT: WHEN IT RAINS, SUNFLORA HARNESSES THE STORED SOLAR ENERGY AND RELEASES IT IN THE FORM OF POWERFUL YELLOW LASER BEAMS.",
            images: [img('sunflora', 132, 137, 0, 'right', 'bottom')],
            mapKey: "map5",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "EGGRY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "EGGRY IS THE ANGRY EGG THAT NEVER HATCHED.\n"
                + "NO ONE TRULY KNOWS WHAT EGGRY WOULD HATCH INTO OR WHY IT DECIDES TO REMAIN IN ITS SEMI-CRACKED SHELL, BUT LEGENDS SAY IT'S WAITING FOR THE PERFECT STORM TO FINALLY BREAK FREE.\n\n"
                + "RAIN EFFECT: DUE TO ITS SOFT SHELL, EGGRY JUMPS ANGRILY IN HOPES OF FINDING SHELTER FROM THE RAIN!",
            images: [img('eggry', 102.6923076923077, 100, 12, 'right', 'bottom')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "BEE",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "IN THIS AREA RESIDES THOUSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
                + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!",
            images: [img('bee', 55.23, 57, 0, 'right', 'top', 'stun')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "ANGRY BEE",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "RAIN EFFECT: THESE FASTER, ANGRIER, AND MORE FEROCIOUS BEES ONLY APPEAR DURING THE RAIN, AS REGULAR BEES SEEK COVER!",
            images: [img('angryBee', 55.23, 57, 0, 'right', 'top', 'stun')],
            mapKey: "map5",
        },
        {
            kind: 'page',
            name: "STRAWSPIDER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map5,
            description:
                "AFTER GENERATIONS AMONG STRAWBERRY PATCHES, STRAWSPIDER'S BODY MIRRORED ITS SURROUNDINGS.\n"
                + "IT HANGS PERFECTLY STILL, WAITING WITH A PATIENCE THAT FEELS ALMOST PERSONAL.\n\n"
                + "RAIN EFFECT: THE RAIN AWAKENS SOMETHING IN THE STRAWSPIDER. IT BEGINS DESCENDING TOWARD ITS PREY, DRIVEN BY INSTINCT ALONE.",
            images: [
                line(pageWidth - 110, -30, 190),
                img('strawspider', 93.83333333333333, 110, 0, 'right', pageHeight - 400),
            ],
            mapKey: "map5",
        },

        // ── MAP 6 - Venomveil Lake ───────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map6',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map6,
            category: 'main',
            coverImages: [coverImg('map6Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "LARVOX",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "LARVOX MOVES ACROSS THE GROUND AT A SLOW, DELIBERATE PACE, DECEPTIVELY STURDY FOR ITS SIZE.\n"
                + "IT IS BELIEVED TO BE IN A PERMANENT STATE OF METAMORPHOSIS, NEVER QUITE BECOMING WHATEVER IT IS SUPPOSED TO BE.\n"
                + "TRAVELERS HAVE WATCHED IT FOR YEARS AND ARE NO CLOSER TO AN ANSWER.",
            images: [img('larvox', 114.75, 70, 0, 'right', 'bottom')],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "VENFLORA",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "VENFLORA IS A CARNIVOROUS PLANT ROOTED DEEP IN THE TOXIC SOIL.\n"
                + "THOSE WHO HAVE STUDIED IT FROM A SAFE DISTANCE BELIEVE IT IS ONE OF THE OLDEST KNOWN PLANT SPECIES IN THE REGION.",
            images: [img('venflora', 98.28571428571429, 150, 0, 'right', 'bottom')],
            mapKey: "map6",
            projectile: 'red',
        },
        {
            kind: 'page',
            name: "VENARACH",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "VENARACH MAKES ITS HOME IN THE DEAD TREES OF THE LAKE, BLENDING INTO THE ROTTING BARK AS IF IT WERE PART OF THE WOOD ITSELF.\n"
                + "IT DESCENDS SLOWLY ON A THREAD OF SILK, SWAYING WITH THE STILLNESS OF SOMETHING THAT HAS NEVER NEEDED TO RUSH.\n"
                + "THOSE WHO HAVE FELT ITS VENOM DESCRIBE A SLOW, CREEPING SENSATION, MUCH LIKE THE WAY IT HUNTS.",
            images: [
                line(pageWidth - 110, -30, 195),
                img('venarach', 124.25, 150, 0, 'right', pageHeight - 400, 'poison'),
            ],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "VENOBLITZ",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "VENOBLITZ IS SAID TO BE THE FASTEST CREATURE IN THE AREA.\n"
                + "IT IS BELIEVED THAT IT DEVELOPED ITS EXTREME SPEED AS AN EVOLUTIONARY RESPONSE TO THE TOXIC GROUND THAT LINES THE LAKE.\n"
                + "THE LESS TIME SPENT TOUCHING THE SURFACE, THE LESS VENOM ABSORBED, AND SO VENOBLITZ SIMPLY NEVER SLOWS DOWN.",
            images: [img('venoblitz', 133.5, 100, 0, 'right', 'bottom', 'poison')],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "VIREFLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "THE VIREFLY HAS SPENT ITS ENTIRE LIFE FEEDING ON TOXIC FUMES THAT RISE FROM THE LAKE SURFACE.\n"
                + "THE CONSTANT EXPOSURE TO POISON HAS LEFT IT IN A PERMANENT STATE OF DIZZINESS, CAUSING IT TO DRIFT THROUGH THE AIR IN AN ERRATIC, SWAYING PATH.\n"
                + "THOSE WHO ENCOUNTER IT OFTEN FIND ITS UNPREDICTABLE MOVEMENT FAR HARDER TO AVOID THAN ANYTHING MORE DELIBERATE.",
            images: [img('virefly', 100, 120, 0, 'right', 'top')],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "TOXWING",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "TOXWING DESCENDS FROM ABOVE IN AN UNPREDICTABLE SIDE-TO-SIDE WEAVE.\n"
                + "ITS ERRATIC PATH MAKES IT HARD TO ANTICIPATE WHERE IT WILL END UP.",
            images: [img('toxwing', 127, 105, 0, 'right', 'top')],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "WOXIN",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "WOXIN IS A VENOMOUS WASP THAT LOCKS ONTO ITS TARGET AND DIVES IN AT HIGH SPEED.\n"
                + "A SINGLE STING IS ENOUGH TO POISON YOU, AND IT RARELY MISSES.",
            images: [img('woxin', 79, 85, 0, 'right', 'top', 'poison')],
            mapKey: "map6",
        },
        {
            kind: 'page',
            name: "TOXHOP",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "LEGENDS SAY TOXHOP HAS BATHED IN THE POISONED WATERS FOR SO LONG THAT ITS VERY SALIVA BECAME VENOMOUS, CAPABLE OF DRAINING THE STRENGTH OF ANYTHING IT HITS.\n",
            images: [img('toxhop', 134.0588235294118, 100, 2, 'right', 'bottom', null, 150)],
            mapKey: "map6",
            projectile: 'poison',
        },
        {
            kind: 'page',
            name: "MYCORA",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map6,
            description:
                "MOST FUNGI IN THE AREA HAVE TURNED GREEN FROM ABSORBING THE TOXIC POISON AROUND THEM.\n"
                + "MYCORA IS DIFFERENT. CENTURIES OF EXPOSURE MUTATED IT INTO SOMETHING LARGER AND STRANGER THAN ANY MUSHROOM HAS A RIGHT TO BE, TURNING IT A DEEP, UNNATURAL SHADE OF PURPLE.\n"
                + "WHY MYCORA TURNED OUT SO DIFFERENTLY FROM EVERY OTHER MUSHROOM IN THE AREA REMAINS A MYSTERY TO THIS DAY.",
            images: [img('mycora', 165.125, 200, 1, 'right', 'bottom', 'red')],
            mapKey: "map6",
            projectile: 'poison',
        },

        // ── MAP 7 - Infernal Crater Peak ─────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'map7',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.Map7,
            category: 'main',
            coverImages: [coverImg('map7Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "EMBER FLY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "THE EMBER FLY HAS ADAPTED TO THE VOLCANIC HEAT LIKE NO OTHER CREATURE.\n"
                + "ITS WINGS ARE LINED WITH A HEAT-RESISTANT COATING THAT LETS IT SOAR THROUGH THE SMOKE WITH EASE.\n"
                + "IT DRIFTS THROUGH THE SCORCHING AIR ABOVE THE CRATERS, INDIFFERENT TO THE WORLD BELOW.",
            images: [img('emberFly', 85.5, 100, 0, 'right', 'top')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "SCORBLE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "THESE BEETLES ARE COVERED IN A THICK VOLCANIC SHELL THAT PROTECTS THEM FROM THE INTENSE HEAT.\n"
                + "WHAT THEY LACK IN INTELLIGENCE, THEY MORE THAN MAKE UP FOR IN SHEER SPEED, CHARGING FORWARD WITHOUT HESITATION!",
            images: [img('scorble', 90.25, 60, 0, 'right', 'bottom')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "BLAZICE",
            type: "FROZEN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "BLAZICE IS A RARE FROZEN CREATURE ENCASED IN VOLCANIC ROCK, AS IF FIRE AND ICE WERE FORCED TO EXIST IN THE SAME BODY.\n"
                + "DESPITE THE SCORCHING HEAT OF INFERNAL CRATER PEAK, ITS ICY CORE NEVER MELTS.",
            images: [img('blazice', 103, 90, 1, 'right', 'bottom', 'frozen')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "CACTRIX",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "MOST CACTI ARE CONTENT TO STAND IN PLACE FOR CENTURIES. CACTRIX NEVER GOT THAT MEMO.\n"
                + "IT IS BELIEVED THAT THE INTENSE HEAT OF THE VOLCANIC SOIL SEEPED INTO ITS ROOTS OVER GENERATIONS, GIVING IT AN ENERGY IT SIMPLY CANNOT CONTAIN.\n"
                + "IT CHARGES FORWARD WITH RECKLESS SPEED, AND ITS VIBRANT FORM MAKES IT EASY TO SPOT. JUST NOT ALWAYS EASY TO AVOID.",
            images: [img('cactrix', 115.3, 130, 0, 'right', 'bottom', 'stun')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "MAGMAPOD",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "MAGMAPOD EMERGED FROM THE DEPTHS OF A DORMANT VOLCANIC VENT LONG BEFORE THIS PLACE WAS EVER EXPLORED.\n"
                + "OVER MILLENNIA, IT FUSED WITH THE SURROUNDING ROCK, ROOTING ITSELF TO THE VOLCANIC SOIL AND FEEDING ON THE GEOTHERMAL HEAT BELOW.\n"
                + "THE SUPERHEATED LIQUID THAT BUILDS INSIDE IT EVENTUALLY FORCES ITS WAY TO THE SURFACE IN VOLATILE BUBBLES.",
            images: [img('magmapod', 167, 130, 0, 'right', 'bottom', 'red')],
            mapKey: "map7",
            projectile: 'red',
        },
        {
            kind: 'page',
            name: "VOLCANURTLE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "THE VOLCANURTLE HAS SURVIVED EVERY ERUPTION THIS VOLCANO HAS EVER PRODUCED.\n"
                + "CENTURIES OF ERUPTIONS CRACKED ITS SHELL OVER AND OVER, UNTIL LAVA SEEPED INTO EVERY FISSURE AND HARDENED THERE, FUSING WITH IT PERMANENTLY.\n"
                + "DESPITE THIS, IT KEEPS ON GOING, SLOWLY BUT RELENTLESSLY, UNBOTHERED BY THE SCORCHING HEAT.",
            images: [img('volcanurtle', 152.25, 100, 4, 'right', 'bottom')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "BLOBURN",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "BLOBURNS FORM DEEP INSIDE ACTIVE VOLCANOES, BUBBLING TOGETHER FROM HEAT AND PRESSURE UNTIL AN ERUPTION LAUNCHES THEM INTO THE AIR.\n"
                + "THEY NEVER ASKED FOR THIS. THEY SIMPLY END UP HERE, DRIFTING AND SPINNING THROUGH THE TERRAIN.\n"
                + "SOMEWHERE ALONG THE WAY, THEY DECIDED THAT CHASING THINGS WAS A PERFECTLY GOOD USE OF THEIR TIME.",
            images: [img('bloburn', 52, 50, 0, 'right', 'top', 'poison')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "VOLCANO WASP",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "IF YOU THOUGHT REGULAR WASPS WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP.\n"
                + "ONCE NATIVE TO THE SUNNY FIELDS OF SPRINGLY LEMONY, SOMETHING DROVE THEM TO MIGRATE DEEP INTO VOLCANIC TERRITORY.\n"
                + "THE EXTREME HEAT ONLY SHARPENED THEIR AGGRESSION, AS THEY STING ANYTHING THAT CROSSES THEIR PATH WITHOUT HESITATION.",
            images: [img('volcanoWasp', 93, 90, 0, 'right', 'top', 'stun')],
            mapKey: "map7",
        },
        {
            kind: 'page',
            name: "SCORVEX",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "SCORVEX HAS NOT MOVED FROM ITS SPOT FOR WHAT IS BELIEVED TO BE CENTURIES, YET IT SHOWS NO SIGNS OF IMPATIENCE.\n"
                + "IT SITS WITH ITS VENOMOUS TAIL COILED AND READY, CONTENT TO LET EVERYTHING ELSE COME TO IT.\n"
                + "THE VOLCANIC HEAT KEEPS ITS VENOM POTENT AND ITS PATIENCE ENDLESS.",
            images: [img('scorvex', 161, 150, 0, 'right', 'bottom')],
            mapKey: "map7",
            projectile: 'poison',
        },
        {
            kind: 'page',
            name: "LAVARYN",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.Map7,
            description:
                "LAVARYN IS AN ANCIENT VOLCANIC BEAST THAT HAS LIVED BENEATH THE SURFACE FOR THOUSANDS OF YEARS.\n"
                + "IT SLEEPS DEEP IN THE MOLTEN ROCK, RISING ONLY WHEN IT SENSES SOMETHING MOVING ABOVE.\n"
                + "THOSE WHO HAVE SURVIVED AN ENCOUNTER DESCRIBE IT AS PART BEAST, PART ERUPTION.",
            images: [img('lavaryn', 176.5, 160, 1, 'right', 'bottom')],
            mapKey: "map7",
            projectile: 'normal',
        },

        // ── BONUS MAP 1 - Icebound Cave ──────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'bonusMap1',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            category: 'bonus',
            coverImages: [coverImg('bonusMap1Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "ICE PLANT",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "THE ICE PLANT WAS NOT ALWAYS COVERED IN ICE.\n"
                + "CENTURIES OF ABSORBING THE CAVE'S COLD ENERGY SLOWLY COATED IT IN FROST, UNTIL THE ICE GREW SO THICK IT BECAME IMPOSSIBLE TO TELL WHERE THE PLANT ENDS AND THE ICE BEGINS.",
            images: [img('icePlant', 78.42857142857143, 115, 0, 'right', 'bottom')],
            mapKey: "bonusMap1",
            category: "bonus",
            projectile: 'slow',
        },
        {
            kind: 'page',
            name: "CRYOPEDE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "THIS ELONGATED CREATURE SCUTTLES ACROSS THE ICY CAVE FLOOR WITH SURPRISING STEADINESS.\n"
                + "ITS MANY LEGS GIVE IT PERFECT GRIP ON THE SLIPPERY ICE, MOVING WITH A PERSISTENCE THAT IS HARD TO SHAKE OFF.",
            images: [img('cryopede', 126, 80, 0, 'right', 'bottom')],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "ICE SILKNOIR",
            type: "SLOW",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "IT IS BELIEVED THAT A GROUP OF SILKNOIRS WANDERED TOO FAR FROM NIGHTFALL PHANTOM GRAVES AND BECAME TRAPPED IN ICEBOUND CAVE.\n"
                + "OVER GENERATIONS, THE RELENTLESS COLD BLEACHED THEIR DARKNESS AWAY AND COATED THEM IN FROST, TURNING THEM INTO SOMETHING ENTIRELY NEW.\n"
                + "THEY STILL DESCEND SILENTLY FROM ABOVE, SWAYING AS THEY WAIT. OLD HABITS DIE HARD.",
            images: [
                line(pageWidth - 110, 0, 315),
                img('iceSilknoir', 120, 144, 0, 'right', 270, 'slow'),
            ],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "FROSTLING",
            type: "SLOW",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "FROSTLINGS HANG SILENTLY FROM THE CAVE CEILING, BLENDING IN WITH THE ICE.\n"
                + "THEY SUDDENLY BREAK AWAY AND DROP WITHOUT WARNING.\n"
                + "WHAT LOOKS LIKE A SIMPLE ICICLE MAY NOT BE SO PASSIVE AFTER ALL.",
            images: [img('frostling', 46.5, 100, 0, 'right', 'top', 'slow')],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "FROBAT",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "FROBATS ARE BELIEVED TO HAVE ONCE BEEN ORDINARY CAVE BATS BEFORE THE TEMPERATURES IN ICEBOUND CAVE DROPPED TO LEVELS THAT SHOULD HAVE KILLED THEM.\n"
                + "INSTEAD, THEY ADAPTED. THEIR WINGS HARDENED WITH FROST, THEIR BODIES GREW RESISTANT TO THE COLD, AND THEY KEPT FLYING.\n"
                + "SOME SAY THE FROST ON THEIR WINGS HAS NOT MELTED IN THOUSANDS OF YEARS.",
            images: [img('frobat', 156.75, 130, 0, 'right', 'top')],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "CRYSTAL WASP",
            type: "FROZEN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "THE CRYSTAL WASP IS ONE OF THE MORE AGGRESSIVE CREATURES IN THE CAVE, LOCKING ONTO ANYTHING THAT MOVES WITH FIERCE DETERMINATION.\n"
                + "THE COLD, HOWEVER, HAS TAKEN ITS TOLL. ITS CRYSTALLINE WINGS ARE HEAVY WITH FROST, AND EVERY FLAP IS A STRUGGLE.\n"
                + "IT WILL REACH YOU EVENTUALLY. IT JUST TAKES A WHILE.",
            images: [img('crystalWasp', 111.8333333333333, 110, 0, 'right', 'top', 'frozen')],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "GLOBBY",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "NOBODY IS QUITE SURE HOW GLOBBY CAME TO EXIST. THE LEADING THEORY IS THAT A CHUNK OF ICE SIMPLY ROLLED AROUND THE CAVE FOR LONG ENOUGH THAT IT DEVELOPED A PERSONALITY!",
            images: [img('globby', 115, 110, 0, 'right', 'bottom')],
            mapKey: "bonusMap1",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "DRILLICE",
            type: "SLOW",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap1,
            description:
                "IT IS BELIEVED THAT DRILLICE FORMED FROM ICE THAT SPUN INSIDE THE CAVE'S UNDERGROUND CURRENTS FOR SO LONG THAT IT HARDENED INTO A LIVING, SPIRALING CREATURE.\n"
                + "IT LIES DORMANT BENEATH THE SURFACE UNTIL IT SENSES MOVEMENT ABOVE, THEN DRILLS UPWARD AND BURSTS THROUGH THE ICE.",
            images: [img('drillice', 197, 115, 0, 'right', 'bottom', 'slow')],
            mapKey: "bonusMap1",
            category: "bonus",
        },

        // ── BONUS MAP 2 - Crimson Fissure ────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'bonusMap2',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            category: 'bonus',
            coverImages: [coverImg('bonusMap2Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "SIGILFLY",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "THE SIGILFLY WAS ONCE A PERFECTLY ORDINARY FLY, WANDERING THROUGH THE FISSURE WITH NO PARTICULAR AGENDA.\n"
                + "UNFORTUNATELY, IT HAPPENED TO BE IN EXACTLY THE WRONG SPOT WHEN PART OF AN ANCIENT SEAL BEGAN TO CRACK, RELEASING A BURST OF ENERGY THAT HIT THE FLY DIRECTLY.\n"
                + "WHAT EMERGED WAS NO LONGER ORDINARY.",
            images: [img('sigilfly', 128, 100, 0, 'right', 'top', 'red')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "OOZEL",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "OOZELS APPEAR FROM ABOVE, FALLING FROM THE SKIES BEFORE QUICKLY SCUTTLING TOWARD ANY PREY THEY DETECT ON THE GROUND.\n"
                + "THEY SEEM TO MATERIALIZE OUT OF THIN AIR, DROPPING WITHOUT WARNING AS IF THEY APPEARED FROM NOWHERE.",
            images: [img('oozel', 124, 50, 0, 'right', 'bottom')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "MAWRUNE",
            type: "FROZEN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "MAWRUNE GROWS IN SOIL WHERE NOTHING ELSE DOES, SUSTAINED ENTIRELY BY THE ENERGY THAT SEEPS UPWARD FROM THE ANCIENT SEALS BURIED BENEATH IT.\n"
                + "THAT ENERGY, HOWEVER, RUNS AT SUBZERO TEMPERATURES, AND CENTURIES OF ABSORBING IT HAVE LEFT PALE BLUE MARKINGS ACROSS ITS BODY, A PERMANENT SIGN OF THE FREEZING POWER THAT KEEPS IT ALIVE.",
            images: [img('mawrune', 108.5, 120, 0, 'right', 'bottom', 'frozen')],
            mapKey: "bonusMap2",
            category: "bonus",
            projectile: 'stun',
        },
        {
            kind: 'page',
            name: "RUNESPIDER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "THE RUNESPIDER IS SMALL, FAST, AND DEEPLY COMMITTED TO BEING IN YOUR WAY.\n"
                + "IT SKITTERS THROUGH THE FISSURE WITH THE ENERGY OF SOMETHING THAT HAS SOMEWHERE VERY IMPORTANT TO BE, EVEN THOUGH IT CLEARLY DOES NOT.",
            images: [img('runespider', 98.66666666666667, 70, 0, 'right', 'bottom')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "RUNECKO",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "THE RUNECKO LURKS IN THE SHADOWS OF THE FISSURE, WAITING PATIENTLY BEFORE LAUNCHING ITSELF AT ITS TARGET.\n"
                + "WHEN IT SPOTS PREY, IT LEAPS THROUGH THE AIR WITH ALL ITS MIGHT!",
            images: [img('runecko', 124.5, 80, 0, 'right', 'bottom')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "SIGILASH",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "SIGILASH IS A LIGHTWEIGHT FLY THAT PLUMMETS FROM THE SKY AT HIGH SPEED.\n"
                + "UNLIKE THE SIGILFLY, SIGILASH WAS NOT AN ACCIDENT. IT CARRIES A MORE VOLATILE STRAIN OF THE SEAL'S ENERGY AND MOVES WITH AN AGGRESSION THAT FEELS ENTIRELY DELIBERATE.",
            images: [img('sigilash', 99, 100, 0, 'right', 'top', 'stun')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "GOLEX",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "GOLEX IS A DENSE ROCK FORMATION THAT CAME TO LIFE AS THE ANCIENT SEAL WITHIN CRIMSON FISSURE BEGAN TO CRACK, ITS ENERGY SEEPING INTO THE SURROUNDING STONE.\n"
                + "WHAT WAS ONCE AN ORDINARY CHUNK OF ROCK NOW MOVES WITH AN ERRATIC, UNPREDICTABLE WILL OF ITS OWN.",
            images: [img('golex', 152, 140, 0, 'right', 'bottom', 'red')],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "VOIDSERP",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "VOIDSERP IS A BIG SERPENT THAT ROAMS THE FISSURE FLOOR WITH A SINGLE GLOWING EYE.\n"
                + "NOBODY KNOWS WHAT HAPPENED TO THE OTHER ONE. NOBODY HAS BEEN CLOSE ENOUGH TO ASK.",
            images: [img('voidserp', 217, 100, 0, 'right', 'bottom', null, 0, 0.9)],
            mapKey: "bonusMap2",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "WARDRAKE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap2,
            description:
                "LEGENDS SAY THAT A GROUP OF ANCIENT SORCERERS BOUND WARDRAKES TO CRIMSON FISSURE LONG AGO, TASKING THEM WITH GUARDING THE ANCIENT SEALS FOUND WITHIN IT.\n"
                + "WHAT THOSE SORCERERS KNEW ABOUT THE SEALS, AND WHY THEY FELT THEY NEEDED PROTECTING, HAS BEEN LOST TO TIME.\n"
                + "THE WARDRAKES, HOWEVER, HAVE NOT FORGOTTEN THEIR PURPOSE.",
            images: [img('wardrake', 182, 172, 0, 'right', 'top')],
            mapKey: "bonusMap2",
            category: "bonus",
            projectile: 'red',
        },

        // ── BONUS MAP 3 - Cosmic Rift ────────────────────────────────────
        {
            kind: 'cover',
            mapKey: 'bonusMap3',
            coverTitle: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            category: 'bonus',
            coverImages: [coverImg('bonusMap3Cover', 0, 0, pageWidth, pageHeight, { alpha: 1 })],
        },
        {
            kind: 'page',
            name: "NEBULURE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "NEBULURE IS NATIVE TO THE COSMIC RIFT, A CREATURE THAT HAS NEVER KNOWN ANY WORLD OTHER THAN THIS ONE.\n"
                + "ROOTED TO THE RIFT FLOOR, IT STANDS COMPLETELY STILL, BLENDING INTO THE ALIEN LANDSCAPE AS IF IT GREW FROM IT.\n"
                + "THOSE WHO STUMBLE TOO CLOSE QUICKLY LEARN THAT STILLNESS DOES NOT MEAN HARMLESS.",
            images: [img('nebulure', 95.75, 150, 1, 'right', 'bottom')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "VEYNOCULUS",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "VEYNOCULUS IS ONE OF THE MOST COMMONLY SPOTTED CREATURES IN THE COSMIC RIFT.\n"
                + "IT DRIFTS THROUGH THE AIR WITHOUT PURPOSE OR AGGRESSION, ENTIRELY INDIFFERENT TO WHATEVER ELSE IS HAPPENING AROUND IT.\n"
                + "IN A PLACE AS HOSTILE AS THE RIFT, VEYNOCULUS IS A RARE REMINDER THAT NOT EVERYTHING HERE WANTS TO CAUSE HARM.",
            images: [img('veynoculus', 78.6, 50, 0, 'right', 'top')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "PLAZER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "PLAZER IS A PLANT NATIVE TO THE COSMIC RIFT, BELIEVED TO HAVE EVOLVED ITS SINGLE EYE TO ABSORB THE RIFT'S CONCENTRATED ENERGY.\n"
                + "OVER TIME, THAT ENERGY BUILT UP FASTER THAN THE PLANT COULD CONTAIN IT, AND BLINKING BECAME THE ONLY WAY TO RELEASE IT.",
            images: [img('plazer', 61.33333333333333, 90, 2, 'right', 'bottom')],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'normal',
        },
        {
            kind: 'page',
            name: "JOHNNY",
            type: "STUN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "JOHNNY IS A RELENTLESS PURSUER.\n"
                + "ONCE IT LOCKS ITS EYES ON A TARGET, IT WILL CHASE IT ACROSS THE ENTIRE RIFT WITHOUT HESITATION. AND IT IS FAST!",
            images: [img('johnny', 98, 80, 0, 'right', 'top', 'stun')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "CRABULA",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "CRABULAS SPEND MOST OF THEIR LIVES DRIFTING THROUGH THE UPPER LAYERS OF THE COSMIC RIFT, FAR OUT OF SIGHT.\n"
                + "WHEN ONE DROPS, IT IS NOT BY ACCIDENT. IT HAS SPOTTED SOMETHING BELOW AND DECIDED TO INVESTIGATE AT FULL SPEED.\n"
                + "THEIR THICK SHELLS WERE NOT BUILT FOR GRACE. THEY WERE BUILT FOR EXACTLY THIS.",
            images: [img('crabula', 125.6666666666667, 130, 0, 'right', 'top')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "SPINDLE",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "SPINDLE IS A SPINDLY CREATURE THAT MOVES AT ALARMING SPEED ACROSS THE RIFT FLOOR.\n"
                + "IT SKITTERS FORWARD IN ERRATIC BURSTS, MAKING IT EXTREMELY HARD TO PREDICT OR AVOID!",
            images: [img('spindle', 99.69230769230769, 90, 0, 'right', 'bottom')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "LANCER",
            type: "FROZEN",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "LANCER IS ONE OF THE FASTEST THREATS IN THE RIFT, ROCKETING THROUGH THE AIR AT BLISTERING SPEED.\n"
                + "ITS FROZEN IMPACT LEAVES YOU MOMENTARILY HELPLESS. BLINK AND YOU WILL MISS IT.",
            images: [img('lancer', 181.25, 70, 0, 'right', 'top', 'frozen')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "FROGULA",
            type: "RED",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "A FROG. IN ANOTHER DIMENSION. NOBODY QUESTIONED IT, AND FROGULA CERTAINLY IS NOT EXPLAINING ITSELF.\n"
                + "IT SIMPLY WAITS ON THE RIFT FLOOR UNTIL SOMETHING MOVES, THEN LEAPS WITH THE CONFIDENCE OF SOMETHING THAT BELONGS HERE.",
            images: [img('frogula', 96.5, 100, 0, 'right', 'bottom', 'red')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "VESPION",
            type: "SLOW",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "VESPION CUTS THROUGH THE RIFT IN A SHARP, RELENTLESS ZIGZAG. UP AND DOWN, UP AND DOWN.\n"
                + "ITS ERRATIC FLIGHT PATH MAKES IT NEARLY IMPOSSIBLE TO DODGE WITHOUT CAREFUL TIMING.",
            images: [img('vespion', 117, 100, 0, 'right', 'top', 'slow')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "OCULITH",
            type: "POISON",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "OCULITH LURKS BENEATH THE RIFT FLOOR, WAITING IN SILENCE.\n"
                + "WHEN IT SENSES A PRESENCE ABOVE, IT BURSTS UPWARD AND KEEPS RISING. NEVER RETREATING, NEVER STOPPING.",
            images: [img('oculith', 93, 80, 0, 'right', 'bottom', 'poison')],
            mapKey: "bonusMap3",
            category: "bonus",
        },
        {
            kind: 'page',
            name: "ASTRAIDER",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "ASTRAIDER IS BELIEVED TO BE ONE OF THE OLDEST NATIVE SPECIES OF THE COSMIC RIFT.\n"
                + "IT CRAWLS ACROSS THE RIFT FLOOR WITH AN UNSETTLING CONFIDENCE, AS IF IT KNOWS NOTHING HERE CAN THREATEN IT.",
            images: [img('astraider', 160.5, 120, 0, 'right', 'bottom')],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'frozen',
        },
        {
            kind: 'page',
            name: "BORION",
            type: "NORMAL",
            foundAt: MAP_DISPLAY_NAMES_UPPER.BonusMap3,
            description:
                "BORION IS BELIEVED TO BE THE OLDEST LIVING CREATURE IN THE COSMIC RIFT, A COLOSSAL BEAST THAT HAS LURKED BENEATH ITS SURFACE SINCE LONG BEFORE ANYTHING ELSE ARRIVED.\n"
                + "IT IS CONSIDERED THE APEX PREDATOR OF THE RIFT, HAVING MASTERED EVERY ELEMENT KNOWN TO EXIST WITHIN IT AND UNLEASHING THEM ALL AT WILL.",
            images: [img('borion', 228, 150, 0, 'right', 'bottom', null, 0, 0.9)],
            mapKey: "bonusMap3",
            category: "bonus",
            projectile: 'all',
        },
    ];
}
