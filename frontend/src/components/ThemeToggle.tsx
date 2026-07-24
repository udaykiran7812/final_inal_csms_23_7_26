import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9, rotate: isDark ? 90 : -90 }}
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border-slate-700/50 glow-amber-pulse'
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200 shadow-sm'
      } ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
