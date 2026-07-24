import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-red-950/70 border border-red-500/30 rounded-2xl max-w-md mx-auto my-6 text-center shadow-2xl backdrop-blur-xl"
    >
      <AlertCircle className="w-12 h-12 text-red-400 mb-3 glow-red-pulse" />
      <h3 className="text-base font-extrabold text-white">Error Occurred</h3>
      <p className="text-sm text-red-300 mt-1 mb-5">{message}</p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-red-600/30"
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
