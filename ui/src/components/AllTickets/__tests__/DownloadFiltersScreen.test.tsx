import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadFiltersScreen from '../DownloadFiltersScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../AssigneeFilterDropdown', () => ({
    __esModule: true,
    default: ({ value, onChange }: any) => (
        <button data-testid="assignee-filter" onClick={() => onChange('agent.one')}>
            {value || 'assignee'}
        </button>
    ),
}));

jest.mock('@mui/material', () => {
    const actual = jest.requireActual('@mui/material');
    return {
        ...actual,
        FormControl: ({ children }: any) => <div>{children}</div>,
        InputLabel: ({ children }: any) => <label>{children}</label>,
        Select: ({ value, onChange, children, label }: any) => (
            <select aria-label={label} value={value} onChange={onChange}>
                {children}
            </select>
        ),
        MenuItem: ({ value, children }: any) => <option value={value}>{children}</option>,
        Alert: ({ children, severity }: any) => <div data-testid={`alert-${severity}`}>{children}</div>,
    };
});

describe('DownloadFiltersScreen', () => {
    const props = {
        year: 2025 as number | '',
        month: '' as number | '',
        fromDate: '2025-01-01',
        toDate: '2025-01-31',
        category: 'cat1',
        subCategory: 'sub1',
        zone: 'zone1',
        region: 'region1',
        district: 'district1',
        issueType: 'issue1',
        division: 'division1',
        assignee: 'All',
        status: 'OPEN',
        yearOptions: [2024, 2025],
        monthOptions: [{ value: 1, label: 'Jan' }],
        categoryOptions: [{ label: 'Category 1', value: 'cat1' }],
        subCategoryOptions: [{ label: 'Sub 1', value: 'sub1' }],
        zoneOptions: [{ label: 'Zone 1', value: 'zone1' }],
        regionOptions: [{ label: 'Region 1', value: 'region1' }],
        districtOptions: [{ label: 'District 1', value: 'district1' }],
        issueTypeOptions: [{ label: 'Issue 1', value: 'issue1' }],
        divisionOptions: [{ label: 'Division 1', value: 'division1' }],
        statusOptions: [{ label: 'Open', value: 'OPEN' }],
        generationState: 'idle' as const,
        estimateLoading: false,
        estimateCountPending: false,
        estimatedCount: 2345,
        selectedRangeDays: 45,
        isRangeInvalid: true,
        onRetryExport: jest.fn(),
        onYearChange: jest.fn(),
        onMonthChange: jest.fn(),
        onCategoryChange: jest.fn(),
        onSubCategoryChange: jest.fn(),
        onZoneChange: jest.fn(),
        onRegionChange: jest.fn(),
        onDistrictChange: jest.fn(),
        onIssueTypeChange: jest.fn(),
        onDivisionChange: jest.fn(),
        onAssigneeChange: jest.fn(),
        onStatusChange: jest.fn(),
        onFromDateChange: jest.fn(),
        onToDateChange: jest.fn(),
        onApplyPresetRange: jest.fn(),
        onOpenColumns: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('handles all filter change interactions and actions', async () => {
        render(<DownloadFiltersScreen {...props} />);

        fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), { target: { value: '2024' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Month' }), { target: { value: '1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Module' }), { target: { value: 'cat1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Sub Module' }), { target: { value: 'sub1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Zone' }), { target: { value: 'zone1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Region' }), { target: { value: 'region1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'District' }), { target: { value: 'district1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Issue Type' }), { target: { value: 'issue1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Division' }), { target: { value: 'division1' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'OPEN' } });

        fireEvent.change(screen.getByLabelText('From Date'), { target: { value: '2025-01-02' } });
        fireEvent.change(screen.getByLabelText('To Date'), { target: { value: '2025-01-30' } });

        await userEvent.click(screen.getByTestId('assignee-filter'));
        await userEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
        await userEvent.click(screen.getByRole('button', { name: 'Last 30 days' }));
        await userEvent.click(screen.getByRole('button', { name: 'Select/Unselect Columns' }));

        expect(props.onYearChange).toHaveBeenCalledWith(2024);
        expect(props.onMonthChange).toHaveBeenCalledWith(1);
        expect(props.onCategoryChange).toHaveBeenCalledWith('cat1');
        expect(props.onSubCategoryChange).toHaveBeenCalledWith('sub1');
        expect(props.onZoneChange).toHaveBeenCalledWith('zone1');
        expect(props.onRegionChange).toHaveBeenCalledWith('region1');
        expect(props.onDistrictChange).toHaveBeenCalledWith('district1');
        expect(props.onIssueTypeChange).toHaveBeenCalledWith('issue1');
        expect(props.onDivisionChange).toHaveBeenCalledWith('division1');
        expect(props.onStatusChange).toHaveBeenCalledWith('OPEN');
        expect(props.onFromDateChange).toHaveBeenCalledWith('2025-01-02');
        expect(props.onToDateChange).toHaveBeenCalledWith('2025-01-30');
        expect(props.onAssigneeChange).toHaveBeenCalledWith('agent.one');
        expect(props.onApplyPresetRange).toHaveBeenNthCalledWith(1, 7);
        expect(props.onApplyPresetRange).toHaveBeenNthCalledWith(2, 30);
        expect(props.onOpenColumns).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Estimated records: ~1,234')).toBeInTheDocument();
        expect(screen.getByTestId('alert-warning')).toHaveTextContent('Please select a valid date range.');
        expect(screen.getByTestId('alert-info')).toHaveTextContent('Large date range selected. It may take some time to download this data.');
    });

    it('shows generating state with downloads guidance and link when loading', async () => {
        render(
            <DownloadFiltersScreen
                {...props}
                generationState="generating"
                estimateLoading
                estimateCountPending={false}
                selectedRangeDays={null}
                isRangeInvalid={false}
            />,
        );

        expect(screen.getByText('Estimating records...')).toBeInTheDocument();
        expect(screen.getByTestId('alert-info')).toHaveTextContent('Go to Downloads.');
        expect(screen.getByRole('link', { name: 'Open Downloads' })).toHaveAttribute('href', '/downloads');
    });

    it('shows error state with retry and unavailable estimate fallback', async () => {
        render(
            <DownloadFiltersScreen
                {...props}
                generationState="error"
                estimatedCount={null}
                estimateLoading={false}
                estimateCountPending={false}
                selectedRangeDays={null}
                isRangeInvalid={false}
            />,
        );

        expect(screen.getByText('Estimated records unavailable')).toBeInTheDocument();
        expect(screen.getByTestId('alert-error')).toHaveTextContent('Export failed. Range may be too large; narrow filters or request async report.');

        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
        expect(props.onRetryExport).toHaveBeenCalledTimes(1);
    });
});
