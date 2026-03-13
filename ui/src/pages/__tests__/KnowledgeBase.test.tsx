import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';
import KnowledgeBase from '../KnowledgeBase';

const mockInitSession = jest.fn(() => Promise.resolve());

jest.mock('../../services/FilegatorService', () => ({
  initFilegatorSession: (...args: unknown[]) => mockInitSession(...args),
}));

jest.mock('../../config/config', () => ({
  filegatorEnabled: true,
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
    const { container } = renderWithTheme(<KnowledgeBase />);
    const frame = container.querySelector('iframe');
    expect(frame).not.toBeNull();

    await waitFor(() => {
      expect(frame).toHaveAttribute('src', 'http://localhost:8080');
    });
    expect(mockInitSession).toHaveBeenCalled();
  });
});
