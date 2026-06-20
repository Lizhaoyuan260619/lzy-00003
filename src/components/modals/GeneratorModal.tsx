import { useState, useEffect, useCallback } from 'react';
import {
  Type,
  CaseSensitive,
  Hash,
  Asterisk,
  RefreshCw,
  Copy,
  Check,
  X,
} from 'lucide-react';
import type { GeneratorOptions } from '@/types';
import {
  generatePassword,
  calculateStrength,
} from '@/utils/passwordGenerator';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface GeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (pwd: string) => void;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

export default function GeneratorModal({
  open,
  onClose,
  onApply,
}: GeneratorModalProps) {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState('');
  const { copy, copied } = useClipboard();

  const generate = useCallback(() => {
    try {
      const pwd = generatePassword(options);
      setPassword(pwd);
    } catch {
      setPassword('');
    }
  }, [options]);

  useEffect(() => {
    if (open) {
      generate();
    }
  }, [open, generate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const strength = calculateStrength(password);

  const updateOption = <K extends keyof GeneratorOptions>(
    key: K,
    value: GeneratorOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrimaryAction = () => {
    if (!password) return;
    if (onApply) {
      onApply(password);
      onClose();
    } else {
      copy(password);
    }
  };

  const toggleOptions = [
    {
      key: 'uppercase' as const,
      label: '大写',
      icon: Type,
    },
    {
      key: 'lowercase' as const,
      label: '小写',
      icon: CaseSensitive,
    },
    {
      key: 'numbers' as const,
      label: '数字',
      icon: Hash,
    },
    {
      key: 'symbols' as const,
      label: '符号',
      icon: Asterisk,
    },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="glass-card animate-slide-up w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">密码生成器</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-slate-400">生成密码</div>
          <div className="relative rounded-xl border border-white/10 bg-vault-100 p-4 pr-14">
            <code className="block break-all font-mono text-xl text-slate-100">
              {password || '请至少选择一种字符类型'}
            </code>
            <button
              onClick={() => password && copy(password)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
              disabled={!password}
            >
              {copied ? (
                <Check className="h-5 w-5 text-safety" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">密码长度</label>
              <input
                type="number"
                min={8}
                max={64}
                value={options.length}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) {
                    updateOption('length', Math.max(8, Math.min(64, val)));
                  }
                }}
                className="w-16 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-center text-sm font-mono font-semibold text-safety"
              />
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={options.length}
              onChange={(e) => updateOption('length', Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-vault-100 accent-safety"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>8</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              字符类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {toggleOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => updateOption(key, !options[key])}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 transition-all',
                    options[key]
                      ? 'border-safety/30 bg-safety/10 text-safety'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-safety"
              />
              <span className="text-sm text-slate-300">
                排除易混淆字符{' '}
                <span className="text-slate-500">(I, l, 1, O, 0, o)</span>
              </span>
            </div>
          </label>
        </div>

        {password && (
          <div className="mb-5 rounded-xl bg-white/5 p-4 animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">密码强度</span>
              <span className="text-sm font-semibold" style={{ color: strength.level === 'weak' ? '#EF4444' : strength.level === 'medium' ? '#F59E0B' : '#10B981' }}>
                {strength.label} ({strength.score}/100)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-vault-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  strength.color
                )}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={generate}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            重新生成
          </button>
          <button
            onClick={handlePrimaryAction}
            disabled={!password}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors',
              password
                ? 'bg-safety hover:bg-safety-hover'
                : 'cursor-not-allowed bg-slate-600 opacity-50'
            )}
          >
            {onApply ? (
              <>使用此密码</>
            ) : copied ? (
              <>
                <Check className="h-4 w-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                复制密码
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
