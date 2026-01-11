import React, { useState, useEffect } from 'react';
import { Palette, X, RefreshCw, Loader2, Check, Copy, Dices } from 'lucide-react';

const ColorWheelIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2V12L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L21.65 14.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L17 20.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L7 20.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L2.35 14.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ColorEditorModal = ({
    isOpen, colorIdx, colors, onClose, updateColor, handleNameColor,
    isNaming, copyHex, copiedColor, setCopiedColor, getContrastColor, onSave
}) => {
    const [localHex, setLocalHex] = useState('');
    const [localName, setLocalName] = useState('');
    const [localDescription, setLocalDescription] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [isLocalRandomizing, setIsLocalRandomizing] = useState(false);
    const [isLocalRenaming, setIsLocalRenaming] = useState(false);

    // Initialize local state when modal opens or color changes
    useEffect(() => {
        if (isOpen && colorIdx !== null && colors[colorIdx]) {
            setLocalHex(colors[colorIdx].hex);
            setLocalName(colors[colorIdx].name);
            setLocalDescription(colors[colorIdx].description || '');
            setIsDirty(false);
        }
    }, [isOpen, colorIdx, colors]);

    // Auto-update name and description when hex changes (debounced)
    useEffect(() => {
        if (!isOpen || !localHex || localHex === colors[colorIdx]?.hex) return;

        const timer = setTimeout(async () => {
            setIsLocalRenaming(true);
            const res = await handleNameColor(colorIdx, true, localHex, false);
            if (res && typeof res === 'object') {
                setLocalName(res.name);
                setLocalDescription(res.description);
                setIsDirty(true);
            }
            setIsLocalRenaming(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [localHex]);

    if (!isOpen || colorIdx === null) return null;

    const color = colors[colorIdx];
    const contrast = getContrastColor(localHex || color.hex);

    const handleSave = () => {
        if (isDirty) {
            onSave(colorIdx, localHex, localName, localDescription);
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleRandomize = async () => {
        setIsLocalRandomizing(true);
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setLocalHex(randomHex);
        setIsDirty(true);
        // Removed manual handleNameColor call as it's handled by the debounced useEffect
        setIsLocalRandomizing(false);
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-neumorphic-bg rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="md:w-1/2 h-48 md:h-auto p-6 md:p-8 flex flex-col justify-between relative overflow-hidden rounded-t-[40px] md:rounded-l-[40px] md:rounded-tr-none" style={{ backgroundColor: localHex }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Palette size={120} /></div>
                    <div className="space-y-2 relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: contrast }}>Preview</div>
                        <h3 className="text-3xl md:text-4xl font-black leading-tight" style={{ color: contrast }}>{localName || "Color Preview"}</h3>
                        <p className="text-xs md:text-sm font-bold opacity-80" style={{ color: contrast }}>
                            {localDescription || "No description available."}
                        </p>
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Palette size={24} className="text-indigo-600" />
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Color Editor</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refine & Adjust</p>
                            </div>
                        </div>
                        <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
                    </div>

                    <div className="space-y-5">
                        {/* Color Picker and Randomize side by side */}
                        <div className="flex gap-2">
                            <div className="relative group">
                                <button className="p-4 neu-icon-ghost text-indigo-600 transition-all" title="Color Picker">
                                    <ColorWheelIcon size={24} />
                                    <input
                                        type="color"
                                        value={localHex}
                                        onChange={(e) => {
                                            setLocalHex(e.target.value);
                                            setIsDirty(true);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </button>
                            </div>
                            <button
                                onClick={handleRandomize}
                                className="px-6 py-4 neu-icon-ghost text-indigo-600 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                title="Randomize Color"
                                disabled={isLocalRandomizing || isLocalRenaming}
                            >
                                {isLocalRandomizing ? <Loader2 size={18} className="animate-spin" /> : <Dices size={18} />}
                                Randomize
                            </button>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name</label>
                            <div className="flex gap-3">
                                <button onClick={async () => {
                                    setIsLocalRenaming(true);
                                    const res = await handleNameColor(colorIdx, true, localHex, false);
                                    if (res && typeof res === 'object') {
                                        setLocalName(res.name);
                                        // Only update name, not description
                                        setIsDirty(true);
                                    }
                                    setIsLocalRenaming(false);
                                }} className="neu-icon-ghost transition-all" disabled={isLocalRandomizing || isLocalRenaming}>
                                    {isLocalRenaming ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                </button>
                                <input
                                    type="text"
                                    value={localName}
                                    onChange={(e) => { setLocalName(e.target.value); setIsDirty(true); }}
                                    className="flex-1 shadow-neu-pressed-sm bg-transparent border-none rounded-2xl px-5 py-2 font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                                />
                            </div>
                        </div>

                        {/* Hexadecimal Value with Copy button on left */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hex Value</label>
                            <div className="flex gap-3">
                                <button onClick={() => copyHex(localHex)} className="neu-icon-ghost transition-all shrink-0">
                                    {copiedColor === localHex ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                                <div className="flex-1 flex items-center shadow-neu-pressed-sm rounded-2xl px-5 py-2">
                                    <span className="text-slate-300 font-black mr-2 text-lg">#</span>
                                    <input
                                        type="text"
                                        value={localHex.replace('#', '').toUpperCase()}
                                        onChange={(e) => { setLocalHex(`#${e.target.value}`); setIsDirty(true); }}
                                        className="w-full bg-transparent border-none outline-none p-0 font-mono font-black text-slate-700 focus:ring-0 text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSave} className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg hover:bg-indigo-700 hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] transition-all active:scale-95 mt-2">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ColorEditorModal;
