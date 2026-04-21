// ============================================
// データサービス層
// Supabase接続時は実DB、未接続時はモックストアを使用
// ============================================

import { supabase, isSupabaseConfigured } from './supabase';
import { User, Assessment, QuestionMaster, OutputDomain, CounselingNote, TrainingPlan } from './types';
import { QUESTION_MASTER } from './questions';
import {
  AnswerMap,
  calculateDomainScores,
  calculateTotalScore,
  DomainScoreResult,
} from './scoring';
import { mockStore, MOCK_USERS, MOCK_TRAINERS, MOCK_ADMINS, mockLogin } from './mock-store';

// ============================================
// 認証サービス
// ============================================
export const authService = {
  // ログイン
  async login(email: string, password: string): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockLogin(email, password);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    // プロフィール取得
    const profile = await profileService.getProfile(data.user.id);
    return profile;
  },

  // ログアウト
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  // 現在のユーザー取得
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return profileService.getProfile(user.id);
  },

  // ユーザー登録（管理者用）
  async signUp(email: string, password: string, name: string, role: string): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (error || !data.user) return null;
    return profileService.getProfile(data.user.id);
  },
};

// ============================================
// プロフィールサービス
// ============================================
export const profileService = {
  // プロフィール取得
  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) {
      return [...MOCK_USERS, ...MOCK_TRAINERS, ...MOCK_ADMINS].find(u => u.id === userId) || null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email || '',
      name: data.name,
      role: data.role,
      phone: data.phone,
      birth_date: data.birth_date,
      gender: data.gender,
      join_date: data.join_date,
      trainer_id: data.trainer_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  // 全会員取得（トレーナー/管理者用）
  async getAllMembers(): Promise<User[]> {
    if (!isSupabaseConfigured || !supabase) {
      return MOCK_USERS;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('name');

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      email: d.email || '',
      name: d.name,
      role: d.role,
      phone: d.phone,
      birth_date: d.birth_date,
      gender: d.gender,
      join_date: d.join_date,
      trainer_id: d.trainer_id,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  },

  // プロフィール更新
  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    return !error;
  },
};

// ============================================
// 設問マスタサービス
// ============================================
export const questionService = {
  // 全設問取得
  async getQuestions(): Promise<QuestionMaster[]> {
    if (!isSupabaseConfigured || !supabase) {
      return QUESTION_MASTER;
    }

    const { data, error } = await supabase
      .from('question_master')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error || !data) return QUESTION_MASTER;

    return data.map((d: any) => ({
      id: d.id,
      sort_order: d.sort_order,
      category: d.category,
      question_text: d.question_text,
      output_domains: d.output_domains as OutputDomain[],
      weight: parseFloat(d.weight),
      reverse_flag: d.reverse_flag,
      options: d.options || [
        { value: 1, label: 'まったくない' },
        { value: 2, label: 'たまにある' },
        { value: 3, label: 'ときどきある' },
        { value: 4, label: 'よくある' },
        { value: 5, label: 'ほぼ毎日' },
      ],
      active: d.active,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  },

  // 設問更新（管理者用）
  async updateQuestion(id: number, updates: Partial<QuestionMaster>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return true;

    const { error } = await supabase
      .from('question_master')
      .update({
        question_text: updates.question_text,
        category: updates.category,
        output_domains: updates.output_domains,
        weight: updates.weight,
        reverse_flag: updates.reverse_flag,
        active: updates.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  },
};

// ============================================
// アセスメントサービス
// ============================================
export const assessmentService = {
  // ユーザーのアセスメント一覧取得
  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getAssessmentsByUser(userId);
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessed_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      trainer_id: d.trainer_id,
      assessed_at: d.assessed_at,
      total_score: d.total_score,
      status: d.status,
      created_at: d.created_at,
    }));
  },

  // アセスメント取得
  async getAssessment(assessmentId: string): Promise<Assessment | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getAssessment(assessmentId) || null;
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      trainer_id: data.trainer_id,
      assessed_at: data.assessed_at,
      total_score: data.total_score,
      status: data.status,
      created_at: data.created_at,
    };
  },

  // 回答取得
  async getAnswers(assessmentId: string): Promise<AnswerMap> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getAssessmentAnswers(assessmentId);
    }

    const { data, error } = await supabase
      .from('assessment_answers')
      .select('question_id, answer_value')
      .eq('assessment_id', assessmentId);

    if (error || !data) return {};

    const answers: AnswerMap = {};
    data.forEach((d: any) => {
      answers[d.question_id] = d.answer_value;
    });
    return answers;
  },

  // 新規アセスメント保存
  async saveAssessment(
    userId: string,
    trainerId: string,
    answers: AnswerMap,
    concernText?: string
  ): Promise<Assessment | null> {
    if (!isSupabaseConfigured || !supabase) {
      const assessment = mockStore.saveAssessment(userId, answers);
      if (concernText?.trim()) {
        mockStore.saveConcern(userId, assessment.id, concernText.trim());
      }
      return assessment;
    }

    // 設問取得
    const questions = await questionService.getQuestions();

    // スコア計算
    const scores = calculateDomainScores(questions, answers);
    const totalScore = calculateTotalScore(scores);

    // アセスメントを作成
    const { data: assessData, error: assessError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        trainer_id: trainerId,
        total_score: totalScore,
        status: 'completed',
      })
      .select()
      .single();

    if (assessError || !assessData) return null;

    // 回答を一括挿入
    const answerRows = Object.entries(answers).map(([qId, value]) => ({
      assessment_id: assessData.id,
      question_id: parseInt(qId),
      answer_value: value,
    }));

    await supabase.from('assessment_answers').insert(answerRows);

    // 領域スコアを保存
    const domainRows = scores.map((s) => ({
      assessment_id: assessData.id,
      domain: s.domain,
      raw_score: s.rawScore,
      normalized_score: s.normalizedScore,
      risk_level: s.riskLevel,
    }));

    await supabase.from('domain_scores').insert(domainRows);

    // 心配事を保存
    if (concernText?.trim()) {
      await supabase.from('concern_answers').insert({
        user_id: userId,
        assessment_id: assessData.id,
        concern_text: concernText.trim(),
      });
    }

    return {
      id: assessData.id,
      user_id: assessData.user_id,
      trainer_id: assessData.trainer_id,
      assessed_at: assessData.assessed_at,
      total_score: assessData.total_score,
      status: assessData.status,
      created_at: assessData.created_at,
    };
  },

  // 全アセスメント取得（管理者用）
  async getAllAssessments(): Promise<Assessment[]> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getAllAssessments();
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('assessed_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      trainer_id: d.trainer_id,
      assessed_at: d.assessed_at,
      total_score: d.total_score,
      status: d.status,
      created_at: d.created_at,
    }));
  },
};

// ============================================
// カウンセリングノートサービス
// ============================================
export const counselingService = {
  // 保存
  async saveNote(note: Omit<CounselingNote, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      mockStore.saveCounselingNote({
        ...note,
        id: `note-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return true;
    }

    const { error } = await supabase.from('counseling_notes').upsert({
      assessment_id: note.assessment_id,
      user_id: note.user_id,
      trainer_id: note.trainer_id,
      focus_type: note.focus_type,
      approach_notes: note.approach_notes,
      homework: note.homework,
      next_assessment_date: note.next_assessment_date,
    });

    return !error;
  },

  // 取得
  async getNote(assessmentId: string): Promise<CounselingNote | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getCounselingNote(assessmentId) || null;
    }

    const { data, error } = await supabase
      .from('counseling_notes')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error || !data) return null;
    return data as CounselingNote;
  },
};

// ============================================
// トレーニングプランサービス
// ============================================
export const trainingPlanService = {
  // 保存
  async savePlan(plan: Omit<TrainingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      mockStore.saveTrainingPlan({
        ...plan,
        id: `plan-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return true;
    }

    const { error } = await supabase.from('training_plans').upsert({
      assessment_id: plan.assessment_id,
      user_id: plan.user_id,
      trainer_id: plan.trainer_id,
      priority_domains: plan.priority_domains,
      training_policy: plan.training_policy,
      lifestyle_homework: plan.lifestyle_homework,
      notes: plan.notes,
    });

    return !error;
  },

  // 取得
  async getPlan(assessmentId: string): Promise<TrainingPlan | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockStore.getTrainingPlan(assessmentId) || null;
    }

    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (error || !data) return null;
    return data as TrainingPlan;
  },
};
