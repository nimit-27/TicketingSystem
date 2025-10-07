import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FailureModal from '../FailureModal';
import SuccessModal from '../SuccessModal';
import { renderWithTheme } from '../../../test/testUtils';

describe('Status modals', () => {
  it('renders failure modal content when open', async () => {
    const onClose = jest.fn();
    renderWithTheme(
      <FailureModal
        open
        title="Failure"
        subtext="Something went wrong"
        actions={<button type="button">Retry</button>}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Failure')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Retry'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('invokes onClose when the modal backdrop is clicked', async () => {
    const onClose = jest.fn();
    renderWithTheme(
      <FailureModal open title="Failure" onClose={onClose} />,
    );

    const backdrop = document.querySelector('.MuiBackdrop-root') as HTMLElement;
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('renders success modal with optional actions', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <SuccessModal
        open
        title="Success"
        subtext="All good"
        actions={<button type="button">Close</button>}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
