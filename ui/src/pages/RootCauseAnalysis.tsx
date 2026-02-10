import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import TicketsTable, { TicketRow } from '../components/AllTickets/TicketsTable';
import PaginationControls from '../components/PaginationControls';
import { useApi } from '../hooks/useApi';
import { TicketStatusWorkflow } from '../types';
import { getStatusWorkflowMappings } from '../services/StatusService';
import { getCurrentUserDetails } from '../config/config';
import { getRootCauseAnalysisTickets } from '../services/RootCauseAnalysisService';
import RootCauseAnalysisModal from '../components/TicketView/RootCauseAnalysisModal';
import DateRangeFilter, { getDateRangeApiParams } from '../components/Filters/DateRangeFilter';
import { DateRangeState } from '../utils/dateUtils';
import DropdownController from '../components/UI/Dropdown/DropdownController';
import { useCategoryFilters } from '../hooks/useCategoryFilters';

const formatSeverityText = (severity?: string, label?: string): string => {
  const source = (severity || label || '').trim();
  if (!source) {
    return '';
  }
  const normalized = source.toUpperCase();
  if (normalized.includes('CRITICAL') || normalized === 'S1') {
    return 'Critical';
  }
  if (normalized.includes('HIGH') || normalized === 'S2') {
    return 'High';
  }
  if (normalized.includes('MEDIUM') || normalized === 'S3') {
    return 'Medium';
  }
  return source;
};

const RootCauseAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { data, apiHandler } = useApi<any>();
  const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);
  const [statusWorkflows, setStatusWorkflows] = useState<Record<string, TicketStatusWorkflow[]>>({});
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedRcaStatus, setSelectedRcaStatus] = useState<string>('PENDING');
  const currentUser = getCurrentUserDetails();
  const currentUsername = currentUser?.username || currentUser?.userId || '';
  const currentRoles = useMemo(() => {
    const roles = currentUser?.role;
    const normalized = Array.isArray(roles) ? roles : roles ? [roles] : [];
    return normalized.filter((role): role is string => typeof role === 'string' && role.trim().length > 0);
  }, [JSON.stringify(currentUser?.role ?? [])]);
  const [dateRange, setDateRange] = useState<DateRangeState>({ preset: 'ALL' });
  const dateRangeParams = useMemo(() => getDateRangeApiParams(dateRange), [dateRange]);
  const { categoryOptions, subCategoryOptions, loadSubCategories } = useCategoryFilters();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

  const fetchTickets = useCallback(() => {
    if (!currentUsername) {
      return Promise.resolve();
    }
    const categoryId = selectedCategory !== 'All' ? selectedCategory : undefined;
    const subCategoryId = selectedSubCategory !== 'All' ? selectedSubCategory : undefined;
    return apiHandler(() =>
      getRootCauseAnalysisTickets(
        page - 1,
        pageSize,
        currentUsername,
        currentRoles,
        dateRangeParams.fromDate,
        dateRangeParams.toDate,
        categoryId,
        subCategoryId,
      ),
    );
  }, [apiHandler, currentRoles, currentUsername, page, pageSize, dateRangeParams.fromDate, dateRangeParams.toDate, selectedCategory, selectedSubCategory]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!workflowData) {
      return;
    }
    setStatusWorkflows(workflowData);
  }, [workflowData]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const resp: any = data;
    const items = Array.isArray(resp?.items) ? resp.items : resp?.items ?? resp;
    const normalized: TicketRow[] = Array.isArray(items) ? items : [];
    const enhanced = normalized.map((ticket) => ({
      ...ticket,
      severity: formatSeverityText(ticket.severity, ticket.severityLabel),
      severityLabel: ticket.severityLabel || ticket.severity,
    }));
    setTickets(enhanced);
    const computedTotal = resp?.totalPages ? Math.max(resp.totalPages, 1) : 1;
    setTotalPages(computedTotal);
    if (page > computedTotal) {
      setPage(computedTotal);
    }
  }, [data, page]);

  useEffect(() => {
    const roles = getCurrentUserDetails()?.role || [];
    workflowApiHandler(() => getStatusWorkflowMappings(roles));
  }, [workflowApiHandler]);

  const handleRefresh = useCallback(
    async (ticketId: string) => {
      setRefreshingTicketId(ticketId);
      await fetchTickets();
      setRefreshingTicketId(null);
    },
    [fetchTickets],
  );

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setSelectedSubCategory('All');
    const categoryId = value === 'All' ? undefined : value;
    loadSubCategories(categoryId);
    setPage(1);
  }, [loadSubCategories]);

  const handleSubCategoryChange = useCallback((value: string) => {
    setSelectedSubCategory(value);
    setPage(1);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      loadSubCategories(undefined);
    }
  }, [selectedCategory, loadSubCategories]);

  const handleOpenRcaModal = useCallback((ticketId: string, status?: TicketRow['rcaStatus']) => {
    setSelectedTicketId(ticketId);
    setSelectedRcaStatus(status ?? 'PENDING');
    setIsRcaModalOpen(true);
  }, []);

  const handleRcaModalClose = useCallback(() => {
    setIsRcaModalOpen(false);
    setSelectedTicketId(null);
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="">
      <Title textKey="Root Cause Analysis" />
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <DropdownController
          label="Module"
          value={selectedCategory}
          onChange={handleCategoryChange}
          options={categoryOptions}
          style={{ width: 200 }}
        />
        {selectedCategory !== 'All' && (
          <DropdownController
            label="Sub Module"
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
            options={subCategoryOptions}
            style={{ width: 220 }}
          />
        )}
      </div>
      <TicketsTable
        tickets={tickets}
        onIdClick={(id) => navigate(`/root-cause-analysis/${id}`)}
        onRowClick={(id) => navigate(`/root-cause-analysis/${id}`)}
        searchCurrentTicketsPaginatedApi={handleRefresh}
        refreshingTicketId={refreshingTicketId}
        statusWorkflows={statusWorkflows}
        showSeverityColumn
        onRcaClick={handleOpenRcaModal}
        permissionPathPrefix="rootCauseAnalysis"
      />
      <div className="d-flex justify-content-between align-items-center mt-3">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onChange={(_, value) => setPage(value)}
        />
      </div>
      {selectedTicketId && (
        <RootCauseAnalysisModal
          open={isRcaModalOpen}
          onClose={handleRcaModalClose}
          rcaStatus={selectedRcaStatus}
          ticketId={selectedTicketId}
          updatedBy={currentUsername}
        />
      )}
    </div>
  );
};

export default RootCauseAnalysis;
