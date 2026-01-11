import React from "react";

export interface SystemHealthCardProps {
    /** Relative path to the image inside `src/assets/optimizer-inspiration` */
    src: string;
    /** Optional caption shown on hover */
    caption?: string;
    /** Click handler – opens the image in a new window */
    onClick?: () => void;
}

/**
 * A glass-morphism card that displays an image.
 * Hover → subtle scale + shadow, dark-mode friendly.
 */
export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
    src,
    caption,
    onClick,
}) => {
    return (
        <div
            className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-lg border border-white/10
                 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group"
            onClick={onClick}
        >
            <img
                src={src}
                alt={caption ?? "System health screenshot"}
                className="w-full h-auto object-cover"
                loading="lazy"
            />
            {/* Caption overlay – appears on hover */}
            {caption && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0
                        transition-opacity duration-300 group-hover:opacity-100 text-white text-lg font-medium p-4 text-center">
                    {caption}
                </div>
            )}
        </div>
    );
};
