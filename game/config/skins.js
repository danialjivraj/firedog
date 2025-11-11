export const SKINS = {
    default: {
        key: 'default',
        spriteId: 'defaultSkin',
        mapIconId: 'forestmapFiredog',
        label: 'Firedog',
    },
    hat: {
        key: 'hat',
        spriteId: 'hatSkin',
        mapIconId: 'forestmapHatFiredog',
        label: 'Hatboy Firedog',
    },
    cholo: {
        key: 'cholo',
        spriteId: 'choloSkin',
        mapIconId: 'forestmapCholoFiredog',
        label: 'Firedog the Cholo',
    },
    zabka: {
        key: 'zabka',
        spriteId: 'zabkaSkin',
        mapIconId: 'forestmapZabkaFiredog',
        label: 'Zabka Firedog',
    },
    shiny: {
        key: 'shiny',
        spriteId: 'shinySkin',
        mapIconId: 'forestmapFiredogShiny',
        label: 'Firedog (Shiny)',
        variantOf: 'default'
    },
};

export const SKIN_MENU_ORDER = ['default', 'hat', 'cholo', 'zabka'];

export function getSkinElement(skinKey) {
    const id = SKINS[skinKey].spriteId;
    return id ? document.getElementById(id) : null;
}
export function getMapIconElement(skinKey) {
    const id = SKINS[skinKey].mapIconId;
    return id ? document.getElementById(id) : null;
}