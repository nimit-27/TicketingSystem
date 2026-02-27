import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemIcon,
    Menu,
    MenuItem,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useTranslation } from 'react-i18next';
import { DropdownOption } from '../UI/Dropdown/GenericDropdown';
import { getDistricts, getRegions } from '../../services/LocationService';
import { useApi } from '../../hooks/useApi';
import { getDropdownOptionsWithExtraOption } from '../../utils/Utils';
import { searchTicketsPaginated } from '../../services/TicketService';
import { useCategoryFilters } from '../../hooks/useCategoryFilters';
import DownloadFiltersScreen from './DownloadFiltersScreen';
import DownloadColumnsScreen, { DownloadReportColumn } from './DownloadColumnsScreen';

interface DownloadFilters {
    fromDate: string;
    toDate: string;
    zoneCode?: string;
    zoneLabel?: string;
    regionCode?: string;
    regionLabel?: string;
    districtCode?: string;
    districtLabel?: string;
    issueTypeId?: string;
    issueTypeLabel?: string;
    categoryId?: string;
    categoryLabel?: string;
    subCategoryId?: string;
    subCategoryLabel?: string;
    assignedTo?: string;
    assignedToLabel?: string;
    statusId?: string;
    statusLabel?: string;
    selectedColumnKeys?: string[];
}

interface DownloadDialogInitialFilters {
    category: string;
    subCategory: string;
    zone: string;
    region: string;
    district: string;
    issueType: string;
    assignee: string;
    status: string;
}

interface DownloadTicketsDialogProps {
    open: boolean;
    loading?: boolean;
    generationState?: 'idle' | 'generating' | 'error';
    zoneOptions: DropdownOption[];
    issueTypeOptions: DropdownOption[];
    statusOptions: DropdownOption[];
    initialFilters: DownloadDialogInitialFilters;
    exportableColumns: DownloadReportColumn[];
    onClose: () => void;
    onGenerate: (format: 'pdf' | 'excel', filters: DownloadFilters) => Promise<void> | void;
    onCancelExport?: () => void;
    onRetryExport?: () => void;
}

const formatInputDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateRangeForSelection = (year: number, month?: number) => {
    if (month) {
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 0);
        return { from: formatInputDate(from), to: formatInputDate(to) };
    }

    const from = new Date(year, 0, 1);
    const to = new Date(year, 12, 0);
    return { from: formatInputDate(from), to: formatInputDate(to) };
};

const allOptionObject: DropdownOption = { label: 'All', value: 'All' }
const getDateRangeDays = (from: string, to: string): number | null => {
    if (!from || !to) return null;
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffInMs = end.getTime() - start.getTime();
    if (diffInMs < 0) return null;
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
};

const DownloadTicketsDialog: React.FC<DownloadTicketsDialogProps> = ({
    open,
    loading = false,
    generationState = 'idle',
    zoneOptions,
    issueTypeOptions,
    statusOptions,
    initialFilters,
    exportableColumns,
    onClose,
    onGenerate,
    onCancelExport,
    onRetryExport,
}) => {
    const { t } = useTranslation();
    const { categoryOptions, subCategoryOptions, loadSubCategories, resetSubCategories } = useCategoryFilters();

    const today = useMemo(() => new Date(), []);
    const [year, setYear] = useState<number | ''>(today.getFullYear());
    const [month, setMonth] = useState<number | ''>(today.getMonth() + 1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [zone, setZone] = useState<string>('All');
    const [category, setCategory] = useState<string>('All');
    const [subCategory, setSubCategory] = useState<string>('All');
    const [region, setRegion] = useState<string>('All');
    const [district, setDistrict] = useState<string>('All');
    const [issueType, setIssueType] = useState<string>('All');
    const [assignee, setAssignee] = useState<string>('All');
    const [status, setStatus] = useState<string>('All');
    const [regionOptions, setRegionOptions] = useState<Array<DropdownOption & { hrmsRegCode?: string }>>([{ label: 'All', value: 'All' }]);
    const [districtOptions, setDistrictOptions] = useState<DropdownOption[]>([{ label: 'All', value: 'All' }]);
    const [regionHrmsCode, setRegionHrmsCode] = useState<string>('All');
    const [generateMenuAnchor, setGenerateMenuAnchor] = useState<null | HTMLElement>(null);
    const [activeScreen, setActiveScreen] = useState<'filters' | 'columns'>('filters');
    const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
    const [estimateLoading, setEstimateLoading] = useState(false);


    const { data: getRegionsApiData, pending: getRegionsApiPending, success: getRegionsApiSuccess, apiHandler: getRegionsApiHandler } = useApi()
    const { data: getDistrictsApiData, pending: getDistrictsApiPending, success: getDistrictsApiSuccess, apiHandler: getDistrictsApiHandler } = useApi()
    const { apiHandler: estimateCountApiHandler, pending: estimateCountPending } = useApi<any>()

    const getRegionsHandler = async (zone: any) => {
        return await getRegionsApiHandler(() => getRegions(zone))
    }

    const getDistrictsHandler = async (regionHrmsCode: any) => {
        return await getDistrictsApiHandler(() => getDistricts(regionHrmsCode))
    }

    // Setting Region dropdown options post getRegions API success
    useEffect(() => {
        if (getRegionsApiSuccess && !getRegionsApiPending) {
            const nextRegionOptions = getDropdownOptionsWithExtraOption(getRegionsApiData, "regionName", "regionCode", allOptionObject)
            setRegionOptions(nextRegionOptions);
            const shouldRetainRegion = nextRegionOptions.some((option) => option.value === region);
            const nextRegion = shouldRetainRegion ? region : 'All';
            setRegion(nextRegion);
            const selectedRegionOption = nextRegionOptions.find((option) => option.value === nextRegion);
            setRegionHrmsCode(`${selectedRegionOption?.value}11` || 'All');
        }

    }, [getRegionsApiSuccess, getRegionsApiPending])

    // Setting District dropdown options post getDistricts API success
    useEffect(() => {
        if (getDistrictsApiSuccess && !getDistrictsApiPending) {
            const nextDistrictOptions = getDropdownOptionsWithExtraOption(getDistrictsApiData, 'districtName', 'districtCode', allOptionObject)
            setDistrictOptions(nextDistrictOptions);
            const shouldRetainDistrict = nextDistrictOptions.some((option) => option.value === district);
            setDistrict(shouldRetainDistrict ? district : 'All');
        }
    }, [getDistrictsApiSuccess, getDistrictsApiPending])

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear() + 1;
        return Array.from({ length: 12 }, (_, index) => currentYear - index);
    }, []);

    const monthOptions = useMemo(
        () => ([
            { value: 1, label: t('January') },
            { value: 2, label: t('February') },
            { value: 3, label: t('March') },
            { value: 4, label: t('April') },
            { value: 5, label: t('May') },
            { value: 6, label: t('June') },
            { value: 7, label: t('July') },
            { value: 8, label: t('August') },
            { value: 9, label: t('September') },
            { value: 10, label: t('October') },
            { value: 11, label: t('November') },
            { value: 12, label: t('December') },
        ]),
        [t],
    );

    useEffect(() => {
        if (!year) {
            setFromDate('');
            setToDate('');
            return;
        }

        const range = getDateRangeForSelection(year, month || undefined);
        setFromDate(range.from);
        setToDate(range.to);
    }, [year, month]);


    useEffect(() => {
        if (!open) return;

        // Option 1 behavior:
        // initialize modal values from page filters once when dialog opens,
        // then keep modal state independent from the page while it is open.
        const initialCategory = initialFilters.category || 'All';
        const initialSubCategory = initialFilters.subCategory || 'All';
        setZone(initialFilters.zone || 'All');
        setCategory(initialCategory);
        setSubCategory(initialSubCategory);
        setRegion(initialFilters.region || 'All');
        setDistrict(initialFilters.district || 'All');
        setIssueType(initialFilters.issueType || 'All');
        setAssignee(initialFilters.assignee || 'All');
        setStatus(initialFilters.status || 'All');
        setRegionOptions([{ label: 'All', value: 'All' }]);
        setDistrictOptions([{ label: 'All', value: 'All' }]);
        setRegionHrmsCode('All');
        setActiveScreen('filters');
        setSelectedColumnKeys(exportableColumns.map((column) => column.key));
        setShowPreview(false);
        setGenerateMenuAnchor(null);
    }, [exportableColumns, initialFilters, open]);

    useEffect(() => {
        if (!open) return;

        if (category === 'All') {
            setSubCategory('All');
            resetSubCategories();
            return;
        }

        loadSubCategories(category);
    }, [open, category, loadSubCategories, resetSubCategories]);


    useEffect(() => {
        if (!open) return;
        if (category === 'All') {
            setSubCategory('All');
            return;
        }

        const shouldRetainSubCategory = subCategoryOptions.some((option) => option.value === subCategory);
        if (!shouldRetainSubCategory) {
            setSubCategory('All');
        }
    }, [open, category, subCategory, subCategoryOptions]);

    useEffect(() => {
        if (!open) return;

        if (zone === 'All') {
            setRegion('All');
            setRegionHrmsCode('All');
            setDistrict('All');
            setRegionOptions([{ label: 'All', value: 'All' }]);
            setDistrictOptions([{ label: 'All', value: 'All' }]);
            return;
        }
        // Region list in modal is always loaded from modal's zone selection.
        getRegionsHandler(zone)
    }, [open, region, zone]);

    useEffect(() => {
        if (!open) return;

        if (regionHrmsCode === 'All') {
            setDistrict('All');
            setDistrictOptions([{ label: 'All', value: 'All' }]);
            return;
        }

        // District list in modal is always loaded from modal's region selection.
        getDistrictsHandler(regionHrmsCode)
    }, [district, open, regionHrmsCode]);

    const handleRegionChange = (nextRegion: string) => {
        setRegion(nextRegion);
        setRegionHrmsCode(nextRegion !== 'All' ? `${nextRegion}11` : 'All');
        setDistrict('All');
    };

    const applyPresetRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setFromDate(formatInputDate(start));
        setToDate(formatInputDate(end));
    };

    const handleGenerateSelection = async (format: 'pdf' | 'excel') => {
        const selectedZone = zoneOptions.find((option) => option.value === zone);
        const selectedCategory = categoryOptions.find((option) => option.value === category);
        const selectedSubCategory = subCategoryOptions.find((option) => option.value === subCategory);
        const selectedRegion = regionOptions.find((option) => option.value === region);
        const selectedDistrict = districtOptions.find((option) => option.value === district);
        const selectedIssueType = issueTypeOptions.find((option) => option.value === issueType);
        const selectedStatus = statusOptions.find((option) => option.value === status);
        await onGenerate(format, {
            fromDate,
            toDate,
            zoneCode: zone !== 'All' ? zone : undefined,
            zoneLabel: zone !== 'All' ? selectedZone?.label || zone : undefined,
            categoryId: category !== 'All' ? category : undefined,
            categoryLabel: category !== 'All' ? selectedCategory?.label || category : undefined,
            subCategoryId: subCategory !== 'All' ? subCategory : undefined,
            subCategoryLabel: subCategory !== 'All' ? selectedSubCategory?.label || subCategory : undefined,
            regionCode: region !== 'All' ? region : undefined,
            regionLabel: region !== 'All' ? selectedRegion?.label || region : undefined,
            districtCode: district !== 'All' ? district : undefined,
            districtLabel: district !== 'All' ? selectedDistrict?.label || district : undefined,
            issueTypeId: issueType !== 'All' ? issueType : undefined,
            issueTypeLabel: issueType !== 'All' ? selectedIssueType?.label || issueType : undefined,
            assignedTo: assignee !== 'All' ? assignee : undefined,
            assignedToLabel: assignee !== 'All' ? assignee : undefined,
            statusId: status !== 'All' ? status : undefined,
            statusLabel: status !== 'All' ? selectedStatus?.label || status : undefined,
            selectedColumnKeys,
        });
        setGenerateMenuAnchor(null);
    };

    const handleColumnToggle = (columnKey: string) => {
        setSelectedColumnKeys((previous) => (
            previous.includes(columnKey)
                ? previous.filter((item) => item !== columnKey)
                : [...previous, columnKey]
        ));
        setShowPreview(true);
    };

    const handleSelectAllColumns = () => {
        setSelectedColumnKeys(exportableColumns.map((column) => column.key));
        setShowPreview(true);
    };

    const selectedRangeDays = useMemo(() => getDateRangeDays(fromDate, toDate), [fromDate, toDate]);
    const isRangeInvalid = selectedRangeDays === null;

    useEffect(() => {
        if (!open || !fromDate || !toDate || isRangeInvalid) {
            setEstimatedCount(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setEstimateLoading(true);
                const response = await estimateCountApiHandler(() => searchTicketsPaginated(
                    '',
                    status !== 'All' ? status : undefined,
                    undefined,
                    0,
                    1,
                    assignee !== 'All' ? assignee : undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    fromDate,
                    toDate,
                    category !== 'All' ? category : undefined,
                    subCategory !== 'All' ? subCategory : undefined,
                    zone !== 'All' ? zone : undefined,
                    region !== 'All' ? region : undefined,
                    district !== 'All' ? district : undefined,
                    issueType !== 'All' ? issueType : undefined,
                ));
                setEstimatedCount(response?.totalElements ?? null);
            } catch (_) {
                setEstimatedCount(null);
            } finally {
                setEstimateLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [open, fromDate, toDate, zone, region, district, issueType, assignee, status, category, subCategory, isRangeInvalid, estimateCountApiHandler]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>{t('Download Tickets')}</DialogTitle>
                <DialogContent>
                    {activeScreen === 'filters' ? (
                        <DownloadFiltersScreen
                            year={year}
                            month={month}
                            fromDate={fromDate}
                            toDate={toDate}
                            category={category}
                            subCategory={subCategory}
                            zone={zone}
                            region={region}
                            district={district}
                            issueType={issueType}
                            assignee={assignee}
                            status={status}
                            yearOptions={yearOptions}
                            monthOptions={monthOptions}
                            categoryOptions={categoryOptions}
                            subCategoryOptions={subCategoryOptions}
                            zoneOptions={zoneOptions}
                            regionOptions={regionOptions}
                            districtOptions={districtOptions}
                            issueTypeOptions={issueTypeOptions}
                            statusOptions={statusOptions}
                            generationState={generationState}
                            estimateLoading={estimateLoading}
                            estimateCountPending={estimateCountPending}
                            estimatedCount={estimatedCount}
                            selectedRangeDays={selectedRangeDays}
                            isRangeInvalid={isRangeInvalid}
                            onCancelExport={onCancelExport}
                            onRetryExport={onRetryExport}
                            onYearChange={setYear}
                            onMonthChange={setMonth}
                            onCategoryChange={(selectedCategory) => {
                                setCategory(selectedCategory);
                                if (selectedCategory === 'All') {
                                    setSubCategory('All');
                                } else if (!subCategoryOptions.some((option) => option.value === subCategory)) {
                                    setSubCategory('All');
                                }
                            }}
                            onSubCategoryChange={setSubCategory}
                            onZoneChange={setZone}
                            onRegionChange={handleRegionChange}
                            onDistrictChange={setDistrict}
                            onIssueTypeChange={setIssueType}
                            onAssigneeChange={setAssignee}
                            onStatusChange={setStatus}
                            onFromDateChange={setFromDate}
                            onToDateChange={setToDate}
                            onApplyPresetRange={applyPresetRange}
                            onOpenColumns={() => setActiveScreen('columns')}
                        />
                    ) : (
                        <DownloadColumnsScreen
                            columns={exportableColumns}
                            selectedColumnKeys={selectedColumnKeys}
                            showPreview={showPreview}
                            onBack={() => setActiveScreen('filters')}
                            onToggleColumn={handleColumnToggle}
                            onSelectAll={handleSelectAllColumns}
                            onPreview={() => setShowPreview(true)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t('Cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={(event) => setGenerateMenuAnchor(event.currentTarget)}
                        disabled={loading || !selectedColumnKeys.length}
                        startIcon={<DownloadIcon fontSize="small" />}
                    >
                        {t('Generate')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu anchorEl={generateMenuAnchor} open={Boolean(generateMenuAnchor)} onClose={() => setGenerateMenuAnchor(null)}>
                <MenuItem onClick={() => handleGenerateSelection('pdf')}>
                    <ListItemIcon>
                        <PictureAsPdfIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As PDF')}
                </MenuItem>
                <MenuItem onClick={() => handleGenerateSelection('excel')}>
                    <ListItemIcon>
                        <GridOnIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As Excel')}
                </MenuItem>
            </Menu>
        </>
    );
};

export type { DownloadFilters, DownloadDialogInitialFilters };
export default DownloadTicketsDialog;
