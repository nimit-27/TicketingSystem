import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

const mockSubmitFeedback = jest.fn(() => Promise.resolve());
const mockShowMessage = jest.fn();

jest.mock('react-router-dom', () => {
  const navigate = jest.fn();
  return {
    useParams: () => ({ ticketId: 'T-1' }),
    useNavigate: () => navigate,
    useLocation: () => ({ state: undefined }),
    __navigateMock: navigate,
  };
});

const navigateMock = jest.requireMock('react-router-dom').__navigateMock as jest.Mock;

jest.mock('../../components/Feedback/StarRating', () => ({
  __esModule: true,
  default: ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <button data-testid={`rating-${label}`} onClick={() => onChange(value + 1)}>
      {label}:{value}
    </button>
  ),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../services/FeedbackService', () => ({
  submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
  getFeedbackForm: jest.fn(),
  getFeedback: jest.fn(),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: () => ({ data: null, apiHandler: jest.fn(), success: false }),
}));

import CustomerSatisfactionForm from '../CustomerSatisfactionForm';

describe('CustomerSatisfactionForm', () => {
  beforeEach(() => {
    mockSubmitFeedback.mockClear();
    mockShowMessage.mockClear();
    navigateMock.mockClear();
    mockSubmitFeedback.mockResolvedValue(undefined);
  });

  it('allows rating updates and submits feedback', async () => {
    const { getByTestId, getByLabelText, getByText } = render(<CustomerSatisfactionForm />);

    fireEvent.click(getByTestId('rating-Overall Satisfaction'));
    fireEvent.click(getByTestId('rating-Resolution Effectiveness'));

    fireEvent.change(getByLabelText('Additional Comments/Feedback'), { target: { value: 'Great!' } });

    fireEvent.click(getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitFeedback).toHaveBeenCalled();
      expect(mockShowMessage).toHaveBeenCalledWith('Feedback submitted', 'success');
      expect(navigateMock).toHaveBeenCalledWith(-1);
    });
  });

  it('handles cancel action', () => {
    const { getByText } = render(<CustomerSatisfactionForm />);
    fireEvent.click(getByText('Cancel'));
    expect(navigateMock).toHaveBeenCalled();
  });
});
