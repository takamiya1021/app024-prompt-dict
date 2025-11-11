/**
 * Imagen 4 Image Generation API Service
 * 🎨 新規画像生成向き（imagen-4.0-generate-001: $0.04/画像）
 * キャラクター画像生成機能
 */

import { GoogleGenAI, Modality } from '@google/genai';

/**
 * 画像生成モデル
 */
export type ImageModel = 'imagen-4' | 'gemini-flash-exp';

/**
 * 画像生成オプション
 */
export interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16';
  numberOfImages?: number;
  safetyLevel?: 'block_few' | 'block_some' | 'block_most';
  model?: ImageModel;
}

/**
 * 画像生成結果
 */
export interface ImageGenerationResult {
  images: string[]; // Base64 encoded images
  cost?: number; // 推定コスト（USD）
}

/**
 * キャラクター画像生成
 * 🎨 Imagen 4で新規画像生成（$0.04/画像）
 *
 * @param prompt - 画像生成プロンプト
 * @param options - 生成オプション
 * @param apiKey - Gemini APIキー
 * @returns 生成された画像（Base64）と推定コスト
 */
export async function generateCharacterImage(
  prompt: string,
  options: ImageGenerationOptions = {},
  apiKey?: string
): Promise<ImageGenerationResult> {
  const key =
    apiKey ||
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  if (!key) {
    throw new Error('Gemini API key is not set');
  }

  const {
    numberOfImages = 1,
    model = 'imagen-4',
  } = options;

  // モデルに応じてコストを設定
  const modelConfig = {
    'imagen-4': {
      name: 'imagen-4.0-generate-001',
      cost: 0.04,
      description: 'Imagen 4 - 新規画像生成向き',
    },
    'gemini-flash-exp': {
      name: 'gemini-2.5-flash-image-preview',
      cost: 0.0,
      description: 'nano banana - 無料実験版',
    },
  };

  const selectedModel = modelConfig[model];
  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const images: string[] = [];

    if (model === 'imagen-4') {
      // Imagen 4: generateImages()メソッドを使用
      const response = await ai.models.generateImages({
        model: selectedModel.name,
        prompt: `${prompt}. Create a detailed, high-quality character illustration.`,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/png',
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('APIから画像が返されませんでした。');
      }

      for (const generatedImage of response.generatedImages) {
        if (generatedImage.image?.imageBytes) {
          const base64ImageBytes = generatedImage.image.imageBytes;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          images.push(imageUrl);
        }
      }
    } else {
      // nano banana: generateContent()メソッドを使用
      for (let i = 0; i < numberOfImages; i++) {
        const response = await ai.models.generateContent({
          model: selectedModel.name,
          contents: { parts: [{ text: `${prompt}. Create a detailed, high-quality character illustration.` }] },
          config: { responseModalities: [Modality.IMAGE] },
        });

        if (!response.candidates || response.candidates.length === 0) {
          throw new Error('APIから候補が返されませんでした。');
        }

        let imageFound = false;
        const parts = response.candidates[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData) {
              const imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              images.push(imageDataUrl);
              imageFound = true;
              break;
            }
          }
        }

        if (!imageFound) {
          throw new Error('画像データがレスポンスに含まれていませんでした。');
        }
      }
    }

    // コスト計算: モデルに応じた単価
    const cost = numberOfImages * selectedModel.cost;

    return {
      images,
      cost,
    };
  } catch (error) {
    if (error instanceof Error) {
      // エラーメッセージを分かりやすく変換
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('APIの利用上限に達しました。しばらく待ってから再度お試しください。');
      } else if (error.message.includes('safety')) {
        throw new Error('安全性フィルターにより画像生成がブロックされました。');
      }
      throw error;
    }
    throw new Error('画像生成に失敗しました');
  }
}

/**
 * 画像編集（既存画像を元に編集）
 * nano banana専用
 *
 * @param baseImage - 元画像（data URI形式）
 * @param prompt - 編集指示プロンプト
 * @param count - 生成する画像の数
 * @param apiKey - Gemini APIキー
 * @returns 編集された画像のリスト
 */
export async function editImage(
  baseImage: string,
  prompt: string,
  count: number = 4,
  apiKey?: string
): Promise<ImageGenerationResult> {
  const key =
    apiKey ||
    process.env.GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  if (!key) {
    throw new Error('Gemini API key is not set');
  }

  // data URIからbase64とmimeTypeを抽出
  const dataUrlMatch = baseImage.match(/^data:([^;]+);base64,(.+)$/);
  if (!dataUrlMatch) {
    throw new Error('無効な画像データ形式です');
  }

  const mimeType = dataUrlMatch[1];
  const base64Data = dataUrlMatch[2];

  const ai = new GoogleGenAI({ apiKey: key });

  try {
    const images: string[] = [];

    // nano bananaで画像編集
    for (let i = 0; i < count; i++) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: `Edit this image: ${prompt}. Create a detailed, high-quality character illustration.` }
          ]
        },
        config: { responseModalities: [Modality.IMAGE] },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('APIから候補が返されませんでした。');
      }

      let imageFound = false;
      const parts = response.candidates[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            const imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            images.push(imageDataUrl);
            imageFound = true;
            break;
          }
        }
      }

      if (!imageFound) {
        throw new Error('画像データがレスポンスに含まれていませんでした。');
      }
    }

    return {
      images,
      cost: 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('APIの利用上限に達しました。しばらく待ってから再度お試しください。');
      } else if (error.message.includes('safety')) {
        throw new Error('安全性フィルターにより画像生成がブロックされました。');
      }
      throw error;
    }
    throw new Error('画像編集に失敗しました');
  }
}

/**
 * 複数バリエーションの画像生成
 *
 * @param prompt - 画像生成プロンプト
 * @param count - 生成する画像の数
 * @param apiKey - Gemini APIキー
 * @param model - 画像生成モデル
 * @param baseImage - 元画像（編集モード用、オプション）
 * @returns 生成された画像のリスト
 */
export async function generateImageVariations(
  prompt: string,
  count: number = 4,
  apiKey?: string,
  model: ImageModel = 'imagen-4',
  baseImage?: string
): Promise<ImageGenerationResult> {
  if (count < 1 || count > 8) {
    throw new Error('生成する画像の数は1〜8の範囲で指定してください');
  }

  // 既存画像がある場合は編集モード（nano banana専用）
  if (baseImage) {
    return editImage(baseImage, prompt, count, apiKey);
  }

  // 新規生成モード
  return generateCharacterImage(
    prompt,
    {
      numberOfImages: count,
      aspectRatio: '1:1',
      model,
    },
    apiKey
  );
}
