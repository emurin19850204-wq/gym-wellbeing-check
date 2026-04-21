'use client';

// ============================================
// 管理画面
// 設問マスタの管理、統計ダッシュボード
// ============================================

import React, { useState, useMemo } from 'react';
import { QUESTION_MASTER, CATEGORIES } from '@/lib/questions';
import { MOCK_USERS, mockStore } from '@/lib/mock-store';
import { QuestionMaster, DOMAIN_LABELS, DOMAIN_ICONS, OutputDomain, getRiskLevel } from '@/lib/types';

type AdminTab = 'dashboard' | 'questions' | 'users';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: '統計', icon: '📊' },
    { id: 'questions', label: '設問管理', icon: '📝' },
    { id: 'users', label: 'ユーザー管理', icon: '👥' },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-6">⚙️ 管理画面</h2>

      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={
              activeTab === tab.id
                ? { background: 'var(--primary-600)', color: 'white' }
                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <AdminDashboard />}
      {activeTab === 'questions' && <QuestionManager />}
      {activeTab === 'users' && <UserManager />}
    </div>
  );
}

// ─── 統計ダッシュボード ───
function AdminDashboard() {
  const allAssessments = mockStore.getAllAssessments();
  const highRiskCount = allAssessments.filter((a) => a.total_score >= 75).length;
  const cautionCount = allAssessments.filter((a) => a.total_score >= 50 && a.total_score < 75).length;

  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-white">{MOCK_USERS.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>総会員数</p>
        </div>
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-white">{allAssessments.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>総測定回数</p>
        </div>
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-red-400">{highRiskCount}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>優先対応</p>
        </div>
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{cautionCount}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>要対応</p>
        </div>
      </div>

      {/* 設問数 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">📋 設問マスタ概要</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const count = QUESTION_MASTER.filter((q) => q.category === cat).length;
            return (
              <div key={cat} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-sm font-medium text-white flex-1">{cat}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--primary-400)' }}>{count}問</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          合計: {QUESTION_MASTER.length}問（アクティブ: {QUESTION_MASTER.filter(q => q.active).length}問）
        </p>
      </div>

      {/* 最近の測定 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">📅 最近の測定</h3>
        <div className="space-y-2">
          {allAssessments.slice(0, 10).map((assess) => {
            const user = MOCK_USERS.find((u) => u.id === assess.user_id);
            const riskInfo = getRiskLevel(assess.total_score);
            return (
              <div key={assess.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(assess.assessed_at).toLocaleDateString('ja-JP')}
                </span>
                <span className="text-sm font-medium text-white flex-1">{user?.name || '不明'}</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                  style={{ background: `${riskInfo.color}20`, color: riskInfo.color }}>
                  {assess.total_score} ({riskInfo.label})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 設問管理 ───
function QuestionManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const filteredQuestions = selectedCategory === 'all'
    ? QUESTION_MASTER
    : QUESTION_MASTER.filter((q) => q.category === selectedCategory);

  const handleEdit = (q: QuestionMaster) => {
    setEditingId(q.id);
    setEditText(q.question_text);
  };

  const handleSave = () => {
    // デモ: ローカルのみ（実際はSupabase更新）
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="space-y-4">
      {/* カテゴリフィルタ */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
          style={selectedCategory === 'all'
            ? { background: 'var(--primary-600)', color: 'white' }
            : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          すべて ({QUESTION_MASTER.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            style={selectedCategory === cat
              ? { background: 'var(--primary-600)', color: 'white' }
              : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 設問一覧 */}
      <div className="space-y-2">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="card-glass p-4">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-600)', color: 'white' }}>
                {q.sort_order}
              </span>
              <div className="flex-1">
                {editingId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input-field text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-primary text-xs py-1.5 px-3">保存</button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1.5 px-3">キャンセル</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-white mb-2">{q.question_text}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {q.output_domains.map((d) => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                          {DOMAIN_ICONS[d]} {DOMAIN_LABELS[d]}
                        </span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                        重み: {q.weight}
                      </span>
                      {q.reverse_flag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          逆転項目
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {editingId !== q.id && (
                <button onClick={() => handleEdit(q)} className="text-xs px-2 py-1 rounded-md"
                  style={{ color: 'var(--text-muted)' }}>
                  ✏️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ユーザー管理 ───
function UserManager() {
  return (
    <div className="space-y-4">
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">👥 登録ユーザー</h3>
        <div className="space-y-2">
          {MOCK_USERS.map((user) => {
            const assessments = mockStore.getAssessmentsByUser(user.id);
            return (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{assessments.length}回測定</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user.gender} / {user.birth_date ? `${new Date().getFullYear() - new Date(user.birth_date).getFullYear()}歳` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
