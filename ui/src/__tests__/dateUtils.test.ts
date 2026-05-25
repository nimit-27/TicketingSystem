import { buildApiDateParams, ensureCustomPreset, getPresetDateRange } from '../utils/dateUtils';

describe('dateUtils', () => {
  it('derives preset ranges relative to provided date', () => {
    const now = new Date(Date.UTC(2024, 4, 20, 12));

    expect(getPresetDateRange('LAST_1_WEEK', now)).toEqual({ fromDate: '2024-05-13', toDate: '2024-05-20' });
    expect(getPresetDateRange('LAST_1_MONTH', now)).toEqual({ fromDate: '2024-04-20', toDate: '2024-05-20' });
    expect(getPresetDateRange('ALL', now)).toBeUndefined();
  });

  it('builds API params with day boundaries', () => {
    expect(buildApiDateParams(undefined)).toEqual({});
    expect(buildApiDateParams({ preset: 'ALL' })).toEqual({});
    expect(
      buildApiDateParams({ preset: 'CUSTOM', fromDate: '2024-05-01', toDate: '2024-05-10' })
    ).toEqual({ fromDate: '2024-05-01T00:00:00', toDate: '2024-05-10T23:59:59' });
  });

  it('merges updates into a custom preset', () => {
    const state = { preset: 'CUSTOM', fromDate: '2024-05-01', toDate: '2024-05-10' } as const;

    expect(ensureCustomPreset(state, { toDate: '2024-05-15' })).toEqual({
      preset: 'CUSTOM',
      fromDate: '2024-05-01',
      toDate: '2024-05-15',
    });
  });
});
