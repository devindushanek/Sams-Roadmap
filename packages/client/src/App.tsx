import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { KnowledgePanel } from './components/KnowledgePanel';
import { SocialFeed } from './components/SocialFeed';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SystemHealth } from './components/SystemHealth';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="system" element={<SystemHealth />} />
                        <Route path="knowledge" element={<KnowledgePanel />} />
                        <Route path="social" element={<SocialFeed />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
