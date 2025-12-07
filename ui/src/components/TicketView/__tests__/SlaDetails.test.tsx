import React from 'react';
import { render, screen } from '@testing-library/react';
import SlaDetails from '../SlaDetails';
import { TicketSla } from '../../../types';

jest.mock('../../UI/GenericTable', () => ({
  __esModule: true,
  default: ({ dataSource }: { dataSource: { key: string; metric: string; value: any }[] }) => (
    <table>
      <tbody>
        {(dataSource || []).map(row => (
          <tr key={row.key}>
            <td>{row.metric}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

describe('SlaDetails', () => {
  const baseSla: TicketSla = {
    id: '1',
    ticketId: 'T-1',
    createdAt: '2024-01-01T00:00:00Z',
    dueAt: '2024-01-02T00:00:00Z',
    dueAtAfterEscalation: '2024-01-03T00:00:00Z',
    actualDueAt: '2024-01-04T00:00:00Z',
    totalSlaMinutes: 300,
    responseTimeMinutes: 45,
    resolutionTimeMinutes: 120,
    idleTimeMinutes: 30,
    elapsedTimeMinutes: 200,
    timeTillDueDate: 100,
    workingTimeLeftMinutes: 80,
    breachedByMinutes: 0,
    status: 'IN_PROGRESS',
  } as any;

  it('renders SLA dates and numbers', () => {
    render(<SlaDetails sla={baseSla} />);

    expect(screen.getByText(/Original Due Date/)).toBeInTheDocument();
    expect(screen.getByText(/Due Date After Escalation/)).toBeInTheDocument();
    expect(screen.getAllByText(/2024/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('renders fallback when values missing', () => {
    const emptySla = { ...(baseSla as any), actualDueAt: undefined, responseTimeMinutes: null, resolutionTimeMinutes: undefined };
    render(<SlaDetails sla={emptySla} />);

    const placeholders = screen.getAllByText('-');
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
