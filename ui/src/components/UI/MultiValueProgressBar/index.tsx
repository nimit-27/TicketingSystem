import React, { useMemo } from 'react';
import './MultiValueProgressBar.scss';

export type LabelPosition = 'top' | 'bottom' | 'hover';

export interface MultiValueProgressSegment {
  /**
   * Numeric value represented by the segment. The component will normalise
   * the values of all segments so that the overall bar always fills to 100%.
   */
  value: number;
  /** Background colour for the segment. */
  color: string;
  /** Optional label rendered where the segment begins. */
  startLabel?: string;
  /** Optional label rendered where the segment ends. */
  endLabel?: string;
  /** Controls the vertical position of the starting label. */
  startLabelPosition?: LabelPosition;
  /** Controls the vertical position of the ending label. */
  endLabelPosition?: LabelPosition;
}

export interface MultiValueProgressBarProps {
  /** List of segments that make up the multi value progress bar. */
  segments: MultiValueProgressSegment[];
  /**
   * Optional custom total value used to calculate segment widths. When not
   * provided, the sum of the segment values is used.
   */
  totalValue?: number;
  /** Additional class name applied to the component container. */
  className?: string;
}

interface SegmentWithPosition extends MultiValueProgressSegment {
  offset: number;
  width: number;
}

const defaultLabelPosition: LabelPosition = 'top';

const MultiValueProgressBar: React.FC<MultiValueProgressBarProps> = ({
  segments,
  totalValue,
  className,
}) => {
  const segmentsWithPosition = useMemo<SegmentWithPosition[]>(() => {
    if (!segments.length) return [];

    const safeTotal = totalValue ?? segments.reduce((acc, segment) => {
      const value = Number.isFinite(segment.value) ? Math.max(segment.value, 0) : 0;
      return acc + value;
    }, 0);

    if (safeTotal <= 0) {
      return segments.map((segment) => ({
        ...segment,
        offset: 0,
        width: 0,
      }));
    }

    let offset = 0;
    return segments.map((segment) => {
      const rawValue = Number.isFinite(segment.value) ? Math.max(segment.value, 0) : 0;
      const percentage = (rawValue / safeTotal) * 100;
      const availableSpace = Math.max(0, 100 - offset);
      const width = Math.min(Math.max(percentage, 0), availableSpace);
      const segmentWithPosition: SegmentWithPosition = {
        ...segment,
        offset,
        width,
      };
      offset += width;
      return segmentWithPosition;
    });
  }, [segments, totalValue]);

  const containerClassName = ['multi-progress', className].filter(Boolean).join(' ');

  const renderLabel = (
    label: string | undefined,
    position: LabelPosition | undefined,
    type: 'start' | 'end',
  ) => {
    if (!label) return null;
    const labelPosition = position ?? defaultLabelPosition;
    return (
      <span
        className={`multi-progress__label multi-progress__label--${type} multi-progress__label-position-${labelPosition}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className={containerClassName}>
      <div className="multi-progress__track">
        {segmentsWithPosition.map((segment, index) => (
          <div
            key={`multi-progress-segment-${index}`}
            className="multi-progress__segment"
            style={{
              width: `${segment.width}%`,
              left: `${segment.offset}%`,
              backgroundColor: segment.color,
            }}
          >
            {renderLabel(segment.startLabel, segment.startLabelPosition, 'start')}
            {renderLabel(segment.endLabel, segment.endLabelPosition, 'end')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiValueProgressBar;
