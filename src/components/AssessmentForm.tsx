'use client';

// ============================================
// 50問チェック画面（Supabase対応版）
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { questionService, assessmentService } from '@/lib/data-service';
import { QuestionMaster } from '@/lib/types';
import { AnswerMap } from '@/lib/scoring';

interface AssessmentFormProps {
  memberId: string;
  onComplete: (assessmentId: string) => void;
  onCancel: () => void;
}

const QUESTIONS_PER_PAGE = 5;

export default function AssessmentForm({ memberId, onComplete, onCancel }: AssessmentFormProps) {
  const { getUserById, user } = useAuth();
  const [memberName, setMemberName] = useState('');
  const [questions, setQuestions] = useState<QuestionMaster[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [concernText, setConcernText] = useState('');
  const [loading, setLoading] = useState(true);

  // データ取得
  useEffect(() => {
    const load = async () => {
      const [member, qs] = await Promise.all([
        getUserById(memberId),
        questionService.getQuestions(),
      ]);
      setMemberName(member?.name || '');
      setQuestions(qs.filter(q => q.active).sort((a, b) => a.sort_order - b.sort_order));
      setLoading(false);
    };
    load();
  }, [memberId, getUserById]);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const trainerId = user?.id || 'trainer-001';
    const assessment = await assessmentService.saveAssessment(
      memberId, trainerId, answers, concernText
    );
    setIsSubmitting(false);
    if (assessment) {
      onComplete(assessment.id);
    }
  };

  const isAllAnswered = answeredCount >= questions.length;
  const isLastPage = currentPage === totalPages - 1;

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
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">ウェルビーイングチェック</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{memberName} さん</p>
        </div>
        <button id="cancel-assessment" onClick={onCancel} className="btn-secondary text-sm py-2 px-4">中断</button>
      </div>

      {/* プログレスバー */}
      <div className="card-glass p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>進捗: {answeredCount}/{questions.length}問</span>
          <span className="text-xs font-bold" style={{ color: 'var(--primary-400)' }}>{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--primary-500), var(--accent-500))' }} />
        </div>
        <div className="flex items-center justify-center gap-1 mt-3">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)}
              className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
              style={i === currentPage ? { background: 'var(--primary-600)', color: 'white' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* カテゴリーヘッダー */}
      {currentQuestions[0] && (
        <div className="mb-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'var(--primary-600)', color: 'white' }}>
            {currentQuestions[0].category}
          </span>
        </div>
      )}

      {/* 設問カード */}
      <div className="space-y-4">
        {currentQuestions.map((question, index) => {
          const globalIndex = currentPage * QUESTIONS_PER_PAGE + index;
          const selectedValue = answers[question.id];
          return (
            <div key={question.id} className="card-glass p-5 animate-slide-in" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="flex gap-3 mb-4">
                <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--primary-600)', color: 'white' }}>{globalIndex + 1}</span>
                <p className="text-sm font-medium text-white leading-relaxed">{question.question_text}</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {question.options.map((option) => (
                  <button key={option.value} id={`q${question.id}-opt${option.value}`}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`py-3 px-1 rounded-xl text-center transition-all duration-200 ${selectedValue === option.value ? 'scale-105 shadow-lg' : ''}`}
                    style={selectedValue === option.value
                      ? { background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))', color: 'white', border: '2px solid var(--primary-400)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '2px solid transparent' }}>
                    <div className="text-lg font-bold mb-1">{option.value}</div>
                    <div className="text-[10px] leading-tight">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 心配事入力（最終ページ） */}
      {isLastPage && (
        <div className="card-glass p-5 mt-4">
          <p className="text-sm font-medium text-white mb-3">💬 現在の心配事や気になること（任意）</p>
          <textarea id="concern-text" value={concernText} onChange={(e) => setConcernText(e.target.value)}
            placeholder="最近気になっていること、トレーナーに伝えたいことなど..." className="input-field min-h-[100px] resize-none" rows={4} />
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <button id="prev-page" onClick={handlePrev} disabled={currentPage === 0} className="btn-secondary py-3 px-6 disabled:opacity-30">← 前へ</button>
        {isLastPage ? (
          <button id="submit-assessment" onClick={handleSubmit} disabled={!isAllAnswered || isSubmitting}
            className="btn-primary py-3 px-8 flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? (
              <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>送信中...</span></>
            ) : (
              <><span>✅</span><span>結果を見る</span></>
            )}
          </button>
        ) : (
          <button id="next-page" onClick={handleNext} className="btn-primary py-3 px-8">次へ →</button>
        )}
      </div>
    </div>
  );
}
