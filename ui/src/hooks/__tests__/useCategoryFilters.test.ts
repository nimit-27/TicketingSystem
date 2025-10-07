jest.mock('../../services/CategoryService', () => ({
  getCategories: jest.fn(),
  getSubCategories: jest.fn(),
}));

jest.mock('../../utils/Utils', () => ({
  getDropdownOptions: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import { useCategoryFilters } from '../useCategoryFilters';
import { getCategories, getSubCategories } from '../../services/CategoryService';
import { getDropdownOptions } from '../../utils/Utils';

describe('useCategoryFilters', () => {
  const defaultOption = { label: 'All', value: 'All' };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCategories as jest.Mock).mockResolvedValue({ data: { body: { data: [] } } });
    (getDropdownOptions as jest.Mock).mockReturnValue([]);
  });

  it('loads category options on mount', async () => {
    (getCategories as jest.Mock).mockResolvedValue({ data: { body: { data: [{ category: 'A' }] } } });
    (getDropdownOptions as jest.Mock).mockReturnValue([{ label: 'Category A', value: '1' }]);

    const { result } = renderHook(() => useCategoryFilters());

    await waitFor(() => expect(result.current.categoryOptions).toHaveLength(2));

    expect(getCategories).toHaveBeenCalled();
    expect(getDropdownOptions).toHaveBeenCalledWith([{ category: 'A' }], 'category', 'categoryId');
    expect(result.current.categoryOptions).toEqual([defaultOption, { label: 'Category A', value: '1' }]);
  });

  it('falls back to the default category option when the request fails', async () => {
    (getCategories as jest.Mock).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCategoryFilters());

    await waitFor(() => expect(result.current.categoryOptions).toEqual([defaultOption]));
  });

  it('resets subcategories when no category is provided', async () => {
    const { result } = renderHook(() => useCategoryFilters());

    await act(async () => {
      await result.current.loadSubCategories();
    });

    expect(result.current.subCategoryOptions).toEqual([defaultOption]);
    expect(getSubCategories).not.toHaveBeenCalled();
  });

  it('loads subcategories for a given category', async () => {
    (getSubCategories as jest.Mock).mockResolvedValue({ data: { body: { data: [{ subCategory: 'B' }] } } });
    (getDropdownOptions as jest.Mock)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{ label: 'Sub', value: '2' }]);

    const { result } = renderHook(() => useCategoryFilters());

    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    await act(async () => {
      await result.current.loadSubCategories('cat-1');
    });

    expect(getSubCategories).toHaveBeenCalledWith('cat-1');
    expect(getDropdownOptions).toHaveBeenLastCalledWith([{ subCategory: 'B' }], 'subCategory', 'subCategoryId');
    expect(result.current.subCategoryOptions).toEqual([defaultOption, { label: 'Sub', value: '2' }]);
  });

  it('resets subcategories when fetching fails', async () => {
    (getSubCategories as jest.Mock).mockRejectedValue(new Error('nope'));
    (getDropdownOptions as jest.Mock).mockReturnValueOnce([]);

    const { result } = renderHook(() => useCategoryFilters());

    await waitFor(() => expect(getCategories).toHaveBeenCalled());

    await act(async () => {
      await result.current.loadSubCategories('cat-2');
    });

    expect(result.current.subCategoryOptions).toEqual([defaultOption]);
  });
});
