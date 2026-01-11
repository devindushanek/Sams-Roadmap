import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, Search, ChevronLeft, ChevronRight, MessageCircle, Activity } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active, collapsed }: { icon: any, label: string, to: string, active: boolean, collapsed: boolean }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            active
                ? "bg-primary/20 text-primary border-r-2 border-primary"
                : "text-text-secondary hover:bg-surface hover:text-text-primary",
            collapsed && "justify-center px-2"
        )}
        title={collapsed ? label : undefined}
    >
        <Icon size={20} />
        {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
);

export const Layout = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    return (
        <div className="flex h-screen bg-background text-text-primary overflow-hidden">
            {/* Sidebar */}
            <aside className={clsx(
                "bg-surface/50 border-r border-white/5 flex flex-col backdrop-blur-sm transition-all duration-300",
                collapsed ? "w-20" : "w-64"
            )}>
                <div className={clsx("p-6 flex items-center", collapsed ? "justify-center" : "justify-between")}>
                    {!collapsed && (
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Glyph
                        </h1>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 hover:bg-white/10 rounded-lg text-text-secondary transition-colors"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        to="/"
                        active={location.pathname === '/'}
                        collapsed={collapsed}
                    />
                    <SidebarItem
                        icon={Activity}
                        label="System Health"
                        to="/system"
                        active={location.pathname === '/system'}
                        collapsed={collapsed}
                    />
                    <SidebarItem
                        icon={BookOpen}
                        label="Knowledge"
                        to="/knowledge"
                        active={location.pathname.startsWith('/knowledge')}
                        collapsed={collapsed}
                    />
                    <SidebarItem
                        icon={MessageCircle}
                        label="Feed"
                        to="/social"
                        active={location.pathname.startsWith('/social')}
                        collapsed={collapsed}
                    />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        to="/settings"
                        active={location.pathname === '/settings'}
                        collapsed={collapsed}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-surface/30 backdrop-blur-md">
                    <div className="flex items-center bg-surface/50 rounded-full px-4 py-2 border border-white/5 w-96">
                        <Search size={18} className="text-text-secondary mr-3" />
                        <input
                            type="text"
                            placeholder="Search knowledge, tasks, or commands..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full placeholder-text-secondary/50"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Header icons removed as requested */}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-8 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
