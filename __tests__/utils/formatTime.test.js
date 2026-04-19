import { formatTimeMs } from '../../game/utils/formatTime.js';

describe('formatTimeMs', () => {
    test('formats zero ms as 00:00.00', () => {
        expect(formatTimeMs(0)).toBe('00:00.00');
    });

    test('formats seconds and minutes correctly', () => {
        expect(formatTimeMs(61000)).toBe('01:01.00');
        expect(formatTimeMs(3599999)).toBe('59:59.99');
    });

    test('formats fractional part with default 2 decimals', () => {
        expect(formatTimeMs(1234)).toBe('00:01.23');
        expect(formatTimeMs(450950)).toBe('07:30.95');
    });

    test('supports custom decimal count', () => {
        expect(formatTimeMs(1234, 1)).toBe('00:01.2');
        expect(formatTimeMs(1234, 3)).toBe('00:01.234');
    });

    test('returns dash for null or undefined', () => {
        expect(formatTimeMs(null)).toBe('—');
        expect(formatTimeMs(undefined)).toBe('—');
    });

    test('clamps negative values to zero', () => {
        expect(formatTimeMs(-500)).toBe('00:00.00');
    });

    test('pads single-digit minutes and seconds with leading zeros', () => {
        expect(formatTimeMs(5000)).toBe('00:05.00');
        expect(formatTimeMs(65000)).toBe('01:05.00');
    });
});
