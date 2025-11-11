import { Dust, Bubble, Fire, Splash, IceCrystal } from "../animations/particles.js";

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

const P = game => game.player;

const left = (game, input) => game.input.isActionActive('moveBackward', input);
const right = (game, input) => game.input.isActionActive('moveForward', input);
const jump = (game, input) => game.input.isActionActive('jump', input);
const sit = (game, input) => game.input.isActionActive('sit', input);
const dive = (game, input) => game.input.isActionActive('diveAttack', input);

const sitEqualsDive = (game) => {
    const s = game.keyBindings && game.keyBindings.sit;
    const d = game.keyBindings && game.keyBindings.diveAttack;
    return !!s && s === d;
};

const anyLR = (game, input) => left(game, input) || right(game, input);

const rollRequested = (game, input) => game.input.isRollAttack(input);

const setAnim = (player, { x = 0, max, y }) => {
    player.frameX = x;
    player.maxFrame = max;
    player.frameY = y;
};

const spawnDust = (game, x, y) => game.particles.unshift(new Dust(game, x, y));
const spawnBubble = (game, x, y) => game.particles.unshift(new Bubble(game, x, y));
const spawnFire = (game, x, y) => game.particles.unshift(new Fire(game, x, y));
const spawnIceCrystal = (game, x, y) => game.particles.unshift(new IceCrystal(game, x, y));

function handleUnderwaterAscend(game, input) {
    if (jump(game, input) && !game.gameOver) {
        P(game).y = P(game).y - 4;
        P(game).setState(states.JUMPING, 1);
        if (P(game).y < game.height - 400) {
            P(game).buoyancy = 1;
        } else if (P(game).y < game.height - 300) {
            P(game).buoyancy = 2;
        } else if (P(game).y < game.height - 200) {
            P(game).buoyancy = 3;
        } else if (P(game).y < game.height - 100) {
            P(game).buoyancy = 4;
        }
    }
}

// ------------------------------
// Base State
// ------------------------------
class State {
    constructor(state, game) {
        this.state = state;
        this.game = game;
    }
    gameOver() {
        if (this.game.gameOver) {
            this.game.menu.gameOver.activateMenu();
            this.game.player.setState(states.DYING, 1);
        }
    }
}

// ------------------------------
// States
// ------------------------------
export class Sitting extends State {
    constructor(game) {
        super("SITTING", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 4, y: 5 });
    }
    handleInput(input) {
        this.gameOver();

        if (anyLR(this.game, input)) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (jump(this.game, input)) {
            this.game.player.setState(states.JUMPING, 1);
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (this.game.isElyvorgFullyVisible) {
                if (!this.game.player.energyReachedZero) {
                    this.game.player.setState(states.ROLLING, 0);
                }
            } else {
                this.game.player.setState(states.ROLLING, 2);
            }
        }
    }
}

export class Running extends State {
    constructor(game) {
        super("RUNNING", game);
    }

    enter() {
        setAnim(this.game.player, { x: 0, max: 8, y: 3 });
    }

    handleInput(input) {
        this.gameOver();

        if (this.game.player.isSlowed) {
            spawnIceCrystal(
                this.game,
                this.game.player.x + this.game.player.width * 0.6 + 13,
                this.game.player.y + this.game.player.height
            );
        } else {
            spawnDust(
                this.game,
                this.game.player.x + this.game.player.width * 0.6,
                this.game.player.y + this.game.player.height
            );
        }

        if (this.game.talkToElyvorg) {
            // do nothing
        } else if (this.game.isElyvorgFullyVisible && !this.oneTime) {
            this.game.player.setState(states.STANDING, 0);
            this.oneTime = true;
        }

        if (this.game.talkToElyvorg) {
            // do nothing
        } else if (jump(this.game, input) && sit(this.game, input)) {
            // do nothing
        } else if (jump(this.game, input)) {
            this.game.player.setState(states.JUMPING, 1);
        } else if (rollRequested(this.game, input)) {
            if (this.game.isElyvorgFullyVisible === true) {
                if (!this.game.player.energyReachedZero) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            } else if (!this.game.cabin.isFullyVisible) {
                if (!this.game.player.energyReachedZero) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            }
        } else if (
            !anyLR(this.game, input) &&
            (this.game.cabin.isFullyVisible || this.game.isElyvorgFullyVisible)
        ) {
            this.game.player.setState(states.STANDING, 0);
        } else if (sit(this.game, input) && anyLR(this.game, input)) {
            // do nothing
        } else if (sit(this.game, input)) {
            this.game.player.setState(states.SITTING, 0);
        } else if (
            this.game.isElyvorgFullyVisible === true &&
            this.game.player.energyReachedZero === true &&
            rollRequested(this.game, input) &&
            anyLR(this.game, input)
        ) {
            // do nothing
        }
    }
}

export class Jumping extends State {
    constructor(game) {
        super("JUMPING", game);
    }
    enter() {
        if (this.game.player.onGround()) this.game.player.vy -= 27;
        setAnim(this.game.player, { x: 0, max: 6, y: 1 });
        if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("jumpSFX");
        }
    }
    handleInput(input) {
        this.gameOver();

        if (this.game.player.isUnderwater === true) {
            spawnBubble(
                this.game,
                this.game.player.x + this.game.player.width * 0.8,
                this.game.player.y + this.game.player.height
            );
            handleUnderwaterAscend(this.game, input);
        }

        if (this.game.player.onGround()) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (
            this.game.player.vy > this.game.player.weight &&
            this.game.player.isUnderwater === false
        ) {
            this.game.player.setState(states.FALLING, 1);
        } else if (
            (dive(this.game, input) || (sit(this.game, input) && sitEqualsDive(this.game))) &&
            this.game.player.divingTimer >= this.game.player.divingCooldown
        ) {
            this.game.player.divingTimer = 0;
            if (anyLR(this.game, input)) {
                this.game.player.setState(states.DIVING, 1);
            } else {
                this.game.player.setState(states.DIVING, 0);
            }
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (!this.game.player.energyReachedZero) {
                this.game.player.setState(states.ROLLING, 2);
            } else if (
                this.game.player.energyReachedZero === true &&
                sit(this.game, input) &&
                this.game.player.divingTimer >= this.game.player.divingCooldown
            ) {
                this.game.player.divingTimer = 0;
                this.game.player.setState(states.DIVING, 0);
            }
        }
    }
}

export class Falling extends State {
    constructor(game) {
        super("FALLING", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 6, y: 2 });
    }
    handleInput(input) {
        this.gameOver();

        if (this.game.player.isUnderwater === true) {
            spawnBubble(
                this.game,
                this.game.player.x + this.game.player.width * 0.8,
                this.game.player.y + this.game.player.height
            );
            if (jump(this.game, input)) {
                this.game.player.y = this.game.player.y - 4;
                this.game.player.setState(states.JUMPING, 1);
                if (this.game.player.y < this.game.height - 400) {
                    this.game.player.buoyancy = 1;
                } else if (this.game.player.y < this.game.height - 300) {
                    this.game.player.buoyancy = 2;
                } else if (this.game.player.y < this.game.height - 200) {
                    this.game.player.buoyancy = 3;
                } else if (this.game.player.y < this.game.height - 100) {
                    this.game.player.buoyancy = 4;
                }
            }
        }

        if (rollRequested(this.game, input) && this.game.player.onGround() && this.game.cabin.isFullyVisible) {
            this.game.player.setState(states.STANDING, 0);
        } else if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("fallingSFX");
            this.game.player.setState(states.RUNNING, 1);
        } else if (
            (dive(this.game, input) || (sit(this.game, input) && sitEqualsDive(this.game))) &&
            this.game.player.divingTimer >= this.game.player.divingCooldown
        ) {
            this.game.player.divingTimer = 0;
            if (anyLR(this.game, input)) {
                this.game.player.setState(states.DIVING, 1);
            } else {
                this.game.player.setState(states.DIVING, 0);
            }
        }
        if (rollRequested(this.game, input) && this.game.isElyvorgFullyVisible && this.game.player.onGround()) {
            this.game.player.setState(states.STANDING, 0);
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (this.game.player.energy > 0) {
                if (!this.game.player.energyReachedZero) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            }
        }
    }
}

export class Rolling extends State {
    constructor(game) {
        super("ROLLING", game);
    }

    enter() {
        setAnim(this.game.player, { x: 0, max: 6, y: 6 });
    }

    handleInput(input) {
        this.gameOver();

        if (!this.game.player.energyReachedZero) {
            this.game.player.drainEnergy();

            if (this.game.isElyvorgFullyVisible && !this.oneTime) {
                this.game.player.setState(states.STANDING, 0);
                this.oneTime = true;
            }
            if (this.game.cabin.isFullyVisible) {
                this.game.player.setState(states.STANDING, 0);
            } else {
                spawnFire(
                    this.game,
                    this.game.player.x + this.game.player.width * 0.5,
                    this.game.player.y + this.game.player.height * 0.5
                );

                if (!rollRequested(this.game, input) && this.game.player.onGround()) {
                    this.game.player.setState(states.RUNNING, 1);
                } else if (!rollRequested(this.game, input) && !this.game.player.onGround()) {
                    this.game.player.setState(states.FALLING, 1);
                } else if (rollRequested(this.game, input) && jump(this.game, input) && this.game.player.onGround()) {
                    this.game.player.vy -= 27;
                } else if (
                    sit(this.game, input) &&
                    this.game.player.divingTimer >= this.game.player.divingCooldown &&
                    !this.game.player.onGround()
                ) {
                    this.game.player.divingTimer = 0;
                    if (anyLR(this.game, input)) {
                        if (this.game.player.isBluePotionActive) {
                            this.game.player.setState(states.DIVING, 4);
                        } else {
                            this.game.player.setState(states.DIVING, 2);
                        }
                    } else {
                        this.game.player.setState(states.DIVING, 0);
                    }
                }
            }
        } else if (this.game.player.isUnderwater === false) {
            if (this.game.isElyvorgFullyVisible) {
                this.game.player.setState(states.STANDING, 0);
            } else {
                this.game.player.setState(states.RUNNING, 1);
            }
        } else {
            this.game.player.setState(states.FALLING, 1);
        }
    }
}

export class Diving extends State {
    constructor(game) {
        super("DIVING", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 6, y: 6 });
        this.game.player.vy = 15;
    }
    handleInput(input) {
        this.gameOver();

        if (this.game.player.isUnderwater === true) {
            this.game.player.gravity = 1;
            this.game.player.vy = 15;
        }

        spawnFire(
            this.game,
            this.game.player.x + this.game.player.width * 0.5,
            this.game.player.y + this.game.player.height * 0.5
        );

        const isBlueParticle =
            this.game.player.particleImage === "bluefire" || this.game.player.particleImage === "bluebubble";
        let numberOfParticles = isBlueParticle ? 90 : 30;

        if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("divingSFX", false, true);
            if (this.game.player.onGround() && jump(this.game, input)) {
                this.game.player.setState(states.JUMPING, 1);
            } else {
                this.game.player.setState(states.RUNNING, 1);
            }
            for (let i = 0; i < numberOfParticles; i++) {
                this.game.particles.unshift(
                    new Splash(
                        this.game,
                        this.game.player.x + this.game.player.width * -0.1,
                        this.game.player.y
                    )
                );
            }
        }

        if (rollRequested(this.game, input) && this.game.player.onGround() && this.game.cabin.isFullyVisible) {
            this.game.player.setState(states.STANDING, 0);
        }

        if (this.game.player.isUnderwater === true) {
            if (rollRequested(this.game, input) && jump(this.game, input)) {
                this.game.player.setState(states.ROLLING, 2);
            } else if (jump(this.game, input)) {
                this.game.player.setState(states.JUMPING, 1);
            }
        }
    }
}

export class Stunned extends State {
    constructor(game) {
        super("STUNNED", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 10, y: 4 });
    }
    handleInput() {
        this.gameOver();
        if (this.game.player.frameX >= 10 && this.game.player.onGround()) {
            if (this.game.player.previousState === this.game.player.states[0]) {
                this.game.player.setState(states.SITTING, 0);
            } else {
                this.game.player.setState(states.RUNNING, 1);
            }
        } else if (this.game.player.frameX >= 10 && !this.game.player.onGround()) {
            this.game.player.setState(states.FALLING, 1);
        }
    }
}

export class Hit extends State {
    constructor(game) {
        super("HIT", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 3, y: 9 });
    }
    handleInput() {
        this.gameOver();
        if (this.game.player.frameX >= 3 && this.game.player.onGround()) {
            if (this.game.player.previousState === this.game.player.states[0]) {
                this.game.player.setState(states.SITTING, 0);
            } else {
                this.game.player.setState(states.RUNNING, 1);
            }
        } else if (this.game.player.frameX >= 3 && !this.game.player.onGround()) {
            this.game.player.setState(states.FALLING, 1);
        }
    }
}

export class Standing extends State {
    constructor(game) {
        super("STANDING", game);
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 6, y: 0 });
    }
    handleInput(input) {
        this.gameOver();

        if (this.game.player.isUnderwater === true) {
            if (rollRequested(this.game, input) && !this.game.player.onGround()) {
                this.game.player.setState(states.FALLING, 1);
            }
        }

        if (this.game.isElyvorgFullyVisible) {
            if (rollRequested(this.game, input) && this.game.player.energyReachedZero === false) {
                this.game.player.setState(states.ROLLING, 0);
            }
        }

        if (anyLR(this.game, input)) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (sit(this.game, input)) {
            this.game.player.setState(states.SITTING, 0);
        } else if (jump(this.game, input)) {
            this.game.player.setState(states.JUMPING, 0);
        }
    }
}

export class Dying extends State {
    constructor(game) {
        super("DYING", game);
        this.deathAnimation = false;
    }
    enter() {
        setAnim(this.game.player, { x: 0, max: 11, y: 8 });
    }
    handleInput() {
        if (this.game.player.isUnderwater === true) {
            if (this.game.player.frameX >= this.game.player.maxFrame) {
                this.game.player.frameX = this.game.player.maxFrame;
                this.deathAnimation = true;
            }
        }

        if (this.game.player.frameX >= this.game.player.maxFrame && this.game.player.onGround()) {
            this.game.player.frameX = this.game.player.maxFrame;
            this.deathAnimation = true;
        }
        if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("deathFall");
        }
    }
}
