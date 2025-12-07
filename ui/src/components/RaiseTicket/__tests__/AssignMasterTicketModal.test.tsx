import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AssignMasterTicketModal from '../AssignMasterTicketModal';

const mockMakeTicketMaster = jest.fn();

jest.mock('../../../services/TicketService', () => ({
  makeTicketMaster: (...args: any[]) => mockMakeTicketMaster(...args),
}));

describe('AssignMasterTicketModal', () => {
  const baseProps = {
    open: true,
    onClose: jest.fn(),
    ticketId: 'T-123',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invokes makeTicketMaster and shows success message', async () => {
    mockMakeTicketMaster.mockResolvedValue({});

    render(<AssignMasterTicketModal {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mockMakeTicketMaster).toHaveBeenCalledWith('T-123');
      expect(baseProps.onSuccess).toHaveBeenCalled();
    });

    expect(await screen.findByText('This ticket is now a Master ticket')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yes' })).not.toBeInTheDocument();
  });

  it('displays an error when the request fails', async () => {
    mockMakeTicketMaster.mockRejectedValue({ response: { data: { message: 'Failure' } } });

    render(<AssignMasterTicketModal {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    expect(await screen.findByText('Failure')).toBeInTheDocument();
    expect(mockMakeTicketMaster).toHaveBeenCalledWith('T-123');
  });

  it('resets state when closed', () => {
    render(<AssignMasterTicketModal {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
