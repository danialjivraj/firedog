export class FloatingMessage {
    constructor(value, x, y, targetX, targetY, fontSize, textColor = 'white', shadowColor = 'black', smallSuffix = false) {
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
        this.smallSuffix = smallSuffix;
    }

    update() {
        this.x += (this.targetX - this.x) * 0.03;
        this.y += (this.targetY - this.y) * 0.03;
        this.timer++;
        if (this.timer > 100) this.markedForDeletion = true;
    }

    draw(context) {
        if (this.smallSuffix && this.value.length > 1) {
            const numberPart = this.value.slice(0, -1);
            const letterPart = this.value.slice(-1);

            context.font = `${this.fontSize}px Love Ya Like A Sister`;
            context.fillStyle = this.textColor;
            context.fillText(numberPart, this.x, this.y);
            context.fillStyle = this.shadowColor;
            context.fillText(numberPart, this.x - 2, this.y - 2);

            const numberWidth = context.measureText(numberPart).width;

            const smallerFontSize = this.fontSize * 0.7;
            context.font = `${smallerFontSize}px Love Ya Like A Sister`;

            context.fillStyle = this.textColor;
            context.fillText(letterPart, this.x + numberWidth, this.y);
            context.fillStyle = this.shadowColor;
            context.fillText(letterPart, this.x + numberWidth - 2, this.y - 2);
        } else {
            context.font = `${this.fontSize}px Love Ya Like A Sister`;
            context.fillStyle = this.textColor;
            context.fillText(this.value, this.x, this.y);
            context.fillStyle = this.shadowColor;
            context.fillText(this.value, this.x - 2, this.y - 2);
        }
    }
}
