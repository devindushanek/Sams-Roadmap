import { useEffect, useState, useMemo } from 'react';
import { Search, FileText, FolderPlus, Loader2, RefreshCw, Network, List, MessageSquare, GripVertical } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FileTree } from './FileTree';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ChatInterface } from './ChatInterface';
import { buildFileTree } from '../utils/fileTree';

// Helper to safely get electron module
const electron = (window as any).require ? (window as any).require('electron') : null;

export const KnowledgePanel = () => {
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [ingesting, setIngesting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) return documents;
        const lowerQuery = searchQuery.toLowerCase();
        return documents.filter(doc => {
            const meta = doc.metadata ? JSON.parse(doc.metadata) : {};
            const filename = meta.filename || meta.path || '';
            return filename.toLowerCase().includes(lowerQuery) ||
                (doc.content && doc.content.toLowerCase().includes(lowerQuery));
        });
    }, [documents, searchQuery]);

    const fileTree = useMemo(() => buildFileTree(filteredDocuments), [filteredDocuments]);

    const fetchDocuments = () => {
        fetch('http://localhost:3005/documents')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDocuments(data.documents || []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch documents:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDocuments();
        const interval = setInterval(fetchDocuments, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleConnectFolder = async () => {
        if (!electron) {
            alert('This feature is only available in the desktop app.');
            return;
        }

        try {
            const path = await electron.ipcRenderer.invoke('select-folder');
            if (path) {
                setIngesting(true);
                // Trigger ingestion on server
                const res = await fetch('http://localhost:3005/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filePath: path, type: 'directory' }),
                });
                const data = await res.json();
                setIngesting(false);

                if (data.success) {
                    alert(`Ingestion started for ${data.count} files!`);
                    fetchDocuments(); // Refresh list
                } else {
                    alert(`Ingestion failed: ${data.error}`);
                }
            }
        } catch (err: any) {
            console.error('Failed to connect folder:', err);
            setIngesting(false);
            alert('Failed to connect folder: ' + (err.message || err));
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Knowledge Base</h2>
                    <p className="text-xs text-text-secondary mt-1">Supported: .md, .txt (Top-level only)</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 outline-none focus:border-primary w-64 transition-all focus:bg-surface focus:w-72"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-surface border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'graph' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
                            title="Graph View"
                        >
                            <Network size={18} />
                        </button>
                    </div>

                    <button
                        onClick={fetchDocuments}
                        className="p-2 bg-surface hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : "text-text-secondary"} />
                    </button>
                    <button
                        onClick={handleConnectFolder}
                        disabled={ingesting}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {ingesting ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                        Connect Folder
                    </button>
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 h-full overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Left Column: Assistant */}
                    <Panel defaultSize={30} minSize={20} className="glass-card flex flex-col overflow-hidden h-full">
                        <div className="p-4 border-b border-white/5 bg-surface/30 flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" />
                            <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider">
                                Assistant
                            </h3>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-2 flex items-center justify-center bg-transparent hover:bg-primary/20 transition-colors cursor-col-resize">
                        <GripVertical size={12} className="text-text-secondary/50" />
                    </PanelResizeHandle>

                    {/* Right Column: Files / Graph / Document Viewer */}
                    <Panel defaultSize={70} minSize={30} className="glass-card flex flex-col overflow-hidden h-full">
                        {selectedFile ? (() => {
                            // Safely extract path
                            let filePath = selectedFile.path;
                            if (!filePath && selectedFile.metadata) {
                                try {
                                    const meta = JSON.parse(selectedFile.metadata);
                                    filePath = meta.path || meta.filePath;
                                } catch (e) { }
                            }
                            filePath = filePath || 'Unknown File';

                            return (
                                <>
                                    <div className="p-6 border-b border-white/5 flex justify-between items-start">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{filePath.split(/[\\/]/).pop()}</h3>
                                                <p className="text-xs text-text-secondary font-mono">{filePath}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="px-3 py-1.5 text-xs font-medium bg-surface hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                                        >
                                            Back to Browser
                                        </button>
                                    </div>
                                    <div className="flex gap-2 px-6 mt-4">
                                        {(JSON.parse(selectedFile.metadata || '{}').tags || []).map((tag: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-surface border border-white/5 rounded-md text-xs text-text-secondary">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        <div className="bg-surface/30 rounded-lg p-4 border border-white/5">
                                            <h4 className="text-sm font-semibold text-primary mb-2">AI Summary</h4>
                                            <p className="text-sm leading-relaxed text-text-secondary">
                                                {JSON.parse(selectedFile.metadata || '{}').summary || 'No summary available.'}
                                            </p>
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <pre className="bg-surface p-4 rounded-lg overflow-x-auto text-sm font-mono text-text-primary border border-white/10">
                                                {selectedFile.content}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            );
                        })() : (
                            // Browser View (List or Graph)
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-white/5 bg-surface/30 flex justify-between items-center">
                                    <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider">
                                        {viewMode === 'list' ? 'Files' : 'Knowledge Graph'}
                                    </h3>
                                    <div className="text-xs text-text-secondary">
                                        {filteredDocuments.length} Items {searchQuery && `(Filtered from ${documents.length})`}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden p-2 relative">
                                    {loading ? (
                                        <div className="text-center py-8 text-text-secondary">Loading...</div>
                                    ) : filteredDocuments.length === 0 ? (
                                        <div className="text-center text-text-secondary py-8">
                                            <p>{searchQuery ? 'No matching documents found.' : 'No documents found.'}</p>
                                            {!searchQuery && <p className="text-xs mt-2">Connect a folder to get started.</p>}
                                        </div>
                                    ) : viewMode === 'list' ? (
                                        <div className="h-full overflow-y-auto">
                                            {searchQuery ? (
                                                <div className="space-y-1 p-2">
                                                    {filteredDocuments.map((doc) => {
                                                        const meta = doc.metadata ? JSON.parse(doc.metadata) : {};
                                                        return (
                                                            <div
                                                                key={doc.id}
                                                                onClick={() => setSelectedFile(doc)}
                                                                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3 border border-transparent hover:border-white/5 transition-colors"
                                                            >
                                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <div className="font-medium truncate text-sm text-text-primary">
                                                                        {meta.filename || 'Unknown File'}
                                                                    </div>
                                                                    <div className="text-xs text-text-secondary truncate font-mono opacity-70">
                                                                        {meta.path}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <FileTree
                                                    nodes={fileTree}
                                                    onSelect={(doc) => {
                                                        setSelectedFile(doc);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <KnowledgeGraph
                                            documents={filteredDocuments}
                                            onNodeClick={(doc) => {
                                                setSelectedFile(doc);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

