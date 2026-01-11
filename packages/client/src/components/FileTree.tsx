
import { useState } from 'react';
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../utils/fileTree';

interface FileTreeProps {
    nodes: FileNode[];
    onSelect: (file: any) => void;
    level?: number;
}

export const FileTree = ({ nodes, onSelect, level = 0 }: FileTreeProps) => {
    // Sort: Folders first, then files, both alphabetical
    const sortedNodes = [...nodes].sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
    });

    return (
        <div className="select-none">
            {sortedNodes.map(node => (
                <FileTreeNode key={node.id} node={node} onSelect={onSelect} level={level} />
            ))}
        </div>
    );
};

const FileTreeNode = ({ node, onSelect, level }: { node: FileNode, onSelect: (file: any) => void, level: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.data);
        }
    };

    return (
        <div>
            <div
                className={`
                    flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors
                    hover:bg-white/5 text-sm
                    ${level === 0 ? 'border-l-0' : ''}
                `}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {node.type === 'folder' && (
                    <span className="text-text-secondary opacity-70">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}
                {node.type === 'folder' ? (
                    <span className="text-primary">
                        {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
                    </span>
                ) : (
                    <span className="text-text-secondary ml-[22px]">
                        {/* Indent to align with folder text (Chevron + Gap) */}
                        <FileText size={16} />
                    </span>
                )}

                <span className={`truncate ${node.type === 'folder' ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                    {node.name}
                </span>
            </div>

            {node.type === 'folder' && isOpen && node.children && (
                <FileTree nodes={node.children} onSelect={onSelect} level={level + 1} />
            )}
        </div>
    );
};
