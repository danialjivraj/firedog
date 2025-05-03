import { preShake, postShake } from '../../game/animations/shake';

describe('screen shake helpers', () => {
    let context;

    beforeEach(() => {
        context = {
            save: jest.fn(),
            translate: jest.fn(),
            restore: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('preShake()', () => {
        it('calls save() then translate() with dx and dy based on Math.random()', () => {
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0.1)
                .mockReturnValueOnce(0.2);

            preShake(context);

            expect(context.save).toHaveBeenCalledTimes(1);
            expect(context.translate).toHaveBeenCalledTimes(1);
            expect(context.translate).toHaveBeenCalledWith(1, 2);
        });

        it('does not call restore()', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);
            preShake(context);
            expect(context.restore).not.toHaveBeenCalled();
        });
    });

    describe('postShake()', () => {
        it('calls restore() exactly once', () => {
            postShake(context);
            expect(context.restore).toHaveBeenCalledTimes(1);
        });
    });
});
