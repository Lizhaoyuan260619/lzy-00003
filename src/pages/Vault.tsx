import { useState, useMemo } from 'react';
import { Search, Plus, Copy, Eye, EyeOff, Pencil, Trash2, Folder, Globe, Star, StarOff, Zap, Key, Dices, FolderOpen, ArrowRight, XCircle } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import { useGuideStore } from '@/store/useGuideStore';
import GeneratorModal from '@/components/modals/GeneratorModal';

export default function Vault() {
  const { entries, categories, addEntry, updateEntry, deleteEntry, toggleFavorite, showToast } = useVaultStore();
  const { settings, setShowVaultEmptyGuide } = useGuideStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    categoryId: '',
  });

  const favoriteEntries = useMemo(
    () => entries.filter((e) => e.favorite),
    [entries]
  );

  const filteredEntries = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      (e.url ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || e.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (key: string, text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      showToast('success', label ? `${label}已复制` : '已复制到剪贴板');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast('error', '复制失败');
    }
  };

  const openModal = (entry?: typeof entries[0]) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        title: entry.title,
        username: entry.username,
        password: entry.password,
        url: entry.url ?? '',
        notes: entry.notes ?? '',
        categoryId: entry.categoryId ?? '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        categoryId: selectedCategory ?? '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEntry(editingId, formData);
      showToast('success', '密码记录已更新');
    } else {
      addEntry(formData);
      showToast('success', '新密码已添加');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    showToast('success', '密码记录已删除');
  };

  const getCategoryColor = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId)?.color ?? '#64748b';
  };

  const getCategoryName = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId)?.name ?? '未分类';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">我的保险库</h1>
            <p className="text-sm text-slate-400">共 {entries.length} 条密码记录</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal()}
              className="px-4 py-2.5 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加密码
            </button>
          </div>
        </div>

        {favoriteEntries.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-slate-300">常用密码 · 快速复制</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-card p-4 flex items-center gap-3 group hover:border-accent/40 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ backgroundColor: `${getCategoryColor(entry.categoryId)}20`, color: getCategoryColor(entry.categoryId) }}
                  >
                    {entry.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{entry.title}</p>
                    <p className="text-xs text-slate-500 truncate">{entry.username}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(`fav-u-${entry.id}`, entry.username, '用户名')}
                      className="p-1.5 rounded-md text-slate-400 hover:text-safety hover:bg-safety/10 transition-all"
                      title="复制用户名"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(`fav-p-${entry.id}`, entry.password, '密码')}
                      className="p-1.5 rounded-md text-safety hover:bg-safety/10 transition-all"
                      title="复制密码"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-56 space-y-2">
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">分类</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    !selectedCategory ? 'bg-safety/15 text-safety' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id ? 'bg-safety/15 text-safety' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="glass-card p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索密码、用户名或网址..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              entries.length === 0 ? (
                settings.showVaultEmptyGuide ? (
                  <div className="glass-card p-8 animate-fade-in relative">
                    <button
                      type="button"
                      onClick={() => setShowVaultEmptyGuide(false)}
                      className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-md hover:bg-white/5"
                      title="关闭引导"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <div className="text-center mb-6 pr-8">
                      <div className="w-16 h-16 rounded-2xl bg-safety/15 border border-safety/30 flex items-center justify-center mx-auto mb-4">
                        <Key className="w-8 h-8 text-safety" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 mb-1">开始使用 VaultPass</h3>
                      <p className="text-sm text-slate-400">按照以下步骤，快速保存您的第一个账号密码</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => openModal()}
                      >
                        <div className="w-10 h-10 rounded-lg bg-safety/15 flex items-center justify-center shrink-0">
                          <span className="text-safety font-bold text-sm">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">点击「添加密码」按钮</p>
                          <p className="text-xs text-slate-500">填写网站名称、用户名和密码</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-safety transition-colors" />
                      </div>

                      <div
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => openModal()}
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                          <span className="text-accent font-bold text-sm">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">使用密码生成器创建强密码</p>
                          <p className="text-xs text-slate-500">在添加窗口中点击「打开密码生成器」</p>
                        </div>
                        <Dices className="w-4 h-4 text-slate-500 group-hover:text-accent transition-colors" />
                      </div>

                      <div
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => openModal()}
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                          <span className="text-blue-400 font-bold text-sm">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">选择分类，方便后续查找</p>
                          <p className="text-xs text-slate-500">默认已提供社交、金融、工作等分类</p>
                        </div>
                        <FolderOpen className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                          <Star className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-200">设为常用，一键复制</p>
                          <p className="text-xs text-slate-500">添加后点击星标，常用密码会显示在顶部快捷区</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openModal()}
                      className="w-full py-3 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加第一条密码
                    </button>
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">暂无密码记录</h3>
                    <p className="text-sm text-slate-500 mb-4">点击「添加密码」开始管理您的凭证</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => openModal()}
                        className="px-5 py-2 bg-safety hover:bg-safety-hover text-vault font-medium rounded-lg transition-all text-sm"
                      >
                        添加第一条记录
                      </button>
                      <button
                        onClick={() => setShowVaultEmptyGuide(true)}
                        className="px-5 py-2 glass-card hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-all text-sm"
                      >
                        查看使用引导
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="glass-card p-12 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">没有匹配的结果</h3>
                  <p className="text-sm text-slate-500">尝试修改搜索条件或筛选分类</p>
                </div>
              )
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="glass-card glow-border p-5 animate-slide-up"
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-slate-100 truncate">{entry.title}</h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                            style={{
                              backgroundColor: `${getCategoryColor(entry.categoryId)}20`,
                              color: getCategoryColor(entry.categoryId),
                            }}
                          >
                            {getCategoryName(entry.categoryId)}
                          </span>
                          <button
                            onClick={() => toggleFavorite(entry.id)}
                            className="shrink-0 transition-colors"
                            title={entry.favorite ? '取消常用' : '设为常用'}
                          >
                            {entry.favorite ? (
                              <Star className="w-4 h-4 text-accent fill-accent" />
                            ) : (
                              <StarOff className="w-4 h-4 text-slate-500 hover:text-accent" />
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">用户名</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-200 font-mono truncate">
                                {entry.username}
                              </span>
                              <button
                                onClick={() => copyToClipboard(`user-${entry.id}`, entry.username, '用户名')}
                                className="text-slate-500 hover:text-safety transition-colors shrink-0"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">密码</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-200 font-mono truncate">
                                {showPasswords[entry.id] ? entry.password : '•'.repeat(Math.min(entry.password.length, 16))}
                              </span>
                              <button
                                onClick={() => toggleShowPassword(entry.id)}
                                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                              >
                                {showPasswords[entry.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(`pass-${entry.id}`, entry.password, '密码')}
                                className="text-slate-500 hover:text-safety transition-colors shrink-0"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {entry.url && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-slate-500 mb-1">网址</p>
                              <a
                                href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1.5"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                {entry.url}
                              </a>
                            </div>
                          )}
                          {entry.notes && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-slate-500 mb-1">备注</p>
                              <p className="text-sm text-slate-400">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openModal(entry)}
                          className="p-2 rounded-lg text-slate-400 hover:text-safety hover:bg-safety/10 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这条密码记录吗？此操作不可撤销。')) {
                              handleDelete(entry.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="glass-card w-full max-w-lg p-6 animate-slide-up">
              <h2 className="text-xl font-bold text-slate-100 mb-6">
                {editingId ? '编辑密码' : '添加新密码'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">标题 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：GitHub"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">用户名 *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="用户名或邮箱"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">分类</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 transition-all"
                    >
                      <option value="" className="bg-vault">未分类</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-vault">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">密码 *</label>
                    <button
                      type="button"
                      onClick={() => setShowGenerator(true)}
                      className="text-xs text-safety hover:text-safety-hover transition-colors"
                    >
                      打开密码生成器
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 font-mono transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">网址</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="添加备注信息..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 glass-card hover:bg-white/10 text-slate-300 font-medium rounded-lg transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all"
                  >
                    {editingId ? '保存修改' : '添加密码'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <GeneratorModal
          open={showGenerator}
          onClose={() => setShowGenerator(false)}
          onApply={(pwd) => setFormData((prev) => ({ ...prev, password: pwd }))}
        />
      </div>
    </div>
  );
}
