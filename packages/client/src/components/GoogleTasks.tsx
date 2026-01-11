import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckSquare } from 'lucide-react';

export function GoogleTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3005/google/status')
            .then(r => {
                if (r.data.isAuthenticated) {
                    setIsAuth(true);
                    return axios.get('http://localhost:3005/google/tasks');
                }
                return null;
            })
            .then(r => {
                if (r && r.data.success) setTasks(r.data.tasks);
            })
            .catch(console.error);
    }, []);

    const handleConnect = async () => {
        try {
            const res = await axios.get('http://localhost:3005/google/auth-url');
            if (res.data.success) {
                window.open(res.data.url, '_blank');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <section className="glass-card p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 card-title cursor-move">
                    <CheckSquare size={20} className="text-primary" />
                    Google Tasks
                </h2>
                <button
                    onClick={() => {
                        const saved = JSON.parse(localStorage.getItem('dashboardLayout') || '[]');
                        const filtered = saved.filter((l: any) => l.i !== 'tasks');
                        localStorage.setItem('dashboardLayout', JSON.stringify(filtered));
                        window.location.reload();
                    }}
                    className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    title="Hide card"
                >✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!isAuth ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-sm text-text-secondary mb-3">Connect your Google account to see tasks.</p>
                        <button
                            onClick={handleConnect}
                            className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/80 transition-colors"
                        >
                            Connect Google
                        </button>
                    </div>
                ) : tasks.length === 0 ? (
                    <p className="text-muted text-sm">No pending tasks.</p>
                ) : (
                    <ul className="space-y-2">
                        {tasks.map(t => (
                            <li key={t.id} className="py-2 flex items-start gap-3 border-b border-white/5 last:border-0 group">
                                <input
                                    type="checkbox"
                                    checked={t.status === 'completed'}
                                    readOnly
                                    className="mt-1 rounded border-white/20 bg-white/5 checked:bg-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-text-primary group-hover:text-white transition-colors">{t.title}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
