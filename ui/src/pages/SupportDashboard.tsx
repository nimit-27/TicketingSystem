import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line,
} from "recharts";

import { fetchSupportDashboardSummary } from "../services/ReportService";
import {
  SupportDashboardSeverityKey,
  SupportDashboardSummary,
} from "../types/reports";

const severityLevels: SupportDashboardSeverityKey[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const severityCardStyles: Record<SupportDashboardSeverityKey, {
  label: string;
  background: string;
  color: string;
  chartColor: string;
}> = {
  CRITICAL: {
    label: "Critical",
    background: "#e8f5e9",
    color: "#2e7d32",
    chartColor: "#64d4a2",
  },
  HIGH: {
    label: "High",
    background: "#ff8a65",
    color: "#fff",
    chartColor: "#ff7043",
  },
  MEDIUM: {
    label: "Medium",
    background: "#cfd8dc",
    color: "#37474f",
    chartColor: "#90a4ae",
  },
  LOW: {
    label: "Low",
    background: "#fff59d",
    color: "#795548",
    chartColor: "#ffeb3b",
  },
};

const createDefaultSeverityCounts = (): Record<SupportDashboardSeverityKey, number> => ({
  CRITICAL: 0,
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0,
});

const createDefaultSummary = (): SupportDashboardSummary => ({
  pendingForAcknowledgement: 0,
  severityCounts: createDefaultSeverityCounts(),
});

const normalizeSeverityCounts = (
  counts?: Partial<Record<string, number>>,
): Record<SupportDashboardSeverityKey, number> => {
  const normalized = createDefaultSeverityCounts();

  if (!counts) {
    return normalized;
  }

  Object.entries(counts).forEach(([key, value]) => {
    const upperKey = key.toUpperCase() as SupportDashboardSeverityKey;
    if ((severityLevels as string[]).includes(upperKey) && typeof value === "number") {
      normalized[upperKey] = value;
    }
  });

  return normalized;
};

const openResolvedData = [
  { name: "Open", value: 12, color: "#ff7043" },
  { name: "Resolved", value: 21, color: "#64d4a2" },
];

const slaData = [
  { month: "Oct 2024", within: 88, overdue: 12 },
  { month: "Nov 2024", within: 82, overdue: 18 },
  { month: "Dec 2024", within: 91, overdue: 9 },
  { month: "Jan 2025", within: 86, overdue: 14 },
];

const ticketsPerMonth = [
  { month: "Oct 2024", tickets: 120 },
  { month: "Nov 2024", tickets: 134 },
  { month: "Dec 2024", tickets: 142 },
  { month: "Jan 2025", tickets: 156 },
];

const formatSummaryValue = (value: number) => value.toString().padStart(2, "0");

const SupportDashboard: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = React.useState<SupportDashboardSummary>(() => createDefaultSummary());
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetchSupportDashboardSummary();
        if (!isMounted) {
          return;
        }

        const data: SupportDashboardSummary = response.data;
        setSummary({
          pendingForAcknowledgement: data?.pendingForAcknowledgement ?? 0,
          severityCounts: normalizeSeverityCounts(data?.severityCounts),
        });
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error("Failed to load support dashboard summary", err);
        setSummary(createDefaultSummary());
        setError("Unable to load latest ticket metrics.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = React.useMemo(
    () => [
      {
        label: "Pending for Acknowledgement",
        value: formatSummaryValue(summary.pendingForAcknowledgement),
        background: "#ff5252",
        color: "#fff",
      },
      ...severityLevels.map((level) => ({
        label: severityCardStyles[level].label,
        value: formatSummaryValue(summary.severityCounts[level]),
        background: severityCardStyles[level].background,
        color: severityCardStyles[level].color,
      })),
    ],
    [summary],
  );

  const severityData = React.useMemo(
    () =>
      severityLevels.map((level) => ({
        name: severityCardStyles[level].label,
        value: summary.severityCounts[level],
        color: severityCardStyles[level].chartColor,
      })),
    [summary],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      {/* Header */}
      <Card sx={{ borderRadius: 3, boxShadow: "0px 12px 30px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="img" src="/logo.png" alt="Anna Darpan logo" sx={{ height: 48 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                Anna Darpan
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Dashboard (Helpdesk)
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                px: 2,
                py: 0.5,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search tickets"
                InputProps={{ disableUnderline: true }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ border: "1px solid", borderColor: "divider" }}>
                <Badge color="error" variant="dot">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>AD</Avatar>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={card.label}>
            <Card
              sx={{
                borderRadius: 3,
                background: card.background,
                color: card.color,
                height: "100%",
                boxShadow: "0px 12px 24px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!isLoading && error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      {/* Charts Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tickets by Severity (Current Month)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Open vs Resolved (Current Month)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={openResolvedData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={6}
                  >
                    {openResolvedData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                SLA Compliance (Oct 2024 - Jan 2025)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="within" fill="#64d4a2" name="Within SLA" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="overdue" fill="#ff7043" name="SLA Overdue" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Average Tickets per Month
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tickets" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name="Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Widget */}
      <Card sx={{ borderRadius: 3, display: "flex", justifyContent: "center" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "12px solid",
                borderColor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.palette.background.paper,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                501
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              Overall Tickets
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Anna Darpan Helpdesk Overview
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupportDashboard;
