import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto my-4 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <h3 className="text-base font-semibold text-red-800">Error Occurred</h3>
      <p className="text-sm text-red-600 mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
