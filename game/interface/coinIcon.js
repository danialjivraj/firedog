const COIN_PALETTES = {
    gold: {
        fill: '#F2AF2F',
        stroke: 'rgba(136, 85, 0, 0.7)',
        innerStroke: 'rgba(136, 85, 0, 0.5)',
    },
    loss: {
        fill: '#ff6868',
        stroke: 'rgba(130, 20, 20, 0.85)',
        innerStroke: 'rgba(130, 20, 20, 0.6)',
    },
    silver: {
        fill: '#cfd3db',
        stroke: 'rgba(70, 76, 88, 0.9)',
        innerStroke: 'rgba(80, 86, 98, 0.62)',
    },
};

export function drawCoinIcon(context, x, y, radius, { isLoss = false, palette = 'gold', scale = 1 } = {}) {
    const colours = COIN_PALETTES[isLoss ? 'loss' : palette] || COIN_PALETTES.gold;

    context.save();
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.translate(x, y);
    context.scale(scale, scale);

    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fillStyle = colours.fill;
    context.fill();
    context.strokeStyle = colours.stroke;
    context.lineWidth = 1.4;
    context.stroke();

    context.beginPath();
    context.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
    context.strokeStyle = colours.innerStroke;
    context.lineWidth = 1;
    context.stroke();

    context.restore();
}
