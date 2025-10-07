import React from 'react';
import { render } from '@testing-library/react';
import SlaProgressChart from '../SlaProgressChart';

const mockReactECharts = jest.fn(() => <div data-testid="echarts" />);

jest.mock('echarts-for-react', () => ({
  __esModule: true,
  default: (...args: any[]) => mockReactECharts(...args),
}), { virtual: true });

describe('SlaProgressChart', () => {
  const baseSla = {
    responseTimeMinutes: 10,
    idleTimeMinutes: 8,
    resolutionTimeMinutes: 20,
    elapsedTimeMinutes: 45,
    totalSlaMinutes: 90,
    timeTillDueDate: 40,
    breachedByMinutes: 0,
  } as any;

  it('returns null when no data available', () => {
    const { container } = render(<SlaProgressChart sla={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('creates stacked bar chart configuration', () => {
    render(<SlaProgressChart sla={baseSla} className="chart" />);

    const mock = mockReactECharts;
    expect(mock).toHaveBeenCalled();
    const props = mock.mock.calls[0][0];
    expect(props.className).toBe('chart');
    expect(props.option.series.length).toBeGreaterThanOrEqual(3);
    const segmentNames = props.option.series.map((series: any) => series.name);
    expect(segmentNames).toContain('Idle Time');
    expect(segmentNames).toContain('Resolution Time');
  });
});
