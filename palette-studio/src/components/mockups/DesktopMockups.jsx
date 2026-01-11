import React from 'react';
import { Palette, Search, BarChart3, Globe, ArrowRight, Layout, Plus, Download, Share2, Paintbrush, Home, Pipette, Layers, PieChart, FileOutput, Menu } from 'lucide-react';
import { hexToHSL, getContrastRatio } from '../../utils/colorUtils';

const DesktopLayout1 = ({ palette, safeGetColor }) => {
    const colors = palette.colors || [];

    const avgSaturation = colors.length > 0
        ? Math.round(colors.reduce((acc, c) => acc + (hexToHSL(c.hex)?.s || 0) * 100, 0) / colors.length)
        : 0;

    const hues = colors.map(c => hexToHSL(c.hex)?.h * 360 || 0);
    const hueRange = hues.length > 1 ? Math.max(...hues) - Math.min(...hues) : 0;
    const harmonyScore = Math.min(100, Math.round(100 - Math.abs(hueRange - 180) / 1.8));

    let maxContrast = 0;
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            const ratio = getContrastRatio(colors[i].hex, colors[j].hex);
            if (ratio > maxContrast) maxContrast = ratio;
        }
    }
    const contrastGrade = maxContrast >= 7 ? 'AAA' : maxContrast >= 4.5 ? 'AA' : maxContrast >= 3 ? 'A' : 'Low';

    return (
        <div className="h-full flex overflow-hidden" style={{ backgroundColor: safeGetColor(0) }}>
            <div className="w-16 md:w-44 flex flex-col p-3 md:p-5 space-y-6 md:space-y-8 transition-all duration-300">
                <div className="flex items-center gap-2 justify-center md:justify-start md:px-2">
                    <Paintbrush className="text-white shrink-0" size={22} />
                    <div className="font-black text-base text-white tracking-tighter hidden md:block">Chromatic</div>
                </div>
                <div className="flex-1 space-y-1.5">
                    {[
                        { name: 'Dashboard', icon: Home },
                        { name: 'Palettes', icon: Pipette },
                        { name: 'Colors', icon: Palette },
                        { name: 'Assets', icon: Layers },
                        { name: 'Analytics', icon: PieChart },
                        { name: 'Export', icon: FileOutput }
                    ].map((item, i) => (
                        <div key={item.name} className={`flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-xl transition-all justify-center md:justify-start ${i === 0 ? 'bg-white/15 text-white shadow-inner border border-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                            <item.icon size={18} className="shrink-0" />
                            <div className="text-[10px] font-black uppercase tracking-wide hidden md:block">{item.name}</div>
                        </div>
                    ))}
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/5 hidden md:block">
                    <div className="text-[10px] font-bold text-white/60 mb-1.5">Palettes</div>
                    <div className="text-lg font-black text-white">12 Active</div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-10 overflow-hidden space-y-4 md:space-y-6" style={{ backgroundColor: '#F5F5F5' }}>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-1 shrink-0">
                        <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">{palette.name}</h2>
                        <div className="text-sm text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            Design Analytics <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex flex-1 items-center gap-4 justify-end min-w-0">
                        <div className="hidden md:flex items-center gap-4 mr-2">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg">
                                <Plus size={14} /> New Asset
                            </button>
                            <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1" title="Export">
                                <Download size={20} />
                            </button>
                            <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1" title="Share">
                                <Share2 size={20} />
                            </button>
                        </div>
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" size={18} />
                            <input
                                type="text"
                                className="w-full h-[38px] pl-12 pr-4 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-all text-sm font-medium text-neutral-600"
                                style={{ backgroundColor: '#FFFFFF' }}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {[0, 1, 2].map(i => {
                        const label = ['Contrast', 'Harmony', 'Saturation'][i];
                        const value = [contrastGrade, `${harmonyScore}%`, `${avgSaturation}%`][i];
                        const percentage = i === 0
                            ? (contrastGrade === 'AAA' ? 100 : contrastGrade === 'AA' ? 70 : contrastGrade === 'A' ? 40 : 15)
                            : (i === 1 ? harmonyScore : avgSaturation);
                        const barColor = safeGetColor(i);

                        return (
                            <div key={i} className="p-2.5 md:p-5 rounded-[20px] md:rounded-[24px] shadow-sm border border-neutral-200/50 flex flex-col gap-1.5 md:gap-3 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer" style={{ backgroundColor: '#FFFFFF' }}>
                                <div className="flex justify-between items-center">
                                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</div>
                                    <div className="text-xs md:text-sm font-black text-neutral-900">{value}</div>
                                </div>
                                <div className="h-1.5 md:h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: barColor,
                                            boxShadow: `0 0 12px ${barColor}40`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 md:p-6 rounded-[24px] md:rounded-[40px] shadow-sm border border-neutral-200/50 overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="font-black text-sm md:text-lg uppercase tracking-widest">Palette Colors</h3>
                        <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-neutral-400">{colors.length} colors</div>
                    </div>
                    <div className="grid grid-cols-5 md:flex md:flex-wrap gap-2 md:gap-4">
                        {colors.slice(0, 10).map((color, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div
                                    className="aspect-[4/5] md:aspect-[3/4] md:w-[60px] lg:w-[80px] rounded-lg md:rounded-2xl shadow-sm hover:scale-105 transition-transform mb-1"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <div className="text-[7px] md:text-[10px] font-bold text-neutral-500 text-center uppercase tracking-wide truncate">
                                    {color.hex}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DesktopLayout2 = ({ palette, safeGetColor }) => (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        <style>
            {`
                @keyframes waving-wiggle {
                    0%, 100% { transform: rotate(3deg) scale(1) translateY(0); }
                    20% { transform: rotate(12deg) scale(1.04) translateY(-5px); }
                    40% { transform: rotate(-6deg) scale(1.08) translateY(2px); }
                    60% { transform: rotate(10deg) scale(1.04) translateY(-3px); }
                    80% { transform: rotate(-2deg) scale(1.02) translateY(1px); }
                }
                .hover-waving-wiggle:hover {
                    animation: waving-wiggle 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                    z-index: 20;
                }
            `}
        </style>
        <div className="px-8 py-3 flex justify-between items-center border-b border-neutral-200/50">
            <div className="flex items-center gap-2 font-black text-base cursor-pointer hover:opacity-80 transition-all" style={{ color: safeGetColor(0) }}>
                <Globe size={18} /> Brand.io
            </div>
            <div className="hidden md:flex gap-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                {['Products', 'Solutions', 'Resources', 'Pricing'].map(item => (
                    <span key={item} className="hover:text-neutral-900 cursor-pointer transition-colors hover:scale-105 transition-transform">{item}</span>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <button className="px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-white transition-all hover:scale-105 hover:brightness-110 shadow-lg active:scale-95 whitespace-nowrap opacity-100" style={{ backgroundColor: safeGetColor(0) }}>
                    Get Started
                </button>
                <Menu size={22} className="md:hidden text-neutral-900 cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
        </div>

        <div className="flex-1 flex items-center px-8 md:px-12 py-2 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-12 items-center w-full max-w-4xl mx-auto">
                <div className="relative order-1 md:order-2 max-w-[150px] md:max-w-none mx-auto w-full">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/30 z-10 rounded-[2rem] md:rounded-[2.5rem]" />
                    <div className="aspect-square rounded-[2rem] md:rounded-[2.5rem] shadow-2xl rotate-3 transition-all duration-700 overflow-hidden hover-waving-wiggle cursor-pointer" style={{ backgroundColor: safeGetColor(3) }}>
                        <div className="absolute top-1/4 left-1/4 right-[-20%] bottom-[-20%] rounded-tl-[1rem] md:rounded-tl-[1.5rem] shadow-inner" style={{ backgroundColor: safeGetColor(4) }} />
                        <div className="absolute top-1/2 left-1/2 right-[-20%] bottom-[-20%] rounded-tl-[1rem] md:rounded-tl-[1.5rem] shadow-2xl" style={{ backgroundColor: safeGetColor(0) }} />
                    </div>
                </div>
                <div className="space-y-4 md:space-y-5 order-2 md:order-1 text-center md:text-left">
                    <div className="-mt-2 md:mt-0 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-neutral-100 cursor-default hover:scale-105 transition-transform" style={{ color: safeGetColor(2), backgroundColor: '#FFFFFF' }}>
                        New Release v2.0
                    </div>
                    <div className="space-y-2 md:space-y-2.5">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-neutral-900">
                            Build faster with <span style={{ color: safeGetColor(2) }}>intelligent</span> tools.
                        </h1>
                        <p className="text-sm md:text-base text-neutral-500 leading-relaxed max-w-sm mx-auto md:mx-0">
                            Empower your team with the next generation of design systems. Streamline your workflow with precision.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-start gap-3 pt-1">
                        <button className="px-5 md:px-6 py-2.5 md:py-3 rounded-full font-black text-[10px] md:text-[10px] uppercase tracking-widest text-white shadow-lg hover:shadow-xl hover:scale-105 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap" style={{ backgroundColor: safeGetColor(0) }}>
                            Start Building <ArrowRight size={14} />
                        </button>
                        <button className="px-5 md:px-6 py-2.5 md:py-3 rounded-full font-black text-[10px] md:text-[10px] uppercase tracking-widest border border-neutral-200 hover:bg-neutral-50 hover:scale-105 transition-all text-neutral-900 shadow-sm active:scale-95 whitespace-nowrap" style={{ backgroundColor: '#FFFFFF' }}>
                            View Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const DesktopLayout3 = ({ palette, safeGetColor }) => (
    <div className="h-full flex bg-neutral-900 overflow-hidden text-white">
        <div className="w-16 flex flex-col items-center py-6 gap-6 border-r border-white/10 bg-black/20">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><Layout size={20} /></div>
            <div className="w-8 h-px bg-white/10" />
            {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
                    <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: i === 0 ? safeGetColor(2) : 'rgba(255,255,255,0.2)' }} />
                </div>
            ))}
        </div>

        <div className="flex-1 flex flex-col relative">
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/20">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-sm">Untitled Project</span>
                    <span className="text-xs text-white/40">Edited 2m ago</span>
                </div>
                <button className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition-colors">Export</button>
            </div>
            <div className="flex-1 p-12 flex items-center justify-center">
                <div className="w-full max-w-3xl aspect-video bg-white rounded-xl shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 flex">
                        <div className="w-1/3 h-full p-8 flex flex-col justify-center space-y-6" style={{ backgroundColor: safeGetColor(0) }}>
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur" />
                            <div className="space-y-2">
                                <div className="h-8 w-3/4 bg-white/20 rounded" />
                                <div className="h-4 w-1/2 bg-white/10 rounded" />
                            </div>
                            <button className="w-full py-3 rounded bg-white text-black font-bold text-xs uppercase tracking-widest">Explore</button>
                        </div>
                        <div className="w-2/3 h-full relative">
                            <div className="absolute inset-0 bg-neutral-100" />
                            <div className="absolute top-8 right-8 bottom-8 left-8 bg-white shadow-xl rounded-lg p-6 space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-1/2 h-32 rounded bg-neutral-100" style={{ backgroundColor: `${safeGetColor(2)}20` }} />
                                    <div className="w-1/2 h-32 rounded bg-neutral-100" style={{ backgroundColor: `${safeGetColor(3)}20` }} />
                                </div>
                                <div className="h-4 w-full bg-neutral-100 rounded" />
                                <div className="h-4 w-2/3 bg-neutral-100 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur-xl rounded-full flex gap-6 text-white shadow-2xl border border-white/10 transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                        <Plus size={20} />
                        <div className="w-px h-5 bg-white/20" />
                        <Layout size={20} />
                        <Search size={20} />
                    </div>
                </div>
            </div>
        </div>

        <div className="w-64 border-l border-white/10 bg-black/20 p-6 space-y-6">
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Properties</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-xs text-white/40 mb-1">X</div>
                        <div className="text-sm font-bold">124</div>
                    </div>
                    <div className="p-3 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-xs text-white/40 mb-1">Y</div>
                        <div className="text-sm font-bold">86</div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Fill</h3>
                <div className="flex gap-2 flex-wrap">
                    {palette.colors.map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border border-white/10 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c.hex }} />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const DesktopMockups = ({ palette, getShuffledColor }) => {
    if (!palette || !palette.colors || palette.colors.length === 0) return null;
    const safeGetColor = (i) => {
        try {
            const dominantColors = palette.colors.filter(c => c.dominant);
            if (dominantColors.length > 0 && i < dominantColors.length) return dominantColors[i].hex;
            const color = getShuffledColor(i);
            return color?.hex || palette.colors[i % palette.colors.length]?.hex || '#000000';
        } catch (e) {
            return palette.colors[0]?.hex || '#000000';
        }
    };

    return [
        <DesktopLayout1 key="1" palette={palette} safeGetColor={safeGetColor} />,
        <DesktopLayout2 key="2" palette={palette} safeGetColor={safeGetColor} />,
        <DesktopLayout3 key="3" palette={palette} safeGetColor={safeGetColor} />
    ];
};

export default DesktopMockups;
