import { Cabin } from '../../game/entities/cabin';

describe('Cabin', () => {
    let game, cabin, ctx, fakeImage;

    beforeAll(() => {
        fakeImage = {};
        document.getElementById = jest.fn().mockReturnValue(fakeImage);
    });

    beforeEach(() => {
        game = {
            width: 1920,
            speed: 5,
            fixedCabinX: 50,
            debug: false,
        };
        ctx = {
            strokeRect: jest.fn(),
            drawImage: jest.fn(),
        };
        cabin = new Cabin(game, 'someId', 80, 40, 20);
    });

    describe('constructor', () => {
        test('initializes all properties correctly', () => {
            expect(cabin.frameX).toBe(0);
            expect(cabin.frameY).toBe(0);
            expect(cabin.fps).toBe(4);
            expect(cabin.frameInterval).toBe(1000 / 4);
            expect(cabin.frameTimer).toBe(0);
            expect(cabin.markedForDeletion).toBe(false);
            expect(cabin.game).toBe(game);
            expect(cabin.width).toBe(80);
            expect(cabin.height).toBe(40);
            expect(cabin.image).toBe(fakeImage);
            expect(cabin.maxFrame).toBe(0);
            expect(cabin.frameWidth).toBe(80);
            expect(cabin.frameHeight).toBe(40);
            expect(cabin.x).toBe(game.width);
            expect(cabin.y).toBe(20);
            expect(cabin.isFullyVisible).toBe(false);
            expect(document.getElementById).toHaveBeenCalledWith('someId');
        });
    });

    describe('update()', () => {
        test('moves left by game.speed and accumulates frameTimer when below interval', () => {
            cabin.frameTimer = 0;
            cabin.update(100);

            expect(cabin.x).toBe(game.width - game.speed);
            expect(cabin.frameTimer).toBe(100);
            expect(cabin.frameX).toBe(0);
        });

        test('advances frameX when frameTimer exceeds frameInterval (with maxFrame > 0)', () => {
            cabin.maxFrame = 2;
            cabin.frameTimer = cabin.frameInterval + 1;
            cabin.frameX = 0;
            cabin.update(10);

            expect(cabin.frameTimer).toBe(0);
            expect(cabin.frameX).toBe(1);
        });

        test('rolls frameX back to 0 when exceeding maxFrame', () => {
            cabin.maxFrame = 1;
            cabin.frameTimer = cabin.frameInterval + 1;
            cabin.frameX = 1;
            cabin.update(0);
            expect(cabin.frameX).toBe(0);
        });

        test('becomes fully visible and snaps x when crossing fixedCabinX', () => {
            cabin.x = game.fixedCabinX + game.speed - 1;
            cabin.update(10);

            expect(cabin.isFullyVisible).toBe(true);
            expect(cabin.x).toBe(game.fixedCabinX);
        });

        test('stops moving once isFullyVisible is true', () => {
            cabin.isFullyVisible = true;
            const prevX = cabin.x;
            cabin.frameTimer = 9999;
            cabin.frameX = 5;
            cabin.update(123);

            expect(cabin.x).toBe(prevX);
            expect(cabin.frameTimer).toBe(9999);
            expect(cabin.frameX).toBe(5);
        });
    });

    describe('draw()', () => {
        test('draws only image when debug=false', () => {
            game.debug = false;
            cabin.frameX = 2;
            cabin.frameY = 1;
            cabin.draw(ctx);

            expect(ctx.strokeRect).not.toHaveBeenCalled();
            expect(ctx.drawImage).toHaveBeenCalledWith(
                fakeImage,
                2 * cabin.frameWidth, 1 * cabin.frameHeight, cabin.frameWidth, cabin.frameHeight,
                cabin.x, cabin.y, cabin.width, cabin.height
            );
        });

        test('also strokes rect when debug=true', () => {
            game.debug = true;
            cabin.draw(ctx);

            expect(ctx.strokeRect).toHaveBeenCalledWith(
                cabin.x, cabin.y, cabin.width, cabin.height
            );
            expect(ctx.drawImage).toHaveBeenCalled();
        });
    });
});
