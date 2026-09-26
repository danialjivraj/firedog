export function hasUnboundKeybind(game) {
    const controls = game?.menu?.controlsSettings;
    return typeof controls?.unboundCount === 'function' && controls.unboundCount() > 0;
}
