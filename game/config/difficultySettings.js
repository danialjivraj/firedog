export const LIVES_OPTIONS = ['1', '3', '5', '7', '10'];
export const SPAWN_OPTIONS = ['Off', 'Low', 'Normal', 'High'];
export const SPAWN_MULTIPLIERS = { Off: 0, Low: 0.5, Normal: 1, High: 1.5 };

export const DEFAULT_LIVES_INDEX = 2;  // 5 lives
export const DEFAULT_SPAWN_INDEX = 2;  // Normal

export function getConfiguredLivesFromIndex(index = DEFAULT_LIVES_INDEX) {
    const fallback = LIVES_OPTIONS[DEFAULT_LIVES_INDEX];
    return parseInt(LIVES_OPTIONS[index] ?? fallback, 10);
}
