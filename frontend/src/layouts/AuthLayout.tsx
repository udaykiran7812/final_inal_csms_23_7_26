import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginBackground3D } from '../components/LoginBackground3D';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden text-slate-100 transition-colors duration-300">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* 3D R3F Canvas Background */}
      <LoginBackground3D />

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Card Container */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2 glow-indigo"
            >
              <ShieldCheck className="w-8 h-8" />
            </motion.div>
            <h2 className="text-center text-3xl font-extrabold text-white tracking-tight font-sans">
              Campus Service Portal
            </h2>
            <p className="text-center text-sm text-slate-400 font-medium">
              Sign in to manage service tickets
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800/80 glow-indigo">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AuthLayout;
