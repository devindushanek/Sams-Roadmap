/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                indigo: { 500: '#6366f1', 600: '#4f46e5' },
                slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'waving-wiggle': 'waving-wiggle 0.6s ease-in-out infinite',
            },
            keyframes: {
                'waving-wiggle': {
                    '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
                    '25%': { transform: 'rotate(5deg) scale(1.02)' },
                    '50%': { transform: 'rotate(-3deg) scale(1.05)' },
                    '75%': { transform: 'rotate(4deg) scale(1.02)' },
                }
            }
        },
    },
    plugins: [],
}
