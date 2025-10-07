import React from 'react';
import { render } from '@testing-library/react';

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
    const { getAllByText } = render(<Faq />);
    expect(mockApiHandler).toHaveBeenCalled();
    expect(getAllByText(/Question/)[0]).toBeInTheDocument();
    expect(getAllByText(/Answer/)[0]).toBeInTheDocument();
  });
});
