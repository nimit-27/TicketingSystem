import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HistorySidebar from '../HistorySidebar';
import Histories from '../../../pages/Histories';

type HistoriesProps = React.ComponentProps<typeof Histories>;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const historiesMock = Histories as unknown as jest.Mock;

jest.mock('../../../pages/Histories', () => jest.fn(() => <div data-testid="histories" />));

describe('HistorySidebar', () => {
  beforeEach(() => {
    historiesMock.mockClear();
  });

  it('shows launcher buttons when closed and opens with correct tab', () => {
    const setOpen = jest.fn();
    render(<HistorySidebar ticketId="ticket-1" open={false} setOpen={setOpen} />);

    const statusButton = screen.getByRole('button', { name: 'Status History' });
    const assignmentButton = screen.getByRole('button', { name: 'Assignment History' });

    fireEvent.click(assignmentButton);
    expect(setOpen).toHaveBeenCalledWith(true);

    const lastCall = historiesMock.mock.calls[historiesMock.mock.calls.length - 1];
    expect(lastCall?.[0].currentTab).toBe('assignment');

    fireEvent.click(statusButton);
    const lastStatusCall = historiesMock.mock.calls[historiesMock.mock.calls.length - 1];
    expect(lastStatusCall?.[0].currentTab).toBe('status');
  });

  it('renders drawer content when open and handles tab change and close', async () => {
    const setOpen = jest.fn();
    render(<HistorySidebar ticketId="ticket-2" open setOpen={setOpen} />);

    const lastCall = historiesMock.mock.calls[historiesMock.mock.calls.length - 1];
    const props = lastCall?.[0] as HistoriesProps;
    expect(props.ticketId).toBe('ticket-2');
    expect(props.currentTab).toBe('status');

    await act(async () => {
      props.onTabChange?.('assignment');
    });

    const nextCall = historiesMock.mock.calls[historiesMock.mock.calls.length - 1];
    expect(nextCall?.[0].currentTab).toBe('assignment');

    const closeButton = screen.getByTestId('ChevronRightIcon').closest('button');
    expect(closeButton).not.toBeNull();
    fireEvent.click(closeButton!);
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
