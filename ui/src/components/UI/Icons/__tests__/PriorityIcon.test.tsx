import React from 'react';
import { render } from '@testing-library/react';
import PriorityIcon from '../PriorityIcon';

const mockIconComponent = jest.fn((props: any) => <span data-testid="priority-arrow" {...props} />);

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...rest }: any) => <div data-testid="priority-box" data-transform={sx?.transform} {...rest}>{children}</div>,
  Tooltip: ({ children }: any) => <>{children}</>,
}));

jest.mock('../../IconButton/CustomIconButton', () => ({
  IconComponent: (props: any) => mockIconComponent(props),
}));

describe('PriorityIcon', () => {
  beforeEach(() => {
    mockIconComponent.mockClear();
  });

  it.each([
    { level: 4, expectedColor: '#ffd700' },
    { level: 3, expectedColor: 'orange' },
    { level: 2, expectedColor: 'orange' },
    { level: 1, expectedColor: 'red' },
    { level: 0, expectedColor: 'ffd700' },
  ])('uses getColor mapping for level $level', ({ level, expectedColor }) => {
    render(<PriorityIcon level={level} priorityText="priority" />);

    const firstCallProps = mockIconComponent.mock.calls[0][0];
    expect(firstCallProps.style.color).toBe(expectedColor);
    expect(firstCallProps.color).toBe(expectedColor);
  });

  it('renders inverted count based on level', () => {
    render(<PriorityIcon level={2} />);

    expect(mockIconComponent).toHaveBeenCalledTimes(3);
  });

  it('applies rotate style when rotateRight is true', () => {
    render(<PriorityIcon level={3} rotateRight />);

    const firstBox = document.querySelector('[data-testid="priority-box"]') as HTMLElement;
    expect(firstBox.getAttribute('data-transform')).toBe('rotate(90deg)');
  });
});
