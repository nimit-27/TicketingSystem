import React, { useMemo, ReactNode } from 'react';
import './MultiValueProgressBar.scss';

export type LabelPosition = 'top' | 'bottom' | 'hover';

export interface MultiValueProgressMarker {
  /** Displays a marker at the left edge of the segment. */
  left?: boolean;
  /** Displays a marker at the right edge of the segment. */
  right?: boolean;
  /** Thickness of the marker line in pixels. */
  size?: number;
  /** Colour of the marker line. */
  color?: string;
}

export interface MultiValueProgressSegment {
  /**
   * Numeric value represented by the segment. The component will normalise
   * the values of all segments so that the overall bar always fills to 100%.
   */
  value: number;
  /** Background colour for the segment. */
  color: string;
  /** Optional label rendered where the segment begins. */
  startLabel?: ReactNode;
  /** Optional label rendered where the segment ends. */
  endLabel?: ReactNode;
  /** Controls the vertical position of the starting label. */
  startLabelPosition?: LabelPosition;
  /** Controls the vertical position of the ending label. */
  endLabelPosition?: LabelPosition;
  /** Optional marker configuration rendered on the segment edges. */
  marker?: MultiValueProgressMarker;
}

export interface MultiValueProgressBarProps {
  /** List of segments that make up the multi value progress bar. */
  segments: MultiValueProgressSegment[];
  /**
   * Optional custom total value used to calculate segment widths. When not
   * provided, the sum of the segment values is used.
   */
  totalValue: number;
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
  const defaultMarkerColor = '#000000';
  const defaultMarkerSize = 2;

  const segmentsWithPosition = useMemo<SegmentWithPosition[]>(() => {
    if (!segments.length) return [];

    const breachedByMinutes = segments.filter((s) => s.endLabel === 'Breached')[0]?.value || 0;

    const safeTotal = totalValue;

    const sortedSegments = [...segments].sort((a, b) => b.value - a.value);

    if (safeTotal <= 0) {
      return sortedSegments.map((segment) => ({
        ...segment,
        offset: 0,
        width: 0,
      }));
    }

    let offset = 0;
    return sortedSegments.map((segment) => {
      const rawValue = Number.isFinite(segment.value) ? Math.max(segment.value, 0) : 0;
      const percentage = (rawValue / safeTotal) * 100;
      const availableSpace = Math.max(0, 100 - offset);
      const width = Math.min(Math.max(percentage, 0), availableSpace);
      const segmentWithPosition: SegmentWithPosition = {
        ...segment,
        offset,
        width,
      };
      return segmentWithPosition;
    });
  }, [segments, totalValue]);

  const containerClassName = ['multi-progress', className].filter(Boolean).join(' ');

  const renderLabel = (
    label: ReactNode | undefined,
    position: LabelPosition | undefined,
    type: 'start' | 'end',
  ) => {
    if (label === undefined || label === null) return null;
    const labelPosition = position ?? defaultLabelPosition;
    return (
      <span
        className={`multi-progress__label multi-progress__label--${type} multi-progress__label-position-${labelPosition}`}
      >
        {label}
      </span>
    );
  };

  const renderMarkers = (marker: MultiValueProgressMarker | undefined) => {
    if (!marker) return null;

    const markerColor = marker.color ?? defaultMarkerColor;
    const markerSize = marker.size ?? defaultMarkerSize;

    return (
      <>
        {marker.left ? (
          <span
            className="multi-progress__marker multi-progress__marker--left"
            style={{ backgroundColor: markerColor, width: markerSize }}
          />
        ) : null}
        {marker.right ? (
          <span
            className="multi-progress__marker multi-progress__marker--right"
            style={{ backgroundColor: markerColor, width: markerSize }}
          />
        ) : null}
      </>
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
            {renderMarkers(segment.marker)}
            {renderLabel(segment.startLabel, segment.startLabelPosition, 'start')}
            {renderLabel(segment.endLabel, segment.endLabelPosition, 'end')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiValueProgressBar;
