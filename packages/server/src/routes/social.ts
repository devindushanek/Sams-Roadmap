import { Router } from 'express';
import { youtubeService } from '../services/youtube';
import { pinterestService } from '../services/pinterest';
import { googleService } from '../services/google';

const router = Router();

/**
 * Get aggregated social feed
 * Query params:
 *   - platform: 'youtube' | 'pinterest' | 'all'
 *   - category: 'connections' | 'reference' | 'watch_later'
 *   - since: ISO date string
 *   - refresh: 'true' to fetch fresh data
 */
router.get('/feed', async (req, res) => {
    try {
        const { platform = 'all', category, since, refresh } = req.query;

        let posts: any[] = [];

        // Fetch YouTube posts
        if (platform === 'youtube' || platform === 'all') {
            if (refresh === 'true') {
                const freshPosts = await youtubeService.getSubscriptionFeed(50);
                posts = [...posts, ...freshPosts];
            } else {
                const filters: any = {};
                if (category) filters.category = category;
                if (since) filters.since = new Date(since as string);

                const cachedPosts = await youtubeService.getCachedFeed(filters);
                posts = [...posts, ...cachedPosts];
            }
        }

        // Fetch Pinterest posts
        if (platform === 'pinterest' || platform === 'all') {
            if (refresh === 'true') {
                const freshPosts = await pinterestService.getFeed(50);
                posts = [...posts, ...freshPosts];
            } else {
                const filters: any = {};
                if (category) filters.category = category;
                if (since) filters.since = new Date(since as string);

                const cachedPosts = await pinterestService.getCachedFeed(filters);
                posts = [...posts, ...cachedPosts];
            }
        }

        // Sort by posted date (newest first)
        posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

        // Parse JSON fields (media, engagement, tags) if they are strings
        const formattedPosts = posts.map(p => {
            try {
                return {
                    ...p,
                    media: typeof p.media === 'string' ? JSON.parse(p.media) : p.media,
                    engagement: typeof p.engagement === 'string' ? JSON.parse(p.engagement) : p.engagement,
                    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
                };
            } catch (e) {
                return p;
            }
        });

        res.json({
            success: true,
            count: formattedPosts.length,
            posts: formattedPosts,
        });
    } catch (error: any) {
        console.error('Error fetching social feed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Get OAuth URL for connecting a platform
 */
router.get('/auth/:platform', (req, res) => {
    try {
        const { platform } = req.params;

        if (platform === 'youtube') {
            // YouTube uses Google OAuth
            const url = googleService.getAuthUrl();
            res.json({ success: true, url });
        } else if (platform === 'pinterest') {
            const url = pinterestService.getAuthUrl();
            res.json({ success: true, url });
        } else {
            res.status(400).json({
                success: false,
                error: `Platform ${platform} not yet supported`,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Handle OAuth callback for Pinterest
 */
router.get('/callback/:platform', async (req, res) => {
    try {
        const { platform } = req.params;
        const { code } = req.query;

        if (!code) {
            return res.status(400).send('Missing authorization code');
        }

        if (platform === 'pinterest') {
            const success = await pinterestService.handleCallback(code as string);
            if (success) {
                res.send('<h1>Success!</h1><p>Pinterest connected. You can close this window and return to Glyph.</p>');
            } else {
                res.status(500).send('<h1>Error</h1><p>Failed to connect Pinterest. Check server logs.</p>');
            }
        } else {
            res.status(400).send(`Platform ${platform} callback not supported here`);
        }
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

/**
 * Check authentication status for a platform
 */
router.get('/status/:platform', async (req, res) => {
    try {
        const { platform } = req.params;

        if (platform === 'youtube') {
            const isAuthenticated = googleService['isAuthenticated'];
            res.json({ success: true, isAuthenticated });
        } else if (platform === 'pinterest') {
            const isAuthenticated = await pinterestService.isAuthenticated();
            res.json({ success: true, isAuthenticated });
        } else {
            res.json({ success: true, isAuthenticated: false });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Save a post to knowledge base
 */
router.post('/save', async (req, res) => {
    try {
        const { platform, postId } = req.body;

        if (!platform || !postId) {
            return res.status(400).json({
                success: false,
                error: 'platform and postId are required',
            });
        }

        let saved = false;

        if (platform === 'youtube') {
            saved = await youtubeService.saveToKnowledgeBase(postId);
        } else if (platform === 'pinterest') {
            saved = await pinterestService.saveToKnowledgeBase(postId);
        } else {
            return res.status(400).json({
                success: false,
                error: `Platform ${platform} not yet supported`,
            });
        }

        res.json({ success: saved });
    } catch (error: any) {
        console.error('Error saving post:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Get user's curated channels/accounts
 */
router.get('/curated', async (req, res) => {
    try {
        // TODO: Implement fetching curated accounts from database
        res.json({
            success: true,
            accounts: [],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * Debug endpoint to test service connections directly
 */
router.get('/debug', async (req, res) => {
    const results: any = {
        pinterest: { success: false, details: [] },
        youtube: { success: false, details: [] },
        env: {}
    };

    try {
        // Test Pinterest
        try {
            // Check boards explicitly to see if we can access them
            const accessToken = await pinterestService['getAccessToken']();
            if (accessToken) {
                const axios = require('axios');
                const boardsRes = await axios.get('https://api.pinterest.com/v5/boards', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                results.pinterest.boardsCount = boardsRes.data.items?.length || 0;
                results.pinterest.boardNames = boardsRes.data.items?.map((b: any) => b.name) || [];

                const pins = await pinterestService.getFeed(5);
                results.pinterest.success = true;
                results.pinterest.count = pins.length;
                results.pinterest.sample = pins[0]?.title;
            } else {
                results.pinterest.error = "No access token";
            }
        } catch (e: any) {
            results.pinterest.error = e.message;
            results.pinterest.response = e.response?.data;
        }

        // Test YouTube
        try {
            // Check subscriptions explicitly
            const youtube = youtubeService['youtube'];
            if (youtube) {
                const subs = await youtube.subscriptions.list({
                    part: ['snippet'],
                    mine: true,
                    maxResults: 5
                });
                results.youtube.subsCount = subs.data.items?.length || 0;
                results.youtube.subNames = subs.data.items?.map((s: any) => s.snippet?.title) || [];

                const videos = await youtubeService.getSubscriptionFeed(5);
                results.youtube.success = true;
                results.youtube.count = videos.length;
                results.youtube.sample = videos[0]?.title;
            } else {
                results.youtube.error = "YouTube service not initialized";
                // Try to init
                youtubeService['ensureInitialized']();
                if (!youtubeService['youtube']) {
                    results.youtube.error = "Failed to initialize YouTube service (check Google creds)";
                }
            }
        } catch (e: any) {
            results.youtube.error = e.message;
        }

        // Check Env Vars (masked)
        results.env = {
            hasPinterestToken: !!process.env.PINTEREST_ACCESS_TOKEN,
            hasGoogleRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
            googleProjectId: process.env.GOOGLE_CLOUD_PROJECT
        };

        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

