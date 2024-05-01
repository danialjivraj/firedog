export function screenColourFadeIn(variable, fadeSpeed) {
    variable += fadeSpeed;
    variable = Math.min(0.3, variable);
    return variable;
}

export function screenColourFadeOut(variable) {
    variable -= 0.01;
    variable = Math.max(0, variable);
    return variable;
}
