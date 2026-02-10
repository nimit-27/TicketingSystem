import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import CustomIconButton from '../UI/IconButton/CustomIconButton';

export interface HistoryReportColumn<T> {
    key: string;
    header: string;
    getValue: (row: T) => string;
}

interface HistoryReportDownloadMenuProps<T> {
    title: string;
    fileBaseName: string;
    rows: T[];
    columns: HistoryReportColumn<T>[];
}

const HistoryReportDownloadMenu = <T,>({ title, fileBaseName, rows, columns }: HistoryReportDownloadMenuProps<T>) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const preparedRows = useMemo(
        () => rows.map((row) => columns.reduce<Record<string, string>>((acc, column) => {
            acc[column.header] = column.getValue(row);
            return acc;
        }, {})),
        [columns, rows],
    );

    const downloadExcel = useCallback(() => {
        const worksheet = XLSX.utils.json_to_sheet(preparedRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title);
        XLSX.writeFile(workbook, `${fileBaseName}.xlsx`);
    }, [fileBaseName, preparedRows, title]);

    const downloadPdf = useCallback(() => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(title, 14, 14);

        autoTable(doc, {
            startY: 20,
            head: [columns.map((column) => column.header)],
            body: rows.map((row) => columns.map((column) => column.getValue(row))),
        });

        doc.save(`${fileBaseName}.pdf`);
    }, [columns, fileBaseName, rows, title]);

    const handleDownload = useCallback((format: 'excel' | 'pdf') => {
        if (format === 'excel') {
            downloadExcel();
        } else {
            downloadPdf();
        }
        setOpen(false);
    }, [downloadExcel, downloadPdf]);

    return (
        <div className="dropdown">
            <CustomIconButton
                icon="download"
                size="small"
                aria-label={t('Download Report')}
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            />
            <ul className={`dropdown-menu dropdown-menu-end ${open ? 'show' : ''}`}>
                <li>
                    <button type="button" className="dropdown-item" onClick={() => handleDownload('excel')}>
                        {t('Download Excel')}
                    </button>
                </li>
                <li>
                    <button type="button" className="dropdown-item" onClick={() => handleDownload('pdf')}>
                        {t('Download PDF')}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default HistoryReportDownloadMenu;
