export function formatTimeMs(ms, decimals = 2) {
    if (ms == null) return "—";

    const totalMs = Math.max(0, Math.floor(ms));
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const d = Math.max(0, decimals);
    const scale = Math.pow(10, d);
    const frac = Math.floor((totalMs % 1000) / (1000 / scale));

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(frac).padStart(d, "0")}`;
}
