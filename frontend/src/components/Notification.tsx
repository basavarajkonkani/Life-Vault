import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  show, 
  onClose, 
  type = 'success' 
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 
                  type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = type === 'success' ? 'text-green-800' : 
                    type === 'error' ? 'text-red-800' : 'text-blue-800';
  const iconColor = type === 'success' ? 'text-green-400' : 
                    type === 'error' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`max-w-sm w-full ${bgColor} border border-opacity-20 rounded-lg shadow-lg`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${textColor}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`rounded-md inline-flex ${textColor} hover:${textColor.replace('800', '600')} focus:outline-none`}
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification; 