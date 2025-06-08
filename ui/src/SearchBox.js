// src/components/SearchBox.js
import React, { useEffect, useState } from 'react';
import typesenseClient from './typesenseClient';
import { searchTickets } from './services/TicketService';
import { useDebounce } from './hooks/useDebounce';

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

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

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);


        // Directly using Typesense client to search
        // try {
        //     const searchResults = await typesenseClient
        //         .collections('tickets')
        //         .documents()
        //         .search({
        //             q: value,
        //             query_by: 'subject'
        //         });

        //     setResults(searchResults.hits || []);
        // } catch (err) {
        //     console.error(err);
        // }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <input
                type="text"
                placeholder="Search tickets..."
                value={query}
                onChange={handleSearch}
                style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />
            {results.map((hit) => (
                <div key={hit.document.id} className='d-flex border rounded-2 px-2 py-1 my-1'>
                    <strong className='mx-1'>{hit.document.id}</strong> | {hit.document.subject}
                </div>
            ))}
        </div>
    );
};

export default SearchBox;
