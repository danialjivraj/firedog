export class FloatingMessage {
    constructor(value, x, y, targetX, targetY, fontSize, textColor = 'white', shadowColor = 'black') {
        this.value = value;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.fontSize = fontSize;
        this.textColor = textColor;
        this.shadowColor = shadowColor;
        this.markedForDeletion = false;
        this.timer = 0;
    }

    update() {
        this.x += (this.targetX - this.x) * 0.03;
        this.y += (this.targetY - this.y) * 0.03;
        this.timer++;
        if (this.timer > 100) this.markedForDeletion = true;
    }

    draw(context) {
        context.font = `${this.fontSize}px Love Ya Like A Sister`;
        context.fillStyle = this.textColor;
        context.fillText(this.value, this.x, this.y);
        context.fillStyle = this.shadowColor;
        context.fillText(this.value, this.x - 2, this.y - 2);
    }
}
