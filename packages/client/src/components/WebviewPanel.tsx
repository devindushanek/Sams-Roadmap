import React from 'react';
import { Maximize2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface WebviewPanelProps {
    title: string;
    url: string;
    partition: string;
    isPrimary: boolean;
    onMakePrimary: () => void;
}

export function WebviewPanel({ title, url, partition, isPrimary, onMakePrimary }: WebviewPanelProps) {
    const isTauri = '__TAURI__' in window;

    const openWebview = async () => {
        if (isTauri) {
            try {
                await invoke('open_webview', { title, url });
            } catch (error) {
                console.error('Failed to open webview:', error);
            }
        }
    };

    if (!isTauri) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#1E1E1E] rounded-xl text-[#E3E3E3] p-6 text-center border border-[#313236]">
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-[#9AA0A6] mb-4 text-sm">
                    Desktop App Required
                </p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#313236] text-white rounded-full hover:bg-[#424242] text-sm transition-colors"
                >
                    Open in Browser
                </a>
            </div>
        );
    }

    return (
        <div
            className={`h-full w-full bg-[#1E1E1E] rounded-xl overflow-hidden flex flex-col border border-[#313236] transition-all duration-300 relative group cursor-pointer ${isPrimary ? 'shadow-2xl' : 'hover:border-[#5F6368]'}`}
            onClick={openWebview}
        >
            {/* Preview Content */}
            <div className="flex-1 relative bg-gradient-to-br from-[#2D2E30] to-[#1E1E1E] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">
                        {title === 'Gmail' && '📧'}
                        {title === 'Google Calendar' && '📅'}
                        {title === 'Google Tasks' && '✓'}
                        {title === 'Google Gemini' && '✨'}
                    </div>
                    <h3 className="text-xl font-bold text-[#E3E3E3] mb-2">{title}</h3>
                    <p className="text-[#9AA0A6] text-sm mb-4">Click to open</p>
                    <button
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            openWebview();
                        }}
                    >
                        Open {title}
                    </button>
                </div>

                {/* Expand Button Overlay */}
                {!isPrimary && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMakePrimary();
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                        title={`Expand ${title}`}
                    >
                        <Maximize2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
