import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import { Chip, ToggleButton, ToggleButtonGroup, Card, CardContent, Typography, TextField } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { getTickets } from "../services/TicketService";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";

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
    const { data, pending, error, apiHandler } = useApi<any>();
    const navigate = useNavigate();
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
        const f = data.filter((t: any) =>
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
                        {record.id}
                        {record.isMaster && <Chip label="M" size="small" color="primary" sx={{ mr: 0.5 }} />}
                    </>
                ),
            },
            {
                title: "Requestor Name",
                key: "name",
                render: (_: any, record: Ticket) => record.employee?.name || "-",
            },
            {
                title: "Email ID & Mobile No.",
                key: "contact",
                render: (_: any, record: Ticket) => (
                    <div>
                        <div>{record.employee?.emailId || "-"}</div>
                        <div>{record.employee?.mobileNo || "-"}</div>
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
                render: (value: any) => value || "-",
            },
            {
                title: "Action",
                key: "action",
                render: () => <VisibilityIcon fontSize="small" />,
            },
        ],
        []
    );

    return (
        <div className="container">
            <Title text="My Tickets" />
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
                    <ToggleButton value="grid">
                        <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="table">
                        <TableRowsIcon fontSize="small" />
                    </ToggleButton>
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
                    onRow={(record) => ({ onClick: () => navigate(`/tickets/${record.id}`) })}
                />
            )}
            {!pending && viewMode === "grid" && (
                <div className="row">
                    {filtered.map((t) => (
                        <div className="col-md-4 mb-3" key={t.id}>
                            <Card onClick={() => navigate(`/tickets/${t.id}`)} style={{cursor:'pointer'}}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {t.subject}{" "}
                                        {t.isMaster && <Chip label="M" size="small" color="primary" sx={{ ml: 0.5 }} />}
                                    </Typography>
                                    <Typography variant="body2">Id: {t.id}</Typography>
                                    <Typography variant="body2">Requestor: {t.employee?.name || "-"}</Typography>
                                    <Typography variant="body2">
                                        {t.employee?.emailId || "-"} / {t.employee?.mobileNo || "-"}
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
