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
    DYING: 9
}

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

export class Sitting extends State {
    constructor(game) {
        super('SITTING', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 4;
        this.game.player.frameY = 5;
    }
    handleInput(input) {
        this.gameOver();
        if (input.includes('a') || input.includes('d')) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('w')) {
            this.game.player.setState(states.JUMPING, 1);
        } else if (this.game.input.enterOrRightClick(input) && !this.game.cabin.isFullyVisible) {
            if (this.game.isElyvorgFullyVisible) {
                if (this.game.player.energyReachedZero === true) {
                } else {
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
        super('RUNNING', game);
    }

    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 8;
        this.game.player.frameY = 3;
    }

    handleInput(input) {
        this.gameOver();
        if (this.game.player.isSlowed) {
            this.game.particles.unshift(new IceCrystal(
                this.game,
                this.game.player.x + this.game.player.width * 0.6 + 13,
                this.game.player.y + this.game.player.height
            ));
        } else {
            this.game.particles.unshift(new Dust(
                this.game,
                this.game.player.x + this.game.player.width * 0.6,
                this.game.player.y + this.game.player.height
            ));
        }
        if (this.game.talkToElyvorg) {
            // do nothing
        } else if (this.game.isElyvorgFullyVisible && !this.oneTime) {
            this.game.player.setState(states.STANDING, 0);
            this.oneTime = true;
        }
        if (input.includes('w') && input.includes('s')) {
            this.game.player.setState(states.RUNNING, 1);
        }

        if (this.game.talkToElyvorg) {
            // do nothing
        } else if (input.includes('w')) {
            this.game.player.setState(states.JUMPING, 1);
        } else if (this.game.input.enterOrRightClick(input)) {
            if (this.game.isElyvorgFullyVisible === true) {
                if (this.game.player.energyReachedZero === false) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            } else if (!this.game.cabin.isFullyVisible) {
                if (this.game.player.energyReachedZero === false) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            } else {
                // do nothing
            }
        } else if (!(input.includes('a') || input.includes('d')) && (this.game.cabin.isFullyVisible || this.game.isElyvorgFullyVisible)) {
            this.game.player.setState(states.STANDING, 0);
        } else if (input.includes('s') && (input.includes('a') || input.includes('d'))) {
            // If 's' and either 'a' or 'd' are pressed simultaneously while running, do nothing.
        } else if (input.includes('s')) {
            this.game.player.setState(states.SITTING, 0);
        } else if (this.game.isElyvorgFullyVisible === true && this.game.player.energyReachedZero === true &&
            this.game.input.enterOrRightClick(input) && (input.includes('a') || input.includes('d'))) {
        }
    }
}

export class Jumping extends State {
    constructor(game) {
        super('JUMPING', game);
    }
    enter() {
        if (this.game.player.onGround()) this.game.player.vy -= 27;
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 1;
        if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound('jumpSFX');
        }
    }
    handleInput(input) {
        this.gameOver();
        if (this.game.player.isUnderwater === true) {
            this.game.particles.unshift(new Bubble(
                this.game,
                this.game.player.x + this.game.player.width * 0.8,
                this.game.player.y + this.game.player.height
            ));
            if (input.includes('w') && !this.game.gameOver) {
                this.game.input.isWKeyPressed = true;
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

        if (this.game.player.onGround()) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (this.game.player.vy > this.game.player.weight && this.game.player.isUnderwater === false) {
            this.game.player.setState(states.FALLING, 1);
        } else if (input.includes('s') && this.game.player.divingTimer >= this.game.player.divingCooldown) {
            this.game.player.divingTimer = 0;
            if (input.includes('a') || input.includes('d')) {
                this.game.player.setState(states.DIVING, 1);
            } else {
                this.game.player.setState(states.DIVING, 0);
            }
        } else if (this.game.input.enterOrRightClick(input) && !this.game.cabin.isFullyVisible) {
            if (this.game.player.energyReachedZero === false) {
                this.game.player.setState(states.ROLLING, 2);
            } else if (this.game.player.energyReachedZero === true && input.includes('s') && this.game.player.divingTimer >= this.game.player.divingCooldown) {
                this.game.player.divingTimer = 0;
                this.game.player.setState(states.DIVING, 0);
            }
        }
    }
}

export class Falling extends State {
    constructor(game) {
        super('FALLING', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 2;
    }
    handleInput(input) {
        this.gameOver();
        if (this.game.player.isUnderwater === true) {
            this.game.particles.unshift(new Bubble(
                this.game,
                this.game.player.x + this.game.player.width * 0.8,
                this.game.player.y + this.game.player.height
            ));
            if (input.includes('w')) {
                this.game.input.isWKeyPressed = true;
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

        if (this.game.input.enterOrRightClick(input) && this.game.player.onGround() && this.game.cabin.isFullyVisible) {
            this.game.player.setState(states.STANDING, 0);
        } else if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound('fallingSFX');
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('s') && this.game.player.divingTimer >= this.game.player.divingCooldown) {
            this.game.player.divingTimer = 0;
            this.game.player.setState(states.DIVING, 0);
        } if (this.game.input.enterOrRightClick(input) && this.game.isElyvorgFullyVisible && this.game.player.onGround()) {
            this.game.player.setState(states.STANDING, 0);
        } else if (this.game.input.enterOrRightClick(input) && !this.game.cabin.isFullyVisible) {
            if (this.game.player.energy > 0) {
                if (this.game.player.energyReachedZero === false) {
                    this.game.player.setState(states.ROLLING, 2);
                }
            }
        }
    }
}

export class Rolling extends State {
    constructor(game) {
        super('ROLLING', game);
    }

    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
    }

    handleInput(input) {
        this.gameOver();
        if (this.game.player.energy > 0) {
            if (this.game.player.energyReachedZero === false) {
                this.game.player.drainEnergy();
                if (this.game.isElyvorgFullyVisible && !this.oneTime) {
                    this.game.player.setState(states.STANDING, 0);
                    this.oneTime = true;
                }
                if (this.game.cabin.isFullyVisible) {
                    this.game.player.setState(states.STANDING, 0);
                } else {
                    this.game.particles.unshift(new Fire(
                        this.game,
                        this.game.player.x + this.game.player.width * 0.5,
                        this.game.player.y + this.game.player.height * 0.5));

                    if (!this.game.input.enterOrRightClick(input) && this.game.player.onGround()) {
                        this.game.player.setState(states.RUNNING, 1);
                    } else if (!this.game.input.enterOrRightClick(input) && !this.game.player.onGround()) {
                        this.game.player.setState(states.FALLING, 1);
                    } else if (this.game.input.enterOrRightClick(input) && input.includes('w') && this.game.player.onGround()) {
                        this.game.player.vy -= 27;
                    } else if (input.includes('s') && this.game.player.divingTimer >= this.game.player.divingCooldown && !this.game.player.onGround()) {
                        this.game.player.divingTimer = 0;
                        if (input.includes('a') || input.includes('d')) {
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
            } else if (this.game.player.energyReachedZero === true && this.game.player.isUnderwater === false) {
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
}

export class Diving extends State {
    constructor(game) {
        super('DIVING', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 6;
        this.game.player.vy = 15;
    }
    handleInput(input) {
        this.gameOver();
        if (this.game.player.isUnderwater === true) {
            this.game.player.gravity = 1;
            this.game.player.vy = 15;
        }
        this.game.particles.unshift(new Fire(
            this.game,
            this.game.player.x + this.game.player.width * 0.5,
            this.game.player.y + this.game.player.height * 0.5));
        const isBlueParticle = this.game.player.particleImage === 'bluefire' || this.game.player.particleImage === 'bluebubble';
        let numberOfParticles = isBlueParticle ? 90 : 30;
        if (this.game.player.onGround()) {
            this.game.audioHandler.firedogSFX.playSound('divingSFX', false, true);
            if (this.game.player.onGround() && input.includes('w')) {
                this.game.player.setState(states.JUMPING, 1);
            } else {
                this.game.player.setState(states.RUNNING, 1);
            }
            for (let i = 0; i < numberOfParticles; i++) {
                this.game.particles.unshift(new Splash(this.game,
                    this.game.player.x + this.game.player.width * -0.1,
                    this.game.player.y)
                );
            }
        } else if (this.game.input.enterOrRightClick(input) && this.game.player.onGround() && !this.game.cabin.isFullyVisible) {
            this.game.audioHandler.firedogSFX.playSound('divingSFX', false, true);
            this.game.player.setState(states.ROLLING, 2);
        }
        if (this.game.input.enterOrRightClick(input) && this.game.player.onGround() && this.game.cabin.isFullyVisible) {
            this.game.player.setState(states.STANDING, 0);
        }
        if (this.game.player.isUnderwater === true) {
            if (this.game.input.enterOrRightClick(input) && input.includes('w')) {
                this.game.player.setState(states.ROLLING, 2);
            } else if (input.includes('w')) {
                this.game.player.setState(states.JUMPING, 1);
            }
        }
    }
}

export class Stunned extends State {
    constructor(game) {
        super('STUNNED', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 10;
        this.game.player.frameY = 4;
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
        super('HIT', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 3;
        this.game.player.frameY = 9;
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
        super('STANDING', game);
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 6;
        this.game.player.frameY = 0;
    }
    handleInput(input) {
        this.gameOver();

        if (this.game.player.isUnderwater === true) {
            if (this.game.input.enterOrRightClick(input) && !this.game.player.onGround()) {
                this.game.player.setState(states.FALLING, 1);
            }
        }

        if (this.game.isElyvorgFullyVisible) {
            if (this.game.input.enterOrRightClick(input) && this.game.player.energyReachedZero === false) {
                this.game.player.setState(states.ROLLING, 0);
            }

        }
        if (input.includes('a') || input.includes('d')) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (input.includes('s')) {
            this.game.player.setState(states.SITTING, 0);
        } else if (input.includes('w')) {
            this.game.player.setState(states.JUMPING, 0);
        }
    }
}

export class Dying extends State {
    constructor(game) {
        super('DYING', game);
        this.deathAnimation = false;
    }
    enter() {
        this.game.player.frameX = 0;
        this.game.player.maxFrame = 11;
        this.game.player.frameY = 8;
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
            this.game.audioHandler.firedogSFX.playSound('deathFall');
        }
    }
}
