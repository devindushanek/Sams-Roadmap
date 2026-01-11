import { useState, useEffect } from 'react';
import { Save, MessageSquare, Terminal, Play, StopCircle, RefreshCw, Palette } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

const THEMES = {
    dark: {
        name: 'Dark',
        colors: {
            '--bg-background': '10 10 10',
            '--bg-surface': '30 30 30',
            '--color-primary': '139 92 246',
            '--color-secondary': '148 163 184',
            '--color-accent': '56 189 248',
            '--text-primary': '240 240 240',
            '--text-secondary': '160 160 160',
        }
    },
    tokyo: {
        name: 'Tokyo Night',
        colors: {
            '--bg-background': '26 27 38',
            '--bg-surface': '36 40 59',
            '--color-primary': '122 162 247',
            '--color-secondary': '86 95 137',
            '--color-accent': '125 207 255',
            '--text-primary': '192 202 245',
            '--text-secondary': '154 165 206',
        }
    },
    light: {
        name: 'Light',
        colors: {
            '--bg-background': '255 255 255',
            '--bg-surface': '241 245 249',
            '--color-primary': '99 102 241',
            '--color-secondary': '148 163 184',
            '--color-accent': '14 165 233',
            '--text-primary': '15 23 42',
            '--text-secondary': '100 116 139',
        }
    },
    solarized: {
        name: 'Solarized Light',
        colors: {
            '--bg-background': '253 246 227',
            '--bg-surface': '238 232 213',
            '--color-primary': '38 139 210',
            '--color-secondary': '147 161 161',
            '--color-accent': '42 161 152',
            '--text-primary': '101 123 131',
            '--text-secondary': '88 110 117',
        }
    }
};

export const Settings = () => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gemini-1.5-flash');
    const [provider, setProvider] = useState('gemini');
    const [feedback, setFeedback] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState('');
    const [currentTheme, setCurrentTheme] = useState('dark');

    // Action Panel State
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // Load theme from local storage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('glyph-theme') || 'dark';
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (themeKey: string) => {
        const theme = THEMES[themeKey as keyof typeof THEMES];
        if (theme) {
            const root = document.documentElement;
            Object.entries(theme.colors).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }
    };

    const handleThemeChange = (themeKey: string) => {
        setCurrentTheme(themeKey);
        localStorage.setItem('glyph-theme', themeKey);
        applyTheme(themeKey);
    };

    const fetchLogs = () => {
        fetch('http://localhost:3005/logs?limit=50')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLogs(data.logs);
                }
            })
            .catch(err => console.error('Failed to fetch logs:', err));
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const toggleExecution = () => {
        setIsRunning(!isRunning);
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('http://localhost:3005/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, model, apiKey }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Settings saved successfully!');
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Failed to save settings.');
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            const res = await fetch('http://localhost:3005/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: 5, comment: feedback }),
            });
            const data = await res.json();
            if (data.success) {
                setFeedbackStatus('Feedback submitted!');
                setFeedback('');
                setTimeout(() => setFeedbackStatus(''), 3000);
            }
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <h2 className="text-2xl font-bold">Settings & Configuration</h2>

            {/* Theme Selection */}
            <div className="glass-card p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/5 pb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Appearance
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(THEMES).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => handleThemeChange(key)}
                            className={`group relative flex flex-col gap-3 outline-none`}
                        >
                            <div className={`
                                relative w-full aspect-[4/3] rounded-lg border-2 transition-all duration-200 overflow-hidden shadow-xl
                                ${currentTheme === key ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-white/10 hover:border-white/30'}
                            `}
                                style={{ backgroundColor: `rgb(${theme.colors['--bg-background'].split(' ').join(',')})` }}
                            >
                                {/* Mini IDE UI */}
                                <div className="absolute inset-0 flex">
                                    {/* Sidebar */}
                                    <div className="w-1/4 h-full border-r border-white/5 flex flex-col gap-2 p-2" style={{ backgroundColor: `rgb(${theme.colors['--bg-surface'].split(' ').join(',')})` }}>
                                        <div className="w-3/4 h-1.5 rounded-full opacity-20 bg-current" style={{ color: `rgb(${theme.colors['--text-primary'].split(' ').join(',')})` }}></div>
                                        <div className="w-1/2 h-1.5 rounded-full opacity-20 bg-current" style={{ color: `rgb(${theme.colors['--text-primary'].split(' ').join(',')})` }}></div>
                                        <div className="w-2/3 h-1.5 rounded-full opacity-20 bg-current" style={{ color: `rgb(${theme.colors['--text-primary'].split(' ').join(',')})` }}></div>
                                    </div>
                                    {/* Main Content */}
                                    <div className="flex-1 p-3 flex flex-col gap-2">
                                        {/* Header */}
                                        <div className="w-1/3 h-2 rounded-md mb-1 opacity-10 bg-current" style={{ color: `rgb(${theme.colors['--text-primary'].split(' ').join(',')})` }}></div>

                                        {/* Code Lines */}
                                        <div className="flex gap-1">
                                            <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--color-primary'].split(' ').join(',')})` }}></div>
                                            <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--text-secondary'].split(' ').join(',')})` }}></div>
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--color-accent'].split(' ').join(',')})` }}></div>
                                            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--text-primary'].split(' ').join(',')})` }}></div>
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--color-secondary'].split(' ').join(',')})` }}></div>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.colors['--color-primary'].split(' ').join(',')})` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm font-medium transition-colors ${currentTheme === key ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                {theme.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* General Configuration */}
            <div className="glass-card p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/5 pb-4">LLM Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-text-secondary">Provider</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 outline-none focus:border-primary transition-colors"
                        >
                            <option value="gemini">Google Gemini (Primary)</option>
                            <option value="ollama">Ollama (Offline)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-text-secondary">Model</label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 outline-none focus:border-primary transition-colors"
                        >
                        </input>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-text-secondary">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Leave empty to keep current key"
                            className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSaveSettings}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Action Center (Moved from separate panel) */}
            <div className="glass-card flex flex-col overflow-hidden h-[500px]">
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-2">
                        <Terminal size={20} className="text-text-secondary" />
                        <h3 className="text-lg font-semibold">System Logs & Actions</h3>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchLogs}
                            className="p-2 bg-surface/50 hover:bg-surface rounded-lg border border-white/5 transition-colors"
                            title="Refresh Logs"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={toggleExecution}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                }`}
                        >
                            {isRunning ? <><StopCircle size={18} /> Stop Agent</> : <><Play size={18} /> Start Agent</>}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 bg-[#0d1117]">
                    {logs.length === 0 ? (
                        <div className="text-center opacity-30 py-10">No logs available</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="text-text-secondary hover:text-text-primary transition-colors border-b border-white/5 pb-1 mb-1 last:border-0">
                                <span className="opacity-50 mr-2 text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={
                                    log.level === 'ERROR' ? 'text-red-400 font-bold' :
                                        log.level === 'WARN' ? 'text-yellow-400 font-bold' :
                                            'text-blue-400 font-bold'
                                }>[{log.level}]</span> <span className="text-gray-300">{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Feedback & Learning */}
            <div className="glass-card p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b border-white/5 pb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Feedback & Learning
                </h3>
                <p className="text-sm text-text-secondary">
                    Help the agent improve by providing feedback on its recent actions.
                </p>

                <div className="space-y-4">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Describe what went well or what needs improvement..."
                        className="w-full h-32 bg-surface/50 border border-white/10 rounded-lg p-4 outline-none focus:border-primary transition-colors resize-none"
                    ></textarea>

                    <div className="flex justify-between items-center">
                        <span className="text-green-500 text-sm">{feedbackStatus}</span>
                        <button
                            onClick={handleSubmitFeedback}
                            className="bg-surface hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
