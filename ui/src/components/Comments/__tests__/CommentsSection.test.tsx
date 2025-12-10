import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentsSection from '../CommentsSection';
import { renderWithTheme } from '../../../test/testUtils';
import { getCurrentUserDetails } from '../../../config/config';

const mockUseApi = jest.fn();

jest.mock('../../../hooks/useApi', () => ({
  useApi: () => mockUseApi(),
}));

const mockGetComments = jest.fn();
const mockAddComment = jest.fn();
const mockUpdateComment = jest.fn();
const mockDeleteComment = jest.fn();

jest.mock('../../../services/TicketService', () => ({
  getComments: (...args: unknown[]) => mockGetComments(...args),
  addComment: (...args: unknown[]) => mockAddComment(...args),
  updateComment: (...args: unknown[]) => mockUpdateComment(...args),
  deleteComment: (...args: unknown[]) => mockDeleteComment(...args),
}));

jest.mock('../../../config/config', () => ({
  getCurrentUserDetails: jest.fn(() => ({ userId: 'user-1', username: 'User One' })),
}));

jest.mock('../../UI/IconButton/CustomIconButton', () => ({
  __esModule: true,
  default: ({ icon, onClick, color }: any) => (
    <button type="button" data-testid={`icon-${icon}`} data-color={color} onClick={onClick}>
      {icon}
    </button>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CommentsSection', () => {
  const ticketId = 'INC-123';
  const buildComments = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${index + 1}`,
      comment: `Comment ${index + 1}`,
      createdAt: new Date(2024, 0, index + 1).toISOString(),
      userId: 'user-1',
    }));
  const mockedGetCurrentUserDetails = getCurrentUserDetails as jest.Mock;

  let commentsApiHandler: jest.Mock;
  let addCommentApiHandler: jest.Mock;
  let updateCommentApiHandler: jest.Mock;
  let deleteCommentApiHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReset();
    mockedGetCurrentUserDetails.mockReturnValue({ userId: 'user-1', username: 'User One' });

    const createHandler = () => jest.fn((fn: () => Promise<unknown>) => Promise.resolve(fn()));
    commentsApiHandler = createHandler();
    addCommentApiHandler = createHandler();
    updateCommentApiHandler = createHandler();
    deleteCommentApiHandler = createHandler();
  });

  const setupUseApiMocks = () => {
    const responses = [
      { apiHandler: commentsApiHandler },
      { apiHandler: addCommentApiHandler },
      { apiHandler: updateCommentApiHandler },
      { apiHandler: deleteCommentApiHandler },
    ];
    let callIndex = 0;
    mockUseApi.mockImplementation(() => responses[(callIndex++) % responses.length]);
  };

  it('loads initial comments and allows showing more', async () => {
    const comments = buildComments(6);
    mockGetComments.mockResolvedValue(comments);
    setupUseApiMocks();

    renderWithTheme(<CommentsSection ticketId={ticketId} />);

    await waitFor(() => expect(commentsApiHandler).toHaveBeenCalledTimes(1));
    await screen.findByText('Comment 1');

    expect(mockGetComments).toHaveBeenCalledWith(ticketId);
    expect(screen.queryByText('Comment 6')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Show more' }));

    await waitFor(() => expect(commentsApiHandler).toHaveBeenCalledTimes(2));
    await screen.findByText('Comment 6');
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
  });

  it('submits a new comment and reloads the list', async () => {
    const comments = buildComments(2);
    mockGetComments.mockResolvedValue(comments);
    mockAddComment.mockResolvedValue({});
    setupUseApiMocks();

    renderWithTheme(<CommentsSection ticketId={ticketId} />);

    const textarea = await screen.findByRole('textbox');
    await userEvent.type(textarea, 'New comment');

    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(addCommentApiHandler).toHaveBeenCalledTimes(1));
    expect(mockAddComment).toHaveBeenCalledWith(ticketId, 'New comment');
    await waitFor(() => expect(commentsApiHandler).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  it('allows editing and deleting a comment', async () => {
    const comments = buildComments(2);
    mockGetComments.mockResolvedValue(comments);
    mockUpdateComment.mockResolvedValue({});
    mockDeleteComment.mockResolvedValue({});
    setupUseApiMocks();

    renderWithTheme(<CommentsSection ticketId={ticketId} />);

    await screen.findByText('Comment 1');

    const editButtons = screen.getAllByTestId('icon-Edit');
    await userEvent.click(editButtons[0]);

    const editTextarea = screen.getByDisplayValue('Comment 1');
    await userEvent.clear(editTextarea);
    await userEvent.type(editTextarea, 'Updated comment');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateCommentApiHandler).toHaveBeenCalledTimes(1));
    expect(mockUpdateComment).toHaveBeenCalledWith('1', 'Updated comment');
    await waitFor(() => expect(commentsApiHandler).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument());

    const deleteButtons = screen.getAllByTestId('icon-Delete');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => expect(deleteCommentApiHandler).toHaveBeenCalledTimes(1));
    expect(mockDeleteComment).toHaveBeenCalledWith('1');
    await waitFor(() => expect(commentsApiHandler).toHaveBeenCalledTimes(3));
  });

  it('hides edit/delete actions for comments from other users', async () => {
    const comments = [
      { id: '1', comment: 'My comment', createdAt: new Date().toISOString(), userId: 'other-user' },
    ];
    mockGetComments.mockResolvedValue(comments);
    setupUseApiMocks();

    renderWithTheme(<CommentsSection ticketId={ticketId} />);

    await screen.findByText('My comment');

    expect(screen.queryByTestId('icon-Edit')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-Delete')).not.toBeInTheDocument();
  });
});
