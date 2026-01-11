import { Router } from 'express';
import { systemService } from '../services/system';

const router = Router();

router.get('/stats', async (req, res) => {
    try {
        const stats = await systemService.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

router.get('/processes', async (req, res) => {
    try {
        const processes = await systemService.getProcesses();
        res.json({ success: true, processes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch processes' });
    }
});

router.get('/services', async (req, res) => {
    try {
        const services = await systemService.getServices();
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch services' });
    }
});

router.post('/kill', async (req, res) => {
    const { pid } = req.body;
    if (!pid) return res.status(400).json({ success: false, error: 'PID required' });
    try {
        const result = await systemService.killProcess(pid);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/power', async (req, res) => {
    const { mode } = req.body;
    try {
        const result = await systemService.setPowerMode(mode);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/tweak', async (req, res) => {
    const { id } = req.body;
    try {
        const result = await systemService.applyTweak(id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/clean-ram', async (req, res) => {
    try {
        const result = await systemService.cleanRAM();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/scan', async (req, res) => {
    try {
        const result = await systemService.scanJunk();
        res.json({ success: true, categories: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/clean-category', async (req, res) => {
    const { id } = req.body;
    try {
        const result = await systemService.cleanJunkCategory(id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Legacy optimize endpoint (for the "Boost" button)
router.post('/optimize', async (req, res) => {
    try {
        // Aggressive boost: Clean RAM + Temp
        await systemService.cleanRAM();
        await systemService.cleanJunkCategory('system');
        res.json({ success: true, result: { freed: 'Memory Optimized' } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Optimization failed' });
    }
});

router.get('/startup', async (req, res) => {
    try {
        const apps = await systemService.getStartupApps();
        res.json({ success: true, apps });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/startup-toggle', async (req, res) => {
    const { name, enable } = req.body;
    try {
        const result = await systemService.toggleStartup(name, enable);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/shutdown', async (req, res) => {
    try {
        const result = await systemService.smartShutdown();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/updates', async (req, res) => {
    try {
        const updates = await systemService.checkForUpdates();
        res.json({ success: true, updates });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export const systemRouter = router;
