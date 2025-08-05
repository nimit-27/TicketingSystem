import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { searchTicketsPaginated } from "../services/TicketService";
import { getStatuses } from "../utils/Utils";
import PaginationControls from "../components/PaginationControls";
import { IconButton, Chip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { useTranslation } from "react-i18next";
import TicketsTable from "../components/AllTickets/TicketsTable";
import TicketCard from "../components/AllTickets/TicketCard";
import { checkMyTicketsAccess } from "../utils/permissions";
import ViewToggle from "../components/UI/ViewToggle";
import GenericInput from "../components/UI/Input/GenericInput";
import DropdownController from "../components/UI/Dropdown/DropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import { Ticket } from "../types";


const getDropdownOptions = <T,>(arr: any, labelKey: keyof T, valueKey: keyof T): DropdownOption[] =>
    Array.isArray(arr)
        ? arr.map(item => ({
            label: String(item[labelKey]),
            value: item[valueKey]
        }))
        : [];

const AllTickets: React.FC = () => {
    const { data, pending, error, apiHandler: searchTicketsPaginatedApiHandler } = useApi<any>();
    const [statusList, setStatusList] = useState<any[]>([]);

    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");
    const [filtered, setFiltered] = useState<Ticket[]>([]);
    const [page, setPage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(5);
    const pageSize = viewMode === 'grid' ? 1 : tablePageSize;
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");
    const [masterOnly, setMasterOnly] = useState(false);
    const { t } = useTranslation();
    const showTable = checkMyTicketsAccess('table');

    const priorityConfig: Record<string, { color: string; count: number }> = {
        Low: { color: 'success.light', count: 1 },
        Medium: { color: 'warning.light', count: 2 },
        High: { color: 'error.main', count: 3 },
        Critical: { color: 'error.dark', count: 4 }
    };

    const statusFilterOptions: DropdownOption[] = useMemo(() => (
        [{ label: 'All', value: 'All' }, ...getDropdownOptions(statusList, 'statusName', 'statusId')]
    ), [statusList]);

    const debouncedSearch = useDebounce(search, 300);

    const searchTicketsPaginatedApi = (query: string, statusName?: string, master?: boolean, page: number = 0, size: number = 5) => {
        searchTicketsPaginatedApiHandler(() => searchTicketsPaginated(query, statusName, master, page, size));
    }

    const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);

    const searchCurrentTicketsPaginatedApi = useCallback(
        async (id: string) => {
            setRefreshingTicketId(id);
            await searchTicketsPaginatedApiHandler(() =>
                searchTicketsPaginated(debouncedSearch, statusFilter === 'All' ? undefined : statusFilter, masterOnly ? true : undefined, page - 1, pageSize)
            );
            setRefreshingTicketId(null);
        },
        [debouncedSearch, statusFilter, masterOnly, page, pageSize]
    );

    useEffect(() => {
        searchTicketsPaginatedApi(debouncedSearch, statusFilter === 'All' ? undefined : statusFilter, masterOnly ? true : undefined, page - 1, pageSize);
    }, [debouncedSearch, statusFilter, masterOnly, page, pageSize]);

    useEffect(() => {
        getStatuses().then(setStatusList);
    }, []);

    useEffect(() => {
        if (data) {
            const resp = data;
            setTotalPages(resp.totalPages || 1);
            setFiltered(resp.items || resp);
        }
    }, [data]);

    return (
        <div className="container">
            <Title textKey="My Tickets" />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <GenericInput
                    label="Search"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ mr: 2, width: 250 }}
                />
                <DropdownController
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusFilterOptions}
                    style={{ width: 180, marginRight: 8 }}
                />
                <Chip
                    label={t('Master')}
                    color={masterOnly ? 'primary' : 'default'}
                    variant={masterOnly ? 'filled' : 'outlined'}
                    onClick={() => setMasterOnly(prev => !prev)}
                    sx={{ mr: 1 }}
                />
                <ViewToggle
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                        { icon: 'grid', value: 'grid' },
                        { icon: 'table', value: 'table' }
                    ]}
                />
            </div>
            {pending && <p>{t('Loading...')}</p>}
            {error && <p className="text-danger">{t('Error loading tickets')}</p>}
            {viewMode === 'table' && showTable && (
                <div>
                    <TicketsTable tickets={filtered} onRowClick={(id: any) => navigate(`/tickets/${id}`)} searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi} refreshingTicketId={refreshingTicketId} />
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} />
                        <div className="d-flex align-items-center">
                            <IconButton size="small" onClick={() => setTablePageSize(ps => ps > 1 ? ps - 1 : 1)}>
                                <ArrowDropDownIcon />
                            </IconButton>
                            <GenericInput
                                type="number"
                                value={tablePageSize}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!isNaN(v) && v > 0) setTablePageSize(v);
                                }}
                                size="small"
                                sx={{ width: 60, mx: 1 }}
                            />
                            <span>/ page</span>
                            <IconButton size="small" onClick={() => setTablePageSize(ps => ps + 1)}>
                                <ArrowDropUpIcon />
                            </IconButton>
                        </div>
                    </div>
                </div>
            )}
            {viewMode === 'grid' && (
                <div className="grid-overlay-container">
                    {pending && <div className="grid-overlay" />}
                    <div className="row">
                        {filtered.map((t) => (
                            <div className="col-md-4 mb-3" key={t.id}>
                                <TicketCard ticket={t} priorityConfig={priorityConfig} onClick={() => navigate(`/tickets/${t.id}`)} />
                            </div>
                        ))}
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                        <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTickets;
