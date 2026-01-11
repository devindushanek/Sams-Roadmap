import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MockupCarousel = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const count = React.Children.count(children);

    const next = () => setCurrentIndex((prev) => (prev + 1) % count);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + count) % count);

    const handleTouchStart = (e) => {
        touchStart.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) next();
        if (isRightSwipe) prev();

        touchStart.current = null;
        touchEnd.current = null;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [count]);

    return (
        <div
            className="relative w-full h-full min-h-[calc(100vh-220px)] group/carousel"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute inset-0 transition-all duration-500 ease-in-out">
                {React.Children.map(children, (child, index) => (
                    <div
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {child}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300">
                <button onClick={prev} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-600 dark:bg-indigo-400 w-4' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
                <button onClick={next} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default MockupCarousel;
