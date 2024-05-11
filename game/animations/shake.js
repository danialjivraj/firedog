export function preShake(context) {
  context.save();
  var dx = Math.random() * 10;
  var dy = Math.random() * 10;
  context.translate(dx, dy);
}

export function postShake(context) {
  context.restore();
}
