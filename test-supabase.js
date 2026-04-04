// Supabase接続テスト
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrutrkkxstljvjdqxwlw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydXRya2t4c3RsanZqZHF4d2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzU5MTYsImV4cCI6MjA3OTExMTkxNn0.LOnY66hQoTzObjLiFyoQZnGOhflBKBV9zbLBcuYyyAk';

console.log('🔍 Supabase接続テスト開始...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. 接続テスト
console.log('1️⃣ 基本接続テスト...');
try {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  if (error) {
    console.error('❌ エラー:', error.message);
    console.error('詳細:', error);
  } else {
    console.log('✅ 接続成功！');
  }
} catch (err) {
  console.error('❌ 例外発生:', err.message);
}

// 2. 認証状態確認
console.log('\n2️⃣ 認証状態確認...');
try {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ エラー:', error.message);
  } else if (session) {
    console.log('✅ ログイン中:', session.user.email);
  } else {
    console.log('ℹ️  未ログイン');
  }
} catch (err) {
  console.error('❌ 例外発生:', err.message);
}

// 3. テーブル一覧取得
console.log('\n3️⃣ テーブル存在確認...');
const tables = ['profiles', 'customers', 'products', 'orders'];

for (const table of tables) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: OK`);
    }
  } catch (err) {
    console.log(`❌ ${table}: ${err.message}`);
  }
}

console.log('\n✨ テスト完了');
