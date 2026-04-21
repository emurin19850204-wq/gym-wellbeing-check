'use client';

// ============================================
// ログインページ
// プレミアムなダークテーマのログイン画面
// ============================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 少し遅延でリアル感を演出
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(email, password);
    if (!success) {
      setError('メールアドレスが見つかりません');
    }
    setIsLoading(false);
  };

  // クイックログインボタン
  const quickLogin = (email: string) => {
    setEmail(email);
    login(email, '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 gradient-bg" />
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--primary-500), transparent)' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--accent-500), transparent)' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-lg">
            <span className="text-3xl">💪</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ウェルビーイングチェック
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            パーソナルトレーニングジム専用
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="card-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                メールアドレス
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                パスワード
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              id="login-button"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>ログイン中...</span>
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* クイックアクセス（デモ用） */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
              デモ用クイックログイン
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="quick-login-trainer"
                onClick={() => quickLogin('trainer@example.com')}
                className="btn-secondary text-xs py-2 px-3 text-center"
              >
                🏋️ トレーナー
              </button>
              <button
                id="quick-login-member"
                onClick={() => quickLogin('tanaka@example.com')}
                className="btn-secondary text-xs py-2 px-3 text-center"
              >
                👤 会員
              </button>
              <button
                id="quick-login-admin"
                onClick={() => quickLogin('admin@example.com')}
                className="btn-secondary text-xs py-2 px-3 text-center"
              >
                ⚙️ 管理者
              </button>
            </div>
          </div>
        </div>

        {/* フッター */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          ※ 医療診断アプリではありません
        </p>
      </div>
    </div>
  );
}
