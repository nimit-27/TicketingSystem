import React, { useMemo } from 'react';
import MultiValueProgressBar, {
  LabelPosition,
  MultiValueProgressMarker,
  MultiValueProgressSegment,
} from './UI/MultiValueProgressBar';
import { TicketSla } from '../types';

interface SlaProgressBarProps {
  sla?: TicketSla | null;
  className?: string;
}

const TOP_LABEL_POSITION: LabelPosition = 'top';
const BOTTOM_LABEL_POSITION: LabelPosition = 'bottom';

const formatMinutes = (value: number) => `${value} min${value === 1 ? '' : 's'}`;

const SlaProgressBar: React.FC<SlaProgressBarProps> = ({ sla, className }) => {
  const { segments, totalValue } = useMemo(() => {
    if (!sla) {
      return { segments: [] as MultiValueProgressSegment[], totalValue: 0 };
    }

    const resolution = Math.max(sla.resolutionTimeMinutes ?? 0, 0);
    const response = Math.max(sla.responseTimeMinutes ?? 0, 0);
    const elapsed = Math.max(sla.elapsedTimeMinutes ?? 0, 0);
    const totalSlaTime = Math.max(sla.totalSlaMinutes ?? 0, 0);
    const breached = Math.max(sla.breachedByMinutes ?? 0, 0);
    const dueDate = sla?.dueAt;
    const createdDate = sla?.createdAt;


    const progressSegments: MultiValueProgressSegment[] = [];

    const calculatedTotal = breached > 0 ? totalSlaTime + breached : totalSlaTime;

    if (breached <= 0) {
      console.log({ breached, dueDate, calculatedTotal })
      progressSegments.push({
        value: calculatedTotal,
        color: 'rgb(255 255 255 / 0)',
        endLabel: `Due Date ${dueDate}`,
        endLabelPosition: TOP_LABEL_POSITION,
        startLabel: `Created At ${createdDate}`,
        startLabelPosition: TOP_LABEL_POSITION,
        marker: { right: true, left: true, color: '#000000', size: 3 } as MultiValueProgressMarker,
      });
    } else {
      const breachTotal = calculatedTotal;
      progressSegments.push({
        value: breachTotal,
        color: '#f44336',
        endLabel: 'Breached',
        endLabelPosition: BOTTOM_LABEL_POSITION,
      });

      progressSegments.push({
        value: totalSlaTime,
        color: '#fc429fe0',
        endLabel: `Due Date ${dueDate}`,
        endLabelPosition: TOP_LABEL_POSITION,
        startLabel: `Created At ${createdDate}`,
        startLabelPosition: TOP_LABEL_POSITION,
        marker: { right: true, left: true, color: '#000000', size: 3 } as MultiValueProgressMarker,

      });
    }

    if (resolution > 0) {
      progressSegments.push({
        value: resolution,
        color: '#4caf50',
        endLabel: `Resolution Time (${formatMinutes(resolution)})`,
        endLabelPosition: BOTTOM_LABEL_POSITION,
      });
    }

    if (response > 0) {
      progressSegments.push({
        value: response,
        color: '#1e88e5',
        endLabel: `Response Time (${formatMinutes(response)})`,
        endLabelPosition: BOTTOM_LABEL_POSITION,
      });
    }

    if (elapsed > 0) {
      progressSegments.push({
        value: elapsed,
        color: '#ff9800',
        endLabel: `Elapsed Time (${formatMinutes(elapsed)})`,
        endLabelPosition: BOTTOM_LABEL_POSITION,
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
