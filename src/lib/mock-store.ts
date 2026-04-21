// ============================================
// モック認証・データストア
// Supabase未接続時のデモ用ローカルストア
// ============================================

import { User, Assessment, AssessmentAnswer, DomainScore, CounselingNote, TrainingPlan, ConcernAnswer } from './types';
import { QUESTION_MASTER } from './questions';
import { calculateDomainScores, calculateTotalScore, AnswerMap } from './scoring';

// ============ モックユーザー ============
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    email: 'tanaka@example.com',
    name: '田中 太郎',
    role: 'user',
    phone: '090-1234-5678',
    birth_date: '1985-03-15',
    gender: '男性',
    join_date: '2025-01-10',
    trainer_id: 'trainer-001',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'suzuki@example.com',
    name: '鈴木 花子',
    role: 'user',
    phone: '090-2345-6789',
    birth_date: '1990-07-22',
    gender: '女性',
    join_date: '2025-02-01',
    trainer_id: 'trainer-001',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 'user-003',
    email: 'sato@example.com',
    name: '佐藤 健一',
    role: 'user',
    phone: '090-3456-7890',
    birth_date: '1978-11-05',
    gender: '男性',
    join_date: '2024-11-15',
    trainer_id: 'trainer-001',
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-11-15T00:00:00Z',
  },
  {
    id: 'user-004',
    email: 'yamada@example.com',
    name: '山田 美咲',
    role: 'user',
    phone: '090-4567-8901',
    birth_date: '1995-04-18',
    gender: '女性',
    join_date: '2025-03-01',
    trainer_id: 'trainer-001',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'user-005',
    email: 'kobayashi@example.com',
    name: '小林 大輔',
    role: 'user',
    phone: '090-5678-9012',
    birth_date: '1988-09-30',
    gender: '男性',
    join_date: '2025-01-20',
    trainer_id: 'trainer-001',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

export const MOCK_TRAINERS: User[] = [
  {
    id: 'trainer-001',
    email: 'trainer@example.com',
    name: '村上 トレーナー',
    role: 'trainer',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const MOCK_ADMINS: User[] = [
  {
    id: 'admin-001',
    email: 'admin@example.com',
    name: '管理者',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============ ローカルストア ============

// サンプル回答データの生成
function generateSampleAnswers(): AnswerMap {
  const answers: AnswerMap = {};
  QUESTION_MASTER.forEach((q) => {
    // ランダム回答（1-5）
    answers[q.id] = Math.floor(Math.random() * 5) + 1;
  });
  return answers;
}

// サンプルアセスメントの生成
function generateSampleAssessment(userId: string, date: string, answersOverride?: AnswerMap): {
  assessment: Assessment;
  answers: AnswerMap;
} {
  const answers = answersOverride || generateSampleAnswers();
  const scores = calculateDomainScores(QUESTION_MASTER, answers);
  const totalScore = calculateTotalScore(scores);
  
  return {
    assessment: {
      id: `assess-${userId}-${date}`,
      user_id: userId,
      trainer_id: 'trainer-001',
      assessed_at: date,
      total_score: totalScore,
      status: 'completed',
      created_at: date,
    },
    answers,
  };
}

// ストアクラス
class MockStore {
  private assessments: Map<string, Assessment> = new Map();
  private assessmentAnswers: Map<string, AnswerMap> = new Map();
  private counselingNotes: Map<string, CounselingNote> = new Map();
  private trainingPlans: Map<string, TrainingPlan> = new Map();
  private concerns: Map<string, ConcernAnswer[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // 各ユーザーにサンプルアセスメントを生成
    const dates = ['2025-01-15', '2025-02-15', '2025-03-15'];
    
    MOCK_USERS.forEach((user) => {
      dates.forEach((date, index) => {
        // 時間経過で少し改善するパターン
        const { assessment, answers } = generateSampleAssessment(user.id, date);
        this.assessments.set(assessment.id, assessment);
        this.assessmentAnswers.set(assessment.id, answers);
      });
    });
  }

  // アセスメント取得
  getAssessmentsByUser(userId: string): Assessment[] {
    return Array.from(this.assessments.values())
      .filter((a) => a.user_id === userId)
      .sort((a, b) => new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime());
  }

  getAssessment(assessmentId: string): Assessment | undefined {
    return this.assessments.get(assessmentId);
  }

  getAssessmentAnswers(assessmentId: string): AnswerMap {
    return this.assessmentAnswers.get(assessmentId) || {};
  }

  // 新規アセスメント保存
  saveAssessment(userId: string, answers: AnswerMap): Assessment {
    const now = new Date().toISOString();
    const scores = calculateDomainScores(QUESTION_MASTER, answers);
    const totalScore = calculateTotalScore(scores);
    
    const assessment: Assessment = {
      id: `assess-${userId}-${now}`,
      user_id: userId,
      trainer_id: 'trainer-001',
      assessed_at: now,
      total_score: totalScore,
      status: 'completed',
      created_at: now,
    };

    this.assessments.set(assessment.id, assessment);
    this.assessmentAnswers.set(assessment.id, answers);
    return assessment;
  }

  // カウンセリングノート
  saveCounselingNote(note: CounselingNote) {
    this.counselingNotes.set(note.id, note);
  }

  getCounselingNote(assessmentId: string): CounselingNote | undefined {
    return Array.from(this.counselingNotes.values()).find(
      (n) => n.assessment_id === assessmentId
    );
  }

  // トレーニングプラン
  saveTrainingPlan(plan: TrainingPlan) {
    this.trainingPlans.set(plan.id, plan);
  }

  getTrainingPlan(assessmentId: string): TrainingPlan | undefined {
    return Array.from(this.trainingPlans.values()).find(
      (p) => p.assessment_id === assessmentId
    );
  }

  // 心配事
  saveConcern(userId: string, assessmentId: string, text: string) {
    const concern: ConcernAnswer = {
      id: `concern-${Date.now()}`,
      user_id: userId,
      assessment_id: assessmentId,
      concern_text: text,
      created_at: new Date().toISOString(),
    };
    const list = this.concerns.get(userId) || [];
    list.push(concern);
    this.concerns.set(userId, list);
  }

  getConcerns(userId: string): ConcernAnswer[] {
    return this.concerns.get(userId) || [];
  }

  // 全アセスメント（管理画面用）
  getAllAssessments(): Assessment[] {
    return Array.from(this.assessments.values())
      .sort((a, b) => new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime());
  }
}

// シングルトン
export const mockStore = new MockStore();

// 認証モック
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export function mockLogin(email: string, password: string): User | null {
  // デモ用：パスワードチェックなし
  const allUsers = [...MOCK_USERS, ...MOCK_TRAINERS, ...MOCK_ADMINS];
  return allUsers.find((u) => u.email === email) || null;
}
