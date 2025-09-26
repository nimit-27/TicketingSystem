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

const formatDuration = (value: number) => {
  const totalMinutes = Math.max(Math.floor(value), 0);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
};

const formatDateInWords = (value?: string) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const createLabelContent = (title: string, value: string, helper?: string) => (
  <span className="multi-progress__label-text">
    <span className="multi-progress__label-title">{title}</span>
    <span className="multi-progress__label-value">{value}</span>
    {helper ? <span className="multi-progress__label-helper">{helper}</span> : null}
  </span>
);

const SlaProgressBar: React.FC<SlaProgressBarProps> = ({ sla, className }) => {
  const { segments, totalValue } = useMemo(() => {
    if (!sla) {
      return { segments: [] as MultiValueProgressSegment[], totalValue: 0 };
    }

    const resolution = Math.max(sla.resolutionTimeMinutes ?? 0, 0);
    const response = Math.max(sla.responseTimeMinutes ?? 0, 0);
    const elapsed = Math.max(sla.elapsedTimeMinutes ?? 0, 0);
    const totalSlaTime = Math.max(sla.totalSlaMinutes ?? 0, 0);
    const rawBreached = sla.breachedByMinutes ?? 0;
    const breached = Math.max(rawBreached, 0);
    const dueDate = sla?.dueAt;
    const createdDate = sla?.createdAt;
    const timeTillDueDate = Math.max(sla.timeTillDueDate ?? 0, rawBreached < 0 ? Math.abs(rawBreached) : 0);

    const dueDateLabel = createLabelContent(
      'Due Date',
      formatDateInWords(dueDate),
      timeTillDueDate > 0 ? `${formatDuration(timeTillDueDate)} remaining` : undefined,
    );
    const createdDateLabel = createLabelContent('Created Date', formatDateInWords(createdDate));


    const progressSegments: MultiValueProgressSegment[] = [];

    const calculatedTotal = breached > 0 ? totalSlaTime + breached : totalSlaTime;

    if (breached <= 0) {
      progressSegments.push({
        value: calculatedTotal,
        color: 'rgb(255 255 255 / 0)',
        endLabel: dueDateLabel,
        endLabelPosition: TOP_LABEL_POSITION,
        startLabel: createdDateLabel,
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
        endLabel: dueDateLabel,
        endLabelPosition: TOP_LABEL_POSITION,
        startLabel: createdDateLabel,
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
        endLabel: createLabelContent('Elapsed Time', formatDuration(elapsed)),
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
