import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RequestorModal from '../RequestorModal';

const mockUserDetails = jest.fn();

jest.mock('../../UserDetailsCard', () => ({
  __esModule: true,
  default: (props) => {
    mockUserDetails(props);
    return (
      <div>
        <button type="button" onClick={() => props.onCopy('email', 'user@example.com')}>copy</button>
        <div data-testid="copied">{props.copiedField || 'none'}</div>
        <div data-testid="detail-count">{props.details.length}</div>
      </div>
    );
  },
}));

describe('RequestorModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
    mockUserDetails.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('passes filtered details and handles copy state lifecycle', () => {
    const onClose = jest.fn();

    render(
      <RequestorModal
        open
        onClose={onClose}
        name="Test User"
        email="user@example.com"
        role="Manager"
        officeCode="OC-1"
      />
    );

    expect(screen.getByTestId('detail-count')).toHaveTextContent('2');
    fireEvent.click(screen.getByRole('button', { name: 'copy' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('user@example.com');
    expect(screen.getByTestId('copied')).toHaveTextContent('email');

    act(() => {
      jest.advanceTimersByTime(2100);
    });
    expect(screen.getByTestId('copied')).toHaveTextContent('none');

  });
});
