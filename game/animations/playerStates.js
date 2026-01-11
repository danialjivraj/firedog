import { Dust, Bubble, Fire, Splash, IceCrystal, DashGhost, DashFireArc } from "../animations/particles.js";

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

const spawnDashGhost = (game, player) => {
    const img = player.getCurrentSkinImage();
    if (!img) return;

    const sx = player.frameX * player.width;
    const sy = player.frameY * player.height;

    game.behindPlayerParticles.unshift(
        new DashGhost(game, {
            img,
            sx,
            sy,
            sw: player.width,
            sh: player.height,
            x: player.x,
            y: player.y,
            dw: player.width,
            dh: player.height,
            facingRight: player.facingRight,
        })
    );
};

const spawnDashFireArc = (game, player, count = 1) => {
    const facingRight = player.facingRight;
    const x = player.x + (facingRight ? player.width * 0.98 : player.width * 0.02);
    const y = player.y + player.height * 0.52;

    for (let i = 0; i < count; i++) {
        game.particles.unshift(new DashFireArc(game, x, y, facingRight, game.cabin.isFullyVisible || game.isBossVisible));
    }
};

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
        const player = this.game.player;
        if (this.game.gameOver) {
            this.game.menu.gameOver.activateMenu();
            player.setState(states.DYING, 1);
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
        const player = this.game.player;
        setAnim(player, { x: 0, max: 4, y: 5 });
    }
    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (anyLR(this.game, input)) {
            player.setState(states.RUNNING, 1);
        } else if (jump(this.game, input)) {
            player.setState(states.JUMPING, 1);
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (this.game.isBossVisible) {
                if (!player.isEnergyExhausted) {
                    player.setState(states.ROLLING, 0);
                }
            } else {
                player.setState(states.ROLLING, 2);
            }
        }
    }
}

export class Running extends State {
    constructor(game) {
        super("RUNNING", game);
    }

    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 8, y: 3 });
    }

    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (player.isSlowed) {
            spawnIceCrystal(
                this.game,
                player.x + player.width * 0.6 + 13,
                player.y + player.height
            );
        } else {
            spawnDust(
                this.game,
                player.x + player.width * 0.6,
                player.y + player.height
            );
        }

        if (this.game.boss.talkToBoss) {
            // do nothing
        } else if (this.game.isBossVisible && !this.oneTime) {
            player.setState(states.STANDING, 0);
            this.oneTime = true;
        }

        if (this.game.boss.talkToBoss) {
            // do nothing
        } else if (jump(this.game, input)) {
            player.setState(states.JUMPING, 1);
        } else if (
            rollRequested(this.game, input) &&
            (this.game.isBossVisible === true || !this.game.cabin.isFullyVisible)
        ) {
            if (!player.isEnergyExhausted) {
                player.setState(states.ROLLING, 2);
            }

        } else if (
            !anyLR(this.game, input) &&
            (this.game.cabin.isFullyVisible || this.game.isBossVisible)
        ) {
            player.setState(states.STANDING, 0);
        } else if (sit(this.game, input) && anyLR(this.game, input)) {
            // do nothing
        } else if (sit(this.game, input)) {
            player.setState(states.SITTING, 0);
        }
    }
}

export class Jumping extends State {
    constructor(game) {
        super("JUMPING", game);
    }
    enter() {
        const player = this.game.player;

        if (player.isSpace) {
            player.vy = -9;

            if (player.onGround()) {
                player.canSpaceDoubleJump = true;
            }

            this.game.audioHandler.firedogSFX.playSound("jumpSFX");
        } else {
            if (player.onGround()) {
                player.vy -= 27;
                this.game.audioHandler.firedogSFX.playSound("jumpSFX");
            }
        }

        setAnim(player, { x: 0, max: 6, y: 1 });
    }

    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (player.isUnderwater === true) {
            spawnBubble(
                this.game,
                player.x + player.width * 0.8,
                player.y + player.height
            );
            handleUnderwaterAscend(this.game, input);
        }

        if (player.onGround()) {
            player.setState(states.RUNNING, 1);
        } else if (
            player.vy > player.weight &&
            player.isUnderwater === false
        ) {
            player.setState(states.FALLING, 1);
        } else if (
            (dive(this.game, input) || (sit(this.game, input) && sitEqualsDive(this.game))) &&
            player.divingTimer >= player.divingCooldown
        ) {
            if (anyLR(this.game, input)) {
                player.setState(states.DIVING, 1);
            } else {
                player.setState(states.DIVING, 0);
            }
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (!player.isEnergyExhausted) {
                player.setState(states.ROLLING, 2);
            } else if (
                player.isEnergyExhausted === true &&
                sit(this.game, input) &&
                player.divingTimer >= player.divingCooldown
            ) {
                player.setState(states.DIVING, 0);
            }
        }
    }
}

export class Falling extends State {
    constructor(game) {
        super("FALLING", game);
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 6, y: 2 });
    }
    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (
            player.isSpace &&
            !player.onGround() &&
            jump(this.game, input) &&
            player.canSpaceDoubleJump
        ) {
            player.canSpaceDoubleJump = false;
            player.setState(states.JUMPING, 1);
            return;
        }

        if (player.isUnderwater === true) {
            spawnBubble(
                this.game,
                player.x + player.width * 0.8,
                player.y + player.height
            );
            if (jump(this.game, input)) {
                player.y = player.y - 4;
                player.setState(states.JUMPING, 1);
                if (player.y < this.game.height - 400) {
                    player.buoyancy = 1;
                } else if (player.y < this.game.height - 300) {
                    player.buoyancy = 2;
                } else if (player.y < this.game.height - 200) {
                    player.buoyancy = 3;
                } else if (player.y < this.game.height - 100) {
                    player.buoyancy = 4;
                }
            }
        }

        if (rollRequested(this.game, input) && player.onGround() && this.game.cabin.isFullyVisible) {
            player.setState(states.STANDING, 0);
        } else if (player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("fallingSFX");
            player.setState(states.RUNNING, 1);
        } else if (
            (dive(this.game, input) || (sit(this.game, input) && sitEqualsDive(this.game))) &&
            player.divingTimer >= player.divingCooldown
        ) {
            if (anyLR(this.game, input)) {
                player.setState(states.DIVING, 1);
            } else {
                player.setState(states.DIVING, 0);
            }
        }
        if (rollRequested(this.game, input) && this.game.isBossVisible && player.onGround()) {
            player.setState(states.STANDING, 0);
        } else if (rollRequested(this.game, input) && !this.game.cabin.isFullyVisible) {
            if (player.energy > 0) {
                if (!player.isEnergyExhausted) {
                    player.setState(states.ROLLING, 2);
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
        const player = this.game.player;
        setAnim(player, { x: 0, max: 6, y: 6 });
    }

    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (!player.isEnergyExhausted) {
            player.drainEnergy();

            if (
                player.isSpace &&
                !player.onGround() &&
                player.vy >= 0 &&
                jump(this.game, input) &&
                player.canSpaceDoubleJump
            ) {
                player.canSpaceDoubleJump = false;
                player.vy = -9;
                this.game.audioHandler.firedogSFX.playSound("jumpSFX");
                return;
            }

            if (this.game.isBossVisible && !this.oneTime) {
                player.setState(states.STANDING, 0);
                this.oneTime = true;
            }
            if (this.game.cabin.isFullyVisible) {
                player.setState(states.STANDING, 0);
            } else {
                spawnFire(
                    this.game,
                    player.x + player.width * 0.5,
                    player.y + player.height * 0.5
                );

                if (!rollRequested(this.game, input) && player.onGround()) {
                    player.setState(states.RUNNING, 1);

                } else if (!rollRequested(this.game, input) && !player.onGround()) {
                    player.setState(states.FALLING, 1);

                } else if (
                    rollRequested(this.game, input) &&
                    jump(this.game, input) &&
                    player.onGround()
                ) {
                    if (player.isSpace) {
                        player.vy = -9;
                        player.canSpaceDoubleJump = true;
                    } else {
                        player.vy -= 27;
                    }
                    this.game.audioHandler.firedogSFX.playSound("jumpSFX");
                } else if (
                    sit(this.game, input) &&
                    player.divingTimer >= player.divingCooldown &&
                    !player.onGround()
                ) {
                    if (anyLR(this.game, input)) {
                        if (player.isBluePotionActive) {
                            player.setState(states.DIVING, 4);
                        } else {
                            player.setState(states.DIVING, 2);
                        }
                    } else {
                        player.setState(states.DIVING, 0);
                    }
                }
            }
        } else if (player.isUnderwater === false) {
            if (player.onGround()) {
                if (this.game.isBossVisible) {
                    player.setState(states.STANDING, 0);
                } else {
                    player.setState(states.RUNNING, 1);
                }
            } else {
                if (player.vy <= 0) {
                    player.setState(states.JUMPING, 1);
                } else {
                    player.setState(states.FALLING, 1);
                }
            }
        } else {
            player.setState(states.FALLING, 1);
        }
    }
}

export class Diving extends State {
    constructor(game) {
        super("DIVING", game);
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 6, y: 6 });

        if (player.isSpace) {
            player.vy = 7;
        } else {
            player.vy = 15;
        }
    }
    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (
            player.isSpace &&
            !player.onGround() &&
            jump(this.game, input) &&
            player.canSpaceDoubleJump
        ) {
            player.canSpaceDoubleJump = false;
            player.divingTimer = 100;
            if (rollRequested(this.game, input)) {
                player.vy = -9;
                this.game.audioHandler.firedogSFX.playSound("jumpSFX");
                player.setState(states.ROLLING, 2);
            } else {
                player.setState(states.JUMPING, 1);
            }
            return;
        }

        if (player.isUnderwater === true) {
            player.gravity = 1;
            player.vy = 15;
        }

        spawnFire(
            this.game,
            player.x + player.width * 0.5,
            player.y + player.height * 0.5
        );

        const numberOfParticles = player.isBluePotionActive ? 90 : 30;

        if (player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("divingSFX", false, true);
            player.divingTimer = 0;
            if (jump(this.game, input)) player.setState(states.JUMPING, 1);
            else player.setState(states.RUNNING, 1);
            for (let i = 0; i < numberOfParticles; i++) {
                this.game.particles.unshift(
                    new Splash(this.game, player.x + player.width * -0.1, player.y)
                );
            }
        }

        if (rollRequested(this.game, input) && player.onGround() && this.game.cabin.isFullyVisible) {
            player.setState(states.STANDING, 0);
        }

        if (player.isUnderwater === true) {
            if (rollRequested(this.game, input) && jump(this.game, input)) {
                player.divingTimer = 0;
                player.setState(states.ROLLING, 2);
            } else if (jump(this.game, input)) {
                player.divingTimer = 0;
                player.setState(states.JUMPING, 1);
            }
        }
    }
}

export class Stunned extends State {
    constructor(game) {
        super("STUNNED", game);
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 10, y: 4 });
    }
    handleInput() {
        this.gameOver();

        const player = this.game.player;

        if (player.frameX >= 10 && player.onGround()) {
            if (player.previousState === player.states[0]) {
                player.setState(states.SITTING, 0);
            } else {
                player.setState(states.RUNNING, 1);
            }
        } else if (player.frameX >= 10 && !player.onGround()) {
            player.setState(states.FALLING, 1);
        }
    }
}

export class Hit extends State {
    constructor(game) {
        super("HIT", game);
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 3, y: 9 });
    }
    handleInput() {
        this.gameOver();

        const player = this.game.player;

        if (player.frameX >= 3 && player.onGround()) {
            if (player.previousState === player.states[0]) {
                player.setState(states.SITTING, 0);
            } else {
                player.setState(states.RUNNING, 1);
            }
        } else if (player.frameX >= 3 && !player.onGround()) {
            player.setState(states.FALLING, 1);
        }
    }
}

export class Standing extends State {
    constructor(game) {
        super("STANDING", game);
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 6, y: 0 });
    }
    handleInput(input) {
        this.gameOver();

        const player = this.game.player;

        if (player.tryStartDash(input)) return;

        if (player.isUnderwater === true) {
            if (rollRequested(this.game, input) && !player.onGround()) {
                player.setState(states.FALLING, 1);
            }
        }

        if (this.game.isBossVisible) {
            if (rollRequested(this.game, input) && player.isEnergyExhausted === false) {
                player.setState(states.ROLLING, 0);
            }
        }

        if (anyLR(this.game, input)) {
            player.setState(states.RUNNING, 1);
        } else if (sit(this.game, input)) {
            player.setState(states.SITTING, 0);
        } else if (jump(this.game, input)) {
            player.setState(states.JUMPING, 0);
        }
    }
}

export class Dying extends State {
    constructor(game) {
        super("DYING", game);
        this.deathAnimation = false;
    }
    enter() {
        const player = this.game.player;
        setAnim(player, { x: 0, max: 11, y: 8 });
    }
    handleInput() {
        const player = this.game.player;

        if ((player.isUnderwater || player.isSpace) && player.frameX >= player.maxFrame) {
            player.frameX = player.maxFrame;
            this.deathAnimation = true;
        }

        if (player.frameX >= player.maxFrame && player.onGround()) {
            player.frameX = player.maxFrame;
            this.deathAnimation = true;
        }
        if (player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound("deathFall");
        }
    }
}

export class Dashing extends State {
    constructor(game) {
        super("DASHING", game);

        this.dashFireTimer = 0;
        this.dashFireInterval = 16;
    }

    enter() {
        const player = this.game.player;

        setAnim(player, { x: 0, max: 8, y: 3 });

        player.dashGhostTimer = 0;
        spawnDashGhost(this.game, player);

        this.dashFireTimer = 0;
    }

    handleInput(input) {
        this.gameOver();

        const player = this.game.player;
        const dt = this.game.deltaTime ?? 16;

        player.dashGhostTimer += dt;
        while (player.dashGhostTimer >= player.dashGhostInterval) {
            player.dashGhostTimer -= player.dashGhostInterval;
            spawnDashGhost(this.game, player);
        }

        const numberOfParticles = player.isBluePotionActive ? 4 : 2;

        this.dashFireTimer += dt;
        while (this.dashFireTimer >= this.dashFireInterval) {
            this.dashFireTimer -= this.dashFireInterval;

            spawnDashFireArc(this.game, player, numberOfParticles);

            if (Math.random() < 0.35) {
                spawnDashFireArc(this.game, player, numberOfParticles);
            }
        }

        if (player.isDashing) return;

        if (!player.onGround()) {
            if (player.vy > player.weight && !player.isUnderwater) {
                player.setState(states.FALLING, 1);
            } else {
                player.setState(states.JUMPING, 1);
            }
            return;
        }

        const worldStopped = this.game.isBossVisible || this.game.cabin.isFullyVisible;

        if (worldStopped) {
            if (anyLR(this.game, input)) player.setState(states.RUNNING, 1);
            else player.setState(states.STANDING, 0);
        } else {
            player.setState(states.RUNNING, 1);
        }
    }
}
