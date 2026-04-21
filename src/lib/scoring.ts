// ============================================
// スコアリングロジック
// 領域別スコアの算出・正規化・リスク判定
// ============================================

import {
  OutputDomain,
  DOMAIN_LABELS,
  DomainScore,
  RiskLevel,
  getRiskLevel,
  QuestionMaster,
} from './types';

// 回答データ型
export interface AnswerMap {
  [questionId: number]: number; // 設問ID → 回答値(1-5)
}

// 領域別スコア計算結果
export interface DomainScoreResult {
  domain: OutputDomain;
  label: string;
  rawScore: number;
  normalizedScore: number;
  riskLevel: RiskLevel;
  riskLabel: string;
  riskColor: string;
  questionCount: number;
}

// 全領域のスコア計算
export function calculateDomainScores(
  questions: QuestionMaster[],
  answers: AnswerMap
): DomainScoreResult[] {
  const ALL_DOMAINS: OutputDomain[] = [
    'mental', 'sleep', 'energy', 'inflammation', 'digestion',
    'nutrient', 'cognition', 'recovery', 'training_readiness',
  ];

  return ALL_DOMAINS.map((domain) => {
    // この領域に紐づく設問を取得
    const domainQuestions = questions.filter(
      (q) => q.active && q.output_domains.includes(domain)
    );

    if (domainQuestions.length === 0) {
      return {
        domain,
        label: DOMAIN_LABELS[domain],
        rawScore: 0,
        normalizedScore: 0,
        riskLevel: 'stable' as RiskLevel,
        riskLabel: '安定',
        riskColor: '#10b981',
        questionCount: 0,
      };
    }

    // 重み付きスコアを計算
    let weightedSum = 0;
    let totalWeight = 0;
    let answeredCount = 0;

    domainQuestions.forEach((q) => {
      const answerValue = answers[q.id];
      if (answerValue !== undefined) {
        // 逆転項目の場合: 6 - 回答値
        const effectiveValue = q.reverse_flag ? 6 - answerValue : answerValue;
        weightedSum += effectiveValue * q.weight;
        totalWeight += q.weight;
        answeredCount++;
      }
    });

    if (answeredCount === 0) {
      return {
        domain,
        label: DOMAIN_LABELS[domain],
        rawScore: 0,
        normalizedScore: 0,
        riskLevel: 'stable' as RiskLevel,
        riskLabel: '安定',
        riskColor: '#10b981',
        questionCount: domainQuestions.length,
      };
    }

    // 正規化: (加重平均 - 1) / (5 - 1) * 100
    // 回答範囲1-5を0-100に正規化
    const weightedAverage = weightedSum / totalWeight;
    const normalizedScore = Math.round(((weightedAverage - 1) / 4) * 100);
    const clampedScore = Math.max(0, Math.min(100, normalizedScore));

    const riskInfo = getRiskLevel(clampedScore);

    return {
      domain,
      label: DOMAIN_LABELS[domain],
      rawScore: Math.round(weightedSum * 10) / 10,
      normalizedScore: clampedScore,
      riskLevel: riskInfo.key,
      riskLabel: riskInfo.label,
      riskColor: riskInfo.color,
      questionCount: domainQuestions.length,
    };
  });
}

// 上位N領域を取得（重点課題）
export function getTopRiskDomains(
  scores: DomainScoreResult[],
  n: number = 3
): DomainScoreResult[] {
  return [...scores]
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, n);
}

// 総合スコア算出
export function calculateTotalScore(scores: DomainScoreResult[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s.normalizedScore, 0);
  return Math.round(sum / scores.length);
}

// 促進焦点/予防焦点の推奨声かけ
export interface ApproachRecommendation {
  focusType: 'promotion' | 'prevention';
  label: string;
  greeting: string;
  suggestions: string[];
}

export function getApproachRecommendation(
  totalScore: number,
  topDomains: DomainScoreResult[]
): ApproachRecommendation {
  // スコアが高い（問題が多い）場合は予防焦点
  if (totalScore >= 50) {
    return {
      focusType: 'prevention',
      label: '予防焦点（安全・安心重視）',
      greeting: '今の状態を丁寧に確認させてください。無理はせず、一つずつ改善していきましょう。',
      suggestions: generatePreventionSuggestions(topDomains),
    };
  }
  return {
    focusType: 'promotion',
    label: '促進焦点（成長・挑戦重視）',
    greeting: '良い状態をキープできていますね！さらに良くするためのポイントを見ていきましょう。',
    suggestions: generatePromotionSuggestions(topDomains),
  };
}

// 予防焦点の声かけ生成
function generatePreventionSuggestions(topDomains: DomainScoreResult[]): string[] {
  const suggestions: string[] = [];
  topDomains.forEach((d) => {
    switch (d.domain) {
      case 'mental':
        suggestions.push('まずは日々のストレスを軽減する方法を一緒に考えましょう');
        break;
      case 'sleep':
        suggestions.push('睡眠の質を上げることで、他の不調も改善されやすくなります');
        break;
      case 'energy':
        suggestions.push('疲労が蓄積しているようです。回復を最優先にしましょう');
        break;
      case 'inflammation':
        suggestions.push('体の痛みや炎症を軽減するストレッチを取り入れましょう');
        break;
      case 'digestion':
        suggestions.push('腸内環境を整えることで全身の調子が変わります');
        break;
      case 'nutrient':
        suggestions.push('食事内容を見直して、必要な栄養素を確保しましょう');
        break;
      case 'cognition':
        suggestions.push('脳の疲労も体に影響します。休息の取り方を工夫しましょう');
        break;
      case 'recovery':
        suggestions.push('回復力を高めるために、トレーニング強度を調整しましょう');
        break;
      case 'training_readiness':
        suggestions.push('今は体づくりの土台を固める時期です。基礎から見直しましょう');
        break;
    }
  });
  return suggestions;
}

// 促進焦点の声かけ生成
function generatePromotionSuggestions(topDomains: DomainScoreResult[]): string[] {
  const suggestions: string[] = [];
  topDomains.forEach((d) => {
    switch (d.domain) {
      case 'mental':
        suggestions.push('メンタル面をさらに強化して、パフォーマンスを上げましょう');
        break;
      case 'sleep':
        suggestions.push('睡眠の質をもう一段上げて、回復力を最大化しましょう');
        break;
      case 'energy':
        suggestions.push('エネルギーレベルを上げるための習慣を追加しましょう');
        break;
      case 'inflammation':
        suggestions.push('コンディショニングで体の違和感を解消していきましょう');
        break;
      case 'digestion':
        suggestions.push('腸活を強化して、栄養吸収効率を高めましょう');
        break;
      case 'nutrient':
        suggestions.push('栄養バランスの微調整で、さらにパフォーマンスアップを狙いましょう');
        break;
      case 'cognition':
        suggestions.push('集中力トレーニングで、仕事も運動も効率を上げましょう');
        break;
      case 'recovery':
        suggestions.push('回復方法を最適化して、より質の高いトレーニングへ');
        break;
      case 'training_readiness':
        suggestions.push('体の準備は十分です。新しいチャレンジに挑みましょう');
        break;
    }
  });
  return suggestions;
}

// 課題シート自動生成
export interface IssueSheet {
  priorityDomains: DomainScoreResult[];
  issues: { domain: string; issue: string; action: string }[];
  lifestyleHomework: string[];
  nextAssessmentWeeks: number;
}

export function generateIssueSheet(
  scores: DomainScoreResult[],
  topDomains: DomainScoreResult[]
): IssueSheet {
  const issues = topDomains.map((d) => ({
    domain: d.label,
    issue: getIssueDescription(d.domain, d.normalizedScore),
    action: getActionPlan(d.domain, d.normalizedScore),
  }));

  const lifestyleHomework = topDomains.map((d) =>
    getLifestyleHomework(d.domain)
  );

  // 再評価日の目安：スコアが高いほど短期間
  const maxScore = topDomains[0]?.normalizedScore || 0;
  const nextAssessmentWeeks = maxScore >= 75 ? 2 : maxScore >= 50 ? 4 : 6;

  return {
    priorityDomains: topDomains,
    issues,
    lifestyleHomework,
    nextAssessmentWeeks,
  };
}

// 課題の説明文生成
function getIssueDescription(domain: OutputDomain, score: number): string {
  const severity = score >= 75 ? '深刻な' : score >= 50 ? '注意が必要な' : '軽度の';
  const descriptions: Record<OutputDomain, string> = {
    mental: `${severity}ストレス反応が見られます。心身のバランスに注意が必要です。`,
    sleep: `${severity}睡眠の質の低下が見られます。日中のパフォーマンスに影響しています。`,
    energy: `${severity}エネルギー不足の傾向があります。疲労の蓄積が考えられます。`,
    inflammation: `${severity}炎症反応の可能性があります。体の痛みやこわばりに注意してください。`,
    digestion: `${severity}消化機能の低下が見られます。食事と腸内環境の見直しが推奨されます。`,
    nutrient: `${severity}栄養バランスの偏りがあります。食事内容の改善が推奨されます。`,
    cognition: `${severity}認知機能への影響が見られます。脳の疲労にも注意が必要です。`,
    recovery: `${severity}回復力の低下が見られます。リカバリー戦略の見直しが必要です。`,
    training_readiness: `${severity}トレーニング準備状態の低下が見られます。プログラムの調整を推奨します。`,
  };
  return descriptions[domain];
}

// アクションプラン生成
function getActionPlan(domain: OutputDomain, score: number): string {
  const plans: Record<OutputDomain, string> = {
    mental: 'リラクゼーション法の導入、トレーニング時間の有効活用、呼吸エクササイズ',
    sleep: '就寝前ルーティンの確立、寝室環境の最適化、夕方の軽い運動',
    energy: '食事タイミングの見直し、漸進的な活動量増加、休息の質向上',
    inflammation: '抗炎症食の推奨、ストレッチ＆モビリティワーク、アイシング指導',
    digestion: '食事日記の実施、プロバイオティクスの検討、食べ方の改善',
    nutrient: 'PFCバランスの最適化、サプリメントの検討、食事計画の策定',
    cognition: 'マインドフルネスの導入、デジタルデトックス、適度な有酸素運動',
    recovery: 'アクティブリカバリーの組み込み、睡眠優先、栄養タイミングの最適化',
    training_readiness: 'ウォームアップの見直し、負荷の段階的調整、コンディショニング強化',
  };
  return plans[domain];
}

// 生活改善宿題
function getLifestyleHomework(domain: OutputDomain): string {
  const homework: Record<OutputDomain, string> = {
    mental: '1日5分の深呼吸タイムを設け、ストレス日記をつけてみましょう',
    sleep: '寝る1時間前にスマホを置き、毎日同じ時間に就寝する習慣をつけましょう',
    energy: '1日3食を規則正しく摂り、10分でも良いので昼休みに歩きましょう',
    inflammation: '毎日10分のストレッチを行い、青魚やナッツを意識的に摂りましょう',
    digestion: '食事はよく噛んでゆっくり食べ、発酵食品を1日1品取り入れましょう',
    nutrient: '毎食に野菜とタンパク質を含め、水を1日1.5L以上飲みましょう',
    cognition: '1日30分のスマホオフタイムを設け、軽い読書の時間を作りましょう',
    recovery: 'トレーニング後30分以内にタンパク質を摂り、7時間以上の睡眠を確保しましょう',
    training_readiness: '毎回10分のウォームアップを必ず行い、体調記録をつけましょう',
  };
  return homework[domain];
}

// トレーニング方針の生成
export interface TrainingRecommendation {
  intensity: string;
  focus: string;
  frequency: string;
  precautions: string[];
  programNotes: string;
}

export function generateTrainingRecommendation(
  scores: DomainScoreResult[],
  totalScore: number
): TrainingRecommendation {
  const recoveryScore = scores.find(s => s.domain === 'recovery')?.normalizedScore || 0;
  const readinessScore = scores.find(s => s.domain === 'training_readiness')?.normalizedScore || 0;
  const inflammationScore = scores.find(s => s.domain === 'inflammation')?.normalizedScore || 0;

  let intensity: string;
  let focus: string;
  let frequency: string;
  const precautions: string[] = [];

  if (totalScore >= 75) {
    intensity = '低強度（RPE 3-5）';
    focus = 'コンディショニング・モビリティ中心';
    frequency = '週2回';
    precautions.push('体調に合わせて柔軟にメニューを変更してください');
    precautions.push('高負荷のトレーニングは控えてください');
  } else if (totalScore >= 50) {
    intensity = '中低強度（RPE 5-6）';
    focus = '基礎体力向上・フォーム改善';
    frequency = '週2-3回';
    precautions.push('疲労感が強い日は強度を下げてください');
  } else if (totalScore >= 25) {
    intensity = '中強度（RPE 6-7）';
    focus = '筋力向上・体組成改善';
    frequency = '週3回';
    precautions.push('回復状態を確認しながら負荷を段階的に上げてください');
  } else {
    intensity = '中高強度（RPE 7-8）';
    focus = 'パフォーマンス向上・目標達成';
    frequency = '週3-4回';
  }

  if (inflammationScore >= 50) {
    precautions.push('痛みのある部位への負荷は避け、代替種目を使用してください');
  }
  if (recoveryScore >= 50) {
    precautions.push('セッション間の回復期間を十分に確保してください');
  }

  const programNotes = `現在の総合スコア${totalScore}に基づき、${focus}を中心としたプログラムを推奨します。強度は${intensity}を目安に、${frequency}のトレーニング頻度が適切です。`;

  return { intensity, focus, frequency, precautions, programNotes };
}
