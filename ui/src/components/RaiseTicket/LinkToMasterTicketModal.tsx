import { Box, Modal, Tooltip, Pagination, Button } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomFieldset from "../CustomFieldset";
import { useDebounce } from "../../hooks/useDebounce";
import { getTicket, linkTicketToMaster, makeTicketMaster, searchTicketsPaginated } from "../../services/TicketService";
import { getCurrentUserDetails } from "../../config/config";
import GenericInput from "../UI/Input/GenericInput";

interface LinkToMasterTicketModalProps {
    open: boolean;
    onClose: () => void;
    setMasterId: (id: string) => void;
    subject: string;
    currentTicketId?: string; // Optional prop to pass current ticket ID
    masterId?: string;
    onLinkSuccess?: (masterId: string) => void;
    isCurrentTicketMaster?: boolean;
}

interface MasterTicket {
    id: string;
    subject?: string;
    isMaster?: boolean;
    masterId?: string;
}

const PAGE_SIZE = 20;

const LinkToMasterTicketModal: React.FC<LinkToMasterTicketModalProps> = ({
    open,
    onClose,
    subject,
    setMasterId,
    currentTicketId,
    masterId,
    onLinkSuccess,
    isCurrentTicketMaster = true,
}) => {
    const [query, setQuery] = useState('');
    const [paginatedTickets, setPaginatedTickets] = useState<MasterTicket[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isPaginatedLoading, setIsPaginatedLoading] = useState(false);
    const [paginatedError, setPaginatedError] = useState<string | null>(null);
    const [selected, setSelected] = useState<any | null>(null);
    const [linked, setLinked] = useState(false);
    const [conversionInProgress, setConversionInProgress] = useState(false);
    const [conversionError, setConversionError] = useState<string | null>(null);
    const [linkError, setLinkError] = useState<string | null>(null);
    const currentUser = getCurrentUserDetails();
    const currentUsername = currentUser?.username || '';

    // TODO: replace with real current ticket details
    const currentTicket = { id: currentTicketId ?? '', subject: subject };

    const debouncedQuery = useDebounce(query, 500);
    const activeQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const fetchPaginatedTickets = useCallback((pageIndex: number, searchQuery: string = '') => {
        setIsPaginatedLoading(true);
        setPaginatedError(null);
        searchTicketsPaginated(searchQuery, undefined, true, pageIndex, PAGE_SIZE)
            .then((response) => {
                const rawPayload = response?.data ?? response;
                const payload = rawPayload?.body?.data ?? rawPayload;
                const items = payload?.items ?? [];
                const tickets: MasterTicket[] = items.map((ticket: any) => ({
                    id: ticket.id,
                    subject: ticket.subject,
                    isMaster: ticket.isMaster,
                    masterId: ticket.masterId,
                }));
                setPaginatedTickets(tickets);
                setTotalPages(payload?.totalPages ?? 0);
                setPage(payload?.page ?? pageIndex);
            })
            .catch(() => {
                setPaginatedError('Failed to load tickets');
                setPaginatedTickets([]);
                setTotalPages(0);
            })
            .finally(() => {
                setIsPaginatedLoading(false);
            });
    }, []);

    const handleSelect = useCallback((id: string) => {
        getTicket(id).then(res => {
            const rawPayload = res?.data ?? res;
            const payload = rawPayload?.body?.data ?? rawPayload;
            setSelected(payload);
            setConversionError(null);
            setConversionInProgress(false);
            setQuery('');
            setLinkError(null);
        }).catch(() => {
            setSelected(null);
            setLinked(false);
            setLinkError(null);
        });
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelected(null);
            setLinked(false);
            setConversionError(null);
            setConversionInProgress(false);
            setPaginatedTickets([]);
            setPaginatedError(null);
            setTotalPages(0);
            setPage(0);
            fetchPaginatedTickets(0);
            if (masterId) {
                handleSelect(masterId);
                setLinked(true);
            }
            setLinkError(null);
        }
    }, [open, fetchPaginatedTickets, masterId, handleSelect]);

    useEffect(() => {
        if (!open) {
            return;
        }
        setPage(0);
        fetchPaginatedTickets(0, activeQuery);
    }, [activeQuery, fetchPaginatedTickets, open])


    const handleSearch = (e: any) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleToggleLink = async (_event: React.MouseEvent<HTMLElement>, shouldLink: boolean) => {
        if (!selected) {
            return;
        }

        if (shouldLink) {
            if (isCurrentTicketMaster && selected.isMaster) {
                setLinkError('Master Ticket cannot be linked to another Master Ticket');
                setLinked(false);
                return;
            }
            if (currentTicketId) {
                try {
                    await linkTicketToMaster(currentTicketId, selected.id, currentUsername || undefined);
                    setLinked(true);
                    setLinkError(null);
                    onLinkSuccess?.(selected.id);
                } catch {
                    setLinked(false);
                }
            } else {
                setMasterId(selected.id);
                setLinked(true);
                setLinkError(null);
            }
        } else if (!currentTicketId) {
            setMasterId('');
            setLinked(false);
            setLinkError(null);
        }
    };

    const handleMasterConversion = async (checked: boolean) => {
        if (!selected || !checked) {
            return;
        }
        setConversionInProgress(true);
        setConversionError(null);
        try {
            const response = await makeTicketMaster(selected.id);
            const rawPayload = response?.data ?? response;
            const payload = rawPayload?.body?.data ?? rawPayload;
            setSelected(payload);
        } catch (error: any) {
            const message = error?.response?.data?.body?.data?.message
                || error?.response?.data?.message
                || error?.message
                || 'Failed to mark ticket as master';
            setConversionError(message);
        } finally {
            setConversionInProgress(false);
        }
    };

    const ticketsToDisplay = paginatedTickets;

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        const nextPage = value - 1;
        setPage(nextPage);
        fetchPaginatedTickets(nextPage, activeQuery);
    };

    return (
        <Modal open={open} onClose={onClose} >
            <Box className="modal-box w-75 p-3" sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <h4 className="text-center mb-3">Link to Master Ticket</h4>
                <div className='d-flex flex-column flex-lg-row gap-3'>
                    <div className='flex-grow-1'>
                        <GenericInput
                            className="w-100 mb-2"
                            type="text"
                            placeholder="Search tickets by id or subject"
                            value={query}
                            onChange={handleSearch}
                        />
                        <div className='mt-2' style={{ maxHeight: '45vh', overflowY: 'auto' }}>
                            {isPaginatedLoading && (
                                <p className='text-muted mb-2'>Loading tickets...</p>
                            )}
                            {paginatedError && (
                                <p className='text-danger mb-2'>{paginatedError}</p>
                            )}
                            {!isPaginatedLoading && !paginatedError && ticketsToDisplay.length === 0 && (
                                <p className='text-muted mb-2'>No Master tickets available.</p>
                            )}
                            {ticketsToDisplay.map((ticket) => (
                                <div key={ticket.id}
                                    className='d-flex border rounded-2 px-2 py-1 my-1'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelect(ticket.id)}
                                >
                                    <strong className='mx-1'>{ticket.id}</strong> | {ticket.subject || 'No subject'}
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Box className='d-flex justify-content-center mt-2'>
                                <Pagination
                                    count={totalPages}
                                    page={page + 1}
                                    onChange={handlePageChange}
                                    color="primary"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </div>
                    {selected && (
                        <div className='d-flex flex-column align-items-stretch flex-lg-0 flex-grow-1 gap-3 mt-3 mt-lg-0'>
                            <CustomFieldset
                                title={`Master Ticket ${selected.id}`}
                                className='w-100'
                            >
                                <p>Subject: {selected.subject}</p>
                            </CustomFieldset>
                            {linkError && (
                                <p className="text-danger text-center m-0">{linkError}</p>
                            )}
                            <div className='d-flex justify-content-center'>
                                <Tooltip title={`Link ${currentTicket.id || 'this ticket'} to Master ${selected.id}`} placement="top">
                                    <ToggleButton
                                        value="link"
                                        selected={linked}
                                        onChange={handleToggleLink}
                                        disabled={!selected}
                                        color="primary"
                                    >
                                        {linked ? 'Linked' : 'Link'}
                                    </ToggleButton>
                                </Tooltip>
                            </div>
                            <CustomFieldset
                                title={`Current Ticket ${currentTicket.id || currentTicketId || ''}`}
                                className='w-100'
                            >
                                <p>Subject: {subject}</p>
                            </CustomFieldset>
                        </div>
                    )}
                </div>
                {selected && !selected.isMaster && !selected.masterId && (
                    <div className="form-check mt-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="mark-as-master"
                            disabled={conversionInProgress}
                            checked={selected.isMaster}
                            onChange={(event) => handleMasterConversion(event.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="mark-as-master">
                            This ticket is not a master. Do you want to create it as a master ticket?
                        </label>
                        {conversionError && <p className="text-danger mt-2">{conversionError}</p>}
                    </div>
                )}
                {linked && selected && (
                    <p className='text-success mt-2 text-center'>
                        {currentTicket.id
                            ? `Ticket ${currentTicket.id} has been linked to Master ticket ${selected.id}`
                            : `This ticket will be linked to Master ticket ${selected.id}`}
                    </p>
                )}
                <Box className='d-flex justify-content-end gap-2 mt-3'>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setMasterId('');
                            setLinked(false);
                            setSelected(null);
                            onClose();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (selected && linked && !currentTicketId) {
                                setMasterId(selected.id);
                            }
                            onClose();
                        }}
                        disabled={!linked || !selected}
                    >
                        Ok
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
export default LinkToMasterTicketModal;
