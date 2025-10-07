import { fireEvent, screen, waitFor } from '@testing-library/react';
import InfoIcon from '../Icons/InfoIcon';
import MasterIcon from '../Icons/MasterIcon';
import PriorityIcon from '../Icons/PriorityIcon';
import { renderWithTheme } from '../../../test/testUtils';

describe('UI icons', () => {
  it('displays popover content on hover', async () => {
    const { container } = renderWithTheme(
      <InfoIcon title="More info" text="Details" />, 
    );

    const trigger = container.querySelector('.m-2') as HTMLElement;
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByText('More info')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });

  it('renders master icon with the initial letter', () => {
    renderWithTheme(<MasterIcon />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders the expected number of priority indicators', () => {
    renderWithTheme(<PriorityIcon level={3} priorityText="High" />);

    const indicators = screen.getAllByTestId('KeyboardArrowUpIcon');
    expect(indicators).toHaveLength(2);
  });
});
