import { useCallback, useEffect, useMemo, useState } from "react";
import { TicketRow } from "../AllTickets/TicketsTable";
import { useApi } from "../../hooks/useApi";
import { getChildTickets, unlinkTicketFromMaster } from "../../services/TicketService";
import ChildTicketsTable from "../Ticket/ChildTicketsTable";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUserDetails } from "../../config/config";

interface ChildTicketsListProps {
    parentId: string;
}

const ChildTicketsList: React.FC<ChildTicketsListProps> = ({ parentId }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    // USEAPI INITIALIZATIONS
    const { data: childTicketsData, pending: childTicketsPending, success: childTicketsSuccess, apiHandler: getChildTicketsByMasterIdHandler } = useApi<any>();
    const { data: unlinkTicketFromMasterData, success: unlinkTicketFromMasterSuccess, apiHandler: unlinkTicketFromMasterHandler } = useApi<any>();

    console.log(childTicketsSuccess)
    // USESTATE INITIALIZATIONS
    const [unlinkingChildId, setUnlinkingChildId] = useState<string | null>(null);

    const currentUserDetails = useMemo(() => getCurrentUserDetails(), []);
    const currentUsername = currentUserDetails?.username || '';
    const currentUserId = currentUserDetails?.userId || '';

    const getChildTicketsByMasterId = (parentId: string) => {
        getChildTicketsByMasterIdHandler(() => getChildTickets(parentId))
    }

    const unlinkTicketFromMasterApi = (parentId: string, actor: string | undefined) => {
        unlinkTicketFromMasterHandler(() => unlinkTicketFromMaster(parentId, actor))
    }

    const handleViewChildTicket = useCallback((id: string) => {
        navigate(`/tickets/${id}`);
    }, [navigate]);

    const handleUnlinkChildTicket = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to unlink this ticket from the master ticket?')) return;

        setUnlinkingChildId(id);
        unlinkTicketFromMasterApi(id, currentUsername || undefined)
    }, [currentUsername]);

    useEffect(() => {
        getChildTicketsByMasterId(parentId)
    }, [parentId, unlinkTicketFromMasterSuccess])

    useEffect(() => {
        if (childTicketsSuccess) {
            console.log({ childTicketsData })
        }
    }, [childTicketsSuccess])

    return <>
        <ChildTicketsTable
            tickets={childTicketsData}
            loading={childTicketsPending}
            unlinkingId={unlinkingChildId}
            onView={handleViewChildTicket}
            onUnlink={handleUnlinkChildTicket}
        />
    </>
}

export default ChildTicketsList;