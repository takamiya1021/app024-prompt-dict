# app024: キャラプロンプト辞書 - 実装計画書（TDD準拠版）

## 概要
本実装計画書は、TDD（Test-Driven Development）の原則に従い、全ての機能実装において**Red-Green-Refactor**サイクルを適用します。AI機能（Gemini API）と画像生成（Imagen 3）を段階的に実装します。

## 完了条件
- ✅ 全テストがパス（Jest + React Testing Library + Playwright）
- ✅ コードカバレッジ80%以上
- ✅ ESLintエラー・警告ゼロ
- ✅ 要件定義書の全機能が実装済み

## 工数見積もり合計
**約48時間**（TDD対応分を含む）

---

## Phase 0: テスト環境構築（予定工数: 3時間）

### タスク

#### 【x】0-1. Next.jsプロジェクト初期化（30分）
- `npx create-next-app@latest app024 --typescript --tailwind --app`
- **Red**: 動作確認テスト
- **Green**: プロジェクト起動確認
- **Refactor**: 不要ファイル削除

#### 【x】0-2. Jestセットアップ（1時間）
- **Red**: Jest設定ファイルのテスト
- **Green**: Jest, @testing-library/react インストール
- **Refactor**: 設定最適化

#### 【x】0-3. Playwrightセットアップ（1時間）
- **Red**: E2Eテストスケルトン
- **Green**: Playwright インストール・設定
- **Refactor**: テスト構成整理

#### 【x】0-4. テスト実行確認（30分）
- **Red**: ダミーテスト作成
- **Green**: テスト実行スクリプト設定
- **Refactor**: テストコマンド整理

---

## Phase 1: データモデル・状態管理実装（予定工数: 5時間）

### タスク

#### 【x】1-1. 型定義作成（1時間）
- **Red**: 型定義のテスト
- **Green**: Character, PromptTemplate, AppSettings 定義
- **Refactor**: 型の共通化

#### 【x】1-2. Zustand Store実装（3時間）
- **Red**: Store各アクションのテスト
  ```typescript
  test('should add character', () => {
    const { addCharacter, characters } = useCharacterStore.getState();
    addCharacter(mockCharacter);
    expect(characters).toHaveLength(1);
  });
  ```
- **Green**: `store/useCharacterStore.ts` 実装
  - addCharacter, removeCharacter, updateCharacter
  - addTemplate, removeTemplate
  - バージョン管理機能
- **Refactor**: 状態管理最適化

#### 【x】1-3. LocalStorage統合（1時間）
- **Red**: 永続化テスト
- **Green**: `lib/storage.ts` 実装
- **Refactor**: デバウンス処理

---

## Phase 2: UIコンポーネント実装（予定工数: 10時間）

### タスク

#### 【x】2-1. Headerコンポーネント（1時間）
- **Red**: Header表示テスト
- **Green**: ヘッダーUI実装
- **Refactor**: レイアウト調整

#### 【x】2-2. CharacterCardコンポーネント（2時間）
- **Red**: カード表示テスト
- **Green**: サムネイル、タグ、コピーボタン実装
- **Refactor**: React.memo適用

#### 【x】2-3. CharacterGridコンポーネント（2時間）
- **Red**: グリッドレイアウトテスト
- **Green**: レスポンシブグリッド実装
- **Refactor**: パフォーマンス最適化

#### 【x】2-4. CharacterFormコンポーネント（3時間）
- **Red**: フォーム入力テスト
- **Green**: 入力フォームUI実装
  - 名前、外見、性格、背景、タグ入力
- **Refactor**: バリデーション追加

#### 【x】2-5. PromptPreviewコンポーネント（1時間）
- **Red**: プレビュー表示テスト
- **Green**: リアルタイムプレビュー実装
- **Refactor**: テンプレート切り替え

#### 【x】2-6. SearchBar & TagFilterコンポーネント（1時間）
- **Red**: 検索・フィルターテスト
- **Green**: 検索バー、タグフィルターUI実装
- **Refactor**: リアルタイムフィルタリング

---

## Phase 3: プロンプト生成エンジン実装（予定工数: 4時間）

### タスク

#### 【x】3-1. プロンプト生成ロジック（2時間）
- **Red**: プロンプト生成テスト
- **Green**: `lib/promptGenerator.ts` 実装
  ```typescript
  function generatePrompt(character: Character, template: PromptTemplate): string
  ```
- **Refactor**: 変数置換最適化

#### 【x】3-2. テンプレートエンジン（2時間）
- **Red**: テンプレート処理テスト
- **Green**: `lib/templateEngine.ts` 実装
  - 変数抽出（{{name}}, {{appearance}}等）
  - マッピング・置換
- **Refactor**: 正規表現最適化

---

## Phase 4: ワンクリックコピー機能実装（予定工数: 2時間）

### タスク

#### 【x】4-1. Clipboard API統合（1時間）
- **Red**: コピー機能テスト
- **Green**: Clipboard API実装、フォールバック処理
- **Refactor**: ブラウザ互換性対応

#### 【x】4-2. 視覚的フィードバック（1時間）
- **Red**: トーストメッセージテスト
- **Green**: コピー成功時のフィードバック実装
- **Refactor**: アニメーション調整

---

## Phase 5: エクスポート/インポート機能実装（予定工数: 4時間）

### タスク

#### 【x】5-1. JSON/CSVエクスポート（2時間）
- **Red**: エクスポートテスト
- **Green**: `lib/exportUtils.ts` 実装
  ```typescript
  function exportJSON(characters: Character[]): string
  function exportCSV(characters: Character[]): string
  ```
- **Refactor**: フォーマット最適化

#### 【x】5-2. ExportDialogコンポーネント（1時間）
- **Red**: ダイアログ表示テスト
- **Green**: モーダルUI実装
- **Refactor**: UX改善

#### 【x】5-3. インポート機能（1時間）
- **Red**: インポートテスト
- **Green**: JSON解析、データ検証実装
- **Refactor**: エラーハンドリング

---

## Phase 6: バージョン管理機能実装（予定工数: 3時間）

### タスク

#### 【x】6-1. バージョン履歴保存（2時間）
- **Red**: バージョン保存テスト
- **Green**: スナップショット作成、履歴保存実装
- **Refactor**: 最大10件制限実装

#### 【x】6-2. バージョン復元機能（1時間）
- **Red**: 復元テスト
- **Green**: 過去バージョン復元UI実装
- **Refactor**: 差分表示（optional）

---

## Phase 7: AI機能実装（Gemini API）（予定工数: 10時間）

### タスク

#### 【x】7-1. Gemini API統合（1時間）
- **Red**: API接続テスト（モック）
- **Green**: `lib/geminiService.ts` 実装、@google/genai インストール
- **Refactor**: エラーハンドリング
- **完了**: geminiService.tsとテスト実装完了

#### 【x】7-2. キャラクター設定自動補完（3時間）
- **Red**: 自動生成テスト
- **Green**: generateCharacter 実装
  - ユーザー入力→Gemini API送信
  - レスポンスパース→フォーム自動入力
- **Refactor**: プロンプト最適化
- **完了**: AICharacterGenerator.tsx実装、メインUIに統合

#### 【x】7-3. プロンプト最適化機能（2時間）
- **Red**: 最適化テスト
- **Green**: optimizePrompt 実装
  - 日本語→英語変換
  - 対象AI別最適化
- **Refactor**: プロンプト改善
- **完了**: geminiService.tsにoptimizePrompt関数実装

#### 【x】7-4. 設定の一貫性チェック（2時間）
- **Red**: 一貫性チェックテスト
- **Green**: checkConsistency 実装
  - 矛盾検出、改善提案
- **Refactor**: 検出精度向上
- **完了**: geminiService.tsにcheckConsistency関数実装

#### 【x】7-5. 関連キャラの提案（2時間）
- **Red**: 関連キャラ生成テスト
- **Green**: suggestRelatedCharacter 実装
- **Refactor**: パターン最適化
- **完了**: geminiService.tsにsuggestRelatedCharacter関数実装

---

## Phase 8: 画像生成機能実装（Imagen 3）（予定工数: 4時間）

### タスク

#### 【x】8-1. Imagen 3 API統合（1時間）
- **Red**: 画像生成テスト（モック）
- **Green**: `lib/imagenService.ts` 実装
- ⚠️ **課金警告**: UI上に明確な課金警告表示
- **Refactor**: エラーハンドリング
- **完了**: imagenService.ts実装、課金警告機能含む

#### 【x】8-2. AIImageGeneratorコンポーネント（2時間）
- **Red**: UI表示テスト
- **Green**: 画像生成UI実装
  - 課金警告表示必須
  - ユーザー同意取得
  - 生成・サムネイル設定
- **Refactor**: UX改善
- **完了**: AIImageGenerator.tsx実装、課金同意チェックボックス含む

#### 【x】8-3. 複数バリエーション生成（1時間）
- **Red**: 複数画像生成テスト
- **Green**: バリエーション選択UI実装
- **Refactor**: 選択フロー改善
- **完了**: generateImageVariations関数とグリッド表示UI実装

---

## Phase 9: エラーハンドリング・バリデーション（予定工数: 3時間）

### タスク

#### 【x】9-1. 入力バリデーション（1時間）
- **Red**: バリデーションテスト
- **Green**: キャラ名必須、タグサニタイズ実装
- **Refactor**: エラーメッセージ改善
- **完了**: CharacterFormにrequired属性実装済み

#### 【x】9-2. Gemini APIエラーハンドリング（1時間）
- **Red**: APIエラーテスト
- **Green**: レート制限、ネットワークエラー処理
- **Refactor**: ユーザーフィードバック
- **完了**: geminiService.tsにエラーハンドリング実装

#### 【x】9-3. Imagen 3 APIエラーハンドリング（1時間）
- **Red**: 画像生成エラーテスト
- **Green**: 課金未設定、安全性フィルターエラー処理
- **Refactor**: フォールバック実装
- **完了**: imagenService.tsに課金エラー、安全性フィルターエラー処理実装

---

## Phase 10: E2Eテスト・統合テスト（予定工数: 4時間）

### タスク

#### 【x】10-1. キャラクター作成シナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: アサーション強化
- **完了**: Playwrightでキャラクター作成フロー完全カバー

#### 【x】10-2. プロンプトコピーシナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: Clipboard検証
- **完了**: コピーボタンとフィードバック表示テスト実装

#### 【x】10-3. エクスポート/インポートシナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: データ整合性確認
- **完了**: エクスポート/インポートダイアログのテスト実装

#### 【x】10-4. AI機能統合テスト（1時間）
- **Red**: AI機能E2Eテスト作成
- **Green**: モックAPI使用テスト
- **Refactor**: テスト安定性向上
- **完了**: API設定とAI生成ダイアログのテスト実装

---

## Phase 11: デプロイ準備・最終調整（予定工数: 2時間）

### タスク

#### 【x】11-1. 静的エクスポート設定（30分）
- next.config.js 設定
- ビルドエラー修正
- **完了**: output: 'export'設定、Google Fonts削除

#### 【x】11-2. ビルド・動作確認（1時間）
- `npm run build` 実行
- 全機能動作確認
- **完了**: 静的ビルド成功、out/ディレクトリ生成

#### 【x】11-3. README作成（30分）
- セットアップ手順、使い方、課金警告記述
- **完了**: 包括的なREADME作成、AI機能の課金警告を明記

---

## マイルストーン

### M1: 基本機能実装完了（Phase 0-4）
- 期限: 開始から1週間
- 完了条件: キャラ作成、プロンプト生成、コピー機能が動作

### M2: 拡張機能実装完了（Phase 5-6）
- 期限: 開始から2週間
- 完了条件: エクスポート/インポート、バージョン管理が動作

### M3: AI機能実装完了（Phase 7-8）
- 期限: 開始から3週間
- 完了条件: Gemini API, Imagen 3が動作

### M4: 品質保証・デプロイ準備完了（Phase 9-11）
- 期限: 開始から4週間
- 完了条件: 全テストパス、カバレッジ80%以上

---

## リスク管理

### 高リスク項目
1. **Imagen 3課金**: 無料枠なし、ユーザー負担
   - 対策: UI上に明確な課金警告、同意取得必須
2. **Gemini APIレート制限**: 無料枠超過
   - 対策: レート制限エラー処理、キャッシュ実装

---

## 品質チェックリスト

### UX品質
- [ ] キャラ作成が3分以内
- [ ] プロンプトコピーが1クリック
- [ ] AI機能の課金警告が明確
- [ ] 画像生成の待ち時間に適切なフィードバック
