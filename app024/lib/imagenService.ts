/**
 * Imagen 3 API Service
 * ⚠️ 課金対象（無料枠なし）
 * キャラクター画像生成機能
 */

/**
 * 画像生成オプション
 */
export interface ImageGenerationOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16';
  numberOfImages?: number;
  safetyLevel?: 'block_few' | 'block_some' | 'block_most';
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
 * ⚠️ この機能は課金対象です（無料枠なし）
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
    aspectRatio = '1:1',
    numberOfImages = 1,
    safetyLevel = 'block_some',
  } = options;

  // Imagen 3 API endpoint (Google AI Studio)
  // Note: 実際のエンドポイントは Google AI Studio のドキュメントを参照
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt,
          },
        ],
        parameters: {
          sampleCount: numberOfImages,
          aspectRatio,
          safetySetting: safetyLevel,
          personGeneration: 'allow_adult', // キャラクター生成を許可
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Imagen API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // Extract base64 images from response
    const images: string[] = [];
    if (data.predictions && Array.isArray(data.predictions)) {
      for (const prediction of data.predictions) {
        if (prediction.bytesBase64Encoded) {
          images.push(`data:image/png;base64,${prediction.bytesBase64Encoded}`);
        } else if (prediction.mimeType && prediction.bytesBase64Encoded) {
          images.push(`data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`);
        }
      }
    }

    // 推定コスト計算（1画像あたり約$0.04）
    const estimatedCost = numberOfImages * 0.04;

    return {
      images,
      cost: estimatedCost,
    };
  } catch (error) {
    if (error instanceof Error) {
      // エラーメッセージを分かりやすく変換
      if (error.message.includes('403') || error.message.includes('billing')) {
        throw new Error('GCP Billingが有効化されていません。画像生成機能は課金必須です。');
      } else if (error.message.includes('safety')) {
        throw new Error('安全性フィルターにより画像生成がブロックされました。');
      }
      throw error;
    }
    throw new Error('画像生成に失敗しました');
  }
}

/**
 * 複数バリエーションの画像生成
 *
 * @param prompt - 画像生成プロンプト
 * @param count - 生成する画像の数
 * @param apiKey - Gemini APIキー
 * @returns 生成された画像のリスト
 */
export async function generateImageVariations(
  prompt: string,
  count: number = 4,
  apiKey?: string
): Promise<ImageGenerationResult> {
  if (count < 1 || count > 8) {
    throw new Error('生成する画像の数は1〜8の範囲で指定してください');
  }

  return generateCharacterImage(
    prompt,
    {
      numberOfImages: count,
      aspectRatio: '1:1',
    },
    apiKey
  );
}
