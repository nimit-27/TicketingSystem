import React, { useMemo } from 'react';
import MultiValueProgressBar, {
  LabelPosition,
  MultiValueProgressSegment,
} from './UI/MultiValueProgressBar';
import { TicketSla } from '../types';

interface SlaProgressBarProps {
  sla?: TicketSla | null;
  className?: string;
}

const START_LABEL_POSITION: LabelPosition = 'top';
const END_LABEL_POSITION: LabelPosition = 'bottom';

const formatMinutes = (value: number) => `${value} min${value === 1 ? '' : 's'}`;

const SlaProgressBar: React.FC<SlaProgressBarProps> = ({ sla, className }) => {
  const { segments, totalValue } = useMemo(() => {
    if (!sla) {
      return { segments: [] as MultiValueProgressSegment[], totalValue: 0 };
    }

    const resolution = Math.max(sla.resolutionTimeMinutes ?? 0, 0);
    const response = Math.max(sla.responseTimeMinutes ?? 0, 0);
    const elapsed = Math.max(sla.elapsedTimeMinutes ?? 0, 0);
    const breached = Math.max(sla.breachedByMinutes ?? 0, 0);

    const baseTotal = Math.max(resolution, response, elapsed);
    const calculatedTotal = breached > 0 ? baseTotal + breached : baseTotal;

    const progressSegments: MultiValueProgressSegment[] = [];

    if (resolution > 0) {
      progressSegments.push({
        value: resolution,
        color: '#4caf50',
        endLabel: `Resolution Time (${formatMinutes(resolution)})`,
        endLabelPosition: END_LABEL_POSITION,
      });
    }

    if (response > 0) {
      progressSegments.push({
        value: response,
        color: '#1e88e5',
        endLabel: `Response Time (${formatMinutes(response)})`,
        endLabelPosition: END_LABEL_POSITION,
      });
    }

    if (elapsed > 0) {
      progressSegments.push({
        value: elapsed,
        color: '#ff9800',
        endLabel: `Elapsed Time (${formatMinutes(elapsed)})`,
        endLabelPosition: END_LABEL_POSITION,
      });
    }

    if (breached > 0) {
      const breachTotal = calculatedTotal;
      progressSegments.push({
        value: breachTotal,
        color: '#f44336',
        startLabel: `Breached by ${formatMinutes(breached)}`,
        startLabelPosition: START_LABEL_POSITION,
        endLabel: 'Breached',
        endLabelPosition: END_LABEL_POSITION,
      });
    }

    return { segments: progressSegments, totalValue: calculatedTotal };
  }, [sla]);

  if (!segments.length || totalValue <= 0) {
    return null;
  }

  return (
    <MultiValueProgressBar segments={segments} totalValue={totalValue} className={className} />
  );
};

export default SlaProgressBar;
