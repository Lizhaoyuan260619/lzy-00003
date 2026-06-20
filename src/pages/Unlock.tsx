import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';

export default function Unlock() {
  const navigate = useNavigate();
  const { isInitialized, unlock, initializeVault } = useVaultStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass-card glow-border p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-safety/15 border border-safety/30 flex items-center justify-center mb-4 animate-pulse-glow">
              <Shield className="w-8 h-8 text-safety" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">VaultPass</h1>
            <p className="text-sm text-slate-400">
              {isInitialized ? '输入主密码解锁保险库' : '设置主密码初始化保险库'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {isInitialized ? '主密码' : '设置主密码'}
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入主密码"
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

            {!isInitialized && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    确认主密码
                  </div>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入主密码"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                  required
                />
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-vault/30 border-t-vault rounded-full animate-spin" />
              ) : isInitialized ? (
                <>解锁保险库</>
              ) : (
                <>初始化保险库</>
              )}
            </button>
          </form>

          {!isInitialized && (
            <p className="mt-6 text-xs text-center text-slate-500 leading-relaxed">
              主密码是解锁您保险库的唯一钥匙，请务必牢记。
              <br />
              我们无法恢复您的主密码。
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          所有数据均在本地加密存储 · AES-256 级加密
        </p>
      </div>
    </div>
  );
}
