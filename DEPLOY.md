# デプロイ手順（友人にURLで共有する）

Vite + React の静的サイトとして **Vercel** または **Netlify** に載せると、URL を送るだけで友人がブラウザから開けます。

---

## 事前準備

1. コードを **GitHub** に push しておく（Vercel / Netlify は GitHub と連携するのが簡単です）。
2. ルート直下の `.env` は **Git に含めない**（秘密情報のため）。本番ではホスティング側の「環境変数」で設定します。

現在のアプリは **モックデータ中心** で、`ProtectedRoute` は認証を通しています。Supabase を本番で使う場合だけ、下記の環境変数を設定してください。

| 変数名 | 説明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase の anon（公開）キー |

（値は `.env.example` を参照。Vite では `VITE_` で始まる変数だけフロントに埋め込まれます。）

---

## 方法 A: Vercel（おすすめ）

1. [vercel.com](https://vercel.com) でアカウント作成（GitHub でログイン可）。
2. **Add New… → Project** → GitHub の `farm-ship-zen-2` リポジトリを選ぶ。
3. **Framework Preset**: Vite が自動検出される想定。  
   - Build Command: `npm run build`  
   - Output Directory: `dist`
4. **Environment Variables** に、使う場合だけ `VITE_SUPABASE_URL` と `VITE_SUPABASE_PUBLISHABLE_KEY` を追加。
5. **Deploy** を押す。
6. 完了後に表示される **`https://xxxx.vercel.app`** が友人に送る URL です。

※ リポジトリに `vercel.json` があるので、`/orders` などを直接開いても正しく表示されます。

### CLI で一発デプロイ（GitHub なしでも可）

```bash
cd farm-ship-zen-2
npx vercel
```

初回はログインとプロジェクト名の質問に答える。本番用 URL は `npx vercel --prod` で更新できます。

---

## 方法 B: Netlify

1. [netlify.com](https://www.netlify.com) でアカウント作成。
2. **Add new site → Import an existing project** → GitHub から同じリポジトリを選択。
3. ビルド設定は `netlify.toml` が使われるので、そのまま **Deploy site**。
4. 表示された **`https://xxxx.netlify.app`** を友人に送る。

環境変数は **Site configuration → Environment variables** から同様に設定。

---

## デプロイ後の確認

- トップ `/` が開くこと
- `/orders` や `/customers` を **アドレスバーに直接入力** しても白画面にならないこと

---

## トラブル時

- **真っ白な画面**: ブラウザの開発者ツール（F12）→ Console にエラーがないか確認。
- **404**: `vercel.json` / `netlify.toml` がリポジトリに入っているか確認。
- **Supabase ログインだけ動かない**: Supabase ダッシュボードの **Authentication → URL Configuration** に、デプロイ先の URL（例: `https://xxx.vercel.app`）を **Site URL / Redirect URLs** に追加。
