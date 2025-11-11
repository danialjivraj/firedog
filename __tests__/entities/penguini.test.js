import { Penguini } from '../../game/entities/penguini';

describe('Penguini', () => {
    let game, penguini, ctx, fakeSpritesheet, fakePressImg;

    beforeAll(() => {
        fakeSpritesheet = {};
        fakePressImg = {};
        document.getElementById = jest.fn().mockImplementation(id => {
            if (id === 'enterToTalkToPenguini') return fakePressImg;
            return fakeSpritesheet;
        });
    });

    beforeEach(() => {
        game = {
            width: 1920,
            height: 689,
            groundMargin: 10,
            speed: 5,
            fixedPenguinX: 120,
            cabin: { isFullyVisible: false },
            talkToPenguin: false,
            notEnoughCoins: false,
            enterToTalkToPenguin: true,
            penguini: null,
            player: { x: 0, width: 20 },
            talkToPenguinOneTimeOnly: false,
            debug: false,
            currentMap: 'Map1',
        };

        penguini = new Penguini(game, 50, 30, 'sheet', 2);
        game.penguini = penguini;

        ctx = {
            strokeRect: jest.fn(),
            drawImage: jest.fn(),
        };
    });

    describe('constructor', () => {
        test('initializes all fields correctly', () => {
            expect(penguini.frameX).toBe(0);
            expect(penguini.fps).toBe(40);
            expect(penguini.frameInterval).toBeCloseTo(1000 / 40);
            expect(penguini.game).toBe(game);
            expect(penguini.image).toBe(fakeSpritesheet);
            expect(penguini.x).toBe(game.width);
            expect(penguini.y).toBe(game.height - penguini.height - game.groundMargin - 10);
            expect(penguini.showPressEnterImage).toBe(fakePressImg);
            expect(document.getElementById).toHaveBeenCalledWith('sheet');
            expect(document.getElementById).toHaveBeenCalledWith('enterToTalkToPenguini');
        });
    });

    describe('update()', () => {
        test('increments frameTimer when below interval', () => {
            penguini.frameTimer = 0;
            penguini.update(10);
            expect(penguini.frameTimer).toBe(10);
            expect(penguini.frameX).toBe(0);
        });

        test('advances and wraps frameX', () => {
            penguini.frameTimer = penguini.frameInterval + 1;
            penguini.frameX = 0;
            penguini.update(0);
            expect(penguini.frameX).toBe(1);

            penguini.frameTimer = penguini.frameInterval + 1;
            penguini.frameX = penguini.maxFrame;
            penguini.update(0);
            expect(penguini.frameX).toBe(0);
        });

        test('moves left until cabin is visible then snaps & stops', () => {
            const startX = penguini.x;
            penguini.update(0);
            expect(penguini.x).toBe(startX - game.speed);

            penguini.x = game.fixedPenguinX + game.speed - 1;
            penguini.update(0);
            expect(penguini.isFullyVisible).toBe(true);
            expect(penguini.x).toBe(game.fixedPenguinX);

            const prev = penguini.x;
            penguini.update(0);
            expect(penguini.x).toBe(prev);
        });

        describe('interaction clamp & prompt logic', () => {
            beforeEach(() => {
                penguini.x = 200;
                game.penguini.x = 200;
            });

            test('when talkToPenguin & close enough, clamps player.x and shows prompt', () => {
                game.talkToPenguin = true;
                game.player.x = 190;
                penguini.showEnterToTalkToPenguini = false;
                penguini.update(0);
                expect(game.player.x).toBe(185);
                expect(penguini.showEnterToTalkToPenguini).toBe(true);
            });

            test('when notEnoughCoins & close enough, clamps similarly', () => {
                game.notEnoughCoins = true;
                game.player.x = 200;
                penguini.update(0);
                expect(game.player.x).toBe(185);
                expect(penguini.showEnterToTalkToPenguini).toBe(true);
            });

            test('resets flags if conditions not met', () => {
                penguini.showEnterToTalkToPenguini = true;
                game.enterToTalkToPenguin = true;
                penguini.update(0);
                expect(penguini.showEnterToTalkToPenguini).toBe(false);
                expect(game.enterToTalkToPenguin).toBe(false);
            });

            test('does nothing if game.penguini is null', () => {
                game.talkToPenguin = true;
                game.penguini = null;
                penguini.showEnterToTalkToPenguini = true;
                penguini.update(0);
                expect(penguini.showEnterToTalkToPenguini).toBe(false);
            });
        });
    });

    describe('draw()', () => {
        test('always draws the current sprite frame', () => {
            penguini.frameX = 2;
            penguini.frameY = 1;
            penguini.x = 150;
            penguini.y = 80;
            penguini.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                fakeSpritesheet,
                2 * penguini.frameWidth,
                1 * penguini.frameHeight,
                penguini.frameWidth,
                penguini.frameHeight,
                150, 80,
                penguini.width, penguini.height
            );
        });

        test('draws debug rect when game.debug = true', () => {
            game.debug = true;
            penguini.draw(ctx);
            expect(ctx.strokeRect).toHaveBeenCalledWith(
                penguini.x, penguini.y,
                penguini.width, penguini.height
            );
        });

        test('renders the Enter prompt at y−170 when currentMap != Map6', () => {
            penguini.showEnterToTalkToPenguini = true;
            game.talkToPenguinOneTimeOnly = true;
            penguini.x = 250;
            penguini.y = 120;
            game.currentMap = 'Map1';
            penguini.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                fakePressImg,
                250 - 320,
                120 - 170
            );
        });

        test('renders the Enter prompt at y−235 when currentMap === Map6', () => {
            penguini.showEnterToTalkToPenguini = true;
            game.talkToPenguinOneTimeOnly = true;
            penguini.x = 300;
            penguini.y = 130;
            game.currentMap = 'Map6';
            penguini.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                fakePressImg,
                300 - 320,
                130 - 235
            );
        });

        test('does not draw the prompt if showEnterToTalkToPenguini=false', () => {
            penguini.showEnterToTalkToPenguini = false;
            game.talkToPenguinOneTimeOnly = true;
            penguini.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        });

        test('does not draw the prompt if talkToPenguinOneTimeOnly=false', () => {
            penguini.showEnterToTalkToPenguini = true;
            game.talkToPenguinOneTimeOnly = false;
            penguini.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        });
    });
});
