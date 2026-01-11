import React from 'react';
import { ArrowLeft, Bell, Plus, BarChart3, Menu, Search, MessageCircle, User, Image as ImageIcon, Heart, Share2 } from 'lucide-react';

const MobileLayout1 = ({ palette, safeGetColor }) => (
    <div className="h-full flex items-center justify-center p-4 md:p-12 md:bg-neutral-200 overflow-hidden">
        <div className="scale-[0.7] min-[375px]:scale-[0.75] min-[414px]:scale-[0.85] sm:scale-[0.9] md:scale-[0.8] lg:scale-90 xl:scale-100 origin-center transition-transform duration-500">
            <div className="w-[320px] h-[640px] bg-white rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-neutral-900 relative">


                <div className="p-6 h-full flex flex-col pt-8 space-y-4 overflow-auto" style={{ backgroundColor: safeGetColor(1) }}>
                    <nav className="flex justify-between items-center">
                        <div className="p-3 rounded-[20px] bg-white shadow-lg hover:scale-105 transition-transform cursor-pointer" style={{ color: safeGetColor(0) }}><ArrowLeft size={20} /></div>
                        <div className="font-black text-sm uppercase tracking-[0.2em]" style={{ color: safeGetColor(0) }}>Portfolio</div>
                        <div className="w-11 h-11 rounded-[20px] bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" style={{ color: safeGetColor(2) }}><Bell size={20} /></div>
                    </nav>

                    <div className="p-6 rounded-[32px] shadow-2xl relative overflow-hidden text-white" style={{ backgroundColor: safeGetColor(0) }}>
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 rounded-full blur-3xl opacity-30" style={{ backgroundColor: safeGetColor(2) }} />
                        <div className="relative z-10 space-y-3">
                            <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">Available Balance</div>
                            <div className="text-3xl font-black tracking-tight">$14,200.00</div>
                            <div className="flex justify-between items-center pt-2">
                                <div className="text-[9px] font-black uppercase tracking-wider opacity-50">**** 2026</div>
                                <div className="flex -space-x-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: safeGetColor(2) }} />
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: safeGetColor(4) }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Recent Growth</h4>
                            <div className="text-[9px] font-black uppercase hover:opacity-70 cursor-pointer" style={{ color: safeGetColor(2) }}>View All</div>
                        </div>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="bg-white p-4 rounded-[24px] flex items-center gap-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer">
                                <div className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${safeGetColor(i === 0 ? 0 : 2)}15`, color: safeGetColor(i === 0 ? 0 : 2) }}>
                                    {i === 0 ? <Plus size={20} /> : <BarChart3 size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-neutral-800">{['Studio Asset', 'Consulting', 'System Build'][i]}</div>
                                    <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{['Passive', 'Active', 'Project'][i]}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-black text-sm" style={{ color: safeGetColor(2) }}>+$850</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="py-4 rounded-[22px] font-black text-[10px] uppercase tracking-[0.15em] bg-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer" style={{ color: safeGetColor(0) }}>Deposit</button>
                        <button className="py-4 rounded-[22px] font-black text-[10px] uppercase tracking-[0.15em] text-white shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer" style={{ backgroundColor: safeGetColor(2) }}>Transfer</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MobileLayout2 = ({ palette, safeGetColor }) => (
    <div className="h-full flex items-center justify-center p-4 md:p-12 md:bg-neutral-200 overflow-hidden">
        <div className="scale-[0.7] min-[375px]:scale-[0.75] min-[414px]:scale-[0.85] sm:scale-[0.9] md:scale-[0.8] lg:scale-90 xl:scale-100 origin-center transition-transform duration-500">
            <div className="w-[320px] h-[640px] bg-white rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-neutral-900 relative">
                <div className="h-full flex flex-col bg-white overflow-hidden relative">
                    {/* Background Image/Color */}
                    <div className="absolute inset-0" style={{ backgroundColor: safeGetColor(0) }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-8 pt-16">
                        <div className="flex justify-between items-start">
                            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                                Sponsored
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                <Share2 size={14} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tighter">
                                    NEXT <br /> <span style={{ color: safeGetColor(2) }}>GEN</span> <br /> ART
                                </h1>
                                <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[200px]">
                                    Experience the future of digital creativity with our new tools.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] transition-transform" style={{ backgroundColor: safeGetColor(2), color: '#fff' }}>
                                    Shop Now
                                </button>
                                <div className="flex justify-center gap-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/20'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MobileLayout3 = ({ palette, safeGetColor }) => (
    <div className="h-full flex items-center justify-center p-4 md:p-12 md:bg-neutral-200 overflow-hidden">
        <div className="scale-[0.7] min-[375px]:scale-[0.75] min-[414px]:scale-[0.85] sm:scale-[0.9] md:scale-[0.8] lg:scale-90 xl:scale-100 origin-center transition-transform duration-500">
            <div className="w-[320px] h-[640px] bg-white rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-neutral-900 relative">
                <div className="h-full flex flex-col bg-white">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: safeGetColor(0) }}>
                            <div className="w-12 h-12 bg-white rounded-tr-2xl rounded-bl-2xl" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black tracking-tighter text-neutral-900">Essential.</h2>
                            <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Collection 001</p>
                        </div>
                        <div className="w-full aspect-square rounded-[32px] overflow-hidden relative shadow-2xl group">
                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: safeGetColor(2) }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-48 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transform rotate-12" />
                                <div className="w-32 h-48 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl absolute -rotate-6" />
                            </div>
                        </div>
                    </div>
                    <div className="p-8 pb-12">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                {palette.colors.slice(0, 3).map((c, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border border-neutral-100" style={{ backgroundColor: c.hex }} />
                                ))}
                            </div>
                            <div className="font-black text-lg">$129</div>
                        </div>
                        <button className="w-full py-4 rounded-2xl font-black text-white shadow-lg hover:scale-[1.02] transition-transform" style={{ backgroundColor: safeGetColor(0) }}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MobileMockups = ({ palette, getShuffledColor }) => {
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
        <MobileLayout1 key="1" palette={palette} safeGetColor={safeGetColor} />,
        <MobileLayout2 key="2" palette={palette} safeGetColor={safeGetColor} />,
        <MobileLayout3 key="3" palette={palette} safeGetColor={safeGetColor} />
    ];
};

export default MobileMockups;
