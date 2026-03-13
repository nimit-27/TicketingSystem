import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchBox from './SearchBox';
import { searchTickets } from './services/TicketService';

jest.mock('./typesenseClient', () => ({}));

jest.mock('./services/TicketService', () => ({
  searchTickets: jest.fn(),
}));

jest.mock('./hooks/useDebounce', () => ({
  useDebounce: (value) => value,
}));

describe('SearchBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not search for short queries and clears results', async () => {
    render(<SearchBox />);

    fireEvent.change(screen.getByPlaceholderText('Search tickets...'), { target: { value: 'a' } });

    await waitFor(() => {
      expect(searchTickets).not.toHaveBeenCalled();
    });
    expect(screen.queryByText(/TKT-/)).not.toBeInTheDocument();
  });

  it('searches for query length >= 2 and renders returned hits', async () => {
    searchTickets.mockResolvedValue({
      data: {
        hits: [
          { document: { id: 'TKT-101', subject: 'Printer issue' } },
          { document: { id: 'TKT-102', subject: 'VPN issue' } },
        ],
      },
    });

    render(<SearchBox />);
    fireEvent.change(screen.getByPlaceholderText('Search tickets...'), { target: { value: 'vp' } });

    await waitFor(() => expect(searchTickets).toHaveBeenCalledWith('vp'));
    await waitFor(() => expect(screen.getByText('TKT-101')).toBeInTheDocument());
    expect(screen.getByText('TKT-102')).toBeInTheDocument();
    expect(screen.getByText(/Printer issue/)).toBeInTheDocument();
  });

  it('handles search responses without hits by showing an empty state list', async () => {
    searchTickets.mockResolvedValue({ data: {} });

    render(<SearchBox />);
    fireEvent.change(screen.getByPlaceholderText('Search tickets...'), { target: { value: 'xy' } });

    await waitFor(() => expect(searchTickets).toHaveBeenCalledWith('xy'));
    expect(screen.queryByText('xy')).not.toBeInTheDocument();
    expect(screen.queryByText(/issue/)).not.toBeInTheDocument();
  });
});
