import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Database, Info, Lock, Key, Download, Upload, Trash2, AlertTriangle, CheckCircle2, Eye, EyeOff, Lightbulb, RotateCcw } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import { useGuideStore } from '@/store/useGuideStore';
import { clearAll } from '@/utils/storage';

export default function Settings() {
  const { entries, categories, changeMasterPassword, showToast, exportPlainJSON, importPlainJSON, lock } = useVaultStore();
  const { settings: guideSettings, setShowUnlockIntro, setShowVaultEmptyGuide, setShowSettingsBackupInfo, resetAll: resetGuide } = useGuideStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [showGuideSettings, setShowGuideSettings] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('新密码长度至少为 8 位');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setChangingPassword(true);
    try {
      const success = await changeMasterPassword(oldPassword, newPassword);
      if (success) {
        showToast('success', '主密码修改成功');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowChangePassword(false);
      } else {
        setPasswordError('当前密码不正确');
      }
    } catch {
      setPasswordError('操作失败，请重试');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExport = () => {
    try {
      const json = exportPlainJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaultpass-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', '数据导出成功');
    } catch {
      showToast('error', '导出失败');
    }
    setShowExportConfirm(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const success = importPlainJSON(json);
        if (success) {
          showToast('success', '数据导入成功');
        } else {
          showToast('error', '无效的备份文件格式');
        }
      } catch {
        showToast('error', '无法解析备份文件');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (!resetPassword) return;
    setResetting(true);
    try {
      clearAll();
      lock();
      window.location.reload();
    } catch {
      showToast('error', '重置失败');
    } finally {
      setResetting(false);
    }
  };

  const totalEntries = entries.length;
  const totalCategories = categories.length;
  const lastModified = entries.length > 0
    ? new Date(Math.max(...entries.map((e) => e.updatedAt))).toLocaleDateString('zh-CN')
    : '无数据';

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <SettingsIcon className="w-8 h-8 text-safety" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">设置</h1>
          </div>
          <p className="text-sm text-slate-400">管理您的保险库配置和数据</p>
        </div>

        <div className="space-y-6">
          <div className="glass-card glow-border p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-safety/15 border border-safety/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-safety" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">数据概览</h2>
                <p className="text-xs text-slate-500">您保险库中的数据统计</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <p className="text-2xl font-bold text-slate-100 mb-1">{totalEntries}</p>
                <p className="text-xs text-slate-500">密码记录</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <p className="text-2xl font-bold text-slate-100 mb-1">{totalCategories}</p>
                <p className="text-xs text-slate-500">分类数量</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <p className="text-sm font-semibold text-slate-100 mb-1">{lastModified}</p>
                <p className="text-xs text-slate-500">最近修改</p>
              </div>
            </div>
          </div>

          <div className="glass-card glow-border p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-100">主密码</h2>
                <p className="text-xs text-slate-500">修改解锁保险库的主密码</p>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(!showChangePassword);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setPasswordError('');
                }}
                className="px-4 py-2 bg-accent/15 hover:bg-accent/25 text-accent font-medium rounded-lg transition-all text-sm"
              >
                {showChangePassword ? '收起' : '修改'}
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-white/5 rounded-xl animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">当前密码</label>
                  <div className="relative">
                    <input
                      type={showOldPwd ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 bg-vault-100 border border-white/10 rounded-lg text-slate-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPwd(!showOldPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">新密码</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 bg-vault-100 border border-white/10 rounded-lg text-slate-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">确认新密码</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 bg-vault-100 border border-white/10 rounded-lg text-slate-100 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm animate-fade-in flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {passwordError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 bg-accent hover:bg-accent-hover text-vault font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {changingPassword ? (
                    <div className="w-4 h-4 border-2 border-vault/30 border-t-vault rounded-full animate-spin" />
                  ) : null}
                  确认修改
                </button>
              </form>
            )}
          </div>

          <div className="glass-card glow-border p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">数据备份与恢复</h2>
                <p className="text-xs text-slate-500">导出或导入您的密码数据</p>
              </div>
            </div>

            {guideSettings.showSettingsBackupInfo ? (
              <div className="mb-4 p-4 bg-white/5 rounded-xl space-y-2 relative pr-10">
                <button
                  type="button"
                  onClick={() => setShowSettingsBackupInfo(false)}
                  className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-md hover:bg-white/5"
                  title="关闭提示"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">什么是备份？</span>
                  备份就是把您的所有密码保存成一个文件，存到电脑上。如果浏览器数据丢失，可以用这个文件恢复。
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">导入会怎样？</span>
                  导入会用备份文件中的数据覆盖当前所有密码，请确保文件是最新的。
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSettingsBackupInfo(true)}
                className="w-full mb-4 p-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                显示备份操作说明
              </button>
            )}

            {!showExportConfirm ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setShowExportConfirm(true)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-safety/15 flex items-center justify-center group-hover:bg-safety/25 transition-all">
                      <Download className="w-5 h-5 text-safety" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">导出备份</p>
                      <p className="text-xs text-slate-500">将密码保存为文件下载到电脑</p>
                    </div>
                  </div>
                </button>
                <label className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-all">
                      <Upload className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">导入备份</p>
                      <p className="text-xs text-slate-500">从之前的备份文件恢复数据</p>
                    </div>
                  </div>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="p-4 bg-safety/5 border border-safety/20 rounded-xl animate-fade-in space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-safety" />
                    <div>
                      <p className="font-medium text-slate-200 mb-1">导出说明</p>
                      <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                        <li>导出文件包含您所有的密码明文，未经加密</li>
                        <li>请将文件保存到安全的位置，不要发送给他人</li>
                        <li>建议存放在 U 盘或加密文件夹中</li>
                        <li>文件格式为 JSON，可被本应用识别导入</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportConfirm(false)}
                    className="flex-1 py-2.5 glass-card hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex-1 py-2.5 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all"
                  >
                    确认导出
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-danger/15 border border-danger/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-100">重置保险库</h2>
                <p className="text-xs text-slate-500">清除所有数据并重新初始化</p>
              </div>
              <button
                onClick={() => {
                  setShowResetConfirm(!showResetConfirm);
                  setResetPassword('');
                }}
                className="px-4 py-2 bg-danger/15 hover:bg-danger/25 text-danger font-medium rounded-lg transition-all text-sm"
              >
                {showResetConfirm ? '收起' : '重置'}
              </button>
            </div>

            {showResetConfirm && (
              <div className="space-y-4 p-4 bg-danger/5 border border-danger/20 rounded-xl animate-fade-in">
                <div className="flex items-start gap-3 text-sm text-danger">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>警告：此操作将永久删除所有密码、分类和设置数据，且无法恢复。请确保已导出重要数据备份。</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">输入主密码确认</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-vault-100 border border-white/10 rounded-lg text-slate-100 transition-all"
                    placeholder="请输入主密码以验证身份"
                  />
                </div>
                <button
                  onClick={handleReset}
                  disabled={!resetPassword || resetting}
                  className="w-full py-2.5 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  确认重置所有数据
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '220ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-100">引导提示</h2>
                <p className="text-xs text-slate-500">开启或关闭各页面的使用引导</p>
              </div>
              <button
                onClick={() => setShowGuideSettings(!showGuideSettings)}
                className="px-4 py-2 bg-accent/15 hover:bg-accent/25 text-accent font-medium rounded-lg transition-all text-sm"
              >
                {showGuideSettings ? '收起' : '管理'}
              </button>
            </div>

            {showGuideSettings && (
              <div className="space-y-4 p-4 bg-white/5 rounded-xl animate-fade-in">
                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-200">首次使用提示</p>
                    <p className="text-xs text-slate-500">创建主密码页面的提示信息</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={guideSettings.showUnlockIntro}
                      onChange={(e) => setShowUnlockIntro(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-all ${
                        guideSettings.showUnlockIntro ? 'bg-accent' : 'bg-slate-600'
                      }`}
                    />
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                        guideSettings.showUnlockIntro ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-200">空状态使用引导</p>
                    <p className="text-xs text-slate-500">保险库无数据时的分步指引</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={guideSettings.showVaultEmptyGuide}
                      onChange={(e) => setShowVaultEmptyGuide(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-all ${
                        guideSettings.showVaultEmptyGuide ? 'bg-accent' : 'bg-slate-600'
                      }`}
                    />
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                        guideSettings.showVaultEmptyGuide ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-200">备份操作说明</p>
                    <p className="text-xs text-slate-500">设置页导出/导入的提示信息</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={guideSettings.showSettingsBackupInfo}
                      onChange={(e) => setShowSettingsBackupInfo(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-all ${
                        guideSettings.showSettingsBackupInfo ? 'bg-accent' : 'bg-slate-600'
                      }`}
                    />
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                        guideSettings.showSettingsBackupInfo ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </div>
                </label>

                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      resetGuide();
                      showToast('success', '所有引导已恢复为默认显示');
                    }}
                    className="w-full py-2.5 glass-card hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    恢复所有引导为默认显示
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-100">关于 VaultPass</h2>
                <p className="text-xs text-slate-500">本地加密的密码管理器</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-safety shrink-0" />
                <span>使用 AES-256-GCM 本地加密，所有密码仅存储在您的浏览器中</span>
              </div>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-safety shrink-0" />
                <span>基于 PBKDF2 密钥派生，主密码不以明文形式存储</span>
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-white/5">
                VaultPass v1.0.0 · 请妥善保管您的主密码，我们无法帮您恢复。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
