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

    it('always short-circuits to DYING if game.gameOver is true', () => {
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

        it('enter() sets frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(4);
            expect(player.frameY).toBe(5);
        });

        it('a/d → RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('w → JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('click (cabin locked) → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('click + boss visible → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });
    });

    // -------------------------------------------------------------------------
    // Running
    // -------------------------------------------------------------------------
    describe('Running', () => {
        let st;
        beforeEach(() => { st = new Running(game); });

        it('enter() sets frames', () => {
            st.enter();
            expect(player.frameX).toBe(0);
            expect(player.maxFrame).toBe(8);
            expect(player.frameY).toBe(3);
        });

        it('isSlowed → IceCrystal', () => {
            player.isSlowed = true;
            st.handleInput([]);
            expect(game.particles[0].constructor.name).toBe('IceCrystal');
        });

        it('normal → Dust', () => {
            st.handleInput([]);
            expect(game.particles[0].constructor.name).toBe('Dust');
        });

        it('boss appears once then “no a/d” fallback → four STANDINGs', () => {
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

        it('w+s → no state change (stay RUNNING)', () => {
            player.setState.mockClear();
            st.handleInput(['w', 's']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('w → JUMPING', () => {
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('a+d → remain in RUNNING (no state change)', () => {
            const st2 = new Running(game);
            player.setState.mockClear();
            st2.handleInput(['a', 'd']);
            expect(player.setState).not.toHaveBeenCalled();
        });

        it('click & !cabin & energy>0 → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('no a/d & cabin visible → STANDING', () => {
            game.cabin.isFullyVisible = true;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('s only → SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
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

        it('enter() jumps & plays SFX & sets frames', () => {
            st.enter();
            expect(player.vy).toBe(-27);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('jumpSFX');
            expect(player.frameY).toBe(1);
        });

        it('underwater + w → Bubble + y-=4 + buoyancy', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            st.handleInput(['w']);
            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.y).toBe(baseY - 4);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
            expect([1, 2, 3, 4]).toContain(player.buoyancy);
        });

        it('s & divingTimer ready → DIVING(0)', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = 100; player.divingCooldown = 100;
            st.handleInput(['s']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('click & !cabin & energy>0 → ROLLING(2)', () => {
            input.isRollAttack.mockReturnValue(true);
            player.onGround.mockReturnValue(false);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('vy>weight & not underwater → FALLING', () => {
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
            player.onGround.mockReturnValue(false);
            st = new Falling(game);
        });

        it('enter() sets frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(2);
        });

        it('underwater w → Bubble+JUMPING+buoyancy', () => {
            game.player.isUnderwater = true;
            st.handleInput(['w']);
            expect(game.particles[0].constructor.name).toBe('Bubble');
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('click & onGround & cabin → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('onGround → fallingSFX+RUNNING', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('fallingSFX');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('s & divingTimer → DIVING(0)', () => {
            player.divingTimer = 100; player.divingCooldown = 100;
            st.handleInput(['s']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 0);
        });

        it('click & boss visible & onGround → STANDING', () => {
            player.onGround.mockReturnValue(true);
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('click & !cabin & energy>0 → ROLLING(2)', () => {
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

        it('enter() sets frames', () => {
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.maxFrame).toBe(6);
        });

        it('drainEnergy + Fire + RUNNING onGround no click', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput([]);
            expect(player.drainEnergy).toHaveBeenCalled();
            expect(game.particles[0].constructor.name).toBe('Fire');
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('click+w on ground → vy jump', () => {
            player.onGround.mockReturnValue(true);
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.vy).toBe(-27);
        });

        it('s+divingTimer on air → DIVING(4) when blue', () => {
            player.onGround.mockReturnValue(false);
            player.divingTimer = player.divingCooldown;
            player.isBluePotionActive = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['s', 'a']);
            expect(player.divingTimer).toBe(0);
            expect(player.setState).toHaveBeenCalledWith(states.DIVING, 4);
        });

        it('energyReachedZero & energy<=0 → RUNNING fallback', () => {
            player.energyReachedZero = true;
            player.energy = 0;
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('cabin visible → STANDING(0)', () => {
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

        it('enter() sets frames & vy', () => {
            st.enter();
            expect(player.frameY).toBe(6);
            expect(player.vy).toBe(15);
        });

        it('underwater always Fire + 30 Splash', () => {
            game.player.isUnderwater = true;
            st.handleInput(['x']);
            expect(game.particles.filter(p => p.constructor.name === 'Splash')).toHaveLength(30);
            expect(game.particles.find(p => p.constructor.name === 'Fire')).toBeTruthy();
        });

        it('onGround+w → 30 Splash + SFX + JUMPING', () => {
            input.isRollAttack.mockReturnValue(false);
            st.handleInput(['w']);
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('divingSFX', false, true);
            expect(player.setState).toHaveBeenCalledWith(states.JUMPING, 1);
        });

        it('click & cabin visible → STANDING', () => {
            game.cabin.isFullyVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.STANDING, 0);
        });

        it('underwater click+w → ROLLING(2)', () => {
            game.player.isUnderwater = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput(['w']);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 2);
        });

        it('Diving: blue particle image → 90 Splash', () => {
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

        it('Diving: click & onGround & !cabin → RUNNING', () => {
            const st2 = new Diving(game);
            player.onGround.mockReturnValue(true);
            game.cabin.isFullyVisible = false;
            input.isRollAttack.mockReturnValue(true);
            st2.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
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

        it('enter() sets frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(10);
            expect(player.frameY).toBe(4);
        });

        it('frameX>=10 & onGround & prev=SITTING → SITTING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(true);
            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('frameX>=10 & onGround & prev!=SITTING → RUNNING', () => {
            player.frameX = 10;
            player.onGround.mockReturnValue(true);
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('frameX>=10 & !onGround → FALLING', () => {
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

        it('enter() sets frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(3);
            expect(player.frameY).toBe(9);
        });

        it('frameX>=3 & onGround & prev=SITTING → SITTING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(true);
            player.previousState = states.SITTING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('frameX>=3 & onGround & prev!=SITTING → RUNNING', () => {
            player.frameX = 3;
            player.onGround.mockReturnValue(true);
            player.previousState = states.RUNNING;
            st.handleInput();
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('frameX>=3 & !onGround → FALLING', () => {
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

        it('enter() sets frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(6);
            expect(player.frameY).toBe(0);
        });

        it('underwater click & !ground → FALLING', () => {
            game.player.isUnderwater = true;
            player.onGround.mockReturnValue(false);
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.FALLING, 1);
        });

        it('boss visible & click & energy>0 → ROLLING(0)', () => {
            game.isBossVisible = true;
            input.isRollAttack.mockReturnValue(true);
            st.handleInput([]);
            expect(player.setState).toHaveBeenCalledWith(states.ROLLING, 0);
        });

        it('a/d → RUNNING', () => {
            st.handleInput(['a']);
            expect(player.setState).toHaveBeenCalledWith(states.RUNNING, 1);
        });

        it('s → SITTING', () => {
            st.handleInput(['s']);
            expect(player.setState).toHaveBeenCalledWith(states.SITTING, 0);
        });

        it('w → JUMPING(0)', () => {
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

        it('constructor deathAnimation=false', () => {
            expect(st.deathAnimation).toBe(false);
        });

        it('enter() sets frames', () => {
            st.enter();
            expect(player.maxFrame).toBe(11);
            expect(player.frameY).toBe(8);
        });

        it('underwater & frameX>=max → deathAnimation true', () => {
            player.isUnderwater = true;
            player.maxFrame = 11;
            player.frameX = 11;
            st.handleInput();
            expect(st.deathAnimation).toBe(true);
        });

        it('frameX>=max & onGround → deathAnimation true', () => {
            player.maxFrame = 11;
            player.frameX = 11;
            player.onGround.mockReturnValue(true);
            st.handleInput();
            expect(st.deathAnimation).toBe(true);
        });

        it('onGround → plays deathFall', () => {
            player.onGround.mockReturnValue(true);
            st.handleInput();
            expect(sfx.firedogSFX.playSound).toHaveBeenCalledWith('deathFall');
        });
    });
});
