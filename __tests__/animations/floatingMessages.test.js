import { FloatingMessage } from '../../game/animations/floatingMessages';

describe('FloatingMessage', () => {
    it('initializes all properties correctly (including defaults)', () => {
        const msg = new FloatingMessage('X', 1, 2, 3, 4, 5, undefined, undefined, true);
        expect(msg.value).toBe('X');
        expect(msg.x).toBe(1);
        expect(msg.y).toBe(2);
        expect(msg.targetX).toBe(3);
        expect(msg.targetY).toBe(4);
        expect(msg.fontSize).toBe(5);
        // default colors
        expect(msg.textColor).toBe('white');
        expect(msg.shadowColor).toBe('black');
        expect(msg.smallSuffix).toBe(true);
        expect(msg.timer).toBe(0);
        expect(msg.markedForDeletion).toBe(false);
    });

    describe('update()', () => {
        it('moves x and y 3% closer to the target and increments timer', () => {
            const msg = new FloatingMessage('10', 0, 0, 100, 200, 24);
            msg.update();
            // x: 0 + (100 - 0) * 0.03 = 3
            // y: 0 + (200 - 0) * 0.03 = 6
            expect(msg.x).toBeCloseTo(3, 5);
            expect(msg.y).toBeCloseTo(6, 5);
            expect(msg.timer).toBe(1);
            expect(msg.markedForDeletion).toBe(false);
        });

        it('marks for deletion after timer exceeds 100', () => {
            const msg = new FloatingMessage('foo', 50, 50, 150, 150, 16);
            for (let i = 0; i < 101; i++) {
                msg.update();
            }
            expect(msg.timer).toBe(101);
            expect(msg.markedForDeletion).toBe(true);
        });

        it('does not move if x/y === targetX/targetY but still increments timer', () => {
            const msg = new FloatingMessage('5', 10, 20, 10, 20, 12);
            msg.update();
            expect(msg.x).toBe(10);
            expect(msg.y).toBe(20);
            expect(msg.timer).toBe(1);
        });
    });

    describe('draw()', () => {
        let context;

        beforeEach(() => {
            context = {
                font: '',
                fillStyle: '',
                fillText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 25 })
            };
        });

        it('draws plain text (no smallSuffix) with shadow', () => {
            const msg = new FloatingMessage('123', 10, 20, 0, 0, 30, 'red', 'blue', false);
            msg.draw(context);

            expect(context.font).toBe(`30px Love Ya Like A Sister`);
            expect(context.fillText).toHaveBeenCalledTimes(2);
            expect(context.fillText.mock.calls[0]).toEqual(['123', 10, 20]);
            expect(context.fillText.mock.calls[1]).toEqual(['123', 8, 18]);
            expect(context.fillStyle).toBe('blue');
        });

        it('draws seconds suffix ("s") smaller when smallSuffix is true', () => {
            const value = '30s';
            const x = 5;
            const y = 15;
            const fontSize = 40;
            const msg = new FloatingMessage(value, x, y, 0, 0, fontSize, 'white', 'black', true);

            msg.draw(context);

            const numberPart = '30';
            const letterPart = 's';
            const numberWidth = context.measureText(numberPart).width;
            const smallerFontSize = fontSize * 0.7;

            expect(context.measureText).toHaveBeenCalledWith(numberPart);

            expect(context.fillText).toHaveBeenCalledTimes(4);

            expect(context.fillText.mock.calls[0]).toEqual([numberPart, x, y]);
            expect(context.fillText.mock.calls[1]).toEqual([numberPart, x - 2, y - 2]);
            expect(context.fillText.mock.calls[2]).toEqual([letterPart, x + numberWidth, y]);
            expect(context.fillText.mock.calls[3]).toEqual([letterPart, x + numberWidth - 2, y - 2]);

            expect(context.font).toBe(`${smallerFontSize}px Love Ya Like A Sister`);
            expect(context.fillStyle).toBe('black');
        });

        it('falls back to plain draw when smallSuffix is true but value length is 1', () => {
            const msg = new FloatingMessage('s', 0, 0, 0, 0, 20, 'green', 'gray', true);
            msg.draw(context);

            expect(context.fillText).toHaveBeenCalledTimes(2);
            expect(context.fillText.mock.calls[0]).toEqual(['s', 0, 0]);
            expect(context.fillText.mock.calls[1]).toEqual(['s', -2, -2]);
            expect(context.font).toBe(`20px Love Ya Like A Sister`);
            expect(context.fillStyle).toBe('gray');
        });

        it('still splits off the last character even if it isn’t "s"', () => {
            const ctx = {
                font: '',
                fillStyle: '',
                fillText: jest.fn(),
                measureText: jest.fn().mockReturnValue({ width: 15 }),
            };
            const msg = new FloatingMessage('AB', 0, 0, 0, 0, 20, 'white', 'black', true);
            msg.draw(ctx);
            expect(ctx.fillText.mock.calls[0]).toEqual(['A', 0, 0]);
            expect(ctx.fillText.mock.calls[2]).toEqual(['B', 15, 0]);
        });
    });
});
