import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '../../../test/testUtils';

const mockUseApi = jest.fn();
const mockShowMessage = jest.fn();
const mockStarRating = jest.fn((props: any) => (
  <button
    type="button"
    data-testid={`rating-${props.label}`}
    disabled={props.readOnly}
    onClick={() => props.onChange?.(4)}
  >
    {props.label}:{props.value}
  </button>
));

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

jest.mock('../../../context/SnackbarContext', () => ({
  useSnackbar: () => ({
    showMessage: mockShowMessage,
  }),
}));

const mockSubmitFeedback = jest.fn();
const mockGetFeedback = jest.fn();

jest.mock('../../../services/FeedbackService', () => ({
  submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
  getFeedback: (...args: unknown[]) => mockGetFeedback(...args),
  getFeedbackForm: jest.fn(),
}));

jest.mock('../StarRating', () => ({
  __esModule: true,
  default: (props: any) => mockStarRating(props),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const FeedbackModal = require('../FeedbackModal').default;

describe('FeedbackModal', () => {
  const ticketId = 'INC-9';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReset();
    mockStarRating.mockReset();
  });

  it('submits feedback with updated values', async () => {
    const apiHandlerMock = jest.fn((fn: () => Promise<unknown>) => fn());
    mockUseApi.mockReturnValue({
      data: null,
      success: false,
      pending: false,
      error: null,
      apiHandler: apiHandlerMock,
    });

    mockSubmitFeedback.mockResolvedValue({});

    const onClose = jest.fn();

    renderWithTheme(
      <FeedbackModal open ticketId={ticketId} onClose={onClose} />,
    );

    const commentField = screen.getByLabelText('Additional Comments/Feedback');
    await userEvent.type(commentField, 'Great support');

    await waitFor(() => expect(mockStarRating).toHaveBeenCalled());
    const overallCall = mockStarRating.mock.calls.find(([props]) => props.label === 'Overall Satisfaction');
    overallCall?.[0].onChange?.(4);

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(mockSubmitFeedback).toHaveBeenCalledTimes(1));
    expect(mockSubmitFeedback).toHaveBeenCalledWith(ticketId, {
      overallSatisfaction: 4,
      resolutionEffectiveness: 0,
      communicationSupport: 0,
      timeliness: 0,
      comments: 'Great support',
    });

    await waitFor(() => expect(mockShowMessage).toHaveBeenCalledWith('Feedback submitted', 'success'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows provided feedback in view mode', async () => {
    const existingFeedback = {
      overallSatisfaction: 5,
      resolutionEffectiveness: 4,
      communicationSupport: 3,
      timeliness: 2,
      comments: 'Resolved quickly',
    };

    const apiHandlerMock = jest.fn((fn: () => Promise<unknown>) => fn());
    mockUseApi.mockReturnValue({
      data: existingFeedback,
      success: true,
      pending: false,
      error: null,
      apiHandler: apiHandlerMock,
    });

    mockGetFeedback.mockResolvedValue(existingFeedback);

    const onClose = jest.fn();

    renderWithTheme(
      <FeedbackModal open ticketId={ticketId} onClose={onClose} feedbackStatus="PROVIDED" />,
    );

    await waitFor(() => expect(apiHandlerMock).toHaveBeenCalled());
    const handler = apiHandlerMock.mock.calls[0][0];
    await handler();
    expect(mockGetFeedback).toHaveBeenCalledWith(ticketId);

    await waitFor(() => expect(mockStarRating).toHaveBeenCalled());

    const closeButton = await screen.findByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    const commentField = screen.getByLabelText('Additional Comments/Feedback');
    expect(commentField).toBeDisabled();

    const hasMatchingCall = mockStarRating.mock.calls.some(([props]) =>
      props.label === 'Overall Satisfaction' && props.value === 5 && props.readOnly === true,
    );
    expect(hasMatchingCall).toBe(true);
  });
});
