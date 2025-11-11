/**
 * Gemini API Service
 * キャラクター設定自動補完、プロンプト最適化、一貫性チェック、関連キャラ提案
 */

import { GoogleGenAI } from '@google/genai';
import type { Character } from '../types';

/**
 * Gemini APIクライアント初期化
 */
function getGeminiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  if (!key) {
    throw new Error('Gemini API key is not set');
  }

  return new GoogleGenAI({ apiKey: key });
}

/**
 * JSON形式のレスポンスをパース
 */
function parseJSONResponse(text: string): any {
  try {
    // コードブロックを除去（```json ... ```）
    const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}

/**
 * キャラクター設定自動補完
 * @param prompt - ユーザー入力（例: "元気な女子高生"）
 * @param apiKey - Gemini APIキー（オプション）
 * @returns 生成されたキャラクター設定
 */
export async function generateCharacter(
  prompt: string,
  apiKey?: string
): Promise<{
  name: string;
  appearance: string;
  personality: string;
  background: string;
  tags: string[];
}> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const systemPrompt = `以下のキャラクター設定から、詳細なキャラクター情報を生成してください。

入力: ${prompt}

以下のJSON形式で出力してください：
{
  "name": "キャラクター名",
  "appearance": "外見の詳細（髪型、目の色、身長、服装など）",
  "personality": "性格・口調の詳細",
  "background": "背景・設定",
  "tags": ["タグ1", "タグ2", "タグ3"]
}

JSONのみを出力してください。説明文は不要です。`;

  const result = await model.generateContent(systemPrompt);
  const response = result.response;
  const text = response.text();

  return parseJSONResponse(text);
}

/**
 * プロンプト最適化
 * @param character - キャラクターデータ
 * @param targetAI - 対象AI
 * @param apiKey - Gemini APIキー（オプション）
 * @returns 最適化されたプロンプト
 */
export async function optimizePrompt(
  character: Character,
  targetAI: 'stable-diffusion' | 'dalle' | 'midjourney' | 'general',
  apiKey?: string
): Promise<string> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const aiInstructions: Record<typeof targetAI, string> = {
    'stable-diffusion': 'Stable Diffusion用に最適化（タグ形式、具体的な描写、品質タグを含む）',
    'dalle': 'DALL-E用に最適化（自然な英語文、詳細な描写）',
    'midjourney': 'Midjourney用に最適化（--ar等のパラメータ推奨、芸術的な表現）',
    'general': '一般的な画像生成AI用に最適化（明確で具体的な英語表現）',
  };

  const systemPrompt = `以下のキャラクター設定を${aiInstructions[targetAI]}してください。

キャラクター情報:
- 名前: ${character.name}
- 外見: ${character.appearance}
- 性格: ${character.personality}
- 背景: ${character.background}
- タグ: ${character.tags.join(', ')}

${targetAI}で画像生成する際に最適な英語プロンプトを生成してください。
プロンプトのみを出力し、説明文は不要です。`;

  const result = await model.generateContent(systemPrompt);
  const response = result.response;
  return response.text().trim();
}

/**
 * 設定の一貫性チェック
 * @param character - キャラクターデータ
 * @param apiKey - Gemini APIキー（オプション）
 * @returns 一貫性チェック結果
 */
export async function checkConsistency(
  character: Character,
  apiKey?: string
): Promise<{
  isConsistent: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const systemPrompt = `以下のキャラクター設定に矛盾や不自然な点がないかチェックしてください。

キャラクター情報:
${JSON.stringify(character, null, 2)}

以下のJSON形式で出力してください：
{
  "isConsistent": true/false,
  "issues": ["問題点1", "問題点2"],
  "suggestions": ["改善提案1", "改善提案2"]
}

問題がない場合は、issuesとsuggestionsを空配列にしてください。
JSONのみを出力してください。説明文は不要です。`;

  const result = await model.generateContent(systemPrompt);
  const response = result.response;
  const text = response.text();

  return parseJSONResponse(text);
}

/**
 * 関連キャラの提案
 * @param baseCharacter - 基準キャラクター
 * @param relation - 関係性タイプ
 * @param apiKey - Gemini APIキー（オプション）
 * @returns 提案された関連キャラクター
 */
export async function suggestRelatedCharacter(
  baseCharacter: Character,
  relation: 'friend' | 'rival' | 'family' | 'mentor',
  apiKey?: string
): Promise<Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'version'>> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const relationDescriptions: Record<typeof relation, string> = {
    friend: '親友',
    rival: 'ライバル',
    family: '家族',
    mentor: 'メンター（師匠）',
  };

  const systemPrompt = `以下のキャラクターの${relationDescriptions[relation]}となるキャラクターを生成してください。

基準キャラクター:
- 名前: ${baseCharacter.name}
- 外見: ${baseCharacter.appearance}
- 性格: ${baseCharacter.personality}
- 背景: ${baseCharacter.background}
- タグ: ${baseCharacter.tags.join(', ')}

${relationDescriptions[relation]}として適切なキャラクターを、以下のJSON形式で出力してください：
{
  "name": "キャラクター名",
  "appearance": "外見の詳細",
  "personality": "性格・口調",
  "background": "背景・設定（${baseCharacter.name}との関係性を含む）",
  "tags": ["タグ1", "タグ2", "タグ3"]
}

JSONのみを出力してください。説明文は不要です。`;

  const result = await model.generateContent(systemPrompt);
  const response = result.response;
  const text = response.text();

  const generated = parseJSONResponse(text);

  return {
    name: generated.name,
    appearance: generated.appearance,
    personality: generated.personality,
    background: generated.background,
    tags: generated.tags,
  };
}
