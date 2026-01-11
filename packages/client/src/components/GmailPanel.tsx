import React from 'react';

// Add type definition for webview
declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: any;
        }
    }
}

export function GmailPanel() {
    // Check if running in Electron
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');

    if (!isElectron) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#1E1E1E] rounded-xl text-[#E3E3E3] p-6 text-center border border-[#313236]">
                <div className="w-16 h-16 bg-[#313236] rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#E3E3E3]" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Desktop App Required</h3>
                <p className="text-[#9AA0A6] mb-6 max-w-md">
                    To embed the full Gmail interface directly in your dashboard, you must run this as a desktop application.
                    Google's security policies prevent embedding Gmail in a standard web browser.
                </p>
                <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-[#0B57D0] text-white rounded-full hover:bg-[#0B57D0]/90 font-medium transition-colors"
                >
                    Open Gmail in New Tab
                </a>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#1E1E1E] rounded-xl overflow-hidden flex flex-col border border-[#313236]">
            {/* Minimal Header */}
            <div className="h-8 px-4 flex items-center justify-between bg-[#2D2E30] border-b border-[#313236]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                </div>
                <span className="text-xs text-[#9AA0A6] font-medium">Gmail</span>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            {/* Webview for Full Gmail Experience */}
            <div className="flex-1 relative">
                <webview
                    src="https://mail.google.com/mail/u/0/#inbox"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    partition="persist:gmail" // Persist session
                    allowpopups="true"
                />
            </div>
        </div>
    );
}
