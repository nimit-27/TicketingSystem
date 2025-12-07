import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';

jest.mock('../../../hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: () => ({ username: 'agent' }),
}));

jest.mock('../../CustomFieldset', () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

jest.mock('../../UI/Input/GenericInput', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }: any) => (
    <input placeholder={placeholder} value={value} onChange={onChange} />
  ),
}));

const mockGetTicket = jest.fn(() => Promise.resolve({ body: { data: { id: 'MT-1', subject: 'Master ticket' } } }));
const mockLinkTicketToMaster = jest.fn(() => Promise.resolve());
const mockMakeTicketMaster = jest.fn(() => Promise.resolve({ body: { data: { id: 'MT-1', subject: 'Master ticket', isMaster: true } } }));
const mockSearchTicketsPaginated = jest.fn(() => Promise.resolve({ body: { data: { items: [{ id: 'MT-1', subject: 'Master ticket' }], totalPages: 1, page: 0 } } }));

jest.mock('../../../services/TicketService', () => ({
  getTicket: (...args: any[]) => mockGetTicket(...args),
  linkTicketToMaster: (...args: any[]) => mockLinkTicketToMaster(...args),
  makeTicketMaster: (...args: any[]) => mockMakeTicketMaster(...args),
  searchTicketsPaginated: (...args: any[]) => mockSearchTicketsPaginated(...args),
}));

const LinkToMasterTicketModal = require('../LinkToMasterTicketModal').default;

describe('LinkToMasterTicketModal', () => {
  const baseProps = {
    open: true,
    onClose: jest.fn(),
    subject: 'New ticket',
    setMasterId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTicket.mockImplementation(() => Promise.resolve({ body: { data: { id: 'MT-1', subject: 'Master ticket' } } }));
    mockSearchTicketsPaginated.mockImplementation(() => Promise.resolve({ body: { data: { items: [{ id: 'MT-1', subject: 'Master ticket' }], totalPages: 1, page: 0 } } }));
    mockLinkTicketToMaster.mockResolvedValue(undefined);
    mockMakeTicketMaster.mockImplementation(() => Promise.resolve({ body: { data: { id: 'MT-1', subject: 'Master ticket', isMaster: true } } }));
  });

  it('loads master tickets when opened', async () => {
    render(<LinkToMasterTicketModal {...baseProps} />);

    await waitFor(() => {
      expect(mockSearchTicketsPaginated).toHaveBeenCalledWith('', undefined, '1', 0, 20);
    });

    expect(await screen.findByText(/MT-1/)).toBeInTheDocument();
  });

  it('allows searching and linking a master ticket during creation', async () => {
    mockSearchTicketsPaginated.mockImplementation(() =>
      Promise.resolve({ body: { data: { items: [{ id: 'MT-2', subject: 'Another ticket' }], totalPages: 1, page: 0 } } })
    );
    mockGetTicket.mockResolvedValue({
      body: { data: { id: 'MT-2', subject: 'Another ticket' } },
    });

    render(<LinkToMasterTicketModal {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText('Search tickets by id or subject'), {
      target: { value: 'MT' },
    });

    await waitFor(() => {
      expect(mockSearchTicketsPaginated).toHaveBeenCalledWith('MT', undefined, '1', 0, 20);
    });

    fireEvent.click(await screen.findByText(/Another ticket/));

    await waitFor(() => {
      expect(mockGetTicket).toHaveBeenCalledWith('MT-2');
    });

    expect(await screen.findByText('Master Ticket MT-2')).toBeInTheDocument();

    const linkToggle = await screen.findByText('Link');
    fireEvent.click(linkToggle);

    expect(baseProps.setMasterId).toHaveBeenCalledWith('MT-2');
    expect(screen.getByText(/will be linked to Master ticket MT-2/)).toBeInTheDocument();
  });

  it('links an existing ticket using the API', async () => {
    const onLinkSuccess = jest.fn();
    render(
      <LinkToMasterTicketModal
        {...baseProps}
        currentTicketId="T-1"
        onLinkSuccess={onLinkSuccess}
      />
    );

    await waitFor(() => {
      expect(mockSearchTicketsPaginated).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText(/Master ticket/));

    await waitFor(() => {
      expect(mockGetTicket).toHaveBeenCalledWith('MT-1');
    });

    expect(await screen.findByText('Master Ticket MT-1')).toBeInTheDocument();
    const linkToggle = await screen.findByText('Link');
    fireEvent.click(linkToggle);

    await waitFor(() => {
      expect(mockLinkTicketToMaster).toHaveBeenCalledWith('T-1', 'MT-1', 'agent');
      expect(onLinkSuccess).toHaveBeenCalledWith('MT-1');
    });
  });

  it('prevents linking a master ticket to another master ticket', async () => {
    mockGetTicket.mockResolvedValue({ body: { data: { id: 'MT-1', subject: 'Master ticket', isMaster: true } } });

    render(
      <LinkToMasterTicketModal
        {...baseProps}
        currentTicketId="T-1"
        isCurrentTicketMaster
      />
    );

    await waitFor(() => {
      expect(mockSearchTicketsPaginated).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText(/Master ticket/));

    const linkToggle = await screen.findByText('Link');
    fireEvent.click(linkToggle);

    expect(await screen.findByText('Master Ticket cannot be linked to another Master Ticket')).toBeInTheDocument();
    expect(mockLinkTicketToMaster).not.toHaveBeenCalled();
  });

  it('resets state when cancelled', async () => {
    render(<LinkToMasterTicketModal {...baseProps} />);

    await waitFor(() => {
      expect(mockSearchTicketsPaginated).toHaveBeenCalled();
    });

    fireEvent.click(await screen.findByText(/Master ticket/));

    await waitFor(() => {
      expect(mockGetTicket).toHaveBeenCalledWith('MT-1');
    });

    fireEvent.click(screen.getByText('Cancel'));

    expect(baseProps.setMasterId).toHaveBeenCalledWith('');
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
