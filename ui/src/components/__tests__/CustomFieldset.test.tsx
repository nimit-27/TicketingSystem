import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomFieldset from '../CustomFieldset';
import { ThemeModeContext } from '../../context/ThemeContext';
import { renderWithTheme } from '../../test/testUtils';

type ThemeContextValue = React.ContextType<typeof ThemeModeContext>;

const createContextValue = (overrides?: Partial<ThemeContextValue>): ThemeContextValue => ({
  mode: 'light',
  toggle: () => undefined,
  layout: 1,
  toggleLayout: () => undefined,
  ...overrides,
});

const renderFieldset = (
  element: React.ReactElement,
  contextOverrides?: Partial<ThemeContextValue>,
) =>
  renderWithTheme(
    <ThemeModeContext.Provider value={createContextValue(contextOverrides)}>
      {element}
    </ThemeModeContext.Provider>,
  );

describe('CustomFieldset', () => {
  it('renders the underlined variant and toggles collapse from the header', async () => {
    renderFieldset(
      <CustomFieldset title="Details" variant="underlined">
        <div>Underlined content</div>
      </CustomFieldset>,
    );

    expect(screen.getByText('Underlined content')).toBeInTheDocument();

    const header = screen.getByText('Details').closest('div');
    expect(header).not.toBeNull();

    await userEvent.click(header!);
    expect(screen.queryByText('Underlined content')).not.toBeInTheDocument();

    await userEvent.click(header!);
    expect(screen.getByText('Underlined content')).toBeInTheDocument();
  });

  it('renders the bordered variant with an action element and collapses via the legend', async () => {
    const { container } = renderFieldset(
      <CustomFieldset
        title="Settings"
        variant="bordered"
        actionElement={<button type="button">Action</button>}
      >
        <div>Bordered content</div>
      </CustomFieldset>,
    );

    expect(container.querySelector('fieldset')).toBeInTheDocument();
    expect(screen.getByText('Bordered content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();

    const legend = container.querySelector('legend');
    expect(legend).not.toBeNull();

    await userEvent.click(legend!);
    expect(screen.queryByText('Bordered content')).not.toBeInTheDocument();

    await userEvent.click(legend!);
    expect(screen.getByText('Bordered content')).toBeInTheDocument();
  });

  it('updates the rendered variant when the prop changes', async () => {
    const { container, rerender } = renderFieldset(
      <CustomFieldset title="Dynamic" variant="bordered">
        <div>Dynamic content</div>
      </CustomFieldset>,
    );

    await waitFor(() => {
      expect(container.querySelector('fieldset')).toBeInTheDocument();
    });
    expect(container.querySelector('.form-container')).toBeNull();

    rerender(
      <ThemeModeContext.Provider value={createContextValue()}>
        <CustomFieldset title="Dynamic" variant="basic">
          <div>Dynamic content</div>
        </CustomFieldset>
      </ThemeModeContext.Provider>,
    );

    await waitFor(() => {
      const basicFieldset = container.querySelector('fieldset');
      expect(basicFieldset).toBeInTheDocument();
      expect(basicFieldset?.className).toContain('px-3');
    });

    rerender(
      <ThemeModeContext.Provider value={createContextValue()}>
        <CustomFieldset title="Dynamic" variant="underlined">
          <div>Dynamic content</div>
        </CustomFieldset>
      </ThemeModeContext.Provider>,
    );

    await waitFor(() => {
      expect(container.querySelector('.form-container')).toBeInTheDocument();
    });
    expect(container.querySelector('fieldset')).toBeNull();
  });
});
