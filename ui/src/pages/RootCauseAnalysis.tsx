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
  const [pageSize] = useState(10);
  const [refreshingTicketId, setRefreshingTicketId] = useState<string | null>(null);
  const [statusWorkflows, setStatusWorkflows] = useState<Record<string, TicketStatusWorkflow[]>>({});
  const currentUser = getCurrentUserDetails();
  const currentUsername = currentUser?.username || currentUser?.userId || '';
  const currentRoles = useMemo(() => {
    const roles = currentUser?.role;
    const normalized = Array.isArray(roles) ? roles : roles ? [roles] : [];
    return normalized.filter((role): role is string => typeof role === 'string' && role.trim().length > 0);
  }, [JSON.stringify(currentUser?.role ?? [])]);

  const fetchTickets = useCallback(() => {
    if (!currentUsername) {
      return Promise.resolve();
    }
    return apiHandler(() =>
      getRootCauseAnalysisTickets(page - 1, pageSize, currentUsername, currentRoles),
    );
  }, [apiHandler, currentRoles, currentUsername, page, pageSize]);

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

  return (
    <div className="container">
      <Title textKey="Root Cause Analysis" />
      <TicketsTable
        tickets={tickets}
        onIdClick={(id) => navigate(`/tickets/${id}`)}
        onRowClick={(id) => navigate(`/tickets/${id}`)}
        searchCurrentTicketsPaginatedApi={handleRefresh}
        refreshingTicketId={refreshingTicketId}
        statusWorkflows={statusWorkflows}
        showSeverityColumn
      />
      <div className="d-flex justify-content-between align-items-center mt-3">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onChange={(_, value) => setPage(value)}
        />
      </div>
    </div>
  );
};

export default RootCauseAnalysis;
