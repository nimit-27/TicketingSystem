import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TicketsList, { TicketsListFilterState, TicketsListSearchOverrides } from "../components/AllTickets/TicketsList";
import { getCurrentUserDetails } from "../config/config";
import { TicketRow } from "../components/AllTickets/TicketsTable";

const MyWorkload: React.FC = () => {
    const navigate = useNavigate();

    const getRoleFlags = useCallback(() => {
        const userDetails = getCurrentUserDetails();
        const roles = (userDetails?.role || []).map(role => String(role).toUpperCase());

        const isTeamLeadRole = roles.some(role =>
            ["4", "TEAM_LEAD", "TL", "TEAMLEAD"].includes(role)
        );

        const isItManagerRole = roles.some(role =>
            ["9", "IT_MANAGER", "ITMANAGER"].includes(role)
        );

        const isHelpdeskAgent = roles.some(role =>
            ["3", "8"].includes(role)
        );
        return { isTeamLeadRole, isItManagerRole, isHelpdeskAgent };
    }, []);

    const buildSearchOverrides = useCallback(
        (_: TicketsListFilterState): TicketsListSearchOverrides => {
            const user = getCurrentUserDetails();
            const username = user?.username || user?.userId || "";
            const { isTeamLeadRole, isItManagerRole, isHelpdeskAgent } = getRoleFlags();

            if (isItManagerRole) {
                return { statusName: "AWAITING_ESCALATION_APPROVAL" };
            }

            if (isTeamLeadRole) {
                return { statusName: "OPEN" };
            }

            if (isHelpdeskAgent) {
                return { assignedTo: username };
            }

            return {};
        },
        [getRoleFlags]
    );

    const transformTickets = useCallback(
        (items: TicketRow[]): TicketRow[] => {
            const { isTeamLeadRole, isItManagerRole } = getRoleFlags();

            if (isItManagerRole) {
                const awaitingEscalationStatuses = new Set(["6", "AWAITING_ESCALATION_APPROVAL"]);
                return items.filter(ticket => {
                    const statusId = String(ticket.statusId ?? "");
                    const normalizedStatusId = statusId.toUpperCase();
                    return (
                        awaitingEscalationStatuses.has(statusId) ||
                        awaitingEscalationStatuses.has(normalizedStatusId)
                    );
                });
            }

            if (isTeamLeadRole) {
                const openStatuses = new Set(["1", "OPEN"]);
                return items.filter(ticket => {
                    const statusId = String(ticket.statusId ?? "");
                    const normalizedStatusId = statusId.toUpperCase();
                    return openStatuses.has(statusId) || openStatuses.has(normalizedStatusId);
                });
            }

            return items;
        },
        [getRoleFlags]
    );

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
