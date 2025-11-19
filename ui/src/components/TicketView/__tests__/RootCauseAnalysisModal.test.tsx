import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import RootCauseAnalysisModal from '../RootCauseAnalysisModal';
import { useApi } from '../../../hooks/useApi';
import { useSnackbar } from '../../../context/SnackbarContext';
import { getRootCauseAnalysis, saveRootCauseAnalysis, deleteRootCauseAnalysisAttachment } from '../../../services/RootCauseAnalysisService';
import { getTicket } from '../../../services/TicketService';
import { renderWithTheme } from '../../../test/testUtils';

type FileUploadProps = {
  onFilesChange?: (files: File[]) => void;
};

type ThumbnailListProps = {
  attachments?: (string | undefined)[];
  onRemove?: (index: number) => void;
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../hooks/useApi', () => ({
  useApi: jest.fn(),
}));
jest.mock('../../../context/SnackbarContext');

jest.mock('../../../services/RootCauseAnalysisService', () => ({
  getRootCauseAnalysis: jest.fn(),
  saveRootCauseAnalysis: jest.fn(),
  deleteRootCauseAnalysisAttachment: jest.fn(),
}));

jest.mock('../../../services/TicketService', () => ({
  getTicket: jest.fn(),
}));

jest.mock('../../../services/api', () => ({
  BASE_URL: 'http://localhost',
}));

const mockFileUpload = jest.fn((props: FileUploadProps) => (
  <div>
    <button type="button" onClick={() => props.onFilesChange?.([new File(['data'], 'new-file.txt')])}>
      add-file
    </button>
  </div>
));

const mockThumbnailList = jest.fn((props: ThumbnailListProps) => (
  <div>
    {props.attachments?.map((att, index) => (
      <button
        type="button"
        key={`${att}-${index}`}
        data-testid={`attachment-${index}`}
        onClick={() => props.onRemove?.(index)}
      >
        {att}
      </button>
    ))}
  </div>
));

jest.mock('../../UI/FileUpload', () => ({
  __esModule: true,
  default: (props: FileUploadProps) => mockFileUpload(props),
  ThumbnailList: (props: ThumbnailListProps) => mockThumbnailList(props),
}));

jest.mock('../../UI/Button', () => ({ children, onClick, type, disabled }: any) => (
  <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
    {children}
  </button>
));

jest.mock('../../UI/Input/CustomFormInput', () => ({ register, name, label }: any) => {
  const field = register(name);
  return (
    <label>
      {label}
      <textarea data-testid={name} {...field} />
    </label>
  );
});

jest.mock('../../UI/IconButton/CustomIconButton', () => ({ icon, onClick }: any) => (
  <button type="button" data-testid={`icon-${icon}`} onClick={onClick}>
    {icon}
  </button>
));

const useApiMock = useApi as jest.MockedFunction<typeof useApi>;
const useSnackbarMock = useSnackbar as jest.Mock;
const getRootCauseAnalysisMock = getRootCauseAnalysis as jest.Mock;
const saveRootCauseAnalysisMock = saveRootCauseAnalysis as jest.Mock;
const deleteAttachmentMock = deleteRootCauseAnalysisAttachment as jest.Mock;
const getTicketMock = getTicket as jest.Mock;
let deleteHandlerSpy: jest.Mock;

describe('RootCauseAnalysisModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useApiMock.mockReset();

    const getTicketHandler = jest.fn((fn: () => Promise<any>) => Promise.resolve(fn()));
    const fetchHandler = jest.fn((fn: () => Promise<any>) => Promise.resolve(fn()));
    const saveHandler = jest.fn((fn: () => Promise<any>) => Promise.resolve(fn()));
    deleteHandlerSpy = jest.fn((fn: () => Promise<any>) => Promise.resolve(fn()));

    const defaultResponse = { data: null, pending: false, success: false, error: null } as any;
    const useApiResponses = [
      { ...defaultResponse, apiHandler: getTicketHandler },
      { ...defaultResponse, apiHandler: fetchHandler },
      { ...defaultResponse, apiHandler: saveHandler },
      { ...defaultResponse, apiHandler: deleteHandlerSpy },
    ];
    let callIndex = 0;
    useApiMock.mockImplementation(() => {
      const response = useApiResponses[callIndex] ?? { ...defaultResponse, apiHandler: (fn: () => Promise<any>) => Promise.resolve(fn()) };
      callIndex = (callIndex + 1) % useApiResponses.length;
      return response;
    });

    useSnackbarMock.mockReturnValue({ showMessage: jest.fn() });

    getRootCauseAnalysisMock.mockResolvedValue({
      descriptionOfCause: 'Existing cause',
      resolutionDescription: 'Existing resolution',
      attachments: ['one.png'],
      severityLabel: 'Critical',
    });

    saveRootCauseAnalysisMock.mockResolvedValue({
      descriptionOfCause: 'Updated cause',
      resolutionDescription: 'Updated resolution',
      attachments: ['one.png'],
    });

    deleteAttachmentMock.mockResolvedValue({
      attachments: [],
    });

    getTicketMock.mockResolvedValue({});
  });

  it('fetches data when opened and displays existing attachments', async () => {
    renderWithTheme(
      <RootCauseAnalysisModal
        open
        onClose={jest.fn()}
        rcaStatus="IN_PROGRESS"
        ticketId="ticket-1"
        updatedBy="user-1"
      />,
    );

    await waitFor(() => expect(getRootCauseAnalysisMock).toHaveBeenCalledWith('ticket-1'));

    expect(screen.getByText(/Severity:/i)).toBeInTheDocument();
    await waitFor(() => expect(mockThumbnailList).toHaveBeenCalled());
    const lastCall = mockThumbnailList.mock.calls[mockThumbnailList.mock.calls.length - 1];
    expect(lastCall?.[0].attachments).toEqual(['http://localhost/uploads/one.png']);
  });

  it('submits form and saves RCA data', async () => {
    const onClose = jest.fn();
    renderWithTheme(
      <RootCauseAnalysisModal
        open
        onClose={onClose}
        rcaStatus="DRAFT"
        ticketId="ticket-2"
        updatedBy="user-2"
      />,
    );

    await waitFor(() => expect(getRootCauseAnalysisMock).toHaveBeenCalled());

    fireEvent.change(screen.getByTestId('descriptionOfCause'), { target: { value: 'New cause' } });
    fireEvent.change(screen.getByTestId('resolutionDescription'), { target: { value: 'New resolution' } });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(saveRootCauseAnalysisMock).toHaveBeenCalled();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('allows deleting existing attachment when in edit mode', async () => {
    renderWithTheme(
      <RootCauseAnalysisModal
        open
        onClose={jest.fn()}
        rcaStatus="IN_PROGRESS"
        ticketId="ticket-3"
        updatedBy="user-3"
      />,
    );

    await waitFor(() => expect(getRootCauseAnalysisMock).toHaveBeenCalledWith('ticket-3'));

    await waitFor(() => expect(mockThumbnailList).toHaveBeenCalled());
    const thumbnailCall = mockThumbnailList.mock.calls[mockThumbnailList.mock.calls.length - 1];
    expect(thumbnailCall).toBeDefined();
    const thumbnailProps = thumbnailCall?.[0];
    expect(thumbnailProps?.onRemove).toBeDefined();
    expect(thumbnailProps?.attachments).toEqual(['http://localhost/uploads/one.png']);

    await act(async () => {
      await thumbnailProps?.onRemove?.(0);
    });

    await waitFor(() => expect(deleteHandlerSpy).toHaveBeenCalled());

    await waitFor(() => {
      expect(deleteAttachmentMock).toHaveBeenCalledWith('ticket-3', 'one.png', 'user-3');
    });
  });
});
