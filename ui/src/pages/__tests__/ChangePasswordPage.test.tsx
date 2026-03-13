import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';
import ChangePasswordPage from '../ChangePasswordPage';
import { LanguageContext } from '../../context/LanguageContext';
import { ThemeModeContext } from '../../context/ThemeContext';

const mockChangeUserPassword = jest.fn();
const mockShowMessage = jest.fn();
const mockLogout = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, params?: Record<string, any>) => {
    if (params?.seconds) {
      return key.replace('{{seconds}}', String(params.seconds));
    }
    return key;
  } }),
}));

jest.mock('../../services/UserService', () => ({
  changeUserPassword: (...args: unknown[]) => mockChangeUserPassword(...args),
}));

jest.mock('../../context/SnackbarContext', () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ userId: 'user-123' }),
}));

jest.mock('../../utils/Utils', () => ({
  logout: () => mockLogout(),
}));


const getInputByLabel = (label: string): HTMLInputElement => {
  const labelNode = screen.getByText(label);
  const formControl = labelNode.closest('.MuiFormControl-root');
  const input = formControl?.querySelector('input');
  if (!input) {
    throw new Error(`Input not found for label: ${label}`);
  }
  return input as HTMLInputElement;
};

const renderPage = () => renderWithTheme(
  <ThemeModeContext.Provider value={{ mode: 'light', toggle: jest.fn(), layout: 2, toggleLayout: jest.fn() }}>
    <LanguageContext.Provider value={{ language: 'en', toggleLanguage: jest.fn() }}>
      <ChangePasswordPage />
    </LanguageContext.Provider>
  </ThemeModeContext.Provider>,
);

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits successfully for a valid password and opens success state', async () => {
    mockChangeUserPassword.mockResolvedValueOnce({});
    renderPage();

    fireEvent.change(getInputByLabel('Enter Old Password'), { target: { value: 'OldPass@123' } });
    fireEvent.change(getInputByLabel('Enter New Password'), { target: { value: 'NewPass@1234' } });
    fireEvent.change(getInputByLabel('Re-enter New Password'), { target: { value: 'NewPass@1234' } });

    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => expect(mockChangeUserPassword).toHaveBeenCalledWith('user-123', {
      oldPassword: 'OldPass@123',
      newPassword: 'NewPass@1234',
    }));

    expect(mockShowMessage).toHaveBeenCalledWith('Password changed successfully', 'success');
  });

  it('maps old password server errors to field-level feedback', async () => {
    mockChangeUserPassword.mockRejectedValueOnce({
      response: { data: { apiError: { message: 'old password invalid' } } },
    });
    renderPage();

    fireEvent.change(getInputByLabel('Enter Old Password'), { target: { value: 'wrong' } });
    fireEvent.change(getInputByLabel('Enter New Password'), { target: { value: 'NewPass@1234' } });
    fireEvent.change(getInputByLabel('Re-enter New Password'), { target: { value: 'NewPass@1234' } });

    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('The old password you entered is incorrect.')).toBeInTheDocument();
    expect(mockShowMessage).toHaveBeenCalledWith('The old password you entered is incorrect.', 'error');
  });

  it('displays cooldown warning when API rate limits the request', async () => {
    jest.useFakeTimers();
    mockChangeUserPassword.mockRejectedValueOnce({
      response: { status: 429, headers: { 'retry-after': '5' }, data: { message: 'rate limit hit' } },
    });

    renderPage();

    fireEvent.change(getInputByLabel('Enter Old Password'), { target: { value: 'OldPass@123' } });
    fireEvent.change(getInputByLabel('Enter New Password'), { target: { value: 'NewPass@1234' } });
    fireEvent.change(getInputByLabel('Re-enter New Password'), { target: { value: 'NewPass@1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('Please wait 5 seconds before trying again.')).toBeInTheDocument();

    jest.useRealTimers();
  });
});
