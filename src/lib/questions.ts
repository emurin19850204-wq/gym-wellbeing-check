// ============================================
// 50問 設問マスタデータ
// パーソナルトレーニングジム向けウェルビーイングチェック
// ============================================

import { QuestionMaster, DEFAULT_OPTIONS } from './types';

// 設問マスタ初期データ
export const QUESTION_MASTER: QuestionMaster[] = [
  // ─── メンタル・ストレス (1-6) ───
  {
    id: 1, sort_order: 1, category: 'メンタル・ストレス',
    question_text: '最近、気分が沈んだり憂うつに感じることがありますか？',
    output_domains: ['mental'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 2, sort_order: 2, category: 'メンタル・ストレス',
    question_text: 'イライラしたり、怒りっぽくなることがありますか？',
    output_domains: ['mental'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 3, sort_order: 3, category: 'メンタル・ストレス',
    question_text: '仕事や日常のプレッシャーを強く感じていますか？',
    output_domains: ['mental', 'energy'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 4, sort_order: 4, category: 'メンタル・ストレス',
    question_text: '趣味や好きなことへの興味が薄れていますか？',
    output_domains: ['mental', 'cognition'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 5, sort_order: 5, category: 'メンタル・ストレス',
    question_text: '人と会うのが面倒に感じることがありますか？',
    output_domains: ['mental'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 6, sort_order: 6, category: 'メンタル・ストレス',
    question_text: '将来に対して不安を感じることがありますか？',
    output_domains: ['mental'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 睡眠の質 (7-12) ───
  {
    id: 7, sort_order: 7, category: '睡眠の質',
    question_text: '寝つきが悪いと感じることがありますか？',
    output_domains: ['sleep'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 8, sort_order: 8, category: '睡眠の質',
    question_text: '夜中に何度も目が覚めることがありますか？',
    output_domains: ['sleep', 'recovery'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 9, sort_order: 9, category: '睡眠の質',
    question_text: '朝起きたときに疲れが残っていると感じますか？',
    output_domains: ['sleep', 'energy', 'recovery'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 10, sort_order: 10, category: '睡眠の質',
    question_text: '寝る前にスマホを長時間見ていますか？',
    output_domains: ['sleep', 'cognition'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 11, sort_order: 11, category: '睡眠の質',
    question_text: '睡眠時間が6時間未満の日が多いですか？',
    output_domains: ['sleep', 'recovery'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 12, sort_order: 12, category: '睡眠の質',
    question_text: '日中に強い眠気を感じることがありますか？',
    output_domains: ['sleep', 'energy'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 活力・エネルギー (13-17) ───
  {
    id: 13, sort_order: 13, category: '活力・エネルギー',
    question_text: '朝から体が重くてだるいと感じますか？',
    output_domains: ['energy', 'recovery'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 14, sort_order: 14, category: '活力・エネルギー',
    question_text: '午後になると集中力が大きく落ちますか？',
    output_domains: ['energy', 'cognition'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 15, sort_order: 15, category: '活力・エネルギー',
    question_text: '休日も疲れが取れない感じがしますか？',
    output_domains: ['energy', 'recovery'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 16, sort_order: 16, category: '活力・エネルギー',
    question_text: '階段を上ると息切れしやすいですか？',
    output_domains: ['energy', 'training_readiness'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 17, sort_order: 17, category: '活力・エネルギー',
    question_text: 'カフェインに頼らないとやっていけないと感じますか？',
    output_domains: ['energy', 'nutrient'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 炎症・痛み (18-23) ───
  {
    id: 18, sort_order: 18, category: '炎症・痛み',
    question_text: '関節の痛みやこわばりを感じることがありますか？',
    output_domains: ['inflammation', 'training_readiness'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 19, sort_order: 19, category: '炎症・痛み',
    question_text: '頭痛が頻繁に起こりますか？',
    output_domains: ['inflammation', 'mental'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 20, sort_order: 20, category: '炎症・痛み',
    question_text: '肩こりや腰痛に悩んでいますか？',
    output_domains: ['inflammation', 'training_readiness'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 21, sort_order: 21, category: '炎症・痛み',
    question_text: '肌荒れやアレルギー症状が気になりますか？',
    output_domains: ['inflammation', 'nutrient'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 22, sort_order: 22, category: '炎症・痛み',
    question_text: '体のどこかにむくみを感じことがありますか？',
    output_domains: ['inflammation', 'digestion'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 23, sort_order: 23, category: '炎症・痛み',
    question_text: '運動後に痛みが長く続くことがありますか？',
    output_domains: ['inflammation', 'recovery'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 消化・腸内環境 (24-29) ───
  {
    id: 24, sort_order: 24, category: '消化・腸内環境',
    question_text: 'お腹の張りやガスが気になりますか？',
    output_domains: ['digestion'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 25, sort_order: 25, category: '消化・腸内環境',
    question_text: '便秘や下痢になりやすいですか？',
    output_domains: ['digestion', 'nutrient'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 26, sort_order: 26, category: '消化・腸内環境',
    question_text: '食後に胃もたれや不快感がありますか？',
    output_domains: ['digestion'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 27, sort_order: 27, category: '消化・腸内環境',
    question_text: '食欲にムラがある（食べすぎ・食欲不振）ですか？',
    output_domains: ['digestion', 'nutrient', 'mental'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 28, sort_order: 28, category: '消化・腸内環境',
    question_text: '発酵食品や食物繊維をあまり摂っていないですか？',
    output_domains: ['digestion', 'nutrient'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 29, sort_order: 29, category: '消化・腸内環境',
    question_text: '口臭や体臭が気になることがありますか？',
    output_domains: ['digestion'], weight: 0.6, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 栄養バランス (30-35) ───
  {
    id: 30, sort_order: 30, category: '栄養バランス',
    question_text: '1日の食事が2食以下になることが多いですか？',
    output_domains: ['nutrient', 'energy'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 31, sort_order: 31, category: '栄養バランス',
    question_text: '野菜をあまり食べない日が多いですか？',
    output_domains: ['nutrient'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 32, sort_order: 32, category: '栄養バランス',
    question_text: 'タンパク質（肉・魚・豆）の摂取量が少ないと思いますか？',
    output_domains: ['nutrient', 'recovery', 'training_readiness'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 33, sort_order: 33, category: '栄養バランス',
    question_text: '甘いものやスナック菓子をよく食べますか？',
    output_domains: ['nutrient', 'inflammation'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 34, sort_order: 34, category: '栄養バランス',
    question_text: '水分摂取量が1日1リットル未満ですか？',
    output_domains: ['nutrient', 'energy'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 35, sort_order: 35, category: '栄養バランス',
    question_text: 'アルコールを週に3日以上飲みますか？',
    output_domains: ['nutrient', 'sleep', 'recovery'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 集中力・認知 (36-40) ───
  {
    id: 36, sort_order: 36, category: '集中力・認知',
    question_text: '物忘れが増えたと感じますか？',
    output_domains: ['cognition'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 37, sort_order: 37, category: '集中力・認知',
    question_text: '仕事中にボーっとしたり集中が途切れやすいですか？',
    output_domains: ['cognition', 'energy'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 38, sort_order: 38, category: '集中力・認知',
    question_text: '決断力が落ちていると感じますか？',
    output_domains: ['cognition', 'mental'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 39, sort_order: 39, category: '集中力・認知',
    question_text: 'マルチタスクがうまくこなせないと感じますか？',
    output_domains: ['cognition'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 40, sort_order: 40, category: '集中力・認知',
    question_text: '読書や学習に集中できない時間が増えましたか？',
    output_domains: ['cognition', 'mental'], weight: 0.8, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── 回復力 (41-45) ───
  {
    id: 41, sort_order: 41, category: '回復力',
    question_text: '筋肉痛が以前より長引くようになりましたか？',
    output_domains: ['recovery', 'training_readiness'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 42, sort_order: 42, category: '回復力',
    question_text: '風邪をひきやすい、または治りにくいですか？',
    output_domains: ['recovery', 'nutrient'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 43, sort_order: 43, category: '回復力',
    question_text: '傷や打撲の回復が遅いと感じますか？',
    output_domains: ['recovery', 'inflammation'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 44, sort_order: 44, category: '回復力',
    question_text: '同じトレーニングなのに前より疲れやすいですか？',
    output_domains: ['recovery', 'training_readiness', 'energy'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 45, sort_order: 45, category: '回復力',
    question_text: 'トレーニング翌日に体調を崩すことがありますか？',
    output_domains: ['recovery', 'training_readiness'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },

  // ─── トレーニング準備度 (46-50) ───
  {
    id: 46, sort_order: 46, category: 'トレーニング準備度',
    question_text: 'トレーニングへのモチベーションが下がっていますか？',
    output_domains: ['training_readiness', 'mental'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 47, sort_order: 47, category: 'トレーニング準備度',
    question_text: 'ウォームアップ中に体の硬さや違和感がありますか？',
    output_domains: ['training_readiness', 'inflammation'], weight: 1.0, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 48, sort_order: 48, category: 'トレーニング準備度',
    question_text: '以前と比べてパフォーマンスの低下を感じますか？',
    output_domains: ['training_readiness', 'recovery'], weight: 1.2, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 49, sort_order: 49, category: 'トレーニング準備度',
    question_text: '運動中にめまいや気分の悪さを感じることがありますか？',
    output_domains: ['training_readiness', 'energy', 'nutrient'], weight: 1.5, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
  {
    id: 50, sort_order: 50, category: 'トレーニング準備度',
    question_text: '現在、痛みや怪我のためにトレーニングを制限していますか？',
    output_domains: ['training_readiness', 'inflammation'], weight: 1.5, reverse_flag: false,
    options: DEFAULT_OPTIONS, active: true, created_at: '', updated_at: '',
  },
];

// カテゴリー一覧
export const CATEGORIES = [
  'メンタル・ストレス',
  '睡眠の質',
  '活力・エネルギー',
  '炎症・痛み',
  '消化・腸内環境',
  '栄養バランス',
  '集中力・認知',
  '回復力',
  'トレーニング準備度',
] as const;
