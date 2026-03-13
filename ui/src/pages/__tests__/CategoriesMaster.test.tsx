import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockAddCategory = jest.fn(() => Promise.resolve());
const mockAddSubCategory = jest.fn(() => Promise.resolve());
const mockUpdateSubCategory = jest.fn(() => Promise.resolve());
const mockFetchCategories = jest.fn(() => Promise.resolve([{ categoryId: '1', category: 'Existing', subCategories: [] }]));
const mockFetchSubCategories = jest.fn(() => Promise.resolve([
  { subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' },
  { subCategoryId: '11', categoryId: '2', subCategory: 'Other', createdBy: '1', severityId: '' },
]));

const mockUseApi = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/CategoryService', () => ({
  getCategories: () => mockFetchCategories(),
  getAllSubCategories: () => mockFetchSubCategories(),
  addCategory: (...args: unknown[]) => mockAddCategory(...args),
  updateCategory: jest.fn(() => Promise.resolve()),
  deleteCategory: jest.fn(() => Promise.resolve()),
  addSubCategory: (...args: unknown[]) => mockAddSubCategory(...args),
  updateSubCategory: (...args: unknown[]) => mockUpdateSubCategory(...args),
  deleteSubCategory: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../services/SeverityService', () => ({
  getSeverities: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ userId: 'user-1' }),
}));

jest.mock('../../components/UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick, icon }: { onClick: () => void; icon: string }) => (
    <button data-testid={`icon-${icon}`} onClick={onClick}>{icon}</button>
  ),
}));

import CategoriesMaster from '../CategoriesMaster';

describe('CategoriesMaster', () => {
  beforeEach(() => {
    mockAddCategory.mockClear();
    mockAddSubCategory.mockClear();
    mockUpdateSubCategory.mockClear();
    mockFetchCategories.mockClear();
    mockFetchSubCategories.mockClear();
    mockUseApi.mockReset();
    mockAddCategory.mockResolvedValue(undefined);
    mockFetchCategories.mockResolvedValue([{ categoryId: '1', category: 'Existing', subCategories: [] }]);
    mockFetchSubCategories.mockResolvedValue([
      { subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' },
      { subCategoryId: '11', categoryId: '2', subCategory: 'Other', createdBy: '1', severityId: '' },
    ]);

    const apiHandlers: jest.Mock[] = [
      jest.fn((fn: () => Promise<any>) => fn()),
      jest.fn((fn: () => Promise<any>) => fn()),
      jest.fn((fn: () => Promise<any>) => fn()),
      jest.fn((fn: () => Promise<any>) => fn()),
      jest.fn((fn: () => Promise<any>) => fn()),
    ];

    let call = 0;
    mockUseApi.mockImplementation(() => {
      const current = call;
      call += 1;
      switch (current) {
        case 0:
          return {
            data: [{ categoryId: '1', category: 'Existing', subCategories: [] }],
            apiHandler: apiHandlers[current],
          };
        case 1:
          return {
            data: [
              { subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' },
              { subCategoryId: '11', categoryId: '2', subCategory: 'Other', createdBy: '1', severityId: '' },
            ],
            apiHandler: apiHandlers[current],
          };
        case 2:
          return {
            data: null,
            apiHandler: apiHandlers[current],
          };
        case 3:
          return {
            data: null,
            apiHandler: apiHandlers[current],
          };
        case 4:
          return {
            data: [{ id: 'S1', level: 'High', description: 'High severity' }],
            apiHandler: apiHandlers[current],
          };
        default:
          return {
            data: null,
            apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
          };
      }
    });
  });

  it.skip('allows adding a new category when unique name is entered', async () => {
    const { getByLabelText, getByText } = renderWithTheme(<CategoriesMaster />);

    const input = getByLabelText('Category') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Category' } });

    const addButton = getByText('Add Category');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalled();
    });
  });

  it.skip('hides the add button for duplicate category names', () => {
    const { getByLabelText, queryByText } = renderWithTheme(<CategoriesMaster />);

    const input = getByLabelText('Category') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Existing' } });

    expect(queryByText('Add Category')).toBeNull();
    expect(mockAddCategory).not.toHaveBeenCalled();
  });

  it.skip('splits matching and non-matching sub-categories', async () => {
    const { getByLabelText, getByText } = renderWithTheme(<CategoriesMaster />);

    await waitFor(() => {
      expect(mockFetchSubCategories).toHaveBeenCalled();
    });

    const subInput = getByLabelText('Sub-Category') as HTMLInputElement;
    fireEvent.change(subInput, { target: { value: 'Child' } });

    expect(getByText('Child')).toBeInTheDocument();
    expect(getByText('Other')).toBeInTheDocument();
  });

  it.skip('adds a new sub-category with severity when category is selected', async () => {
    const { getByText } = renderWithTheme(<CategoriesMaster />);

    fireEvent.click(getByText('Existing'));
    fireEvent.click(getByText('Add Sub-Category'));

    await waitFor(() => {
      expect(mockAddSubCategory).toHaveBeenCalled();
    });
  });

  it.skip('updates severity for an existing sub-category selection', async () => {
    const { getByText } = renderWithTheme(<CategoriesMaster />);

    fireEvent.click(getByText('Child'));

    await waitFor(() => {
      expect(mockUpdateSubCategory).toHaveBeenCalled();
    });
  });
});
