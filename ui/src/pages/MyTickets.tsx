import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TicketsList, { TicketsListFilterState, TicketsListSearchOverrides } from "../components/AllTickets/TicketsList";
import { getCurrentUserDetails } from "../config/config";
import { TicketRow } from "../components/AllTickets/TicketsTable";

const MyTickets: React.FC = () => {
    const navigate = useNavigate();

    const buildSearchOverrides = useCallback((filters: TicketsListFilterState): TicketsListSearchOverrides => {
        const user = getCurrentUserDetails();
        const roles = (user?.role || []).map(String);
        const username = user?.username || user?.userId || "";
        const userId = user?.userId || "";
        const isRequestor = roles.includes("5");

        const shouldForceAllStatus = isRequestor && filters.statusFilter === "All";

        return {
            ...(isRequestor ? { requestorId: userId || undefined } : {}),
            ...(shouldForceAllStatus ? { statusName: "All" } : {}),
            createdBy: username || undefined,
        };
    }, []);

    const transformTickets = useCallback((items: TicketRow[]): TicketRow[] => {
        const user = getCurrentUserDetails();
        const roles = (user?.role || []).map(String);
        const username = user?.username || user?.userId || "";
        const userId = user?.userId || "";
        const isRequestor = roles.includes("5");
        let filtered = items;

        if (roles.includes("4")) {
            filtered = filtered.filter((ticket) => ticket.statusId === "1" || ticket.statusId === "2");
        }

        if (roles.includes("9")) {
            filtered = filtered.filter((ticket) => ticket.statusId === "6");
        }

        if (isRequestor) {
            const relatedTickets = items.filter((ticket) => {
                const ticketRequestorId = (ticket as TicketRow & { requestorId?: string }).requestorId;
                const ticketCreatedBy = (ticket as TicketRow & { createdBy?: string }).createdBy;

                const isCreatedByUser = Boolean(username && ticketCreatedBy && ticketCreatedBy === username);
                const isRequestedByUser = Boolean(userId && ticketRequestorId && ticketRequestorId === userId);

                return isCreatedByUser || isRequestedByUser;
            });

            if (relatedTickets.length > 0) {
                const filteredIds = new Set(filtered.map((ticket) => ticket.id));
                relatedTickets.forEach((ticket) => {
                    if (ticket.id && !filteredIds.has(ticket.id)) {
                        filtered = [...filtered, ticket];
                        filteredIds.add(ticket.id);
                    }
                });
            }
        }

        return filtered;
    }, []);

    return (
        <TicketsList
            titleKey="My Tickets"
            permissionPathPrefix="myTickets"
            buildSearchOverrides={buildSearchOverrides}
            transformTickets={transformTickets}
            onRowClick={(id) => navigate(`/tickets/${id}`)}
        />
    );
};

export default MyTickets;
