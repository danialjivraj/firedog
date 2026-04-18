// baseline frame duration the game physics/speeds were originally tuned at (~75 fps).
// this normalises deltaTime so that gameplay is frame-rate independent:
//   const dt = deltaTime / BASE_FRAME_MS;
export const BASE_FRAME_MS = 13.333;
