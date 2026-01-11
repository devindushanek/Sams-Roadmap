import React from 'react';
import { Star, Box, Instagram, Twitter, Facebook, Linkedin, ShoppingBag, Tag } from 'lucide-react';

const BrandingLayout1 = ({ palette, safeGetColor }) => (
    <div className="h-full p-8 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header with Logo */}
            <div className="bg-white rounded-3xl p-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer" style={{ backgroundColor: safeGetColor(0) }}>
                        <Star size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: safeGetColor(0) }}>{palette.name}</h1>
                        <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest mt-1">Brand Identity System</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {palette.colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg shadow-sm hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: c.hex }} />
                    ))}
                </div>
            </div>

            {/* Color Palette Bar */}
            <div className="h-24 rounded-2xl overflow-hidden flex shadow-lg">
                {palette.colors.map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end p-3 transition-all hover:flex-[1.5] cursor-pointer" style={{ backgroundColor: c.hex }}>
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80" style={{ color: palette.colors[i].text }}>{c.name}</span>
                        <span className="text-[8px] font-mono opacity-60" style={{ color: palette.colors[i].text }}>{c.hex}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Typography Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm col-span-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Typography</h3>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black" style={{ color: safeGetColor(0) }}>Aa</h2>
                        <p className="text-lg font-bold" style={{ color: safeGetColor(1) }}>The Quick Brown Fox</p>
                        <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 !@#$%</p>
                    </div>
                </div>

                {/* Business Card Mockup */}
                <div className="col-span-2 bg-neutral-200 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${safeGetColor(0)} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                    <div className="relative w-80 h-48 bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: safeGetColor(0) }}>
                                <Star size={20} className="text-white" />
                            </div>
                            <div className="text-right">
                                <div className="font-black text-lg" style={{ color: safeGetColor(0) }}>John Doe</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Creative Director</div>
                            </div>
                        </div>
                        <div className="text-[10px] font-medium text-neutral-500 space-y-1">
                            <p>john@studio.design</p>
                            <p>+1 (555) 000-0000</p>
                            <p>www.studio.design</p>
                        </div>
                        <div className="h-1 w-full" style={{ backgroundColor: safeGetColor(2) }} />
                    </div>
                    <div className="absolute bottom-8 right-8 w-80 h-48 rounded-xl shadow-xl flex items-center justify-center transform rotate-6 translate-x-4 translate-y-4 -z-10" style={{ backgroundColor: safeGetColor(0) }}>
                        <Star size={60} className="text-white opacity-20" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const BrandingLayout2 = ({ palette, safeGetColor }) => (
    <div className="h-full p-8 bg-neutral-100 flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex">
            <div className="w-1/2 bg-neutral-50 p-12 flex flex-col justify-center items-center relative">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(45deg, ${safeGetColor(0)} 25%, transparent 25%, transparent 50%, ${safeGetColor(0)} 50%, ${safeGetColor(0)} 75%, transparent 75%, transparent)`, backgroundSize: '40px 40px' }} />

                {/* Shopping Bag */}
                <div className="relative w-64 h-80 bg-white shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-700 z-10">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-24 border-8 rounded-t-full" style={{ borderColor: safeGetColor(0) }} />
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4" style={{ backgroundColor: safeGetColor(1) }}>
                        <ShoppingBag size={64} className="text-white" />
                        <div className="text-white font-black text-2xl tracking-tighter">STORE</div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-black/10 rounded-tl-[4rem]" />
                </div>
            </div>

            <div className="w-1/2 p-12 flex flex-col justify-center space-y-8">
                <div className="inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-neutral-100 w-max">Packaging</div>
                <h1 className="text-5xl font-black leading-tight" style={{ color: safeGetColor(0) }}>
                    Premium <br />Unboxing.
                </h1>
                <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-xl shadow-lg transform rotate-3" style={{ backgroundColor: safeGetColor(2) }}>
                        <div className="h-full flex items-center justify-center text-white font-black text-xl">BOX</div>
                    </div>
                    <div className="w-24 h-32 rounded-xl shadow-lg transform -rotate-3" style={{ backgroundColor: safeGetColor(3) }}>
                        <div className="h-full flex items-center justify-center text-white font-black text-xl">TAG</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-neutral-500">
                    <Tag size={16} /> Sustainable Materials
                </div>
            </div>
        </div>
    </div>
);

const BrandingLayout3 = ({ palette, safeGetColor }) => (
    <div className="h-full p-8 bg-neutral-900 flex items-center justify-center overflow-auto">
        <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Instagram Post */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden relative group">
                <div className="absolute inset-0" style={{ backgroundColor: safeGetColor(0) }} />
                <div className="absolute inset-8 border-2 border-white/20 flex flex-col items-center justify-center text-center p-8">
                    <h2 className="text-4xl font-black text-white mb-4 leading-none">SUMMER<br />SALE</h2>
                    <button className="px-6 py-2 bg-white text-black font-bold uppercase text-xs rounded-full hover:scale-105 transition-transform">Shop Now</button>
                </div>
                <div className="absolute bottom-4 right-4 text-white/50">
                    <Instagram size={24} />
                </div>
            </div>

            {/* Twitter/Social Card */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden flex flex-col p-8 justify-between relative">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-20" style={{ backgroundColor: safeGetColor(2) }} />

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full" style={{ backgroundColor: safeGetColor(1) }} />
                    <div>
                        <div className="font-bold text-neutral-900">Brand Name</div>
                        <div className="text-xs text-neutral-400">@brandname</div>
                    </div>
                    <Twitter size={20} className="ml-auto text-blue-400" />
                </div>

                <div className="text-2xl font-black leading-tight" style={{ color: safeGetColor(0) }}>
                    "Design is not just what it looks like and feels like. Design is how it works."
                </div>

                <div className="h-40 rounded-2xl mt-4 relative overflow-hidden" style={{ backgroundColor: safeGetColor(3) }}>
                    <div className="absolute inset-0 flex items-center justify-center text-white font-black opacity-50 text-4xl">IMAGE</div>
                </div>
            </div>
        </div>
    </div>
);

const BrandingMockups = ({ palette, getShuffledColor }) => {
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
        <BrandingLayout1 key="1" palette={palette} safeGetColor={safeGetColor} />,
        <BrandingLayout2 key="2" palette={palette} safeGetColor={safeGetColor} />,
        <BrandingLayout3 key="3" palette={palette} safeGetColor={safeGetColor} />
    ];
};

export default BrandingMockups;
