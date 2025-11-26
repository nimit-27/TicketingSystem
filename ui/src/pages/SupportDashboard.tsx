import React from "react";
import { Box, Card, CardContent, SelectChangeEvent, TextField, Typography } from "@mui/material";

import { fetchSupportDashboardSummary } from "../services/ReportService";
import { useApi } from "../hooks/useApi";
import {
  SupportDashboardScopeKey,
  SupportDashboardSeverityKey,
  SupportDashboardSummary,
  SupportDashboardSummaryView,
  SupportDashboardSummaryResponse,
  SupportDashboardSummaryRequestParams,
  SupportDashboardTimeRange,
  SupportDashboardTimeScale,
} from "../types/reports";
import { checkSidebarAccess } from "../utils/permissions";
import Title from "../components/Title";
import GenericDropdown from "../components/UI/Dropdown/GenericDropdown";
import { useTranslation } from "react-i18next";

const severityLevels: SupportDashboardSeverityKey[] = [
  "S1",
  "S2",
  "S3",
  "S4",
];
// const severityLevels: SupportDashboardSeverityKey[] = [
//   "CRITICAL",
//   "HIGH",
//   "MEDIUM",
//   "LOW",
// ];

const severityCardStyles: Record<SupportDashboardSeverityKey, {
  label: string;
  background: string;
  color: string;
  chartColor: string;
}> = {
  S1: {
    label: "Critical",
    background: "#e8f5e9",
    color: "#2e7d32",
    chartColor: "#64d4a2",
  },
  S2: {
    label: "High",
    background: "#ff8a65",
    color: "#fff",
    chartColor: "#ff7043",
  },
  S3: {
    label: "Medium",
    background: "#cfd8dc",
    color: "#37474f",
    chartColor: "#90a4ae",
  },
  S4: {
    label: "Low",
    background: "#fff59d",
    color: "#795548",
    chartColor: "#ffeb3b",
  },
};

const createDefaultSeverityCounts = (): Record<SupportDashboardSeverityKey, number> => ({
  S1: 0,
  S2: 0,
  S3: 0,
  S4: 0,
});

const createDefaultSummaryView = (): SupportDashboardSummaryView => ({
  pendingForAcknowledgement: 0,
  severityCounts: createDefaultSeverityCounts(),
  totalTickets: 0,
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
    totalTickets: typeof typedView.totalTickets === "number" ? typedView.totalTickets : 0,
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
    { value: "LAST_7_DAYS", label: "supportDashboard.filters.range.last7Days" },
    { value: "LAST_30_DAYS", label: "supportDashboard.filters.range.last30Days" },
  ],
  WEEKLY: [
    { value: "LAST_4_WEEKS", label: "supportDashboard.filters.range.last4Weeks" },
  ],
  MONTHLY: [
    { value: "LAST_6_MONTHS", label: "supportDashboard.filters.range.last6Months" },
    { value: "CURRENT_YEAR", label: "supportDashboard.filters.range.currentYear" },
    { value: "LAST_YEAR", label: "supportDashboard.filters.range.previousYear" },
    { value: "LAST_5_YEARS", label: "supportDashboard.filters.range.last5Years" },
    { value: "CUSTOM_MONTH_RANGE", label: "supportDashboard.filters.range.customRange" },
    { value: "ALL_TIME", label: "supportDashboard.filters.range.allTime" },
  ],
  YEARLY: [
    { value: "YEAR_TO_DATE", label: "supportDashboard.filters.range.yearToDate" },
    { value: "LAST_YEAR", label: "supportDashboard.filters.range.previousYear" },
    { value: "LAST_5_YEARS", label: "supportDashboard.filters.range.last5Years" },
  ],
};

const scopeLabels: Record<SupportDashboardScopeKey, string> = {
  allTickets: "All Tickets",
  myWorkload: "My Workload",
};

const formatSummaryValue = (value: number) => value?.toString().padStart(2, "0");

const SupportDashboard: React.FC = () => {
  const [recharts, setRecharts] = React.useState<typeof import("recharts") | null>(null);
  const { t } = useTranslation();
  const [summary, setSummary] = React.useState<SupportDashboardSummary>(() => createDefaultSummary());
  const [error, setError] = React.useState<string | null>(null);
  const [timeScale, setTimeScale] = React.useState<SupportDashboardTimeScale>("DAILY");
  const [timeRange, setTimeRange] = React.useState<SupportDashboardTimeRange>("LAST_7_DAYS");
  const [activeScope, setActiveScope] = React.useState<SupportDashboardScopeKey>("allTickets");
  const [customMonthRange, setCustomMonthRange] = React.useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);

  const {
    data: summaryData,
    pending: isLoading,
    error: apiError,
    apiHandler: getSummaryApiHandler,
  } = useApi<SupportDashboardSummaryResponse>();

  React.useEffect(() => {
    let isMounted = true;

    import("recharts")
      .then((module) => {
        if (isMounted) {
          setRecharts(module);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load charting library");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const customRangeIsValid = React.useMemo(() => {
    if (timeScale !== "MONTHLY" || timeRange !== "CUSTOM_MONTH_RANGE") {
      return true;
    }

    const { start, end } = customMonthRange;
    if (typeof start !== "number" || typeof end !== "number") {
      return false;
    }

    if (start > end) {
      return false;
    }

    if (end > currentYear) {
      return false;
    }

    return start >= 1970;
  }, [customMonthRange, currentYear, timeRange, timeScale]);

  const requestParams = React.useMemo(() => {
    if (!customRangeIsValid) {
      return null;
    }

    const params: SupportDashboardSummaryRequestParams = { timeScale, timeRange };

    if (timeScale === "MONTHLY" && timeRange === "CUSTOM_MONTH_RANGE") {
      const { start, end } = customMonthRange;
      if (typeof start !== "number" || typeof end !== "number") {
        return null;
      }
      params.customStartYear = start;
      params.customEndYear = end;
    }

    return params;
  }, [customMonthRange, customRangeIsValid, timeRange, timeScale]);

  const handleTimeScaleChange = React.useCallback(
    (event: SelectChangeEvent) => {
      const value = event.target.value as SupportDashboardTimeScale;
      setTimeScale(value);
      const defaultRange = (timeRangeOptions[value] ?? [])[0]?.value;
      if (defaultRange) {
        setTimeRange(defaultRange);
      }
      if (value !== "MONTHLY") {
        setCustomMonthRange({ start: null, end: null });
      }
    },
    [],
  );

  const handleTimeRangeChange = React.useCallback(
    (event: SelectChangeEvent) => {
      const value = event.target.value as SupportDashboardTimeRange;
      setTimeRange(value);

      if (value === "CUSTOM_MONTH_RANGE") {
        setCustomMonthRange((previous) => ({
          start: typeof previous.start === "number" ? previous.start : currentYear - 1,
          end: typeof previous.end === "number" ? previous.end : currentYear,
        }));
      } else {
        setCustomMonthRange({ start: null, end: null });
      }
    },
    [currentYear],
  );

  const handleCustomMonthRangeChange = React.useCallback(
    (key: "start" | "end") => (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value.trim();
      if (rawValue === "") {
        setCustomMonthRange((previous) => ({ ...previous, [key]: null }));
        return;
      }

      const numericValue = Number.parseInt(rawValue, 10);
      setCustomMonthRange((previous) => ({
        ...previous,
        [key]: Number.isNaN(numericValue) ? previous[key] : numericValue,
      }));
    },
    [],
  );

  React.useEffect(() => {
    if (!requestParams) {
      return;
    }

    void getSummaryApiHandler(() => fetchSupportDashboardSummary(requestParams));
  }, [getSummaryApiHandler, requestParams]);

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

  const overallTickets = React.useMemo(() => activeSummaryView.totalTickets ?? 0, [activeSummaryView.totalTickets]);

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
        label: typeof point?.label === "string" ? point.label : "Unknown",
        within: typeof point?.withinSla === "number" ? point.withinSla : 0,
        overdue: typeof point?.overdue === "number" ? point.overdue : 0,
      })),
    [summaryData],
  );

  const ticketVolumeSeries = React.useMemo(
    () =>
      (summaryData?.ticketVolume ?? []).map((point: any) => ({
        label: typeof point?.label === "string" ? point.label : "Unknown",
        tickets: typeof point?.tickets === "number" ? point.tickets : 0,
      })),
    [summaryData],
  );

  const activeScopeLabel = t(scopeLabels[activeScope]);

  if (!recharts) {
    return (
      <div className="d-flex flex-column flex-grow-1">
        <Title textKey="Dashboard" />
        <Typography variant="body1" className="mt-3">
          {t("supportDashboard.loadingCharts", { defaultValue: "Loading dashboard charts..." })}
        </Typography>
      </div>
    );
  }

  const { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Bar, LineChart, Line } =
    recharts;

  return (
    <div className="d-flex flex-column flex-grow-1">
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
            {timeScale === "MONTHLY" && timeRange === "CUSTOM_MONTH_RANGE" && (
              <Box className="d-flex flex-column flex-sm-row align-items-start gap-2 w-100">
                <TextField
                  label={t("supportDashboard.filters.range.startYear")}
                  type="number"
                  size="small"
                  value={customMonthRange.start ?? ""}
                  onChange={handleCustomMonthRangeChange("start")}
                  inputProps={{ min: 1970, max: currentYear, step: 1 }}
                />
                <TextField
                  label={t("supportDashboard.filters.range.endYear")}
                  type="number"
                  size="small"
                  value={customMonthRange.end ?? ""}
                  onChange={handleCustomMonthRangeChange("end")}
                  inputProps={{ min: 1970, max: currentYear, step: 1 }}
                />
                {!customRangeIsValid && (
                  <Typography variant="caption" color="error" className="fw-semibold">
                    {t("supportDashboard.filters.range.customRangeError", { currentYear })}
                  </Typography>
                )}
              </Box>
            )}
          </div>

          {/* Summary Cards */}
          <div className="row g-3">
            <div className="position-relative d-flex flex-column align-items-center col-12 col-sm-6 col-xl-2">
              <Typography variant="subtitle2" color="text.secondary" className="fw-semibold text-uppercase mb-2">
                {t("supportDashboard.metrics.overallTickets")}
              </Typography>
              <Box
                className="rounded-circle d-flex align-items-center justify-content-center bg-white"
                sx={{
                  width: 110,
                  height: 110,
                  border: "10px solid",
                  borderColor: "var(--bs-primary)",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 28 }}>
                  {overallTickets.toLocaleString()}
                </Typography>
              </Box>
            </div>
            {summaryCards.map((card) => (
              <div className="col-12 col-sm-6 col-xl-2" key={card.label}>
                <Card className="h-100 border-0 shadow-sm" style={{ background: card.background, color: card.color }}>
                  <CardContent className="py-3">
                    <Typography variant="subtitle2" className="fw-semibold text-uppercase mb-1" sx={{ fontSize: 12 }}>
                      {t(card.label)}
                    </Typography>
                    <Typography className="fw-bold" sx={{ fontSize: 24 }}>
                      {card.value.toString()}
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
                <CardContent className="h-100" style={{ minHeight: 320 }}>
                  <Typography variant="h6" className="fw-semibold mb-3" sx={{ fontSize: 18 }}>
                    {t("supportDashboard.metrics.ticketsBySeverity")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        labelLine={false}
                      >
                        {severityData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 320 }}>
                  <Typography variant="h6" className="fw-semibold mb-3" sx={{ fontSize: 18 }}>
                    {t("supportDashboard.metrics.openVsResolved")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={openResolvedData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={5}
                        labelLine={false}
                      >
                        {openResolvedData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 320 }}>
                  <Typography variant="h6" className="fw-semibold mb-3" sx={{ fontSize: 18 }}>
                    {t("supportDashboard.metrics.slaCompliance")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="within" fill="#64d4a2" name={t("supportDashboard.metrics.withinSla")} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="overdue" fill="#ff7043" name={t("supportDashboard.metrics.slaOverdue")} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-12 col-xl-6">
              <Card className="h-100 border-0 shadow-sm">
                <CardContent className="h-100" style={{ minHeight: 320 }}>
                  <Typography variant="h6" className="fw-semibold mb-3" sx={{ fontSize: 18 }}>
                    {t("supportDashboard.metrics.ticketsPerMonth")}
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ticketVolumeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="tickets"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name={t("supportDashboard.metrics.tickets")}
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
