import React, { useEffect, useState } from "react";
import {
    Activity, HardDrive, Cpu, Zap, Trash2, RefreshCw, ShieldCheck,
    List, Settings, Battery, Flame, Leaf, CheckCircle, XCircle, Play, Pause,
    Monitor, Lock, Clipboard, Database, Globe, Download, Archive, Info, Power,
    ChevronLeft, ChevronRight, ArrowUpCircle
} from "lucide-react";

interface SystemStats {
    cpu: { brand: string; speed: number; cores: number; load: number; temp: number };
    memory: { total: number; free: number; used: number; active: number; available: number; percentage: number; };
    disk: Array<{ fs: string; type: string; size: number; used: number; use: number; mount: string; }>;
    os?: { platform: string; distro: string; release: string; arch: string; };
    gpu?: { vendor: string; model: string; vram: number; };
}

interface Process {
    name: string;
    pid: number;
    cpu: string;
    mem: string;
    user: string;
    isCritical: boolean;
}

interface Service {
    name: string;
    displayName: string;
    status: string;
}

interface StartupApp {
    name: string;
    command: string;
    location: string;
    user: string;
}

interface UpdateItem {
    name: string;
    id: string;
    version: string;
    newVersion: string;
}

interface JunkCategory {
    id: string;
    name: string;
    path: string;
    size: string;
}

const CircularProgress = ({ value, color, label, icon: Icon }: { value: number, color: string, label: string, icon: any }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-text-secondary/20" />
                    <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-text-primary font-bold text-sm">
                    {value}%
                </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <Icon size={10} /> {label}
            </div>
        </div>
    );
};

const PaginatedTable = ({ data, columns, renderRow, title, icon: Icon }: any) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalPages = Math.ceil(data.length / pageSize);

    const start = (page - 1) * pageSize;
    const currentData = data.slice(start, start + pageSize);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-primary font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                    <Icon size={16} /> {title} ({data.length})
                </h3>
                <div className="flex items-center gap-2 text-xs">
                    <select
                        value={pageSize}
                        onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="bg-surface border border-white/10 rounded px-2 py-1 text-text-primary outline-none focus:border-primary"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-text-secondary">per page</span>
                </div>
            </div>

            <div className="bg-surface/40 rounded-lg border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-text-secondary bg-white/5">
                            <tr>
                                {columns.map((col: string, i: number) => <th key={i} className="py-3 px-4">{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map(renderRow)}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-3 border-t border-white/5 bg-white/5">
                    <div className="text-xs text-text-secondary">
                        Showing {start + 1}-{Math.min(start + pageSize, data.length)} of {data.length}
                    </div>
                    <div className="flex gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-text-primary"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-text-primary"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SystemHealth: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'boost' | 'startup' | 'clean' | 'specs'>('boost');
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [startupApps, setStartupApps] = useState<StartupApp[]>([]);
    const [updates, setUpdates] = useState<UpdateItem[]>([]);
    const [junkCategories, setJunkCategories] = useState<JunkCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [checkingUpdates, setCheckingUpdates] = useState(false);
    const [message, setMessage] = useState("");

    const [selectedPids, setSelectedPids] = useState<number[]>([]);
    const [selectedJunk, setSelectedJunk] = useState<string[]>([]);
    const [tweaks, setTweaks] = useState({ clipboard: true, ram: true, dns: false, telemetry: false, cortana: false });

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3005/system/stats');
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchProcesses = async () => {
        try {
            const res = await fetch('http://localhost:3005/system/processes');
            const data = await res.json();
            if (data.success) setProcesses(data.processes);
        } catch (e) { console.error(e); }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:3005/system/services');
            const data = await res.json();
            if (data.success) setServices(data.services);
        } catch (e) { console.error(e); }
    };

    const fetchStartup = async () => {
        try {
            const res = await fetch('http://localhost:3005/system/startup');
            const data = await res.json();
            if (data.success) setStartupApps(data.apps);
        } catch (e) { console.error(e); }
    };

    const scanJunk = async () => {
        try {
            const res = await fetch('http://localhost:3005/system/scan');
            const data = await res.json();
            if (data.success) {
                setJunkCategories(data.categories);
                setSelectedJunk(data.categories.map((c: any) => c.id));
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchStats();
        fetchProcesses();
        fetchServices();
        fetchStartup();
        scanJunk();
        const interval = setInterval(() => {
            fetchStats();
            if (activeTab === 'boost') {
                fetchProcesses();
                fetchServices();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleBoost = async () => {
        setOptimizing(true);
        try {
            if (tweaks.clipboard) await fetch('http://localhost:3005/system/tweak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'clipboard' }) });
            if (tweaks.dns) await fetch('http://localhost:3005/system/tweak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'dns' }) });
            if (tweaks.telemetry) await fetch('http://localhost:3005/system/tweak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'telemetry' }) });
            if (tweaks.cortana) await fetch('http://localhost:3005/system/tweak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'cortana' }) });
            if (tweaks.ram) await fetch('http://localhost:3005/system/clean-ram', { method: 'POST' });
            for (const pid of selectedPids) {
                await fetch('http://localhost:3005/system/kill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid }) });
            }
            setMessage("System Optimized! RAM Released.");
            setTimeout(() => setMessage(""), 3000);
            fetchStats();
            fetchProcesses();
            setSelectedPids([]);
        } catch (e) { console.error(e); } finally { setOptimizing(false); }
    };

    const handleCleanJunk = async () => {
        setOptimizing(true);
        try {
            for (const id of selectedJunk) {
                await fetch('http://localhost:3005/system/clean-category', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            }
            setMessage("Junk Files Cleaned.");
            setTimeout(() => setMessage(""), 3000);
            scanJunk();
        } catch (e) { console.error(e); } finally { setOptimizing(false); }
    };

    const handleShutdown = async () => {
        if (!confirm("SMART SHUTDOWN:\n\n1. Clean System Junk\n2. Backup to External Drive (if found)\n3. Shutdown PC\n\nAre you sure?")) return;
        try {
            const res = await fetch('http://localhost:3005/system/shutdown', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(data.message + "\n\nLog:\n" + data.log.join('\n'));
            } else {
                alert("Shutdown Error: " + data.error);
            }
        } catch (e) { console.error(e); }
    };

    const handleCheckUpdates = async () => {
        setCheckingUpdates(true);
        try {
            const res = await fetch('http://localhost:3005/system/updates');
            const data = await res.json();
            if (data.success) setUpdates(data.updates);
        } catch (e) { console.error(e); } finally { setCheckingUpdates(false); }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && !stats) return <div className="p-10 text-center text-text-secondary">Loading...</div>;

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Header Stats Dashboard */}
            <div className="flex-none p-6 bg-surface/30 backdrop-blur-sm border-b border-white/10 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary mb-1">System Optimizer</h1>
                        <p className="text-sm text-text-secondary flex items-center gap-2">
                            <Monitor size={14} /> {stats?.cpu.brand}
                        </p>
                    </div>

                    {/* Meters */}
                    <div className="flex items-center gap-6 pl-8 border-l border-white/10">
                        <CircularProgress value={stats?.cpu.load || 0} color="rgb(var(--color-accent))" label="CPU" icon={Cpu} />
                        <CircularProgress value={stats?.memory.percentage || 0} color="rgb(var(--color-primary))" label="RAM" icon={Activity} />
                        <CircularProgress value={stats?.disk[0]?.use || 0} color="#4ade80" label="Disk" icon={HardDrive} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleShutdown}
                        className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/50 font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-2"
                        title="Smart Shutdown"
                    >
                        <Power size={20} />
                    </button>
                    <button
                        onClick={handleBoost}
                        disabled={optimizing}
                        className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center gap-3 transform hover:scale-105 active:scale-95"
                    >
                        {optimizing ? <RefreshCw className="animate-spin" size={24} /> : <Zap className="fill-current" size={24} />}
                        <div className="text-left leading-tight">
                            <div className="text-lg">{optimizing ? 'BOOSTING...' : 'BOOST'}</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex-none flex border-b border-white/10 px-6 bg-surface/20 z-10">
                <button onClick={() => setActiveTab('boost')} className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'boost' ? 'border-green-500 text-green-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                    BOOST
                </button>
                <button onClick={() => setActiveTab('startup')} className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'startup' ? 'border-green-500 text-green-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                    STARTUP
                </button>
                <button onClick={() => setActiveTab('clean')} className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'clean' ? 'border-green-500 text-green-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                    SYSTEM CLEAN
                </button>
                <button onClick={() => setActiveTab('specs')} className={`px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'specs' ? 'border-green-500 text-green-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                    MY RIG
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20"> {/* Added pb-20 to fix footer cut-off */}
                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 animate-fade-in">
                        <CheckCircle size={18} /> {message}
                    </div>
                )}

                {/* BOOST TAB */}
                {activeTab === 'boost' && (
                    <>
                        {/* Specials Section */}
                        <div className="space-y-4">
                            <h3 className="text-primary font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                                <CheckCircle size={16} /> Specials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-surface/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded"><Clipboard size={18} className="text-blue-400" /></div>
                                        <span className="text-text-primary">Clear Clipboard</span>
                                    </div>
                                    <input type="checkbox" checked={tweaks.clipboard} onChange={e => setTweaks({ ...tweaks, clipboard: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                </div>
                                <div className="bg-surface/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded"><Activity size={18} className="text-green-400" /></div>
                                        <span className="text-text-primary">Clean RAM</span>
                                    </div>
                                    <input type="checkbox" checked={tweaks.ram} onChange={e => setTweaks({ ...tweaks, ram: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                </div>
                                <div className="bg-surface/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded"><Globe size={18} className="text-purple-400" /></div>
                                        <span className="text-text-primary">Flush DNS</span>
                                    </div>
                                    <input type="checkbox" checked={tweaks.dns} onChange={e => setTweaks({ ...tweaks, dns: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                </div>
                                <div className="bg-surface/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded"><Lock size={18} className="text-red-400" /></div>
                                        <span className="text-text-primary">Disable Telemetry</span>
                                    </div>
                                    <input type="checkbox" checked={tweaks.telemetry} onChange={e => setTweaks({ ...tweaks, telemetry: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                </div>
                                <div className="bg-surface/40 p-4 rounded-lg flex items-center justify-between border border-white/5 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded"><Monitor size={18} className="text-yellow-400" /></div>
                                        <span className="text-text-primary">Disable Cortana</span>
                                    </div>
                                    <input type="checkbox" checked={tweaks.cortana} onChange={e => setTweaks({ ...tweaks, cortana: e.target.checked })} className="w-5 h-5 accent-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Processes Table */}
                        <PaginatedTable
                            title="Processes"
                            icon={CheckCircle}
                            data={processes}
                            columns={['', 'Process Name', 'Memory', 'CPU']}
                            renderRow={(p: Process) => (
                                <tr key={p.pid} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${p.isCritical ? 'opacity-50' : ''}`}>
                                    <td className="py-2 px-4 w-10">
                                        {!p.isCritical && (
                                            <input
                                                type="checkbox"
                                                checked={selectedPids.includes(p.pid)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedPids([...selectedPids, p.pid]);
                                                    else setSelectedPids(selectedPids.filter(id => id !== p.pid));
                                                }}
                                                className="accent-green-500"
                                            />
                                        )}
                                    </td>
                                    <td className="py-2 px-4 font-medium text-text-primary">{p.name}</td>
                                    <td className="py-2 px-4 text-text-secondary">{p.mem}%</td>
                                    <td className="py-2 px-4 text-text-secondary">{p.cpu}%</td>
                                </tr>
                            )}
                        />

                        {/* Services Table */}
                        <PaginatedTable
                            title="Services"
                            icon={Settings}
                            data={services}
                            columns={['Service Name', 'Status']}
                            renderRow={(s: Service, i: number) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-4 font-medium text-text-primary">{s.displayName}</td>
                                    <td className="py-2 px-4 text-green-400 text-xs uppercase">{s.status}</td>
                                </tr>
                            )}
                        />
                    </>
                )}

                {/* STARTUP TAB */}
                {activeTab === 'startup' && (
                    <PaginatedTable
                        title="Startup Apps"
                        icon={Play}
                        data={startupApps}
                        columns={['Name', 'Command', 'Location']}
                        renderRow={(app: StartupApp, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-2 px-4 font-medium text-text-primary">{app.name}</td>
                                <td className="py-2 px-4 text-text-secondary font-mono text-xs truncate max-w-[200px]">{app.command}</td>
                                <td className="py-2 px-4 text-text-secondary text-xs">{app.location}</td>
                            </tr>
                        )}
                    />
                )}

                {/* CLEAN TAB */}
                {activeTab === 'clean' && (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text-primary">System Clean</h2>
                            <button
                                onClick={handleCleanJunk}
                                disabled={optimizing}
                                className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {optimizing ? <RefreshCw className="animate-spin" /> : <Trash2 />}
                                CLEAN SELECTED
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {junkCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`
                                        p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden group
                                        ${selectedJunk.includes(cat.id) ? 'bg-surface/60 border-green-500/50' : 'bg-surface/30 border-white/5 hover:bg-surface/50'}
                                    `}
                                    onClick={() => {
                                        if (selectedJunk.includes(cat.id)) setSelectedJunk(selectedJunk.filter(id => id !== cat.id));
                                        else setSelectedJunk([...selectedJunk, cat.id]);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${selectedJunk.includes(cat.id) ? 'bg-green-500 text-black' : 'bg-white/5 text-text-secondary'}`}>
                                            {cat.id === 'system' && <Settings size={24} />}
                                            {cat.id === 'app' && <Database size={24} />}
                                            {cat.id === 'browser' && <Globe size={24} />}
                                            {cat.id === 'recycle' && <Trash2 size={24} />}
                                            {cat.id === 'logs' && <Archive size={24} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedJunk.includes(cat.id)}
                                            onChange={() => { }} // Handled by div click
                                            className="w-6 h-6 accent-green-500"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-1">{cat.name}</h3>
                                    <p className="text-text-secondary text-sm">{cat.path}</p>
                                    <div className="mt-4 text-green-400 font-mono text-sm">{cat.size}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* MY RIG TAB */}
                {activeTab === 'specs' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text-primary">System Specifications</h2>
                            <button
                                onClick={handleCheckUpdates}
                                disabled={checkingUpdates}
                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                            >
                                {checkingUpdates ? <RefreshCw className="animate-spin" size={16} /> : <ArrowUpCircle size={16} />}
                                Check for Updates
                            </button>
                        </div>

                        {updates.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <h3 className="text-blue-400 font-bold mb-2">Available Updates</h3>
                                <div className="space-y-2">
                                    {updates.map((u, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-text-primary">{u.name}</span>
                                            <span className="text-text-secondary">{u.version} → {u.newVersion}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/10 pb-2 text-text-primary"><Cpu size={20} className="text-blue-400" /> Processor</h3>
                                <div>
                                    <div className="text-text-secondary text-sm">Model</div>
                                    <div className="text-text-primary font-medium text-lg">{stats?.cpu.brand}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-text-secondary text-sm">Cores</div>
                                        <div className="text-text-primary font-medium">{stats?.cpu.cores}</div>
                                    </div>
                                    <div>
                                        <div className="text-text-secondary text-sm">Temp</div>
                                        <div className="text-text-primary font-medium">{stats?.cpu.temp}°C</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/10 pb-2 text-text-primary"><Activity size={20} className="text-purple-400" /> Memory</h3>
                                <div>
                                    <div className="text-text-secondary text-sm">Total RAM</div>
                                    <div className="text-text-primary font-medium text-lg">{formatBytes(stats?.memory.total || 0)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-text-secondary text-sm">Available</div>
                                        <div className="text-text-primary font-medium">{formatBytes(stats?.memory.available || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-text-secondary text-sm">Used</div>
                                        <div className="text-text-primary font-medium">{formatBytes(stats?.memory.used || 0)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/10 pb-2 text-text-primary"><HardDrive size={20} className="text-green-400" /> Storage</h3>
                                {stats?.disk.map((d, i) => (
                                    <div key={i} className="mb-4 last:mb-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-medium text-text-primary">{d.fs} ({d.type})</div>
                                            <div className="text-sm text-text-secondary">{d.use}%</div>
                                        </div>
                                        <div className="w-full bg-surface rounded-full h-2 overflow-hidden mb-1">
                                            <div className="bg-green-400 h-full" style={{ width: `${d.use}%` }}></div>
                                        </div>
                                        <div className="text-xs text-text-secondary">{formatBytes(d.used)} used of {formatBytes(d.size)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/10 pb-2 text-text-primary"><Monitor size={20} className="text-yellow-400" /> Graphics & OS</h3>
                                <div>
                                    <div className="text-text-secondary text-sm">GPU</div>
                                    <div className="text-text-primary font-medium">{stats?.gpu?.vendor} {stats?.gpu?.model}</div>
                                    <div className="text-xs text-text-secondary">{stats?.gpu?.vram} MB VRAM</div>
                                </div>
                                <div>
                                    <div className="text-text-secondary text-sm">OS</div>
                                    <div className="text-text-primary font-medium">{stats?.os?.distro} {stats?.os?.release}</div>
                                    <div className="text-xs text-text-secondary">{stats?.os?.arch}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
