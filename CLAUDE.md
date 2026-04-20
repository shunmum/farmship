# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # ESLint 実行
npm run preview  # ビルド結果をローカルでプレビュー
```

テストフレームワークは未導入。

## 環境変数

`.env` に以下が必要（Supabaseダッシュボードから取得）:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

`src/lib/env.ts` が起動時にバリデーションを行う。

## アーキテクチャ概要

### 技術スタック
- **Vite + React + TypeScript** / **Tailwind CSS + shadcn/ui** / **React Router v6** / **TanStack Query**
- Lovable（AI開発ツール）で生成されたプロジェクト。Vercel にデプロイ済み。

### 認証の二重構造（重要）

現在、認証は**モック状態**で動いている。本物の認証は未接続。

| ファイル | 役割 | 現在の状態 |
|---|---|---|
| `src/contexts/AuthContext.tsx` | 本物のSupabase Auth実装 | **未使用**（App.tsxに組み込まれていない） |
| `src/hooks/useAuth.ts` | モック認証 | **使用中**（AppSidebarで使用） |
| `src/components/ProtectedRoute.tsx` | ルートガード | **モック**（常に通過する） |

本物の認証を有効化するには：
1. `App.tsx` に `AuthProvider` を追加
2. `ProtectedRoute` を本物の実装に置き換え（ログイン未済なら `/login` にリダイレクト）
3. `src/hooks/useAuth.ts` の mock を `src/contexts/AuthContext.tsx` の `useAuth` に差し替え
4. `LoginPage.tsx` は既に `AuthContext` の `useAuth` を使っているのでそのまま使える

### データの状態（重要）

**全データはメモリ上のモックデータ**。ページリロードでリセットされる。

- `src/contexts/MockDataContext.tsx` — 顧客・注文・商品をインメモリで管理。CRUD操作はここで完結。
- `src/data/mockData.ts` — 初期値のモックデータ定義
- `src/integrations/supabase/client.ts` — Supabase クライアント（接続設定済み、一部機能で呼び出しあり）

### ルーティング構造

```
/order/:slug          → PublicOrderPage（認証不要・公開）
/*                    → ProtectedRoute で保護
  /                   → DashboardPage
  /customers          → CustomersPage
  /orders             → OrdersPage
  /orders/:id         → OrderDetailPage
  /invoices/batch     → InvoiceBatchPage
  /settings           → SettingsPage
  /work-logs/*        → 作業ログ関連ページ群
```

`/login` と `/signup` は `App.tsx` のルート定義に**含まれていない**（`LoginPage.tsx` / `SignupPage.tsx` は存在するが未接続）。

### コンポーネント・スタイルの方針

- UI コンポーネントはすべて `src/components/ui/` の shadcn/ui を使用
- レスポンシブ対応済み。`useIsMobile()` フックでモバイル/デスクトップを判定
- モバイルではハンバーガーメニュー（右側からスライドイン）、デスクトップではホバー展開するサイドバー
- カラーテーマ：グリーン系（`#047857` / `#065F46` がプライマリカラー）

### 型定義

`src/types.ts` に `Customer`, `Recipient`, `Product`, `ProductVariant`, `InvoiceType` を定義。
`src/data/mockData.ts` に `Order`, `OrderStatus`, `PaymentStatus`, `OrderCategory`, `OrderItem` を定義。
