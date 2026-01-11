/**
 * AI Service for interacting with Google Gemini API
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

/**
 * Call Gemini API with a prompt and optional schema
 */
export const callGemini = async (prompt, schema = null, retryCount = 0) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: schema ? {
                    response_mime_type: "application/json",
                    response_schema: schema
                } : {}
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
    } catch (e) {
        if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(r => setTimeout(r, delay));
            return callGemini(prompt, schema, retryCount + 1);
        }
        throw e;
    }
};

/**
 * Fetch rich names and descriptions for a list of hex colors
 */
export const fetchRichPaletteData = async (hexes) => {
    const nameSchema = {
        type: "OBJECT",
        properties: {
            colors: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        name: { type: "STRING" },
                        description: { type: "STRING" }
                    },
                    required: ["name", "description"]
                }
            }
        },
        required: ["colors"]
    };

    const metaSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            description: { type: "STRING" }
        },
        required: ["name", "description"]
    };

    const [nameRes, metaRes] = await Promise.all([
        callGemini(`For each color hex, provide a STRICTLY CONVENTIONAL, professional color name (e.g., "Slate Grey", "Deep Navy", "Sage Green"). 
        CRITICAL: Avoid themed, poetic, or abstract names like "Cyber Night" or "Emerald Dream". Use standard design/paint terminology.
        
        Also provide a descriptive identity following this 3-step "Color Identity" formula to create a single, descriptive paragraph for each color:
1. Structural Anchor: Identify the hue and value.
2. Nuance/Undertone: Identify the lean or subtle character. Do NOT use the word "bias".
3. Environmental/Material Proxy: Link to something tangible.

CRITICAL: Do NOT include labels. The output should be a single, natural-sounding, and descriptive paragraph. Do NOT use semicolons. Use clear, complete sentences instead.

Example: "A low-value, desaturated brown with warm, blackened undertone. This color is reminiscent of aged leather and dark chocolate."

Hexes: ${hexes.join(', ')}.`, nameSchema),
        callGemini(`Suggest a creative palette name and a very concise (max 2 lines) design rationale for: ${hexes.join(', ')}. 
        
        Focus on the overall vibe and intended usage. 

        CRITICAL: Do NOT mention specific color names or hex codes. Focus on the "vibe" and "rationale".`, metaSchema)
    ]);

    return { meta: metaRes, colors: nameRes.colors };
};

/**
 * Fetch rich names and descriptions for a list of materials
 */
export const fetchRichMaterialData = async (materials) => {
    const materialInfo = materials.map(m => `${m.hex} (${m.finish})`).join(', ');

    const nameSchema = {
        type: "OBJECT",
        properties: {
            materials: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        name: { type: "STRING" },
                        description: { type: "STRING" }
                    },
                    required: ["name", "description"]
                }
            }
        },
        required: ["materials"]
    };

    const metaSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            description: { type: "STRING" }
        },
        required: ["name", "description"]
    };

    const [nameRes, metaRes] = await Promise.all([
        callGemini(`For each material (defined by color and finish), provide a creative material name (e.g., "Brushed Aluminum", "Matte Clay", "Velvet Midnight"). 
        Also provide a descriptive identity following this 3-step "Material Identity" formula:
        1. Surface/Texture: Describe the tactile quality.
        2. Light Interaction: Describe how light hits it (absorbs, reflects, scatters).
        3. Real-world Analog: Link to a specific physical material.
        
        Materials: ${materialInfo}.`, nameSchema),
        callGemini(`Suggest a creative palette name and a very concise design rationale for this collection of materials: ${materialInfo}.`, metaSchema)
    ]);

    return { meta: metaRes, materials: nameRes.materials };
};
