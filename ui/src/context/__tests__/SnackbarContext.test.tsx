import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { SnackbarProvider, useSnackbar } from '../SnackbarContext';

jest.mock('@mui/material', () => ({
  Snackbar: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="snackbar" onClick={() => onClose?.({}, 'timeout')}>
        {children}
      </div>
    ) : null,
  Alert: ({ severity, onClose, children }: any) => (
    <div data-testid="alert" data-severity={severity} onClick={() => onClose?.({}, 'click')}>
      {children}
    </div>
  ),
}));

describe('SnackbarContext', () => {
  const Consumer: React.FC = () => {
    const { showMessage } = useSnackbar();
    return (
      <>
        <button type="button" onClick={() => showMessage('Hello world')}>
          show-default
        </button>
        <button type="button" onClick={() => showMessage('Danger', 'error')}>
          show-error
        </button>
      </>
    );
  };

  it('renders snackbar with default severity when showMessage is called', () => {
    render(
      <SnackbarProvider>
        <Consumer />
      </SnackbarProvider>
    );

    expect(screen.queryByTestId('snackbar')).toBeNull();

    fireEvent.click(screen.getByText('show-default'));

    expect(screen.getByTestId('snackbar')).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'info');
    expect(screen.getByTestId('alert')).toHaveTextContent('Hello world');
  });

  it('supports custom severity and closes when alert is clicked', () => {
    render(
      <SnackbarProvider>
        <Consumer />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('show-error'));

    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'error');
    expect(screen.getByTestId('alert')).toHaveTextContent('Danger');

    fireEvent.click(screen.getByTestId('alert'));
    expect(screen.queryByTestId('snackbar')).toBeNull();
  });
});
