import React, { useState } from 'react';
import { WebviewPanel } from './WebviewPanel';
import { SystemHealthCard } from './SystemHealthCard';

type AppId = 'gmail' | 'calendar' | 'tasks' | 'gemini';

export function Dashboard() {
    const [activeApp, setActiveApp] = useState<AppId>('gmail');

    const apps = [
        {
            id: 'gmail' as AppId,
            title: 'Gmail',
            url: 'https://mail.google.com/mail/u/0/#inbox',
            partition: 'persist:gmail'
        },
        {
            id: 'calendar' as AppId,
            title: 'Google Calendar',
            url: 'https://calendar.google.com/calendar/u/0/r',
            partition: 'persist:gmail'
        },
        {
            id: 'tasks' as AppId,
            title: 'Google Tasks',
            url: 'https://tasks.google.com/embed/?origin=https://calendar.google.com&fullWidth=1',
            partition: 'persist:gmail'
        },
        {
            id: 'gemini' as AppId,
            title: 'Google Gemini',
            url: 'https://gemini.google.com/app',
            partition: 'persist:gmail'
        }
    ];

    const primaryApp = apps.find(app => app.id === activeApp)!;
    const secondaryApps = apps.filter(app => app.id !== activeApp);

    return (
        <div className="h-full w-full overflow-hidden flex flex-col">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#E3E3E3]">Dashboard</h2>
                    <p className="text-[#9AA0A6] text-sm">Workspace Overview</p>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Primary View (Left) */}
                <div className="flex-1 h-full min-w-0">
                    <WebviewPanel
                        title={primaryApp.title}
                        url={primaryApp.url}
                        partition={primaryApp.partition}
                        isPrimary={true}
                        onMakePrimary={() => { }}
                    />
                </div>

                {/* Secondary Views (Right Sidebar) */}
                <div className="w-[400px] flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                    {/* Secondary Apps */}
                    {secondaryApps.map(app => (
                        <div key={app.id} className="flex-1 min-h-[200px]">
                            <WebviewPanel
                                title={app.title}
                                url={app.url}
                                partition={app.partition}
                                isPrimary={false}
                                onMakePrimary={() => setActiveApp(app.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
