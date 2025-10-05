import { Box, Modal, Tooltip, Pagination } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { useDebounce } from "../../hooks/useDebounce";
import { searchTickets, getTicket, linkTicketToMaster, makeTicketMaster, getTypesenseMasterTicketsPaginated } from "../../services/TicketService";
import GenericInput from "../UI/Input/GenericInput";

interface LinkToMasterTicketModalProps {
    open: boolean;
    onClose: () => void;
    setMasterId: any;

}

interface TicketHit {
    document: {
        subject: string;
        id: string;
    };
}

interface MasterTicket {
    id: string;
    subject?: string;
}

const PAGE_SIZE = 10;

const LinkToMasterTicketModal: React.FC<LinkToMasterTicketModalProps> = ({ open, onClose }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MasterTicket[]>([]);
    const [paginatedTickets, setPaginatedTickets] = useState<MasterTicket[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isPaginatedLoading, setIsPaginatedLoading] = useState(false);
    const [paginatedError, setPaginatedError] = useState<string | null>(null);
    const [selected, setSelected] = useState<any | null>(null);
    const [linked, setLinked] = useState(false);
    const [conversionInProgress, setConversionInProgress] = useState(false);
    const [conversionError, setConversionError] = useState<string | null>(null);
    // TODO: replace with real current ticket details
    const currentTicket = { id: '', subject: 'Current Ticket' };

    let debouncedQuery = useDebounce(query, 500);

    const fetchPaginatedTickets = useCallback((pageIndex: number) => {
        setIsPaginatedLoading(true);
        setPaginatedError(null);
        getTypesenseMasterTicketsPaginated(pageIndex, PAGE_SIZE)
            .then((response) => {
                const rawPayload = response?.data ?? response;
                const payload = rawPayload?.body?.data ?? rawPayload;
                const tickets: MasterTicket[] = (payload?.tickets ?? []).map((ticket: any) => ({
                    id: ticket.id,
                    subject: ticket.subject,
                }));
                setPaginatedTickets(tickets);
                setTotalPages(payload?.totalPages ?? 0);
                setPage(payload?.page ?? pageIndex);
            })
            .catch(() => {
                setPaginatedError('Failed to load master tickets');
                setPaginatedTickets([]);
                setTotalPages(0);
            })
            .finally(() => {
                setIsPaginatedLoading(false);
            });
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSearchResults([]);
            setSelected(null);
            setLinked(false);
            setConversionError(null);
            setConversionInProgress(false);
            setPaginatedTickets([]);
            setPaginatedError(null);
            setTotalPages(0);
            setPage(0);
            fetchPaginatedTickets(0);
        }
    }, [open, fetchPaginatedTickets]);

    useEffect(() => {
        if (!open) {
            return;
        }
        if (debouncedQuery.length >= 2) {
            searchTickets(debouncedQuery).then((response) => {
                const rawPayload = response?.data ?? response;
                const payload = rawPayload?.body?.data ?? rawPayload;
                const hits: TicketHit[] = payload?.hits || [];
                const mappedResults = hits.map((ticket) => ({
                    id: ticket.document.id,
                    subject: ticket.document.subject,
                }));
                setSearchResults(mappedResults);
            }).catch(() => {
                setSearchResults([]);
            });
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery, open])


    const handleSearch = (e: any) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleSelect = (id: string) => {
        getTicket(id).then(res => {
            const rawPayload = res?.data ?? res;
            const payload = rawPayload?.body?.data ?? rawPayload;
            setSelected(payload);
            setConversionError(null);
            setConversionInProgress(false);
            setQuery('');
            setSearchResults([]);
        });
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

    const isSearching = debouncedQuery.length >= 2;
    const ticketsToDisplay = isSearching ? searchResults : paginatedTickets;

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        const nextPage = value - 1;
        setPage(nextPage);
        fetchPaginatedTickets(nextPage);
    };

    return (
        <Modal open={open} onClose={onClose} >
            <Box className="modal-box w-75 p-3" sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <h4 className="text-center mb-3">Link to Master Ticket</h4>
                <GenericInput
                    className="w-100 mb-2"
                    type="text"
                    placeholder="Search tickets by id or subject"
                    value={query}
                    onChange={handleSearch}
                />
                <div className='mt-2' style={{ maxHeight: '45vh', overflowY: 'auto' }}>
                    {isSearching && query.length >= 2 && ticketsToDisplay.length === 0 && (
                        <p className='text-muted mb-2'>No tickets found for "{query}".</p>
                    )}
                    {!isSearching && isPaginatedLoading && (
                        <p className='text-muted mb-2'>Loading master tickets...</p>
                    )}
                    {!isSearching && paginatedError && (
                        <p className='text-danger mb-2'>{paginatedError}</p>
                    )}
                    {!isSearching && !isPaginatedLoading && !paginatedError && ticketsToDisplay.length === 0 && (
                        <p className='text-muted mb-2'>No master tickets available.</p>
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
                {!isSearching && totalPages > 1 && (
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
                {selected && (
                    <div className='position-relative mt-3 d-flex justify-content-between'>
                        <CustomFieldset
                            title={`Master Ticket ${selected.id}`}
                            className='flex-grow-1 me-2'
                            style={{ width: linked ? '48%' : '45%' }}
                        >
                            <p>Subject: {selected.subject}</p>
                        </CustomFieldset>
                        <div className='d-flex align-items-center justify-content-center position-absolute w-100' style={{ top: '35%' }}>
                            <Tooltip title={`Link ${currentTicket.id} to Master ${selected.id}`} placement="top">
                                <CustomIconButton
                                    icon="Link"
                                    color={linked ? 'success' : 'primary'}
                                    onClick={() => {
                                        linkTicketToMaster(currentTicket.id, selected.id).then(() => setLinked(true));
                                    }}
                                />
                            </Tooltip>
                        </div>
                        <CustomFieldset
                            title={`Current Ticket ${currentTicket.id}`}
                            className='flex-grow-1 ms-2'
                            style={{ width: linked ? '48%' : '45%' }}
                        >
                            <p>Subject: {currentTicket.subject}</p>
                        </CustomFieldset>
                    </div>
                )}
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
                {linked && (
                    <p className='text-success mt-2 text-center'>Ticket {currentTicket.id} has been linked to Master ticket {selected.id}</p>
                )}
            </Box>
        </Modal>
    )
}
export default LinkToMasterTicketModal;
