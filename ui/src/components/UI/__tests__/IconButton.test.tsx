import { screen } from '@testing-library/react';
import CustomIconButton, { IconComponent } from '../IconButton/CustomIconButton';
import { renderWithTheme } from '../../../test/testUtils';

describe('CustomIconButton and IconComponent', () => {
  it('renders the mapped material icon when a known key is provided', () => {
    const { container } = renderWithTheme(
      <CustomIconButton icon="delete" aria-label="delete" />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('falls back to rendering the icon name when unknown', () => {
    const { container } = renderWithTheme(
      <IconComponent icon="unknown" className="fallback" />,
    );

    expect(container.querySelector('.fallback')?.textContent).toBe('unknown');
  });

});
