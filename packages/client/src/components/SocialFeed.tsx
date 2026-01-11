import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, Filter, Youtube, Pin } from 'lucide-react';
import { PostCard, SocialPost } from './PostCard';

const MOCK_POSTS: SocialPost[] = [
    {
        id: 9991,
        platform: 'youtube',
        platformPostId: 'mock1',
        title: 'Building AI Agents with LangChain',
        description: 'Learn how to build autonomous agents using LangChain and Python.',
        authorName: 'AI Explained',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        url: 'https://www.youtube.com/watch?v=dyPDS0z1J0k',
        media: [{ type: 'video', url: 'https://www.youtube.com/watch?v=dyPDS0z1J0k', thumbnail: 'https://img.youtube.com/vi/dyPDS0z1J0k/maxresdefault.jpg' }],
        engagement: { views: 12500, likes: 850 },
        category: 'watch_later',
        isSaved: false
    },
    {
        id: 9992,
        platform: 'pinterest',
        platformPostId: 'mock2',
        title: 'Modern UI Design Inspiration',
        description: 'Collection of beautiful dashboard designs.',
        authorName: 'Design Daily',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        url: 'https://www.pinterest.com/search/pins/?q=dashboard%20ui',
        media: [{ type: 'image', url: 'https://i.pinimg.com/564x/0a/1f/23/0a1f230726007cdd285d68d04835017b.jpg' }],
        engagement: { likes: 420 },
        category: 'reference',
        isSaved: false
    },
    {
        id: 9993,
        platform: 'youtube',
        platformPostId: 'mock3',
        title: 'The Future of Web Development',
        description: 'What to expect in 2025 and beyond.',
        authorName: 'Tech Trends',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        media: [{ type: 'video', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg' }],
        engagement: { views: 5000, likes: 200 },
        category: 'watch_later',
        isSaved: false
    },
    {
        id: 9994,
        platform: 'pinterest',
        platformPostId: 'mock4',
        title: 'Minimalist Home Office Setup',
        description: 'Clean and productive workspace ideas.',
        authorName: 'Workspace Goals',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        url: 'https://www.pinterest.com/search/pins/?q=home%20office',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80' }],
        engagement: { likes: 890 },
        category: 'reference',
        isSaved: false
    },
    {
        id: 9995,
        platform: 'youtube',
        platformPostId: 'mock5',
        title: 'Rust for JavaScript Developers',
        description: 'A gentle introduction to Rust programming language.',
        authorName: 'Code with Ryan',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        url: 'https://www.youtube.com/watch?v=5C_HPTJg5ek',
        media: [{ type: 'video', url: 'https://www.youtube.com/watch?v=5C_HPTJg5ek', thumbnail: 'https://img.youtube.com/vi/5C_HPTJg5ek/maxresdefault.jpg' }],
        engagement: { views: 32000, likes: 1500 },
        category: 'watch_later',
        isSaved: false
    },
    {
        id: 9996,
        platform: 'pinterest',
        platformPostId: 'mock6',
        title: 'Cyberpunk Cityscapes',
        description: 'Neon lights and futuristic vibes.',
        authorName: 'ArtStation Picks',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
        url: 'https://www.pinterest.com/search/pins/?q=cyberpunk',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800&q=80' }],
        engagement: { likes: 2100 },
        category: 'reference',
        isSaved: false
    },
    {
        id: 9997,
        platform: 'youtube',
        platformPostId: 'mock7',
        title: 'Understanding Neural Networks',
        description: 'Deep dive into how neural networks actually work.',
        authorName: 'DeepMind',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        url: 'https://www.youtube.com/watch?v=aircAruvnKk',
        media: [{ type: 'video', url: 'https://www.youtube.com/watch?v=aircAruvnKk', thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg' }],
        engagement: { views: 85000, likes: 4200 },
        category: 'watch_later',
        isSaved: false
    },
    {
        id: 9998,
        platform: 'pinterest',
        platformPostId: 'mock8',
        title: 'Typography Trends 2025',
        description: 'The fonts taking over the web.',
        authorName: 'Type Hunters',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
        url: 'https://www.pinterest.com/search/pins/?q=typography',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1516417156595-3ce612f043bd?w=800&q=80' }],
        engagement: { likes: 340 },
        category: 'reference',
        isSaved: false
    },
    {
        id: 9999,
        platform: 'youtube',
        platformPostId: 'mock9',
        title: '10 Minute Morning Yoga',
        description: 'Start your day with energy and focus.',
        authorName: 'Yoga with Adriene',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        media: [{ type: 'video', url: 'https://www.youtube.com/watch?v=4pKly2JojMw', thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg' }],
        engagement: { views: 150000, likes: 8000 },
        category: 'watch_later',
        isSaved: false
    },
    {
        id: 10000,
        platform: 'pinterest',
        platformPostId: 'mock10',
        title: 'Healthy Meal Prep Ideas',
        description: 'Save time and eat better.',
        authorName: 'Fit Foodie',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
        url: 'https://www.pinterest.com/search/pins/?q=meal%20prep',
        media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80' }],
        engagement: { likes: 1200 },
        category: 'reference',
        isSaved: false
    }
];

export function SocialFeed() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'youtube' | 'pinterest'>('all');
    const [category, setCategory] = useState<'all' | 'connections' | 'reference' | 'watch_later'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchFeed = async (refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);

            const params = new URLSearchParams();
            if (filter !== 'all') params.append('platform', filter);
            if (category !== 'all') params.append('category', category);
            if (refresh) params.append('refresh', 'true');

            const response = await fetch(`http://localhost:3005/social/feed?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                if (data.posts.length > 0) {
                    setPosts(data.posts);
                } else if (data.posts.length === 0 && !refresh && !refreshing) {
                    console.log('Feed empty, auto-refreshing from APIs...');
                    fetchFeed(true);
                } else if (data.posts.length === 0 && refresh) {
                    // If still empty after refresh, show filtered mock data
                    console.log('Feed still empty, showing mock data');
                    const filteredMock = MOCK_POSTS.filter(p =>
                        (filter === 'all' || p.platform === filter) &&
                        (category === 'all' || p.category === category)
                    );
                    setPosts(filteredMock);
                }
            }
        } catch (error) {
            console.error('Error fetching social feed:', error);
            // Fallback to filtered mock data on error
            const filteredMock = MOCK_POSTS.filter(p =>
                (filter === 'all' || p.platform === filter) &&
                (category === 'all' || p.category === category)
            );
            setPosts(filteredMock);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeed();
        setCurrentPage(1); // Reset to first page on filter change
    }, [filter, category]);

    const handleSave = async (post: SocialPost) => {
        try {
            const response = await fetch('http://localhost:3005/social/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: post.platform,
                    postId: post.platformPostId
                })
            });

            if (response.ok) {
                // Update local state
                setPosts(posts.map(p =>
                    p.id === post.id ? { ...p, isSaved: true } : p
                ));
            }
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    // Calculate pagination
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / itemsPerPage);

    return (
        <div className="h-full flex flex-col overflow-hidden bg-surface/30 backdrop-blur-sm rounded-xl border border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-text-primary">
                        <MessageCircle size={24} className="text-primary" />
                        Feed
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                        Aggregated content from your connected platforms
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchFeed(true)}
                        disabled={refreshing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors ${refreshing ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                        title="Refresh feed"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-white/5 flex gap-3 overflow-x-auto custom-scrollbar bg-black/10 items-center">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mr-2">Platform:</span>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('youtube')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'youtube' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                >
                    <Youtube size={16} /> YouTube
                </button>
                <button
                    onClick={() => setFilter('pinterest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'pinterest' ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                >
                    <Pin size={16} /> Pinterest
                </button>

                <div className="w-px h-8 bg-white/10 mx-2" />

                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mr-2">Category:</span>
                <button
                    onClick={() => setCategory('watch_later')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${category === 'watch_later' ? 'bg-white/20 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                >
                    Watch Later
                </button>
                <button
                    onClick={() => setCategory('reference')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${category === 'reference' ? 'bg-white/20 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}
                >
                    Reference
                </button>
            </div>

            {/* Feed Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-base font-medium">Curating your feed...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Filter size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">No posts found</h3>
                        <p className="text-text-secondary mb-6">
                            We couldn't find any posts matching your filters. Try adjusting them or refreshing the feed to fetch new content.
                        </p>
                        <button
                            onClick={() => fetchFeed(true)}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Refresh Feed
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                            {currentPosts.map(post => (
                                <PostCard key={`${post.platform}-${post.platformPostId}`} post={post} onSave={handleSave} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
                                >
                                    <option value={5} className="text-black">5</option>
                                    <option value={10} className="text-black">10</option>
                                    <option value={25} className="text-black">25</option>
                                    <option value={50} className="text-black">50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-text-primary transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-text-secondary">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-text-primary transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
