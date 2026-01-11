import React, { useState, createContext, useContext } from 'react';

export const TooltipContext = createContext({ showTooltips: true });

const Tooltip = ({ children, content, position = 'top', className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { showTooltips } = useContext(TooltipContext);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
        left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
        right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    };

    if (!showTooltips) {
        return <div className={`relative inline-flex items-center justify-center ${className}`}>{children}</div>;
    }

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && content && (
                <div className={`absolute z-[100] px-3 py-1.5 rounded-xl bg-white shadow-[0_4px_12px_rgba(71,85,105,0.2)] text-[11px] font-bold text-slate-600 whitespace-normal w-max max-w-[320px] text-center leading-relaxed pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}>
                    {content}
                    <div className={`absolute w-2 h-2 bg-white rotate-45 ${position === 'top' ? 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2' :
                        position === 'bottom' ? 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2' :
                            position === 'left' ? 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2' :
                                'right-full translate-x-1/2 top-1/2 -translate-y-1/2'
                        }`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
