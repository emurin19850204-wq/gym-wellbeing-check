'use client';

// ============================================
// 結果サマリー画面（Supabase対応版）
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { assessmentService, questionService, counselingService } from '@/lib/data-service';
import { getRiskLevel, DOMAIN_LABELS, DOMAIN_ICONS, OutputDomain, RISK_LEVELS, User, Assessment, QuestionMaster } from '@/lib/types';
import { QUESTION_MASTER } from '@/lib/questions';
import {
  calculateDomainScores,
  calculateTotalScore,
  getTopRiskDomains,
  getApproachRecommendation,
  generateIssueSheet,
  generateTrainingRecommendation,
  DomainScoreResult,
  AnswerMap,
} from '@/lib/scoring';

interface ResultSummaryProps {
  memberId: string;
  assessmentId: string;
  onBack: () => void;
}

type TabType = 'summary' | 'detail' | 'issues' | 'counseling' | 'training' | 'comparison';

export default function ResultSummary({
  memberId, assessmentId, onBack,
}: ResultSummaryProps) {
  const { getUserById } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [member, setMember] = useState<User | undefined>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [questions, setQuestions] = useState<QuestionMaster[]>([]);
  const [previousScores, setPreviousScores] = useState<DomainScoreResult[]>([]);
  const [previousTotal, setPreviousTotal] = useState<number | undefined>();
  const [previousDate, setPreviousDate] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [memberData, assessData, answersData, qs, allAssess] = await Promise.all([
        getUserById(memberId),
        assessmentService.getAssessment(assessmentId),
        assessmentService.getAnswers(assessmentId),
        questionService.getQuestions(),
        assessmentService.getAssessmentsByUser(memberId),
      ]);
      setMember(memberData);
      setAssessment(assessData);
      setAnswers(answersData);
      setQuestions(qs);

      // 前回アセスメント比較
      const idx = allAssess.findIndex(a => a.id === assessmentId);
      if (idx < allAssess.length - 1) {
        const prev = allAssess[idx + 1];
        const prevAnswers = await assessmentService.getAnswers(prev.id);
        setPreviousScores(calculateDomainScores(qs, prevAnswers));
        setPreviousTotal(prev.total_score);
        setPreviousDate(prev.assessed_at);
      }
      setLoading(false);
    };
    load();
  }, [memberId, assessmentId, getUserById]);

  const scores = useMemo(() => calculateDomainScores(questions, answers), [questions, answers]);
  const totalScore = useMemo(() => calculateTotalScore(scores), [scores]);
  const topRisks = useMemo(() => getTopRiskDomains(scores, 3), [scores]);
  const approach = useMemo(() => getApproachRecommendation(totalScore, topRisks), [totalScore, topRisks]);
  const issueSheet = useMemo(() => generateIssueSheet(scores, topRisks), [scores, topRisks]);
  const trainingRec = useMemo(() => generateTrainingRecommendation(scores, totalScore), [scores, totalScore]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'summary', label: 'サマリー', icon: '📊' },
    { id: 'detail', label: '詳細分析', icon: '🔍' },
    { id: 'issues', label: '課題シート', icon: '📝' },
    { id: 'counseling', label: 'カウンセリング', icon: '💬' },
    { id: 'training', label: 'プログラム提案', icon: '🏋️' },
    { id: 'comparison', label: '再測定比較', icon: '📈' },
  ];

  const exportCSV = () => {
    const header = '領域,スコア,リスクレベル\n';
    const rows = scores.map((s) => `${s.label},${s.normalizedScore},${s.riskLabel}`).join('\n');
    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wellbeing_${member?.name}_${assessment?.assessed_at?.split('T')[0]}.csv`;
    link.click();
  };

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

  return (
    <div className="animate-fade-in-up">
      {/* 戻るボタン & エクスポート */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="back-to-detail"
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span>←</span>
          <span>会員詳細に戻る</span>
        </button>
        <button id="export-csv" onClick={exportCSV} className="btn-secondary text-sm py-2 px-4">
          📥 CSVエクスポート
        </button>
      </div>

      {/* タブナビ */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'text-white shadow-md' : ''
            }`}
            style={
              activeTab === tab.id
                ? { background: 'var(--primary-600)' }
                : { color: 'var(--text-muted)' }
            }
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'summary' && (
        <SummaryTab
          member={member}
          totalScore={totalScore}
          scores={scores}
          topRisks={topRisks}
          approach={approach}
          assessment={assessment}
        />
      )}
      {activeTab === 'detail' && (
        <DetailTab scores={scores} answers={answers} />
      )}
      {activeTab === 'issues' && (
        <IssuesTab issueSheet={issueSheet} member={member} />
      )}
      {activeTab === 'counseling' && (
        <CounselingTab
          approach={approach}
          topRisks={topRisks}
          member={member}
          assessmentId={assessmentId}
        />
      )}
      {activeTab === 'training' && (
        <TrainingTab trainingRec={trainingRec} totalScore={totalScore} topRisks={topRisks} />
      )}
      {activeTab === 'comparison' && (
        <ComparisonTab
          currentScores={scores}
          previousScores={previousScores}
          currentTotal={totalScore}
          previousTotal={previousTotal}
          previousDate={previousDate}
        />
      )}
    </div>
  );
}

// ─── サマリータブ ───
function SummaryTab({ member, totalScore, scores, topRisks, approach, assessment }: {
  member: any; totalScore: number; scores: DomainScoreResult[];
  topRisks: DomainScoreResult[]; approach: any; assessment: any;
}) {
  const riskInfo = getRiskLevel(totalScore);

  return (
    <div className="space-y-6">
      {/* 総合スコア */}
      <div className="card-glass p-6 text-center">
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          {member?.name} さんの総合スコア
        </p>
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-3 relative">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="56" fill="none"
              stroke={riskInfo.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(totalScore / 100) * 351.86} 351.86`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: riskInfo.color }}>{totalScore}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>
        <div
          className="inline-block text-sm font-bold px-4 py-1.5 rounded-full"
          style={{ backgroundColor: `${riskInfo.color}20`, color: riskInfo.color }}
        >
          {riskInfo.label}
        </div>
        {assessment?.assessed_at && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            測定日: {new Date(assessment.assessed_at).toLocaleDateString('ja-JP')}
          </p>
        )}
      </div>

      {/* スコアの見方 */}
      <div className="card-glass p-4">
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          スコアの見方（スコアが高いほど課題が多い）
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RISK_LEVELS.map((level) => (
            <div
              key={level.key}
              className="text-center p-2 rounded-lg"
              style={{ background: `${level.color}15` }}
            >
              <div className="text-xs font-bold" style={{ color: level.color }}>{level.range}</div>
              <div className="text-[10px] mt-0.5" style={{ color: level.color }}>{level.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 重点課題TOP3 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">🚨 重点課題 TOP3</h3>
        <div className="space-y-3">
          {topRisks.map((risk, i) => (
            <div key={risk.domain} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: `${risk.riskColor}20`, color: risk.riskColor }}>
                {i + 1}
              </div>
              <span className="text-xl">{DOMAIN_ICONS[risk.domain as OutputDomain]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{risk.label}</p>
                <div className="progress-bar mt-1">
                  <div className="progress-bar-fill" style={{ width: `${risk.normalizedScore}%`, background: risk.riskColor }} />
                </div>
              </div>
              <span className="text-lg font-bold" style={{ color: risk.riskColor }}>{risk.normalizedScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 接し方の推奨 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-1">💡 推奨される接し方</h3>
        <div className="text-xs mb-3 px-2 py-1 rounded-md inline-block"
          style={{ background: approach.focusType === 'promotion' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: approach.focusType === 'promotion' ? '#10b981' : '#f59e0b' }}>
          {approach.label}
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          「{approach.greeting}」
        </p>
        <div className="space-y-2">
          {approach.suggestions.map((s: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-teal-400 mt-0.5">•</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 全領域レーダー的バー表示 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">📊 全領域スコア</h3>
        <div className="space-y-3">
          {scores.map((score) => (
            <div key={score.domain} className="flex items-center gap-3">
              <span className="text-lg w-8">{DOMAIN_ICONS[score.domain as OutputDomain]}</span>
              <span className="text-xs font-medium w-28 truncate" style={{ color: 'var(--text-secondary)' }}>{score.label}</span>
              <div className="flex-1">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${score.normalizedScore}%`, background: score.riskColor }} />
                </div>
              </div>
              <span className="text-sm font-bold w-8 text-right" style={{ color: score.riskColor }}>{score.normalizedScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 詳細分析タブ ───
function DetailTab({ scores, answers }: { scores: DomainScoreResult[]; answers: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">🔍 領域別 詳細分析</h3>
      {scores.map((score) => {
        const riskInfo = getRiskLevel(score.normalizedScore);
        const domainQuestions = QUESTION_MASTER.filter(
          (q: QuestionMaster) => q.active && q.output_domains.includes(score.domain as OutputDomain)
        );

        return (
          <div key={score.domain} className="card-glass p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{DOMAIN_ICONS[score.domain as OutputDomain]}</span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{score.label}</h4>
                <div className="progress-bar mt-1">
                  <div className="progress-bar-fill" style={{ width: `${score.normalizedScore}%`, background: score.riskColor }} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold" style={{ color: score.riskColor }}>{score.normalizedScore}</div>
                <div className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: `${riskInfo.color}20`, color: riskInfo.color }}>
                  {riskInfo.label}
                </div>
              </div>
            </div>
            {/* 個別回答 */}
            <div className="space-y-2">
              {domainQuestions.map((q: QuestionMaster) => {
                const val = answers[q.id];
                return (
                  <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xs w-5 text-center" style={{ color: 'var(--text-muted)' }}>Q{q.sort_order}</span>
                    <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{q.question_text}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <div key={v} className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold"
                          style={val === v
                            ? { background: v >= 4 ? '#ef4444' : v >= 3 ? '#f59e0b' : '#10b981', color: 'white' }
                            : { background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 課題シートタブ ───
function IssuesTab({ issueSheet, member }: { issueSheet: any; member: any }) {
  return (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📝</span>
          <h3 className="text-lg font-bold text-white">課題シート</h3>
        </div>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>{member?.name} さん</p>

        {/* 重点課題 */}
        <div className="space-y-4 mb-8">
          {issueSheet.issues.map((issue: any, i: number) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--primary-600)', color: 'white' }}>
                  {i + 1}
                </span>
                <h4 className="text-sm font-bold text-white">{issue.domain}</h4>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{issue.issue}</p>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(20,184,166,0.1)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--primary-400)' }}>アクションプラン</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{issue.action}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 生活改善宿題 */}
        <div>
          <h4 className="text-sm font-bold text-white mb-3">🏠 生活改善の宿題</h4>
          <div className="space-y-2">
            {issueSheet.lifestyleHomework.map((hw: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-sm">✅</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{hw}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 次回再評価日 */}
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--accent-500)' }}>📅 推奨再評価時期</p>
          <p className="text-lg font-bold text-white">{issueSheet.nextAssessmentWeeks}週間後</p>
        </div>
      </div>
    </div>
  );
}

// ─── カウンセリングシートタブ ───
function CounselingTab({ approach, topRisks, member, assessmentId }: {
  approach: any; topRisks: DomainScoreResult[]; member: any; assessmentId: string;
}) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await counselingService.saveNote({
      assessment_id: assessmentId,
      user_id: member?.id || '',
      trainer_id: 'trainer-001',
      focus_type: approach.focusType,
      approach_notes: notes,
      homework: '',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💬</span>
          <h3 className="text-lg font-bold text-white">カウンセリングシート</h3>
        </div>

        {/* アプローチ方針 */}
        <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>推奨アプローチ</p>
          <div className="text-xs mb-2 px-2 py-1 rounded-md inline-block"
            style={{ background: approach.focusType === 'promotion' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: approach.focusType === 'promotion' ? '#10b981' : '#f59e0b' }}>
            {approach.label}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            「{approach.greeting}」
          </p>
        </div>

        {/* 声かけポイント */}
        <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>声かけポイント</p>
          <div className="space-y-2">
            {approach.suggestions.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-teal-400 text-sm">💬</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 優先対応エリア */}
        <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-elevated)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>優先対応エリア</p>
          {topRisks.map((risk) => (
            <div key={risk.domain} className="flex items-center gap-2 mb-2">
              <span>{DOMAIN_ICONS[risk.domain as OutputDomain]}</span>
              <span className="text-sm text-white">{risk.label}</span>
              <span className="text-sm font-bold" style={{ color: risk.riskColor }}>{risk.normalizedScore}</span>
            </div>
          ))}
        </div>

        {/* トレーナーメモ */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>📋 トレーナーメモ</p>
          <textarea
            id="counseling-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="カウンセリング中のメモを記入..."
            className="input-field min-h-[120px] resize-none"
            rows={5}
          />
          <button
            id="save-counseling"
            onClick={handleSave}
            className="btn-primary mt-3 text-sm py-2 px-6"
          >
            {saved ? '✅ 保存しました' : '💾 メモを保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── トレーニング方針タブ ───
function TrainingTab({ trainingRec, totalScore, topRisks }: {
  trainingRec: any; totalScore: number; topRisks: DomainScoreResult[];
}) {
  return (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏋️</span>
          <h3 className="text-lg font-bold text-white">プログラム提案</h3>
        </div>

        {/* 推奨パラメータ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>推奨強度</p>
            <p className="text-sm font-bold text-white">{trainingRec.intensity}</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>推奨頻度</p>
            <p className="text-sm font-bold text-white">{trainingRec.frequency}</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>フォーカス</p>
            <p className="text-sm font-bold text-white">{trainingRec.focus}</p>
          </div>
        </div>

        {/* プログラム方針 */}
        <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(20,184,166,0.1)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--primary-400)' }}>📋 プログラム方針</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trainingRec.programNotes}</p>
        </div>

        {/* 注意事項 */}
        {trainingRec.precautions.length > 0 && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#f59e0b' }}>⚠️ 注意事項</p>
            <div className="space-y-1">
              {trainingRec.precautions.map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 text-sm">•</span>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 重点課題に基づく提案 */}
        <div className="mt-6">
          <h4 className="text-sm font-bold text-white mb-3">🎯 重点領域への対応</h4>
          <div className="space-y-3">
            {topRisks.map((risk) => (
              <div key={risk.domain} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-xl">{DOMAIN_ICONS[risk.domain as OutputDomain]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{risk.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    スコア: {risk.normalizedScore} ({risk.riskLabel})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 再測定比較タブ ───
function ComparisonTab({ currentScores, previousScores, currentTotal, previousTotal, previousDate }: {
  currentScores: DomainScoreResult[];
  previousScores: DomainScoreResult[];
  currentTotal: number;
  previousTotal?: number;
  previousDate?: string;
}) {
  if (previousScores.length === 0) {
    return (
      <div className="card-glass p-8 text-center">
        <span className="text-5xl mb-4 block">📈</span>
        <p className="text-lg font-medium text-white mb-2">比較データがありません</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          2回目以降の測定で前回との比較が表示されます
        </p>
      </div>
    );
  }

  const totalDiff = currentTotal - (previousTotal || 0);

  return (
    <div className="space-y-6">
      {/* 総合スコア比較 */}
      <div className="card-glass p-6">
        <h3 className="text-sm font-bold text-white mb-4">📈 総合スコア比較</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>前回</p>
            <p className="text-2xl font-bold" style={{ color: getRiskLevel(previousTotal || 0).color }}>
              {previousTotal}
            </p>
            {previousDate && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(previousDate).toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <span className="text-2xl">{totalDiff < 0 ? '📉' : totalDiff > 0 ? '📈' : '➡️'}</span>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>今回</p>
            <p className="text-2xl font-bold" style={{ color: getRiskLevel(currentTotal).color }}>
              {currentTotal}
            </p>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            totalDiff < 0 ? 'text-emerald-400' : totalDiff > 0 ? 'text-red-400' : 'text-gray-400'
          }`} style={{ background: totalDiff < 0 ? 'rgba(16,185,129,0.15)' : totalDiff > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.15)' }}>
            {totalDiff < 0 ? `${totalDiff} 改善 ✨` : totalDiff > 0 ? `+${totalDiff} 悪化` : '変化なし'}
          </span>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            ※ スコアが低いほど良い状態です
          </p>
        </div>
      </div>

      {/* 領域別比較 */}
      <div className="card-glass p-5">
        <h3 className="text-sm font-bold text-white mb-4">領域別 変化</h3>
        <div className="space-y-3">
          {currentScores.map((current) => {
            const prev = previousScores.find((p) => p.domain === current.domain);
            const diff = prev ? current.normalizedScore - prev.normalizedScore : 0;

            return (
              <div key={current.domain} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{DOMAIN_ICONS[current.domain as OutputDomain]}</span>
                  <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {current.label}
                  </span>
                  {prev && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {prev.normalizedScore}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>
                  <span className="text-sm font-bold" style={{ color: current.riskColor }}>
                    {current.normalizedScore}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-red-400' : 'text-gray-400'
                  }`} style={{
                    background: diff < 0 ? 'rgba(16,185,129,0.15)' : diff > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.15)'
                  }}>
                    {diff < 0 ? `${diff}` : diff > 0 ? `+${diff}` : '±0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
