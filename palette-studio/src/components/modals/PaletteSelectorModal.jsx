import React, { useState } from 'react';
import { X, Search, Palette, Check } from 'lucide-react';

const PaletteSelectorModal = ({ isOpen, onClose, palettes, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredPalettes = palettes.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-neumorphic-bg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-200/50 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Select Palette</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Choose colors for your workbench</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 bg-white/30 border-b border-slate-200/50">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search your palettes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-inner focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {filteredPalettes.length > 0 ? (
                        filteredPalettes.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    onSelect(p);
                                    onClose();
                                }}
                                className="w-full p-6 rounded-[2rem] bg-white hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col gap-4 group text-left border border-transparent hover:border-indigo-100"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{p.name}</span>
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check size={16} />
                                    </div>
                                </div>
                                <div className="flex h-4 rounded-full overflow-hidden shadow-inner bg-slate-100">
                                    {p.colors.map((c, i) => (
                                        <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                                    ))}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-400 font-bold">No palettes found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaletteSelectorModal;
