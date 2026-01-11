
export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    data?: any; // The original document object for files
    path: string;
}

export const buildFileTree = (documents: any[]): FileNode[] => {
    const root: FileNode[] = [];

    // 1. Sort documents by path length to ensure parents are processed before children (roughly)
    // Actually, we can just iterate and build paths dynamically.

    documents.forEach(doc => {
        // Extract path from metadata if not present at top level
        let rawPath = doc.path;
        if (!rawPath && doc.metadata) {
            try {
                const meta = JSON.parse(doc.metadata);
                rawPath = meta.path || meta.filePath; // Handle potential variations
            } catch (e) {
                console.error('Failed to parse metadata for doc:', doc.id);
            }
        }

        if (!rawPath) return; // Skip if no path found

        // Normalize path separators to forward slashes for consistent processing
        const normalizedPath = rawPath.replace(/\\/g, '/');
        const parts = normalizedPath.split('/').filter((p: string) => p.length > 0);

        // We want to show the tree relative to the common root if possible, 
        // or just show the full absolute path structure. 
        // For simplicity in this "Connect Folder" context, usually we are ingesting one folder.
        // However, the paths stored are absolute. 
        // Let's build the full tree from the drive root for now, or try to find a common ancestor.
        // A simpler approach for the UI is to just build the tree based on the parts.

        let currentLevel = root;
        let currentPath = '';

        parts.forEach((part: string, index: number) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            // Check if this node already exists at this level
            let existingNode = currentLevel.find(node => node.name === part && node.type === 'folder');

            // If it's the last part, it's the file (unless it's a directory explicitly, but our docs are files)
            const isFile = index === parts.length - 1;

            if (isFile) {
                // It's a file, add it
                currentLevel.push({
                    id: `file-${doc.id}`,
                    name: part,
                    type: 'file',
                    data: doc,
                    path: currentPath
                });
            } else {
                // It's a folder
                if (!existingNode) {
                    existingNode = {
                        id: `folder-${currentPath}`,
                        name: part,
                        type: 'folder',
                        children: [],
                        path: currentPath
                    };
                    currentLevel.push(existingNode);
                }
                currentLevel = existingNode.children!;
            }
        });
    });

    // Optional: Prune empty root nodes if there's a long common prefix?
    // For now, let's return the raw tree. The user might have connected "D:/Reference/Structure",
    // so they will see D: -> Reference -> Structure. This is accurate.

    return root;
};
