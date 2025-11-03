# app024: キャラプロンプト辞書 - 技術設計書

## 1. 技術スタック

### 1.1 フレームワーク・ライブラリ
- **Next.js**: 14.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x

### 1.2 選定理由
- **Next.js 14**: App Router採用でサーバーコンポーネント活用、SEO対応、静的エクスポート可能
- **React 18**: Concurrent Features、useTransition等の最新機能活用
- **TypeScript**: 型安全性、開発効率向上、プロンプト管理の複雑なロジックに有効
- **Tailwind CSS**: ユーティリティファースト、高速開発、カラフルなカードUIに最適

### 1.3 主要ライブラリ
- **状態管理**: Zustand（軽量、シンプル、TypeScript完全対応）
- **データ永続化**: LocalStorage
- **AI API**: @google/genai（Gemini API）
- **画像生成**: Imagen 3（Google AI Studio API経由）
- **UI コンポーネント**: Radix UI（アクセシビリティ対応）
- **アイコン**: lucide-react
- **ファイル生成**: FileSaver.js（JSON/CSVエクスポート）

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ
```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Next.js App Router + React Components)│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Application Layer              │
│    (State Management: Zustand)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Data Layer                    │
│     (LocalStorage + Gemini API)         │
└─────────────────────────────────────────┘
```

### 2.2 コンポーネント構成
```
app/
├── page.tsx                    # メインページ
├── layout.tsx                  # ルートレイアウト
└── components/
    ├── CharacterCard.tsx       # キャラクターカード
    ├── CharacterGrid.tsx       # カード一覧グリッド
    ├── CharacterForm.tsx       # キャラ作成/編集フォーム
    ├── PromptPreview.tsx       # プロンプトプレビュー
    ├── PromptTemplateEditor.tsx # テンプレート編集
    ├── TagManager.tsx          # タグ管理
    ├── TagFilter.tsx           # タグフィルター
    ├── SearchBar.tsx           # 検索バー
    ├── ExportDialog.tsx        # エクスポートダイアログ
    ├── ImportDialog.tsx        # インポートダイアログ
    ├── AICharacterGenerator.tsx # AI自動生成
    ├── AIPromptOptimizer.tsx   # AIプロンプト最適化
    ├── AIImageGenerator.tsx    # AI画像生成
    ├── ApiKeySettings.tsx      # APIキー設定
    └── Header.tsx              # ヘッダー
```

## 3. データモデル設計

### 3.1 Character（キャラクターデータ）
```typescript
interface Character {
  id: string;                    // UUID
  name: string;                  // キャラクター名
  appearance: string;            // 外見設定
  personality: string;           // 性格・口調
  background: string;            // 背景・設定
  tags: string[];                // タグ配列
  thumbnail?: string;            // サムネイル画像（Base64 or URL）
  version: number;               // バージョン番号
  versionHistory?: CharacterVersion[]; // バージョン履歴
  createdAt: Date;               // 作成日時
  updatedAt: Date;               // 更新日時
}
```

### 3.2 CharacterVersion（バージョン履歴）
```typescript
interface CharacterVersion {
  version: number;               // バージョン番号
  character: Character;          // スナップショット
  changedAt: Date;               // 変更日時
  changeDescription?: string;    // 変更内容メモ
}
```

### 3.3 PromptTemplate（プロンプトテンプレート）
```typescript
interface PromptTemplate {
  id: string;                    // UUID
  name: string;                  // テンプレート名
  category: 'image' | 'text' | 'custom'; // カテゴリー
  template: string;              // テンプレート文字列
  description?: string;          // 説明
  variables: string[];           // 使用変数リスト
  createdAt: Date;               // 作成日時
}
```

### 3.4 AppSettings（アプリ設定）
```typescript
interface AppSettings {
  geminiApiKey?: string;         // Gemini APIキー
  defaultTemplate: string;       // デフォルトテンプレートID
  gridColumns: number;           // グリッド列数
  cardSize: 'small' | 'medium' | 'large'; // カードサイズ
}
```

## 4. ファイル構成

```
app024/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── components/
│       ├── CharacterCard.tsx
│       ├── CharacterGrid.tsx
│       ├── CharacterForm.tsx
│       ├── PromptPreview.tsx
│       ├── PromptTemplateEditor.tsx
│       ├── TagManager.tsx
│       ├── TagFilter.tsx
│       ├── SearchBar.tsx
│       ├── ExportDialog.tsx
│       ├── ImportDialog.tsx
│       ├── AICharacterGenerator.tsx
│       ├── AIPromptOptimizer.tsx
│       ├── AIImageGenerator.tsx
│       ├── ApiKeySettings.tsx
│       └── Header.tsx
├── lib/
│   ├── promptGenerator.ts      # プロンプト生成ロジック
│   ├── templateEngine.ts       # テンプレートエンジン
│   ├── geminiService.ts        # Gemini API呼び出し
│   ├── imagenService.ts        # Imagen 3 API呼び出し
│   ├── exportUtils.ts          # JSON/CSVエクスポート
│   └── storage.ts              # LocalStorage管理
├── store/
│   └── useCharacterStore.ts    # Zustand Store
├── types/
│   └── index.ts                # 型定義
├── public/
│   └── placeholder.png         # プレースホルダー画像
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 5. API・インターフェース設計

### 5.1 Zustand Store
```typescript
interface CharacterStore {
  // State
  characters: Character[];
  selectedCharacterId: string | null;
  templates: PromptTemplate[];
  selectedTags: string[];
  searchQuery: string;

  // Actions
  addCharacter: (character: Character) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  duplicateCharacter: (id: string) => void;
  setSelectedCharacter: (id: string | null) => void;

  // Template Actions
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;

  // Filter Actions
  setSelectedTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;

  // Version Control
  saveVersion: (characterId: string, description?: string) => void;
  restoreVersion: (characterId: string, version: number) => void;

  // Export/Import
  exportCharacters: (ids: string[]) => string;
  importCharacters: (jsonData: string) => void;

  // Computed
  filteredCharacters: () => Character[];
  allTags: () => string[];
}
```

### 5.2 Prompt Generator
```typescript
interface PromptGenerator {
  // プロンプト生成
  generatePrompt(
    character: Character,
    template: PromptTemplate
  ): string;

  // 変数置換
  replaceVariables(
    template: string,
    variables: Record<string, string>
  ): string;

  // プレビュー生成
  generatePreview(character: Character): {
    image: string;
    text: string;
    custom: string;
  };
}
```

### 5.3 Gemini API インターフェース
```typescript
interface GeminiService {
  // キャラクター設定自動補完
  generateCharacter(prompt: string): Promise<{
    name: string;
    appearance: string;
    personality: string;
    background: string;
    tags: string[];
  }>;

  // プロンプト最適化
  optimizePrompt(
    characterData: Character,
    targetAI: 'stable-diffusion' | 'dalle' | 'midjourney' | 'general'
  ): Promise<string>;

  // 設定の一貫性チェック
  checkConsistency(character: Character): Promise<{
    isConsistent: boolean;
    issues: string[];
    suggestions: string[];
  }>;

  // 関連キャラ提案
  suggestRelatedCharacter(
    baseCharacter: Character,
    relation: 'friend' | 'rival' | 'family' | 'mentor'
  ): Promise<Character>;
}
```

### 5.4 Imagen 3 API インターフェース
```typescript
interface ImagenService {
  // キャラクター画像生成
  generateCharacterImage(
    prompt: string,
    options?: {
      aspectRatio?: '1:1' | '16:9' | '9:16';
      numberOfImages?: number;
      safetyLevel?: 'block_few' | 'block_some' | 'block_most';
    }
  ): Promise<{
    images: string[];  // Base64 or URL
    cost: number;      // 推定コスト
  }>;
}
```

## 6. 主要機能の実装方針

### 6.1 キャラクターカード管理
1. Zustand Store でキャラクター配列を管理
2. LocalStorage に自動保存（デバウンス処理）
3. カード表示は React.memo で最適化
4. ドラッグ&ドロップでソート（react-beautiful-dnd等）

### 6.2 プロンプト生成エンジン
1. テンプレート文字列のパース
2. 変数の抽出（`{{name}}`, `{{appearance}}`等）
3. キャラクターデータとのマッピング
4. 最終的なプロンプト文字列を生成

**実装例**:
```typescript
function generatePrompt(character: Character, template: string): string {
  const variables = {
    name: character.name,
    appearance: character.appearance,
    personality: character.personality,
    background: character.background,
    tags: character.tags.join(', ')
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key as keyof typeof variables] || match;
  });
}
```

### 6.3 ワンクリックコピー
1. Clipboard API を使用
2. コピー成功時に視覚的フィードバック（トーストメッセージ）
3. フォールバック処理（古いブラウザ対応）

**実装例**:
```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
```

### 6.4 タグ管理・検索
1. タグ入力時にオートコンプリート（既存タグから候補表示）
2. タグフィルターは AND条件（複数タグ全てを持つキャラのみ表示）
3. 検索クエリは名前・外見・性格・背景全てを対象
4. フィルター結果は即座に反映（useTransition で最適化）

### 6.5 バージョン管理
1. キャラクター編集時に自動スナップショット作成
2. バージョン履歴は最大10件保持（古いものから削除）
3. バージョン復元時は新しいバージョンとして保存
4. 変更内容の差分表示（optional）

### 6.6 エクスポート/インポート
**JSON形式**:
```json
{
  "version": "1.0",
  "exportDate": "2025-01-01T00:00:00Z",
  "characters": [
    {
      "id": "char_001",
      "name": "山田太郎",
      "appearance": "黒髪ショート、茶色の瞳、身長170cm、学生服",
      "personality": "明るく前向き、少し天然、語尾に「〜だね」を付ける",
      "background": "高校2年生、サッカー部所属、主人公の親友",
      "tags": ["ファンタジー小説A", "男性", "サブキャラ"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T12:00:00Z"
    }
  ]
}
```

**CSV形式**:
```csv
name,appearance,personality,background,tags
山田太郎,"黒髪ショート、茶色の瞳","明るく前向き","高校2年生","ファンタジー小説A,男性,サブキャラ"
```

### 6.7 AI機能（Gemini API）

#### キャラクター設定自動補完
1. ユーザーが簡単な設定を入力（例: 「元気な女子高生」）
2. Gemini APIに送信
   ```typescript
   const prompt = `以下の設定から詳細なキャラクター設定を生成してください：
   ${userInput}

   以下の形式で出力してください：
   - 名前:
   - 外見:
   - 性格・口調:
   - 背景・設定:
   - タグ（3〜5個）: `;
   ```
3. レスポンスをパースしてフォームに自動入力
4. ユーザーが編集・調整可能

#### プロンプト最適化
1. 日本語キャラ設定を取得
2. 対象AI（Stable Diffusion/DALL-E等）を指定
3. Gemini APIで英語プロンプトに変換
   ```typescript
   const prompt = `以下のキャラクター設定を${targetAI}用の英語プロンプトに最適化してください：

   ${characterData}

   画像生成AIに適した具体的で明確な表現を使ってください。`;
   ```
4. 生成されたプロンプトをプレビュー表示
5. ワンクリックでコピー可能

#### 設定の一貫性チェック
1. キャラクター設定を取得
2. Gemini APIで矛盾を検出
   ```typescript
   const prompt = `以下のキャラクター設定に矛盾や不自然な点がないかチェックしてください：

   ${JSON.stringify(character)}

   問題点があれば指摘し、改善提案をしてください。`;
   ```
3. 検出された問題を一覧表示
4. 改善提案を表示（適用ボタン付き）

#### 関連キャラの提案
1. 基準キャラクターと関係性タイプを指定
2. Gemini APIで関連キャラ案を生成
3. 生成された設定を編集・保存可能

#### キャラクター画像生成（Imagen 3）
⚠️ **この機能は課金対象です（無料枠なし）**

1. UI上に明確な課金警告を表示
2. ユーザーの明示的同意を取得
3. キャラ設定からプロンプト生成
4. Imagen 3 APIで画像生成
5. 生成された画像をサムネイルとして設定
6. 複数バリエーション生成・選択可能

**UI表示例**:
```
⚠️ 画像生成機能について
- この機能は課金対象です（無料枠なし）
- 1枚あたり約$0.04の費用が発生します
- GCP Billingが有効化されている必要があります
```

## 7. パフォーマンス最適化

### 7.1 React最適化
- React.memo でカードコンポーネント再レンダリング抑制
- useMemo でフィルタリング結果をキャッシュ
- useCallback でイベントハンドラーをメモ化
- useTransition で検索・フィルター処理を最適化

### 7.2 LocalStorage管理
- デバウンス処理（300ms）で保存頻度を制限
- バッチ処理で複数変更を一度に保存
- 圧縮処理（LZ-string等）でデータサイズ削減

### 7.3 画像最適化
- サムネイル画像は最大200x200pxにリサイズ
- WebP形式で圧縮（フォールバックあり）
- Lazy Loading で表示されるカードのみ画像読み込み

## 8. セキュリティ対策

### 8.1 入力検証
- XSS対策: ユーザー入力のサニタイズ
- プロンプトインジェクション対策: AI API送信前にフィルタリング
- ファイル名のサニタイズ（エクスポート時）

### 8.2 APIキー管理
- LocalStorage保存（平文）
- 設定画面でマスク表示（****）
- APIキーは外部送信しない（Gemini API以外）

### 8.3 データ保護
- LocalStorageのデータはブラウザ内のみ
- エクスポートはユーザーの明示的な操作のみ
- インポート時のデータ検証

## 9. エラーハンドリング

### 9.1 LocalStorage
- 容量不足: 「ストレージ容量が不足しています。古いキャラを削除してください」
- データ破損: 「データの読み込みに失敗しました。バックアップから復元してください」

### 9.2 Gemini API
- APIキー未設定: 「APIキーを設定してください」
- レート制限: 「APIリクエスト制限に達しました。しばらくお待ちください」
- ネットワークエラー: 「ネットワークエラーが発生しました」
- 生成失敗: 「キャラクター生成に失敗しました。入力内容を見直してください」

### 9.3 Imagen 3 API
- APIキー未設定: 「APIキーを設定してください」
- 課金未設定: 「GCP Billingが有効化されていません」
- 生成失敗: 「画像生成に失敗しました」
- 安全性フィルター: 「安全性フィルターにより画像生成がブロックされました」

### 9.4 Clipboard API
- コピー失敗: 「クリップボードへのコピーに失敗しました」
- 権限エラー: 「クリップボードへのアクセス権限がありません」

## 10. テスト戦略

### 10.1 単体テスト（Jest + React Testing Library）
- promptGenerator の各関数
- templateEngine の変数置換
- exportUtils（JSON/CSV生成）
- Zustand Store のアクション

### 10.2 統合テスト
- キャラクター作成 → 保存 → 表示
- プロンプト生成 → コピー
- タグフィルター → 検索
- エクスポート → インポート

### 10.3 E2Eテスト（Playwright）
- ユーザーシナリオ全体
- AI機能の統合テスト
- ブラウザ間互換性確認

## 11. デプロイ・運用

### 11.1 ビルド
- `next build` で静的エクスポート
- Vercel / Netlify / GitHub Pages 対応

### 11.2 ブラウザ対応
- Chrome 90+（Clipboard API）
- Firefox 90+
- Safari 15+
- Edge 90+

### 11.3 モニタリング
- エラー追跡（Sentry等、オプション）
- API使用量モニタリング
- ユーザーフィードバック収集

## 12. 今後の拡張性

### 12.1 追加機能候補
- チーム共同編集機能（リアルタイム同期）
- 関係性マップ（キャラ間の相関図可視化）
- プロンプト履歴・使用統計
- AI音声生成（キャラボイス）

### 12.2 技術的改善
- Service Worker（PWA化、オフライン対応）
- WebSocket（リアルタイム共同編集）
- IndexedDB（大量キャラ管理）
- クラウド同期（Firebase等）
