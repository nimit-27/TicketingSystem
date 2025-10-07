import React from 'react';
import { render, waitFor } from '@testing-library/react';
import KnowledgeBase from '../KnowledgeBase';

const mockInitSession = jest.fn(() => Promise.resolve());

jest.mock('../../services/FilegatorService', () => ({
  initFilegatorSession: (...args: unknown[]) => mockInitSession(...args),
}));

describe('KnowledgeBase', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockInitSession.mockClear();
    mockInitSession.mockResolvedValue(undefined);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('initializes filegator session and sets iframe src', async () => {
    const { container } = render(<KnowledgeBase />);
    const frame = container.querySelector('iframe');
    expect(frame).not.toBeNull();

    await waitFor(() => {
      expect(frame).toHaveAttribute('src', 'http://localhost:8080');
    });
    expect(mockInitSession).toHaveBeenCalled();
  });
});
