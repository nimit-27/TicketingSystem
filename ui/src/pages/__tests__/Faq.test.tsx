import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../test/testUtils';

const mockApiHandler = jest.fn(() => Promise.resolve());
const mockUseApi = jest.fn(() => ({
  data: [
    { questionEn: 'Question EN', answerEn: 'Answer EN', keywords: 'test' },
    { questionHi: 'प्रश्न', answerHi: 'उत्तर', keywords: 'hi' },
  ],
  apiHandler: mockApiHandler,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('../../hooks/useApi', () => ({
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

jest.mock('../../services/FaqService', () => ({
  getFaqs: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../utils/permissions', () => ({
  checkAccessMaster: jest.fn(() => true),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

import Faq from '../Faq';

describe('Faq page', () => {
  beforeEach(() => {
    mockApiHandler.mockClear();
    mockUseApi.mockClear();
    mockUseApi.mockReturnValue({
      data: [
        { questionEn: 'Question EN', answerEn: 'Answer EN', keywords: 'test' },
        { questionHi: 'प्रश्न', answerHi: 'उत्तर', keywords: 'hi' },
      ],
      apiHandler: mockApiHandler,
    });
  });

  it('renders FAQ items and calls fetch on mount', () => {
    const { getAllByText, getByText, queryByText } = renderWithTheme(<Faq />);
    expect(mockApiHandler).toHaveBeenCalled();
    const question = getByText('Question EN');
    expect(question).toBeInTheDocument();
    expect(queryByText(/Answer EN/)).not.toBeInTheDocument();
    fireEvent.click(question);
    expect(getAllByText(/Answer EN/)[0]).toBeInTheDocument();
  });
});
