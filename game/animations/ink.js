export class InkSplash {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.splatterImages = [
      paint_splatter_1, paint_splatter_2, paint_splatter_3, paint_splatter_4, paint_splatter_5, paint_splatter_6, paint_splatter_7, paint_splatter_8, paint_splatter_9,
      paint_splatter_10, paint_splatter_11, paint_splatter_12, paint_splatter_13, paint_splatter_14, paint_splatter_15, paint_splatter_16, paint_splatter_17, paint_splatter_18
    ];
    this.image = this.getRandomSplatterImage();
    this.alpha = 1.0;
    this.fadeSpeed = 1 / 7000;
    this.elapsedTime = 0;
  }

  getRandomSplatterImage() {
    const randomIndex = Math.floor(Math.random() * this.splatterImages.length);
    return this.splatterImages[randomIndex];
  }
  getWidth() {
    return this.image.width;
  }
  update(deltaTime) {
    this.elapsedTime += deltaTime;

    if (this.elapsedTime > 4000 && this.elapsedTime < 7000) {
      const fadeStartTime = 4000;
      const fadeDuration = 3000;
      const fadeProgress = (this.elapsedTime - fadeStartTime) / fadeDuration;
      this.alpha = 1.0 - fadeProgress;
    } else if (this.elapsedTime >= 7000) {
      // after 7 seconds, removes the ink splash
      this.game.collisions = this.game.collisions.filter(collision => collision !== this);
    }
  }

  draw(context) {
    context.globalAlpha = this.alpha;
    context.drawImage(this.image, this.x, this.y);
    context.globalAlpha = 1.0;
  }
}
