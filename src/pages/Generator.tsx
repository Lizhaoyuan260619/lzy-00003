import { useState, useMemo } from 'react';
import { Dices, Copy, RefreshCw, Shield, ShieldAlert, ShieldCheck, Sliders } from 'lucide-react';
import { generatePassword, calculateStrength } from '@/utils/passwordGenerator';
import type { GeneratorOptions } from '@/types';

export default function Generator() {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = () => {
    try {
      const pwd = generatePassword(options);
      setPassword(pwd);
      setHistory((prev) => [pwd, ...prev.slice(0, 9)]);
    } catch {
      setPassword('');
    }
  };

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyHistory = async (pwd: string) => {
    await navigator.clipboard.writeText(pwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strength = useMemo(() => {
    if (!password) {
      return { score: 0, level: 'weak' as const, label: '无', color: 'bg-gray-300' };
    }
    return calculateStrength(password);
  }, [password]);

  const strengthLabel = strength.label;
  const strengthScore = strength.score;
  const strengthColor = strength.color;

  const StrengthIcon = strengthScore <= 40 ? ShieldAlert : strengthScore <= 60 ? Shield : ShieldCheck;

  const textColor = strengthScore <= 40 ? 'text-danger' : strengthScore <= 60 ? 'text-accent' : 'text-safety';

  const toggleOptions = [
    { key: 'uppercase' as const, label: '大写字母 A-Z' },
    { key: 'lowercase' as const, label: '小写字母 a-z' },
    { key: 'numbers' as const, label: '数字 0-9' },
    { key: 'symbols' as const, label: '特殊符号 !@#$' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">密码生成器</h1>
          <p className="text-sm text-slate-400">生成高强度、安全的随机密码</p>
        </div>

        <div className="glass-card glow-border p-6 md:p-8 mb-6 animate-slide-up">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Dices className="w-5 h-5 text-safety" />
              <span className="text-sm font-medium text-slate-300">生成的密码</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 px-5 py-4 bg-vault-100 border border-white/10 rounded-xl flex items-center min-h-[56px]">
                <code className="text-lg md:text-xl font-mono text-slate-100 break-all">
                  {password || '点击下方按钮生成密码'}
                </code>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button
                  onClick={handleGenerate}
                  className="flex-1 sm:flex-none px-5 py-4 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  生成
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!password}
                  className="flex-1 sm:flex-none px-5 py-4 glass-card hover:bg-white/10 text-slate-200 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>

          {password && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StrengthIcon className={`w-5 h-5 ${textColor}`} />
                  <span className="font-medium text-slate-200">密码强度</span>
                </div>
                <span className={`font-semibold ${textColor}`}>{strengthLabel} ({strengthScore}/100)</span>
              </div>
              <div className="h-2 bg-vault-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${strengthScore}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sliders className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-slate-300">配置选项</span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">密码长度</label>
                  <span className="px-2.5 py-0.5 bg-safety/15 text-safety rounded-md text-sm font-mono font-semibold">
                    {options.length}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={options.length}
                  onChange={(e) => setOptions((prev) => ({ ...prev, length: Number(e.target.value) }))}
                  className="w-full h-2 bg-vault-100 rounded-lg appearance-none cursor-pointer accent-safety"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>4</span>
                  <span>32</span>
                  <span>64</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {toggleOptions.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                      options[opt.key]
                        ? 'bg-safety/10 border-safety/30'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`text-sm font-medium ${options[opt.key] ? 'text-safety' : 'text-slate-300'}`}>
                      {opt.label}
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={options[opt.key]}
                        onChange={(e) => setOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                        className="sr-only"
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-all ${
                          options[opt.key] ? 'bg-safety' : 'bg-slate-600'
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                          options[opt.key] ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </label>
                ))}
              </div>

              <label className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border bg-white/5 border-white/10 hover:border-white/20">
                <span className="text-sm text-slate-300">
                  排除易混淆字符 <span className="text-slate-500">(I, l, 1, O, 0, o)</span>
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => setOptions((prev) => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-all ${
                      options.excludeAmbiguous ? 'bg-accent' : 'bg-slate-600'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                      options.excludeAmbiguous ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="glass-card p-6 animate-slide-up">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">生成历史</h3>
            <div className="space-y-2">
              {history.map((pwd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <code className="text-sm font-mono text-slate-400 truncate pr-4">{pwd}</code>
                  <button
                    onClick={() => copyHistory(pwd)}
                    className="shrink-0 p-1.5 text-slate-500 hover:text-safety rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
