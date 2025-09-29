import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { TicketSla } from '../types';

interface SlaProgressChartProps {
  sla?: TicketSla | null;
  className?: string;
}

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

const SlaProgressChart: React.FC<SlaProgressChartProps> = ({ sla, className }) => {
  const option = useMemo(() => {
    if (!sla) {
      return null;
    }

    const response = Math.max(sla.responseTimeMinutes ?? 0, 0);
    const idle = Math.max(sla.idleTimeMinutes ?? 0, 0);
    const resolution = Math.max(sla.resolutionTimeMinutes ?? 0, 0);
    const elapsed = Math.max(sla.elapsedTimeMinutes ?? 0, 0);
    const totalSlaTime = Math.max(sla.totalSlaMinutes ?? 0, elapsed);

    const rawBreached = sla.breachedByMinutes ?? 0;
    // const breached = Math.max(rawBreached, 0);
    const timeTillDueDate = Math.max(sla.timeTillDueDate ?? 0)
    const knownElapsed = response + idle + resolution;
    const otherElapsed = Math.max(elapsed - knownElapsed, 0);

    const remaining = rawBreached > 0 ? 0 : Math.max(timeTillDueDate + idle - elapsed, 0);

    const breached = timeTillDueDate < 0 ? Math.abs(timeTillDueDate) : 0

    const segments = [
      // {
      //   name: 'Response Time',
      //   value: response,
      //   color: '#1e88e5',
      // },
      {
        name: 'Idle Time',
        value: idle,
        color: '#9e9e9e',
      },
      {
        name: 'Resolution Time',
        value: resolution,
        color: '#4caf50',
      },
      {
        name: 'Other Elapsed',
        value: otherElapsed,
        color: '#ffb74d',
      },
      {
        name: 'Remaining Time',
        value: remaining,
        color: '#9575cd',
      },
      {
        name: 'Breached Time',
        value: breached,
        color: '#f44336',
      },
    ].filter((segment) => segment.value > 0);

    if (!segments.length) {
      return null;
    }

    type TooltipParam = {
      value: number;
      seriesName: string;
      marker: string;
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: TooltipParam[]) => {
          const lines = params
            .filter((param) => param.value > 0)
            .map((param) => `${param.marker} ${param.seriesName}: ${formatDuration(param.value)}`);

          const total = params.reduce((sum, param) => sum + (Number(param.value) || 0), 0);
          lines.push(`<strong>Total: ${formatDuration(total)}</strong>`);

          return lines.join('<br />');
        },
      },
      legend: {
        data: segments.map((segment) => segment.name),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Minutes',
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: 'category',
        data: ['Timeline'],
      },
      series: segments.map((segment) => ({
        name: segment.name,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        itemStyle: { color: segment.color },
        data: [segment.value],
      })),
    };
  }, [sla]);

  if (!option) {
    return null;
  }

  return (
    <ReactECharts
      className={className}
      option={option}
      style={{ height: 320, width: '100%' }}
      notMerge
      lazyUpdate
    />
  );
};

export default SlaProgressChart;
