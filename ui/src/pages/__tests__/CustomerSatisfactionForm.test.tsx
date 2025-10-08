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

const mockGetFeedbackForm = jest.fn();
const mockGetFeedback = jest.fn();

jest.mock('../../services/FeedbackService', () => ({
  submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
  getFeedbackForm: (...args: unknown[]) => mockGetFeedbackForm(...args),
  getFeedback: (...args: unknown[]) => mockGetFeedback(...args),
}));

const mockUseApi = jest.fn();

jest.mock('../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

import CustomerSatisfactionForm from '../CustomerSatisfactionForm';

describe('CustomerSatisfactionForm', () => {
  beforeEach(() => {
    mockSubmitFeedback.mockClear();
    mockShowMessage.mockClear();
    navigateMock.mockClear();
    mockSubmitFeedback.mockResolvedValue(undefined);
    mockUseApi.mockReset();
    mockGetFeedbackForm.mockReset();
    mockGetFeedback.mockReset();
  });

  it('allows rating updates and submits feedback', async () => {
    const feedbackApiState = { data: null, apiHandler: jest.fn(), success: false };
    const formApiState = {
      data: { ticketId: 'T-1', dateOfResolution: '2024-01-01T00:00:00Z' },
      apiHandler: jest.fn((fn: () => Promise<unknown>) => fn()),
      success: true,
    };
    const responses = [feedbackApiState, formApiState];
    mockUseApi.mockImplementation(() => {
      const next = responses.shift();
      return next ?? formApiState;
    });
    mockGetFeedbackForm.mockResolvedValue({ data: { ticketId: 'T-1', dateOfResolution: '2024-01-01T00:00:00Z' } });

    const { getByTestId, getByLabelText, getByText } = render(<CustomerSatisfactionForm />);

    expect(getByText(/^Date of Resolution:/).textContent).toContain('2024');

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
    const defaultState = { data: null, apiHandler: jest.fn(), success: false };
    mockUseApi.mockImplementation(() => defaultState);

    const { getByText } = render(<CustomerSatisfactionForm />);
    fireEvent.click(getByText('Cancel'));
    expect(navigateMock).toHaveBeenCalled();
  });
});
