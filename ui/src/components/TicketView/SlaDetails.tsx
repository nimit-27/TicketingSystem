import React from 'react';
import { Box, Typography } from '@mui/material';
import { TicketSla } from '../../types';

interface Props {
  sla: TicketSla;
}

const renderDate = (value?: string) => (value ? new Date(value).toLocaleString() : '-');
const renderNumber = (value?: number | null) => (typeof value === 'number' ? value : '-');

const SlaDetails: React.FC<Props> = ({ sla }) => (
  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      <tr>
        <td><Typography color="text.secondary">Original Due Date</Typography></td>
        <td><Typography>{renderDate(sla.actualDueAt)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Due Date After Escalation</Typography></td>
        <td><Typography>{renderDate(sla.dueAtAfterEscalation)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Current Due Date</Typography></td>
        <td><Typography>{renderDate(sla.dueAt)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Time Till Due Date (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.timeTillDueDate)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Working Time Left (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.workingTimeLeftMinutes ?? null)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Response Time (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.responseTimeMinutes ?? null)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Resolution Time (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.resolutionTimeMinutes ?? null)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Idle Time (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.idleTimeMinutes ?? null)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Elapsed Time (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.elapsedTimeMinutes ?? null)}</Typography></td>
      </tr>
      <tr>
        <td><Typography color="text.secondary">Breached By (mins)</Typography></td>
        <td><Typography>{renderNumber(sla.breachedByMinutes ?? null)}</Typography></td>
      </tr>
    </tbody>
  </Box>
);

export default SlaDetails;
