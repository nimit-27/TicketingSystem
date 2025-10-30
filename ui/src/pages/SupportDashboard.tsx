import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
  SupportDashboardScopeKey,
  SupportDashboardSeverityKey,
  SupportDashboardSummary,
  SupportDashboardSummaryView,
  SupportDashboardTimeRange,
  SupportDashboardTimeScale,
} from "../types/reports";
import { checkSidebarAccess } from "../utils/permissions";

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

const createDefaultSummaryView = (): SupportDashboardSummaryView => ({
  pendingForAcknowledgement: 0,
  severityCounts: createDefaultSeverityCounts(),
});

const createDefaultSummary = (): SupportDashboardSummary => ({
  allTickets: createDefaultSummaryView(),
  myWorkload: createDefaultSummaryView(),
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

const normalizeSummaryView = (view: unknown): SupportDashboardSummaryView => {
  if (!view || typeof view !== "object") {
    return createDefaultSummaryView();
  }

  const typedView = view as Partial<SupportDashboardSummaryView> & {
    severityCounts?: Partial<Record<string, number>>;
  };

  return {
    pendingForAcknowledgement:
      typeof typedView.pendingForAcknowledgement === "number"
        ? typedView.pendingForAcknowledgement
        : 0,
    severityCounts: normalizeSeverityCounts(typedView.severityCounts),
  };
};

const extractSummaryPayload = (raw: unknown): any => {
  const dataLayer = (raw as any)?.data ?? raw;
  const bodyLayer = dataLayer?.body ?? dataLayer;

  if (bodyLayer && typeof bodyLayer === "object" && "data" in bodyLayer) {
    return (bodyLayer as any).data ?? null;
  }

  return bodyLayer ?? null;
};

const timeScaleOptions: { value: SupportDashboardTimeScale; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const timeRangeOptions: Record<SupportDashboardTimeScale, { value: SupportDashboardTimeRange; label: string }[]> = {
  DAILY: [
    { value: "LAST_DAY", label: "Last 24 hours" },
    { value: "LAST_7_DAYS", label: "Last 7 days" },
    { value: "LAST_30_DAYS", label: "Last 30 days" },
  ],
  WEEKLY: [
    { value: "THIS_WEEK", label: "This week" },
    { value: "LAST_WEEK", label: "Previous week" },
    { value: "LAST_4_WEEKS", label: "Last 4 weeks" },
  ],
  MONTHLY: [
    { value: "THIS_MONTH", label: "This month" },
    { value: "LAST_MONTH", label: "Previous month" },
    { value: "LAST_12_MONTHS", label: "Last 12 months" },
  ],
  YEARLY: [
    { value: "YEAR_TO_DATE", label: "Year to date" },
    { value: "LAST_YEAR", label: "Previous year" },
  ],
};

const scopeLabels: Record<SupportDashboardScopeKey, string> = {
  allTickets: "All Tickets",
  myWorkload: "My Workload",
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
  const [timeScale, setTimeScale] = React.useState<SupportDashboardTimeScale>("DAILY");
  const [timeRange, setTimeRange] = React.useState<SupportDashboardTimeRange>("LAST_7_DAYS");
  const [activeScope, setActiveScope] = React.useState<SupportDashboardScopeKey>("allTickets");

  const hasAllTicketsAccess = React.useMemo(() => checkSidebarAccess("allTickets"), []);
  const hasMyWorkloadAccess = React.useMemo(() => checkSidebarAccess("myWorkload"), []);

  const determineScope = React.useCallback(
    (data: SupportDashboardSummary): SupportDashboardScopeKey => {
      const allTicketsAvailable = data.allTickets !== null && data.allTickets !== undefined;
      const myWorkloadAvailable = data.myWorkload !== null && data.myWorkload !== undefined;

      if (hasAllTicketsAccess && allTicketsAvailable) {
        return "allTickets";
      }

      if (!hasAllTicketsAccess && hasMyWorkloadAccess && myWorkloadAvailable) {
        return "myWorkload";
      }

      if (allTicketsAvailable) {
        return "allTickets";
      }

      if (myWorkloadAvailable) {
        return "myWorkload";
      }

      if (hasAllTicketsAccess) {
        return "allTickets";
      }

      if (hasMyWorkloadAccess) {
        return "myWorkload";
      }

      return "allTickets";
    },
    [hasAllTicketsAccess, hasMyWorkloadAccess],
  );

  const availableTimeRanges = React.useMemo(() => timeRangeOptions[timeScale] ?? [], [timeScale]);

  const handleTimeScaleChange = React.useCallback(
    (event: SelectChangeEvent) => {
      const value = event.target.value as SupportDashboardTimeScale;
      setTimeScale(value);
      const defaultRange = (timeRangeOptions[value] ?? [])[0]?.value;
      if (defaultRange) {
        setTimeRange(defaultRange);
      }
    },
    [],
  );

  const handleTimeRangeChange = React.useCallback(
    (event: SelectChangeEvent) => {
      setTimeRange(event.target.value as SupportDashboardTimeRange);
    },
    [],
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSupportDashboardSummary({ timeScale, timeRange });
        if (!isMounted) {
          return;
        }

        const payload = extractSummaryPayload(response);
        const resolvedSummary = createDefaultSummary();
        const availabilitySnapshot: SupportDashboardSummary = { allTickets: null, myWorkload: null };

        if (payload && typeof payload === "object") {
          if ("allTickets" in payload) {
            if (payload.allTickets != null) {
              const normalized = normalizeSummaryView(payload.allTickets);
              resolvedSummary.allTickets = normalized;
              availabilitySnapshot.allTickets = normalized;
            }
          }

          if ("myWorkload" in payload) {
            if (payload.myWorkload != null) {
              const normalized = normalizeSummaryView(payload.myWorkload);
              resolvedSummary.myWorkload = normalized;
              availabilitySnapshot.myWorkload = normalized;
            }
          }
        }

        setSummary(resolvedSummary);
        setActiveScope(determineScope(availabilitySnapshot));
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

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [determineScope, timeRange, timeScale]);

  const activeSummaryView = React.useMemo(() => {
    const view = summary[activeScope];
    return view ?? createDefaultSummaryView();
  }, [activeScope, summary]);

  const summaryCards = React.useMemo(
    () => [
      {
        label: "Pending for Acknowledgement",
        value: formatSummaryValue(activeSummaryView.pendingForAcknowledgement),
        background: "#ff5252",
        color: "#fff",
      },
      ...severityLevels.map((level) => ({
        label: severityCardStyles[level].label,
        value: formatSummaryValue(activeSummaryView.severityCounts[level]),
        background: severityCardStyles[level].background,
        color: severityCardStyles[level].color,
      })),
    ],
    [activeSummaryView],
  );

  const severityData = React.useMemo(
    () =>
      severityLevels.map((level) => ({
        name: severityCardStyles[level].label,
        value: activeSummaryView.severityCounts[level],
        color: severityCardStyles[level].chartColor,
      })),
    [activeSummaryView],
  );

  const activeScopeLabel = scopeLabels[activeScope];

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
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              gap: 2,
              flexWrap: "wrap",
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
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
                minWidth: { xs: "100%", lg: "auto" },
              }}
            >
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                <InputLabel id="support-dashboard-timescale-label">Interval</InputLabel>
                <Select
                  labelId="support-dashboard-timescale-label"
                  value={timeScale}
                  label="Interval"
                  onChange={handleTimeScaleChange}
                  disabled={isLoading}
                >
                  {timeScaleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
                <InputLabel id="support-dashboard-timerange-label">Range</InputLabel>
                <Select
                  labelId="support-dashboard-timerange-label"
                  value={timeRange}
                  label="Range"
                  onChange={handleTimeRangeChange}
                  disabled={isLoading}
                >
                  {availableTimeRanges.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip
                label={isLoading ? `Loading… (${activeScopeLabel})` : `Data source: ${activeScopeLabel}`}
                color="primary"
                variant="outlined"
                size="small"
                disabled={isLoading}
                sx={{ fontWeight: 600, textTransform: "uppercase" }}
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
          <Grid>
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
        <Grid>
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
        <Grid>
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
        <Grid>
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
        <Grid>
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
