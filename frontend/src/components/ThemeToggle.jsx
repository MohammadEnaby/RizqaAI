import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none ${
        isDark 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:shadow-yellow-400/20' 
          : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-gray-400/30'
      }`}
      aria-label="Toggle Theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isDark ? (
          <FiMoon size={24} className="drop-shadow-md" />
        ) : (
          <FiSun size={24} className="drop-shadow-md" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
