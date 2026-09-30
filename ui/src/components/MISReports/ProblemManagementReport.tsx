import React, { useEffect } from "react";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomFieldset from "../CustomFieldset";
import { useApi } from "../../hooks/useApi";
import { fetchProblemManagementReport } from "../../services/ReportService";
import { MISReportRequestParams, ProblemManagementReportProps, SupportDashboardTimeScale } from "../../types/reports";
import SectionReportDownload from "./SectionReportDownload";

interface Props {
    params?: MISReportRequestParams;
    interval?: SupportDashboardTimeScale;
}

const formatReportedDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const ProblemManagementReport: React.FC<Props> = ({ params, interval = "DAILY" }) => {
    const navigate = useNavigate();
    const { data, pending, apiHandler } = useApi<ProblemManagementReportProps>();

    useEffect(() => {
        apiHandler(() => fetchProblemManagementReport({ ...params }));
    }, [apiHandler, params]);

    const masterTickets = data?.masterTickets ?? [];

    return (
        <CustomFieldset
            title="Problem Management"
            actionElement={<SectionReportDownload reportCode="MIS_PROBLEM_MANAGEMENT_RPT" reportName="Problem Management Report" params={params} interval={interval} />}
        >
            {pending ? (
                <Typography variant="body2" fontStyle="italic">Loading master tickets...</Typography>
            ) : (
                <TableContainer>
                    <Table aria-label="Problem management master tickets">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ticket Id</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reported Date</TableCell>
                                <TableCell align="right">Children Count</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {masterTickets.map((ticket) => (
                                <TableRow key={ticket.ticketId} hover>
                                    <TableCell>{ticket.ticketId}</TableCell>
                                    <TableCell>{ticket.status ?? "—"}</TableCell>
                                    <TableCell>{formatReportedDate(ticket.reportedDate)}</TableCell>
                                    <TableCell align="right">{ticket.childrenCount}</TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => navigate(`/tickets/${ticket.ticketId}`)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {masterTickets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No master tickets found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </CustomFieldset>
    );
};

export default ProblemManagementReport;
