import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomTabsComponent from '../CustomTabsComponent';
import { renderWithTheme } from '../../../test/testUtils';

describe('CustomTabsComponent', () => {
  const tabs = [
    { key: 'first', tabTitle: 'First', tabComponent: <div>First content</div> },
    { key: 'second', tabTitle: 'Second', tabComponent: <div>Second content</div> },
  ];

  it('renders the first tab content by default', () => {
    renderWithTheme(<CustomTabsComponent tabs={tabs} />);

    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.queryByText('Second content')).not.toBeInTheDocument();
  });

  it('changes tab when a new tab is selected', async () => {
    const onTabChange = jest.fn();
    renderWithTheme(<CustomTabsComponent tabs={tabs} onTabChange={onTabChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Second' }));

    expect(onTabChange).toHaveBeenCalledWith('second');
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });

  it('respects the controlled currentTab prop', () => {
    const { rerender } = renderWithTheme(
      <CustomTabsComponent tabs={tabs} currentTab="second" />,
    );

    expect(screen.getByText('Second content')).toBeInTheDocument();

    rerender(
      <CustomTabsComponent tabs={tabs} currentTab="first" />,
    );

    expect(screen.getByText('First content')).toBeInTheDocument();
  });
});
