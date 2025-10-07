import { screen } from '@testing-library/react';
import Fieldset from '../Fieldset';
import { renderWithTheme } from '../../../test/testUtils';

describe('Fieldset', () => {
  it('renders title and children', () => {
    renderWithTheme(
      <Fieldset title="Section title">
        <div>Child content</div>
      </Fieldset>,
    );

    expect(screen.getByText('Section title')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies collapsed spacing when collapsed is true', () => {
    const { container } = renderWithTheme(
      <Fieldset title="Collapsed" collapsed>
        <div>Inner</div>
      </Fieldset>,
    );

    const fieldset = container.querySelector('fieldset');
    expect(fieldset?.className).toContain('p-4');
    expect(fieldset?.className).not.toContain('pt-5');
  });
});
