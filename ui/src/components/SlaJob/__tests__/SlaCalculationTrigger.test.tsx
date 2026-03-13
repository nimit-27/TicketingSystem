import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlaCalculationTrigger from '../SlaCalculationTrigger';
import { useApi } from '../../../hooks/useApi';
import { useSnackbar } from '../../../context/SnackbarContext';
import {
  fetchSlaCalculationJobHistory,
  triggerSlaCalculationJob,
  updateTriggerJobPeriod,
} from '../../../services/ReportService';

jest.mock('../../../hooks/useApi');
jest.mock('../../../context/SnackbarContext');
jest.mock('../../../services/ReportService');

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;

const overviewResponse = {
  running: false,
  cronExpression: '0 0 */4 * * *',
  batchSize: 100,
  triggerJobs: [
    {
      triggerJobId: '1',
      triggerJobCode: 'sla_job',
      triggerJobName: 'SLA Job',
      batchSize: 100,
      triggerPeriod: 'PERIODIC',
      cronExpression: '0 0 */4 * * *',
      running: false,
      nextScheduledAt: '2024-01-02T00:00:00.000Z',
      minutesUntilNextRun: 20,
    },
  ],
  history: [],
};

describe('SlaCalculationTrigger', () => {
  beforeEach(() => {
    jest.spyOn(window, 'setInterval').mockImplementation(() => 1 as any);
    jest.spyOn(window, 'clearInterval').mockImplementation(() => undefined);

    jest.clearAllMocks();
    mockUseSnackbar.mockReturnValue({ showMessage: jest.fn() } as any);
    mockUseApi.mockImplementation(() => ({ apiHandler: jest.fn(async (fn) => fn()), pending: false } as any));

    (fetchSlaCalculationJobHistory as jest.Mock).mockResolvedValue(overviewResponse);
    (triggerSlaCalculationJob as jest.Mock).mockResolvedValue({ runStatus: 'RUNNING' });
    (updateTriggerJobPeriod as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads SLA overview, triggers run, and refreshes data', async () => {
    render(<SlaCalculationTrigger />);

    await userEvent.click(screen.getByRole('button', { name: 'Trigger SLA Calculation' }));

    await waitFor(() => expect(fetchSlaCalculationJobHistory).toHaveBeenCalledWith(25));

    await userEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => expect(triggerSlaCalculationJob).toHaveBeenCalledWith('sla_job'));
    expect(fetchSlaCalculationJobHistory).toHaveBeenCalled();
  });



  it('shows update error when periodic save API returns empty response', async () => {
    const showMessage = jest.fn();
    mockUseSnackbar.mockReturnValue({ showMessage } as any);
    (updateTriggerJobPeriod as jest.Mock).mockResolvedValueOnce(null);

    render(<SlaCalculationTrigger />);
    await userEvent.click(screen.getByRole('button', { name: 'Trigger SLA Calculation' }));
    await waitFor(() => expect(fetchSlaCalculationJobHistory).toHaveBeenCalled());

    await userEvent.click(screen.getByTestId('EditIcon').closest('button')!);
    await userEvent.click(screen.getByTestId('CheckIcon').closest('button')!);

    await waitFor(() => {
      expect(updateTriggerJobPeriod).toHaveBeenCalled();
      expect(showMessage).toHaveBeenCalledWith('Unable to update trigger period', 'error');
    });
  });

  it('shows info when trigger API reports already running', async () => {
    const showMessage = jest.fn();
    mockUseSnackbar.mockReturnValue({ showMessage } as any);
    (triggerSlaCalculationJob as jest.Mock).mockResolvedValueOnce({ runStatus: 'SKIPPED' });

    render(<SlaCalculationTrigger />);
    await userEvent.click(screen.getByRole('button', { name: 'Trigger SLA Calculation' }));
    await waitFor(() => expect(fetchSlaCalculationJobHistory).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => {
      expect(showMessage).toHaveBeenCalledWith('An SLA job is already running. Showing latest status.', 'info');
    });
  });

  it('shows cron validation feedback and blocks invalid periodic save', async () => {
    const showMessage = jest.fn();
    mockUseSnackbar.mockReturnValue({ showMessage } as any);

    render(<SlaCalculationTrigger />);
    await userEvent.click(screen.getByRole('button', { name: 'Trigger SLA Calculation' }));
    await waitFor(() => expect(fetchSlaCalculationJobHistory).toHaveBeenCalled());

    await userEvent.click(screen.getByTestId('EditIcon').closest('button')!);

    const secondInput = screen.getByLabelText('second');
    await userEvent.clear(secondInput);
    await userEvent.type(secondInput, 'abc');

    await waitFor(() => expect(screen.getByText(/Only \*, \*\/n or number/)).toBeInTheDocument());
    const saveCronButton = screen.getByTestId('CheckIcon').closest('button');
    expect(saveCronButton).toBeDisabled();
    expect(updateTriggerJobPeriod).not.toHaveBeenCalled();
    expect(showMessage).not.toHaveBeenCalledWith('Trigger period updated', 'success');
  });
});
