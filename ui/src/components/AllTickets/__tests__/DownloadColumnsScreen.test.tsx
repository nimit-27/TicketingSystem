import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadColumnsScreen from '../DownloadColumnsScreen';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockGenericTable = jest.fn(() => <div data-testid="preview-table">table</div>);
jest.mock('../../UI/GenericTable', () => ({
    __esModule: true,
    default: (props: any) => mockGenericTable(props),
}));

describe('DownloadColumnsScreen', () => {
    const columns = [
        { key: 'id', label: 'Ticket Id' },
        { key: 'subject', label: 'Subject' },
    ];

    it('triggers callbacks and toggles individual columns', async () => {
        const onBack = jest.fn();
        const onSelectAll = jest.fn();
        const onToggleColumn = jest.fn();
        const onPreview = jest.fn();

        render(
            <DownloadColumnsScreen
                columns={columns}
                selectedColumnKeys={['id']}
                showPreview={false}
                onBack={onBack}
                onToggleColumn={onToggleColumn}
                onSelectAll={onSelectAll}
                onPreview={onPreview}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Back to Filters' }));
        await userEvent.click(screen.getByRole('button', { name: 'Select All' }));
        await userEvent.click(screen.getByRole('checkbox', { name: 'Subject' }));
        await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onSelectAll).toHaveBeenCalledTimes(1);
        expect(onToggleColumn).toHaveBeenCalledWith('subject');
        expect(onPreview).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('preview-table')).not.toBeInTheDocument();
    });

    it('renders empty-state message when preview is opened without selected columns', () => {
        render(
            <DownloadColumnsScreen
                columns={columns}
                selectedColumnKeys={[]}
                showPreview
                onBack={jest.fn()}
                onToggleColumn={jest.fn()}
                onSelectAll={jest.fn()}
                onPreview={jest.fn()}
            />,
        );

        expect(screen.getByText('Please select at least one column.')).toBeInTheDocument();
        expect(screen.queryByTestId('preview-table')).not.toBeInTheDocument();
    });

    it('builds preview columns/data for selected keys and passes them to GenericTable', () => {
        render(
            <DownloadColumnsScreen
                columns={columns}
                selectedColumnKeys={['subject']}
                showPreview
                onBack={jest.fn()}
                onToggleColumn={jest.fn()}
                onSelectAll={jest.fn()}
                onPreview={jest.fn()}
            />,
        );

        expect(mockGenericTable).toHaveBeenCalled();
        expect(mockGenericTable).toHaveBeenLastCalledWith(expect.objectContaining({
            columns: [
                { title: 'Subject', dataIndex: 'subject', key: 'subject' },
            ],
            dataSource: [
                { key: 'preview-row', subject: 'Subject Value' },
            ],
            pagination: false,
            scroll: { x: true },
        }));
    });
});
