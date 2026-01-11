import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex items-center justify-center bg-background text-text-primary p-8">
                    <div className="glass-card p-8 max-w-lg w-full text-center space-y-4 border-red-500/30">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold">Something went wrong</h2>
                        <p className="text-text-secondary">
                            The application encountered an unexpected error.
                        </p>
                        <div className="bg-black/30 p-4 rounded-lg text-left overflow-auto max-h-48">
                            <code className="text-xs text-red-400 font-mono">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
