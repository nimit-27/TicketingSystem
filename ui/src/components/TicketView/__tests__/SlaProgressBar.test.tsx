import React from 'react';
import { render } from '@testing-library/react';
import SlaProgressBar from '../SlaProgressBar';
import MultiValueProgressBar from '../../UI/MultiValueProgressBar';

jest.mock('../../UI/MultiValueProgressBar', () => {
  const mock = jest.fn(() => <div data-testid="multi-progress" />);
  return {
    __esModule: true,
    default: mock,
    LabelPosition: {} as any,
    MultiValueProgressMarker: {} as any,
    MultiValueProgressSegment: {} as any,
  };
});

describe('SlaProgressBar', () => {
  const sampleSla = {
    responseTimeMinutes: 15,
    resolutionTimeMinutes: 45,
    idleTimeMinutes: 10,
    elapsedTimeMinutes: 60,
    totalSlaMinutes: 120,
    breachedByMinutes: 0,
    timeTillDueDate: 30,
    dueAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    actualDueAt: '2024-01-01T12:00:00Z',
    dueAtAfterEscalation: '2024-01-03T00:00:00Z',
  } as any;

  it('returns null when no segments available', () => {
    const { container } = render(<SlaProgressBar sla={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('builds progress segments and forwards them to MultiValueProgressBar', () => {
    render(<SlaProgressBar sla={sampleSla} className="test-class" />);

    const mock = MultiValueProgressBar as jest.Mock;
    expect(mock).toHaveBeenCalled();
    const props = mock.mock.calls[0][0];
    expect(props.totalValue).toBe(120);
    expect(props.className).toBe('test-class');
    expect(props.segments.length).toBeGreaterThanOrEqual(4);
    expect(props.segments[0].endLabel).toBeTruthy();
  });
});
