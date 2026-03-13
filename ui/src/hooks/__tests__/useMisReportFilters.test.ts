import { act, renderHook } from '@testing-library/react';

jest.mock('xlsx', () => {
  const mock = { utils: { decode_range: jest.fn(), encode_cell: jest.fn() } };
  return { __esModule: true, default: mock, ...mock };
}, { virtual: true });
import { useMisReportFilters } from '../useMisReportFilters';
import { useCategoryFilters } from '../useCategoryFilters';
import { getCurrentUserDetails } from '../../config/config';

jest.mock('../useCategoryFilters');
jest.mock('../../config/config');

describe('useMisReportFilters', () => {
  const loadSubCategories = jest.fn();
  const resetSubCategories = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCategoryFilters as jest.Mock).mockReturnValue({
      categoryOptions: [{ value: 'All', label: 'All' }, { value: 'cat-1', label: 'Category 1' }],
      subCategoryOptions: [{ value: 'All', label: 'All' }, { value: 'sub-1', label: 'Sub 1' }],
      loadSubCategories,
      resetSubCategories,
    });
  });

  it('initializes with user scope for non-admin and resets sub-categories for All', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-9', role: ['User'] });

    const { result } = renderHook(() => useMisReportFilters());

    expect(result.current.viewScope).toBe('user');
    expect(result.current.requestParams.userId).toBe('u-9');
    expect(result.current.requestParams.categoryId).toBeUndefined();
    expect(result.current.requestParams.subCategoryId).toBeUndefined();
    expect(resetSubCategories).toHaveBeenCalled();
  });

  it('uses all scope for admin role', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'admin-1', role: ['System Administrator'] });

    const { result } = renderHook(() => useMisReportFilters());

    expect(result.current.viewScope).toBe('all');
    expect(result.current.requestParams.scope).toBe('all');
  });

  it('updates time scale and picks first default time range for the scale', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-1', role: [] });
    const { result } = renderHook(() => useMisReportFilters());

    act(() => {
      result.current.handleTimeScaleChange({ target: { value: 'WEEKLY' } } as any);
    });

    expect(result.current.timeScale).toBe('WEEKLY');
    expect(result.current.timeRange).toBe('LAST_4_WEEKS');
  });

  it('updates explicit time range', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-1', role: [] });
    const { result } = renderHook(() => useMisReportFilters());

    act(() => {
      result.current.handleTimeRangeChange({ target: { value: 'LAST_7_DAYS' } } as any);
    });

    expect(result.current.timeRange).toBe('LAST_7_DAYS');
  });

  it('handles custom month range changes and forces monthly custom range', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-1', role: [] });
    const { result } = renderHook(() => useMisReportFilters());

    act(() => {
      result.current.handleCustomMonthRangeChange('start')({ target: { value: '2021' } } as any);
      result.current.handleCustomMonthRangeChange('end')({ target: { value: '' } } as any);
    });

    expect(result.current.customMonthRange).toEqual({ start: 2021, end: null });
    expect(result.current.timeScale).toBe('MONTHLY');
    expect(result.current.timeRange).toBe('CUSTOM_MONTH_RANGE');
  });

  it('updates custom from/to dates and normalizes invalid ranges', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-1', role: [] });
    const { result } = renderHook(() => useMisReportFilters());

    act(() => {
      result.current.handleDateChange('to')({ target: { value: '2025-02-10' } } as any);
      result.current.handleDateChange('from')({ target: { value: '2025-02-12' } } as any);
    });

    expect(result.current.activeDateRange).toEqual({ from: '2025-02-12', to: '2025-02-12' });
    expect(result.current.timeScale).toBe('CUSTOM');
    expect(result.current.timeRange).toBe('CUSTOM_DATE_RANGE');

    act(() => {
      result.current.handleDateChange('to')({ target: { value: '2025-02-11' } } as any);
    });
    expect(result.current.activeDateRange).toEqual({ from: '2025-02-11', to: '2025-02-11' });
  });

  it('loads subcategories and updates request params when category/subcategory selected', () => {
    (getCurrentUserDetails as jest.Mock).mockReturnValue({ userId: 'u-1', role: [] });
    const { result } = renderHook(() => useMisReportFilters());

    act(() => {
      result.current.handleCategoryChange({ target: { value: 'cat-1' } } as any);
    });

    expect(loadSubCategories).toHaveBeenCalledWith('cat-1');
    expect(result.current.selectedSubCategory).toBe('All');
    expect(result.current.requestParams.categoryId).toBe('cat-1');
    expect(result.current.requestParams.subCategoryId).toBeUndefined();

    act(() => {
      result.current.handleSubCategoryChange({ target: { value: 'sub-1' } } as any);
    });

    expect(result.current.requestParams.subCategoryId).toBe('sub-1');

    act(() => {
      result.current.handleCategoryChange({ target: { value: 'All' } } as any);
    });

    expect(resetSubCategories).toHaveBeenCalled();
    expect(result.current.requestParams.categoryId).toBeUndefined();
  });
});
