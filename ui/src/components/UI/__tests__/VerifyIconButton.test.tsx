import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyIconButton from '../IconButton/VerifyIconButton';
import { renderWithTheme } from '../../../test/testUtils';

jest.mock('../IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ onClick }: { onClick?: () => void }) => (
    <div role="button" data-testid="custom-icon-button" onClick={onClick} tabIndex={0}>
      send
    </div>
  ),
}));

describe('VerifyIconButton', () => {
  it('renders a progress indicator when pending', () => {
    renderWithTheme(<VerifyIconButton pending />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a success icon when verified', () => {
    renderWithTheme(<VerifyIconButton verified />);

    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });

  it('delegates clicks to the provided handler in the default state', async () => {
    const onClick = jest.fn();
    renderWithTheme(<VerifyIconButton onClick={onClick} />);

    await userEvent.click(screen.getByTestId('custom-icon-button'));

    expect(onClick).toHaveBeenCalled();
  });
});
