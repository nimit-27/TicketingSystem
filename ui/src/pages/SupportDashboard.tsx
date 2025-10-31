import React from "react";
import { Card, CardContent, SelectChangeEvent, Typography } from "@mui/material";
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
  SupportDashboardSummaryView,
  SupportDashboardTimeRange,
  SupportDashboardTimeScale,
} from "../types/reports";
import { checkSidebarAccess } from "../utils/permissions";
import Title from "../components/Title";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { useTranslation } from "react-i18next";

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
  { value: "DAILY", label: "supportDashboard.filters.interval.daily" },
  { value: "WEEKLY", label: "supportDashboard.filters.interval.weekly" },
  { value: "MONTHLY", label: "supportDashboard.filters.interval.monthly" },
  { value: "YEARLY", label: "supportDashboard.filters.interval.yearly" },
];

const timeRangeOptions: Record<SupportDashboardTimeScale, { value: SupportDashboardTimeRange; label: string }[]> = {
  DAILY: [
    { value: "LAST_DAY", label: "supportDashboard.filters.range.lastDay" },
    { value: "LAST_7_DAYS", label: "supportDashboard.filters.range.last7Days" },
    { value: "LAST_30_DAYS", label: "supportDashboard.filters.range.last30Days" },
  ],
  WEEKLY: [
    { value: "THIS_WEEK", label: "supportDashboard.filters.range.thisWeek" },
    { value: "LAST_WEEK", label: "supportDashboard.filters.range.previousWeek" },
    { value: "LAST_4_WEEKS", label: "supportDashboard.filters.range.last4Weeks" },
  ],
  MONTHLY: [
    { value: "THIS_MONTH", label: "supportDashboard.filters.range.thisMonth" },
    { value: "LAST_MONTH", label: "supportDashboard.filters.range.previousMonth" },
    { value: "LAST_12_MONTHS", label: "supportDashboard.filters.range.last12Months" },
  ],
  YEARLY: [
    { value: "YEAR_TO_DATE", label: "supportDashboard.filters.range.yearToDate" },
    { value: "LAST_YEAR", label: "supportDashboard.filters.range.previousYear" },
  ],
};

const scopeLabels: Record<SupportDashboardScopeKey, string> = {
  allTickets: "All Tickets",
  myWorkload: "My Workload",
};

const formatSummaryValue = (value: number) => value.toString().padStart(2, "0");

const SupportDashboard: React.FC = () => {
  const { t } = useTranslation();
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
        name: t(severityCardStyles[level].label),
        value: activeSummaryView.severityCounts[level],
        color: severityCardStyles[level].chartColor,
      })),
    [activeSummaryView, t],
  );

  const openResolvedData = React.useMemo(
    () => {
      const openCount = typeof summaryData?.openResolved?.openTickets === "number" ? summaryData.openResolved.openTickets : 0;
      const resolvedCount =
        typeof summaryData?.openResolved?.resolvedTickets === "number" ? summaryData.openResolved.resolvedTickets : 0;

      return [
        { name: t("Open"), value: openCount, color: "#ff7043" },
        { name: t("Resolved"), value: resolvedCount, color: "#64d4a2" },
      ];
    },
    [summaryData, t],
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

  const activeScopeLabel = t(scopeLabels[activeScope]);

  return (
    <div className="">
      <Title textKey="Dashboard" />
      <div className="row -mb-4">
        <div className="d-flex flex-column gap-3 w-100">
          <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 flex-wrap">
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 w-lg-auto">
              <GenericDropdown
                id="support-dashboard-timescale"
                label="supportDashboard.filters.interval.label"
                value={timeScale}
                onChange={handleTimeScaleChange}
                disabled={isLoading}
                fullWidth
                options={timeScaleOptions}
                className="flex-grow-1 flex-sm-grow-0"
              />
              <GenericDropdown
                id="support-dashboard-timerange"
                label="supportDashboard.filters.range.label"
                value={timeRange}
                onChange={handleTimeRangeChange}
                disabled={isLoading}
                fullWidth
                options={availableTimeRanges}
                className="flex-grow-1 flex-sm-grow-0"
              />
              {/* <Chip
                label={
                  isLoading
                    ? t("supportDashboard.filters.loading", { scope: activeScopeLabel })
                    : t("supportDashboard.filters.dataSource", { scope: activeScopeLabel })
                }
                color="primary"
                variant="outlined"
                size="small"
                disabled={isLoading}
                className="fw-semibold text-uppercase"
              /> */}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-3">
            <div className="position-relative d-flex flex-column align-items-center col-12 col-sm-6 col-xl-2">
              <div>
                <Typography variant="subtitle1" color="text.secondary">
                  {t("supportDashboard.metrics.overallTickets")}
                </Typography>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-white"
                style={{
                  width: 120,
                  height: 120,
                  border: "12px solid",
                  borderColor: "var(--bs-primary)",
                }}
              >
                <Typography variant="h5" className="fw-bold">
                  501
                </Typography>
              </div>
            </div>
            {summaryCards.map((card) => (
              <div className="col-12 col-sm-6 col-xl-2" key={card.label}>
                <Card className="h-100 border-0 shadow-sm" style={{ background: card.background, color: card.color }}>
                  <CardContent className="py-4">
                    <Typography variant="subtitle2" className="fw-semibold text-uppercase mb-1">
                      {t(card.label)}
                    </Typography>
                    <Typography variant="h4" className="fw-bold">
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {!isLoading && error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {/* Charts Section */}
          <div className="row g-3">
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 360 }}>
                  <Typography variant="h6" className="fw-semibold mb-3">
                    {t("supportDashboard.metrics.ticketsBySeverity")}
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
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 360 }}>
                  <Typography variant="h6" className="fw-semibold mb-3">
                    {t("supportDashboard.metrics.openVsResolved")}
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
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 360 }}>
                  <Typography variant="h6" className="fw-semibold mb-3">
                    {t("supportDashboard.metrics.slaCompliance")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="within" fill="#64d4a2" name={t("supportDashboard.metrics.withinSla")} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="overdue" fill="#ff7043" name={t("supportDashboard.metrics.slaOverdue")} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 360 }}>
                  <Typography variant="h6" className="fw-semibold mb-3">
                    {t("supportDashboard.metrics.ticketsPerMonth")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ticketsPerMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="tickets" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name={t("supportDashboard.metrics.tickets")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
