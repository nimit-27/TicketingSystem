import { Box, Input, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchBox from "../../SearchBox";
import GenericButton from "../UI/Button";
import GenericDropdown from "../UI/Dropdown/GenericDropdown";
import { useDebounce } from "../../hooks/useDebounce";
import { searchTickets } from "../../services/TicketService";
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
    const [query, setQuery] = useState('VPN');
    const [results, setResults] = useState<TicketHit[]>([]);

    let debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchTickets(debouncedQuery).then((response) => {
                console.log(response.data);
                setResults(response.data.hits || []);
            });
        } else {
            setResults([]);
        }
    }, [debouncedQuery])


    const handleSearch = async (e: any) => {
        const value = e.target.value;
        setQuery(value);
    };

    let masterTicketsList = results.map(ticket => ({
        label: ticket.document.subject,
        value: ticket.document.id
    }))

    return (
        <Modal open={open} onClose={onClose} >
            <Box className="modal-box w-65 p-3">
                <h4 className="text-center mb-3">Link to Master Ticket</h4>
                <GenericInput
                    className="w-100 mb-2"
                    type="text"
                    placeholder="Search tickets..."
                    value={query}
                    onChange={handleSearch} />
                {masterTicketsList.map((hit) => (
                    <div key={hit.value} className='d-flex border rounded-2 px-2 py-1 my-1'>
                        <strong className='mx-1'>{hit.value}</strong> | {hit.label}
                    </div>
                ))}
                {/* <Input
                    type="text"
                    placeholder="Search tickets..."
                    value={query}
                    onChange={handleSearch} />
                <SearchBox /> */}
                <GenericButton textKey="Link Ticket" variant="contained" />
            </Box>
        </Modal>
    )
}

export default LinkToMasterTicketModal;