import React from 'react';
import { render, screen } from '@testing-library/react';
import SlaJobHistoryTable from '../SlaJobHistoryTable';

const runs = [
  {
    id: '1',
    startedAt: '2024-01-01T00:00:00.000Z',
    completedAt: '2024-01-01T00:01:40.000Z',
    durationMs: 100000,
    triggerType: 'MANUAL',
    scope: 'ACTIVE_ONLY',
    triggeredBy: 'agent',
    runStatus: 'COMPLETED',
    totalCandidateTickets: 10,
    processedTickets: 10,
    succeededTickets: 9,
    failedTickets: 1,
    errorSummary: null,
  },
] as any;

describe('SlaJobHistoryTable', () => {
  it('renders run data with formatted duration and status chip', () => {
    render(<SlaJobHistoryTable history={runs} />);

    expect(screen.getByText('MANUAL')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE_ONLY')).toBeInTheDocument();
    expect(screen.getByText('1m 40s')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('agent')).toBeInTheDocument();
  });

  it('renders empty state when no runs are available', () => {
    render(<SlaJobHistoryTable history={[]} />);
    expect(screen.getByText('No SLA job runs found.')).toBeInTheDocument();
  });
});
