import { BASE_FRAME_MS } from '../config/constants.js';

let _offsetX = 0;
let _offsetY = 0;
let _sampleAccum = 0;
let _primed = false;

export function tickShake(deltaTime) {
  if (!_primed) {
    _offsetX = Math.round(Math.random() * 10);
    _offsetY = Math.round(Math.random() * 10);
    _primed = true;
    _sampleAccum = 0;
    return;
  }
  _sampleAccum += deltaTime;
  if (_sampleAccum >= BASE_FRAME_MS) {
    _sampleAccum %= BASE_FRAME_MS;
    _offsetX = Math.round(Math.random() * 10);
    _offsetY = Math.round(Math.random() * 10);
  }
}

export function resetShake() {
  _offsetX = 0;
  _offsetY = 0;
  _sampleAccum = 0;
  _primed = false;
}

export function preShake(context) {
  context.save();
  context.translate(_offsetX, _offsetY);
}

export function postShake(context) {
  context.restore();
}
