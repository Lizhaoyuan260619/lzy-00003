import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import { Shield, Key, Dices, FolderOpen, Settings as SettingsIcon, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';
import ToastContainer from '@/components/ui/Toast';
import Unlock from '@/pages/Unlock';
import Vault from '@/pages/Vault';
import Generator from '@/pages/Generator';
import Categories from '@/pages/Categories';
import Settings from '@/pages/Settings';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { path: '/vault', label: '保险库', icon: <Shield className="w-5 h-5" /> },
  { path: '/generator', label: '密码生成器', icon: <Dices className="w-5 h-5" /> },
  { path: '/categories', label: '分类管理', icon: <FolderOpen className="w-5 h-5" /> },
  { path: '/settings', label: '设置', icon: <SettingsIcon className="w-5 h-5" /> },
];

function ProtectedRoute() {
  const isUnlocked = useVaultStore((state) => state.isUnlocked);
  const location = useLocation();

  if (!isUnlocked) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const lock = useVaultStore((state) => state.lock);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLock = () => {
    lock();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-64 border-r border-white/10 bg-white/[0.02]">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-safety/15 border border-safety/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-safety" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-tight">VaultPass</h1>
              <p className="text-xs text-slate-500">密码管理器</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-safety/15 text-safety'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-safety' : 'group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span className="font-medium flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLock}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-400 hover:bg-danger/10 hover:text-danger transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">锁定保险库</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-vault/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-safety/15 border border-safety/30 flex items-center justify-center">
              <Key className="w-4 h-5 text-safety" />
            </div>
            <span className="font-bold text-slate-100">VaultPass</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="px-3 pb-3 pt-1 space-y-1 border-t border-white/10 animate-fade-in">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-safety/15 text-safety'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLock}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-400 hover:bg-danger/10 hover:text-danger transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">锁定保险库</span>
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 md:pt-0 pt-16">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Unlock />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/vault" element={<Vault />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
