export function getDefaultKeyBindings() {
  return {
    jump: 'w',
    moveBackward: 'a',
    sit: 's',
    moveForward: 'd',
    rollAttack: 'Enter',
    diveAttack: 's',
    fireballAttack: 'q',
    invisibleDefense: 'e',
    dashAttack: 'Shift',
  };
}

export function normalizeKey(key) {
  if (!key) return key;
  if (key.length === 1) return key.toLowerCase();
  return key;
}

export function keyLabel(key) {
  if (!key) return 'Unbound';
  const map = {
    ' ': 'Space',
    'ArrowUp': 'Arrow Up',
    'ArrowDown': 'Arrow Down',
    'ArrowLeft': 'Arrow Left',
    'ArrowRight': 'Arrow Right',
  };
  return map[key] || key.toUpperCase();
}
