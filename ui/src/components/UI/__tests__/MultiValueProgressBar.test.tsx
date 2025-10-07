import { render } from '@testing-library/react';
import MultiValueProgressBar, { MultiValueProgressSegment } from '../MultiValueProgressBar';

describe('MultiValueProgressBar', () => {
  const segments: MultiValueProgressSegment[] = [
    { value: 60, color: '#4caf50', startLabel: 'A', endLabel: 'B', marker: { left: true } },
    { value: 40, color: '#2196f3', startLabel: 'C', endLabel: 'D', marker: { right: true, size: 4, color: '#000' } },
  ];

  it('renders a segment for each value with computed widths', () => {
    const { container } = render(
      <MultiValueProgressBar segments={segments} totalValue={100} />,
    );

    const renderedSegments = container.querySelectorAll('.multi-progress__segment');
    expect(renderedSegments).toHaveLength(2);
    expect(renderedSegments[0]).toHaveStyle({ width: '60%' });
    expect(renderedSegments[1]).toHaveStyle({ width: '40%' });
  });

  it('renders labels and markers when provided', () => {
    const { container, getByText } = render(
      <MultiValueProgressBar segments={segments} totalValue={100} />,
    );

    expect(getByText('A')).toBeInTheDocument();
    expect(getByText('D')).toBeInTheDocument();

    const markers = container.querySelectorAll('.multi-progress__marker');
    expect(markers).toHaveLength(2);
  });

  it('handles empty segment lists gracefully', () => {
    const { container } = render(
      <MultiValueProgressBar segments={[]} totalValue={100} />,
    );

    expect(container.querySelectorAll('.multi-progress__segment')).toHaveLength(0);
  });
});
