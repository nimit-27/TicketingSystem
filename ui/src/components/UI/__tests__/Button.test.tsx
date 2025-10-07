import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenericButton from '../Button';
import { renderWithTheme } from '../../../test/testUtils';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}), { virtual: true });

describe('GenericButton', () => {
  it('renders translated text when textKey is provided', () => {
    renderWithTheme(<GenericButton textKey="actions.save" />);

    expect(screen.getByRole('button', { name: 'translated:actions.save' })).toBeInTheDocument();
  });

  it('renders children when no textKey is provided', async () => {
    const onClick = jest.fn();
    renderWithTheme(
      <GenericButton onClick={onClick}>
        Click Me
      </GenericButton>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Click Me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
