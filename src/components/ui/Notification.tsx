import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, onClose, duration = 3000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-green-500 text-white px-6 py-3 rounded-md shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-green-100 focus:outline-none"
        >
          <span className="sr-only">Fermer</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
