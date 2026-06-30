import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

// Shadcn-style config object accepted by toast()
interface ToastConfig {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | string;
  duration?: number;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Accept either the plain-string API or the shadcn {title,description,variant} API
type ToastArg = string | ToastConfig;

interface ToastContextType {
  toast: (arg: ToastArg, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((arg: ToastArg, type: ToastType = 'info', duration: number = 3000) => {
    let message: string;
    let resolvedType = type;
    let resolvedDuration = duration;

    if (typeof arg === 'object' && arg !== null) {
      // shadcn-style: { title, description, variant, duration }
      const parts = [arg.title, arg.description].filter(Boolean);
      message = parts.join(' — ') || 'Notification';
      if (arg.variant === 'destructive') resolvedType = 'error';
      if (arg.duration !== undefined) resolvedDuration = arg.duration;
    } else {
      message = arg as string;
    }

    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type: resolvedType, duration: resolvedDuration }]);

    if (duration !== Infinity) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = (msg: string, dur?: number) => addToast(msg, 'success', dur);
  const error = (msg: string, dur?: number) => addToast(msg, 'error', dur);
  const info = (msg: string, dur?: number) => addToast(msg, 'info', dur);
  const warning = (msg: string, dur?: number) => addToast(msg, 'warning', dur);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  };

  return (
    <div className={cn(
      "pointer-events-auto flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
      "w-[350px] max-w-[90vw]"
    )}>
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button 
        onClick={onRemove}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
