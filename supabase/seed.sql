-- ============================================
-- 50問 設問マスタデータ投入
-- ============================================

INSERT INTO question_master (id, sort_order, category, question_text, output_domains, weight, reverse_flag, active) VALUES
-- メンタル・ストレス (1-6)
(1, 1, 'メンタル・ストレス', '最近、気分が沈んだり憂うつに感じることがありますか？', ARRAY['mental'], 1.0, false, true),
(2, 2, 'メンタル・ストレス', 'イライラしたり、怒りっぽくなることがありますか？', ARRAY['mental'], 1.0, false, true),
(3, 3, 'メンタル・ストレス', '仕事や日常のプレッシャーを強く感じていますか？', ARRAY['mental','energy'], 1.2, false, true),
(4, 4, 'メンタル・ストレス', '趣味や好きなことへの興味が薄れていますか？', ARRAY['mental','cognition'], 1.0, false, true),
(5, 5, 'メンタル・ストレス', '人と会うのが面倒に感じることがありますか？', ARRAY['mental'], 0.8, false, true),
(6, 6, 'メンタル・ストレス', '将来に対して不安を感じることがありますか？', ARRAY['mental'], 0.8, false, true),

-- 睡眠の質 (7-12)
(7, 7, '睡眠の質', '寝つきが悪いと感じることがありますか？', ARRAY['sleep'], 1.0, false, true),
(8, 8, '睡眠の質', '夜中に何度も目が覚めることがありますか？', ARRAY['sleep','recovery'], 1.2, false, true),
(9, 9, '睡眠の質', '朝起きたときに疲れが残っていると感じますか？', ARRAY['sleep','energy','recovery'], 1.2, false, true),
(10, 10, '睡眠の質', '寝る前にスマホを長時間見ていますか？', ARRAY['sleep','cognition'], 0.8, false, true),
(11, 11, '睡眠の質', '睡眠時間が6時間未満の日が多いですか？', ARRAY['sleep','recovery'], 1.0, false, true),
(12, 12, '睡眠の質', '日中に強い眠気を感じることがありますか？', ARRAY['sleep','energy'], 1.0, false, true),

-- 活力・エネルギー (13-17)
(13, 13, '活力・エネルギー', '朝から体が重くてだるいと感じますか？', ARRAY['energy','recovery'], 1.0, false, true),
(14, 14, '活力・エネルギー', '午後になると集中力が大きく落ちますか？', ARRAY['energy','cognition'], 1.0, false, true),
(15, 15, '活力・エネルギー', '休日も疲れが取れない感じがしますか？', ARRAY['energy','recovery'], 1.2, false, true),
(16, 16, '活力・エネルギー', '階段を上ると息切れしやすいですか？', ARRAY['energy','training_readiness'], 1.0, false, true),
(17, 17, '活力・エネルギー', 'カフェインに頼らないとやっていけないと感じますか？', ARRAY['energy','nutrient'], 0.8, false, true),

-- 炎症・痛み (18-23)
(18, 18, '炎症・痛み', '関節の痛みやこわばりを感じることがありますか？', ARRAY['inflammation','training_readiness'], 1.2, false, true),
(19, 19, '炎症・痛み', '頭痛が頻繁に起こりますか？', ARRAY['inflammation','mental'], 1.0, false, true),
(20, 20, '炎症・痛み', '肩こりや腰痛に悩んでいますか？', ARRAY['inflammation','training_readiness'], 1.0, false, true),
(21, 21, '炎症・痛み', '肌荒れやアレルギー症状が気になりますか？', ARRAY['inflammation','nutrient'], 0.8, false, true),
(22, 22, '炎症・痛み', '体のどこかにむくみを感じことがありますか？', ARRAY['inflammation','digestion'], 0.8, false, true),
(23, 23, '炎症・痛み', '運動後に痛みが長く続くことがありますか？', ARRAY['inflammation','recovery'], 1.2, false, true),

-- 消化・腸内環境 (24-29)
(24, 24, '消化・腸内環境', 'お腹の張りやガスが気になりますか？', ARRAY['digestion'], 1.0, false, true),
(25, 25, '消化・腸内環境', '便秘や下痢になりやすいですか？', ARRAY['digestion','nutrient'], 1.2, false, true),
(26, 26, '消化・腸内環境', '食後に胃もたれや不快感がありますか？', ARRAY['digestion'], 1.0, false, true),
(27, 27, '消化・腸内環境', '食欲にムラがある（食べすぎ・食欲不振）ですか？', ARRAY['digestion','nutrient','mental'], 1.0, false, true),
(28, 28, '消化・腸内環境', '発酵食品や食物繊維をあまり摂っていないですか？', ARRAY['digestion','nutrient'], 0.8, false, true),
(29, 29, '消化・腸内環境', '口臭や体臭が気になることがありますか？', ARRAY['digestion'], 0.6, false, true),

-- 栄養バランス (30-35)
(30, 30, '栄養バランス', '1日の食事が2食以下になることが多いですか？', ARRAY['nutrient','energy'], 1.2, false, true),
(31, 31, '栄養バランス', '野菜をあまり食べない日が多いですか？', ARRAY['nutrient'], 1.0, false, true),
(32, 32, '栄養バランス', 'タンパク質（肉・魚・豆）の摂取量が少ないと思いますか？', ARRAY['nutrient','recovery','training_readiness'], 1.2, false, true),
(33, 33, '栄養バランス', '甘いものやスナック菓子をよく食べますか？', ARRAY['nutrient','inflammation'], 1.0, false, true),
(34, 34, '栄養バランス', '水分摂取量が1日1リットル未満ですか？', ARRAY['nutrient','energy'], 0.8, false, true),
(35, 35, '栄養バランス', 'アルコールを週に3日以上飲みますか？', ARRAY['nutrient','sleep','recovery'], 1.0, false, true),

-- 集中力・認知 (36-40)
(36, 36, '集中力・認知', '物忘れが増えたと感じますか？', ARRAY['cognition'], 1.0, false, true),
(37, 37, '集中力・認知', '仕事中にボーっとしたり集中が途切れやすいですか？', ARRAY['cognition','energy'], 1.0, false, true),
(38, 38, '集中力・認知', '決断力が落ちていると感じますか？', ARRAY['cognition','mental'], 1.0, false, true),
(39, 39, '集中力・認知', 'マルチタスクがうまくこなせないと感じますか？', ARRAY['cognition'], 0.8, false, true),
(40, 40, '集中力・認知', '読書や学習に集中できない時間が増えましたか？', ARRAY['cognition','mental'], 0.8, false, true),

-- 回復力 (41-45)
(41, 41, '回復力', '筋肉痛が以前より長引くようになりましたか？', ARRAY['recovery','training_readiness'], 1.2, false, true),
(42, 42, '回復力', '風邪をひきやすい、または治りにくいですか？', ARRAY['recovery','nutrient'], 1.0, false, true),
(43, 43, '回復力', '傷や打撲の回復が遅いと感じますか？', ARRAY['recovery','inflammation'], 1.0, false, true),
(44, 44, '回復力', '同じトレーニングなのに前より疲れやすいですか？', ARRAY['recovery','training_readiness','energy'], 1.2, false, true),
(45, 45, '回復力', 'トレーニング翌日に体調を崩すことがありますか？', ARRAY['recovery','training_readiness'], 1.0, false, true),

-- トレーニング準備度 (46-50)
(46, 46, 'トレーニング準備度', 'トレーニングへのモチベーションが下がっていますか？', ARRAY['training_readiness','mental'], 1.2, false, true),
(47, 47, 'トレーニング準備度', 'ウォームアップ中に体の硬さや違和感がありますか？', ARRAY['training_readiness','inflammation'], 1.0, false, true),
(48, 48, 'トレーニング準備度', '以前と比べてパフォーマンスの低下を感じますか？', ARRAY['training_readiness','recovery'], 1.2, false, true),
(49, 49, 'トレーニング準備度', '運動中にめまいや気分の悪さを感じることがありますか？', ARRAY['training_readiness','energy','nutrient'], 1.5, false, true),
(50, 50, 'トレーニング準備度', '現在、痛みや怪我のためにトレーニングを制限していますか？', ARRAY['training_readiness','inflammation'], 1.5, false, true)

ON CONFLICT (id) DO NOTHING;

-- シーケンスをリセット
SELECT setval('question_master_id_seq', 50, true);
