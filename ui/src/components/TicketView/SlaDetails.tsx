import React, { useMemo } from 'react';
import { TicketSla } from '../../types';
import GenericTable from '../UI/GenericTable';

interface Props {
  sla: TicketSla;
}

type SlaRow = {
  key: string;
  metric: string;
  value: string | number;
};

const renderDate = (value?: string) => (value ? new Date(value).toLocaleString() : '-');
const renderNumber = (value?: number | null) => (typeof value === 'number' ? value : '-');

const SlaDetails: React.FC<Props> = ({ sla }) => {
  const dataSource: SlaRow[] = useMemo(
    () => [
      { key: 'original-due-date', metric: 'Original Due Date', value: renderDate(sla.actualDueAt) },
      { key: 'escalated-due-date', metric: 'Due Date After Escalation', value: renderDate(sla.dueAtAfterEscalation) },
      { key: 'current-due-date', metric: 'Current Due Date', value: renderDate(sla.dueAt) },
      { key: 'time-till-due', metric: 'Time Till Due Date (mins)', value: renderNumber(sla.timeTillDueDate) },
      { key: 'working-time-left', metric: 'Working Time Left (mins)', value: renderNumber(sla.workingTimeLeftMinutes ?? null) },
      { key: 'response-time', metric: 'Response Time (mins)', value: renderNumber(sla.responseTimeMinutes ?? null) },
      { key: 'resolution-time', metric: 'Resolution Time (mins)', value: renderNumber(sla.resolutionTimeMinutes ?? null) },
      { key: 'idle-time', metric: 'Idle Time (mins)', value: renderNumber(sla.idleTimeMinutes ?? null) },
      { key: 'elapsed-time', metric: 'Elapsed Time (mins)', value: renderNumber(sla.elapsedTimeMinutes ?? null) },
      { key: 'breached-by', metric: 'Breached By (mins)', value: renderNumber(sla.breachedByMinutes ?? null) },
    ],
    [sla.actualDueAt, sla.breachedByMinutes, sla.dueAt, sla.dueAtAfterEscalation, sla.elapsedTimeMinutes, sla.idleTimeMinutes, sla.responseTimeMinutes, sla.resolutionTimeMinutes, sla.timeTillDueDate, sla.workingTimeLeftMinutes],
  );

  return (
    <GenericTable
      dataSource={dataSource}
      pagination={false}
      columns={[
        {
          title: 'Metric',
          dataIndex: 'metric',
          key: 'metric',
        },
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
        },
      ]}
    />
  );
};

export default SlaDetails;
