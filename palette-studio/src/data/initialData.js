import { getContrastColor } from '../utils/colorUtils';

export const getInitialPalettes = () => [
    {
        id: Date.now().toString(),
        name: "New Palette",
        nameLocked: false,
        description: "A randomly generated palette.",
        descriptionLocked: false,
        colors: Array.from({ length: 5 }, () => {
            const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
            return { hex, name: "Color", description: "Loading description...", text: getContrastColor(hex) };
        }),
        insights: [],
        type: 'color'
    }
];

export const initialProjects = [];
