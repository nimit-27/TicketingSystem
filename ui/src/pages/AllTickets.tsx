import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import { Chip, ToggleButton, ToggleButtonGroup, Card, CardContent, Typography, TextField } from "@mui/material";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { getTickets } from "../services/TicketService";

interface Employee {
    name?: string;
    emailId?: string;
    mobileNo?: string;
}

interface Ticket {
    id: number;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    employee?: Employee;
    status?: string;
}

const AllTickets: React.FC = () => {
    const { data, pending, error, apiHandler } = useApi<Ticket[]>();
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");
    const [filtered, setFiltered] = useState<Ticket[]>([]);

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        apiHandler(() => getTickets());
    }, []);

    useEffect(() => {
        if (data) {
            setFiltered(data);
        }
    }, [data]);

    useEffect(() => {
        if (!data) return;
        const query = debouncedSearch.toLowerCase();
        const f = data.filter((t) =>
            t.subject.toLowerCase().includes(query) || String(t.id).includes(query)
        );
        setFiltered(f);
    }, [debouncedSearch, data]);

    const columns = useMemo(
        () => [
            {
                title: "Ticket Id",
                dataIndex: "id",
                key: "id",
                render: (_: any, record: Ticket) => (
                    <>
                        {record.isMaster && <Chip label="M" size="small" color="primary" sx={{ mr: 0.5 }} />}
                        {record.id}
                    </>
                ),
            },
            {
                title: "Requestor Name",
                key: "name",
                render: (_: any, record: Ticket) => record.employee?.name || "N/A",
            },
            {
                title: "Email ID & Mobile No.",
                key: "contact",
                render: (_: any, record: Ticket) => (
                    <div>
                        <div>{record.employee?.emailId || "N/A"}</div>
                        <div>{record.employee?.mobileNo || "N/A"}</div>
                    </div>
                ),
            },
            {
                title: "Category",
                dataIndex: "category",
                key: "category",
            },
            {
                title: "Sub-Category",
                dataIndex: "subCategory",
                key: "subCategory",
            },
            {
                title: "Priority",
                dataIndex: "priority",
                key: "priority",
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value: any) => value || "N/A",
            },
            {
                title: "Action",
                key: "action",
                render: () => <a href="#">View</a>,
            },
        ],
        []
    );

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <TextField
                    label="Search by Id or Subject"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, val) => val && setViewMode(val)}
                    size="small"
                >
                    <ToggleButton value="grid">Grid</ToggleButton>
                    <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
            </div>
            {pending && <p>Loading...</p>}
            {error && <p className="text-danger">Error loading tickets</p>}
            {!pending && viewMode === "table" && (
                <Table
                    dataSource={filtered}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            )}
            {!pending && viewMode === "grid" && (
                <div className="row">
                    {filtered.map((t) => (
                        <div className="col-md-4 mb-3" key={t.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {t.subject}{" "}
                                        {t.isMaster && <Chip label="M" size="small" color="primary" sx={{ ml: 0.5 }} />}
                                    </Typography>
                                    <Typography variant="body2">Id: {t.id}</Typography>
                                    <Typography variant="body2">Requestor: {t.employee?.name || "N/A"}</Typography>
                                    <Typography variant="body2">
                                        {t.employee?.emailId || "N/A"} / {t.employee?.mobileNo || "N/A"}
                                    </Typography>
                                    <Typography variant="body2">Category: {t.category}</Typography>
                                    <Typography variant="body2">Sub-Category: {t.subCategory}</Typography>
                                    <Typography variant="body2">Priority: {t.priority}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllTickets;
