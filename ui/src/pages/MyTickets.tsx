import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TicketsList, { TicketsListFilterState, TicketsListSearchOverrides } from "../components/AllTickets/TicketsList";
import { getCurrentUserDetails } from "../config/config";
import { TicketRow } from "../components/AllTickets/TicketsTable";

const MyTickets: React.FC = () => {
    const navigate = useNavigate();

    const buildSearchOverrides = useCallback((_: TicketsListFilterState): TicketsListSearchOverrides => {
        const user = getCurrentUserDetails();
        const username = user?.username || user?.userId || "";
        const userId = user?.userId || "";

        return {
            requestorId: userId || undefined,
            createdBy: username || undefined,
        };
    }, []);

    const transformTickets = useCallback((items: TicketRow[]): TicketRow[] => {
        const roles = (getCurrentUserDetails()?.role || []).map(String);
        let filtered = items;

        if (roles.includes("4")) {
            filtered = filtered.filter((ticket) => ticket.statusId === "1" || ticket.statusId === "2");
        }

        if (roles.includes("9")) {
            filtered = filtered.filter((ticket) => ticket.statusId === "6");
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
