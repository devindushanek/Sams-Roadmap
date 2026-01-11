import React, { useEffect, useState, useRef } from 'react';
import {
    Copy, Check, Palette, Plus, Trash2, Edit2,
    RotateCcw, RotateCw, RefreshCw, Sparkles, Loader2, Minus,
    Smartphone, Lock, Unlock, X, Dices, MessageSquarePlus, Type, Star, ArrowUpDown, Crown, Monitor, Shuffle, Layout, Grip, Eye
} from 'lucide-react';
import MockupCarousel from '../MockupCarousel';
import EditorialMockups from '../mockups/EditorialMockups';
import DesktopMockups from '../mockups/DesktopMockups';
import MobileMockups from '../mockups/MobileMockups';
import BrandingMockups from '../mockups/BrandingMockups';
import Tooltip from '../ui/Tooltip';
import { textures } from '../../data/textures';

const EditorView = ({
    currentPalette, setCurrentPage, suggestPaletteName, isSuggestingName, updateField,
    suggestPaletteDesc, isSuggestingDesc, historyIndex, history, undo, redo,
    randomizePalette, viewMode, setViewMode, setDeleteModal, activeIndex,
    getShuffledColor, setEditorModal, handleNameColor, isNaming, removeColor,
    copyHex, copiedColor, addColor, getSuggestedColors, isSuggestingColors,
    showSuggestions, setShowSuggestions, suggestedColors, palettes, pushState,
    getContrastColor, showLimitError, limitError, bulkInput, setBulkInput,
    addBulkColors, handleAnalyze, isAnalyzing, mockupType, setMockupType,
    shuffleMockupColors, isInsightsOutdated, setGenerationModal,
    autoOrganizeColors, toggleDominant, insightsRef, showInsights,
    handleAddSuggestedColor, autoResizeTextarea, textareaRef,
    modifyPaletteWithPrompt, isGenerating, reorderColors
}) => {
    const [highlightedSwatch, setHighlightedSwatch] = useState(null);
    const [draggedColorIdx, setDraggedColorIdx] = useState(null);
    const [dragOverColorIdx, setDragOverColorIdx] = useState(null);
    const [readabilityEnabled, setReadabilityEnabled] = useState(true);
    const swatchRefs = useRef({});
    const titleRef = useRef(null);
    const longPressTimer = useRef(null);
    const touchStartPosition = useRef({ x: 0, y: 0 });
    const [mobileActiveIdx, setMobileActiveIdx] = useState(null);
    const [dragGhost, setDragGhost] = useState(null);

    useEffect(() => {
        // Ensure description and title are fully expanded on mount and resize
        const handleResize = () => {
            autoResizeTextarea(textareaRef);
            autoResizeTextarea(titleRef);
        };

        const timer = setTimeout(() => {
            handleResize();
        }, 100);

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [currentPalette.id]);

    const scrollToSwatch = (hex) => {
        const targetHex = hex.toUpperCase();
        const element = swatchRefs.current[targetHex];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedSwatch(targetHex);
            setTimeout(() => setHighlightedSwatch(null), 2000);
        }
    };

    // Drag handlers for swatch reordering
    const handleColorDragStart = (e, idx) => {
        setDraggedColorIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idx.toString());
    };

    const handleColorDragEnd = () => {
        setDraggedColorIdx(null);
        setDragOverColorIdx(null);
    };

    const handleColorDragOver = (e, idx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedColorIdx !== null && draggedColorIdx !== idx) {
            setDragOverColorIdx(idx);
        }
    };

    const handleColorDragLeave = () => {
        setDragOverColorIdx(null);
    };

    const handleColorDrop = (e, toIdx) => {
        e.preventDefault();
        if (draggedColorIdx !== null && draggedColorIdx !== toIdx) {
            reorderColors(draggedColorIdx, toIdx);
        }
        setDraggedColorIdx(null);
        setDragOverColorIdx(null);
    };

    // Touch handlers for mobile drag
    // Touch handlers for mobile drag (Long Press)
    const handleTouchStart = (e, index) => {
        touchStartPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        longPressTimer.current = setTimeout(() => {
            setDraggedColorIdx(index);
            setDragGhost({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                hex: currentPalette.colors[index].hex
            });
            document.body.style.overflow = 'hidden';
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleTouchMove = (e) => {
        if (draggedColorIdx === null) {
            const dx = Math.abs(e.touches[0].clientX - touchStartPosition.current.x);
            const dy = Math.abs(e.touches[0].clientY - touchStartPosition.current.y);
            if (dx > 10 || dy > 10) {
                clearTimeout(longPressTimer.current);
            }
            return;
        }

        setDragGhost(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));

        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            const swatch = element.closest('[data-swatch-index]');
            if (swatch) {
                const index = parseInt(swatch.getAttribute('data-swatch-index'));
                if (!isNaN(index) && index !== dragOverColorIdx && index !== draggedColorIdx) {
                    setDragOverColorIdx(index);
                }
            }
        }
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimer.current);
        setDragGhost(null);
        if (draggedColorIdx !== null && dragOverColorIdx !== null) {
            reorderColors(draggedColorIdx, dragOverColorIdx);
        }
        setDraggedColorIdx(null);
        setDragOverColorIdx(null);
        document.body.style.overflow = '';
    };

    return (
        <div className="min-h-screen bg-neumorphic-bg flex flex-col px-6 md:px-16 pb-8 md:pb-16 pt-4 md:pt-4 animate-in slide-in-from-right-2">
            <header className="max-w-6xl mx-auto w-full mb-2 md:mb-6">
                <div className="flex flex-col gap-6">
                    <div className="flex-1 space-y-1.5">
                        {/* Title Row - Full Width */}
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
                                    placeholder="Untitled Palette"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
                            {/* Description Row */}
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
                                    <div className="flex-1 w-full space-y-3">
                                        <textarea
                                            ref={textareaRef}
                                            value={currentPalette.description}
                                            onChange={(e) => {
                                                updateField('description', e.target.value);
                                                if (!currentPalette.descriptionLocked) updateField('descriptionLocked', true);
                                                autoResizeTextarea(e);
                                            }}
                                            className="text-slate-500 text-sm font-bold bg-transparent border-none outline-none p-0 focus:ring-0 w-full resize-none leading-relaxed overflow-hidden"
                                            placeholder="Enter a design rationale..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toolbar - Aligned with Description */}
                            <div className="flex flex-col md:flex-row lg:flex-col items-center gap-4 w-full lg:w-96 shrink-0">
                                {/* View Toggle */}
                                <div className="neu-flat p-1.5 rounded-full flex items-center gap-1 w-full md:flex-[0_0_50%] lg:w-full">
                                    <button onClick={() => setViewMode('grid')} className={`px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all flex-1 justify-center ${viewMode === 'grid' ? 'shadow-neu-pressed-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Palette size={14} /> Swatches</button>
                                    <button onClick={() => setViewMode('mockup')} className={`px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all flex-1 justify-center ${viewMode === 'mockup' ? 'shadow-neu-pressed-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><Layout size={14} /> Mockup</button>
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

            <main className="max-w-6xl mx-auto w-full flex-1 space-y-6 pt-2 pb-6">
                {viewMode === 'grid' ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 relative z-20">
                            {currentPalette?.colors?.map((c, i) => (
                                <div
                                    key={i}
                                    ref={el => swatchRefs.current[c.hex.toUpperCase()] = el}
                                    data-swatch-index={i}
                                    draggable
                                    onTouchStart={(e) => handleTouchStart(e, i)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    onDragStart={(e) => handleColorDragStart(e, i)}
                                    onDragEnd={handleColorDragEnd}
                                    onDragOver={(e) => handleColorDragOver(e, i)}
                                    onDragLeave={handleColorDragLeave}
                                    onDrop={(e) => handleColorDrop(e, i)}
                                    onClick={(e) => {
                                        if (window.innerWidth < 768) {
                                            if (mobileActiveIdx !== i) {
                                                setMobileActiveIdx(i);
                                                return;
                                            }
                                        }
                                        setEditorModal({ isOpen: true, colorIdx: i });
                                    }}
                                    className={`neu-flat p-3 flex flex-col gap-3 transition-all cursor-pointer group neu-card-hover ${highlightedSwatch === c.hex.toUpperCase() ? 'animate-flash-blue' : ''} ${draggedColorIdx === i ? 'opacity-50 scale-95' : ''} ${dragOverColorIdx === i ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                >
                                    <div className={`h-24 rounded-2xl relative overflow-hidden group/color`}>
                                        <div
                                            className="absolute inset-0 transition-transform duration-500 group-hover/color:scale-110"
                                            style={{
                                                backgroundColor: c.hex,
                                                filter: `brightness(${c.brightness || 1}) contrast(${1 + (c.shadows || 0) * 0.2})`
                                            }}
                                        />

                                        {(c.textureId || (currentPalette.type === 'material' && currentPalette.textureId)) && (
                                            <div
                                                className="absolute inset-0 mix-blend-multiply pointer-events-none"
                                                style={{
                                                    backgroundImage: `url(${textures.find(t => t.id === (c.textureId || currentPalette.textureId))?.image})`,
                                                    backgroundSize: 'cover',
                                                    opacity: c.intensity !== undefined ? c.intensity : 0.3
                                                }}
                                            />
                                        )}

                                        {/* Gloss Layer */}
                                        {c.gloss > 0 && (
                                            <div
                                                className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"
                                                style={{ opacity: c.gloss }}
                                            />
                                        )}

                                        {/* Metallic Layer */}
                                        {c.metallic > 0 && (
                                            <div
                                                className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/20 to-black/10 pointer-events-none mix-blend-overlay"
                                                style={{ opacity: c.metallic }}
                                            />
                                        )}

                                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />

                                        {/* Drag Handle */}
                                        <div
                                            className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 backdrop-blur text-white opacity-0 group-hover/color:opacity-100 ${mobileActiveIdx === i ? 'opacity-100' : ''} hover:bg-white/40 cursor-move z-20`}
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            <Grip size={14} />
                                        </div>

                                        {/* Selectable Crown */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleDominant(i); }}
                                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-20 ${c.dominant ? 'bg-amber-400 text-white scale-100' : `bg-white/20 backdrop-blur text-white opacity-0 group-hover/color:opacity-100 ${mobileActiveIdx === i ? 'opacity-100' : ''} hover:bg-white/40`}`}
                                            title={c.dominant ? 'Remove from dominant' : 'Mark as dominant (max 3)'}
                                        >
                                            <Crown size={14} fill={c.dominant ? "currentColor" : "none"} />
                                        </button>

                                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 ${mobileActiveIdx === i ? 'opacity-100' : ''} transition-opacity bg-black/10 backdrop-blur-[2px] z-10 pointer-events-none`}>
                                            <Edit2 size={24} className="text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-0.5 px-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleNameColor(i); }}
                                                    className="neu-icon-ghost p-1.5"
                                                >
                                                    {isNaming === i || c.name === '...' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                </button>
                                                <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 flex-1">{c.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeColor(i); }}
                                                    className={`neu-icon-ghost-rose p-1.5 opacity-0 group-hover:opacity-100 ${mobileActiveIdx === i ? 'opacity-100' : ''} ${(currentPalette?.colors?.length || 0) <= 2 ? 'hidden' : ''}`}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyHex(c.hex); }}
                                                    className="neu-icon-ghost p-1.5"
                                                >
                                                    {copiedColor === c.hex ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                                <span className={`font-mono font-black text-base text-slate-900`}>{c.hex.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(currentPalette?.colors?.length || 0) < 10 && (
                                <div className="neu-flat p-4 flex flex-col justify-between gap-4 min-h-[160px]">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Add</label>
                                        <div className="flex items-center gap-2 shadow-neu-pressed-sm rounded-xl bg-neumorphic-bg px-3 py-2">
                                            <input
                                                value={bulkInput}
                                                onChange={(e) => setBulkInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addBulkColors()}
                                                placeholder="#HEX..."
                                                className="w-full bg-transparent border-none outline-none font-bold text-xs text-slate-600 focus:ring-0 placeholder:text-slate-300"
                                            />
                                            <button
                                                onClick={addBulkColors}
                                                disabled={!bulkInput.trim()}
                                                className="text-indigo-600 disabled:opacity-20 hover:scale-110 transition-transform"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addColor(); }} className="flex-1 h-12 neu-flat flex items-center justify-center text-indigo-600 neu-button-hover transition-all" title="Add New">
                                            <Plus size={20} />
                                        </button>
                                        <button onClick={getSuggestedColors} className="flex-1 h-12 neu-flat flex items-center justify-center text-indigo-600 neu-button-hover transition-all" title="Suggest Colors">
                                            {isSuggestingColors ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {
                            showSuggestions && (
                                <div className="neu-flat p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300 relative z-10">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Suggested Colors</h4>
                                        <button onClick={() => setShowSuggestions(false)} className="p-2 text-slate-300 hover:text-slate-500"><X size={20} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {suggestedColors.map((sc, i) => (
                                            <Tooltip key={i} content={sc.rationale}>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if ((currentPalette?.colors?.length || 0) >= 10) {
                                                            showLimitError();
                                                            return;
                                                        }
                                                        handleAddSuggestedColor(sc);
                                                    }}
                                                    className="neu-flat p-4 flex flex-col gap-3 items-center neu-button-hover group w-full"
                                                >
                                                    <div className="w-full h-20 rounded-xl relative overflow-hidden">
                                                        <div className="absolute inset-0" style={{ backgroundColor: sc.hex }} />
                                                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 truncate w-full text-center">{sc.name}</span>
                                                </button>
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>
                            )
                        }

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
                                    <span>Analyze</span>
                                )}
                            </button>
                            {isInsightsOutdated && (
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
                                    Select for new insights
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="-mx-6 md:-mx-16 relative">
                            <div className="absolute inset-0 neu-flat !rounded-none" />
                            <div className="relative overflow-x-auto no-scrollbar flex items-center justify-start gap-2 py-1.5 px-6 md:px-16">
                                {[
                                    { id: 'editorial', label: 'Editorial', icon: Type },
                                    { id: 'desktop', label: 'Desktop', icon: Monitor },
                                    { id: 'mobile', label: 'Mobile', icon: Smartphone },
                                    { id: 'branding', label: 'Branding', icon: Star }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setMockupType(type.id)}
                                        className={`shrink-0 px-4 md:px-5 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${mockupType === type.id ? 'shadow-neu-pressed-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <type.icon size={14} /> {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-neumorphic-bg rounded-3xl md:rounded-[40px] overflow-hidden shadow-neu-flat dark:shadow-neu-dark-flat h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] min-h-[500px] md:min-h-[600px] flex flex-col relative">
                            {/* Local Actions */}
                            <div className="absolute top-6 right-6 z-50 flex gap-2">
                                <button
                                    onClick={() => {
                                        const newState = !readabilityEnabled;
                                        setReadabilityEnabled(newState);
                                        if (newState) {
                                            shuffleMockupColors(mockupType);
                                        }
                                    }}
                                    className={`mockup-shuffle-btn hover:scale-105 transition-all ${!readabilityEnabled ? 'opacity-50' : ''}`}
                                    title={`Readability Optimization: ${readabilityEnabled ? 'ON' : 'OFF'}`}
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => shuffleMockupColors(mockupType)}
                                    className="mockup-shuffle-btn hover:scale-105 transition-all"
                                    title="Shuffle Mockup Colors"
                                >
                                    <Shuffle size={20} />
                                </button>
                            </div>

                            <div className="absolute inset-0 rounded-3xl md:rounded-[40px] overflow-hidden">
                                {mockupType === 'editorial' && (
                                    <MockupCarousel>
                                        {EditorialMockups({
                                            palette: currentPalette,
                                            getShuffledColor: (i) => getShuffledColor(i, 'editorial'),
                                            readabilityEnabled
                                        })}
                                    </MockupCarousel>
                                )}
                                {mockupType === 'desktop' && (
                                    <MockupCarousel>
                                        {DesktopMockups({ palette: currentPalette, getShuffledColor: (i) => getShuffledColor(i, 'desktop') })}
                                    </MockupCarousel>
                                )}
                                {mockupType === 'mobile' && (
                                    <MockupCarousel>
                                        {MobileMockups({ palette: currentPalette, getShuffledColor: (i) => getShuffledColor(i, 'mobile') })}
                                    </MockupCarousel>
                                )}
                                {mockupType === 'branding' && (
                                    <MockupCarousel>
                                        {BrandingMockups({ palette: currentPalette, getShuffledColor: (i) => getShuffledColor(i, 'branding') })}
                                    </MockupCarousel>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {
                    (currentPalette?.insights?.length || 0) > 0 && showInsights && (
                        <div ref={insightsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            {currentPalette.insights.map((insight, i) => (
                                <div key={i} className="neu-flat p-10 group transition-all hover:shadow-neu-pressed flex flex-col">
                                    <div className="mb-4 space-y-1">
                                        <h5 className="font-black text-xs uppercase tracking-widest text-indigo-600">{insight.category || 'Insight'}</h5>
                                        <h4 className="font-bold text-base text-slate-500 leading-snug">{insight.title}</h4>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                        {insight.text.split(/\(?#[0-9A-F]{6}\)?/i).map((part, idx, arr) => {
                                            // Get the original text to find hex codes
                                            const hexMatches = insight.text.match(/\(?#[0-9A-F]{6}\)?/gi) || [];
                                            const hex = hexMatches[idx]?.match(/#[0-9A-F]{6}/i)?.[0];

                                            return (
                                                <span key={idx}>
                                                    {part}
                                                    {hex && idx < arr.length - 1 && (
                                                        <button
                                                            onClick={() => {
                                                                setViewMode('grid');
                                                                setTimeout(() => scrollToSwatch(hex), 100);
                                                            }}
                                                            className="font-semibold px-1.5 py-0 rounded mx-0.5 text-[13px] shadow-sm border border-black/5 hover:scale-110 transition-transform cursor-pointer leading-tight"
                                                            style={{ backgroundColor: hex, color: getContrastColor(hex) }}
                                                        >
                                                            {hex.toUpperCase()}
                                                        </button>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )
                }
                {
                    dragGhost && (
                        <div
                            className="fixed w-24 h-24 rounded-2xl shadow-2xl z-50 pointer-events-none opacity-50 ring-1 ring-black/10"
                            style={{
                                top: dragGhost.y,
                                left: dragGhost.x,
                                backgroundColor: dragGhost.hex,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )
                }

            </main >
        </div >
    );
};

export default EditorView;
