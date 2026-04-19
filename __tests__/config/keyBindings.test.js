import { getDefaultKeyBindings, normalizeKey, keyLabel } from '../../game/config/keyBindings.js';

describe('getDefaultKeyBindings', () => {
    test('returns a fresh object with all expected actions', () => {
        const bindings = getDefaultKeyBindings();
        expect(bindings).toHaveProperty('jump');
        expect(bindings).toHaveProperty('moveBackward');
        expect(bindings).toHaveProperty('sit');
        expect(bindings).toHaveProperty('moveForward');
        expect(bindings).toHaveProperty('rollAttack');
        expect(bindings).toHaveProperty('diveAttack');
        expect(bindings).toHaveProperty('fireballAttack');
        expect(bindings).toHaveProperty('invisibleDefense');
        expect(bindings).toHaveProperty('dashAttack');
    });

    test('returns a new object each time (not shared reference)', () => {
        const a = getDefaultKeyBindings();
        const b = getDefaultKeyBindings();
        expect(a).not.toBe(b);
        expect(a).toEqual(b);
    });
});

describe('normalizeKey', () => {
    test('lowercases single-character keys', () => {
        expect(normalizeKey('A')).toBe('a');
        expect(normalizeKey('Z')).toBe('z');
        expect(normalizeKey('d')).toBe('d');
    });

    test('preserves multi-character keys as-is', () => {
        expect(normalizeKey('Shift')).toBe('Shift');
        expect(normalizeKey('Enter')).toBe('Enter');
        expect(normalizeKey('ArrowUp')).toBe('ArrowUp');
    });

    test('returns falsy values unchanged', () => {
        expect(normalizeKey(null)).toBeNull();
        expect(normalizeKey(undefined)).toBeUndefined();
        expect(normalizeKey('')).toBe('');
    });
});

describe('keyLabel', () => {
    test('returns human-readable labels for special keys', () => {
        expect(keyLabel(' ')).toBe('Space');
        expect(keyLabel('ArrowUp')).toBe('Arrow Up');
        expect(keyLabel('ArrowDown')).toBe('Arrow Down');
        expect(keyLabel('ArrowLeft')).toBe('Arrow Left');
        expect(keyLabel('ArrowRight')).toBe('Arrow Right');
    });

    test('uppercases normal keys', () => {
        expect(keyLabel('a')).toBe('A');
        expect(keyLabel('w')).toBe('W');
    });

    test('returns "Unbound" for falsy input', () => {
        expect(keyLabel(null)).toBe('Unbound');
        expect(keyLabel(undefined)).toBe('Unbound');
        expect(keyLabel('')).toBe('Unbound');
    });
});
