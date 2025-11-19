import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockAddCategory = jest.fn(() => Promise.resolve());
const mockFetchCategories = jest.fn(() => Promise.resolve([{ categoryId: '1', category: 'Existing', subCategories: [] }]));
const mockFetchSubCategories = jest.fn(() => Promise.resolve([
  { subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' },
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
  addSubCategory: jest.fn(() => Promise.resolve()),
  updateSubCategory: jest.fn(() => Promise.resolve()),
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
    mockFetchCategories.mockClear();
    mockFetchSubCategories.mockClear();
    mockUseApi.mockReset();
    mockAddCategory.mockResolvedValue(undefined);
    mockFetchCategories.mockResolvedValue([{ categoryId: '1', category: 'Existing', subCategories: [] }]);
    mockFetchSubCategories.mockResolvedValue([
      { subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' },
    ]);

    let call = 0;
    mockUseApi.mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          data: [{ categoryId: '1', category: 'Existing', subCategories: [] }],
          apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
        };
      }
      if (call === 2) {
        return {
          data: [{ subCategoryId: '10', categoryId: '1', subCategory: 'Child', createdBy: '1', severityId: 'S1' }],
          apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
        };
      }
      if (call === 3) {
        return {
          data: [{ id: 'S1', level: 'High', description: 'High severity' }],
          apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
        };
      }
      return {
        data: null,
        apiHandler: jest.fn((fn: () => Promise<any>) => fn()),
      };
    });
  });

  it('allows adding a new category when unique name is entered', async () => {
    const { getByLabelText, getByText } = renderWithTheme(<CategoriesMaster />);

    const input = getByLabelText('Category') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Category' } });

    const addButton = getByText('Add Category');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalled();
    });
  });
});
