/**
 * AICharacterGenerator Component Test (TDD - Red Phase)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import AICharacterGenerator from '../../app/components/AICharacterGenerator';

// Mock geminiService
jest.mock('../../lib/geminiService', () => ({
  generateCharacter: jest.fn().mockResolvedValue({
    name: '桜井あかり',
    appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
    personality: '元気で明るい、語尾に「ね！」を付ける',
    background: '高校2年生、バスケ部所属',
    tags: ['女性', '高校生', '元気'],
  }),
}));

describe('AICharacterGenerator', () => {
  it('should render input field and generate button', () => {
    const mockOnGenerate = jest.fn();
    render(<AICharacterGenerator onGenerate={mockOnGenerate} />);

    expect(screen.getByPlaceholderText(/例: 元気な女子高生/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI生成/i })).toBeInTheDocument();
  });

  it('should call generateCharacter and onGenerate when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnGenerate = jest.fn();

    render(<AICharacterGenerator onGenerate={mockOnGenerate} apiKey="test-key" />);

    const input = screen.getByPlaceholderText(/例: 元気な女子高生/i);
    const button = screen.getByRole('button', { name: /AI生成/i });

    await user.type(input, '元気な女子高生');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith({
        name: '桜井あかり',
        appearance: '黒髪ロング、大きな瞳、身長155cm、制服姿',
        personality: '元気で明るい、語尾に「ね！」を付ける',
        background: '高校2年生、バスケ部所属',
        tags: ['女性', '高校生', '元気'],
      });
    });
  });

  it('should show loading state during generation', async () => {
    const user = userEvent.setup();
    const mockOnGenerate = jest.fn();

    render(<AICharacterGenerator onGenerate={mockOnGenerate} apiKey="test-key" />);

    const input = screen.getByPlaceholderText(/例: 元気な女子高生/i);

    await user.type(input, '元気な女子高生');

    const button = screen.getByRole('button', { name: /AI生成/i });
    await user.click(button);

    // Check loading state appears (button text changes to "生成中...")
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /生成中/i })).toBeInTheDocument();
    });
  });

  it('should show warning when API key is missing', () => {
    const mockOnGenerate = jest.fn();

    render(<AICharacterGenerator onGenerate={mockOnGenerate} />);

    // Should show warning message about missing API key
    expect(screen.getByText(/APIキーを設定すると、AI生成機能が利用できます/i)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const mockOnGenerate = jest.fn();

    // Temporarily override mock to reject
    const geminiService = await import('../../lib/geminiService');
    const originalMock = geminiService.generateCharacter;
    (geminiService.generateCharacter as jest.Mock) = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<AICharacterGenerator onGenerate={mockOnGenerate} apiKey="test-key" />);

    const input = screen.getByPlaceholderText(/例: 元気な女子高生/i);
    const button = screen.getByRole('button', { name: /AI生成/i });

    await user.type(input, 'テスト');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/生成に失敗しました/i)).toBeInTheDocument();
    });

    // Restore original mock
    (geminiService.generateCharacter as jest.Mock) = originalMock as jest.Mock;
  });

  it('should disable button when input is empty', () => {
    const mockOnGenerate = jest.fn();
    render(<AICharacterGenerator onGenerate={mockOnGenerate} />);

    const button = screen.getByRole('button', { name: /AI生成/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when input has value', async () => {
    const user = userEvent.setup();
    const mockOnGenerate = jest.fn();
    render(<AICharacterGenerator onGenerate={mockOnGenerate} apiKey="test-key" />);

    const input = screen.getByPlaceholderText(/例: 元気な女子高生/i);
    const button = screen.getByRole('button', { name: /AI生成/i });

    expect(button).toBeDisabled();

    await user.type(input, '元気な女子高生');

    expect(button).not.toBeDisabled();
  });
});
