import React from 'react';
import { getBestContrastColor, getContrastRatio } from '../../utils/colorUtils';

const EditorialLayout1 = ({ palette, safeGetColor, readabilityEnabled }) => {
    const bgColor = safeGetColor(3);
    const allColors = [0, 1, 2, 3, 4].map(i => safeGetColor(i));

    const getLegibleColor = (preferredColor, bg, threshold = 4.5) => {
        if (!readabilityEnabled) return preferredColor;
        if (getContrastRatio(bg, preferredColor) >= threshold) return preferredColor;

        const bestPaletteColor = getBestContrastColor(bg, allColors);
        if (getContrastRatio(bg, bestPaletteColor) >= threshold) return bestPaletteColor;

        return getContrastRatio(bg, '#000000') > getContrastRatio(bg, '#FFFFFF') ? '#000000' : '#FFFFFF';
    };

    const titleColor = getLegibleColor(safeGetColor(0), bgColor, 3);

    let accentColor = safeGetColor(2);
    if (readabilityEnabled) {
        if (getContrastRatio(bgColor, accentColor) < 3) {
            const legibleAlternatives = allColors.filter(c =>
                getContrastRatio(bgColor, c) >= 3 && c !== titleColor
            );
            if (legibleAlternatives.length > 0) {
                accentColor = getBestContrastColor(bgColor, legibleAlternatives);
            } else {
                accentColor = getBestContrastColor(bgColor, allColors);
            }
        }
    }
    const bodyColor = getLegibleColor(safeGetColor(4), bgColor, 4.5);
    const metaColor = getLegibleColor(safeGetColor(2), bgColor, 4.5);

    const visualBlockBg = safeGetColor(1);
    const visualBlockText = readabilityEnabled
        ? getBestContrastColor(visualBlockBg, ['#FFFFFF', '#000000'])
        : '#FFFFFF';

    return (
        <div className="h-full flex flex-col p-6 md:p-12 overflow-hidden" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto w-full h-full flex flex-col justify-center">
                <div className="flex justify-between items-baseline border-b-4 lg:border-b-8 pb-2 mb-3 lg:mb-6 shrink-0" style={{ borderColor: titleColor }}>
                    <div className="font-serif italic text-5xl lg:text-6xl tracking-tighter whitespace-nowrap" style={{ color: titleColor }}>The Edit</div>
                    <div className="text-right font-black uppercase tracking-[0.3em] text-xs" style={{ color: metaColor }}>No. 42 / SPRING 26</div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 lg:gap-12 items-stretch flex-1">
                    <div className="flex-1 flex flex-col gap-4 pb-4 lg:pb-0">
                        <h1 className="text-6xl lg:text-[80px] font-black leading-[0.85] uppercase tracking-tighter" style={{ color: titleColor }}>
                            Bold <br /><span style={{ color: accentColor }}>Color</span> <br />Systems
                        </h1>
                        <p className="text-base md:text-lg font-serif leading-relaxed opacity-90" style={{ color: bodyColor }}>
                            Color theory is the silent language of design, a sophisticated interplay between human perception and the physics of light. It governs how we navigate visual environments, using the subtle tension between harmony and contrast to evoke emotion and command attention. Mastering this spectrum allows us to transform a simple interface into a resonant, immersive experience. By understanding the psychological weight of every hue, we can craft narratives that speak directly to the subconscious.
                        </p>
                    </div>
                    <div className="w-full lg:w-[28%] shrink-0 flex flex-col">
                        <div className="hidden lg:flex h-full w-full flex-col justify-between p-8 transition-all duration-500 hover:scale-[1.02]" style={{ backgroundColor: visualBlockBg }}>
                            <div className="font-mono text-xs" style={{ color: visualBlockText, opacity: 0.7 }}>FIG. 01</div>
                            <div>
                                <div className="w-8 h-1 mb-4" style={{ backgroundColor: visualBlockText }} />
                                <h3 className="text-3xl font-black uppercase leading-none" style={{ color: visualBlockText }}>Visual<br />Balance</h3>
                            </div>
                        </div>
                        <div className="lg:hidden h-12 w-full flex items-center justify-between px-6" style={{ backgroundColor: visualBlockBg }}>
                            <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: visualBlockText }}>Visual Balance</h3>
                            <div className="w-8 h-px" style={{ backgroundColor: visualBlockText, opacity: 0.5 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorialLayout2 = ({ palette, safeGetColor, readabilityEnabled }) => {
    const allColors = [0, 1, 2, 3, 4].map(i => safeGetColor(i));

    const getLegibleColor = (preferredColor, bg, threshold = 4.5) => {
        if (!readabilityEnabled) return preferredColor;
        if (getContrastRatio(bg, preferredColor) >= threshold) return preferredColor;

        const bestPaletteColor = getBestContrastColor(bg, allColors);
        if (getContrastRatio(bg, bestPaletteColor) >= threshold) return bestPaletteColor;

        return getContrastRatio(bg, '#000000') > getContrastRatio(bg, '#FFFFFF') ? '#000000' : '#FFFFFF';
    };

    const trendColor = getLegibleColor(safeGetColor(2), '#FFFFFF', 4.5);
    const titleColor = getLegibleColor(safeGetColor(1), '#FFFFFF', 3);
    const methodTitleColor = getLegibleColor(safeGetColor(0), '#FFFFFF', 3);
    const methodBodyColor = getLegibleColor(safeGetColor(4), '#FFFFFF', 4.5);

    const visual01Bg = safeGetColor(2);
    const visual01Text = readabilityEnabled
        ? getBestContrastColor(visual01Bg, ['#FFFFFF', '#000000'])
        : '#FFFFFF';

    const visual02Bg = safeGetColor(3);
    const visual02Text = readabilityEnabled
        ? getBestContrastColor(visual02Bg, ['#FFFFFF', '#000000'])
        : '#FFFFFF';

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden" style={{ backgroundColor: safeGetColor(0) }}>
            <div className="max-w-6xl mx-auto w-full grid grid-cols-3 md:grid-cols-4 grid-rows-[3fr_2fr_4fr] md:grid-rows-2 gap-3 md:gap-6 h-full overflow-hidden">
                <div className="col-span-3 md:col-span-3 p-6 md:p-8 flex flex-col justify-between rounded-2xl md:rounded-[2rem]" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]" style={{ color: trendColor }}>Trend Report</div>
                    <h1 className="flex flex-col items-start gap-0 font-black tracking-tighter leading-none mt-[0.3em]" style={{ color: titleColor }}>
                        <span className="text-7xl lg:text-8xl">MODERN</span>
                        <span className="text-7xl lg:text-8xl -mt-[0.15em]">MINIMAL</span>
                    </h1>
                </div>

                <div className="col-span-2 md:col-span-1 order-2 md:order-1 p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-center" style={{ backgroundColor: '#000000' }}>
                    <p className="text-white font-serif text-sm md:text-lg lg:text-xl italic leading-relaxed">
                        "Color is a power which directly influences the soul."
                    </p>
                </div>

                <div className="col-span-1 md:col-span-1 order-1 md:order-2 rounded-2xl md:rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: visual01Bg }} />
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 font-black text-xl md:text-2xl" style={{ color: visual01Text }}>01</div>
                </div>

                <div className="col-span-2 md:col-span-2 order-3 p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col justify-center space-y-2 md:space-y-4" style={{ backgroundColor: '#FFFFFF' }}>
                    <h3 className="text-lg md:text-2xl font-black uppercase" style={{ color: methodTitleColor }}>The Methodology</h3>
                    <p className="text-xs md:text-sm font-medium leading-relaxed opacity-70" style={{ color: methodBodyColor }}>
                        Our process begins with a deep analysis of {palette.colors[1]?.name || 'tone'}, ensuring that every hue serves a functional purpose.
                    </p>
                    <div className="flex gap-2 pt-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full" style={{ backgroundColor: safeGetColor(i) }} />
                        ))}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 order-4 rounded-2xl md:rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: visual02Bg }} />
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 font-black text-xl md:text-2xl" style={{ color: visual02Text }}>02</div>
                </div>
            </div>
        </div>
    );
};

const EditorialLayout3 = ({ palette, safeGetColor, readabilityEnabled }) => {
    const colorCount = Math.min(palette.colors.length, 10);
    const swatchSize = colorCount <= 5 ? 'w-14 h-14 md:w-16 md:h-16' :
        colorCount <= 7 ? 'w-10 h-10 md:w-12 md:h-12' :
            'w-8 h-8 md:w-10 md:h-10';

    const allColors = [0, 1, 2, 3, 4].map(i => safeGetColor(i));

    const getLegibleColor = (preferredColor, bg, threshold = 4.5) => {
        if (!readabilityEnabled) return preferredColor;
        if (getContrastRatio(bg, preferredColor) >= threshold) return preferredColor;

        const bestPaletteColor = getBestContrastColor(bg, allColors);
        if (getContrastRatio(bg, bestPaletteColor) >= threshold) return bestPaletteColor;

        return getContrastRatio(bg, '#000000') > getContrastRatio(bg, '#FFFFFF') ? '#000000' : '#FFFFFF';
    };

    const bgColor = safeGetColor(1);
    const panelTextColor = readabilityEnabled
        ? getBestContrastColor(bgColor, ['#FFFFFF', '#000000'])
        : '#FFFFFF';

    const leftPanelBg = '#FFFFFF';
    const theEditColor = getLegibleColor(safeGetColor(2), leftPanelBg, 4.5);
    const readArticleColor = getLegibleColor(safeGetColor(4), leftPanelBg, 4.5);

    // Apply readability to main title
    const titleVisualColor = getLegibleColor(safeGetColor(0), leftPanelBg, 3);
    const titleIdentityColor = getLegibleColor(safeGetColor(2), leftPanelBg, 3);
    const descriptionColor = getLegibleColor(safeGetColor(4), leftPanelBg, 4.5);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div className="flex-[1.618] p-10 md:p-12 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: leftPanelBg }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: safeGetColor(2) }} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-black text-sm md:text-base" style={{ backgroundColor: safeGetColor(0) }}>E</div>
                            <div className="text-[10px] md:text-xs font-black uppercase tracking-widest" style={{ color: theEditColor, opacity: 0.7 }}>The Edit</div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-4 md:mb-8" style={{ color: titleVisualColor }}>
                            Visual <br /> <span style={{ color: titleIdentityColor }}>Identity</span>
                        </h1>
                        <p className="text-xl font-medium leading-relaxed max-w-md opacity-80 line-clamp-4 md:line-clamp-none" style={{ color: descriptionColor }}>
                            {palette.description}
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mt-6 md:mt-0">
                        <div className="h-0.5 w-12" style={{ backgroundColor: readArticleColor, opacity: 0.3 }} />
                        <div className="text-xs font-black uppercase tracking-widest" style={{ color: readArticleColor, opacity: 0.7 }}>Read Article</div>
                    </div>
                </div>

                <div className="flex-1 relative min-h-[150px] md:min-h-0">
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />

                    <div className="absolute top-20 right-4 md:top-24 md:right-8 flex flex-row md:flex-col gap-1.5 md:gap-2 flex-wrap md:flex-nowrap max-w-[80%] md:max-w-none md:max-h-[calc(100%-6rem)]">
                        {palette.colors.slice(0, 10).map((c, i) => (
                            <div
                                key={i}
                                className={`${swatchSize} rounded-full border-2 md:border-4 border-white shrink-0`}
                                style={{
                                    backgroundColor: c.hex,
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)'
                                }}
                            />
                        ))}
                    </div>

                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider" style={{ color: panelTextColor }}>Curated</h3>
                        <p className="text-xs md:text-sm font-medium" style={{ color: panelTextColor, opacity: 0.7 }}>Color Collection</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditorialMockups = ({ palette, getShuffledColor, readabilityEnabled }) => {
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
        <EditorialLayout1 key="1" palette={palette} safeGetColor={safeGetColor} readabilityEnabled={readabilityEnabled} />,
        <EditorialLayout2 key="2" palette={palette} safeGetColor={safeGetColor} readabilityEnabled={readabilityEnabled} />,
        <EditorialLayout3 key="3" palette={palette} safeGetColor={safeGetColor} readabilityEnabled={readabilityEnabled} />
    ];
};

export default EditorialMockups;
