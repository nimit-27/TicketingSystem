import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import TicketsTable, { TicketRow } from '../components/AllTickets/TicketsTable';
import PaginationControls from '../components/PaginationControls';
import { useApi } from '../hooks/useApi';
import { searchTicketsPaginated } from '../services/TicketService';
import { TicketStatusWorkflow } from '../types';
import { getStatusWorkflowMappings } from '../services/StatusService';
import { getCurrentUserDetails } from '../config/config';

const ALLOWED_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM'];

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

  const allowedSeveritySet = useMemo(() => new Set(ALLOWED_SEVERITIES), []);

  const fetchTickets = useCallback(() => {
    return apiHandler(() =>
      searchTicketsPaginated(
        '',
        'Closed',
        undefined,
        page - 1,
        pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Critical,High,Medium',
      ),
    );
  }, [apiHandler, page, pageSize]);

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
    const items = Array.isArray(resp.items) ? resp.items : resp.items ?? resp;
    const normalized: TicketRow[] = Array.isArray(items) ? items : [];
    const filtered = normalized.filter((ticket) =>
      allowedSeveritySet.has((ticket.severity || '').toUpperCase()),
    );
    setTickets(filtered);
    const computedTotal = resp.totalPages ? Math.max(resp.totalPages, 1) : 1;
    setTotalPages(computedTotal);
    if (page > computedTotal) {
      setPage(computedTotal);
    }
  }, [data, allowedSeveritySet, page]);

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
