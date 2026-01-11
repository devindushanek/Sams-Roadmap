import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, FileText } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{ id: number; filename: string; score: number }>;
}

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3005/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Received non-JSON response:', text);
                throw new Error(`Server returned ${response.status} ${response.statusText}. Check console for details.`);
            }

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    sources: data.sources
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || 'Chat request failed');
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error.message}. Make sure the server is running and you have configured your LLM credentials.`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-neutral-500 mt-8">
                        <p className="text-lg font-medium mb-2">Chat with your documents</p>
                        <p className="text-sm">Ask questions about your knowledge base and get AI-powered answers with cited sources.</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-800 text-neutral-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-neutral-700">
                                    <p className="text-xs font-semibold mb-2 text-neutral-400">Sources:</p>
                                    <div className="space-y-1">
                                        {message.sources.map((source, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 text-xs text-neutral-300"
                                            >
                                                <FileText size={12} />
                                                <span className="truncate">{source.filename}</span>
                                                <span className="text-neutral-500">
                                                    ({Math.round(source.score * 100)}% match)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-800 rounded-lg p-3">
                            <Loader2 className="animate-spin text-blue-400" size={20} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-neutral-800">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about your documents..."
                        className="flex-1 bg-neutral-800 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Send</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
