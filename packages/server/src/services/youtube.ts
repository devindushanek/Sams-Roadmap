import { google, youtube_v3 } from 'googleapis';
import { googleService } from './google';
import { db } from '../db';
import { socialPosts } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class YouTubeService {
    private youtube: youtube_v3.Youtube | null = null;

    private ensureInitialized() {
        if (this.youtube) return;

        // Reuse the Google OAuth client from googleService
        googleService.ensureInitialized();
        const oauth2Client = googleService['oauth2Client'];

        if (oauth2Client) {
            this.youtube = google.youtube({ version: 'v3', auth: oauth2Client });
            console.log('YouTube Service initialized');
        }
    }

    /**
     * Fetch videos from user's subscriptions
     */
    async getSubscriptionFeed(maxResults: number = 50): Promise<any[]> {
        this.ensureInitialized();
        if (!this.youtube) return [];

        try {
            // 1. Get user's subscriptions
            const subscriptionsResponse = await this.youtube.subscriptions.list({
                part: ['snippet'],
                mine: true,
                maxResults: 50,
            });

            const subscriptions = subscriptionsResponse.data.items || [];
            const channelIds = subscriptions
                .map(sub => sub.snippet?.resourceId?.channelId)
                .filter(Boolean) as string[];

            if (channelIds.length === 0) return [];

            // 2. Get channel details to find "uploads" playlist ID
            // We can batch up to 50 channel IDs
            const channelsResponse = await this.youtube.channels.list({
                part: ['contentDetails'],
                id: channelIds,
                maxResults: 50
            });

            const uploadPlaylistIds = (channelsResponse.data.items || [])
                .map(channel => channel.contentDetails?.relatedPlaylists?.uploads)
                .filter(Boolean) as string[];

            // 3. Get latest videos from each channel's upload playlist
            // We'll fetch 1-2 videos from each channel to build a diverse feed
            const playlistPromises = uploadPlaylistIds.map(async (playlistId) => {
                try {
                    const response = await this.youtube!.playlistItems.list({
                        part: ['snippet', 'contentDetails'],
                        playlistId: playlistId,
                        maxResults: 2
                    });
                    return response.data.items || [];
                } catch (e) {
                    console.error(`Error fetching playlist ${playlistId}:`, e);
                    return [];
                }
            });

            const results = await Promise.all(playlistPromises);
            const playlistItems = results.flat();

            if (playlistItems.length === 0) return [];

            // 4. Get full video details (for stats/duration)
            const videoIds = playlistItems
                .map(item => item.contentDetails?.videoId)
                .filter(Boolean) as string[];

            // Batch video details request (max 50 at a time)
            const videoDetailsPromises = [];
            for (let i = 0; i < videoIds.length; i += 50) {
                const batch = videoIds.slice(i, i + 50);
                videoDetailsPromises.push(
                    this.youtube.videos.list({
                        part: ['snippet', 'contentDetails', 'statistics'],
                        id: batch,
                    })
                );
            }

            const videoDetailsResults = await Promise.all(videoDetailsPromises);
            const detailedVideos = videoDetailsResults.flatMap(res => res.data.items || []);

            // 5. Save to database and return
            const posts = [];
            for (const video of detailedVideos) {
                const post = {
                    platform: 'youtube' as const,
                    platformPostId: video.id!,
                    authorId: video.snippet?.channelId || '',
                    authorName: video.snippet?.channelTitle || '',
                    authorAvatar: '',
                    title: video.snippet?.title || '',
                    description: video.snippet?.description || '',
                    content: video.snippet?.description || '',
                    media: JSON.stringify([{
                        type: 'video',
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
                    }]),
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    postedAt: new Date(video.snippet?.publishedAt || Date.now()),
                    fetchedAt: new Date(),
                    engagement: JSON.stringify({
                        views: parseInt(video.statistics?.viewCount || '0'),
                        likes: parseInt(video.statistics?.likeCount || '0'),
                        comments: parseInt(video.statistics?.commentCount || '0'),
                    }),
                    isSaved: false,
                    tags: JSON.stringify(video.snippet?.tags || []),
                    category: 'watch_later',
                };

                // Check if post already exists
                const existing = await db.select()
                    .from(socialPosts)
                    .where(
                        and(
                            eq(socialPosts.platform, 'youtube'),
                            eq(socialPosts.platformPostId, video.id!)
                        )
                    )
                    .limit(1);

                if (existing.length === 0) {
                    await db.insert(socialPosts).values(post);
                }

                posts.push(post);
            }

            // Sort by date descending
            return posts.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

        } catch (error) {
            console.error('Error fetching YouTube feed:', error);
            return [];
        }
    }

    /**
     * Get cached posts from database
     */
    async getCachedFeed(filters?: {
        category?: string;
        since?: Date;
        channelId?: string;
    }): Promise<any[]> {
        try {
            let query = db.select().from(socialPosts).where(eq(socialPosts.platform, 'youtube'));

            // Apply filters
            // Note: This is simplified; you'd want to build the where clause dynamically

            const posts = await query.orderBy(desc(socialPosts.postedAt)).limit(50).execute();

            return posts.map(post => ({
                ...post,
                media: JSON.parse(post.media || '[]'),
                engagement: JSON.parse(post.engagement || '{}'),
                tags: JSON.parse(post.tags || '[]'),
            }));
        } catch (error) {
            console.error('Error fetching cached YouTube posts:', error);
            return [];
        }
    }

    /**
     * Save a video to knowledge base
     */
    async saveToKnowledgeBase(videoId: string): Promise<boolean> {
        try {
            // Update the post as saved
            await db.update(socialPosts)
                .set({ isSaved: true, savedAt: new Date() })
                .where(
                    and(
                        eq(socialPosts.platform, 'youtube'),
                        eq(socialPosts.platformPostId, videoId)
                    )
                );

            // TODO: Also add to documents table for vector search
            return true;
        } catch (error) {
            console.error('Error saving video to knowledge base:', error);
            return false;
        }
    }
}

export const youtubeService = new YouTubeService();
