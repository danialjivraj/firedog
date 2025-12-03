export function getLocalHour() {
    return new Date().getHours();
}

export function isLocalNight(startHour = 20, endHour = 6) {
    const hour = getLocalHour();

    if (startHour > endHour) {
        return hour >= startHour || hour < endHour;
    }

    return hour >= startHour && hour < endHour;
}
