export function preShake(context) {
  context.save();

  const dx = Math.round(Math.random() * 10);
  const dy = Math.round(Math.random() * 10);

  context.translate(dx, dy);
}

export function postShake(context) {
  context.restore();
}
