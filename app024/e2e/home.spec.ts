import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('shows the app header and title', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /キャラプロンプト辞書/i });
    await expect(heading).toBeVisible();
  });

  test('displays action buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /AI生成/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /API設定/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /エクスポート/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /インポート/i })).toBeVisible();
  });
});

test.describe('Character Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('can create a new character', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: /新規作成/i }).click();

    // Wait for form dialog
    await expect(page.getByText(/新規キャラクター作成/i)).toBeVisible();

    // Fill form
    await page.getByLabel(/名前/i).fill('テストキャラクター');
    await page.getByLabel(/外見/i).fill('黒髪、赤い瞳、身長170cm');
    await page.getByLabel(/性格・口調/i).fill('クールで落ち着いている');
    await page.getByLabel(/背景・設定/i).fill('謎の組織に所属する諜報員');
    await page.getByLabel(/タグ/i).fill('男性, スパイ, クール');

    // Submit form
    await page.getByRole('button', { name: /作成/i }).click();

    // Wait for dialog to close
    await expect(page.getByText(/新規キャラクター作成/i)).not.toBeVisible();

    // Verify character card appears
    await expect(page.getByText('テストキャラクター')).toBeVisible();
  });

  test('requires character name', async ({ page }) => {
    await page.getByRole('button', { name: /新規作成/i }).click();

    // Try to submit without name
    await page.getByLabel(/外見/i).fill('黒髪');

    // Submit button should work but HTML5 validation will prevent submission
    const submitButton = page.getByRole('button', { name: /作成/i });
    await submitButton.click();

    // Form should still be visible (validation prevented submission)
    await expect(page.getByText(/新規キャラクター作成/i)).toBeVisible();
  });

  test('can cancel character creation', async ({ page }) => {
    await page.getByRole('button', { name: /新規作成/i }).click();
    await expect(page.getByText(/新規キャラクター作成/i)).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: /キャンセル/i }).click();

    // Dialog should close
    await expect(page.getByText(/新規キャラクター作成/i)).not.toBeVisible();
  });
});

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Create test characters
    await createCharacter(page, {
      name: '山田太郎',
      appearance: '黒髪',
      personality: '明るい',
      background: '高校生',
      tags: '男性, 高校生',
    });

    await createCharacter(page, {
      name: '佐藤花子',
      appearance: '茶髪',
      personality: '優しい',
      background: '教師',
      tags: '女性, 教師',
    });
  });

  test('can search characters by name', async ({ page }) => {
    // Search for first character
    await page.getByPlaceholder(/キャラクター名で検索/i).fill('山田');

    // Should show only matching character
    await expect(page.getByText('山田太郎')).toBeVisible();
    await expect(page.getByText('佐藤花子')).not.toBeVisible();
  });

  test('can filter characters by tag', async ({ page }) => {
    // Wait for tags to appear
    await expect(page.getByText('男性')).toBeVisible();

    // Click tag filter
    await page.getByText('男性').click();

    // Should show only matching character
    await expect(page.getByText('山田太郎')).toBeVisible();
    await expect(page.getByText('佐藤花子')).not.toBeVisible();
  });
});

test.describe('Prompt Copy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await createCharacter(page, {
      name: 'コピーテスト',
      appearance: '青い髪',
      personality: '元気',
      background: 'テストキャラ',
      tags: 'テスト',
    });
  });

  test('can copy character prompt', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Find and click copy button
    const copyButton = page.getByRole('button', { name: /コピー/i }).first();
    await copyButton.click();

    // Verify feedback message
    await expect(page.getByText(/コピーしました/i)).toBeVisible();

    // Wait for feedback to disappear
    await expect(page.getByText(/コピーしました/i)).not.toBeVisible({ timeout: 4000 });
  });
});

test.describe('Export and Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await createCharacter(page, {
      name: 'エクスポートテスト',
      appearance: '緑の髪',
      personality: '静か',
      background: 'テスト用',
      tags: 'テスト',
    });
  });

  test('can open export dialog', async ({ page }) => {
    await page.getByRole('button', { name: /エクスポート/i }).click();

    // Export dialog should appear
    await expect(page.getByText(/エクスポート形式/i)).toBeVisible();
  });

  test('can open import dialog', async ({ page }) => {
    await page.getByRole('button', { name: /インポート/i }).click();

    // Import dialog should appear
    await expect(page.getByText(/JSONファイルをインポート/i)).toBeVisible();
  });
});

test.describe('API Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can open API settings dialog', async ({ page }) => {
    await page.getByRole('button', { name: /API設定/i }).click();

    // Settings dialog should appear
    await expect(page.getByText(/API Settings/i)).toBeVisible();
    await expect(page.getByLabel(/Gemini API Key/i)).toBeVisible();
  });

  test('can save API key', async ({ page }) => {
    await page.getByRole('button', { name: /API設定/i }).click();

    // Enter API key
    await page.getByLabel(/Gemini API Key/i).fill('test-api-key-12345');

    // Save
    await page.getByRole('button', { name: /保存/i }).click();

    // Success message should appear
    await expect(page.getByText(/APIキーを保存しました/i)).toBeVisible();
  });
});

test.describe('AI Generation Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can open AI generation dialog', async ({ page }) => {
    await page.getByRole('button', { name: /✨ AI生成/i }).click();

    // AI generation dialog should appear
    await expect(page.getByText(/AI キャラクター生成/i)).toBeVisible();
    await expect(page.getByPlaceholder(/例: 元気な女子高生/i)).toBeVisible();
  });

  test('shows warning when API key is not set', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('gemini_api_key'));
    await page.getByRole('button', { name: /✨ AI生成/i }).click();

    // Warning should appear
    await expect(page.getByText(/APIキーを設定すると/i)).toBeVisible();
  });
});

// Helper function to create a character
async function createCharacter(page: any, data: {
  name: string;
  appearance: string;
  personality: string;
  background: string;
  tags: string;
}) {
  await page.getByRole('button', { name: /新規作成/i }).click();
  await page.getByLabel(/名前/i).fill(data.name);
  await page.getByLabel(/外見/i).fill(data.appearance);
  await page.getByLabel(/性格・口調/i).fill(data.personality);
  await page.getByLabel(/背景・設定/i).fill(data.background);
  await page.getByLabel(/タグ/i).fill(data.tags);
  await page.getByRole('button', { name: /作成/i }).click();

  // Wait for creation to complete
  await page.waitForTimeout(500);
}
