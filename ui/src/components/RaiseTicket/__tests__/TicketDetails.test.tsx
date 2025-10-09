import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';

const mockUseWatch = jest.fn();

jest.mock('react-hook-form', () => ({
  useWatch: (args: any) => mockUseWatch(args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../utils/permissions', () => ({
  checkFieldAccess: jest.fn(() => true),
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: () => ({ username: 'agent', role: ['ADMIN'] }),
}));

const mockUseApi = jest.fn();

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

const mockGetAllLevels = jest.fn(() => Promise.resolve([]));
const mockGetAllUsersByLevel = jest.fn(() => Promise.resolve([]));

jest.mock('../../../services/LevelService', () => ({
  getAllLevels: (...args: any[]) => mockGetAllLevels(...args),
  getAllUsersByLevel: (...args: any[]) => mockGetAllUsersByLevel(...args),
}));

const mockGetCategories = jest.fn(() => Promise.resolve([]));
const mockGetAllSubCategoriesByCategory = jest.fn(() => Promise.resolve([]));

jest.mock('../../../services/CategoryService', () => ({
  getCategories: (...args: any[]) => mockGetCategories(...args),
  getAllSubCategoriesByCategory: (...args: any[]) => mockGetAllSubCategoriesByCategory(...args),
}));

const mockGetNextStatuses = jest.fn(() => Promise.resolve([]));

jest.mock('../../../services/StatusService', () => ({
  getNextStatusListByStatusId: (...args: any[]) => mockGetNextStatuses(...args),
}));

const mockGetPriorities = jest.fn(() => Promise.resolve([]));

jest.mock('../../../services/PriorityService', () => ({
  getPriorities: (...args: any[]) => mockGetPriorities(...args),
}));

const mockGetSeverities = jest.fn(() => Promise.resolve([]));

jest.mock('../../../services/SeverityService', () => ({
  getSeverities: (...args: any[]) => mockGetSeverities(...args),
}));

jest.mock('../../UI/Dropdown/GenericDropdownController', () => ({
  __esModule: true,
  default: ({ name, label, options, disabled }: any) => (
    <select aria-label={label} name={name} disabled={disabled}>
      {options.map((opt: any) => (
        <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
      ))}
    </select>
  ),
}));

jest.mock('../../CustomFieldset', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

jest.mock('../../UI/Input/CustomFormInput', () => ({
  __esModule: true,
  default: ({ label, name, disabled }: any) => (
    <input aria-label={label} name={name} disabled={disabled} />
  ),
}));

jest.mock('../../UI/FileUpload', () => {
  const mock = jest.fn(({ onFilesChange }: { onFilesChange: (files: File[]) => void }) => (
    <button onClick={() => onFilesChange([new File(['data'], 'file.txt')])}>upload</button>
  ));
  return {
    __esModule: true,
    default: mock,
  };
});

const FileUploadMock = require('../../UI/FileUpload').default as jest.Mock;

jest.mock('../../UI/Icons/InfoIcon', () => ({
  __esModule: true,
  default: ({ content }: { content: React.ReactNode }) => (
    <span data-testid="info-icon">{content ? 'info' : ''}</span>
  ),
}));

const TicketDetails = require('../TicketDetails').default;

describe('TicketDetails', () => {
  const baseProps = {
    register: jest.fn(() => ({})),
    control: {},
    errors: {},
    setValue: jest.fn(),
    disableAll: false,
    subjectDisabled: false,
    attachments: [],
    setAttachments: jest.fn(),
    createMode: true,
  } as any;

  const setupUseApiMocks = () => {
    const handlers: jest.Mock[] = [];
    const makeReturn = (data: any = []) => {
      const handler = jest.fn(async (fn: () => any) => fn());
      handlers.push(handler);
      return { data, pending: false, error: null, apiHandler: handler };
    };

    mockUseApi
      .mockReturnValueOnce(makeReturn([]))
      .mockReturnValueOnce(makeReturn([]))
      .mockReturnValueOnce(makeReturn([{ category: 'Hardware', categoryId: 'cat-1' }]))
      .mockReturnValueOnce(makeReturn([{ subCategory: 'Laptop', subCategoryId: 'sub-1', severityId: 'sev-1' }]))
      .mockReturnValueOnce(makeReturn([]))
      .mockReturnValueOnce(makeReturn([{ id: 'p1', level: 'High', description: 'High impact' }]))
      .mockReturnValueOnce(makeReturn([{ id: 's1', level: 'Critical', description: 'Critical issue' }]));

    return handlers;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReset();
    const watchValues: Record<string, any> = {
      assignedToLevel: 'L0',
      assignToLevel: 'L1',
      category: 'cat-1',
      subject: 'Subject',
      description: 'Description',
      statusId: 'status-1',
    };

    mockUseWatch.mockImplementation(({ name }: { name: string }) => watchValues[name]);
    const permissions = require('../../../utils/permissions');
    permissions.checkFieldAccess.mockReturnValue(true);
  });

  it('fetches initial data on mount', async () => {
    setupUseApiMocks();
    render(<TicketDetails {...baseProps} />);

    await waitFor(() => {
      expect(mockGetAllLevels).toHaveBeenCalled();
      expect(mockGetCategories).toHaveBeenCalled();
      expect(mockGetPriorities).toHaveBeenCalled();
      expect(mockGetSeverities).toHaveBeenCalled();
    });
  });

  it('loads dependent data when values change', async () => {
    setupUseApiMocks();
    render(<TicketDetails {...baseProps} />);

    await waitFor(() => {
      expect(mockGetAllUsersByLevel).toHaveBeenCalledWith('L1');
      expect(mockGetAllSubCategoriesByCategory).toHaveBeenCalledWith('cat-1');
      expect(mockGetNextStatuses).toHaveBeenCalledWith('status-1');
    });
  });

  it('propagates attachment changes through callbacks', async () => {
    setupUseApiMocks();
    render(<TicketDetails {...baseProps} />);

    await waitFor(() => {
      expect(FileUploadMock).toHaveBeenCalled();
    });
    const uploadProps = FileUploadMock.mock.calls[0][0];
    uploadProps.onFilesChange([new File(['data'], 'file.txt')]);

    expect(baseProps.setAttachments).toHaveBeenCalled();
    expect(baseProps.setValue).toHaveBeenCalledWith('attachments', expect.any(Array));
  });
});
