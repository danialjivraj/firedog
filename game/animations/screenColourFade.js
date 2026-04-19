import { normalizeDelta } from '../config/constants.js';

export function screenColourFadeIn(variable, fadeSpeed, deltaTime) {
    variable += fadeSpeed * normalizeDelta(deltaTime);
    variable = Math.min(0.3, variable);
    return variable;
}

export function screenColourFadeOut(variable, deltaTime) {
    variable -= 0.01 * normalizeDelta(deltaTime);
    variable = Math.max(0, variable);
    return variable;
}
