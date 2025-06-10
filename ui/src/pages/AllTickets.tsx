import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import { Avatar, Box, Tooltip, ToggleButton, ToggleButtonGroup, Card, CardContent, Typography, TextField, MenuItem } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useApi } from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import { getTickets } from "../services/TicketService";
import PaginationControls from "../components/PaginationControls";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import MasterIcon from "../components/UI/Icons/MasterIcon";

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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const priorityConfig: Record<string, { color: string; count: number }> = {
        Low: { color: 'success.light', count: 1 },
        Medium: { color: 'warning.light', count: 2 },
        High: { color: 'error.main', count: 3 },
        Critical: { color: 'error.dark', count: 4 }
    };

    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        apiHandler(() => getTickets(page - 1, 5));
    }, [page]);

    useEffect(() => {
        if (data) {
            const resp = data;
            setTotalPages(resp.totalPages || 1);
            setFiltered(resp.items || resp);
        }
    }, [data]);

    useEffect(() => {
        if (!data) return;
        const resp = data;
        let list: Ticket[] = resp.items || resp;
        if (statusFilter !== 'ALL') {
            list = list.filter(t => t.status === statusFilter);
        }
        const query = debouncedSearch.toLowerCase();
        const f = list.filter((t: any) =>
            t.subject.toLowerCase().includes(query) || String(t.id).includes(query)
        );
        setFiltered(f);
    }, [debouncedSearch, data, statusFilter]);

    const columns = useMemo(
        () => [
            {
                title: "Ticket Id",
                dataIndex: "id",
                key: "id",
                render: (_: any, record: Ticket) => (
                    <div className="d-flex align-items-center">
                        {record.id}
                        {record.isMaster && <MasterIcon />}
                    </div>
                ),
            },
            {
                title: "Requestor Name",
                key: "name",
                render: (_: any, record: Ticket) => record.employee?.name || "-",
            },
            {
                title: "Email",
                key: "email",
                render: (_: any, record: Ticket) => record.employee?.emailId || "-",
            },
            {
                title: "Mobile",
                key: "mobile",
                render: (_: any, record: Ticket) => record.employee?.mobileNo || "-",
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
                render: () => <VisibilityIcon fontSize="small" sx={{ color: 'grey.600', cursor: 'pointer' }} />,
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
                    sx={{ mr: 2 }}
                />
                <TextField
                    select
                    label="Status"
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ width: 150, mr: 2 }}
                >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="ON_HOLD">On Hold</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                    <MenuItem value="REOPENED">Reopened</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="ASSIGN_FURTHER">Assign Further</MenuItem>
                </TextField>
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
                <div>
                    <Table
                        dataSource={filtered}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        onRow={(record) => ({ onClick: () => navigate(`/tickets/${record.id}`) })}
                    />
                    <PaginationControls page={page} totalPages={totalPages} onChange={(_, val) => setPage(val)} className="mt-3" />
                </div>
            )}
            {!pending && viewMode === "grid" && (
                <div className="row">
                    {filtered.map((t) => {
                        const p = priorityConfig[t.priority as keyof typeof priorityConfig] || { color: 'grey.400', count: 1 };
                        return (
                            <div className="col-md-4 mb-3" key={t.id}>
                                <Card
                                    onClick={() => navigate(`/tickets/${t.id}`)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: (theme: any) => `${theme.palette[p.color.split('.')[0]]?.[p.color.split('.')[1]]}40`,
                                        boxShadow: 'none',
                                        height: '100%',
                                        position: 'relative',
                                        transition: 'background-color 0.2s, transform 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                            transform: 'scale(1.02)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ pb: 4 }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{
                                                maxWidth: 200,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={t.subject}>{t.subject}</span>
                                            {t.isMaster && <MasterIcon />}
                                        </Typography>
                                        <Typography variant="body2">Id: {t.id}</Typography>
                                        <Typography variant="body2">Requestor: {t.employee?.name || "-"}</Typography>
                                        <Typography variant="body2">Category: {t.category}</Typography>
                                        <Typography variant="body2">Sub-Category: {t.subCategory}</Typography>
                                    </CardContent>
                                    <Box sx={{ position: 'absolute', bottom: 4, right: 4, color: p.color }}>
                                        <Tooltip title={t.priority}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: 24,
                                                    height: 24 + (p.count - 1) * 10, // adjust height based on count
                                                }}
                                            >
                                                {Array.from({ length: p.count }).map((_, i) => (
                                                    <KeyboardArrowUpIcon
                                                        key={i}
                                                        fontSize="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: `${i * 10}px`, // adjust spacing between arrows
                                                            zIndex: p.count - i,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllTickets;
