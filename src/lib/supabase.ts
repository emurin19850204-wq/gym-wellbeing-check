// ============================================
// Supabase クライアント設定（改良版）
// サーバー/クライアント両対応
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseが設定されているか確認
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Supabaseクライアント（設定済みの場合のみ作成）
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// デバッグ用ログ
if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase接続済み:', supabaseUrl);
  } else {
    console.log('⚠️ Supabase未設定 - モックモードで動作中');
  }
}
