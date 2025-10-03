import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import TicketsList from "../components/AllTickets/TicketsList";

const AllTickets: React.FC = () => {
    const navigate = useNavigate();
    const [focusRecommendSeverityTicketId, setFocusRecommendSeverityTicketId] = useState<string | null>(null);

    const handleRecommendEscalation = useCallback((id: string) => {
        setFocusRecommendSeverityTicketId(id);
    }, []);

    const getViewTicketProps = useCallback((selectedTicketId: string | null) => ({
        focusRecommendSeverity: selectedTicketId !== null && selectedTicketId === focusRecommendSeverityTicketId,
        onRecommendSeverityFocusHandled: () => setFocusRecommendSeverityTicketId(null),
    }), [focusRecommendSeverityTicketId]);

    const handleTicketSelectChange = useCallback((ticketId: string | null) => {
        if (ticketId === null) {
            setFocusRecommendSeverityTicketId(null);
        }
    }, []);

    return (
        <TicketsList
            titleKey="All Tickets"
            permissionPathPrefix="allTickets"
            restrictStatusesToAllowed={false}
            onRowClick={(id) => navigate(`/tickets/${id}`)}
            tableOptions={{
                permissionPathPrefix: "allTickets",
                onRecommendEscalation: handleRecommendEscalation,
            }}
            getViewTicketProps={getViewTicketProps}
            onTicketSelectChange={handleTicketSelectChange}
        />
    );
};

export default AllTickets;
