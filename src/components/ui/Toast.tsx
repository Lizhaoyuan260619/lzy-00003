import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import type { ToastType } from '@/types';
import { cn } from '@/lib/utils';

const toastConfig: Record<
  ToastType,
  { icon: typeof CheckCircle2; borderColor: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/50',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
  },
  info: {
    icon: Info,
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-yellow-500/50',
    iconColor: 'text-yellow-400',
  },
};

function ToastContainer() {
  const toasts = useVaultStore((state) => state.toasts);
  const removeToast = useVaultStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              'glass-card animate-slide-up flex min-w-[280px] max-w-[400px] items-start gap-3 border p-4 pr-10',
              config.borderColor
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} />
            <p className="text-sm text-slate-100">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
