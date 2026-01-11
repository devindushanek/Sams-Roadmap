import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Moon, Sun, Save, Check, Copy, Sparkles,
    Box, Droplets, Layers, Move, Trash2, Plus, Info,
    ChevronRight, ChevronLeft, Maximize2, Search, Palette,
    Lock, Unlock, RefreshCw, Loader2, MessageSquarePlus,
    ArrowUpDown, Dices, RotateCcw, RotateCw, X
} from 'lucide-react';
import { textures } from '../../data/textures';
import { autoResizeTextarea } from '../../utils/uiUtils';
import Tooltip from '../ui/Tooltip';

const MaterialSwatch = ({
    swatch,
    isSelected,
    onClick,
    onDrop,
    onRemove,
    getContrastColor,
    edgeBlending
}) => {
    const texture = textures.find(t => t.id === swatch.textureId) || textures[0];

    // Calculate brightness and shadow filters
    const brightness = swatch.brightness !== undefined ? swatch.brightness : 1;
    const shadows = swatch.shadows !== undefined ? swatch.shadows : 0;

    return (
        <div
            onClick={onClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, swatch.id)}
            className={`relative flex-1 h-full cursor-pointer transition-all duration-500 group overflow-hidden ${isSelected ? 'ring-inset ring-4 ring-indigo-500 z-10' : ''}`}
            style={{
                backgroundColor: swatch.color || swatch.hex,
                filter: `brightness(${brightness}) contrast(${1 + shadows * 0.2})`,
                marginRight: `-${edgeBlending * 20}px`, // Negative margin for overlap
                maskImage: edgeBlending > 0 ? `linear-gradient(to right, black calc(100% - ${edgeBlending * 40}px), transparent)` : 'none',
                WebkitMaskImage: edgeBlending > 0 ? `linear-gradient(to right, black calc(100% - ${edgeBlending * 40}px), transparent)` : 'none',
            }}
        >
            {/* Texture Layer */}
            <div
                className="absolute inset-0 mix-blend-multiply pointer-events-none transition-opacity duration-500"
                style={{
                    backgroundImage: `url(${texture.image})`,
                    backgroundSize: 'cover',
                    opacity: swatch.intensity !== undefined ? swatch.intensity : 1.0
                }}
            />

            {/* Lighting/Gloss Layer */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none transition-opacity duration-500"
                style={{ opacity: swatch.gloss || 0.2 }}
            />

            {/* Metallic Sheen */}
            {swatch.metallic > 0 && (
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/20 to-black/10 pointer-events-none mix-blend-overlay"
                    style={{ opacity: swatch.metallic }}
                />
            )}

            {/* Edge Shadow for Blending */}
            {edgeBlending > 0 && (
                <div
                    className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-black/30 pointer-events-none z-20"
                    style={{ opacity: edgeBlending }}
                />
            )}

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-300">
                    Active
                </div>
            )}

            {/* Overlay Info */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">{texture.name}</div>
                <div className="text-lg font-black text-white truncate">{(swatch.color || swatch.hex).toUpperCase()}</div>
                <div className="text-[10px] font-bold text-white/60 mt-1">{swatch.name}</div>
            </div>

            {/* Remove Button */}
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 backdrop-blur-md"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
};

const MaterialCreatorView = ({
    currentPalette, setCurrentPage, palettes, updateField, updateColor,
    pushState, getContrastColor, suggestPaletteName, isSuggestingName,
    suggestPaletteDesc, isSuggestingDesc, handleAnalyze, isAnalyzing, insightsRef,
    historyIndex, history, undo, redo, randomizePalette, setDeleteModal,
    activeIndex, setGenerationModal, autoOrganizeColors, setPaletteSelectorModal
}) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceColors, setSourceColors] = useState(null);

    const titleRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        autoResizeTextarea(titleRef);
        autoResizeTextarea(textareaRef);
    }, [currentPalette.id]);

    const swatches = currentPalette.colors.map((c, i) => ({
        ...c,
        id: i.toString(),
        color: c.hex // Ensure color field exists for MaterialSwatch
    }));

    const activeSwatch = swatches[activeIdx] || swatches[0];
    const edgeBlending = currentPalette.edgeBlending || 0;

    const updateActiveSwatch = (updates) => {
        // Map updates back to palette color structure
        const colorUpdates = { ...updates };
        if (updates.color) {
            colorUpdates.hex = updates.color;
            colorUpdates.text = getContrastColor(updates.color);
        }
        updateColor(activeIdx, null, null, colorUpdates);
    };

    const handleAddSwatch = () => {
        const newColor = {
            hex: '#ffffff',
            name: 'New Material',
            description: '...',
            text: getContrastColor('#ffffff'),
            textureId: 'matte_plaster',
            intensity: 1.0,
            gloss: 0.2,
            metallic: 0,
            brightness: 1,
            shadows: 0
        };
        const updatedColors = [...currentPalette.colors, newColor];
        updateField('colors', updatedColors);
        setActiveIdx(updatedColors.length - 1);
    };

    const handleRemoveSwatch = (idx) => {
        if (currentPalette.colors.length <= 1) return;
        const updatedColors = currentPalette.colors.filter((_, i) => i !== idx);
        updateField('colors', updatedColors);
        if (activeIdx >= updatedColors.length) setActiveIdx(updatedColors.length - 1);
    };

    const handleDrop = (e, idx) => {
        e.preventDefault();
        const color = e.dataTransfer.getData('color');
        const textureId = e.dataTransfer.getData('textureId');

        if (color) {
            updateColor(idx, 'hex', color);
            updateColor(idx, 'text', getContrastColor(color));
        }
        if (textureId) {
            updateColor(idx, 'textureId', textureId);
        }
    };

    const filteredPalettes = palettes.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neumorphic-bg flex flex-col animate-in fade-in duration-700 px-6 md:px-16 pb-8 md:pb-16 pt-4 md:pt-4">
            {/* Header - Unified with EditorView */}
            <header className="max-w-6xl mx-auto w-full mb-2 md:mb-6">
                <div className="flex flex-col gap-6">
                    <div className="flex-1 space-y-1.5">
                        {/* Title Row */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0 h-11">
                                <button
                                    onClick={() => updateField('nameLocked', !currentPalette.nameLocked)}
                                    className={`p-2 transition-all ${currentPalette.nameLocked ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                                    title={currentPalette.nameLocked ? 'Unlock Name' : 'Lock Name'}
                                >
                                    {currentPalette.nameLocked ? <Lock size={18} /> : <Unlock size={18} className="opacity-40" />}
                                </button>
                                <Tooltip content="Regenerate Name">
                                    <button
                                        onClick={suggestPaletteName}
                                        disabled={currentPalette.nameLocked}
                                        className={`neu-icon-ghost transition-all ${currentPalette.nameLocked ? 'opacity-20 cursor-not-allowed' : ''}`}
                                    >
                                        {isSuggestingName ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                    </button>
                                </Tooltip>
                            </div>
                            <div className="relative flex-1 group">
                                <textarea
                                    ref={titleRef}
                                    value={currentPalette.name}
                                    onChange={(e) => {
                                        updateField('name', e.target.value);
                                        if (!currentPalette.nameLocked) updateField('nameLocked', true);
                                        autoResizeTextarea(titleRef);
                                    }}
                                    rows={1}
                                    className="text-4xl font-black bg-transparent border-none border-0 outline-none p-0 focus:ring-0 w-full text-slate-900 dark:text-slate-100 resize-none overflow-hidden leading-tight"
                                    placeholder="Untitled Workbench"
                                />
                            </div>
                        </div>

                        {/* Description Row & Toolbar */}
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
                            <div className="flex-1 w-full">
                                <div className="flex items-start gap-2">
                                    <div className="flex items-center gap-0">
                                        <button
                                            onClick={() => updateField('descriptionLocked', !currentPalette.descriptionLocked)}
                                            className={`p-2 transition-all ${currentPalette.descriptionLocked ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                                            title={currentPalette.descriptionLocked ? 'Unlock Description' : 'Lock Description'}
                                        >
                                            {currentPalette.descriptionLocked ? <Lock size={18} /> : <Unlock size={18} className="opacity-40" />}
                                        </button>
                                        <Tooltip content="Regenerate Description">
                                            <button
                                                onClick={suggestPaletteDesc}
                                                disabled={currentPalette.descriptionLocked}
                                                className={`neu-icon-ghost transition-all ${currentPalette.descriptionLocked ? 'opacity-20 cursor-not-allowed' : ''}`}
                                            >
                                                {isSuggestingDesc ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <textarea
                                            ref={textareaRef}
                                            value={currentPalette.description}
                                            onChange={(e) => {
                                                updateField('description', e.target.value);
                                                if (!currentPalette.descriptionLocked) updateField('descriptionLocked', true);
                                                autoResizeTextarea(textareaRef);
                                            }}
                                            className="text-slate-500 text-sm font-bold bg-transparent border-none outline-none p-0 focus:ring-0 w-full resize-none leading-relaxed overflow-hidden"
                                            placeholder="Enter a design rationale..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toolbar - Aligned with Description */}
                            <div className="flex flex-col md:flex-row lg:flex-col items-center gap-4 w-full lg:w-96 shrink-0">
                                {/* Edge Blending Slider in Toggle Area */}
                                <div className="neu-flat p-1.5 rounded-full flex items-center gap-4 w-full md:flex-[0_0_50%] lg:w-full px-6 h-[52px]">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">Edge Blending</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={edgeBlending}
                                        onChange={(e) => updateField('edgeBlending', parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>

                                {/* Action Buttons Group */}
                                <div className="flex items-center w-full md:w-1/2 lg:w-full justify-between gap-0">
                                    <Tooltip content="Sort Palette" className="flex-1">
                                        <button onClick={autoOrganizeColors} className="neu-icon-ghost transition-all p-4 md:p-2 w-full flex items-center justify-center">
                                            <ArrowUpDown size={20} />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content="Randomize Palette" className="flex-1">
                                        <button onClick={randomizePalette} className="neu-icon-ghost transition-all p-4 md:p-2 w-full flex items-center justify-center">
                                            <Dices size={20} />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content="Generate Palette" className="flex-1">
                                        <button
                                            onClick={() => setGenerationModal({ isOpen: true })}
                                            className="neu-icon-ghost transition-all text-indigo-600 p-4 md:p-2 w-full flex items-center justify-center"
                                        >
                                            <Sparkles size={20} />
                                        </button>
                                    </Tooltip>

                                    <Tooltip content="Select Color Palette" className="flex-1">
                                        <button
                                            onClick={() => setPaletteSelectorModal({
                                                isOpen: true,
                                                onSelect: (p) => setSourceColors(p)
                                            })}
                                            className="neu-icon-ghost transition-all text-slate-600 p-4 md:p-2 w-full flex items-center justify-center"
                                        >
                                            <Palette size={20} />
                                        </button>
                                    </Tooltip>

                                    <div className="h-6 border-l border-slate-300/80 mx-1 hidden md:block flex-none" />

                                    <Tooltip content="Undo" className="flex-1">
                                        <button disabled={historyIndex === 0} onClick={undo} className={`neu-icon-ghost p-4 md:p-2 w-full flex items-center justify-center ${historyIndex === 0 ? 'opacity-20 pointer-events-none' : ''}`}><RotateCcw size={18} /></button>
                                    </Tooltip>
                                    <Tooltip content="Redo" className="flex-1">
                                        <button disabled={historyIndex >= history.length - 1} onClick={redo} className={`neu-icon-ghost p-4 md:p-2 w-full flex items-center justify-center ${historyIndex >= history.length - 1 ? 'opacity-20 pointer-events-none' : ''}`}><RotateCw size={18} /></button>
                                    </Tooltip>

                                    <div className="h-6 border-l border-slate-200/50 mx-1 hidden md:block flex-none" />

                                    <Tooltip content="Delete Palette" className="flex-1">
                                        <button onClick={() => setDeleteModal({ isOpen: true, index: activeIndex })} className="neu-icon-ghost-rose transition-all p-4 md:p-2 w-full flex items-center justify-center">
                                            <Trash2 size={20} />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Source Colors Area */}
            {sourceColors && (
                <div className="max-w-6xl mx-auto w-full mb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="neu-flat p-6 rounded-[2rem] bg-white/40 backdrop-blur-md flex items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <Palette size={16} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800">{sourceColors.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Drag colors to apply to materials</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {sourceColors.colors.map((c, i) => (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('color', c.hex)}
                                        onClick={() => updateActiveSwatch({ color: c.hex })}
                                        className="w-12 h-12 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all active:scale-90 border-2 border-white"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setSourceColors(null)}
                            className="p-3 rounded-2xl hover:bg-white/50 text-slate-400 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[1600px] mx-auto w-full flex-1 flex overflow-hidden rounded-[2.5rem] bg-white/50 backdrop-blur-sm shadow-2xl border border-white/20">
                {/* Left Sidebar: Textures */}
                <aside className="w-56 border-r border-slate-200/50 flex flex-col">
                    <div className="p-6 border-b border-slate-200/50">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <Box size={14} /> Texture Library
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        {textures.map(t => (
                            <div
                                key={t.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('textureId', t.id)}
                                onClick={() => updateActiveSwatch({ textureId: t.id })}
                                className={`group relative p-3 rounded-xl cursor-pointer transition-all hover:bg-white/80 ${activeSwatch.textureId === t.id ? 'bg-white shadow-lg ring-2 ring-indigo-500/20' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden shadow-inner bg-slate-100">
                                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-800">{t.name}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.category}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Workbench */}
                <main className="flex-1 bg-slate-100/30 flex flex-col overflow-y-auto no-scrollbar">
                    <div className="flex flex-col items-center p-8 gap-8">
                        <div className="w-full max-w-5xl h-[320px] flex items-stretch rounded-[3rem] overflow-hidden shadow-2xl bg-white shrink-0">
                            {swatches.map((s, i) => (
                                <MaterialSwatch
                                    key={i}
                                    swatch={s}
                                    isSelected={activeIdx === i}
                                    onClick={() => setActiveIdx(i)}
                                    onDrop={(e) => handleDrop(e, i)}
                                    onRemove={() => handleRemoveSwatch(i)}
                                    getContrastColor={getContrastColor}
                                    edgeBlending={edgeBlending}
                                />
                            ))}
                            <button
                                onClick={handleAddSwatch}
                                className="w-24 flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-indigo-500 transition-all hover:bg-indigo-50/30 border-l border-slate-100 group shrink-0"
                            >
                                <Plus size={24} />
                                <span className="font-black text-[9px] uppercase tracking-widest">Add</span>
                            </button>
                        </div>

                        {/* Active Swatch Controls */}
                        <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-xl p-8 flex gap-10 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="w-56 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl shadow-inner overflow-hidden" style={{ backgroundColor: activeSwatch.color }}>
                                        <div
                                            className="w-full h-full mix-blend-multiply"
                                            style={{
                                                backgroundImage: `url(${textures.find(t => t.id === activeSwatch.textureId)?.image})`,
                                                backgroundSize: 'cover'
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={activeSwatch.name}
                                            onChange={(e) => updateActiveSwatch({ name: e.target.value })}
                                            className="bg-transparent border-none p-0 text-lg font-black text-slate-900 focus:ring-0 w-full"
                                        />
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <input
                                                type="color"
                                                value={activeSwatch.color}
                                                onChange={(e) => updateActiveSwatch({ color: e.target.value })}
                                                className="w-4 h-4 rounded-full overflow-hidden cursor-pointer border-none p-0"
                                            />
                                            <span className="font-mono font-bold text-[10px] text-slate-400">{activeSwatch.color.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Texture Intensity</label>
                                        <span className="text-[10px] font-bold text-indigo-600">{Math.round((activeSwatch.intensity !== undefined ? activeSwatch.intensity : 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={activeSwatch.intensity !== undefined ? activeSwatch.intensity : 1}
                                        onChange={(e) => updateActiveSwatch({ intensity: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Gloss / Sheen</label>
                                        <span className="text-[10px] font-bold text-indigo-600">{Math.round((activeSwatch.gloss || 0) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={activeSwatch.gloss || 0}
                                        onChange={(e) => updateActiveSwatch({ gloss: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Metallic Level</label>
                                        <span className="text-[10px] font-bold text-indigo-600">{Math.round((activeSwatch.metallic || 0) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={activeSwatch.metallic || 0}
                                        onChange={(e) => updateActiveSwatch({ metallic: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Boost Brightness</label>
                                        <span className="text-[10px] font-bold text-indigo-600">{Math.round((activeSwatch.brightness || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="2" step="0.01"
                                        value={activeSwatch.brightness || 1}
                                        onChange={(e) => updateActiveSwatch({ brightness: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Shadow Depth</label>
                                        <span className="text-[10px] font-bold text-indigo-600">{Math.round((activeSwatch.shadows || 0) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.01"
                                        value={activeSwatch.shadows || 0}
                                        onChange={(e) => updateActiveSwatch({ shadows: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div className="flex flex-col items-center py-4 gap-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="neu-flat w-64 h-14 text-indigo-600 font-black flex items-center justify-center gap-3 neu-button-hover disabled:opacity-50 transition-all text-sm uppercase tracking-[0.2em] relative"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Analyzing</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        <span>Analyze</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Insights Section */}
                        {currentPalette.insights?.length > 0 && (
                            <div ref={insightsRef} className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
                                {currentPalette.insights.map((insight, i) => (
                                    <div key={i} className="neu-flat p-8 group transition-all hover:shadow-neu-pressed flex flex-col">
                                        <div className="mb-4 space-y-1">
                                            <h5 className="font-black text-xs uppercase tracking-widest text-indigo-600">{insight.category || 'Insight'}</h5>
                                            <h4 className="font-bold text-base text-slate-500 leading-snug">{insight.title}</h4>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed text-sm flex flex-wrap items-center gap-x-1">
                                            {insight.text.split(/\(?#[0-9A-F]{6}\)?/i).map((part, idx, arr) => {
                                                const hexMatches = insight.text.match(/\(?#[0-9A-F]{6}\)?/gi) || [];
                                                const hex = hexMatches[idx]?.match(/#[0-9A-F]{6}/i)?.[0];

                                                // Find if this hex is in our current palette to get its texture
                                                const swatch = currentPalette.colors.find(c => c.hex.toLowerCase() === hex?.toLowerCase());
                                                const texture = textures.find(t => t.id === swatch?.textureId) || textures[0];

                                                return (
                                                    <React.Fragment key={idx}>
                                                        {part}
                                                        {hex && idx < arr.length - 1 && (
                                                            <span className="inline-flex items-center align-middle mx-0.5 group/swatch relative">
                                                                <div
                                                                    className="w-5 h-5 rounded-md shadow-sm border border-black/5 overflow-hidden relative"
                                                                    style={{ backgroundColor: hex }}
                                                                >
                                                                    {swatch?.textureId && (
                                                                        <div
                                                                            className="absolute inset-0 mix-blend-multiply opacity-60"
                                                                            style={{
                                                                                backgroundImage: `url(${texture.image})`,
                                                                                backgroundSize: 'cover'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] font-black rounded opacity-0 group-hover/swatch:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                                    {hex.toUpperCase()} {swatch?.textureId ? `• ${texture.name}` : ''}
                                                                </div>
                                                            </span>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MaterialCreatorView;
