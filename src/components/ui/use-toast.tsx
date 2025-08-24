import * as React from 'react';

type ToastType = 'default' | 'destructive' | 'success';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const toast = React.useCallback(({ 
    title, 
    description, 
    variant = 'default', 
    duration = 3000 
  }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, description, type: variant },
    ]);

    if (duration) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
  }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-md shadow-lg ${
              t.type === 'destructive'
                ? 'bg-red-500 text-white'
                : t.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            }`}
          >
            <div className="font-medium">{t.title}</div>
            {t.description && (
              <div className="text-sm">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export const Toaster: React.FC = () => {
  const { toasts } = useToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-md shadow-lg ${
            t.type === 'destructive'
              ? 'bg-red-500 text-white'
              : t.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <div className="font-medium">{t.title}</div>
          {t.description && (
            <div className="text-sm">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};
