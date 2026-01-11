import React, { useState } from 'react';
import { Sun, Moon, Save, Settings, ExternalLink, Info } from 'lucide-react';
import ladderIcon from '../assets/ladder_icon.png';

const Header = ({ theme, toggleTheme, onSave, isSaving, showTooltips, setShowTooltips }) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <header className="sticky top-0 z-40 glass border-b border-white/10">
            <div className="w-full px-6 md:px-16 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img
                        src={ladderIcon}
                        alt="DevLabs Logo"
                        className="w-10 h-10 object-contain hover-wiggle cursor-pointer"
                    />
                    <h1 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        DEV<span className="text-indigo-600">LABS</span>
                        <span className="hidden sm:inline text-slate-400 font-medium ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">Resume Gen</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onSave} className="btn-primary mr-2">
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saved!' : 'Save Data'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            title={showTooltips ? (theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode') : ''}
                        >
                            <div className="theme-toggle-knob">
                                {theme === 'light' ? (
                                    <Sun size={14} className="text-amber-500" />
                                ) : (
                                    <Moon size={14} className="text-indigo-400" />
                                )}
                            </div>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="neu-flat-sm w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title={showTooltips ? "Settings" : ""}
                            >
                                <Settings size={18} />
                            </button>

                            {showSettings && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setShowSettings(false)}></div>
                                    <div className="absolute right-0 mt-2 w-64 glass rounded-2xl shadow-2xl z-[101] border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Settings</h3>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                <Info className="w-4 h-4" /> Tooltips
                                            </span>
                                            <button
                                                onClick={() => setShowTooltips(!showTooltips)}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${showTooltips ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${showTooltips ? 'translate-x-5' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <a
                                                href={`http://${window.location.hostname}:5173`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setShowSettings(false)}
                                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Go to Palette Studio
                                            </a>
                                        </div>

                                        <div className="text-xs text-slate-400 pt-2 text-center">
                                            More preferences coming soon...
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
