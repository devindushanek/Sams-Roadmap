import { ExternalLink, Bookmark, Youtube, Pin, MessageCircle, Share2, Heart } from 'lucide-react';

interface PostMedia {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
}

interface PostEngagement {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
}

export interface SocialPost {
    id: number;
    platform: 'youtube' | 'pinterest' | 'linkedin' | 'facebook' | 'instagram';
    platformPostId: string;
    authorName: string;
    authorAvatar?: string;
    title?: string;
    description?: string;
    content?: string;
    media: PostMedia[];
    url: string;
    postedAt: string;
    engagement: PostEngagement;
    isSaved: boolean;
    category: string;
}

interface PostCardProps {
    post: SocialPost;
    onSave: (post: SocialPost) => void;
}

export function PostCard({ post, onSave }: PostCardProps) {
    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'youtube': return <Youtube size={16} className="text-red-500" />;
            case 'pinterest': return <Pin size={16} className="text-red-600" />;
            default: return <MessageCircle size={16} className="text-gray-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // If less than 24 hours, show relative time
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes}m ago`;
            }
            return `${hours}h ago`;
        }

        return date.toLocaleDateString();
    };

    const renderMedia = () => {
        if (!post.media || post.media.length === 0) return null;

        const media = post.media[0]; // Just show first media item for now

        if (post.platform === 'youtube') {
            return (
                <div className="relative aspect-video rounded-md overflow-hidden mb-3 group">
                    <img
                        src={media.thumbnail || media.url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                            <Youtube size={24} className="text-white fill-current" />
                        </div>
                    </div>
                </div>
            );
        }

        if (post.platform === 'pinterest') {
            return (
                <div className="relative rounded-md overflow-hidden mb-3">
                    <img
                        src={media.url}
                        alt={post.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="glass-card p-4 hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-white/5">
                        {getPlatformIcon(post.platform)}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-text-primary leading-none mb-1">
                            {post.authorName || post.platform}
                        </h3>
                        <span className="text-xs text-text-secondary">
                            {formatDate(post.postedAt)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onSave(post)}
                        className={`p-2 rounded-full transition-colors ${post.isSaved ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-primary hover:bg-white/5'}`}
                        title="Save to Knowledge Base"
                    >
                        <Bookmark size={16} className={post.isSaved ? 'fill-current' : ''} />
                    </button>
                    <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            {/* Content */}
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="block group">
                {renderMedia()}

                {post.title && (
                    <h4 className="text-base font-medium text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h4>
                )}

                {post.description && (
                    <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                        {post.description}
                    </p>
                )}
            </a>

            {/* Footer / Stats */}
            <div className="flex items-center gap-4 text-xs text-text-secondary mt-auto pt-3 border-t border-white/5">
                {post.engagement.views !== undefined && (
                    <span className="flex items-center gap-1">
                        <ExternalLink size={12} />
                        {post.engagement.views.toLocaleString()} views
                    </span>
                )}
                {post.engagement.likes !== undefined && (
                    <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {post.engagement.likes.toLocaleString()}
                    </span>
                )}
                <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase tracking-wider">
                    {post.category.replace('_', ' ')}
                </span>
            </div>
        </div>
    );
}
