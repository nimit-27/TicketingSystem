import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockUseApi = jest.fn();
const mockSearchHelpdeskUsers = jest.fn();
const mockSearchRequesterUsers = jest.fn();
const mockGetAllRoles = jest.fn();
const mockGetStakeholders = jest.fn();
const mockGetRequesterOfficeTypes = jest.fn();
const mockGetZones = jest.fn();
const mockGetRegions = jest.fn();
const mockGetDistricts = jest.fn();
const mockAppointRequesterAsRno = jest.fn();
const mockShowMessage = jest.fn();
const mockCheckAccessMaster = jest.fn();

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useNavigate: () => navigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

let requesterTableProps: any = null;
let helpdeskTableProps: any = null;

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/UserService', () => ({
  searchHelpdeskUsers: (...args: unknown[]) => mockSearchHelpdeskUsers(...args),
  searchRequesterUsers: (...args: unknown[]) => mockSearchRequesterUsers(...args),
  getRequesterOfficeTypes: () => mockGetRequesterOfficeTypes(),
  appointRequesterAsRno: (...args: unknown[]) => mockAppointRequesterAsRno(...args),
}));

jest.mock('../../services/RoleService', () => ({
  getAllRoles: () => mockGetAllRoles(),
}));

jest.mock('../../services/StakeholderService', () => ({
  getStakeholders: () => mockGetStakeholders(),
}));

jest.mock('../../services/LocationService', () => ({
  getDistricts: () => mockGetDistricts(),
  getRegions: () => mockGetRegions(),
  getZones: () => mockGetZones(),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../utils/permissions', () => ({
  checkAccessMaster: (...args: unknown[]) => mockCheckAccessMaster(...args),
}));

jest.mock('../../components/UI/ViewToggle', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <button data-testid="view-toggle" onClick={() => onChange(value === 'requester' ? 'helpdesk' : 'requester')}>
      toggle
    </button>
  ),
}));

jest.mock('../../components/UI/Input/GenericInput', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, ...rest }: any) => (
    <input data-testid={`input-${placeholder}`} value={value} onChange={onChange} {...rest} />
  ),
}));

jest.mock('../../components/UI/Dropdown/DropdownController', () => ({
  __esModule: true,
  default: ({ value, onChange, label }: any) => (
    <select data-testid={`dropdown-${label}`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="All">All</option>
      <option value="Filtered">Filtered</option>
    </select>
  ),
}));

jest.mock('../../components/PaginationControls', () => ({
  __esModule: true,
  default: ({ page, onChange }: { page: number; onChange: (_: unknown, value: number) => void }) => (
    <button data-testid="pagination" onClick={() => onChange(null, page + 1)}>Next</button>
  ),
}));

jest.mock('../../components/Users/RequesterUsersTable', () => ({
  __esModule: true,
  default: (props: any) => {
    requesterTableProps = props;
    return (
      <div data-testid="requester-table">
        Requester Table
        <button onClick={() => props.onViewProfile({ requesterUserId: 'r1' })}>view-requester</button>
        <button onClick={() => props.onAppointRno({ requesterUserId: 'r1' })}>appoint-rno</button>
      </div>
    );
  },
}));

jest.mock('../../components/Users/HelpdeskUsersTable', () => ({
  __esModule: true,
  default: (props: any) => {
    helpdeskTableProps = props;
    return (
      <div data-testid="helpdesk-table">
        Helpdesk Table
        <button onClick={() => props.onViewProfile({ userId: 'h1' })}>view-helpdesk</button>
      </div>
    );
  },
}));

import Users from '../Users';

const requesterResponse = {
  items: [{ requesterUserId: 'r1', name: 'Requester One' }],
  totalPages: 3,
  totalElements: 15,
};

const helpdeskResponse = {
  items: [{ userId: 'h1', name: 'Helpdesk One' }],
  totalPages: 2,
  totalElements: 5,
};

const defaultApiState = { pending: false };

const buildApiHandler = (returnValue: any = undefined) => jest.fn((fn: () => any) => Promise.resolve(fn() ?? returnValue));

describe('Users page', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    requesterTableProps = null;
    helpdeskTableProps = null;
    mockUseApi.mockReset();
    mockSearchHelpdeskUsers.mockReset();
    mockSearchRequesterUsers.mockReset();
    mockGetAllRoles.mockReset();
    mockGetStakeholders.mockReset();
    mockGetRequesterOfficeTypes.mockReset();
    mockGetZones.mockReset();
    mockGetRegions.mockReset();
    mockGetDistricts.mockReset();
    mockAppointRequesterAsRno.mockReset();
    mockShowMessage.mockReset();
    mockCheckAccessMaster.mockReset();
    mockCheckAccessMaster.mockReturnValue(true);

    mockSearchRequesterUsers.mockResolvedValue({ data: requesterResponse });
    mockSearchHelpdeskUsers.mockResolvedValue({ data: helpdeskResponse });
    mockGetAllRoles.mockResolvedValue([{ roleId: '1', role: 'Admin' }]);
    mockGetStakeholders.mockResolvedValue([{ id: '1', description: 'Stakeholder' }]);
    mockGetRequesterOfficeTypes.mockResolvedValue(['Type1']);
    mockGetZones.mockResolvedValue([{ zoneCode: 'Z1', zoneName: 'Zone 1' }]);
    mockGetRegions.mockResolvedValue([{ regionCode: 'R1', regionName: 'Region 1' }]);
    mockGetDistricts.mockResolvedValue([{ districtCode: 'D1', districtName: 'District 1' }]);
    mockAppointRequesterAsRno.mockResolvedValue(true);

    mockUseApi.mockImplementation(() => {
      const callIndex = mockUseApi.mock.calls.length;
      const base = { ...defaultApiState, apiHandler: buildApiHandler() } as any;
      switch (callIndex) {
        case 0:
          return { ...base, data: requesterResponse };
        case 1:
          return { ...base, data: helpdeskResponse };
        case 2:
          return { ...base, data: [{ roleId: '1', role: 'Admin' }] };
        case 3:
          return { ...base, data: [{ id: '1', description: 'Stakeholder' }] };
        case 4:
          return { ...base, data: ['Type1'] };
        case 5:
          return { ...base, data: [{ zoneCode: 'Z1', zoneName: 'Zone 1' }] };
        case 6:
          return { ...base, data: [{ regionCode: 'R1', regionName: 'Region 1' }] };
        case 7:
          return { ...base, data: [{ districtCode: 'D1', districtName: 'District 1' }] };
        default:
          return { ...base };
      }
    });
  });

  it('renders requester view by default and navigates to requester profile', async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(<Users />);

    await waitFor(() => expect(getByTestId('requester-table')).toBeInTheDocument());
    expect(queryByTestId('helpdesk-table')).toBeNull();

    await act(async () => {
      fireEvent.click(getByTestId('requester-table').querySelector('button') as HTMLButtonElement);
    });

    expect(navigateMock).toHaveBeenCalledWith('/users/requester/r1');
  });

  it('switches to helpdesk view and navigates to helpdesk profile', async () => {
    const { getByTestId } = renderWithTheme(<Users />);

    await waitFor(() => expect(getByTestId('requester-table')).toBeInTheDocument());

    act(() => {
      fireEvent.click(getByTestId('view-toggle'));
    });

    await waitFor(() => expect(getByTestId('helpdesk-table')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(getByTestId('helpdesk-table').querySelector('button') as HTMLButtonElement);
    });

    expect(navigateMock).toHaveBeenCalledWith('/users/helpdesk/h1');
  });

  it('appoints requester as RNO and reloads requester list', async () => {
    renderWithTheme(<Users />);

    await waitFor(() => expect(requesterTableProps).not.toBeNull());

    await act(async () => {
      requesterTableProps.onAppointRno({ requesterUserId: 'r1' });
    });

    expect(mockAppointRequesterAsRno).toHaveBeenCalledWith('r1');
    expect(mockShowMessage).toHaveBeenCalledWith('User appointed as Regional Nodal Officer', 'success');
    expect(mockSearchRequesterUsers).toHaveBeenCalled();
  });

  it('redirects to dashboard when user lacks access', () => {
    mockCheckAccessMaster.mockReturnValue(false);

    const { getByTestId } = renderWithTheme(<Users />);

    expect(getByTestId('navigate')).toHaveTextContent('/dashboard');
  });
});
