import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { Layout, Tag, PlusSquare, Sparkles, ArrowLeft, Settings2, Wand2, ChevronDown, FileText, FileCode, Table, Code, Trash2, Plus, User, AlignLeft, X } from 'lucide-react';

const App = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [view, setView] = useState('editor'); // 'editor' or 'generator'
    const [isSaving, setIsSaving] = useState(false);
    const [appData, setAppData] = useState({
        resume: {
            personal: { name: 'Devin Dushanek', credentials: 'M.Arch. Cand., B.EnvD.', email: 'dushanekd@gmail.com', phone: '+1 [204] 620 2642', location: 'Winnipeg, Manitoba' },
            summary: { default: "7 years of experience using inclusive design methods to improve the lived experience of people from different cultural backgrounds and across the disability spectrum..." },
            experience: [{ id: 'exp1', title: 'VP - Design', company: 'Adaptability Canada [Remote]', dates: '06/2023 - Present', points: 'Leading research and design for future-forward best practices in inclusive design...', tags: ['leadership', 'inclusive-design'] }],
            education: [{ id: 'edu1', degree: 'Master of Architecture', school: 'University of Manitoba', dates: '2022-2025', tags: ['academic', 'architecture'] }],
            skills: [{ id: 'ski1', category: 'Research & Strategy', items: 'research + analysis, collaboration, problem-solving', tags: ['professional'] }],
            projects: [], achievements: [], certifications: [], courses: [], service: [], publications: [], customSections: []
        },
        presets: {
            'custom': { name: 'Custom (use text box)', tags: [] },
            'inclusive-design': { name: 'Inclusive Design Consulting', tags: ['inclusive-design', 'consulting'] },
            'everything': { name: 'Everything', tags: [] }
        },
        masterTags: new Set(),
        visibleSections: ['experience', 'education', 'skills']
    });

    const [showTooltips, setShowTooltips] = useState(true);

    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
        if (theme === 'dark') html.classList.add('dark');
        else html.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const saveData = () => {
        setIsSaving(true);
        // Simulate save
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="min-h-screen pb-20 transition-colors duration-300">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                onSave={saveData}
                isSaving={isSaving}
                showTooltips={showTooltips}
                setShowTooltips={setShowTooltips}
            />

            <main className="w-full px-6 md:px-16 py-10">
                {view === 'editor' ? (
                    <div className="space-y-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                <button className="btn-secondary text-xs md:text-sm py-2.5 px-4">
                                    <Layout className="w-4 h-4" />
                                    <span className="hidden sm:inline">Manage Sections</span>
                                    <span className="sm:hidden">Sections</span>
                                </button>
                                <button className="btn-secondary text-xs md:text-sm py-2.5 px-4">
                                    <Tag className="w-4 h-4" />
                                    <span className="hidden sm:inline">Tags & Presets</span>
                                    <span className="sm:hidden">Tags</span>
                                </button>
                                <button className="btn-secondary text-xs md:text-sm py-2.5 px-4">
                                    <PlusSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Custom Section</span>
                                    <span className="sm:hidden">Custom</span>
                                </button>
                            </div>
                            <button onClick={() => setView('generator')} className="btn-primary w-full lg:w-auto px-8 py-4 text-lg justify-center">
                                Generate Resume
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="neu-flat p-6 md:p-8 space-y-6 xl:col-span-2">
                                <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="text-indigo-600" /> Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.keys(appData.resume.personal).map(k => (
                                        <div key={k} className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k}</label>
                                            <input
                                                type="text"
                                                className="editor-input text-slate-800 dark:text-slate-100"
                                                defaultValue={appData.resume.personal[k]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="neu-flat p-6 md:p-8 space-y-6 xl:col-span-2">
                                <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlignLeft className="text-indigo-600" /> Professional Summary
                                </h3>
                                <textarea
                                    className="editor-input h-32 resize-none text-slate-800 dark:text-slate-100"
                                    defaultValue={appData.resume.summary.default}
                                ></textarea>
                            </div>

                            {/* Dynamic Sections */}
                            {appData.visibleSections.map(sectionKey => {
                                const sectionData = appData.resume[sectionKey] || [];
                                return (
                                    <div key={sectionKey} className="neu-flat p-6 md:p-8 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white capitalize">{sectionKey}</h3>
                                            <button className="btn-icon text-indigo-600">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            {sectionData.map(item => (
                                                <div key={item.id} className="relative p-5 md:p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 space-y-4">
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>

                                                    {/* Experience */}
                                                    {sectionKey === 'experience' && (
                                                        <>
                                                            <input type="text" placeholder="Job Title" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.title} />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="Company" className="editor-input" defaultValue={item.company} />
                                                                <input type="text" placeholder="Dates" className="editor-input" defaultValue={item.dates} />
                                                            </div>
                                                            <textarea placeholder="Accomplishments (one per line)" className="editor-input h-32 resize-none" defaultValue={item.points}></textarea>
                                                        </>
                                                    )}

                                                    {/* Education */}
                                                    {sectionKey === 'education' && (
                                                        <>
                                                            <input type="text" placeholder="Degree" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.degree} />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="School" className="editor-input" defaultValue={item.school} />
                                                                <input type="text" placeholder="Dates" className="editor-input" defaultValue={item.dates} />
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Skills */}
                                                    {sectionKey === 'skills' && (
                                                        <>
                                                            <input type="text" placeholder="Category" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.category} />
                                                            <textarea placeholder="Items (comma separated)" className="editor-input h-24 resize-none" defaultValue={item.items}></textarea>
                                                        </>
                                                    )}

                                                    {/* Projects */}
                                                    {sectionKey === 'projects' && (
                                                        <>
                                                            <input type="text" placeholder="Project Name" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.name} />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="Role" className="editor-input" defaultValue={item.role} />
                                                                <input type="text" placeholder="Organization" className="editor-input" defaultValue={item.org} />
                                                            </div>
                                                            <input type="text" placeholder="Date" className="editor-input" defaultValue={item.date} />
                                                        </>
                                                    )}

                                                    {/* Publications */}
                                                    {sectionKey === 'publications' && (
                                                        <>
                                                            <input type="text" placeholder="Title" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.title} />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="Journal/Platform" className="editor-input" defaultValue={item.journal} />
                                                                <input type="text" placeholder="Date" className="editor-input" defaultValue={item.date} />
                                                            </div>
                                                            <textarea placeholder="Description" className="editor-input h-24 resize-none" defaultValue={item.description}></textarea>
                                                        </>
                                                    )}

                                                    {/* Generic / Other Sections */}
                                                    {['service', 'achievements', 'certifications', 'courses'].includes(sectionKey) && (
                                                        <>
                                                            <input type="text" placeholder="Name/Role/Text" className="editor-input font-bold text-lg w-[calc(100%-80px)]" defaultValue={item.name || item.role || item.text} />
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <input type="text" placeholder="Organization" className="editor-input" defaultValue={item.org} />
                                                                <input type="text" placeholder="Date" className="editor-input" defaultValue={item.date || item.dates} />
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Tags */}
                                                    <div className="mt-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Tags</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.tags && item.tags.map(tag => (
                                                                <span key={tag} className="tag-bubble selected">{tag}</span>
                                                            ))}
                                                            <button className="tag-bubble bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-indigo-600">+ Add</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <button onClick={() => setView('editor')} className="btn-secondary">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Editor
                        </button>

                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10 items-start">
                            {/* Controls */}
                            <div className="xl:col-span-2 space-y-8">
                                <div className="neu-flat p-6 md:p-8 space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Settings2 className="text-indigo-600" />
                                        Configuration
                                    </h2>
                                    {/* Configuration inputs... */}
                                    <button className="btn-primary w-full py-4 text-lg">
                                        Generate Resume
                                        <Wand2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="xl:col-span-3 space-y-8">
                                <div className="neu-flat p-6 md:p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Preview</h2>
                                        <button className="btn-secondary">
                                            Export
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 md:p-10 shadow-inner min-h-[600px] md:min-h-[800px]">
                                        {/* Preview content */}
                                        <div className="flex flex-col items-center justify-center h-[600px] text-slate-400 gap-4">
                                            <p className="text-lg font-medium">Configure and generate to see preview</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
