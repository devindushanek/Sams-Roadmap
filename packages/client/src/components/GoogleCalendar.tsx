import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

export function GoogleCalendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        // Check auth status first
        axios.get('http://localhost:3005/google/status')
            .then(r => {
                if (r.data.isAuthenticated) {
                    setIsAuth(true);
                    return axios.get('http://localhost:3005/google/calendar');
                }
                return null;
            })
            .then(r => {
                if (r && r.data.success) setEvents(r.data.events);
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
                    <Calendar size={20} className="text-primary" />
                    Google Calendar
                </h2>
                <button
                    onClick={() => {
                        const saved = JSON.parse(localStorage.getItem('dashboardLayout') || '[]');
                        const filtered = saved.filter((l: any) => l.i !== 'calendar');
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
                        <p className="text-sm text-text-secondary mb-3">Connect your Google account to see upcoming events.</p>
                        <button
                            onClick={handleConnect}
                            className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/80 transition-colors"
                        >
                            Connect Google
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-muted text-sm">No upcoming events.</p>
                ) : (
                    <ul className="space-y-3">
                        {events.map(ev => (
                            <li key={ev.id} className="pb-3 border-b border-white/5 last:border-0">
                                <strong className="block text-sm font-medium text-text-primary mb-1">{ev.summary}</strong>
                                <small className="text-xs text-text-secondary block">
                                    {new Date(ev.start?.dateTime || ev.start?.date).toLocaleString(undefined, {
                                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                    })}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
