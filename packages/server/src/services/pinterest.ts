import axios from 'axios';
import { db } from '../db';
import { socialPosts, socialTokens } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface PinterestConfig {
    appId: string;
    appSecret: string;
    redirectUri: string;
}

interface PinterestPin {
    id: string;
    title: string;
    description: string;
    link: string;
    media: {
        images: {
            '400x300': {
                url: string;
            };
            original: {
                url: string;
            };
        };
    };
    board: {
        id: string;
        name: string;
    };
    created_at: string;
    note: string;
}

export class PinterestService {
    private config: PinterestConfig;
    private baseUrl = 'https://api.pinterest.com/v5';

    constructor() {
        this.config = {
            appId: process.env.PINTEREST_APP_ID || '',
            appSecret: process.env.PINTEREST_APP_SECRET || '',
            redirectUri: 'http://localhost:3005/social/callback/pinterest',
        };
    }

    /**
     * Generate OAuth URL for user authorization
     */
    getAuthUrl(): string {
        const scopes = ['boards:read', 'pins:read', 'user_accounts:read'];
        const state = Math.random().toString(36).substring(7); // Basic CSRF protection

        return `https://www.pinterest.com/oauth/?` +
            `client_id=${this.config.appId}` +
            `&redirect_uri=${encodeURIComponent(this.config.redirectUri)}` +
            `&response_type=code` +
            `&scope=${scopes.join(',')}` +
            `&state=${state}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async handleCallback(code: string): Promise<boolean> {
        try {
            const response = await axios.post('https://api.pinterest.com/v5/oauth/token', {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.config.redirectUri,
            }, {
                auth: {
                    username: this.config.appId,
                    password: this.config.appSecret,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token, refresh_token, expires_in, scope } = response.data;

            // Save tokens to database
            const expiresAt = new Date(Date.now() + expires_in * 1000);

            await db.insert(socialTokens).values({
                platform: 'pinterest',
                accessToken: access_token,
                refreshToken: refresh_token || null,
                expiresAt,
                scope,
            }).onConflictDoUpdate({
                target: socialTokens.platform,
                set: {
                    accessToken: access_token,
                    refreshToken: refresh_token || null,
                    expiresAt,
                    scope,
                    updatedAt: new Date(),
                },
            });

            console.log('Pinterest tokens saved successfully');
            return true;
        } catch (error: any) {
            console.error('Pinterest OAuth error:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get access token from environment or database
     */
    private async getAccessToken(): Promise<string | null> {
        // First check for direct access token in env (for quick testing)
        if (process.env.PINTEREST_ACCESS_TOKEN) {
            return process.env.PINTEREST_ACCESS_TOKEN;
        }

        // Otherwise, get from database (OAuth flow)
        try {
            const tokens = await db.select()
                .from(socialTokens)
                .where(eq(socialTokens.platform, 'pinterest'))
                .limit(1);

            if (tokens.length === 0) return null;

            const token = tokens[0];

            // Check if token is expired
            if (token.expiresAt && new Date() >= token.expiresAt) {
                // TODO: Implement token refresh
                console.warn('Pinterest token expired');
                return null;
            }

            return token.accessToken;
        } catch (error) {
            console.error('Error fetching Pinterest token:', error);
            return null;
        }
    }

    /**
     * Fetch user's pins feed
     */
    async getFeed(maxResults: number = 50): Promise<any[]> {
        const accessToken = await this.getAccessToken();
        if (!accessToken) {
            console.warn('No Pinterest access token found');
            return [];
        }

        try {
            // Get user's pins
            let response = await axios.get(`${this.baseUrl}/pins`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                params: {
                    page_size: maxResults,
                },
            });

            let pins: PinterestPin[] = response.data.items || [];

            // If no pins found, try fetching from the first board (fallback)
            if (pins.length === 0) {
                console.log('No direct pins found, checking boards...');
                const boardsResponse = await axios.get(`${this.baseUrl}/boards`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const boards = boardsResponse.data.items || [];

                if (boards.length > 0) {
                    console.log(`Found ${boards.length} boards, fetching pins from first board: ${boards[0].name}`);
                    const boardId = boards[0].id;
                    response = await axios.get(`${this.baseUrl}/boards/${boardId}/pins`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                        params: { page_size: maxResults },
                    });
                    pins = response.data.items || [];
                }
            }

            // Save to database and return
            const posts = [];
            for (const pin of pins) {
                const post = {
                    platform: 'pinterest' as const,
                    platformPostId: pin.id,
                    authorId: '', // Pinterest API v5 doesn't return creator in pins list
                    authorName: '',
                    authorAvatar: '',
                    title: pin.title || pin.note || '',
                    description: pin.description || pin.note || '',
                    content: pin.note || '',
                    media: JSON.stringify([{
                        type: 'image',
                        url: pin.media?.images?.original?.url || pin.media?.images?.['400x300']?.url || '',
                        thumbnail: pin.media?.images?.['400x300']?.url || '',
                    }]),
                    url: pin.link || `https://pinterest.com/pin/${pin.id}`,
                    postedAt: new Date(pin.created_at),
                    fetchedAt: new Date(),
                    engagement: JSON.stringify({}), // Pinterest API v5 doesn't include stats in basic endpoint
                    isSaved: false,
                    tags: JSON.stringify([]),
                    category: 'reference',
                };

                // Check if post already exists
                const existing = await db.select()
                    .from(socialPosts)
                    .where(
                        and(
                            eq(socialPosts.platform, 'pinterest'),
                            eq(socialPosts.platformPostId, pin.id)
                        )
                    )
                    .limit(1);

                if (existing.length === 0) {
                    await db.insert(socialPosts).values(post);
                }

                posts.push(post);
            }

            return posts;
        } catch (error: any) {
            console.error('Error fetching Pinterest feed:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Get cached pins from database
     */
    async getCachedFeed(filters?: {
        category?: string;
        since?: Date;
    }): Promise<any[]> {
        try {
            const posts = await db.select()
                .from(socialPosts)
                .where(eq(socialPosts.platform, 'pinterest'))
                .orderBy(desc(socialPosts.postedAt))
                .limit(50);

            return posts.map(post => ({
                ...post,
                media: JSON.parse(post.media || '[]'),
                engagement: JSON.parse(post.engagement || '{}'),
                tags: JSON.parse(post.tags || '[]'),
            }));
        } catch (error) {
            console.error('Error fetching cached Pinterest posts:', error);
            return [];
        }
    }

    /**
     * Save a pin to knowledge base
     */
    async saveToKnowledgeBase(pinId: string): Promise<boolean> {
        try {
            await db.update(socialPosts)
                .set({ isSaved: true, savedAt: new Date() })
                .where(
                    and(
                        eq(socialPosts.platform, 'pinterest'),
                        eq(socialPosts.platformPostId, pinId)
                    )
                );

            // TODO: Also add to documents table for vector search
            return true;
        } catch (error) {
            console.error('Error saving pin to knowledge base:', error);
            return false;
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken();
        return token !== null;
    }
}

export const pinterestService = new PinterestService();
