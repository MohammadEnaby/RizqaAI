import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-200 
                ${theme === 'dark'
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md border border-gray-200'} 
                ${className}`}
            aria-label="Toggle Dark Mode"
        >
            {theme === 'dark' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </motion.button>
    );
};

export default ThemeToggle;
