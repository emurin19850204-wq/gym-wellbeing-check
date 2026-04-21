'use client';

// ============================================
// ナビゲーション
// サイドバー（PC）+ ボトムバー（モバイル）
// ============================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ViewType } from './Dashboard';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { user, logout } = useAuth();

  // ナビゲーション項目
  const navItems: { id: ViewType; label: string; icon: string; roles: string[] }[] = [
    { id: 'member-list', label: '会員一覧', icon: '👥', roles: ['trainer', 'admin'] },
    { id: 'admin', label: '管理画面', icon: '⚙️', roles: ['admin'] },
  ];

  // ロールに応じたフィルタリング
  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const roleLabel = user?.role === 'trainer' ? 'トレーナー' : user?.role === 'admin' ? '管理者' : '会員';

  return (
    <>
      {/* デスクトップ サイドバー */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-40"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)' }}>
        {/* ロゴ */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <span className="text-lg">💪</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">ウェルビーイング</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>チェックシステム</p>
          </div>
        </div>

        {/* ナビ項目 */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${currentView === item.id
                  ? 'text-white shadow-md'
                  : 'hover:bg-white/5'
                }`}
              style={
                currentView === item.id
                  ? { background: 'linear-gradient(135deg, var(--primary-700), var(--primary-800))', color: 'white' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ユーザー情報 */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="card-glass p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
              </div>
            </div>
            <button
              id="logout-button"
              onClick={logout}
              className="w-full text-xs py-2 rounded-lg transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* モバイル トップバー */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm">💪</span>
          </div>
          <span className="text-sm font-bold text-white">ウェルビーイングチェック</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            {roleLabel}
          </span>
          <button onClick={logout} className="text-xs px-2 py-1 rounded-md" style={{ color: 'var(--text-muted)' }}>
            ログアウト
          </button>
        </div>
      </header>

      {/* モバイル ボトムナビ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-4"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)' }}>
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              currentView === item.id ? 'scale-105' : ''
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`text-xs font-medium ${
              currentView === item.id ? 'text-teal-400' : ''
            }`} style={currentView !== item.id ? { color: 'var(--text-muted)' } : {}}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* モバイル用のスペーサー */}
      <div className="lg:hidden h-14" />
    </>
  );
}
