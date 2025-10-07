import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

const mockCreateFaq = jest.fn(() => Promise.resolve());
const mockNavigate = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../services/FaqService', () => ({
  createFaq: (...args: unknown[]) => mockCreateFaq(...(args as [any])),
}));

jest.mock('../../config/config', () => ({
  getCurrentUserDetails: () => ({ userId: 'user-1' }),
}));

jest.mock('../../components/UI/SuccessModal', () => ({
  __esModule: true,
  default: ({ open, title }: { open: boolean; title: string }) => (
    <div data-testid="success-modal">{open ? title : 'closed'}</div>
  ),
}));

jest.mock('../../components/UI/FailureModal', () => ({
  __esModule: true,
  default: ({ open, title }: { open: boolean; title: string }) => (
    <div data-testid="failure-modal">{open ? title : 'closed'}</div>
  ),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import FaqForm from '../FaqForm';

describe('FaqForm', () => {
  const originalConfirm = window.confirm;
  const originalAlert = window.alert;

  beforeEach(() => {
    mockCreateFaq.mockClear();
    mockNavigate.mockClear();
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });

  it('submits form when valid data is provided', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<FaqForm />);

    fireEvent.change(getByPlaceholderText('Question (English)'), { target: { value: 'What?' } });
    fireEvent.change(getByPlaceholderText('Question (Hindi)'), { target: { value: 'क्या?' } });
    fireEvent.change(getByPlaceholderText('Answer (English)'), { target: { value: 'Because.' } });
    fireEvent.change(getByPlaceholderText('Answer (Hindi)'), { target: { value: 'क्योंकि.' } });
    fireEvent.change(getByPlaceholderText('Keywords (pipe separated)'), { target: { value: 'test' } });

    fireEvent.click(getByText('Submit'));

    await waitFor(() => {
      expect(mockCreateFaq).toHaveBeenCalled();
      expect(getByTestId('success-modal')).toHaveTextContent('Question and answer created successfully');
    });
  });

  it('navigates back when cancel is clicked', () => {
    const { getByText } = render(<FaqForm />);
    fireEvent.click(getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
