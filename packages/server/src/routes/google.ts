import express from 'express';
import { googleService } from '../services/google';

const router = express.Router();

router.get('/calendar', async (req, res) => {
    try {
        const events = await googleService.getUpcomingEvents();
        res.json({ success: true, events });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await googleService.getTasks();
        res.json({ success: true, tasks });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/auth-url', (req, res) => {
    try {
        const url = googleService.getAuthUrl();
        res.json({ success: true, url });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/status', (req, res) => {
    res.json({ success: true, isAuthenticated: googleService.isAuth() });
});

router.get('/callback', async (req, res) => {
    const code = req.query.code as string;
    if (code) {
        const success = await googleService.handleCallback(code);
        if (success) {
            res.send('<h1>Authentication successful!</h1><p>You can close this window and refresh your dashboard.</p>');
        } else {
            res.status(400).send('<h1>Authentication failed</h1><p>No refresh token received.</p>');
        }
    } else {
        res.status(400).send('<h1>Authentication failed</h1><p>No code received.</p>');
    }
});

export const googleRouter = router;
