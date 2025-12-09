/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen',
                    '"Ubuntu"', '"Cantarell"', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"',
                    'sans-serif'
                ],
            },
            keyframes: {
                fadeInUp: {
                    'from': { opacity: '0', transform: 'translateY(30px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    'from': { opacity: '0', transform: 'translateX(50px)' },
                    'to': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInLeft: {
                    'from': { opacity: '0', transform: 'translateX(-50px)' },
                    'to': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    'from': { opacity: '0', transform: 'scale(0.9)' },
                    'to': { opacity: '1', transform: 'scale(1)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)' },
                },
                float1: {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-20px) scale(1.05)' },
                },
                float2: {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(20px) scale(1.05)' },
                },
                float3: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(15px, -15px) scale(1.1)' },
                    '66%': { transform: 'translate(-10px, 10px) scale(0.95)' },
                },
                'pulse-custom': {
                    '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
                    '50%': { opacity: '0.3', transform: 'scale(1.1)' },
                },
                'bounce-custom': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-4px)' },
                    '75%': { transform: 'translateX(4px)' },
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'slide-in-right': 'slideInRight 0.6s ease-out forwards',
                'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
                'scale-in': 'scaleIn 0.4s ease-out forwards',
                'float1': 'float1 15s infinite ease-in-out',
                'float2': 'float2 18s infinite ease-in-out',
                'float3': 'float3 20s infinite ease-in-out',
                'pulse-custom': 'pulse-custom 8s infinite ease-in-out',
                'bounce-custom': 'bounce-custom 3s infinite ease-in-out',
                'shake': 'shake 0.4s ease-in-out',
            },
        },
    },
    plugins: [
        function ({ addBase }) {
            addBase({
                '*, *::before, *::after': {
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0,
                },
                'html, body': {
                    height: '100%',
                    width: '100%',
                    overflowX: 'hidden',
                    lineHeight: '1.5',
                    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
                    webkitFontSmoothing: 'antialiased',
                    mozOsxFontSmoothing: 'grayscale',
                },
                'img, video, canvas, svg': {
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                },
                'input, button, textarea, select': {
                    font: 'inherit',
                    color: 'inherit',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 0,
                    padding: 0,
                },
                'button': {
                    cursor: 'pointer',
                },
            });
        }
    ],
    corePlugins: {
        preflight: false,
    },
}
