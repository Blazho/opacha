import {Position} from "./IHelper";

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const lerp = (start: number, end: number, t: number): number => {
    return start * (1 - t) + end * t;
};

export /**
 * Lightens a hex color dynamically by a given percentage.
 * It does not work with color names (e.g., "blue" or "red")
 * @param hex - The input hex color string (e.g., "#3498db" or "3498db")
 * @param percent - Percentage to lighten by (0 to 100)
 */
function lightenColor(hex: string, percent: number): string {
    // Remove the '#' if present
    let cleanHex = hex.replace(/^#/, "");

    // Handle shorthand hex codes like "abc" -> "aabbcc"
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split("").map(char => char + char).join("");
    }

    // Parse RGB values
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);

    // Calculate the lightened channels (mix with pure white: 255)
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    // Convert back to hex padding with zeros if necessary
    const toHex = (channel: number) => {
        const str = channel.toString(16);
        return str.length < 2 ? "0" + str : str;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function inRadius(pos1: Position, pos2: Position, radius: number): boolean{
    return calculateDistance(pos1.x, pos1.y, pos2.x, pos2.y) < radius
}