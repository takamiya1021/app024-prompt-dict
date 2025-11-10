/**
 * Gemini Service Test (TDD - Red Phase)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Character } from '../../types';

// Mock response data
const mockCharacterResponse = {
  name: '桜井あかり',
  appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
  personality: '元気で明るい、語尾に「ね！」を付ける',
  background: '高校2年生、バスケ部所属',
  tags: ['女性', '高校生', '元気'],
};

const mockConsistencyResponse = {
  isConsistent: true,
  issues: [],
  suggestions: [],
};

// Mock Gemini API
const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

describe('geminiService', () => {
  let geminiService: any;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock response
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockCharacterResponse),
      },
    });

    // Dynamic import after mock setup
    const module = await import('../../lib/geminiService');
    geminiService = module;
  });

  describe('generateCharacter', () => {
    it('should generate character from simple prompt', async () => {
      const result = await geminiService.generateCharacter('元気な女子高生', 'test-api-key');

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('appearance');
      expect(result).toHaveProperty('personality');
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('tags');
      expect(Array.isArray(result.tags)).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw error when API key is not set', async () => {
      await expect(
        geminiService.generateCharacter('テスト')
      ).rejects.toThrow('Gemini API key is not set');
    });
  });

  describe('optimizePrompt', () => {
    it('should optimize prompt for target AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'A cheerful high school girl with long black hair, wearing school uniform',
        },
      });

      const mockCharacter: Character = {
        id: 'test-1',
        name: '桜井あかり',
        appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
        personality: '元気で明るい、語尾に「ね！」を付ける',
        background: '高校2年生、バスケ部所属',
        tags: ['女性', '高校生', '元気'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await geminiService.optimizePrompt(mockCharacter, 'stable-diffusion', 'test-api-key');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle different target AIs', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Optimized prompt',
        },
      });

      const mockCharacter: Character = {
        id: 'test-1',
        name: '桜井あかり',
        appearance: '黒髪ロング',
        personality: '元気',
        background: '高校生',
        tags: ['女性'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const targets = ['stable-diffusion', 'dalle', 'midjourney', 'general'] as const;

      for (const target of targets) {
        const result = await geminiService.optimizePrompt(mockCharacter, target, 'test-api-key');
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('checkConsistency', () => {
    it('should check character consistency', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockConsistencyResponse),
        },
      });

      const mockCharacter: Character = {
        id: 'test-1',
        name: '桜井あかり',
        appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
        personality: '元気で明るい、語尾に「ね！」を付ける',
        background: '高校2年生、バスケ部所属',
        tags: ['女性', '高校生', '元気'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await geminiService.checkConsistency(mockCharacter, 'test-api-key');

      expect(result).toHaveProperty('isConsistent');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('suggestions');
      expect(typeof result.isConsistent).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalled();
    });
  });

  describe('suggestRelatedCharacter', () => {
    it('should suggest related character', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            name: '田中ゆい',
            appearance: '茶髪セミロング、穏やかな表情',
            personality: '落ち着いていて優しい',
            background: '高校2年生、あかりの親友',
            tags: ['女性', '高校生', '優しい'],
          }),
        },
      });

      const mockCharacter: Character = {
        id: 'test-1',
        name: '桜井あかり',
        appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
        personality: '元気で明るい、語尾に「ね！」を付ける',
        background: '高校2年生、バスケ部所属',
        tags: ['女性', '高校生', '元気'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await geminiService.suggestRelatedCharacter(mockCharacter, 'friend', 'test-api-key');

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('appearance');
      expect(result).toHaveProperty('personality');
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('tags');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle different relation types', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            name: 'テストキャラ',
            appearance: 'テスト',
            personality: 'テスト',
            background: 'テスト',
            tags: ['テスト'],
          }),
        },
      });

      const mockCharacter: Character = {
        id: 'test-1',
        name: '桜井あかり',
        appearance: '黒髪ロング',
        personality: '元気',
        background: '高校生',
        tags: ['女性'],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const relations = ['friend', 'rival', 'family', 'mentor'] as const;

      for (const relation of relations) {
        const result = await geminiService.suggestRelatedCharacter(mockCharacter, relation, 'test-api-key');
        expect(result).toHaveProperty('name');
      }
    });
  });
});
