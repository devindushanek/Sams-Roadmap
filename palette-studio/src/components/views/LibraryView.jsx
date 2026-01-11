import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight, Plus, FolderPlus, Grip, Sparkles } from 'lucide-react';

const LibraryView = ({
    palettes,
    projects = [],
    setActiveIndex,
    setCurrentPage,
    addPalette,
    setDeleteModal,
    createProject,
    updateProject,
    deleteProject,
    movePaletteToProject,
    reorderPalettes
}) => {
    const [collapsedProjects, setCollapsedProjects] = useState({});
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editingProjectName, setEditingProjectName] = useState('');
    const [draggedPalette, setDraggedPalette] = useState(null);
    const [dragOverProject, setDragOverProject] = useState(null);
    const [dragOverPaletteId, setDragOverPaletteId] = useState(null);
    const [projectDeleteModal, setProjectDeleteModal] = useState({ isOpen: false, project: null });
    const longPressTimer = React.useRef(null);
    const touchStartPosition = React.useRef({ x: 0, y: 0 });
    const [dragGhost, setDragGhost] = useState(null);

    const toggleProjectCollapse = (projectId) => {
        setCollapsedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    const startEditingProject = (project, e) => {
        e.stopPropagation();
        setEditingProjectId(project.id);
        setEditingProjectName(project.name);
    };

    const saveProjectName = (projectId) => {
        if (editingProjectName.trim()) {
            updateProject(projectId, { name: editingProjectName.trim() });
        }
        setEditingProjectId(null);
        setEditingProjectName('');
    };

    // Drag and Drop handlers
    const handleDragStart = (e, palette, globalIndex) => {
        setDraggedPalette({ ...palette, globalIndex });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', palette.id);
    };

    const handleDragEnd = () => {
        setDraggedPalette(null);
        setDragOverProject(null);
        setDragOverPaletteId(null);
    };

    const handleDragOver = (e, projectId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverProject(projectId);
    };

    const handleDragLeave = () => {
        setDragOverProject(null);
    };

    const handlePaletteDragOver = (e, targetPaletteId, targetGlobalIndex) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (draggedPalette && draggedPalette.id !== targetPaletteId) {
            setDragOverPaletteId(targetPaletteId);
        }
    };

    const handlePaletteDragLeave = () => {
        setDragOverPaletteId(null);
    };

    const handlePaletteDrop = (e, targetGlobalIndex, targetProjectId) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedPalette) {
            // Check if project changed
            const newProjectId = draggedPalette.projectId !== targetProjectId ? targetProjectId : undefined;

            if (draggedPalette.globalIndex !== targetGlobalIndex || newProjectId !== undefined) {
                reorderPalettes(draggedPalette.globalIndex, targetGlobalIndex, newProjectId);
            }
        }

        setDraggedPalette(null);
        setDragOverProject(null);
        setDragOverPaletteId(null);
    };

    const handleDrop = (e, projectId) => {
        e.preventDefault();
        if (draggedPalette) {
            movePaletteToProject(draggedPalette.id, projectId);
        }
        setDraggedPalette(null);
        setDragOverProject(null);
        setDragOverPaletteId(null);
    };

    const handleProjectDelete = (deletepalettes) => {
        const project = projectDeleteModal.project;
        if (deletepalettes) {
            // Delete all palettes in the project first
            palettes.forEach(p => {
                if (p.projectId === project.id) {
                    const idx = palettes.findIndex(pal => pal.id === p.id);
                    if (idx !== -1) {
                        setDeleteModal({ isOpen: true, index: idx });
                    }
                }
            });
        }
        deleteProject(project.id);
        setProjectDeleteModal({ isOpen: false, project: null });
    };

    // Group palettes by project
    const ungroupedPalettes = palettes.filter(p => !p.projectId);
    const groupedByProject = projects.map(project => ({
        ...project,
        palettes: palettes.filter(p => p.projectId === project.id)
    }));

    const renderPaletteCard = (p, globalIndex, inProject = false, projectId = null) => (
        <div
            key={p.id}
            data-palette-id={p.id}
            draggable
            onDragStart={(e) => handleDragStart(e, p, globalIndex)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handlePaletteDragOver(e, p.id, globalIndex)}
            onDragLeave={handlePaletteDragLeave}
            onDrop={(e) => handlePaletteDrop(e, globalIndex, projectId)}
            onTouchStart={(e) => handleTouchStart(e, p, globalIndex)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => { setActiveIndex(globalIndex); setCurrentPage('editor'); }}
            className={`neu-flat p-4 cursor-pointer group transition-all duration-300 flex flex-col gap-4 neu-card-hover ${inProject ? 'min-w-[280px] max-w-[320px] shrink-0' : ''} ${draggedPalette?.id === p.id ? 'opacity-50 scale-95' : ''} ${dragOverPaletteId === p.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
        >
            <div className="h-16 rounded-2xl overflow-hidden flex shadow-neu-pressed-sm relative">
                {p?.colors?.map((c, ci) => (
                    <div key={ci} className="flex-1 transition-transform group-hover:scale-[1.02] first:rounded-l-xl last:rounded-r-xl" style={{ backgroundColor: c.hex }} />
                ))}
                {/* Drag Handle */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all">
                    <div className="opacity-0 group-hover:opacity-80 text-white drop-shadow-md transition-opacity">
                        <Grip size={20} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-black text-lg text-slate-800 truncate">{p.name}</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">{p.description}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, index: globalIndex }); }}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );

    const renderProjectGroup = (project) => {
        const isCollapsed = collapsedProjects[project.id];
        const projectPalettes = project.palettes || [];
        const isDragOver = dragOverProject === project.id;

        return (
            <div
                key={project.id}
                data-project-id={project.id}
                className={`space-y-4 transition-all ${isDragOver ? 'ring-2 ring-indigo-400 ring-offset-4 rounded-2xl' : ''}`}
                onDragOver={(e) => handleDragOver(e, project.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, project.id)}
            >
                {/* Project Header */}
                <div className="flex items-center gap-3 group/header">
                    <button
                        onClick={() => toggleProjectCollapse(project.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {editingProjectId === project.id ? (
                        <input
                            type="text"
                            value={editingProjectName}
                            onChange={(e) => setEditingProjectName(e.target.value)}
                            onBlur={() => saveProjectName(project.id)}
                            onKeyDown={(e) => e.key === 'Enter' && saveProjectName(project.id)}
                            className="text-lg font-black text-slate-700 bg-transparent border-b-2 border-indigo-500 outline-none px-1"
                            autoFocus
                        />
                    ) : (
                        <h2
                            onClick={(e) => startEditingProject(project, e)}
                            className="text-lg font-black text-slate-700 cursor-text hover:text-indigo-600 transition-colors"
                        >
                            {project.name}
                        </h2>
                    )}

                    <span className="text-xs font-bold text-slate-400">
                        {projectPalettes.length} palette{projectPalettes.length !== 1 ? 's' : ''}
                    </span>

                    {/* Delete Button - visible on hover */}
                    <button
                        onClick={() => {
                            // If project has no palettes, delete directly without confirmation
                            if (projectPalettes.length === 0) {
                                deleteProject(project.id);
                            } else {
                                setProjectDeleteModal({ isOpen: true, project });
                            }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/header:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="my-4">
                        <div className="flex gap-6 overflow-x-auto py-6 w-screen ml-[calc(50%-50vw)] px-[calc(50vw-50%+1.5rem)] md:px-[calc(50vw-50%+4rem)] scrollbar-constrained">
                            {projectPalettes.length > 0 ? (
                                projectPalettes.map((p) => {
                                    const globalIndex = palettes.findIndex(pal => pal.id === p.id);
                                    return renderPaletteCard(p, globalIndex, true, project.id);
                                })
                            ) : (
                                <div className="text-slate-400 text-sm font-medium py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl min-w-[280px] text-center">
                                    Drag palettes here
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Touch handlers for mobile drag
    const handleTouchStart = (e, palette, globalIndex) => {
        touchStartPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        longPressTimer.current = setTimeout(() => {
            setDraggedPalette({ ...palette, globalIndex });
            setDragGhost({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                colors: palette.colors
            });
            document.body.style.overflow = 'hidden';
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleTouchMove = (e) => {
        if (!draggedPalette) {
            const dx = Math.abs(e.touches[0].clientX - touchStartPosition.current.x);
            const dy = Math.abs(e.touches[0].clientY - touchStartPosition.current.y);
            if (dx > 10 || dy > 10) {
                clearTimeout(longPressTimer.current);
            }
            return;
        }

        setDragGhost(prev => ({ ...prev, x: e.touches[0].clientX, y: e.touches[0].clientY }));

        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            const projectEl = element.closest('[data-project-id]');
            if (projectEl) {
                const projectId = projectEl.getAttribute('data-project-id');
                if (projectId !== dragOverProject) {
                    setDragOverProject(projectId);
                }
            } else {
                setDragOverProject(null);
            }
        }
    };

    const handleTouchEnd = (e) => {
        clearTimeout(longPressTimer.current);
        setDragGhost(null);
        document.body.style.overflow = '';

        if (draggedPalette) {
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element) {
                const projectEl = element.closest('[data-project-id]');
                if (projectEl) {
                    const targetProjectId = projectEl.getAttribute('data-project-id');
                    const finalProjectId = targetProjectId === 'ungrouped' ? null : targetProjectId;

                    if (finalProjectId !== draggedPalette.projectId) {
                        movePaletteToProject(draggedPalette.id, finalProjectId);
                    }
                }
            }
        }

        setDraggedPalette(null);
        setDragOverProject(null);
        setDragOverPaletteId(null);
    };

    return (
        <div className="min-h-screen bg-neumorphic-bg pb-8 md:pb-16 pt-4 md:pt-4 animate-in fade-in duration-700">
            {/* Header with Actions */}
            <header className="max-w-6xl mx-auto w-full mb-8 px-6 md:px-16">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-black text-slate-800 drop-shadow-sm">Library</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={createProject}
                            className="neu-flat-sm px-4 py-2.5 text-slate-500 font-black flex items-center gap-2 neu-button-hover transition-all text-xs uppercase tracking-widest"
                        >
                            <FolderPlus size={16} />
                            New Project
                        </button>
                        <button
                            onClick={addPalette}
                            className="neu-flat-sm px-4 py-2.5 text-slate-500 font-black flex items-center gap-2 neu-button-hover transition-all text-xs uppercase tracking-widest"
                        >
                            <Plus size={16} />
                            Color Palette
                        </button>
                        <button
                            onClick={() => setCurrentPage('material-creator')}
                            className="neu-flat-sm px-4 py-2.5 text-indigo-600 font-black flex items-center gap-2 neu-button-hover transition-all text-xs uppercase tracking-widest"
                        >
                            <Sparkles size={16} />
                            Material Palette
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto space-y-8 px-6 md:px-16">
                {/* Project Groups */}
                {groupedByProject.map(project => renderProjectGroup(project))}

                {/* Ungrouped Palettes */}
                {ungroupedPalettes.length > 0 && (
                    <div
                        data-project-id="ungrouped"
                        className={`space-y-4 transition-all ${dragOverProject === 'ungrouped' ? 'ring-2 ring-slate-400 ring-offset-4 rounded-2xl' : ''}`}
                        onDragOver={(e) => handleDragOver(e, 'ungrouped')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, null)}
                    >
                        {projects.length > 0 && (
                            <h2 className="text-lg font-black text-slate-500">Ungrouped</h2>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ungroupedPalettes.map((p) => {
                                const globalIndex = palettes.findIndex(pal => pal.id === p.id);
                                return renderPaletteCard(p, globalIndex, false, null);
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {palettes.length === 0 && projects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-bold text-lg mb-4">No palettes yet</p>
                        <button
                            onClick={addPalette}
                            className="neu-flat px-6 py-3 text-indigo-600 font-black flex items-center gap-2 neu-button-hover transition-all text-sm uppercase tracking-widest mx-auto"
                        >
                            <Plus size={18} />
                            Create Your First Palette
                        </button>
                    </div>
                )}
            </main>

            {/* Project Delete Confirmation Modal */}
            {projectDeleteModal.isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300"
                    onClick={() => setProjectDeleteModal({ isOpen: false, project: null })}
                >
                    <div
                        className="bg-neumorphic-bg rounded-[32px] p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-300 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-slate-800">Delete Project</h3>
                            <p className="text-slate-500 font-medium">
                                What would you like to do with the palettes in "{projectDeleteModal.project?.name}"?
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleProjectDelete(false)}
                                className="w-full neu-flat-sm px-4 py-3 text-slate-600 font-black flex items-center justify-center gap-2 neu-button-hover transition-all text-sm"
                            >
                                Keep Palettes
                            </button>
                            <button
                                onClick={() => handleProjectDelete(true)}
                                className="w-full neu-flat-sm px-4 py-3 text-rose-500 font-black flex items-center justify-center gap-2 neu-button-hover transition-all text-sm"
                            >
                                Delete Project & All Palettes
                            </button>
                            <button
                                onClick={() => setProjectDeleteModal({ isOpen: false, project: null })}
                                className="w-full px-4 py-3 text-slate-400 font-black flex items-center justify-center gap-2 transition-all text-sm hover:text-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {dragGhost && (
                <div
                    className="fixed w-64 h-24 rounded-2xl shadow-2xl z-50 pointer-events-none opacity-50 ring-1 ring-black/10 flex overflow-hidden bg-white"
                    style={{
                        top: dragGhost.y,
                        left: dragGhost.x,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {dragGhost.colors?.map((c, ci) => (
                        <div key={ci} className="flex-1" style={{ backgroundColor: c.hex }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryView;
