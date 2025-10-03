import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TicketsList, { TicketsListFilterState, TicketsListSearchOverrides } from "../components/AllTickets/TicketsList";
import { getCurrentUserDetails } from "../config/config";
import { TicketRow } from "../components/AllTickets/TicketsTable";

const MyWorkload: React.FC = () => {
    const navigate = useNavigate();

    const buildSearchOverrides = useCallback((_: TicketsListFilterState): TicketsListSearchOverrides => {
        const user = getCurrentUserDetails();
        const username = user?.username || user?.userId || "";

        return {
            assignedTo: username || undefined,
        };
    }, []);

    const transformTickets = useCallback((items: TicketRow[]): TicketRow[] => {
        const roles = (getCurrentUserDetails()?.role || []).map(String);
        let filtered = items;

        if (roles.some(role => role === "4" || role === "TEAM_LEAD")) {
            const teamLeadStatuses = new Set(["1", "2", "OPEN", "ASSIGNED"]);
            filtered = filtered.filter(ticket => teamLeadStatuses.has(String(ticket.statusId ?? "")));
        }

        if (roles.includes("9")) {
            const escalatedStatuses = new Set(["6", "ESCALATED"]);
            filtered = filtered.filter(ticket => escalatedStatuses.has(String(ticket.statusId ?? "")));
        }

        return filtered;
    }, []);

    return (
        <TicketsList
            titleKey="My Workload"
            permissionPathPrefix="myWorkload"
            buildSearchOverrides={buildSearchOverrides}
            transformTickets={transformTickets}
            onRowClick={(id) => navigate(`/tickets/${id}`)}
            tableOptions={{ permissionPathPrefix: "myWorkload" }}
        />
    );
};

export default MyWorkload;
