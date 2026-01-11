import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Loader2, Sparkles, Image, Plus, Wand2 } from 'lucide-react';

const GenerationModal = ({ isOpen, onClose, onGenerate, isGenerating, isProcessingImage, currentPalette }) => {
    const [prompt, setPrompt] = useState("");
    const [count, setCount] = useState(5);
    const [mode, setMode] = useState('create'); // 'create' or 'refine'
    const [dragActive, setDragActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setPrompt("");
            setSelectedImage(null);
            if (mode === 'refine' && currentPalette) {
                setCount(Math.max(count, currentPalette.colors.length));
            }
        }
    }, [isOpen, mode, currentPalette]);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleImageFile = (file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[250] p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-neumorphic-bg rounded-[40px] shadow-2xl p-8 md:p-10 max-w-lg w-full animate-in zoom-in-95 duration-300 space-y-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Sparkles size={24} className="text-indigo-600" />
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Generate Palette</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Studio</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isGenerating || isProcessingImage} className="p-2 text-slate-400 hover:text-rose-500 transition-all disabled:opacity-30"><X size={24} /></button>
                </div>

                {/* Mode Toggle */}
                <div className="neu-flat p-1.5 rounded-full flex items-center gap-1">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'create' ? 'shadow-neu-pressed-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Plus size={14} />
                        Create
                    </button>
                    <button
                        onClick={() => setMode('refine')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'refine' ? 'shadow-neu-pressed-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Wand2 size={14} />
                        Refine
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {mode === 'create' ? 'What should we build?' : 'How should we change it?'}
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating || isProcessingImage}
                        className="w-full h-24 neu-pressed-sm bg-transparent border-none p-4 font-bold text-slate-600 focus:ring-0 resize-none disabled:opacity-50"
                        placeholder={mode === 'create' ? "e.g., 'Sunset over a cyberpunk city' or 'Minimalist nordic interior'..." : "e.g., 'Make it warmer', 'Add a neon accent', or 'More desaturated'..."}
                    />
                </div>

                <div
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative overflow-hidden ${isProcessingImage ? 'border-indigo-500 bg-indigo-50' : dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 cursor-pointer'}`}
                    onDragEnter={!isProcessingImage ? handleDrag : undefined}
                    onDragLeave={!isProcessingImage ? handleDrag : undefined}
                    onDragOver={!isProcessingImage ? handleDrag : undefined}
                    onDrop={!isProcessingImage ? handleDrop : undefined}
                    onClick={!isProcessingImage && !selectedImage ? () => fileInputRef.current?.click() : undefined}
                >
                    {selectedImage ? (
                        <div className="relative group">
                            <img src={selectedImage} alt="Selected" className="h-32 w-full object-cover rounded-xl shadow-sm" />
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-rose-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : isProcessingImage ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={32} className="animate-spin text-indigo-600" />
                            <p className="text-xs font-bold text-indigo-600">Extracting colors from image...</p>
                        </div>
                    ) : (
                        <>
                            <Image size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-400">
                                {mode === 'create' ? 'Drop an image to extract colors' : 'Drop a reference image to guide the refinement'}
                            </p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isProcessingImage}
                        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Color Count</label>
                        <span className="font-black text-indigo-600">{count} Colors</span>
                    </div>
                    <input
                        type="range"
                        min={mode === 'refine' ? (currentPalette?.colors?.length || 2) : 2}
                        max="10"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        disabled={isGenerating || isProcessingImage}
                        className="w-full accent-indigo-600 disabled:opacity-50"
                    />
                </div>

                <button
                    onClick={() => onGenerate(prompt, count, selectedImage, mode)}
                    disabled={
                        isGenerating ||
                        isProcessingImage ||
                        (mode === 'create' && !prompt.trim() && !selectedImage) ||
                        (mode === 'refine' && !prompt.trim() && !selectedImage && count === (currentPalette?.colors?.length || 0))
                    }
                    className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-lg hover:bg-indigo-700 hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isGenerating && <Loader2 size={18} className="animate-spin" />}
                    {mode === 'create' ? 'Generate' : 'Apply'}
                </button>
            </div>
        </div>
    );
};

export default GenerationModal;
