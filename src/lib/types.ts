// ============================================
// 型定義ファイル
// ジム ウェルビーイングチェック アプリ
// ============================================

// ロール種別
export type Role = 'user' | 'trainer' | 'admin';

// 出力領域（9領域）
export type OutputDomain =
  | 'mental'
  | 'sleep'
  | 'energy'
  | 'inflammation'
  | 'digestion'
  | 'nutrient'
  | 'cognition'
  | 'recovery'
  | 'training_readiness';

// 出力領域の日本語ラベル
export const DOMAIN_LABELS: Record<OutputDomain, string> = {
  mental: 'メンタル・ストレス',
  sleep: '睡眠の質',
  energy: '活力・エネルギー',
  inflammation: '炎症・痛み',
  digestion: '消化・腸内環境',
  nutrient: '栄養バランス',
  cognition: '集中力・認知',
  recovery: '回復力',
  training_readiness: 'トレーニング準備度',
};

// 出力領域のアイコン
export const DOMAIN_ICONS: Record<OutputDomain, string> = {
  mental: '🧠',
  sleep: '😴',
  energy: '⚡',
  inflammation: '🔥',
  digestion: '🫁',
  nutrient: '🥗',
  cognition: '🎯',
  recovery: '💪',
  training_readiness: '🏋️',
};

// リスクレベル
export type RiskLevel = 'stable' | 'caution' | 'needs_action' | 'priority';

export const RISK_LEVELS: {
  key: RiskLevel;
  label: string;
  range: string;
  color: string;
  bgColor: string;
  min: number;
  max: number;
}[] = [
  { key: 'stable', label: '安定', range: '0-24', color: '#10b981', bgColor: 'bg-emerald-500', min: 0, max: 24 },
  { key: 'caution', label: '注意', range: '25-49', color: '#f59e0b', bgColor: 'bg-amber-500', min: 25, max: 49 },
  { key: 'needs_action', label: '要対応', range: '50-74', color: '#f97316', bgColor: 'bg-orange-500', min: 50, max: 74 },
  { key: 'priority', label: '優先対応', range: '75-100', color: '#ef4444', bgColor: 'bg-red-500', min: 75, max: 100 },
];

// リスクレベル判定
export function getRiskLevel(score: number): typeof RISK_LEVELS[number] {
  if (score <= 24) return RISK_LEVELS[0];
  if (score <= 49) return RISK_LEVELS[1];
  if (score <= 74) return RISK_LEVELS[2];
  return RISK_LEVELS[3];
}

// ユーザー
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  birth_date?: string;
  gender?: string;
  join_date?: string;
  trainer_id?: string;
  created_at: string;
  updated_at: string;
}

// 設問マスタ
export interface QuestionMaster {
  id: number;
  sort_order: number;
  category: string;
  question_text: string;
  output_domains: OutputDomain[];
  weight: number;
  reverse_flag: boolean;
  options: QuestionOption[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// 設問の選択肢
export interface QuestionOption {
  value: number;
  label: string;
}

// デフォルト選択肢（5段階）
export const DEFAULT_OPTIONS: QuestionOption[] = [
  { value: 1, label: 'まったくない' },
  { value: 2, label: 'たまにある' },
  { value: 3, label: 'ときどきある' },
  { value: 4, label: 'よくある' },
  { value: 5, label: 'ほぼ毎日' },
];

// アセスメント（1回の測定）
export interface Assessment {
  id: string;
  user_id: string;
  trainer_id: string;
  assessed_at: string;
  total_score: number;
  status: 'in_progress' | 'completed';
  created_at: string;
}

// 回答
export interface AssessmentAnswer {
  id: string;
  assessment_id: string;
  question_id: number;
  answer_value: number;
  created_at: string;
}

// 領域スコア
export interface DomainScore {
  id: string;
  assessment_id: string;
  domain: OutputDomain;
  raw_score: number;
  normalized_score: number;
  risk_level: RiskLevel;
  created_at: string;
}

// カウンセリングノート
export interface CounselingNote {
  id: string;
  assessment_id: string;
  user_id: string;
  trainer_id: string;
  focus_type: 'promotion' | 'prevention';
  approach_notes: string;
  homework: string;
  next_assessment_date?: string;
  created_at: string;
  updated_at: string;
}

// トレーニングプラン
export interface TrainingPlan {
  id: string;
  assessment_id: string;
  user_id: string;
  trainer_id: string;
  priority_domains: OutputDomain[];
  training_policy: string;
  lifestyle_homework: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 心配事回答（基本情報入力時）
export interface ConcernAnswer {
  id: string;
  user_id: string;
  assessment_id: string;
  concern_text: string;
  created_at: string;
}
