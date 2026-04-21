'use client';

// ============================================
// 会員詳細画面（Supabase対応版）
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentService, questionService } from '@/lib/data-service';
import { getRiskLevel, DOMAIN_ICONS, OutputDomain, User, Assessment, QuestionMaster } from '@/lib/types';
import {
  calculateDomainScores,
  calculateTotalScore,
  getTopRiskDomains,
  DomainScoreResult,
} from '@/lib/scoring';

interface MemberDetailProps {
  memberId: string;
  onStartAssessment: (memberId: string) => void;
  onViewResult: (memberId: string, assessmentId: string) => void;
  onBack: () => void;
}

export default function MemberDetail({
  memberId, onStartAssessment, onViewResult, onBack,
}: MemberDetailProps) {
  const { getUserById } = useAuth();
  const [member, setMember] = useState<User | undefined>();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [latestScores, setLatestScores] = useState<DomainScoreResult[]>([]);
  const [topRisks, setTopRisks] = useState<DomainScoreResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [memberData, assessData, questions] = await Promise.all([
        getUserById(memberId),
        assessmentService.getAssessmentsByUser(memberId),
        questionService.getQuestions(),
      ]);

      setMember(memberData);
      setAssessments(assessData);

      if (assessData.length > 0) {
        const answers = await assessmentService.getAnswers(assessData[0].id);
        const scores = calculateDomainScores(questions, answers);
        setLatestScores(scores);
        setTopRisks(getTopRiskDomains(scores, 3));
      }
      setLoading(false);
    };
    load();
  }, [memberId, getUserById]);

  const latestAssessment = assessments[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8" style={{ color: 'var(--primary-500)' }} viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!member) {
    return <div className="text-center py-16"><p style={{ color: 'var(--text-secondary)' }}>会員が見つかりません</p></div>;
  }

  const age = member.birth_date ? new Date().getFullYear() - new Date(member.birth_date).getFullYear() : null;

  return (
    <div className="animate-fade-in-up">
      <button id="back-to-list" onClick={onBack} className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>←</span><span>会員一覧に戻る</span>
      </button>

      {/* プロフィール */}
      <div className="card-glass p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{member.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              {member.gender && <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{member.gender}</span>}
              {age && <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{age}歳</span>}
              {member.join_date && <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>入会: {new Date(member.join_date).toLocaleDateString('ja-JP')}</span>}
              <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>📊 {assessments.length}回測定</span>
            </div>
          </div>
          <button id="start-assessment-btn" onClick={() => onStartAssessment(memberId)} className="btn-primary flex items-center gap-2 shrink-0">
            <span>📋</span><span>新規チェック開始</span>
          </button>
        </div>
      </div>

      {/* 最新スコア */}
      {latestAssessment && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card-glass p-5">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>最新 総合スコア</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold" style={{ color: getRiskLevel(latestAssessment.total_score).color }}>{latestAssessment.total_score}</span>
                <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div className="text-xs font-medium mt-2 px-2 py-1 rounded-md inline-block"
                style={{ backgroundColor: `${getRiskLevel(latestAssessment.total_score).color}20`, color: getRiskLevel(latestAssessment.total_score).color }}>
                {getRiskLevel(latestAssessment.total_score).label}
              </div>
            </div>
            <div className="card-glass p-5 md:col-span-2">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>🚨 重点課題 TOP3</p>
              <div className="space-y-2">
                {topRisks.map((risk, i) => (
                  <div key={risk.domain} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                    <span className="text-lg">{DOMAIN_ICONS[risk.domain as OutputDomain]}</span>
                    <span className="text-sm font-medium text-white flex-1">{risk.label}</span>
                    <div className="w-24"><div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${risk.normalizedScore}%`, background: risk.riskColor }} /></div></div>
                    <span className="text-sm font-bold w-10 text-right" style={{ color: risk.riskColor }}>{risk.normalizedScore}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 全領域 */}
          <div className="card-glass p-5 mb-6">
            <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>📊 全領域スコア</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {latestScores.map((score) => {
                const riskInfo = getRiskLevel(score.normalizedScore);
                return (
                  <div key={score.domain} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xl">{DOMAIN_ICONS[score.domain as OutputDomain]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{score.label}</p>
                      <div className="progress-bar mt-1"><div className="progress-bar-fill" style={{ width: `${score.normalizedScore}%`, background: riskInfo.color }} /></div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: riskInfo.color }}>{score.normalizedScore}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 測定履歴 */}
      <div className="card-glass p-5">
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>📅 測定履歴</p>
        {assessments.length > 0 ? (
          <div className="space-y-2">
            {assessments.map((assess) => {
              const riskInfo = getRiskLevel(assess.total_score);
              return (
                <button key={assess.id} id={`assessment-${assess.id}`} onClick={() => onViewResult(memberId, assess.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(assess.assessed_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1" />
                  <div className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${riskInfo.color}20`, color: riskInfo.color }}>{riskInfo.label}</div>
                  <span className="text-lg font-bold" style={{ color: riskInfo.color }}>{assess.total_score}</span>
                  <span style={{ color: 'var(--text-muted)' }}>›</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだ測定データがありません</p></div>
        )}
      </div>
    </div>
  );
}
