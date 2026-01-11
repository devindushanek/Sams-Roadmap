/**
 * Color utility functions for the Palette Studio application
 */

/**
 * Calculate the contrast color (black or white) for a given hex color
 * Uses YIQ formula to determine luminance
 * @param {string} hex - Hex color value
 * @returns {string} '#0f172a' for dark text or '#ffffff' for light text
 */
export const getContrastColor = (hex) => {
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    if (cleanHex.length !== 7) return '#ffffff';
    const r = parseInt(cleanHex.substring(1, 3), 16);
    const g = parseInt(cleanHex.substring(3, 5), 16);
    const b = parseInt(cleanHex.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#0f172a' : '#ffffff';
};

/**
 * Convert hex color to HSL values
 * @param {string} hex - Hex color value
 * @returns {{h: number, s: number, l: number}} HSL values (0-1 range)
 */
export const hexToHSL = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h, s, l };
};

/**
 * Generate a random hex color
 * @returns {string} Random hex color (e.g., '#A1B2C3')
 */
export const generateRandomHex = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
};

/**
 * Validate if a string is a valid hex color
 * @param {string} hex - String to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHex = (hex) => {
    return /^#?[0-9A-F]{6}$/i.test(hex);
};

/**
 * Normalize hex color (ensure it starts with # and is uppercase)
 * @param {string} hex - Hex color to normalize
 * @returns {string} Normalized hex color
 */
export const normalizeHex = (hex) => {
    const cleaned = hex.replace('#', '').toUpperCase();
    return `#${cleaned}`;
};

/**
 * Calculate relative luminance of a color
 * @param {string} hex - Hex color value
 * @returns {number} Relative luminance (0-1)
 */
export const getLuminance = (hex) => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const [rr, gg, bb] = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Find the color from a list that has the best contrast against a background
 * @param {string} background - Background hex color
 * @param {string[]} candidates - Array of candidate hex colors
 * @returns {string} The candidate color with the best contrast
 */
export const getBestContrastColor = (background, candidates) => {
    if (!candidates || candidates.length === 0) return getContrastColor(background);

    let bestColor = candidates[0];
    let maxContrast = 0;

    candidates.forEach(color => {
        const contrast = getContrastRatio(background, color);
        if (contrast > maxContrast) {
            maxContrast = contrast;
            bestColor = color;
        }
    });

    // If the best contrast is still poor (< 3), fall back to black/white
    if (maxContrast < 3) {
        return getContrastColor(background);
    }

    return bestColor;
};
