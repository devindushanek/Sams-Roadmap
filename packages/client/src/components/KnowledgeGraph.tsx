import { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Eye, EyeOff, FileText, Folder, Share2 } from 'lucide-react';

interface KnowledgeGraphProps {
    documents: any[];
    onNodeClick: (node: any) => void;
}

export const KnowledgeGraph = ({ documents, onNodeClick }: KnowledgeGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [showFolderLabels, setShowFolderLabels] = useState(true);
    const [showFileLabels, setShowFileLabels] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<any>(null);

    // Theme colors
    const [colors, setColors] = useState({
        background: '#0f172a',
        text: '#f8fafc',
        primary: '#8b5cf6',
        secondary: '#94a3b8',
        folder: '#fbbf24',
        file: '#60a5fa'
    });

    useEffect(() => {
        // Read CSS variables for theme consistency
        const style = getComputedStyle(document.documentElement);


        // We need to wait for a render cycle or use a specific theme context if available.
        // For now, we'll try to parse the RGB values from the root style.
        // Since our CSS vars are like "15 23 42", we convert them.

        const parseColor = (varName: string, fallback: string) => {
            const val = style.getPropertyValue(varName).trim();
            if (!val) return fallback;
            return `rgb(${val.split(' ').join(',')})`;
        };

        setColors({
            background: parseColor('--bg-background', '#0f172a'),
            text: parseColor('--text-primary', '#f8fafc'),
            primary: parseColor('--color-primary', '#8b5cf6'),
            secondary: parseColor('--text-secondary', '#94a3b8'),
            folder: '#eab308', // Yellow-500
            file: parseColor('--color-accent', '#38bdf8')
        });

    }, []);

    const handleZoomIn = () => {
        if (graphRef.current) {
            graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
        }
    };

    const handleZoomOut = () => {
        if (graphRef.current) {
            graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
        }
    };

    const handleFitView = () => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateDims);
        updateDims();

        return () => window.removeEventListener('resize', updateDims);
    }, []);

    const data = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];
        const pathMap = new Map<string, string>(); // path -> id
        const folderMap = new Map<string, any>();

        // 1. Create Nodes
        documents.forEach(doc => {
            let rawPath = doc.path;
            if (!rawPath && doc.metadata) {
                try {
                    const meta = JSON.parse(doc.metadata);
                    rawPath = meta.path || meta.filePath;
                } catch (e) { }
            }
            if (!rawPath) return;

            const id = `doc-${doc.id}`;
            pathMap.set(rawPath, id);

            nodes.push({
                id,
                name: rawPath.split(/[\\/]/).pop(),
                group: 'file',
                val: 1, // Smaller size for files
                doc
            });

            // Create Folder Nodes
            const parts = rawPath.split(/[\\/]/);
            parts.pop(); // Remove filename

            let currentPath = '';
            let parentId: string | null = null;

            parts.forEach((part: string) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const folderId = `folder-${currentPath}`;

                if (!folderMap.has(folderId)) {
                    folderMap.set(folderId, {
                        id: folderId,
                        name: part,
                        group: 'folder',
                        val: 2 // Slightly larger for folders
                    });
                    nodes.push(folderMap.get(folderId));

                    // Link to parent folder
                    if (parentId) {
                        links.push({
                            source: parentId,
                            target: folderId
                        });
                    }
                }
                parentId = folderId;
            });

            // Link file to its folder
            if (parentId) {
                links.push({
                    source: parentId,
                    target: id
                });
            }
        });

        return { nodes, links };
    }, [documents]);

    return (
        <div ref={containerRef} className="w-full h-full bg-transparent rounded-lg overflow-hidden relative group">
            <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                backgroundColor="rgba(0,0,0,0)" // Transparent to let theme bg show through

                // Physics - Obsidian style (stable, not too bouncy)
                d3VelocityDecay={0.2} // Higher friction
                d3AlphaDecay={0.02} // Slower cooling
                cooldownTicks={100}

                // Nodes
                nodeLabel="name"
                nodeColor={(node: any) => node.group === 'folder' ? colors.folder : colors.file}
                nodeRelSize={4} // Smaller nodes

                // Links
                linkColor={() => colors.secondary}
                linkWidth={1}
                linkDirectionalParticles={0} // Clean lines

                // Custom Rendering
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const isHovered = hoveredNode === node;
                    const isFolder = node.group === 'folder';

                    // Determine visibility based on zoom/hover
                    const showLabel = (isFolder && showFolderLabels) ||
                        (!isFolder && (showFileLabels || isHovered || globalScale > 2.5)); // Show file labels when zoomed in

                    // Draw Node
                    const r = isFolder ? 4 : 2.5;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = isFolder ? colors.folder : colors.file;

                    if (isHovered) {
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.shadowBlur = 10;
                        ctx.strokeStyle = colors.text;
                        ctx.lineWidth = 1 / globalScale;
                        ctx.stroke();
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    ctx.fill();
                    ctx.shadowBlur = 0; // Reset

                    // Draw Label
                    if (showLabel || isHovered) {
                        const label = node.name;
                        const fontSize = 10 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;

                        // Text Background (for readability)
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent bg
                        if (isHovered) ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

                        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + r + 2, bckgDimensions[0], bckgDimensions[1]);

                        // Text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = colors.text;
                        ctx.fillText(label, node.x, node.y + r + 2 + bckgDimensions[1] / 2);
                    }
                }}

                onNodeClick={(node: any) => {
                    if (node.group === 'file' && node.doc) {
                        onNodeClick(node.doc);
                        // Center view on node
                        graphRef.current?.centerAt(node.x, node.y, 1000);
                        graphRef.current?.zoom(4, 1000);
                    }
                }}
                onNodeHover={(node: any) => {
                    setHoveredNode(node || null);
                    if (containerRef.current) {
                        containerRef.current.style.cursor = node ? 'pointer' : 'default';
                    }
                }}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-surface/80 backdrop-blur-sm p-2 rounded-lg border border-white/10 shadow-xl transition-opacity opacity-50 hover:opacity-100">
                <div className="flex items-center justify-between gap-4 px-2 py-1">
                    <span className="text-xs text-text-secondary flex items-center gap-1"><Folder size={12} /> Folders</span>
                    <button
                        onClick={() => setShowFolderLabels(!showFolderLabels)}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {showFolderLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                </div>
                <div className="flex items-center justify-between gap-4 px-2 py-1 border-b border-white/10 pb-2 mb-1">
                    <span className="text-xs text-text-secondary flex items-center gap-1"><FileText size={12} /> Files</span>
                    <button
                        onClick={() => setShowFileLabels(!showFileLabels)}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {showFileLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                </div>
                <div className="flex gap-1 justify-center">
                    <button
                        onClick={handleZoomIn}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <button
                        onClick={handleFitView}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary"
                        title="Fit View"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
