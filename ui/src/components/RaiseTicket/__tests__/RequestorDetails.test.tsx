import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, UseFormReturn } from 'react-hook-form';
import RequestorDetails from '../RequestorDetails';

const mockSearchRequesterUsers = jest.fn();
const mockGetUserDetailsWithFallback = jest.fn();
const mockGetStakeholders = jest.fn();

jest.mock('../../../hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: jest.fn(() => ({ userId: 'self-1', username: 'Self User', role: [] })),
  isFciUser: jest.fn(() => false),
  isHelpdesk: jest.fn(() => false),
  FciTheme: {},
}));

jest.mock('../../../utils/permissions', () => ({
  checkFieldAccess: jest.fn(() => true),
}));

jest.mock('../../../services/UserService', () => ({
  getUserDetailsWithFallback: (...args: any[]) => mockGetUserDetailsWithFallback(...args),
  searchRequesterUsers: (...args: any[]) => mockSearchRequesterUsers(...args),
}));

jest.mock('../../../services/StakeholderService', () => ({
  getStakeholders: (...args: any[]) => mockGetStakeholders(...args),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../CustomFieldset', () => ({ title, children }: any) => (
  <section data-testid={`fieldset-${title}`}>{children}</section>
));

jest.mock('../../UI/Input/CustomFormInput', () => ({ label, name }: any) => (
  <div data-testid={`input-${name}`}>{label}</div>
));

jest.mock('../../UI/IconButton/VerifyIconButton', () => (props: any) => (
  <button type="button" onClick={() => props.onClick?.()}>verify</button>
));

jest.mock('../../UI/IconButton/CustomIconButton', () => (props: any) => (
  <button type="button" onClick={props.onClick}>{props.title || 'icon'}</button>
));

jest.mock('../../UI/UserAvatar/UserAvatar', () => ({ name }: any) => (
  <div data-testid="avatar">{name}</div>
));

jest.mock('../../UI/Dropdown/GenericDropdownController', () => ({ label }: any) => (
  <label>{label}</label>
));

const useApiMock = require('../../../hooks/useApi').useApi as jest.Mock;
const checkFieldAccessMock = require('../../../utils/permissions').checkFieldAccess as jest.Mock;
const getCurrentUserDetailsMock = require('../../../config/config').getCurrentUserDetails as jest.Mock;
const isFciUserMock = require('../../../config/config').isFciUser as jest.Mock;
const isHelpdeskMock = require('../../../config/config').isHelpdesk as jest.Mock;

const renderWithForm = (defaultValues: Record<string, any>) => {
  let methods: UseFormReturn<any> | null = null;

  const Wrapper = () => {
    methods = useForm({ defaultValues });
    return <RequestorDetails errors={{}} {...methods} control={methods.control} createMode />;
  };

  const view = render(<Wrapper />);

  if (!methods) {
    throw new Error('Form methods were not initialised');
  }

  return { ...view, form: methods };
};

describe('RequestorDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const defaultResponse = {
      data: null,
      pending: false,
      success: false,
      apiHandler: (cb: () => Promise<any>) => Promise.resolve(cb()),
    } as any;

    const responses = [
      {
        ...defaultResponse,
        data: { name: 'Jane Doe', emailId: 'jane@example.com', mobileNo: '1234567890' },
        success: true,
      },
      { ...defaultResponse },
      { ...defaultResponse, data: [{ id: 1, description: 'Stakeholder' }], success: true },
    ];

    let callIndex = 0;
    useApiMock.mockImplementation(() => responses[callIndex++] || defaultResponse);

    mockSearchRequesterUsers.mockResolvedValue({ items: [], totalPages: 0, totalElements: 0 });
    mockGetUserDetailsWithFallback.mockResolvedValue({
      name: 'Jane Doe',
      emailId: 'jane@example.com',
      mobileNo: '1234567890',
      role: 'Admin',
      office: 'HQ',
    });
    mockGetStakeholders.mockResolvedValue([{ id: 1, description: 'Stakeholder' }]);
    checkFieldAccessMock.mockReturnValue(true);
    getCurrentUserDetailsMock.mockReturnValue({ userId: 'self-1', username: 'Self User', role: [] });
    isFciUserMock.mockReturnValue(false);
    isHelpdeskMock.mockReturnValue(false);
  });

  it('auto-fills current user details in Self mode', async () => {
    const { form } = renderWithForm({ mode: 'Self' });

    // await act(async () => {
    //   form.setValue('userId', 'self-1');
    // });

    await waitFor(() => {
      expect(mockGetUserDetailsWithFallback).toHaveBeenCalledWith('self-1', false);
    });
  });



  it('renders user option details and supports load more option', async () => {
    mockSearchRequesterUsers
      .mockResolvedValueOnce({
        items: [
          {
            requesterUserId: 'u-1',
            name: 'Alice Example',
            username: 'alice',
            mobileNo: '99999',
            emailId: 'alice@example.com',
          },
        ],
        totalPages: 2,
        totalElements: 11,
      })
      .mockResolvedValueOnce({
        items: [
          {
            requesterUserId: 'u-2',
            name: 'Bob User',
            username: 'bob',
            mobileNo: '88888',
            emailId: 'bob@example.com',
          },
        ],
        totalPages: 2,
        totalElements: 11,
      });

    renderWithForm({ mode: 'OnBehalf', stakeholder: '' });

    await userEvent.click((await screen.findByLabelText('Open')));

    expect(await screen.findByText('Alice Example')).toBeInTheDocument();
    expect(screen.getByText('alice • u-1')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();

    await act(async () => {
      screen.getByText('Load more users').click();
    });

    await waitFor(() => {
      expect(mockSearchRequesterUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('selects and clears a requester from autocomplete', async () => {
    mockSearchRequesterUsers.mockResolvedValue({
      items: [
        {
          requesterUserId: 'u-1',
          name: 'Alice Example',
          username: 'alice',
          mobileNo: '99999',
          emailId: 'alice@example.com',
          role: 'Requester',
          office: 'HQ',
        },
      ],
      totalPages: 1,
      totalElements: 1,
    });

    const { form } = renderWithForm({ mode: 'OnBehalf', stakeholder: '' });

    await userEvent.click((await screen.findByLabelText('Open')));

    await userEvent.click(await screen.findByText('Alice Example'));

    await waitFor(() => {
      expect(form.getValues('userId')).toBe('u-1');
      expect(form.getValues('requestorName')).toBe('Alice Example');
    });

    await act(async () => {
      form.setValue('mode', 'Other');
      form.setValue('onBehalfFciUser', true);
    });

    await waitFor(() => {
      expect(form.getValues('requestorName')).toBe('');
    });
  });

  it('shows requester search when mode is not Self', async () => {
    const { form } = renderWithForm({ mode: 'OnBehalf', stakeholder: '' });

    await waitFor(() => {
      expect(mockSearchRequesterUsers).toHaveBeenCalled();
    });

    expect(screen.getByLabelText('Search User')).toBeInTheDocument();
    expect(screen.getByText('Stakeholder')).toBeInTheDocument();

    // await act(async () => {
    //   form.setValue('mode', 'Self');
    //   form.setValue('userId', 'self-1');
    // });

    await waitFor(() => {
      expect(mockGetUserDetailsWithFallback).toHaveBeenCalledWith('self-1', false);
    });
  });
});
