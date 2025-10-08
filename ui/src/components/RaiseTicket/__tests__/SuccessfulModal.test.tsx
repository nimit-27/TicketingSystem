import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const SuccessfulModal = require('../SuccessfulModal').default;

describe('SuccessfulModal', () => {
  const baseProps = {
    open: true,
    ticketId: 'T-123',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays ticket information when open', () => {
    render(<SuccessfulModal {...baseProps} />);

    expect(screen.getByText('Thank you! Your ticket has been submitted successfully.')).toBeInTheDocument();
    expect(screen.getByText(/Ticket ID/)).toBeInTheDocument();
    expect(screen.getByText('T-123')).toBeInTheDocument();
  });

  it('invokes callbacks from action buttons', () => {
    render(<SuccessfulModal {...baseProps} />);

    fireEvent.click(screen.getByText('Raise New Ticket'));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Go to My Tickets'));
    expect(baseProps.onClose).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith('/my-tickets');
  });
});
