import {
    Sitting,
    Running,
    Jumping,
    Falling,
    Rolling,
    Diving,
    Stunned,
    Hit,
    Standing,
    Dying,
} from '../../game/animations/playerStates';

const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    STUNNED: 6,
    HIT: 7,
    STANDING: 8,
    DYING: 9,
};

describe('Player State Machine', () => {
    let game, player, input, sfx;

    beforeEach(() => {
        sfx = { firedogSFX: { playSound: jest.fn() } };
        input = { isRollAttack: jest.fn(() => false) };

        player = {
            setState: jest.fn(),
            x: 100, y: 200,
            width: 50, height: 80,
            vy: 0, weight: 5,
            onGround: jest.fn(() => true),
            energy: 10, energyReachedZero: false,
            divingTimer: 0, divingCooldown: 100,
            isUnderwater: false, isSlowed: false,
            previousState: states.SITTING,
            states: Object.values(states),
            drainEnergy: jest.fn(),
            particleImage: 'fire',
            buoyancy: 0,
            frameX: 0, maxFrame: 0, frameY: 0,
            isSpace: false,
            canSpaceDoubleJump: false,
            isBluePotionActive: false,
        };

        game = {
            gameOver: false,
            menu: { gameOver: { activateMenu: jest.fn() } },
            player,
            particles: [],
            input,
            cabin: { isFullyVisible: false },

            boss: {
                talkToBoss: false,
            },
            isBossVisible: false,

            width: 1920, height: 689,
            audioHandler: sfx,
            collisions: [],
        };

        game.keyBindings = {
            moveForward: 'd',
            moveBackward: 'a',
            jump: 'w',
            sit: 's',
            diveAttack: 's',
        };

        game.input.isActionActive = (action, keys) => {
            const key = game.keyBindings[action];
            if (!key) return false;
            if (Array.isArray(keys)) return keys.includes(key);
            if (keys && typeof keys === 'object') return !!keys[key];
            return false;
        };
    });

    it('short-circuits to DYING and opens game-over menu when game.gameOver is true', () => {
        game.gameOver = true;
        input.isRollAttack.mockReturnValue(true);
        const st = new Running(game);
        st.handleInput([]);
        expect(game.menu.gameOver.activateMenu).toHaveBeenCalled();
        expect(player.setState).toHaveBeenCalledWith(states.DYING, 1);
    });

    // -------------------------------------------------------------------------
    // Sitting
    // -------------------------------------------------------------------------
    describe('Sitting', () => {
        let st;
        beforeEach(() => { st = new Sitting(game); });

        it('enter() sets sitting animation frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(4);
            expect(player.frameY).toBe(5);
        });

        it('a/d pressed while sitting → RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('w pressed while sitting → JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('roll click with cabin locked and no boss → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('roll click with boss visible and energy>0 → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });

        it('roll click with boss visible but energy depleted → no ROLLING transition', () => {
            game.isBossVisible = true;
            player.energyReachedZero = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // Running
    // -------------------------------------------------------------------------
    describe('Running', () => {
        let st;
        beforeEach(() => { st = new Running(game); });

        it('enter() sets running animation frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(8);
            expect(player.frameY).toBe(3);
        });

        it('isSlowed true while running → spawns IceCrystal', () => {
            player.isSlowed = true;
            st.handleInput([]);
            expect(game.particles[0].constructor.name).toBe('IceCrystal');
        });

        it('normal running → spawns Dust', () => {
            st.handleInput([]);
            expect(game.particles[0].constructor.name).toBe('Dust');
        });

        it('boss appears once then subsequent inputs without a/d still go to STANDING', () => {
            game.isBossVisible = true;
            st.handleInput([]);
            st.handleInput([]);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledTimes(4);
            expect(player.setState).toHaveBeenNthCalledWith(1, states.STANDING, 0);
            expect(player.setState).toHaveBeenNthCalledWith(2, states.STANDING, 0);
            expect(player.setState).toHaveBeenNthCalledWith(3, states.STANDING, 0);
            expect(player.setState).toHaveBeenNthCalledWith(4, states.STANDING, 0);
        });

        it('w+s pressed together while running → JUMPING (jump wins over sit)', () => {
            player.setState.mockClear();
            st.handleInput(['w', 's']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('w pressed while running → JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('a+d opposite directions → remains in RUNNING (no state change)', () => {
            const st2 = new Running(game);
            player.setState.mockClear();
            st2.handleInput(['a', 'd']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('roll click & !cabin & energy>0 → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('no a/d & cabin visible → STANDING', () => {
            game.cabin.isFullyVisible = true;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('s only while running → SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('s with lateral input while running → remain in RUNNING (do nothing)', () => {
            player.setState.mockClear();
            st.handleInput(['a', 's']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('boss visible but energy depleted → click does not cause ROLLING', () => {
            game.isBossVisible = true;
            player.energyReachedZero = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
            expect(player.setState).not.toHaveBeenCalledWith(states.ROLLING, expect.any(Number));
        });
    });

    // -------------------------------------------------------------------------
    // Jumping
    // -------------------------------------------------------------------------
    describe('Jumping', () => {
        let st, baseY;
        beforeEach(() => {
            player.onGround.mockReturnValue(true);
            st = new Jumping(game);
            baseY = player.y;
        });

        it('enter() (non-space) applies strong jump, plays SFX, and sets jumping frames', () => {
            st.enter();
            expect(player.vy).toBe(-27);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
            expect(player.frameY).toBe(1);
        });

        it('underwater + w → spawns Bubble, ascends 4px, sets JUMPING, and updates buoyancy', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            st.handleInput(['w']);
            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.y).toBe(baseY - 4);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
            expect([1, 2, 3, 4]).toContain(player.buoyancy);
        });

        it('s with divingTimer ready (no LR) → DIVING(0)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = 100; player.divingCooldown = 100;
            st.handleInput(['s']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('s + lateral input with divingTimer ready → DIVING(1)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            st.handleInput(['s', 'd']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 1);
        });

        it('separate diveAttack key triggers dive when ready', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            game.keyBindings.diveAttack = 'Shift';
            game.keyBindings.sit = 's'; // different keys
            st.handleInput(['Shift']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('click & !cabin & energy>0 while jumping → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            player.onGround.mockReturnValue(false);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('roll requested but energy depleted + sit + ready timer → DIVING(0) instead of ROLLING', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            player.energyReachedZero = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['s']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('vy>weight and not underwater → FALLING', () => {
            player.onGround.mockReturnValue(false);
            player.vy = 10;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('onGround while jumping → RUNNING', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Falling
    // -------------------------------------------------------------------------
    describe('Falling', () => {
        let st;
        beforeEach(() => {
            player.onGround.mockReturnValue(false);
            st = new Falling(game);
        });

        it('enter() sets falling animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(2);
        });

        it('space double jump in air → sets JUMPING and disables double jump', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.onGround.mockReturnValue(false);
            st.handleInput(['w']);
            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('underwater + w while falling → Bubble + JUMPING + buoyancy update', () => {
            game.player.isUnderwater = true;
            st.handleInput(['w']);
            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('click & onGround & cabin visible → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('onGround after falling → plays fallingSFX then RUNNING', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('fallingSFX');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('s with divingTimer ready and no LR → DIVING(0)', () => {
            player.divingTimer = 100; player.divingCooldown = 100;
            st.handleInput(['s']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('s with divingTimer ready and lateral input → DIVING(1)', () => {
            player.divingTimer = player.divingCooldown;
            st.handleInput(['s', 'd']);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 1);
        });

        it('click & boss visible & onGround → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('click & !cabin & energy>0 in air → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            player.onGround.mockReturnValue(false);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });
    });

    // -------------------------------------------------------------------------
    // Rolling
    // -------------------------------------------------------------------------
    describe('Rolling', () => {
        let st;
        beforeEach(() => { st = new Rolling(game); });

        it('enter() sets rolling animation frames', () => {
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.maxFrame).toBe(6);
        });

        it('onGround without roll input → drainEnergy, spawn Fire, then RUNNING', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(player.drainEnergy).toHaveBeenCalled();
            expect(game.particles[0].constructor.name).toBe('Fire');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('no roll input while airborne → drainEnergy, spawn Fire, then FALLING', () => {
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(false);
            st.handleInput([]);
            expect(player.drainEnergy).toHaveBeenCalled();
            expect(game.particles[0].constructor.name).toBe('Fire');
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('space double jump from rolling mid-air → vy=-9 and plays jumpSFX', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.vy = 0;
            player.onGround.mockReturnValue(false);
            st.handleInput(['w']);
            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.vy).toBe(-9);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
        });

        it('roll click + w on ground (non-space) → strong jump vy=-27', () => {
            player.onGround.mockReturnValue(true);
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.vy).toBe(-27);
        });

        it('s+divingTimer in air with blue potion and LR → DIVING(4)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            player.isBluePotionActive = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['s', 'a']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 4);
        });

        it('energyReachedZero & energy<=0 onGround → RUNNING fallback', () => {
            player.energyReachedZero = true;
            player.energy = 0;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('energy depleted mid-air with vy<=0 → JUMPING', () => {
            player.energyReachedZero = true;
            player.onGround.mockReturnValue(false);
            player.vy = 0;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('energy depleted mid-air while falling (vy>0) → FALLING', () => {
            player.energyReachedZero = true;
            player.onGround.mockReturnValue(false);
            player.vy = 5;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('energy depleted while underwater → FALLING', () => {
            player.energyReachedZero = true;
            player.isUnderwater = true;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('cabin visible while rolling → STANDING(0)', () => {
            const rollState = new Rolling(game);
            game.cabin.isFullyVisible = true;
            rollState.enter();
            rollState.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });
    });

    // -------------------------------------------------------------------------
    // Diving
    // -------------------------------------------------------------------------
    describe('Diving', () => {
        let st;
        beforeEach(() => {
            player.onGround.mockReturnValue(true);
            st = new Diving(game);
        });

        it('enter() sets diving animation frames and downward vy', () => {
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.vy).toBe(15);
        });

        it('underwater and onGround → Fire + 30 Splash', () => {
            game.player.isUnderwater = true;
            st.handleInput(['x']);
            expect(game.particles.filter(p => p.constructor.name === 'Splash')).toHaveLength(30);
            expect(game.particles.find(p => p.constructor.name === 'Fire')).toBeTruthy();
        });

        it('underwater in air → adjusts gravity/vy, Fire only, no Splash burst', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            const start = game.particles.length;
            st.handleInput([]);
            expect(player.gravity).toBe(1);
            expect(player.vy).toBe(15);
            const newParticles = game.particles.slice(start);
            expect(newParticles.some(p => p.constructor.name === 'Fire')).toBe(true);
            expect(newParticles.some(p => p.constructor.name === 'Splash')).toBe(false);
        });

        it('onGround + w (no roll) → plays divingSFX, 30 Splash, then JUMPING', () => {
            input.isRollAttack.mockReturnValue(false);
            st.handleInput(['w']);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('divingSFX', false, true);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('click & cabin visible while diving → STANDING', () => {
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('underwater + click+w → ROLLING(2)', () => {
            game.player.isUnderwater = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('blue particle image while diving onGround → 90 Splash', () => {
            const st2 = new Diving(game);
            player.onGround.mockReturnValue(true);
            player.particleImage = 'bluefire';
            const start = game.particles.length;
            st2.handleInput([]);
            const splashes = game.particles
                .slice(start)
                .filter(p => p.constructor.name === 'Splash');
            expect(splashes).toHaveLength(90);
        });

        it('click & onGround & !cabin → RUNNING', () => {
            const st2 = new Diving(game);
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = false;
            input.isRollAttack.mockReturnValue(true);
            st2.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('space double jump out of dive with roll → ROLLING(2)', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
        });

        it('space double jump out of dive without roll → JUMPING', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(false);
            st.handleInput(['w']);
            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Stunned
    // -------------------------------------------------------------------------
    describe('Stunned', () => {
        let st;
        beforeEach(() => {
            st = new Stunned(game);
            player.setState.mockClear();
        });

        it('enter() sets stunned animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(10);
            expect(player.frameY).toBe(4);
        });

        it('frameX>=10 & onGround & previousState=SITTING → SITTING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(true);
            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('frameX>=10 & onGround & previousState!=SITTING → RUNNING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(true);
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('frameX>=10 & not onGround → FALLING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(false);
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Hit
    // -------------------------------------------------------------------------
    describe('Hit', () => {
        let st;
        beforeEach(() => {
            st = new Hit(game);
            player.setState.mockClear();
        });

        it('enter() sets hit animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(3);
            expect(player.frameY).toBe(9);
        });

        it('frameX>=3 & onGround & previousState=SITTING → SITTING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(true);
            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('frameX>=3 & onGround & previousState!=SITTING → RUNNING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(true);
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('frameX>=3 & not onGround → FALLING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(false);
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Standing
    // -------------------------------------------------------------------------
    describe('Standing', () => {
        let st;
        beforeEach(() => { st = new Standing(game); });

        it('enter() sets standing animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(0);
        });

        it('underwater roll click while not onGround → FALLING', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('boss visible & roll click & energy>0 → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });

        it('boss visible but energy depleted → no ROLLING from roll click', () => {
            game.isBossVisible = true;
            player.energyReachedZero = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).not.toHaveBeenCalledWith(states.ROLLING, expect.any(Number));
        });

        it('a/d while standing → RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('s while standing → SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('w while standing → JUMPING(0)', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 0);
        });
    });

    // -------------------------------------------------------------------------
    // Dying
    // -------------------------------------------------------------------------
    describe('Dying', () => {
        let st;
        beforeEach(() => { st = new Dying(game); });

        it('constructor initializes deathAnimation to false', () => {
            expect(st.deathAnimation).toBe(false);
        });

        it('enter() sets dying animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(11);
            expect(player.frameY).toBe(8);
        });

        it('underwater & frameX>=maxFrame → clamps frameX and sets deathAnimation true', () => {
            player.isUnderwater = true;
            player.maxFrame = 11;
            player.frameX = 11;
            st.handleInput();
            expect(player.frameX).toBe(player.maxFrame);
            expect(st.deathAnimation).toBe(true);
        });

        it('frameX>=maxFrame & onGround → clamps frameX and sets deathAnimation true', () => {
            player.maxFrame = 11;
            player.frameX = 11;
            player.onGround.mockReturnValue(true);
            st.handleInput();
            expect(player.frameX).toBe(player.maxFrame);
            expect(st.deathAnimation).toBe(true);
        });

        it('onGround while dying → plays deathFall SFX', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput();
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('deathFall');
        });
    });
});
