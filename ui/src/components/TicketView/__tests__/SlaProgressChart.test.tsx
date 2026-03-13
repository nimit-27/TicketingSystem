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
    workingTimeLeftMinutes: 20,
    breachedByMinutes: 0,
  } as any;

  beforeEach(() => {
    mockReactECharts.mockClear();
  });

  it('returns null when no data available', () => {
    const { container } = render(<SlaProgressChart sla={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when all segment values resolve to zero', () => {
    const { container } = render(
      <SlaProgressChart
        sla={{
          responseTimeMinutes: 0,
          idleTimeMinutes: 0,
          resolutionTimeMinutes: 0,
          elapsedTimeMinutes: 0,
          totalSlaMinutes: 0,
          workingTimeLeftMinutes: 0,
          breachedByMinutes: 1,
        } as any}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(mockReactECharts).not.toHaveBeenCalled();
  });

  it('creates stacked bar chart configuration with remaining and other elapsed segments', () => {
    render(<SlaProgressChart sla={baseSla} className="chart" />);

    const props = mockReactECharts.mock.calls[0][0];
    expect(props.className).toBe('chart');

    const seriesByName = Object.fromEntries(props.option.series.map((s: any) => [s.name, s]));
    expect(seriesByName['Idle Time'].data[0]).toBe(8);
    expect(seriesByName['Resolution Time'].data[0]).toBe(20);
    expect(seriesByName['Other Elapsed'].data[0]).toBe(7);
    expect(seriesByName['Remaining Time']).toBeUndefined();
  });

  it('includes breached time segment when working time left is negative', () => {
    render(
      <SlaProgressChart
        sla={{
          ...baseSla,
          idleTimeMinutes: 0,
          resolutionTimeMinutes: 0,
          elapsedTimeMinutes: 60,
          workingTimeLeftMinutes: -15,
        } as any}
      />,
    );

    const props = mockReactECharts.mock.calls[0][0];
    const seriesNames = props.option.series.map((s: any) => s.name);
    expect(seriesNames).toContain('Breached Time');
    expect(seriesNames).not.toContain('Remaining Time');
  });

  it('formats tooltip duration text for mins, hrs, and days', () => {
    render(<SlaProgressChart sla={{ ...baseSla, elapsedTimeMinutes: 1600 } as any} />);

    const formatter = mockReactECharts.mock.calls[0][0].option.tooltip.formatter;

    const tooltip = formatter([
      { marker: '•', seriesName: 'Segment A', value: 1 },
      { marker: '•', seriesName: 'Segment B', value: 125 },
      { marker: '•', seriesName: 'Segment C', value: 2880 },
    ]);

    expect(tooltip).toContain('1 min');
    expect(tooltip).toContain('2 hrs 5 mins');
    expect(tooltip).toContain('2 days');
    expect(tooltip).toContain('Total: 2 days 2 hrs 6 mins');
  });
});
