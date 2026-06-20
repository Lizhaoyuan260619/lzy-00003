import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="glass-card animate-slide-up w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-slate-100">{title}</h3>
        <p className="mb-6 text-sm text-slate-300">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-safety text-white hover:bg-safety-hover'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
