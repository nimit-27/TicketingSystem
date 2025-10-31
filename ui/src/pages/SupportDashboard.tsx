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
import { useApi } from "../hooks/useApi";
import {
  SupportDashboardScopeKey,
  SupportDashboardSeverityKey,
  SupportDashboardSummary,
  SupportDashboardSummaryResponse,
  SupportDashboardSummaryView,
  SupportDashboardTimeRange,
  SupportDashboardTimeScale,
} from "../types/reports";
import { checkSidebarAccess } from "../utils/permissions";
import Title from "../components/Title";

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

const formatSummaryValue = (value: number) => value.toString().padStart(2, "0");

const SupportDashboard: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = React.useState<SupportDashboardSummary>(() => createDefaultSummary());
  const [error, setError] = React.useState<string | null>(null);
  const [timeScale, setTimeScale] = React.useState<SupportDashboardTimeScale>("DAILY");
  const [timeRange, setTimeRange] = React.useState<SupportDashboardTimeRange>("LAST_7_DAYS");
  const [activeScope, setActiveScope] = React.useState<SupportDashboardScopeKey>("allTickets");

  const {
    data: summaryData,
    pending: isLoading,
    error: apiError,
    apiHandler: getSummaryApiHandler,
    // } = useApi<SupportDashboardSummaryResponse>();
  } = useApi<any>();

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
    void getSummaryApiHandler(() => fetchSupportDashboardSummary({ timeScale, timeRange }));
  }, [getSummaryApiHandler, timeRange, timeScale]);

  React.useEffect(() => {
    const resolvedSummary = createDefaultSummary();
    const availabilitySnapshot: SupportDashboardSummary = { allTickets: null, myWorkload: null };

    if (summaryData && typeof summaryData === "object") {
      if (summaryData.allTickets != null) {
        const normalized = normalizeSummaryView(summaryData.allTickets);
        resolvedSummary.allTickets = normalized;
        availabilitySnapshot.allTickets = normalized;
      }

      if (summaryData.myWorkload != null) {
        const normalized = normalizeSummaryView(summaryData.myWorkload);
        resolvedSummary.myWorkload = normalized;
        availabilitySnapshot.myWorkload = normalized;
      }
    }

    setSummary(resolvedSummary);
    const nextScope = determineScope(availabilitySnapshot);
    setActiveScope((current) => (current !== nextScope ? nextScope : current));
  }, [determineScope, summaryData]);

  React.useEffect(() => {
    if (apiError) {
      const message = apiError.toString() || "Unable to load latest ticket metrics.";
      setError(message);
    } else {
      setError(null);
    }
  }, [apiError]);

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

  const openResolvedData = React.useMemo(
    () => {
      const openCount = typeof summaryData?.openResolved?.openTickets === "number" ? summaryData.openResolved.openTickets : 0;
      const resolvedCount =
        typeof summaryData?.openResolved?.resolvedTickets === "number" ? summaryData.openResolved.resolvedTickets : 0;

      return [
        { name: "Open", value: openCount, color: "#ff7043" },
        { name: "Resolved", value: resolvedCount, color: "#64d4a2" },
      ];
    },
    [summaryData],
  );

  const slaData = React.useMemo(
    () =>
      (summaryData?.slaCompliance ?? []).map((point: any) => ({
        month: point?.month ?? "Unknown",
        within: typeof point?.withinSla === "number" ? point.withinSla : 0,
        overdue: typeof point?.overdue === "number" ? point.overdue : 0,
      })),
    [summaryData],
  );

  const ticketsPerMonth = React.useMemo(
    () =>
      (summaryData?.ticketVolume ?? []).map((point: any) => ({
        month: point?.month ?? "Unknown",
        tickets: typeof point?.tickets === "number" ? point.tickets : 0,
      })),
    [summaryData],
  );

  const activeScopeLabel = scopeLabels[activeScope];

  return (
    <div className="">
      <Title textKey="Dashboard" />
      <div className="row -mb-4">
        <div className="d-flex flex-column gap-3 w-100">
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
                    Tickets by Severity
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
                    Open vs Resolved
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
                    SLA Compliance Trend
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
                    Tickets Created Per Month
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
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
