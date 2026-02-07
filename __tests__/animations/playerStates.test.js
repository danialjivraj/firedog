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
    Dashing,
} from '../../game/animations/playerStates';

jest.mock('../../game/animations/particles.js', () => {
    class Dust { constructor() { } }
    class Bubble { constructor() { } }
    class Fire { constructor() { } }
    class Splash { constructor() { } }
    class IceCrystal { constructor() { } }

    class DashGhost { constructor() { } }
    class DashFireArc { constructor() { } }

    return { Dust, Bubble, Fire, Splash, IceCrystal, DashGhost, DashFireArc };
});

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
    DASHING: 10,
};

describe('playerStates.js', () => {
    let game, player, input, sfx;

    const makeGame = () => {
        sfx = { firedogSFX: { playSound: jest.fn() } };
        input = {
            isRollAttack: jest.fn(() => false),
        };

        player = {
            setState: jest.fn(),
            tryStartDash: jest.fn(() => false),

            x: 100,
            y: 200,
            width: 50,
            height: 80,

            facingRight: true,
            getCurrentSkinImage: jest.fn(() => ({ id: 'fakeSkinImg' })),

            getCurrentCosmeticImagesInOrder: jest.fn(() => []),

            vy: 0,
            weight: 5,
            gravity: undefined,

            onGround: jest.fn(() => true),

            energy: 10,
            isEnergyExhausted: false,

            divingTimer: 0,
            divingCooldown: 100,

            isUnderwater: false,
            isSlowed: false,

            previousState: states.SITTING,
            states: Object.values(states),

            drainEnergy: jest.fn(),

            particleImage: 'fire',
            buoyancy: 0,

            frameX: 0,
            maxFrame: 0,
            frameY: 0,

            isSpace: false,
            canSpaceDoubleJump: false,

            isBluePotionActive: false,

            isDashing: false,
            dashGhostTimer: 0,
            dashGhostInterval: 32,
        };

        game = {
            gameOver: false,
            menu: { gameOver: { activateMenu: jest.fn() } },

            player,
            particles: [],
            behindPlayerParticles: [],

            input,

            cabin: { isFullyVisible: false },

            boss: { talkToBoss: false },
            isBossVisible: false,

            width: 1920,
            height: 689,

            audioHandler: sfx,
            collisions: [],

            deltaTime: 16,
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

        return game;
    };

    const lastParticleName = () =>
        game.particles.length ? game.particles[0].constructor.name : null;

    beforeEach(() => {
        makeGame();
    });

    describe('Base State gameOver()', () => {
        it('short-circuits to DYING and opens game-over menu when game.gameOver is true', () => {
            game.gameOver = true;
            input.isRollAttack.mockReturnValue(true);

            const st = new Running(game);
            st.handleInput([]);

            expect(game.menu.gameOver.activateMenu).toHaveBeenCalled();
            expect(player.setState).toHaveBeenCalledWith(states.DYING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Sitting
    // -------------------------------------------------------------------------
    describe('Sitting', () => {
        let st;
        beforeEach(() => {
            st = new Sitting(game);
        });

        it('enter() sets sitting animation frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(4);
            expect(player.frameY).toBe(5);
        });

        it('left/right input transitions to RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('jump input transitions to JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('roll click when cabin is not fully visible and boss is not visible → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('roll click when boss is visible and energy not depleted → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });

        it('roll click when boss is visible but energy depleted → no transition', () => {
            game.isBossVisible = true;
            player.isEnergyExhausted = true;
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
        beforeEach(() => {
            st = new Running(game);
        });

        it('enter() sets running animation frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(8);
            expect(player.frameY).toBe(3);
        });

        it('spawns IceCrystal when slowed, otherwise spawns Dust', () => {
            player.isSlowed = true;
            st.handleInput([]);
            expect(lastParticleName()).toBe('IceCrystal');

            game.particles = [];
            player.isSlowed = false;
            st.handleInput([]);
            expect(lastParticleName()).toBe('Dust');
        });

        it('when boss is visible, first tick sets STANDING (oneTime) and subsequent ticks still idle to STANDING', () => {
            game.isBossVisible = true;

            st.handleInput([]);
            st.handleInput([]);

            const standingCalls = player.setState.mock.calls.filter(
                ([state, speed]) => state === states.STANDING && speed === 0
            );

            expect(standingCalls).toHaveLength(3);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('jump has priority over sit when both are pressed', () => {
            st.handleInput(['w', 's']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('jump input transitions to JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('pressing both left and right results in no state change (still running)', () => {
            player.setState.mockClear();
            st.handleInput(['a', 'd']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('roll click when cabin is not fully visible and energy not depleted → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('no left/right input when cabin is fully visible → STANDING', () => {
            game.cabin.isFullyVisible = true;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('sit input (without left/right) transitions to SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('sit input while moving left/right does nothing (stays RUNNING)', () => {
            player.setState.mockClear();
            st.handleInput(['a', 's']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('boss visible with energy depleted: roll click does not trigger ROLLING; falls back to STANDING', () => {
            game.isBossVisible = true;
            player.isEnergyExhausted = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
            expect(player.setState).not.toHaveBeenCalledWith(states.ROLLING, expect.any(Number));
        });

        it('when boss.talkToBoss is true, transition logic is blocked (still spawns particles)', () => {
            game.boss.talkToBoss = true;

            st.handleInput(['w']);

            expect(game.particles.length).toBeGreaterThan(0);
            expect(player.setState).not.toHaveBeenCalledWith(states.JUMPING, expect.any(Number));
        });
    });

    // -------------------------------------------------------------------------
    // Jumping
    // -------------------------------------------------------------------------
    describe('Jumping', () => {
        let st;

        beforeEach(() => {
            st = new Jumping(game);
            player.onGround.mockReturnValue(true);
        });

        it('enter() (non-space) applies strong jump when onGround, plays SFX, and sets frames', () => {
            st.enter();
            expect(player.vy).toBe(-27);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
            expect(player.frameY).toBe(1);
            expect(player.maxFrame).toBe(6);
        });

        it('enter() (space) sets vy=-9, enables canSpaceDoubleJump when onGround, and plays SFX', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = false;
            player.onGround.mockReturnValue(true);

            st.enter();

            expect(player.vy).toBe(-9);
            expect(player.canSpaceDoubleJump).toBe(true);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
            expect(player.frameY).toBe(1);
        });

        it('underwater + jump input spawns Bubble, moves up 4px, sets JUMPING, and updates buoyancy', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);

            const baseY = player.y;

            st.handleInput(['w']);

            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.y).toBe(baseY - 4);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
            expect([1, 2, 3, 4]).toContain(player.buoyancy);
        });

        it('sit key with dive ready and no left/right → DIVING(0)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = 100;
            player.divingCooldown = 100;

            st.handleInput(['s']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('sit key with dive ready and left/right → DIVING(1)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;

            st.handleInput(['s', 'd']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 1);
        });

        it('separate diveAttack binding triggers dive when ready', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            game.keyBindings.diveAttack = 'Shift';
            game.keyBindings.sit = 's';

            st.handleInput(['Shift']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('roll click while jumping with energy not depleted and cabin not fully visible → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            player.onGround.mockReturnValue(false);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('roll requested but energy depleted + sit + dive ready → DIVING(0) instead of ROLLING', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            player.isEnergyExhausted = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput(['s']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('vy > weight and not underwater → FALLING', () => {
            player.onGround.mockReturnValue(false);
            player.vy = 10;

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('onGround → RUNNING', () => {
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
            st = new Falling(game);
            player.onGround.mockReturnValue(false);
        });

        it('enter() sets falling animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(2);
        });

        it('space double jump in air → JUMPING and disables double jump', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.onGround.mockReturnValue(false);

            st.handleInput(['w']);

            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('underwater + jump input spawns Bubble and transitions to JUMPING', () => {
            game.player.isUnderwater = true;

            st.handleInput(['w']);

            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('roll click while onGround and cabin fully visible → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('landing after falling plays fallingSFX then transitions to RUNNING', () => {
            player.onGround.mockReturnValue(true);

            st.handleInput([]);

            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('fallingSFX');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('sit key with dive ready and no left/right → DIVING(0)', () => {
            player.divingTimer = 100;
            player.divingCooldown = 100;

            st.handleInput(['s']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('sit key with dive ready and left/right → DIVING(1)', () => {
            player.divingTimer = player.divingCooldown;

            st.handleInput(['s', 'd']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 1);
        });

        it('boss visible + roll click while onGround → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('roll click in air with energy not depleted and cabin not fully visible → ROLLING(2)', () => {
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
        beforeEach(() => {
            st = new Rolling(game);
        });

        it('enter() sets rolling animation frames', () => {
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.maxFrame).toBe(6);
        });

        it('when roll input is not held: drains energy, spawns Fire, and transitions based on groundedness', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(player.drainEnergy).toHaveBeenCalled();
            expect(game.particles[0].constructor.name).toBe('Fire');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);

            player.setState.mockClear();
            player.drainEnergy.mockClear();
            game.particles = [];

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

        it('roll click + jump on ground (non-space) applies strong jump vy=-27', () => {
            player.onGround.mockReturnValue(true);
            input.isRollAttack.mockReturnValue(true);

            st.handleInput(['w']);

            expect(player.vy).toBe(-27);
        });

        it('sit + dive ready mid-air with left/right: blue potion → DIVING(4)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            player.isBluePotionActive = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput(['s', 'a']);

            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 4);
        });

        it('when isEnergyExhausted and onGround → transitions to RUNNING fallback', () => {
            player.isEnergyExhausted = true;
            player.energy = 0;

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('when isEnergyExhausted mid-air: vy<=0 → JUMPING, vy>0 → FALLING', () => {
            player.isEnergyExhausted = true;
            player.onGround.mockReturnValue(false);

            player.vy = 0;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);

            player.setState.mockClear();
            player.vy = 5;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('when isEnergyExhausted while underwater → FALLING', () => {
            player.isEnergyExhausted = true;
            player.isUnderwater = true;

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('when cabin is fully visible while rolling → STANDING(0)', () => {
            game.cabin.isFullyVisible = true;

            st.enter();
            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('boss visible while rolling triggers one-time STANDING(0)', () => {
            game.isBossVisible = true;

            st.handleInput([]);
            st.handleInput([]);

            const standingCalls = player.setState.mock.calls.filter(
                ([state]) => state === states.STANDING
            );
            expect(standingCalls.length).toBe(1);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });
    });

    // -------------------------------------------------------------------------
    // Diving
    // -------------------------------------------------------------------------
    describe('Diving', () => {
        let st;
        beforeEach(() => {
            st = new Diving(game);
            player.onGround.mockReturnValue(true);
        });

        it('enter() sets diving frames and vy=15 for non-space', () => {
            player.isSpace = false;
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.vy).toBe(15);
        });

        it('enter() sets vy=7 for space', () => {
            player.isSpace = true;
            st.enter();
            expect(player.vy).toBe(7);
        });

        it('underwater and onGround: spawns Fire and 30 Splash', () => {
            game.player.isUnderwater = true;

            st.handleInput(['x']);

            expect(game.particles.some(p => p.constructor.name === 'Fire')).toBe(true);
            expect(game.particles.filter(p => p.constructor.name === 'Splash')).toHaveLength(30);
        });

        it('underwater in air: sets gravity/vy, spawns Fire only (no Splash burst)', () => {
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

        it('onGround + jump (no roll) plays divingSFX, spawns Splash burst, then transitions to JUMPING', () => {
            input.isRollAttack.mockReturnValue(false);

            st.handleInput(['w']);

            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('divingSFX', false, true);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
            expect(game.particles.filter(p => p.constructor.name === 'Splash')).toHaveLength(30);
        });

        it('roll click + cabin fully visible while diving → STANDING', () => {
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('underwater + roll click + jump → ROLLING(2)', () => {
            game.player.isUnderwater = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput(['w']);

            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('blue particle image while diving onGround → 90 Splash', () => {
            player.onGround.mockReturnValue(true);
            player.isBluePotionActive = true;

            st.handleInput([]);

            expect(game.particles.filter(p => p.constructor.name === 'Splash')).toHaveLength(90);
        });

        it('roll click onGround when cabin not fully visible → RUNNING', () => {
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = false;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('space double jump out of dive: with roll → ROLLING(2) + jumpSFX; without roll → JUMPING', () => {
            player.isSpace = true;
            player.canSpaceDoubleJump = true;
            player.onGround.mockReturnValue(false);

            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.canSpaceDoubleJump).toBe(false);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');

            player.setState.mockClear();
            sfx.firedogSFX.playSound.mockClear();

            player.canSpaceDoubleJump = true;
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

        it('when animation completes on ground: returns to SITTING if previousState was SITTING, else RUNNING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(true);

            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);

            player.setState.mockClear();
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('when animation completes in air → FALLING', () => {
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

        it('when animation completes on ground: returns to SITTING if previousState was SITTING, else RUNNING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(true);

            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);

            player.setState.mockClear();
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('when animation completes in air → FALLING', () => {
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
        beforeEach(() => {
            st = new Standing(game);
        });

        it('enter() sets standing animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(0);
        });

        it('underwater + roll click while not onGround → FALLING', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('boss visible + roll click with energy not depleted → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });

        it('boss visible + roll click with energy depleted → no ROLLING transition', () => {
            game.isBossVisible = true;
            player.isEnergyExhausted = true;
            input.isRollAttack.mockReturnValue(true);

            st.handleInput([]);

            expect(player.setState).not.toHaveBeenCalledWith(states.ROLLING, expect.any(Number));
        });

        it('left/right input → RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('sit input → SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('jump input → JUMPING(0)', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 0);
        });
    });

    // -------------------------------------------------------------------------
    // Dashing
    // -------------------------------------------------------------------------
    describe('Dashing', () => {
        let st;

        beforeEach(() => {
            st = new Dashing(game);
        });

        it('enter() sets dash animation, resets dashGhostTimer, spawns 1 DashGhost behind; DashFireArc spawn begins on handleInput ticks', () => {
            player.dashGhostTimer = 999;

            st.enter();

            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(8);
            expect(player.frameY).toBe(3);

            expect(player.dashGhostTimer).toBe(0);
            expect(player.getCurrentSkinImage).toHaveBeenCalled();

            expect(game.behindPlayerParticles).toHaveLength(1);
            expect(game.behindPlayerParticles[0].constructor.name).toBe('DashGhost');

            expect(game.particles.filter(p => p.constructor.name === 'DashFireArc')).toHaveLength(0);

            jest.spyOn(Math, 'random').mockReturnValue(0.99);

            st.handleInput([]);

            expect(game.particles.filter(p => p.constructor.name === 'DashFireArc')).toHaveLength(2);

            Math.random.mockRestore();
        });

        it('handleInput() spawns additional DashGhost when dashGhostTimer crosses dashGhostInterval', () => {
            st.enter();
            expect(game.behindPlayerParticles).toHaveLength(1);

            game.deltaTime = 16;
            st.handleInput([]);
            expect(game.behindPlayerParticles).toHaveLength(1);

            st.handleInput([]);
            expect(game.behindPlayerParticles).toHaveLength(2);
        });

        it('handleInput() spawns DashFireArc each interval and can spawn an extra when Math.random()<0.35', () => {
            st.enter();
            const baseCount = game.particles.filter(p => p.constructor.name === 'DashFireArc').length;

            jest.spyOn(Math, 'random').mockReturnValue(0);

            game.deltaTime = 16;
            st.handleInput([]);

            const after = game.particles.filter(p => p.constructor.name === 'DashFireArc').length;

            expect(after - baseCount).toBe(4);

            Math.random.mockRestore();
        });

        it('handleInput() returns early (no state transitions) while player.isDashing is true', () => {
            st.enter();
            player.isDashing = true;

            player.setState.mockClear();
            st.handleInput(['a', 'w']);

            expect(player.setState).not.toHaveBeenCalled();
        });

        it('when dash ends mid-air: vy>weight and not underwater → FALLING, else → JUMPING', () => {
            st.enter();
            player.isDashing = false;

            player.onGround.mockReturnValue(false);
            player.isUnderwater = false;

            player.vy = 10;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);

            player.setState.mockClear();

            player.vy = 0;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('when dash ends on ground and worldStopped: LR → RUNNING, no LR → STANDING', () => {
            st.enter();
            player.isDashing = false;
            player.onGround.mockReturnValue(true);

            game.isBossVisible = true;
            player.setState.mockClear();

            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);

            player.setState.mockClear();
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('when dash ends on ground and world is moving: always RUNNING', () => {
            st.enter();
            player.isDashing = false;
            player.onGround.mockReturnValue(true);

            game.isBossVisible = false;
            game.cabin.isFullyVisible = false;

            player.setState.mockClear();
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });
    });

    // -------------------------------------------------------------------------
    // Dying
    // -------------------------------------------------------------------------
    describe('Dying', () => {
        let st;
        beforeEach(() => {
            st = new Dying(game);
        });

        it('constructor initializes deathAnimation=false', () => {
            expect(st.deathAnimation).toBe(false);
        });

        it('enter() sets dying animation frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(11);
            expect(player.frameY).toBe(8);
        });

        it('underwater + frameX>=maxFrame clamps frameX and sets deathAnimation', () => {
            player.isUnderwater = true;
            player.maxFrame = 11;
            player.frameX = 11;

            st.handleInput();

            expect(player.frameX).toBe(player.maxFrame);
            expect(st.deathAnimation).toBe(true);
        });

        it('space + frameX>=maxFrame clamps frameX and sets deathAnimation (space path)', () => {
            player.isUnderwater = false;
            player.isSpace = true;
            player.maxFrame = 11;
            player.frameX = 11;

            st.handleInput();

            expect(player.frameX).toBe(player.maxFrame);
            expect(st.deathAnimation).toBe(true);
        });

        it('frameX>=maxFrame onGround clamps frameX and sets deathAnimation', () => {
            player.maxFrame = 11;
            player.frameX = 11;
            player.onGround.mockReturnValue(true);

            st.handleInput();

            expect(player.frameX).toBe(player.maxFrame);
            expect(st.deathAnimation).toBe(true);
        });

        it('onGround plays deathFall SFX', () => {
            player.onGround.mockReturnValue(true);

            st.handleInput();

            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('deathFall');
        });
    });
});
