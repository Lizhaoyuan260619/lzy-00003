import { useState } from 'react';
import { FolderPlus, Pencil, Trash2, X, Check, Palette, Tag } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';

const PRESET_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function Categories() {
  const { categories, entries, addCategory, updateCategory, deleteCategory } = useVaultStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: PRESET_COLORS[0] });

  const getEntryCount = (categoryId: string) => {
    return entries.filter((e) => e.categoryId === categoryId).length;
  };

  const openModal = (category?: typeof categories[0]) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, color: category.color ?? PRESET_COLORS[0] });
    } else {
      setEditingId(null);
      setFormData({ name: '', color: PRESET_COLORS[0] });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateCategory(editingId, formData);
    } else {
      addCategory(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const count = getEntryCount(id);
    const msg = count > 0
      ? `该分类下有 ${count} 条记录，删除后这些记录将变为未分类。确定删除吗？`
      : '确定要删除这个分类吗？';
    if (confirm(msg)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">分类管理</h1>
            <p className="text-sm text-slate-400">管理您的密码分类，让保险库更有条理</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-safety hover:bg-safety-hover text-vault font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            新建分类
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="glass-card glow-border p-5 animate-slide-up group"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Tag className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100">{cat.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getEntryCount(cat.id)} 条记录
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-safety hover:bg-safety/10 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-vault-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((getEntryCount(cat.id) / Math.max(entries.length, 1)) * 100, 100)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 glass-card p-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1">暂无分类</h3>
              <p className="text-sm text-slate-500 mb-4">点击「新建分类」开始组织您的密码</p>
              <button
                onClick={() => openModal()}
                className="px-5 py-2 bg-safety hover:bg-safety-hover text-vault font-medium rounded-lg transition-all text-sm"
              >
                创建第一个分类
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="glass-card w-full max-w-md p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-100">
                  {editingId ? '编辑分类' : '新建分类'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">分类名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：社交媒体"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 transition-all"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      选择颜色
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                          formData.color === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-vault scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formData.color === color && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
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
                    {editingId ? '保存修改' : '创建分类'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
