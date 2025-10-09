import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import LanguageProvider, { LanguageContext } from '../LanguageContext';
import i18n from '../../i18n';

jest.mock('../../i18n', () => ({
  changeLanguage: jest.fn(),
}));

describe('LanguageContext', () => {
  const Consumer: React.FC = () => {
    const { language, toggleLanguage } = React.useContext(LanguageContext);

    return (
      <div>
        <span data-testid="language">{language}</span>
        <button type="button" onClick={toggleLanguage}>
          toggle
        </button>
      </div>
    );
  };

  beforeEach(() => {
    (i18n.changeLanguage as jest.Mock).mockClear();
  });

  it('starts with English language', () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('language').textContent).toBe('en');
  });

  it('toggles between English and Hindi and updates i18n', () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('language').textContent).toBe('hi');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('hi');

    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(i18n.changeLanguage).toHaveBeenLastCalledWith('en');
  });
});
