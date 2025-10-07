jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: jest.fn(),
}));

import { act, renderHook } from '@testing-library/react';

import { useApi } from '../useApi';
import { useSnackbar } from '../../context/SnackbarContext';

describe('useApi', () => {
  const showMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (useSnackbar as jest.Mock).mockReturnValue({ showMessage });
  });

  it('handles successful responses with nested payloads', async () => {
    const { result } = renderHook(() => useApi<{ value: number }>());

    let resolved: { value: number } | null = null;
    await act(async () => {
      resolved = await result.current.apiHandler(() =>
        Promise.resolve({ data: { body: { data: { value: 42 } } } })
      );
    });

    expect(resolved).toEqual({ value: 42 });
    expect(result.current.data).toEqual({ value: 42 });
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(true);
    expect(result.current.pending).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('reports errors returned from successful API calls', async () => {
    const { result } = renderHook(() => useApi<unknown>());

    await act(async () => {
      void result.current.apiHandler(() =>
        Promise.resolve({ data: { body: { success: false, error: { message: 'Oops' } } } })
      );
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Oops');
    expect(result.current.success).toBe(false);
    expect(showMessage).toHaveBeenCalledWith('Oops', 'error');
  });

  it('handles rejected API calls by surfacing the error message', async () => {
    const { result } = renderHook(() => useApi<unknown>());

    await act(async () => {
      void result.current.apiHandler(() => Promise.reject(new Error('Network down')));
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network down');
    expect(result.current.success).toBe(false);
    expect(showMessage).toHaveBeenCalledWith('Network down', 'error');
  });
});
