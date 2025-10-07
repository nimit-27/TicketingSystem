import { act, renderHook } from '@testing-library/react';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('delays updating the value until the timeout expires', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 200 },
    });

    expect(result.current).toBe('initial');

    act(() => {
      rerender({ value: 'updated', delay: 200 });
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(199);
    });

    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('clears pending timers on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });

    act(() => {
      rerender({ value: 'second' });
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
