import { Box, Modal, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import GenericButton from "../UI/Button";
import LinkIcon from '@mui/icons-material/Link';
import CustomIconButton from "../UI/IconButton/CustomIconButton";
import CustomFieldset from "../CustomFieldset";
import { useDebounce } from "../../hooks/useDebounce";
import { searchTickets, getTicket, linkTicketToMaster, makeTicketMaster } from "../../services/TicketService";
import GenericInput from "../UI/Input/GenericInput";

interface LinkToMasterTicketModalProps {
    open: boolean;
    onClose: () => void;
}

interface TicketHit {
    document: {
        subject: string;
        id: string;
        // add other fields if needed
    };
}

const LinkToMasterTicketModal: React.FC<LinkToMasterTicketModalProps> = ({ open, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TicketHit[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [linked, setLinked] = useState(false);
    const [conversionInProgress, setConversionInProgress] = useState(false);
    const [conversionError, setConversionError] = useState<string | null>(null);
    // TODO: replace with real current ticket details
    const currentTicket = { id: '', subject: 'Current Ticket' };

    let debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setSelected(null);
            setLinked(false);
            setConversionError(null);
            setConversionInProgress(false);
        }
    }, [open]);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchTickets(debouncedQuery).then((response) => {
                const rawPayload = response?.data ?? response;
                const payload = rawPayload?.body?.data ?? rawPayload;
                setResults(payload?.hits || []);
            });
        } else {
            setResults([]);
        }
    }, [debouncedQuery])


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
            setResults([]);
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

    let masterTicketsList = results.map(ticket => ({
        label: ticket.document.subject,
        value: ticket.document.id
    }));

    return (
        <Modal open={open} onClose={onClose} >
            <Box className="modal-box w-75 p-3">
                <h4 className="text-center mb-3">Link to Master Ticket</h4>
                <GenericInput
                    className="w-100 mb-2"
                    type="text"
                    placeholder="Search tickets by id or subject"
                    value={query}
                    onChange={handleSearch}
                />
                {masterTicketsList.map((hit) => (
                    <div key={hit.value}
                        className='d-flex border rounded-2 px-2 py-1 my-1'
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelect(hit.value)}
                    >
                        <strong className='mx-1'>{hit.value}</strong> | {hit.label}
                    </div>
                ))}
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
