import { BaseMenu } from "./baseMenu.js";

export class EnemyLore extends BaseMenu {
    constructor(game) {
        super(game);
        this.backgroundImage = document.getElementById('forestmap');
        this.backgroundImageNight = document.getElementById('forestmapNight');

        this.currentPage = 0;

        this.enemyLoreBookBackground = document.getElementById('enemyLoreBookBackground');
        this.leftPageBackground = document.getElementById('enemyLoreLeftPageBackground');
        this.rightPageBackground = document.getElementById('enemyLoreRightPageBackground');

        this.pageWidth = this.game.width * 0.43;
        this.pageHeight = this.game.height * 0.8;
        this.bookX = (this.game.width - 2 * this.pageWidth) / 2;
        this.bookY = (this.game.height - this.pageHeight) / 2;

        this.pages = [];

        // map 1
        //1
        this.createPage("GOBLITO", "NORMAL & GROUND", "EVERYWHERE", "THE GOBLITO SPECIES, ONCE NON-THREATENING PEACEFUL INHABITANTS OF THE LUSH DEPTHS OF VERDANT VINE, "
            + "HAVE TRANSFORMED INTO NOTORIOUS THIEVES.\nNO ONE KNOWS WHAT DROVE THEM TO ABANDON THEIR SERENE HOMELAND, BUT THEIR DEPARTURE MARKED THE BEGINNING OF CHAOS.\n"
            + "NOW, THESE SMALL, AGILE CREATURES CAN BE FOUND ALL AROUND, AS THEY ARE KNOWN FOR THEIR ABILITY TO STEAL ANYTHING THEY SET THEIR SIGHTS ON, ESPECIALLY COINS.", [
            this.createImage('goblinSteal', 60.083, 80, 3, this.pageWidth - 135, this.pageHeight - 120, 1.3),
        ]);
        //2
        this.createPage("DOTTER", "FLY & NORMAL", "LUNAR MOONLIT GLADE", "IT IS SAID THAT DOTTERS HAVE BEEN AROUND FOR THOUSANDS OF YEARS...\n"
            + "EVEN ON THE BRINK OF EXTINCTION, THEY HAVE ALWAYS MANAGED TO SURVIVE.\n"
            + "THESE LITTLE CREATURES CAN BE FOUND ROAMING AROUND PEACEFULLY WITHIN THE FOREST.", [
            this.createImage('dotter', 60.083, 80, 0, this.pageWidth - 140, 60, 1.4),
        ]);
        //3
        this.createPage("VERTIBAT", "FALL & NORMAL", "LUNAR MOONLIT GLADE", "THESE VERTIBATS ARE COMMONLY FOUND IN NIGHTFALL CITY PHANTOM, HOWEVER, SOMETHING HAS CAUSED MOST OF THEM TO MIGRATE "
            + "TO THE AREA OF LUNAR MOONLIT GLADE.\nIT IS SPECULATED THAT VERTIBATS CAN DETECT FREQUENCIES NO OTHER CREATURE CAN, INCLUDING PARANORMAL FREQUENCY, WHICH PROBABLY CAUSED "
            + "MOST OF THEM TO FIND REFUGE HERE!\nHIDING ON TOP OF TREES, THESE BATS WAIT FOR MOVEMENT BEFORE THEY FALL ONTO THEIR TARGET.\n", [
            this.createImage('vertibat', 151.166, 90, 0, this.pageWidth - 210, 40, 1),
        ]);
        //4
        this.createPage("GHOBAT", "FLY & NORMAL", "LUNAR MOONLIT GLADE", "NOT MUCH IS KNOWN ABOUT THIS GHOST-SHAPED BAT.\n"
            + "ALL THAT IS KNOWN IS THAT IT LIKES TO FLAP ITS WINGS AND CHASE DOTTERS...", [
            this.createImage('ghobat', 134.33, 84, 0, this.pageWidth - 190, 40, 1.1),
        ]);
        //5
        this.createPage("RAVENGLOOM", "FLY & NORMAL", "LUNAR MOONLIT GLADE", "THIS FLYING CREATURE LIKES TO PEACEFULLY FLY THROUGH TREES!", [
            this.createImage('ravengloom', 139.66, 100, 0, this.pageWidth - 200, 40, 1),
        ]);
        //6
        this.createPage("MEAT SOLDIER", "GROUND & NORMAL", "LUNAR MOONLIT GLADE", "MEAT SOLDIERS WERE ONCE FAMOUSLY HIRED AS OVERNIGHT GUARDS THROUGHOUT ALL LAND.\n"
            + "HOWEVER, BEING VETERANS OF PAST WARS TOOK A MENTAL TOLL ON THEM, AND THEY EVENTUALLY BECAME UNCONTROLLABLE.\n"
            + "UP TO THIS DAY, THEY STILL THINK THEY ARE ON DUTY.\nTHEY CAN BE FOUND ROAMING THE AREA, LOOKING FOR ENEMIES TO ATTACK.", [
            this.createImage('meatSoldier', 67.625, 80, 0, this.pageWidth - 150, this.pageHeight - 110, 1.1),
        ]);
        //7
        this.createPage("SKULNAP", "GROUND & STUN", "LUNAR MOONLIT GLADE", "HE HAD NEVER BEEN IN THIS AREA UNTIL SOME TIME AGO. NO ONE KNOWS HIS ORIGIN, AND IT IS BELIEVED THAT SKULNAP WAS "
            + "AN EXPERIMENT MADE BY ONE OF THE LANDS.\nHE CAN BE FOUND SLEEPING ON THE GROUND, BUT AS SOON AS YOU STEP WITHIN HEARING RANGE, YOU'LL WAKE HIM RIGHT AWAY!", [
            this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 100, 1.1, 'stun'),
            this.createImage('skulnapAwake', 104.231, 70, 0, this.pageWidth - 650, this.pageHeight - 110, 1.1, 'stun'),
        ]);
        //8
        this.createPage("ABYSSAW", "FLY & NORMAL", "LUNAR MOONLIT GLADE", "YOU'LL HEAR THEM BEFORE YOU SEE THEM!\n"
            + "THESE LOUD CREATURES SPIN AGGRESSIVELY LIKE A CHAINSAW AS THEY MOVE THROUGH THE TREES OF THE FOREST.\nWATCH OUT, SO YOU DON'T GET CUT!", [
            this.createImage('abyssaw', 100.44, 100, 0, this.pageWidth - 160, 40, 1),
        ]);
        //9
        this.createPage("GLIDOSPIKE", "FLY & NORMAL", "LUNAR MOONLIT GLADE", "THOUSANDS OF YEARS AGO, A GROUP OF ANGRY GLIDOSPIKES WERE ROAMING AROUND CORAL ABYSS, "
            + "FLAPPING THEIR WINGS VICIOUSLY NEAR THE SEA, WHICH IN TURN CAUSED A TSUNAMI BIG ENOUGH TO WIPE OUT HALF OF THE LAND.\n"
            + "WITH THE ABILITY TO FLAP THEIR WINGS WITH SUCH FORCE, GLIDESPIKES CAN CREATE TORNADOES.\nBE CAREFUL NOT TO GET SUCKED IN!", [
            this.createImage('glidoSpikeFly', 191.68, 130, 0, this.pageWidth - 220, 30, 1),
            this.createImage('windAttack', 105, 120, 0, this.pageWidth - 200, 120, 1),
        ]);
        // map 2
        //10
        this.createPage("DUSK PLANT", "GROUND & NORMAL", "NIGHTFALL CITY PHANTOM", "THESE RARE PLANTS ARE DORMANT BY DAY BUT AWAKEN AS DARKNESS FALLS, PROWLING THE SHADOWS IN SEARCH "
            + "OF UNSUSPECTING PREY.\n AS SOON AS THEY DETECT MOVEMENT, DUSK PLANTS WILL LAUNCH A VERY DARK LEAF FROM THEIR MOUTHS, AIMING TO SLICE THROUGH THEIR TARGET!", [
            this.createImage('duskPlant', 60, 87, 0, this.pageWidth - 150, this.pageHeight - 110, 1),
            this.createImage('darkLeafAttack', 35.416, 45, 0, this.pageWidth - 210, this.pageHeight - 100, 1),
        ]);
        //11
        this.createPage("SILKNOIR", "CRAWLER & NORMAL", "NIGHTFALL CITY PHANTOM", "THESE BIG SPIDERS APPEAR AT NIGHT, CRAWLING DOWN THE TALLEST TREES FOR SOME PREYS!\n"
            + "SILKNOIRS ARE BIG IN SIZE BECAUSE THEY FEAST ON ANYTHING THEY LAY THEIR EYES ON!", [
            this.createImage('blackLine', 3, 345, 0, this.pageWidth - 111, 0, 1),
            this.createImage('silknoir', 120, 144, 0, this.pageWidth - 170, 270, 1),
        ]);
        //12
        this.createPage("WALTER THE GHOST", "FLY & NORMAL", "NIGHTFALL CITY PHANTOM", "WALTER IS A VERY CURIOUS AND SPOOKY GHOST.\nIF HE SPOTS YOU, HE MIGHT CHASE YOU!", [
            this.createImage('walterTheGhost', 104.83, 84, 0, this.pageWidth - 160, 70, 1),
        ]);
        //13
        this.createPage("BEN", "FALL & NORMAL", "NIGHTFALL CITY PHANTOM", "BEN IS A SMALL CREATURE WHO SEEMS TO APPEAR OUT OF NOWHERE.\nLITTLE IS KNOWN ABOUT HIS BACKSTORY OR PURPOSE, "
            + "EXCEPT THAT HE DROPS FROM ABOVE AND MOVES CURIOUSLY IN YOUR DIRECTION.", [
            this.createImage('ben', 61.5, 50, 0, this.pageWidth - 160, 70, 1.3),
        ]);
        //14
        this.createPage("DOLLY", "FLY & NORMAL", "NIGHTFALL CITY PHANTOM", "A LITTLE GIRL WAS ACCIDENTALLY BURIED IN CEMENT, CLUTCHING HER BELOVED DOLL, DOLLY, IN HER FINAL MOMENTS.\n"
            + "RUMOR HAS IT THAT THE CHILD'S SPIRIT NOW RESIDES WITHIN DOLLY, HAUNTING THOSE WHO ENCOUNTER HER AT NIGHT.\nIF YOU SEE DOLLY LAUNCHING A YELLOWISH AURA, "
            + "YOU SHOULD AVOID TOUCHING IT AT ALL COSTS!", [
            this.createImage('dolly', 88.2, 120, 0, this.pageWidth - 160, 70, 1),
            this.createImage('aura', 52, 50, 0, this.pageWidth - 210, 150, 1, 'stun'),
        ]);
        // map 3
        //15
        this.createPage("PIRANHA", "SWIMMER & NORMAL", "CORAL ABYSS", "PIRANHAS ARE QUICK AND NIPPY FISH.\nTHEIR SHARP TEETH CAN GIVE YOU NASTY BITE, SO KEEP YOUR DISTANCE!", [
            this.createImage('piranha', 75.167, 50, 0, this.pageWidth - 160, 70, 1),
        ]);
        //16
        this.createPage("SKELETON FISH", "SWIMMER & NORMAL", "CORAL ABYSS", "ROAMING THE SEAS FOR THOUSANDS OF YEARS, THESE ANCIENT FISH HAVE ADAPTED TO THEIR UNDERWATER HABITAT.\n"
            + "THEY DON'T HAVE EYES, BUT THEY CAN SENSE MOVEMENT AND WILL BE QUICK AND PERSISTENT IN CHASING YOU DOWN!", [
            this.createImage('skeletonFish', 55, 39, 0, this.pageWidth - 160, 70, 1),
        ]);
        //17
        this.createPage("SPEAR FISH", "GROUND & RED", "CORAL ABYSS", "ONCE A MIGHTY WARRIOR IN A FORGOTTEN UNDERWATER KINGDOM, THIS FISH HAS ADOPTED A SPEAR AS ITS MOST PRIZED POSSESSION.\n"
            + "WITH A SHARP IMPOSING TIP, THE SPEAR FISH USES ITS WEAPON TO DEFEND ITS TERRITORY AND CHALLENGE ANY INTRUDERS.\n"
            + "LEGEND HAS IT THAT THE SPEAR FISH'S SKILLS WERE MASTERED IN ANCIENT DUELS, AND NOW IT GUARDS THE SEAS WITH A COMBINATION OF ANCIENT FEROCITY "
            + "AND DETERMINATION, RUNNING BRAVELY TOWARDS ITS TARGET!", [
            this.createImage('spearFish', 91.875, 110, 0, this.pageWidth - 160, this.pageHeight - 130, 1, 'red'),
        ]);
        //18
        this.createPage("JET FISH", "SWIMMER & NORMAL", "CORAL ABYSS", "IS IT A JET? IS IT A FISH? NO, IT'S BOTH!\n"
            + "JET FISH BLENDS THE SPEED OF A JET WITH THE SWIFT MOVES OF A FISH, GLIDING THROUGH THE WATERS OF CORAL ABYSS AT SUPERSONIC SPEED!", [
            this.createImage('jetFish', 142, 55, 0, this.pageWidth - 160, 70, 1),
        ]);
        //19
        this.createPage("PIPER", "GROUND & NORMAL", "CORAL ABYSS", "PIPER SEEMS LIKE A HARMLESS ENEMY AT FIRST...\n"
            + "BUT GET TOO CLOSE, AND SHE'LL UNVEIL HER TRUE FORM, EXPANDING TO FIVE TIMES HER ORIGINAL SIZE!", [
            this.createImage('piperIdle', 87, 67, 0, this.pageWidth - 250, this.pageHeight - 110, 1),
            this.createImage('piperExtended', 82, 234, 10, this.pageWidth - 150, this.pageHeight - 275, 1),
        ]);
        //20
        this.createPage("VOLTZEEL", "FALLING & STUN", "CORAL ABYSS", "AMONG THE MOST DANGEROUS ENEMIES, VOLTZEEL WILL STRIKE FROM ABOVE WHEN YOU LEAST EXPECT IT!\n"
            + "IT IS RUMORED THAT HIS INTENSE ELECTRICAL AURA IS THE RESULT OF EXPERIMENTS CARRIED OUT BY THE INHABITANTS OF CORAL ABYSS.", [
            this.createImage('voltzeel', 107, 87, 4, this.pageWidth - 160, 70, 1, 'stun')
        ]);
        //21
        this.createPage("GARRY", "GROUND & NORMAL", "CORAL ABYSS", "GARRY DOESN'T LIKE IT WHEN YOU ATTACK HIM WITH PHYSICAL CONTACT AS HE MIGHT SURPRISE YOU WITH SOME INK THAT "
            + "TAKES A WHILE TO FADE AWAY!", [
            this.createImage('paint_splatter_8', 1994, 995, 0, -130, 175, 0.5),
            this.createImage('garry', 165, 122, 0, this.pageWidth - 220, this.pageHeight - 130, 1),
        ]);
        // map 4
        //22
        this.createPage("BIG GREENER", "GROUND & NORMAL", "VERDANT VINE", "THE OXYGEN LEVELS IN THIS AREA ARE TWICE AS HIGH COMPARED TO OTHERS DUE TO ITS VAST PLANTATION.\n"
            + "THIS PLANT'S LARGE SIZE IS A RESULT OF THIS ABUNDANT OXYGEN.\nBIG GREENERS CAN THROW TWO LEAVES AT ONCE, SO BE CAREFUL, AS THEY SLICE THROUGH ANYTHING THAT CROSSES THEIR PATH!", [
            this.createImage('bigGreener', 113, 150, 0, this.pageWidth - 150, this.pageHeight - 170, 1),
            this.createImage('leafAttack', 35.416, 45, 0, this.pageWidth - 200, this.pageHeight - 125, 1),
            this.createImage('leafAttack', 35.416, 45, 8, this.pageWidth - 340, this.pageHeight - 125, 1),
        ]);
        //23
        this.createPage("CHIQUITA", "FLY & NORMAL", "VERDANT VINE", "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n"
            + "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n"
            + "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.", [
            this.createImage('chiquita', 118.823529411764, 85, 0, this.pageWidth - 190, 40, 1),
        ]);
        //24
        this.createPage("SLUGGIE", "GROUND & NORMAL", "VERDANT VINE", "SLUGGIE IS A SLOW BUT DETERMINED ENEMY.\nHE DOES NOT APPRECIATE PHYSICAL CONTACT AND WILL LET YOU KNOW OF THAT "
            + "IF YOU STEP TOO CLOSE TO HIM!", [
            this.createImage('paint_splatter_4', 1994, 995, 0, -170, 30, 0.9),
            this.createImage('sluggie', 147.33, 110, 0, this.pageWidth - 200, this.pageHeight - 140, 1),
        ]);
        //25
        this.createPage("LIL HORNET", "FLY & STUN", "VERDANT VINE", "WITH A SHARP HORN AT THE TOP OF ITS HEAD, THEY CAN CAUSE SOME SERIOUS DAMAGE IF YOU MAKE CONTACT WITH THEM!\n"
            + "IT IS BELIEVED THAT EVERY CREATURE IN VERDANT VINE IS AFRAID TO ATTACK LIL HORNETS DUE TO THEIR INTIMIDATING HORN!", [
            this.createImage('lilHornet', 56, 47, 0, this.pageWidth - 170, 50, 1, 'stun'),
        ]);
        //26
        this.createPage("KARATE CROCO", "GROUND & RED", "VERDANT VINE", "THIS CROCODILE USED TO LIVE IN CORAL ABYSS CENTURIES AGO.\n"
            + "LEGENDS SAY AN EARTHQUAKE CAUSED A HUGE TSUNAMI, FLUSHING THE CROCODILE TO THE SHORE OF VERDANT VINE.\nCROCO, IN NEW TERRITORY, HAD TO LEARN KARATE TO SURVIVE.\n"
            + "AFTER MONTHS OF TRAINING AND EARNING A BLACK BELT, HE BECAME UNTOUCHABLE. HE QUICKLY EARNED A REPUTATION FOR HIS KARATE SKILLS. SOON, EVERYONE KNEW HIM AS... KARATE CROCO!", [
            this.createImage('karateCrocoIdle', 152.75, 110, 0, this.pageWidth - 140, this.pageHeight - 130, 1, 'red'),
            this.createImage('karateCrocoFlyKick', 153, 110, 2, this.pageWidth - 280, this.pageHeight - 130, 1, 'red'),
        ]);
        //27
        this.createPage("ZABKOUS", "GROUND & NORMAL", "VERDANT VINE", "JUMPING AND LEAPING AROUND IS WHAT THIS FROG NORMALLY DOES..."
            + "UNTIL HE SEES A TARGET! HE CAN SPIT POISON OUT OF HIS MOUTH, DRAINING ENERGY RAPIDLY!", [
            this.createImage('zabkousAttack', 177, 132, 14, this.pageWidth - 250, this.pageHeight - 170, 1),
            this.createImage('poison_spit', 59, 22, 0, this.pageWidth - 310, this.pageHeight - 105, 1),
        ]);
        //28
        this.createPage("SPIDOLAZER", "GROUND & NORMAL", "VERDANT VINE", "SPIDOLAZER IS A BIG SPIDER FOUND IN DENSE, PLANT-RICH AREAS.\n"
            + "IT HAS THE UNIQUE ABILITY TO SHOOT FOCUSED LASERS FROM ITS EYE.\nTHERE IS SPECULATION REGARDING THE ORIGINS OF SPIDOLAZER, AS SOME LOCAL RESIDENTS BELIEVE "
            + "THAT THIS SPIDER IS FROM ANOTHER PLANET DUE TO ITS ALIEN-LIKE CHARACTERISTICS.", [
            this.createImage('spidoLazerAttack', 161.33, 144, 13, this.pageWidth - 210, this.pageHeight - 170, 1),
            this.createImage('laser_beam', 300, 28, 0, this.pageWidth - 440, this.pageHeight - 125, 1),
        ]);
        //29
        this.createPage("JERRY", "FLY & NORMAL", "VERDANT VINE", "JERRY LIKES TO GIVE OUT PRESENTS... BUT NOT THE TYPE OF PRESENTS YOU'D EXPECT!\n"
            + "NO ONE KNOWS HOW HE GOT SO MANY SKULNAPS IN HIS BAG!", [
            this.createImage('jerry', 185, 103, 4, this.pageWidth - 250, 30, 1),
            this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 170, this.pageHeight - 420, 0.80, 'stun'),
            this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 150, this.pageHeight - 250, 0.80, 'stun'),
            this.createImage('skulnapSleep', 57, 57, 0, this.pageWidth - 130, this.pageHeight - 70, 0.80, 'stun'),
            this.createImage('skulnapAwake', 104.23076923076923076923076923077, 70, 0, this.pageWidth - 280, this.pageHeight - 85, 0.80, 'stun'),
        ]);
        // map 5
        //30
        this.createPage("SNAILEY", "GROUND & NORMAL", "SPRINGLY LEMONY", "JUST A REGULAR SNAIL...", [
            this.createImage('snailey', 103, 74, 0, this.pageWidth - 230, this.pageHeight - 100, 1),
        ]);
        //31
        this.createPage("REDFLYER", "FLY & NORMAL", "SPRINGLY LEMONY", "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
            + "RAIN EFFECT: SHOOTS LASERS OUT OF ITS EYE!", [
            this.createImage('redFlyer', 79.3333333, 65, 0, this.pageWidth - 140, 70, 1),
            this.createImage('darkLaser', 63, 40, 0, this.pageWidth - 200, 92, 1),
        ]);
        //32
        this.createPage("PURPLEFLYER", "FLY & NORMAL", "SPRINGLY LEMONY", "THIS FLY WILL PEACEFULLY ROAM AROUND THE AREA.\n"
            + "RAIN EFFECT: SHOOTS ICE BALLS OUT OF ITS EYE, SLOWING YOU DOWN IF YOU MAKE CONTACT WITH IT!", [
            this.createImage('purpleFlyer', 83.33333, 65, 0, this.pageWidth - 140, 70, 1),
            this.createImage('iceBall', 35, 35, 0, this.pageWidth - 180, 100, 1),
            this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 220, 100, 0.05),
            this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 180, 150, 0.05),
            this.createImage('ice_crystal', 365, 419, 0, this.pageWidth - 100, 170, 0.05),
        ]);
        //33
        this.createPage("LAZY MOSQUITO", "FLY & NORMAL", "SPRINGLY LEMONY", "JUST A LAZY MOSQUITO...", [
            this.createImage('lazyMosquito', 67.230769230769230769230769230769, 50, 0, this.pageWidth - 160, 70, 1.1),
        ]);
        //34
        this.createPage("LEAF SLUG", "GROUND & NORMAL", "SPRINGLY LEMONY", "THIS STRANGE-LOOKING CREATURE IS A COMMON SIGHT IN THE AREA.\n"
            + "IT HAS A UNIQUE, LEAF-COVERED BACK THAT HELPS IT BLEND SEAMLESSLY INTO ITS SURROUNDING. WITH BAD EYESIGHT, THEY MOVE SLOWLY AND STEADILY, TOWARDS ANY TARGET IT FINDS AHEAD!\n", [
            this.createImage('leafSlug', 89, 84, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
        ]);
        //35
        this.createPage("SUNFLORA", "GROUND & NORMAL", "SPRINGLY LEMONY", "THIS MASSIVE, UNIQUELY SHAPED FLOWER ABSORBS SUNLIGHT AT AN EXCEPTIONALLY RAPID RATE COMPARED TO ANY OTHER "
            + "FLOWER IN THE VICINITY.\nRAIN EFFECT: WHEN IT RAINS, SUNFLORA HARNESSES THE STORED SOLAR ENERGY AND RELEASES IT IN THE FORM OF POWERFUL YELLOW LASER BEAMS.", [
            this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 210, 1),
            this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 310, 1),
            this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 410, 1),
            this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 510, 1),
            this.createImage('yellowBeam', 53, 85, 0, this.pageWidth - 173, this.pageHeight - 610, 1),
            this.createImage('sunflora', 132, 137, 0, this.pageWidth - 210, this.pageHeight - 150, 1),
        ]);
        //36
        this.createPage("CYCLORANGE", "GROUND & NORMAL", "SPRINGLY LEMONY", "CYCLORANGE NEVER MOVES.\nHE JUST STANDS THERE, UNPHASED.", [
            this.createImage('cyclorange', 57, 71, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
        ]);
        //37
        this.createPage("TAURO", "GROUND & RED", "SPRINGLY LEMONY", "TAURO IS AN ANGRY CREATURE WHO STOMPS LOUDLY AS HE MOVES FORWARD, KNOCKING EVERYTHING IN HIS PATH DOWN!\n"
            + "LEGENDS SAY HE USED TO LIVE NEAR ACTIVE VOLCANOES, BUT ONCE HIS HABITAT WAS DESTROYED BY THE ERUPTION OF A MASSIVE VOLCANO, HE WAS FORCED TO COME TO SPRINGLY LEMONY.\n"
            + "NOW, HE RESIDES HERE, HIS RAGE FUELED BY THE MEMORY OF HIS LOST HOME AND THE DESTRUCTION CAUSED BY THE ERUPTION!", [
            this.createImage('tauro', 151, 132, 0, this.pageWidth - 210, this.pageHeight - 150, 1, 'red'),
        ]);
        //38
        this.createPage("BEE", "FLY & STUN", "SPRINGLY LEMONY", "IN THIS AREA RESIDES THOUNSANDS OF BEES.\nTHEY HAVE TAKEN OVER THE TERRITORY, AND IF THEY DETECT ANY UNKNOWN "
            + "PRESENCE WITHIN SPRINGLY LEMONY, THEY WILL CHASE YOU DOWN AND STING YOU!", [
            this.createImage('bee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
        ]);
        //39
        this.createPage("ANGRY BEE", "FLY & STUN", "SPRINGLY LEMONY", "RAIN EFFECT: THESE FASTER, ANGRIER, AND MORE FEROCIOUS BEES ONLY APPEAR DURING THE RAIN, AS REGULAR BEES SEEK COVER!", [
            this.createImage('angryBee', 55.23, 57, 0, this.pageWidth - 160, 70, 1.1, 'stun'),
        ]);
        //40
        this.createPage("HANGING SPIDOLAZER", "CRAWLER & NORMAL", "SPRINGLY LEMONY", "HAVE YOU EVER SEEN A SPIDER HANGING ON A WEB SHOOTING LASERS!?\n"
            + "THESE HANGING SPIDER-LASERS ARE THE SAME SPECIES AS THE ONES FOUND ON THE GROUND IN VERDANT VINE, BUT HERE THEY CRAWL FROM TREES BECAUSE THEIR LEGS CAN OVERHEAT ON THE "
            + "HOT GROUND.\nTHE STRONG SUN ALSO GIVES THEM A SLIGHT YELLOW TINT TO THEIR SKIN!", [
            this.createImage('blackLine', 3, 485, 0, this.pageWidth - 111, 0, 1),
            this.createImage('hangingSpidoLazer', 161.33, 144, 17, this.pageWidth - 190, this.pageHeight - 200, 1),
            this.createImage('laser_beam', 300, 28, 0, this.pageWidth - 420, this.pageHeight - 120, 1),
        ]);
        // map 6
        //41
        this.createPage("CACTUS", "GROUND & STUN", "INFERNAL CRATER PEAK", "THERE'S QUITE A FEW CACTUSES AROUND THIS AREA.", [
            this.createImage('cactus', 71, 90, 0, this.pageWidth - 180, this.pageHeight - 120, 1, 'stun'),
        ]);
        //42
        this.createPage("PETROPLANT", "GROUND & NORMAL", "INFERNAL CRATER PEAK", "PETROPLANTS EMERGED LONG AFTER THE ERUPTION OF THE VOLCANOES.\n"
            + "THIS UNIQUE PLANT CAN ONLY GROW IN THIS AREA, AS IT IS FUELED BY THE MINERALS IN THE GROUND RATHER THAN DEPENDING ON THE SUNS LIGHT.\n"
            + "THEY CAN THROW DANGEROUS ROCKS FROM THEIR MOUTHS WHEN THEY FEEL THREATENED.", [
            this.createImage('petroPlant', 91.5555555, 100, 0, this.pageWidth - 180, this.pageHeight - 120, 1),
            this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 240, this.pageHeight - 100, 1, 'stun'),
            this.createImage('rockProjectile', 37, 40, 0, this.pageWidth - 430, this.pageHeight - 100, 1, 'stun'),
        ]);
        //43
        this.createPage("PLAZER", "GROUND & NORMAL", "INFERNAL CRATER PEAK", "THIS ODD-LOOKING PLANT CANNOT HELP ITSELF BUT SHOOT A LASER OUT OF ITS EYE WHEN IT BLINKS!\n"
            + "BE CAREFUL NOT TO GET CAUGHT BY THE LASER RAYS!", [
            this.createImage('plazer', 75, 89, 2, this.pageWidth - 150, this.pageHeight - 110, 1),
            this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 250, this.pageHeight - 101, 1),
            this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 450, this.pageHeight - 101, 1),
            this.createImage('purpleLaser', 82, 48, 0, this.pageWidth - 650, this.pageHeight - 101, 1),
        ]);
        //44
        this.createPage("VEYNOCULUS ", "FLY & NORMAL", "INFERNAL CRATER PEAK", "RUMOURS HAVE SPREAD ACROSS THE LAND OF THIS INFAMOUS SMALL CREATURE.\n"
            + "IT IS BELIEVED THAT BEFORE THE ERUPTION, VEYNOCULUS USED TO LIVE INSIDE ACTIVE VOLCANOS AND FEED OFF MICRO-ORGANISMS AROUND THE CRATERS.\n"
            + "AFTER THE ERUPTION OF THE VOLCANO, IT BECAME TOO AFRAID TO LIVE INSIDE ANYMORE AND STARTED TO ROAM THE SURROUNDING AREA OF INFERNAL CRATER PEAK!", [
            this.createImage('veynoculus', 57, 37, 0, this.pageWidth - 140, 70, 1.3),
        ]);
        //45
        this.createPage("VOLCANURTLE", "GROUND & RED", "INFERNAL CRATER PEAK", "JUST A BIG AND SLOW TURTLE THAT ALWAYS MARCHES FORWARD...\n"
            + "THIS TYPE OF TURTLE WILL BE IN HIBERNATION FOR MOST OF THE YEAR, SO IF YOU CATCH SIGHT OF ONE, CONSIDER YOURSELF QUITE LUCKY!", [
            this.createImage('volcanurtle', 177, 107, 4, this.pageWidth - 300, this.pageHeight - 120, 1, 'red'),
        ]);
        //46
        this.createPage("THE ROCK", "GROUND & RED", "INFERNAL CRATER PEAK", "THE ROCK FORMED FROM VOLCANIC CRATER MATERIAL AND IS SAID TO POSSESS UNIQUE MINERAL PROPERTIES.\n"
            + "IT IS BELIEVED THAT THE ROCK HOLDS SECRETS OF THE REGION'S VOLCANIC HISTORY AND THAT IT WAS FORMED FROM THE ERUPTION OF MULTIPLE VOLCANOES AROUND THE AREA!", [
            this.createImage('theRock', 132, 132, 0, this.pageWidth - 210, this.pageHeight - 140, 1, 'red'),
        ]);
        //47
        this.createPage("VOLCANO WASP", "FLY & STUN", "INFERNAL CRATER PEAK", "IF YOU THOUGHT BEES WERE TROUBLE, JUST WAIT UNTIL YOU ENCOUNTER THE VOLCANO WASP!\n"
            + "VOLCANO WASPS ARE TINY MENACES, LOATHING EVERYTHING THAT BREATHES AND STINGING ANY TARGET THEY SPOT!\n"
            + "LITTLE IS KNOWN ABOUT THEM EXCEPT THAT THEY ONCE INHABITED THE LUSH ENVIRONMENT OF VERDANT VINE, BUT SOMETHING FORCED THEM TO MIGRATE TO VOLCANIC AREAS...", [
            this.createImage('volcanoWasp', 113, 125, 0, this.pageWidth - 170, 70, 1, 'stun'),
        ]);
        //48
        this.createPage("ROLLHOG", "GROUND & NORMAL", "INFERNAL CRATER PEAK", "ROLLHOGS USED TO LIVE UNDERNEATH THE SOIL OF THIS AREA UNTIL THE BIG ERUPTION OCCURRED.\n"
            + "NOW, THE GROUND HAS BECOME TOO HOT FOR ROLLHOG TO HIDE UNDERNEATH.\nTO SURVIVE, HE HAD TO LEARN AN ATTACK... AND SO HE LEARNED TO ROLL HIMSELF FORWARD, KNOCKING OUT "
            + "ANY ENEMY THAT DARES TO STAND IN HIS WAY!", [
            this.createImage('rollhogWalk', 125, 85, 0, this.pageWidth - 210, this.pageHeight - 110, 1),
            this.createImage('rollhogRoll', 97, 92, 0, this.pageWidth - 510, this.pageHeight - 110, 1),
        ]);
        //49
        this.createPage("DRAGON", "FLY & NORMAL", "INFERNAL CRATER PEAK", "IF THERE IS A CREATURE THAT EVERY BEING FEARS IN INFERNAL CRATER PEAK, IT'S THE DRAGON!\n"
            + "ITS IMPOSING WINGS HAVE THE POWER TO WHIP UP FEROCIOUS TORNADOES, RAGING ACROSS THE LAND.\nIT IS BELIEVED THAT THOUSANDS OF YEARS AGO, THE DRAGON'S ROAR CAUSED "
            + "THE VOLCANOES IN THE AREA TO ERUPT DUE TO THE INTENSITY OF THE FREQUENCY VIBRATIONS!", [
            this.createImage('dragon', 182, 172, 0, this.pageWidth - 230, 30, 1),
            this.createImage('windAttack', 105, 120, 0, this.pageWidth - 240, 180, 1),
        ]);

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    createPage(name, type, foundAt, description, images) {
        this.pages.push({
            name: name,
            type: type,
            foundAt: foundAt,
            description: description,
            images: images
        });
    }

    createImage(enemyImage, frameWidth, frameHeight, enemyFrame, enemyX, enemyY, size, type) {
        return {
            enemyImage: document.getElementById(enemyImage),
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            enemyFrame: enemyFrame,
            enemyX: enemyX,
            enemyY: enemyY,
            size: size,
            type: type //'red' or 'stun' or null
        };
    }

    applyStyledText(context, text, startX, startY, styles) {
        const punctuation = [',', '.', '!', '?'];

        let currentX = startX;
        let currentY = startY;

        while (text.length > 0) {
            context.save();

            let matchFound = false;
            for (const [name, style] of Object.entries(styles)) {
                const regex = new RegExp(`\\b${name}\\b`);
                const index = text.search(regex);
                if (index !== -1) {
                    const beforeText = text.substring(0, index);
                    const styledText = text.match(regex)[0];
                    let afterText = text.substring(index + styledText.length);

                    context.fillStyle = 'black';
                    context.fillText(beforeText, currentX, currentY);
                    currentX += context.measureText(beforeText).width;

                    context.fillStyle = style.fill;
                    context.strokeStyle = style.stroke;
                    context.lineWidth = 4;
                    context.shadowColor = style.stroke;
                    context.shadowBlur = style.strokeBlur;

                    context.strokeText(styledText, currentX, currentY);
                    context.fillText(styledText, currentX, currentY);

                    currentX += context.measureText(styledText).width;

                    if (afterText.length > 0 && punctuation.includes(afterText[0])) {
                        context.fillStyle = 'black';
                        context.fillText(afterText[0], currentX, currentY);
                        currentX += context.measureText(afterText[0]).width;
                        afterText = afterText.substring(1);
                    }

                    text = afterText;
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                context.fillStyle = 'black';
                context.fillText(text, currentX, currentY);
                break;
            }
            context.restore();
        }
    }

    applyTextStyles(context, text, startX, startY) {
        const styles = {
            "EVERYWHERE": { fill: 'black', stroke: 'white', strokeBlur: 5 },
            "LUNAR MOONLIT GLADE": { fill: 'blue', stroke: 'green', strokeBlur: 5 },
            "NIGHTFALL CITY PHANTOM": { fill: 'purple', stroke: 'black', strokeBlur: 5 },
            "CORAL ABYSS": { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 5 },
            "VERDANT VINE": { fill: 'seagreen', stroke: 'black', strokeBlur: 15 },
            "SPRINGLY LEMONY": { fill: 'yellow', stroke: 'orange', strokeBlur: 5 },
            "INFERNAL CRATER PEAK": { fill: 'red', stroke: 'black', strokeBlur: 10 }
        };
        this.applyStyledText(context, text, startX, startY, styles);
    }

    applyTypeTextStyles(context, text, startX, startY) {
        const styles = {
            "RED": { fill: 'red', stroke: 'black', strokeBlur: 1 },
            "STUN": { fill: 'yellow', stroke: 'black', strokeBlur: 1 },
        };
        this.applyStyledText(context, text, startX, startY, styles);
    }

    drawPageContent(context, pageIndex, x, y) {
        const page = this.pages[pageIndex];
        context.font = 'bold 21px "Gloria Hallelujah"';
        context.fillStyle = 'black';
        context.textAlign = 'left';

        // checks if map is locked, if so, it blurs the information of the page
        const lockConditions = [
            { mapUnlocked: this.game.map2Unlocked, pageLimit: 9 },
            { mapUnlocked: this.game.map3Unlocked, pageLimit: 14 },
            { mapUnlocked: this.game.map4Unlocked, pageLimit: 21 },
            { mapUnlocked: this.game.map5Unlocked, pageLimit: 29 },
            { mapUnlocked: this.game.map6Unlocked, pageLimit: 39 }
        ];

        let locked = false;
        for (const condition of lockConditions) {
            if (!condition.mapUnlocked && pageIndex >= condition.pageLimit) {
                locked = true;
                break;
            }
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

                if (image.type === 'red') {
                    context.shadowColor = 'red';
                    context.shadowBlur = 20;
                } else if (image.type === 'stun') {
                    context.shadowColor = 'yellow';
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

        if (locked) {
            context.fillText(`NAME: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`TYPE: ??? & ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`FOUND AT: ???`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`DESCRIPTION: ???`, x + 20, y + offsetY);
        } else {
            context.fillText(`NAME: ${page.name}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            this.applyTypeTextStyles(context, `TYPE: ${page.type}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            this.applyTextStyles(context, `FOUND AT: ${page.foundAt}`, x + 20, y + offsetY);
            offsetY += lineHeight + gapHeight;
            context.fillText(`DESCRIPTION:`, x + 20, y + offsetY);
            offsetY += lineHeight;

            const words = page.description.split(' ');
            let line = '';
            let lines = [];

            words.forEach((word, index) => {
                if (word.includes('\n')) {
                    const [firstPart, secondPart] = word.split('\n');
                    let testLine = line + firstPart + ' ';
                    let metrics = context.measureText(testLine);
                    if (metrics.width > maxWidth) {
                        lines.push(line.trim());
                        line = firstPart + ' ';
                    } else {
                        line = testLine;
                    }
                    lines.push(line.trim());
                    line = secondPart + ' ';
                } else {
                    let testLine = line + word + ' ';
                    let metrics = context.measureText(testLine);
                    if (metrics.width > maxWidth) {
                        lines.push(line.trim());
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                }
            });

            if (line.trim()) {
                lines.push(line.trim());
            }

            lines.forEach((line, index) => {
                this.applyTextStyles(context, line, x + 20, y + offsetY + index * lineHeight, maxWidth);
            });

            offsetY += lines.length * lineHeight;
        }
    }

    draw(context) {
        if (this.menuActive) {
            this.game.audioHandler.menu.stopSound('soundtrack');

            if (this.game.map2Unlocked && this.game.map3Unlocked === false) {
                context.drawImage(this.backgroundImageNight, 0, 0, this.game.width, this.game.height);
            } else {
                context.drawImage(this.backgroundImage, 0, 0, this.game.width, this.game.height);
            }

            context.save();
            const bookBackgroundX = (this.game.width - this.enemyLoreBookBackground.width) / 2;
            const bookBackgroundY = (this.game.height - this.enemyLoreBookBackground.height) / 2;
            context.drawImage(this.enemyLoreBookBackground, bookBackgroundX, bookBackgroundY);

            context.drawImage(this.leftPageBackground, this.bookX, this.bookY, this.pageWidth, this.pageHeight);
            context.drawImage(this.rightPageBackground, this.bookX + this.pageWidth, this.bookY, this.pageWidth, this.pageHeight);

            this.drawPageContent(context, this.currentPage, this.bookX, this.bookY);
            if (this.currentPage + 1 < this.pages.length) {
                this.drawPageContent(context, this.currentPage + 1, this.bookX + this.pageWidth, this.bookY);
            }

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
    }

    nextPage() {
        const maxValidIndex = this.pages.length % 2 === 0 ? this.pages.length - 2 : this.pages.length - 1;
        if (this.currentPage < maxValidIndex) {
            this.currentPage++;
            this.game.audioHandler.menu.playSound('bookFlip', false, true);
        }
    }
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.game.audioHandler.menu.playSound('bookFlip', false, true);
        }
    }
    // 2 methods above don't work for clicking/scrolling as it goes up by 1, instead of 2
    // but the 2 methods underneath work fine
    clickNextPage() {
        const maxValidIndex = this.pages.length % 2 === 0 ? this.pages.length - 2 : this.pages.length - 1;
        if (this.currentPage < maxValidIndex) {
            this.currentPage += 2;
            this.game.audioHandler.menu.playSound('bookFlip', false, true);
        }
    }
    clickPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage -= 2;
            this.game.audioHandler.menu.playSound('bookFlip', false, true);
        }
    }

    //keyboard
    handleKeyDown(event) {
        if (this.menuActive) {
            if (event.key === 'ArrowRight') {
                this.nextPage();
            } else if (event.key === 'ArrowLeft') {
                this.previousPage();
            }
        }
    }
    //mouse
    handleMouseWheel(event) {
        if (this.menuActive) {
            const delta = Math.sign(event.deltaY);

            if (delta < 0) {
                this.clickNextPage();
            } else if (delta > 0) {
                this.clickPreviousPage();
            }
        }
    }

    handleMouseClick(event) {
        if (this.menuActive) {
            const rect = this.game.canvas.getBoundingClientRect();
            const scaleX = this.game.canvas.width / rect.width;
            const scaleY = this.game.canvas.height / rect.height;

            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;

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
            }
            else if (mouseX >= rightPageBounds.x &&
                mouseX <= rightPageBounds.x + rightPageBounds.width &&
                mouseY >= rightPageBounds.y &&
                mouseY <= rightPageBounds.y + rightPageBounds.height) {
                this.clickNextPage();
            }
        }
    }

    handleMouseMove(event) {
        // do nothing
    }
}