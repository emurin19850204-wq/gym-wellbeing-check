-- ============================================
-- ジム ウェルビーイングチェック
-- Supabase データベーススキーマ
-- ============================================

-- UUID拡張が有効になっていることを確認
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. プロフィール（users拡張）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  join_date DATE,
  trainer_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- プロフィール自動作成トリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. 設問マスタテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS question_master (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  output_domains TEXT[] NOT NULL DEFAULT '{}',
  weight NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  reverse_flag BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB NOT NULL DEFAULT '[
    {"value": 1, "label": "まったくない"},
    {"value": 2, "label": "たまにある"},
    {"value": 3, "label": "ときどきある"},
    {"value": 4, "label": "よくある"},
    {"value": 5, "label": "ほぼ毎日"}
  ]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. アセスメント（1回の測定）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. アセスメント回答テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES question_master(id),
  answer_value INTEGER NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- ============================================
-- 5. 領域スコアテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS domain_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  raw_score NUMERIC(5,1) DEFAULT 0,
  normalized_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assessment_id, domain)
);

-- ============================================
-- 6. 心配事回答テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS concern_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  concern_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. カウンセリングノートテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS counseling_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id),
  focus_type TEXT DEFAULT 'promotion' CHECK (focus_type IN ('promotion', 'prevention')),
  approach_notes TEXT DEFAULT '',
  homework TEXT DEFAULT '',
  next_assessment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. トレーニングプランテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id),
  priority_domains TEXT[] DEFAULT '{}',
  training_policy TEXT DEFAULT '',
  lifestyle_homework TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_trainer ON profiles(trainer_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_trainer ON assessments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_domain_scores_assessment ON domain_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_counseling_notes_assessment ON counseling_notes(assessment_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_assessment ON training_plans(assessment_id);

-- ============================================
-- RLS（行レベルセキュリティ）ポリシー
-- ============================================

-- プロフィール
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 設問マスタ（誰でも読める、管理者のみ書き込み）
ALTER TABLE question_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_all" ON question_master
  FOR SELECT USING (true);

CREATE POLICY "questions_admin_modify" ON question_master
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- アセスメント
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_select_policy" ON assessments
  FOR SELECT USING (
    user_id = auth.uid()
    OR trainer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

CREATE POLICY "assessments_insert_policy" ON assessments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
    OR user_id = auth.uid()
  );

CREATE POLICY "assessments_update_policy" ON assessments
  FOR UPDATE USING (
    trainer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 回答
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_select_policy" ON assessment_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id
      AND (a.user_id = auth.uid() OR a.trainer_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin')))
    )
  );

CREATE POLICY "answers_insert_policy" ON assessment_answers
  FOR INSERT WITH CHECK (true);

-- 領域スコア
ALTER TABLE domain_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_scores_select" ON domain_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_id
      AND (a.user_id = auth.uid() OR a.trainer_id = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin')))
    )
  );

CREATE POLICY "domain_scores_insert" ON domain_scores
  FOR INSERT WITH CHECK (true);

-- 心配事
ALTER TABLE concern_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "concerns_policy" ON concern_answers
  FOR ALL USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

-- カウンセリングノート
ALTER TABLE counseling_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "counseling_policy" ON counseling_notes
  FOR ALL USING (
    trainer_id = auth.uid()
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- トレーニングプラン
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_plans_policy" ON training_plans
  FOR ALL USING (
    trainer_id = auth.uid()
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- updated_at 自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_counseling_notes_updated_at
  BEFORE UPDATE ON counseling_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
