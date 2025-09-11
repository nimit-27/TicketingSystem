import React from 'react';
import { Box, Typography } from '@mui/material';
import { TicketSla } from '../types';

interface Props {
  sla: TicketSla;
}

const SlaDetails: React.FC<Props> = ({ sla }) => {
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td><Typography color="text.secondary">Due At</Typography></td>
          <td><Typography>{sla.dueAt ? new Date(sla.dueAt).toLocaleString() : '-'}</Typography></td>
        </tr>
        <tr>
          <td><Typography color="text.secondary">Resolution Time (mins)</Typography></td>
          <td><Typography>{sla.resolutionTimeMinutes ?? '-'}</Typography></td>
        </tr>
        <tr>
          <td><Typography color="text.secondary">Elapsed Time (mins)</Typography></td>
          <td><Typography>{sla.elapsedTimeMinutes ?? '-'}</Typography></td>
        </tr>
        <tr>
          <td><Typography color="text.secondary">Response Time (mins)</Typography></td>
          <td><Typography>{sla.responseTimeMinutes ?? '-'}</Typography></td>
        </tr>
        <tr>
          <td><Typography color="text.secondary">Breached By (mins)</Typography></td>
          <td><Typography>{sla.breachedByMinutes ?? '-'}</Typography></td>
        </tr>
      </tbody>
    </Box>
  );
};

export default SlaDetails;
