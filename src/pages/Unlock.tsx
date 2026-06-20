import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, KeyRound, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import { calculateStrength } from '@/utils/passwordGenerator';

export default function Unlock() {
  const navigate = useNavigate();
  const { isInitialized, unlock, initializeVault } = useVaultStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    if (!password) return null;
    return calculateStrength(password);
  }, [password]);

  const passwordChecks = useMemo(() => {
    if (isInitialized || !password) return null;
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      match: confirmPassword.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isInitialized) {
        const success = await unlock(password);
        if (success) {
          navigate('/vault');
        } else {
          setError('主密码错误，请重试');
        }
      } else {
        if (password.length < 8) {
          setError('主密码长度至少为 8 位');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        await initializeVault(password);
        navigate('/vault');
      }
    } catch {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ ok, text }: { ok: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {ok ? (
        <Check className="w-3.5 h-3.5 text-safety shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
      )}
      <span className={ok ? 'text-safety' : 'text-slate-500'}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass-card glow-border p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-safety/15 border border-safety/30 flex items-center justify-center mb-4 animate-pulse-glow">
              <Shield className="w-8 h-8 text-safety" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">VaultPass</h1>
            <p className="text-sm text-slate-400">
              {isInitialized ? '输入主密码解锁保险库' : '欢迎使用，开始设置您的主密码'}
            </p>
          </div>

          {!isInitialized && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-300">首次使用提示</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    主密码是保护您所有密码的唯一钥匙，请选择一个您能记住、但别人猜不到的强密码。
                    如果忘记主密码，将无法恢复任何数据。
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {isInitialized ? '主密码' : '设置主密码（至少 8 位）'}
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isInitialized ? '请输入主密码' : '输入一个强密码'}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isInitialized && password.length > 0 && strength && (
              <div className="animate-fade-in space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">密码强度</span>
                    <span className={`text-xs font-semibold ${
                      strength.level === 'weak' ? 'text-danger' : strength.level === 'medium' ? 'text-accent' : 'text-safety'
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-vault-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
                {passwordChecks && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-white/5 rounded-lg">
                    <CheckItem ok={passwordChecks.minLength} text="至少 8 个字符" />
                    <CheckItem ok={passwordChecks.hasUpper} text="包含大写字母" />
                    <CheckItem ok={passwordChecks.hasLower} text="包含小写字母" />
                    <CheckItem ok={passwordChecks.hasNumber} text="包含数字" />
                  </div>
                )}
              </div>
            )}

            {!isInitialized && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    再次输入主密码
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入确认"
                    className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-lg text-slate-100 placeholder-slate-500 transition-all ${
                      confirmPassword.length > 0
                        ? password === confirmPassword
                          ? 'border-safety/50'
                          : 'border-danger/50'
                        : 'border-white/10'
                    }`}
                    required
                  />
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <Check className="w-5 h-5 text-safety" />
                      ) : (
                        <X className="w-5 h-5 text-danger" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isInitialized && password !== confirmPassword && confirmPassword.length > 0)}
              className="w-full py-3 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-vault/30 border-t-vault rounded-full animate-spin" />
              ) : isInitialized ? (
                <>解锁保险库</>
              ) : (
                <>创建保险库并进入</>
              )}
            </button>
          </form>

          {!isInitialized && (
            <div className="mt-6 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                💡 <span className="text-slate-400">建议</span>：使用 12 位以上、混合大小写和数字的密码。
                <br />
                您也可以稍后在「密码生成器」中生成高强度密码。
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          所有数据均在本地加密存储 · AES-256-GCM 加密
        </p>
      </div>
    </div>
  );
}
