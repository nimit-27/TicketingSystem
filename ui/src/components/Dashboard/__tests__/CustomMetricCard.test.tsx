import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../test/testUtils';
import CustomMetricCard from '../CustomMetricCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => `t:${key}` }),
}));

describe('CustomMetricCard', () => {
  it('renders defaults/fallbacks and respects show flag for children', () => {
    renderWithTheme(
      <CustomMetricCard
        title={{ text: 'Open Tickets', attributes: { 'data-testid': 'title-text' } }}
        subtitle={{ text: '' }}
        metricValue={{ text: null }}
        children={[
          {
            title: { text: 'Visible Child', attributes: { 'data-testid': 'visible-child' } },
            metricValue: { text: 3 },
            show: true,
          },
          {
            title: { text: 'Hidden Child' },
            show: false,
          },
        ]}
      />
    );

    expect(screen.getByTestId('title-text')).toHaveTextContent('t:Open Tickets');
    expect(screen.queryByText('t:Hidden Child')).not.toBeInTheDocument();
    expect(screen.getByTestId('visible-child')).toHaveTextContent('t:Visible Child');
  });

  it('does not render when show is false', () => {
    const { container } = renderWithTheme(<CustomMetricCard show={false} title={{ text: 'Nope' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders metric text using translation wrapper', () => {
    renderWithTheme(
      <CustomMetricCard
        title={{ text: 'Title', textColor: 'primary.main' }}
        subtitle={{ text: 'Sub', textColor: 'secondary.main' }}
        metricValue={{ text: 42, textColor: '#123456' }}
        backgroundColor="background.paper"
      />
    );

    expect(screen.getByText('t:Title')).toBeInTheDocument();
    expect(screen.getByText('t:Sub')).toBeInTheDocument();
    expect(screen.getByText('t:42')).toBeInTheDocument();
  });
});
