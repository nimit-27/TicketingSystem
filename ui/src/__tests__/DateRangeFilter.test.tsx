import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangeFilter from '../components/Filters/DateRangeFilter';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}), { virtual: true });

jest.mock('../i18n', () => ({}));

jest.mock('../utils/Utils', () => ({
  getUserDetails: jest.fn(() => null),
  getUserPermissions: jest.fn(() => null),
  formatDateWithSuffix: jest.fn((date: Date) => date.toISOString()),
}));

jest.mock('../components/UI/IconButton/CustomIconButton', () => ({ onClick }: { onClick: () => void }) => (
  <button type="button" aria-label="apply" onClick={onClick}>
    apply
  </button>
));

jest.mock('../utils/dateUtils', () => {
  const actual = jest.requireActual('../utils/dateUtils');
  return {
    ...actual,
    getPresetDateRange: jest.fn((preset: string) => {
      if (preset === 'LAST_1_WEEK') {
        return { fromDate: '2024-01-01', toDate: '2024-01-07' };
      }
      return undefined;
    }),
  };
});

const dateUtils = require('../utils/dateUtils');

describe('DateRangeFilter', () => {
  it('allows selecting a preset and notifies parent', async () => {
    const onChange = jest.fn();

    render(<DateRangeFilter value={{ preset: 'ALL' }} onChange={onChange} />);

    const dropdown = screen.getByRole('combobox');
    await userEvent.click(dropdown);

    const lastWeekOption = await screen.findByRole('option', { name: 'Last 1 Week' });
    await userEvent.click(lastWeekOption);

    expect(dateUtils.getPresetDateRange).toHaveBeenCalledWith('LAST_1_WEEK');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ preset: 'LAST_1_WEEK' }));
  });

  it('applies custom date range when submitted', async () => {
    const onChange = jest.fn();

    render(
      <DateRangeFilter
        value={{ preset: 'CUSTOM', fromDate: '2024-01-02', toDate: '2024-01-05' }}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-02-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-02-06' } });

    await userEvent.click(screen.getByRole('button', { name: 'apply' }));

    expect(onChange).toHaveBeenCalledWith({ preset: 'CUSTOM', fromDate: '2024-02-01', toDate: '2024-02-06' });
  });
});
