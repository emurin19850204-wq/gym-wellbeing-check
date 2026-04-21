'use client';

// ============================================
// 会員一覧画面（Supabase対応版）
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, getRiskLevel } from '@/lib/types';
import { assessmentService } from '@/lib/data-service';
import { Assessment } from '@/lib/types';

interface MemberListProps {
  onSelectMember: (memberId: string) => void;
}

interface MemberWithStatus extends User {
  latestAssessment?: Assessment;
  assessmentCount: number;
}

export default function MemberList({ onSelectMember }: MemberListProps) {
  const { getAllUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // 会員データ取得
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      const users = await getAllUsers();
      
      // 各会員のアセスメント情報を取得
      const membersData = await Promise.all(
        users.map(async (user) => {
          const assessments = await assessmentService.getAssessmentsByUser(user.id);
          return {
            ...user,
            latestAssessment: assessments[0],
            assessmentCount: assessments.length,
          };
        })
      );
      
      setMembers(membersData);
      setLoading(false);
    };
    loadMembers();
  }, [getAllUsers]);

  // 検索フィルター
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    return members.filter(
      (m) => m.name.includes(searchQuery) || m.email.includes(searchQuery)
    );
  }, [members, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3" style={{ color: 'var(--primary-500)' }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">会員一覧</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {members.length}名の会員
          </p>
        </div>
        <div className="relative">
          <input
            id="member-search"
            type="text"
            placeholder="会員名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full sm:w-64"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        </div>
      </div>

      {/* 会員カード一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member, index) => {
          const riskInfo = member.latestAssessment
            ? getRiskLevel(member.latestAssessment.total_score)
            : null;

          return (
            <button
              key={member.id}
              id={`member-card-${member.id}`}
              onClick={() => onSelectMember(member.id)}
              className="card-glass p-5 text-left transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white truncate">{member.name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {member.gender} / {member.birth_date ? `${new Date().getFullYear() - new Date(member.birth_date).getFullYear()}歳` : ''}
                  </p>
                  {member.latestAssessment ? (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="text-xs font-bold px-2 py-1 rounded-md"
                        style={{ backgroundColor: `${riskInfo!.color}20`, color: riskInfo!.color }}>
                        {riskInfo!.label}
                      </div>
                      <span className="text-lg font-bold" style={{ color: riskInfo!.color }}>
                        {member.latestAssessment.total_score}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        未測定
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      📊 {member.assessmentCount}回測定
                    </span>
                    {member.latestAssessment && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {new Date(member.latestAssessment.assessed_at).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg" style={{ color: 'var(--text-muted)' }}>›</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>該当する会員が見つかりません</p>
        </div>
      )}
    </div>
  );
}
