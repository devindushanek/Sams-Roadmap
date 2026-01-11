import { FileText, MoreVertical } from 'lucide-react';

interface Document {
    id: number;
    path: string;
    content: string;
    metadata: string;
    createdAt: string;
}

interface FileExplorerProps {
    documents: Document[];
    onSelect: (doc: Document) => void;
}

export const FileExplorer = ({ documents, onSelect }: FileExplorerProps) => {
    return (
        <div className="glass-card h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 px-2">Knowledge Base</h3>
            <div className="flex-1 overflow-y-auto space-y-1">
                {documents.map((doc) => {
                    const metadata = JSON.parse(doc.metadata || '{}');
                    const filename = metadata.filename || doc.path.split(/[\\/]/).pop() || `Document ${doc.id}`;

                    return (
                        <div
                            key={doc.id}
                            onClick={() => onSelect(doc)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={18} className="text-primary shrink-0" />
                                <div className="truncate">
                                    <p className="text-sm font-medium truncate">{filename}</p>
                                    <p className="text-xs text-text-secondary truncate">
                                        {metadata.summary ? metadata.summary.substring(0, 50) + '...' : 'No summary'}
                                    </p>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-text-secondary">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    );
                })}

                {documents.length === 0 && (
                    <div className="text-center text-text-secondary py-8">
                        <p>No documents found.</p>
                        <p className="text-xs mt-2">Ingest files to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
