import React, { useState, useEffect, useCallback, useRef } from 'react';

import { ArrowLeft, Sun, Moon, Settings, Info, ExternalLink } from 'lucide-react';
import logo from './assets/logo.png';
import { TooltipContext } from './components/ui/Tooltip';

// Components
import { GenerationModal, ColorEditorModal, DeleteModal, PaletteSelectorModal } from './components/modals';
import { LibraryView, EditorView, MaterialCreatorView } from './components/views';

// Utilities
import { getContrastColor, hexToHSL } from './utils/colorUtils';

// Services
import { callGemini, fetchRichPaletteData, fetchRichMaterialData } from './services/aiService';

// Data
import { getInitialPalettes, initialProjects } from './data/initialData';
import { textures } from './data/textures';

// UI Utils
import { autoResizeTextarea } from './utils/uiUtils';

const App = () => {
    // --- Core State ---
    const [palettes, setPalettes] = useState(() => {
        const saved = localStorage.getItem('palette-studio-palettes');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved palettes", e);
            }
        }
        return getInitialPalettes();
    });

    const [history, setHistory] = useState([palettes]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('palette-studio-page') || 'library');
    const [activeIndex, setActiveIndex] = useState(() => {
        const saved = localStorage.getItem('palette-studio-active-index');
        const idx = saved ? parseInt(saved, 10) : 0;
        return idx < palettes.length ? idx : 0;
    });
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('palette-studio-projects');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved projects", e);
            }
        }
        return initialProjects;
    });
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('palette-studio-theme');
            // Apply theme immediately to prevent flash
            if (saved) {
                document.body.setAttribute('data-theme', saved);
            }
            return saved || 'light';
        }
        return 'light';
    });

    // Apply theme to body and handle transitions
    useEffect(() => {
        // Add no-transition class to prevent flash on initial load
        document.body.classList.add('no-transition');
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('palette-studio-theme', theme);

        // Remove no-transition after a brief delay to enable smooth transitions
        const timer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('no-transition');
            });
        });

        return () => cancelAnimationFrame(timer);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // --- Persistence Effects ---
    useEffect(() => {
        localStorage.setItem('palette-studio-palettes', JSON.stringify(palettes));
    }, [palettes]);

    useEffect(() => {
        localStorage.setItem('palette-studio-projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('palette-studio-page', currentPage);
    }, [currentPage]);

    useEffect(() => {
        localStorage.setItem('palette-studio-active-index', activeIndex.toString());
    }, [activeIndex]);

    // UI States
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('palette-studio-view-mode') || 'grid');
    const [mockupType, setMockupType] = useState(() => localStorage.getItem('palette-studio-mockup-type') || 'editorial');

    useEffect(() => {
        localStorage.setItem('palette-studio-view-mode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('palette-studio-mockup-type', mockupType);
    }, [mockupType]);
    const [shuffledIndices, setShuffledIndices] = useState({});
    const [copiedColor, setCopiedColor] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isNaming, setIsNaming] = useState(null);
    const [isSuggestingName, setIsSuggestingName] = useState(false);
    const [isSuggestingDesc, setIsSuggestingDesc] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null });
    const [editorModal, setEditorModal] = useState({ isOpen: false, colorIdx: null });
    const [bulkInput, setBulkInput] = useState("");
    const [limitError, setLimitError] = useState(false);
    const [isSuggestingColors, setIsSuggestingColors] = useState(false);
    const [suggestedColors, setSuggestedColors] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [lastAnalyzedColors, setLastAnalyzedColors] = useState([]);
    const [generationModal, setGenerationModal] = useState({ isOpen: false });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    const [paletteSelectorModal, setPaletteSelectorModal] = useState({ isOpen: false });
    const insightsRef = useRef(null);
    const textareaRef = useRef(null);
    const hasInitialized = useRef(false);

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [showTooltips, setShowTooltips] = useState(true);

    // --- Initialize palette on mount ---
    useEffect(() => {
        const initPalette = async () => {
            if (hasInitialized.current) return;
            hasInitialized.current = true;

            if (palettes[0].name === "New Palette") {
                try {
                    const hexes = palettes[0].colors.map(c => c.hex);
                    const { meta, colors } = await fetchRichPaletteData(hexes);

                    setPalettes(prev => {
                        const updated = [...prev];
                        updated[0] = {
                            ...updated[0],
                            name: meta.name,
                            description: meta.description,
                            colors: updated[0].colors.map((c, i) => ({
                                ...c,
                                name: colors[i]?.name || "Color",
                                description: colors[i]?.description || ""
                            }))
                        };
                        return updated;
                    });
                } catch (e) {
                    console.error("Failed to initialize palette", e);
                }
            }
        };

        initPalette();
    }, []);

    useEffect(() => {
        setShowInsights(false);
        setShowSuggestions(false);
    }, [activeIndex]);

    // --- CRITICAL GUARD: Ensure currentPalette is NEVER undefined ---
    const currentPalette = palettes[activeIndex] || palettes[0] || getInitialPalettes()[0];

    // --- History System ---
    const pushState = (newState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newState)));
        if (newHistory.length > 30) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setPalettes(newState);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setPalettes(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setPalettes(history[historyIndex + 1]);
        }
    };

    // --- Helpers ---
    const shuffleMockupColors = (type) => {
        if (!currentPalette) return;
        const indices = currentPalette.colors.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setShuffledIndices(prev => ({ ...prev, [type]: indices }));
    };

    const getShuffledColor = (index, type) => {
        if (!currentPalette?.colors?.length) return { hex: '#000000' };
        const typeIndices = shuffledIndices[type];
        if (!typeIndices || typeIndices.length !== currentPalette.colors.length) {
            return { hex: currentPalette.colors[index % currentPalette.colors.length].hex };
        }
        return { hex: currentPalette.colors[typeIndices[index % typeIndices.length]].hex };
    };

    const getSafeColor = (index) => {
        if (!currentPalette?.colors || currentPalette.colors.length === 0) return '#000000';
        return currentPalette.colors[index % currentPalette.colors.length]?.hex || currentPalette.colors[0].hex;
    };

    // --- Actions ---

    // --- Actions ---
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const isMaterial = currentPalette.type === 'material';
        const hexes = currentPalette.colors.map(c => c.hex).join(', ');
        const materialInfo = isMaterial ? currentPalette.colors.map(c => `${c.hex} (${c.textureId || 'matte'})`).join(', ') : hexes;

        const schema = {
            type: "OBJECT",
            properties: {
                insights: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            category: { type: "STRING" },
                            title: { type: "STRING" },
                            text: { type: "STRING" }
                        },
                        required: ["category", "title", "text"]
                    }
                }
            },
            required: ["insights"]
        };

        const prompt = isMaterial
            ? `Analyze this material palette: ${materialInfo}. 
               Provide exactly 3 concise insights. 
               Focus PURELY on the relationship between textures, finishes, and their intended architectural/interior application. 
               Do NOT focus on color harmony unless it relates to the material's physical properties.
               For each insight, you MUST use one of these EXACT categories: TEXTURE, MOOD, or USAGE. 
               Use 'title' (punchy 2-4 word summary) and 'text' (1-2 sentences max). 
               CRITICAL: Include hex codes in parentheses when mentioning materials so the UI can render swatches.`
            : `Analyze this palette: ${hexes}. Provide 3 concise insights. For each: 'title' (punchy 2-4 word summary), 'category' (Harmony/Contrast/Usage), 'text' (1-2 sentences max). CRITICAL: Include hex codes in parentheses when mentioning colors.`;

        try {
            const res = await callGemini(prompt, schema);

            const order = isMaterial
                ? { 'TEXTURE': 1, 'MOOD': 2, 'USAGE': 3 }
                : { 'Harmony': 1, 'Contrast': 2, 'Usage': 3 };

            const sortedInsights = [...res.insights].sort((a, b) => (order[a.category] || 99) - (order[b.category] || 99));

            setPalettes(prev => {
                const updated = [...prev];
                updated[activeIndex] = { ...updated[activeIndex], insights: sortedInsights };
                return updated;
            });
            setLastAnalyzedColors(currentPalette.colors.map(c => c.hex));
            setShowInsights(true);
            setTimeout(() => {
                insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (e) { } finally { setIsAnalyzing(false); }
    };

    const handleNameColor = async (idx, silent = false, hexOverride = null, updateState = true) => {
        if (!silent) setIsNaming(idx);
        const hex = hexOverride || palettes[activeIndex].colors[idx].hex;
        const schema = {
            type: "OBJECT",
            properties: {
                name: { type: "STRING" },
                description: { type: "STRING" }
            },
            required: ["name", "description"]
        };
        try {
            const res = await callGemini(`Generate a STRICTLY CONVENTIONAL, professional color name (e.g., "Charcoal Grey", "Forest Green", "Dusty Rose") and a descriptive identity for the hex code ${hex}. 
            
            CRITICAL: Avoid themed, poetic, or abstract names. Use terminology a professional designer or paint manufacturer would use.
            
Follow this 3-step "Color Identity" formula to create a single, descriptive paragraph:
1. Structural Anchor: Identify the hue and value.
2. Nuance/Undertone: Identify the lean or subtle character. Do NOT use the word "bias".
3. Environmental/Material Proxy: Link to something tangible.

CRITICAL: Do NOT include labels. The output should be a single, natural-sounding, and descriptive paragraph. Do NOT use semicolons. Use clear, complete sentences instead.

Example: "A low-value, desaturated brown with warm, blackened undertone. This color is reminiscent of aged leather and dark chocolate."

Provide a 2-3 word color name and the descriptive identity.`, schema);

            if (updateState) {
                setPalettes(prev => {
                    const updated = [...prev];
                    const newColors = [...updated[activeIndex].colors];
                    newColors[idx].name = res.name;
                    newColors[idx].description = res.description;
                    updated[activeIndex] = { ...updated[activeIndex], colors: newColors };
                    return updated;
                });
            }
            return res;
        } catch (e) { return null; } finally { if (!silent) setIsNaming(null); }
    };

    const modifyPaletteWithPrompt = async (prompt, image = null) => {
        setIsGenerating(true);
        const isMaterial = currentPalette.type === 'material';
        const currentInfo = isMaterial
            ? currentPalette.colors.map(c => `${c.hex} (${c.textureId || 'matte'})`).join(', ')
            : currentPalette.colors.map(c => c.hex).join(', ');

        const schema = isMaterial ? {
            type: "OBJECT",
            properties: {
                materials: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            hex: { type: "STRING" },
                            textureId: { type: "STRING", enum: textures.map(t => t.id) }
                        },
                        required: ["hex", "textureId"]
                    }
                }
            },
            required: ["materials"]
        } : {
            type: "OBJECT",
            properties: {
                colors: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                }
            },
            required: ["colors"]
        };

        let imageContext = "";
        if (image) {
            try {
                const extractedHexes = await extractColorsFromImage(image, 5);
                imageContext = ` Also consider these colors from a reference image: ${extractedHexes.join(', ')}.`;
            } catch (e) { }
        }

        try {
            const aiPrompt = isMaterial
                ? `Modify this material palette: ${currentInfo} based on this prompt: "${prompt}".${imageContext}
                   Return a list of 5-10 material combinations. 
                   For each, provide a hex code and a textureId from this list: ${textures.map(t => t.id).join(', ')}.
                   Ensure the textures match the mood of the prompt.`
                : `Modify this palette: ${currentInfo} based on this prompt: "${prompt}".${imageContext}
                   Return a list of 5-10 hex codes that represent the modified palette. 
                   Maintain some continuity if appropriate, or transform it completely if the prompt suggests so.`;

            const res = await callGemini(aiPrompt, schema);

            const hexes = isMaterial ? res.materials.map(m => m.hex) : res.colors;
            const richData = await fetchRichPaletteData(hexes);

            const newPalette = {
                id: Date.now(),
                name: richData.meta.name,
                description: richData.meta.description,
                colors: hexes.map((hex, i) => ({
                    hex,
                    name: richData.colors[i]?.name || "New Color",
                    description: richData.colors[i]?.description || "",
                    text: getContrastColor(hex),
                    ...(isMaterial ? {
                        textureId: res.materials[i].textureId,
                        intensity: 1.0,
                        gloss: 0.2,
                        metallic: 0,
                        brightness: 1,
                        shadows: 0
                    } : {})
                })),
                insights: [],
                type: currentPalette.type || 'color'
            };

            setPalettes(prev => {
                const updated = [...prev];
                updated[activeIndex] = newPalette;
                return updated;
            });
            pushState(palettes.map((p, i) => i === activeIndex ? newPalette : p));
            setGenerationModal({ open: false });
        } catch (e) { } finally { setIsGenerating(false); }
    };

    const handleAIStudio = async (prompt, count, image = null, mode = 'create') => {
        if (mode === 'create') {
            await generatePaletteFromPrompt(prompt, count, image);
        } else {
            await modifyPaletteWithPrompt(prompt, image);
        }
    };

    const getSuggestedColors = async () => {
        setIsSuggestingColors(true);
        const hexes = currentPalette.colors.map(c => c.hex).join(', ');
        const schema = {
            type: "OBJECT",
            properties: {
                colors: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            hex: { type: "STRING" },
                            name: { type: "STRING" },
                            rationale: { type: "STRING" }
                        },
                        required: ["hex", "name", "rationale"]
                    }
                }
            },
            required: ["colors"]
        };
        try {
            const res = await callGemini(`Suggest 5 unique colors that would complement this palette: ${hexes}. Ensure they are not identical or too similar to existing colors. For each color, provide a brief 1-sentence rationale explaining why it fits.`, schema);
            setSuggestedColors(res.colors);
            setShowSuggestions(true);
        } catch (e) { } finally { setIsSuggestingColors(false); }
    };

    const suggestPaletteName = async () => {
        if (currentPalette.nameLocked) return;
        setIsSuggestingName(true);
        const isMaterial = currentPalette.type === 'material';
        const colorInfo = currentPalette.colors.map(c => c.hex).join(', ');
        const materialInfo = isMaterial ? currentPalette.colors.map(c => `${c.hex} (${c.textureId || 'matte'})`).join(', ') : colorInfo;

        const schema = { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] };
        try {
            const prompt = isMaterial
                ? `Suggest a professional, evocative name for this material workbench: ${materialInfo}. Consider the tactile nature of the textures and the mood of the colors.`
                : `Suggest a professional, evocative palette name for these colors: ${colorInfo}.`;

            const res = await callGemini(prompt, schema);
            setPalettes(prev => {
                const updated = [...prev];
                updated[activeIndex] = { ...updated[activeIndex], name: res.name };
                return updated;
            });
        } catch (e) { } finally { setIsSuggestingName(false); }
    };

    const suggestPaletteDesc = async () => {
        if (currentPalette.descriptionLocked) return;
        setIsSuggestingDesc(true);
        const isMaterial = currentPalette.type === 'material';
        const colorInfo = currentPalette.colors.map(c => `${c.name} (${c.hex})`).join(', ');
        const materialInfo = isMaterial ? currentPalette.colors.map(c => `${c.name} with ${c.textureId || 'matte'} texture (${c.hex})`).join(', ') : colorInfo;

        const schema = { type: "OBJECT", properties: { description: { type: "STRING" } }, required: ["description"] };
        try {
            const prompt = isMaterial
                ? `Suggest a very concise (max 2 lines) design rationale for this material palette: ${materialInfo}. 
                   Explain the relationship between the chosen textures and colors, and suggest a primary architectural or interior use case.`
                : `Suggest a very concise (max 2 lines) design rationale for this palette: ${colorInfo}. 
            
            Focus on the overall vibe and intended usage. 
 
            CRITICAL: Do NOT mention specific color names or hex codes. Focus on the "vibe" and "rationale".`;

            const res = await callGemini(prompt, schema);
            setPalettes(prev => {
                const updated = [...prev];
                updated[activeIndex] = { ...updated[activeIndex], description: res.description };
                return updated;
            });
        } catch (e) { } finally { setIsSuggestingDesc(false); }
    };

    const addBulkColors = () => {
        const rawColors = bulkInput.split(',').map(c => c.trim().toUpperCase());
        const validHexes = rawColors.filter(c => /^#?[0-9A-F]{6}$/i.test(c));

        if (validHexes.length === 0) return;

        const currentCount = currentPalette.colors.length;
        const availableSlots = 10 - currentCount;

        if (availableSlots <= 0) {
            showLimitError();
            return;
        }

        const toAdd = validHexes.slice(0, availableSlots).map(hex => {
            const formattedHex = hex.startsWith('#') ? hex : `#${hex}`;
            return {
                hex: formattedHex,
                name: "...",
                description: "...",
                text: getContrastColor(formattedHex)
            };
        });

        if (validHexes.length > availableSlots) {
            showLimitError();
        }

        const updated = [...palettes];
        updated[activeIndex].colors = [...updated[activeIndex].colors, ...toAdd];
        setShowSuggestions(false);
        pushState(updated);
        setBulkInput("");

        toAdd.forEach((c, i) => {
            handleNameColor(currentCount + i, true, c.hex);
        });
    };

    const handleAddSuggestedColor = (sc) => {
        setPalettes(prev => {
            const updated = [...prev];
            updated[activeIndex] = {
                ...updated[activeIndex],
                colors: [...updated[activeIndex].colors, { hex: sc.hex, name: sc.name, text: getContrastColor(sc.hex) }]
            };
            return updated;
        });
    };

    const addColor = async () => {
        if (currentPalette.colors.length >= 10) {
            showLimitError();
            return;
        }
        setIsSuggestingColors(true);
        try {
            const hexes = currentPalette.colors.map(c => c.hex).join(', ');
            const schema = {
                type: "OBJECT",
                properties: {
                    hex: { type: "STRING" },
                    name: { type: "STRING" }
                },
                required: ["hex", "name"]
            };
            const res = await callGemini(`Suggest ONE color that complements this palette: ${hexes}. Provide standard color name.`, schema);

            let newHex = res.hex;
            if (!/^#[0-9A-F]{6}$/i.test(newHex)) {
                if (/^[0-9A-F]{6}$/i.test(newHex)) newHex = '#' + newHex;
                else throw new Error("Invalid hex");
            }

            setPalettes(prev => {
                const updated = [...prev];
                updated[activeIndex] = {
                    ...updated[activeIndex],
                    colors: [...updated[activeIndex].colors, { hex: newHex, name: res.name, text: getContrastColor(newHex) }]
                };
                return updated;
            });
        } catch (e) {
            const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            const updated = [...palettes];
            updated[activeIndex].colors = [...updated[activeIndex].colors, { hex: randomHex, name: "New Color", text: getContrastColor(randomHex) }];
            setShowSuggestions(false);
            pushState(updated);
        } finally {
            setIsSuggestingColors(false);
        }
    };

    const showLimitError = () => {
        setLimitError(true);
        setTimeout(() => setLimitError(false), 3000);
    };

    const updateField = (field, val) => {
        const updated = [...palettes];
        updated[activeIndex] = { ...updated[activeIndex], [field]: val };
        pushState(updated);
    };

    const updateColor = (idx, field, val) => {
        const updated = [...palettes];
        const newColors = [...updated[activeIndex].colors];
        newColors[idx] = { ...newColors[idx], [field]: val };
        if (field === 'hex' && val.length === 7) {
            newColors[idx].text = getContrastColor(val);
        }
        updated[activeIndex] = { ...updated[activeIndex], colors: newColors };
        setShowSuggestions(false);
        pushState(updated);
    };

    const saveColorEdit = async (idx, newHex, newName, newDescription) => {
        const updated = [...palettes];
        const newColors = [...updated[activeIndex].colors];
        const oldHex = newColors[idx].hex;
        const oldName = newColors[idx].name;

        newColors[idx] = {
            ...newColors[idx],
            hex: newHex,
            name: newName,
            description: newDescription || newColors[idx].description,
            text: getContrastColor(newHex)
        };

        updated[activeIndex] = { ...updated[activeIndex], colors: newColors };
        setPalettes(updated);
        setShowSuggestions(false);
        pushState(updated);

        if (newHex !== oldHex) {
            if (newName === oldName) {
                const res = await handleNameColor(idx, true, newHex, false);
                if (res) {
                    setPalettes(prev => {
                        const next = [...prev];
                        const nextColors = [...next[activeIndex].colors];
                        nextColors[idx] = { ...nextColors[idx], name: res.name, description: res.description };
                        next[activeIndex] = { ...next[activeIndex], colors: nextColors };
                        return next;
                    });
                }
            }

            const currentHexes = newColors.map(c => c.hex).join(', ');
            if (!updated[activeIndex].nameLocked) {
                suggestPaletteName(currentHexes);
            }
            if (!updated[activeIndex].descriptionLocked) {
                suggestPaletteDesc(currentHexes);
            }
        }
    };

    const removeColor = (idx) => {
        if (currentPalette.colors.length <= 2) return;
        const updated = [...palettes];
        updated[activeIndex].colors = updated[activeIndex].colors.filter((_, i) => i !== idx);
        setShowSuggestions(false);
        pushState(updated);
    };

    const autoOrganizeColors = () => {
        const updated = [...palettes];
        const currentColors = updated[activeIndex].colors;

        // Create a sorted version to check against
        const sortedAsc = [...currentColors].sort((a, b) => {
            const hslA = hexToHSL(a.hex);
            const hslB = hexToHSL(b.hex);
            if (hslA.h !== hslB.h) return hslA.h - hslB.h;
            if (hslA.s !== hslB.s) return hslB.s - hslA.s;
            return hslB.l - hslA.l;
        });

        // Check if already sorted ascending
        const isSortedAsc = JSON.stringify(currentColors.map(c => c.hex)) === JSON.stringify(sortedAsc.map(c => c.hex));

        if (isSortedAsc) {
            // Reverse sort
            updated[activeIndex].colors = sortedAsc.reverse();
        } else {
            // Apply ascending sort
            updated[activeIndex].colors = sortedAsc;
        }

        pushState(updated);
    };

    const toggleDominant = (idx) => {
        const updated = [...palettes];
        const color = updated[activeIndex].colors[idx];
        const currentDominantCount = updated[activeIndex].colors.filter(c => c.dominant).length;

        if (color.dominant) {
            updated[activeIndex].colors[idx] = { ...color, dominant: false };
        } else if (currentDominantCount < 3) {
            updated[activeIndex].colors[idx] = { ...color, dominant: true };
        }
        pushState(updated);
    };

    const copyHex = (hex) => {
        navigator.clipboard.writeText(hex);
        setCopiedColor(hex);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    // --- Project Management ---
    const createProject = () => {
        const newProject = {
            id: Date.now().toString(),
            name: 'New Project',
            createdAt: new Date().toISOString()
        };
        setProjects(prev => [...prev, newProject]);
    };

    const updateProject = (projectId, updates) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, ...updates } : p
        ));
    };

    const deleteProject = (projectId) => {
        // Ungroup all palettes in this project
        setPalettes(prev => prev.map(p =>
            p.projectId === projectId ? { ...p, projectId: null } : p
        ));
        // Remove the project
        setProjects(prev => prev.filter(p => p.id !== projectId));
    };

    const movePaletteToProject = (paletteId, projectId) => {
        setPalettes(prev => {
            const updated = prev.map(p =>
                p.id === paletteId ? { ...p, projectId } : p
            );
            pushState(updated);
            return updated;
        });
    };

    const reorderPalettes = (fromIndex, toIndex, newProjectId = undefined) => {
        setPalettes(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);

            // Update project ID if provided (for drag between groups)
            if (newProjectId !== undefined) {
                moved.projectId = newProjectId;
            }

            updated.splice(toIndex, 0, moved);
            pushState(updated);
            return updated;
        });
    };

    const reorderColors = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const updated = [...palettes];
        const colors = [...updated[activeIndex].colors];
        const [moved] = colors.splice(fromIndex, 1);
        colors.splice(toIndex, 0, moved);
        updated[activeIndex] = { ...updated[activeIndex], colors };
        pushState(updated);
    };

    const addPalette = async () => {
        const randomHexes = Array.from({ length: 3 }, () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

        const tempP = {
            id: Date.now().toString(),
            name: "Generating...",
            description: "Creating your new design system...",
            nameLocked: false,
            descriptionLocked: false,
            colors: randomHexes.map(hex => ({ hex, name: "...", description: "...", text: getContrastColor(hex) })),
            insights: [],
            type: 'color'
        };

        const updated = [...palettes, tempP];
        setPalettes(updated);
        const newIdx = updated.length - 1;
        setActiveIndex(newIdx);
        setCurrentPage('editor');
        setViewMode('grid');

        try {
            const { meta, colors } = await fetchRichPaletteData(randomHexes);

            const finalPalettes = [...updated];
            finalPalettes[newIdx] = {
                ...finalPalettes[newIdx],
                name: meta.name,
                description: meta.description,
                colors: randomHexes.map((hex, i) => ({
                    hex,
                    name: colors[i]?.name || "Color",
                    description: colors[i]?.description || "",
                    text: getContrastColor(hex)
                }))
            };
            setPalettes(finalPalettes);
            pushState(finalPalettes);
        } catch (e) {
            const fallback = [...updated];
            fallback[newIdx].name = "Untitled Studio";
            setPalettes(fallback);
        }
    };

    const addMaterialPalette = async () => {
        const finishes = ['matte', 'glossy', 'metallic', 'satin', 'fabric'];
        const randomMaterials = Array.from({ length: 3 }, () => {
            const hex = '#F8FAFC'; // Very light neutral
            const finish = finishes[Math.floor(Math.random() * finishes.length)];
            return {
                hex,
                textureId: 'matte_plaster',
                intensity: 1.0,
                gloss: 0.2,
                metallic: 0,
                brightness: 1,
                shadows: 0,
                name: "Material",
                description: "...",
                text: getContrastColor(hex)
            };
        });

        const tempP = {
            id: Date.now().toString(),
            name: "Generating Materials...",
            description: "Curating textures and finishes...",
            nameLocked: false,
            descriptionLocked: false,
            colors: randomMaterials,
            insights: [],
            type: 'material'
        };

        const updated = [...palettes, tempP];
        setPalettes(updated);
        const newIdx = updated.length - 1;
        setActiveIndex(newIdx);
        setCurrentPage('material-creator');

        try {
            const { meta, materials } = await fetchRichMaterialData(randomMaterials);

            const finalPalettes = [...updated];
            finalPalettes[newIdx] = {
                ...finalPalettes[newIdx],
                name: meta.name,
                description: meta.description,
                colors: randomMaterials.map((m, i) => ({
                    ...m,
                    name: materials[i]?.name || "Material",
                    description: materials[i]?.description || ""
                }))
            };
            setPalettes(finalPalettes);
            pushState(finalPalettes);
        } catch (e) {
            console.error(e);
            const fallback = [...updated];
            fallback[newIdx].name = "Untitled Materials";
            setPalettes(fallback);
        }
    };

    const randomizePalette = async () => {
        const isMaterial = currentPalette.type === 'material';
        const randomHexes = Array.from({ length: currentPalette.colors.length }, () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

        const updated = [...palettes];
        updated[activeIndex] = {
            ...updated[activeIndex],
            colors: randomHexes.map((hex, i) => ({
                ...(isMaterial ? currentPalette.colors[i] : {}),
                hex,
                name: "...",
                description: "...",
                text: getContrastColor(hex)
            })),
            insights: []
        };
        setPalettes(updated);
        setShowSuggestions(false);

        try {
            const { meta, colors } = await fetchRichPaletteData(randomHexes);

            const finalPalettes = [...palettes];
            finalPalettes[activeIndex] = {
                ...finalPalettes[activeIndex],
                name: currentPalette.nameLocked ? currentPalette.name : meta.name,
                description: currentPalette.descriptionLocked ? currentPalette.description : meta.description,
                colors: randomHexes.map((hex, i) => ({
                    ...(isMaterial ? currentPalette.colors[i] : {}),
                    hex,
                    name: colors[i]?.name || "Color",
                    description: colors[i]?.description || "",
                    text: getContrastColor(hex)
                })),
                insights: []
            };
            setPalettes(finalPalettes);
            pushState(finalPalettes);
        } catch (e) { }
    };

    const generatePaletteFromPrompt = async (prompt, count, image = null) => {
        if (image) {
            await generateFromImage(image, count, prompt);
            return;
        }
        setIsGenerating(true);
        const isMaterial = currentPalette?.type === 'material';

        try {
            const schema = isMaterial ? {
                type: "OBJECT",
                properties: {
                    materials: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                hex: { type: "STRING" },
                                textureId: { type: "STRING", enum: textures.map(t => t.id) }
                            },
                            required: ["hex", "textureId"]
                        }
                    }
                },
                required: ["materials"]
            } : {
                type: "OBJECT",
                properties: {
                    hexes: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["hexes"]
            };

            const aiPrompt = isMaterial
                ? `Generate a material palette for: "${prompt}". Return exactly ${count} material combinations. 
                   For each, provide a hex code and a textureId from this list: ${textures.map(t => t.id).join(', ')}.`
                : `Generate a color palette for: "${prompt}". Return exactly ${count} hex codes.`;

            const res = await callGemini(aiPrompt, schema);
            const hexes = isMaterial ? res.materials.map(m => m.hex) : res.hexes;
            const { meta, colors } = await fetchRichPaletteData(hexes);

            const newPalette = {
                id: Date.now().toString(),
                name: meta.name,
                nameLocked: false,
                descriptionLocked: false,
                colors: hexes.map((hex, i) => ({
                    hex,
                    name: colors[i]?.name || "Color",
                    description: colors[i]?.description || "",
                    text: getContrastColor(hex),
                    ...(isMaterial ? {
                        textureId: res.materials[i].textureId,
                        intensity: 1.0,
                        gloss: 0.2,
                        metallic: 0,
                        brightness: 1,
                        shadows: 0
                    } : {})
                })),
                insights: [],
                type: isMaterial ? 'material' : 'color'
            };

            const updated = [...palettes, newPalette];
            setPalettes(updated);
            setActiveIndex(updated.length - 1);
            setCurrentPage(isMaterial ? 'material-creator' : 'editor');
            setGenerationModal({ open: false });
            pushState(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const extractColorsFromImage = async (imageData, count) => {
        const img = new window.Image();
        img.src = imageData;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const data = ctx.getImageData(0, 0, 100, 100).data;
        const colorMap = {};

        for (let i = 0; i < data.length; i += 4) {
            const r = Math.min(255, Math.max(0, Math.round(data[i] / 32) * 32));
            const g = Math.min(255, Math.max(0, Math.round(data[i + 1] / 32) * 32));
            const b = Math.min(255, Math.max(0, Math.round(data[i + 2] / 32) * 32));
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
            colorMap[hex] = (colorMap[hex] || 0) + 1;
        }

        const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
        return sorted
            .map(e => e[0])
            .filter(hex => /^#[0-9A-F]{6}$/i.test(hex))
            .slice(0, count);
    };

    const generateFromImage = async (imageData, count, prompt = "") => {
        setIsProcessingImage(true);
        try {
            const extractedHexes = await extractColorsFromImage(imageData, count);

            let finalHexes = extractedHexes;
            if (prompt) {
                const refineSchema = { type: "OBJECT", properties: { hexes: { type: "ARRAY", items: { type: "STRING" } } }, required: ["hexes"] };
                const refineRes = await callGemini(`I have these dominant colors from an image: ${extractedHexes.join(', ')}. Create a palette of ${count} colors that combines the image's aesthetic with this creative prompt: "${prompt}".`, refineSchema);
                finalHexes = refineRes.hexes;
            }

            const { meta, colors } = await fetchRichPaletteData(finalHexes);

            const newPalette = {
                id: Date.now().toString(),
                name: meta.name,
                nameLocked: false,
                descriptionLocked: false,
                colors: finalHexes.map((hex, i) => ({
                    hex,
                    name: colors[i]?.name || "Color",
                    description: colors[i]?.description || "",
                    text: getContrastColor(hex)
                })),
                insights: []
            };

            const updated = [...palettes, newPalette];
            setPalettes(updated);
            setActiveIndex(updated.length - 1);
            setCurrentPage('editor');
            setGenerationModal({ open: false });
            pushState(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessingImage(false);
        }
    };

    const deletePalette = () => {
        const idx = deleteModal.index !== null ? deleteModal.index : activeIndex;
        const updated = palettes.filter((_, i) => i !== idx);
        setDeleteModal({ isOpen: false, index: null });
        if (updated.length === 0) {
            const fallback = [
                {
                    id: Date.now().toString(),
                    name: "Untitled Studio",
                    nameLocked: false,
                    descriptionLocked: false,
                    colors: [
                        { hex: "#3B82F6", name: "Blue", text: "#ffffff" },
                        { hex: "#F8FAFC", name: "White", text: "#000000" },
                        { hex: "#1E293B", name: "Dark", text: "#ffffff" }
                    ],
                    insights: []
                }
            ];
            setPalettes(fallback);
            setActiveIndex(0);
            setCurrentPage('library');
            pushState(fallback);
        } else {
            setPalettes(updated);
            setActiveIndex(0);
            setCurrentPage('library');
            pushState(updated);
        }
    };


    return (
        <TooltipContext.Provider value={{ showTooltips }}>
            <div className="min-h-screen bg-neumorphic-bg">
                {/* Global Header */}
                <nav className="bg-neumorphic-bg/80 backdrop-blur-md border-b border-white/20 px-6 md:px-16 h-20 flex items-center">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {(currentPage === 'editor' || currentPage === 'material-creator') && (
                                <div className="flex items-center justify-center h-10">
                                    <button
                                        onClick={() => setCurrentPage('library')}
                                        className="neu-flat-sm neu-back-btn p-4 md:p-3 rounded-full text-slate-600 hover:text-indigo-600 active:scale-95 transition-all flex items-center justify-center"
                                        title="Back to Library"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-3 h-10">
                                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                                <span className="text-xl font-black text-slate-800 tracking-tighter">Palette Studio</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="theme-toggle"
                                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            >
                                <div className="theme-toggle-knob">
                                    {theme === 'light' ? (
                                        <Sun size={14} className="text-amber-500" />
                                    ) : (
                                        <Moon size={14} className="text-indigo-400" />
                                    )}
                                </div>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="neu-flat-sm w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Settings"
                                >
                                    <Settings size={18} />
                                </button>

                                {showSettings && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setShowSettings(false)}></div>
                                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-[101] border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Settings</h3>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                    <Info className="w-4 h-4" /> Tooltips
                                                </span>
                                                <button
                                                    onClick={() => setShowTooltips(!showTooltips)}
                                                    className={`w-10 h-5 rounded-full transition-colors relative ${showTooltips ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${showTooltips ? 'translate-x-5' : ''}`} />
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <a
                                                    href={`http://${window.location.hostname}:5174`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setShowSettings(false)}
                                                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                >
                                                    <ExternalLink className="w-4 h-4" /> Go to Resume Studio
                                                </a>
                                            </div>

                                            <div className="text-xs text-slate-400 pt-2 text-center">
                                                More preferences coming soon...
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="">
                    {currentPage === 'library' ? (
                        <LibraryView
                            palettes={palettes}
                            projects={projects}
                            setActiveIndex={setActiveIndex}
                            setCurrentPage={setCurrentPage}
                            addPalette={addPalette}
                            addMaterialPalette={addMaterialPalette}
                            setDeleteModal={setDeleteModal}
                            createProject={createProject}
                            updateProject={updateProject}
                            deleteProject={deleteProject}
                            movePaletteToProject={movePaletteToProject}
                            reorderPalettes={reorderPalettes}
                        />
                    ) : currentPage === 'material-creator' ? (
                        <MaterialCreatorView
                            currentPalette={currentPalette}
                            setCurrentPage={setCurrentPage}
                            palettes={palettes}
                            updateField={updateField}
                            updateColor={updateColor}
                            pushState={pushState}
                            getContrastColor={getContrastColor}
                            suggestPaletteName={suggestPaletteName}
                            isSuggestingName={isSuggestingName}
                            suggestPaletteDesc={suggestPaletteDesc}
                            isSuggestingDesc={isSuggestingDesc}
                            historyIndex={historyIndex}
                            history={history}
                            undo={undo}
                            redo={redo}
                            randomizePalette={randomizePalette}
                            setDeleteModal={setDeleteModal}
                            activeIndex={activeIndex}
                            setGenerationModal={setGenerationModal}
                            autoOrganizeColors={autoOrganizeColors}
                            handleAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                            insightsRef={insightsRef}
                            setPaletteSelectorModal={setPaletteSelectorModal}
                        />
                    ) : (
                        <EditorView
                            currentPalette={currentPalette}
                            setCurrentPage={setCurrentPage}
                            suggestPaletteName={suggestPaletteName}
                            isSuggestingName={isSuggestingName}
                            updateField={updateField}
                            suggestPaletteDesc={suggestPaletteDesc}
                            isSuggestingDesc={isSuggestingDesc}
                            historyIndex={historyIndex}
                            history={history}
                            undo={undo}
                            redo={redo}
                            randomizePalette={randomizePalette}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            setDeleteModal={setDeleteModal}
                            activeIndex={activeIndex}
                            getShuffledColor={getShuffledColor}
                            setEditorModal={setEditorModal}
                            handleNameColor={handleNameColor}
                            isNaming={isNaming}
                            removeColor={removeColor}
                            copyHex={copyHex}
                            copiedColor={copiedColor}
                            addColor={addColor}
                            getSuggestedColors={getSuggestedColors}
                            isSuggestingColors={isSuggestingColors}
                            showSuggestions={showSuggestions}
                            setShowSuggestions={setShowSuggestions}
                            suggestedColors={suggestedColors}
                            palettes={palettes}
                            pushState={pushState}
                            getContrastColor={getContrastColor}
                            showLimitError={showLimitError}
                            limitError={limitError}
                            bulkInput={bulkInput}
                            setBulkInput={setBulkInput}
                            addBulkColors={addBulkColors}
                            handleAnalyze={handleAnalyze}
                            isAnalyzing={isAnalyzing}
                            mockupType={mockupType}
                            setMockupType={setMockupType}
                            shuffleMockupColors={shuffleMockupColors}
                            isInsightsOutdated={JSON.stringify(lastAnalyzedColors) !== JSON.stringify(currentPalette.colors.map(c => c.hex))}
                            setGenerationModal={setGenerationModal}
                            autoOrganizeColors={autoOrganizeColors}
                            toggleDominant={toggleDominant}
                            insightsRef={insightsRef}
                            showInsights={showInsights}
                            handleAddSuggestedColor={handleAddSuggestedColor}
                            autoResizeTextarea={autoResizeTextarea}
                            textareaRef={textareaRef}
                            modifyPaletteWithPrompt={modifyPaletteWithPrompt}
                            isGenerating={isGenerating}
                            reorderColors={reorderColors}
                        />
                    )}

                    <GenerationModal
                        isOpen={generationModal.isOpen}
                        onClose={() => setGenerationModal({ isOpen: false })}
                        onGenerate={handleAIStudio}
                        isGenerating={isGenerating}
                        isProcessingImage={isProcessingImage}
                        currentPalette={currentPalette}
                    />

                    <ColorEditorModal
                        isOpen={editorModal.isOpen}
                        colorIdx={editorModal.colorIdx}
                        colors={currentPalette?.colors || []}
                        onClose={() => setEditorModal({ isOpen: false, colorIdx: null })}
                        updateColor={updateColor}
                        handleNameColor={handleNameColor}
                        isNaming={isNaming}
                        copyHex={copyHex}
                        copiedColor={copiedColor}
                        setCopiedColor={setCopiedColor}
                        getContrastColor={getContrastColor}
                        onSave={saveColorEdit}
                    />

                    <DeleteModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, index: null })}
                        onConfirm={() => {
                            const updated = palettes.filter((_, i) => i !== deleteModal.index);
                            setPalettes(updated);
                            setHistory([updated]);
                            setHistoryIndex(0);
                            setActiveIndex(0);
                            setDeleteModal({ isOpen: false, index: null });
                            setCurrentPage('library');
                        }}
                    />

                    <PaletteSelectorModal
                        isOpen={paletteSelectorModal.isOpen}
                        onClose={() => setPaletteSelectorModal({ isOpen: false })}
                        palettes={palettes.filter(p => p.type !== 'material')}
                        onSelect={paletteSelectorModal.onSelect || (() => { })}
                    />
                </div>
            </div>
        </TooltipContext.Provider>
    );
};

export default App;
