import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { BusinessHoursInput, DatesSetArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import CalendarService from "../services/CalendarService";
import {
  BusinessHoursDto,
  CalendarConfigDto,
  CalendarViewResponse,
  FullCalendarEventDto,
} from "../types/calendar";

const minutesToClock = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const mapIsoToFullCalendarDay = (value: number): number => {
  if (value === 7) {
    return 0;
  }
  return value % 7;
};

const toBusinessHours = (dto: BusinessHoursDto | null | undefined): BusinessHoursInput | null => {
  if (!dto) {
    return null;
  }

  const { startTimeMinutes, endTimeMinutes, daysOfWeek } = dto;
  if (startTimeMinutes == null || endTimeMinutes == null) {
    return null;
  }

  const mappedDays = (daysOfWeek || [])
    .filter((day): day is number => typeof day === "number")
    .map(mapIsoToFullCalendarDay);

  return {
    daysOfWeek: mappedDays,
    startTime: minutesToClock(startTimeMinutes),
    endTime: minutesToClock(endTimeMinutes),
  };
};

const buildBusinessHours = (config: CalendarConfigDto | null | undefined): BusinessHoursInput[] => {
  if (!config) {
    return [];
  }

  const hours: BusinessHoursInput[] = [];
  const defaultHours = toBusinessHours(config.defaultBusinessHours);
  if (defaultHours) {
    hours.push(defaultHours);
  }

  const exceptionHours = (config.exceptions || [])
    .map((exception) => toBusinessHours(exception))
    .filter((value): value is BusinessHoursInput => Boolean(value));

  return [...hours, ...exceptionHours];
};

const toEventInput = (dto: FullCalendarEventDto): EventInput => ({
  id: dto.id,
  title: dto.title,
  start: dto.start,
  end: dto.end,
  allDay: dto.allDay ?? false,
  backgroundColor: dto.backgroundColor ?? undefined,
  textColor: dto.textColor ?? undefined,
});

const formatDateParam = (value: Date): string => {
  const year = value.getFullYear();
  const month = (value.getMonth() + 1).toString().padStart(2, "0");
  const day = value.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CalendarPage: React.FC = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHoursInput[]>([]);
  const [timezone, setTimezone] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWorkingHoursForm, setShowWorkingHoursForm] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [workingHoursSubmitting, setWorkingHoursSubmitting] = useState(false);
  const [workingHoursError, setWorkingHoursError] = useState<string | null>(null);
  const [workingHoursSuccess, setWorkingHoursSuccess] = useState<string | null>(null);
  const rangeKeyRef = useRef<string>("");
  const lastRangeRef = useRef<{ start: Date; end: Date } | null>(null);

  const getAxiosMessage = useCallback((value: unknown): string | undefined => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }
    const axiosCandidate = value as AxiosError<{ message?: string }>;
    if ((axiosCandidate as { isAxiosError?: boolean }).isAxiosError !== true) {
      return undefined;
    }
    return axiosCandidate.response?.data?.message;
  }, []);

  const handleResponse = useCallback((response: CalendarViewResponse) => {
    const mappedEvents = response.events.map(toEventInput);
    setEvents(mappedEvents);
    setBusinessHours(buildBusinessHours(response.config));
    setTimezone(response.config?.timezone ?? undefined);
  }, []);

  const fetchCalendar = useCallback(
    async (start: Date, end: Date) => {
      setLoading(true);
      setError(null);
      try {
        const response = await CalendarService.fetchCalendar(formatDateParam(start), formatDateParam(end));
        handleResponse(response);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load calendar", err);
        const message = getAxiosMessage(err);
        setError(message ?? t("Unable to load calendar data"));
      } finally {
        setLoading(false);
      }
    },
    [getAxiosMessage, handleResponse, t],
  );

  const onDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const key = `${formatDateParam(arg.start)}_${formatDateParam(arg.end)}`;
      if (rangeKeyRef.current === key) {
        return;
      }
      rangeKeyRef.current = key;
      lastRangeRef.current = {
        start: new Date(arg.start.getTime()),
        end: new Date(arg.end.getTime()),
      };
      void fetchCalendar(arg.start, arg.end);
    },
    [fetchCalendar],
  );

  useEffect(() => {
    if (businessHours.length === 0) {
      return;
    }

    const defaultHours = businessHours.find(
      (hours): hours is { startTime?: string; endTime?: string } =>
        typeof hours === "object" &&
        hours !== null &&
        !Array.isArray(hours) &&
        "startTime" in hours &&
        "endTime" in hours,
    );
    if (!defaultHours) {
      return;
    }

    const normalise = (value?: string): string | null => {
      if (!value) {
        return null;
      }
      const parts = value.split(":");
      if (parts.length < 2) {
        return null;
      }
      const hours = parts[0]?.padStart(2, "0") ?? "00";
      const minutes = parts[1]?.padStart(2, "0") ?? "00";
      return `${hours}:${minutes}`;
    };

    const defaultStart = normalise(defaultHours.startTime as string | undefined);
    const defaultEnd = normalise(defaultHours.endTime as string | undefined);
    if (defaultStart) {
      setStartTime(defaultStart);
    }
    if (defaultEnd) {
      setEndTime(defaultEnd);
    }
  }, [businessHours]);

  const toggleWorkingHoursForm = useCallback(() => {
    setShowWorkingHoursForm((prev) => !prev);
    setWorkingHoursError(null);
    setWorkingHoursSuccess(null);
  }, []);

  const handleWorkingHoursSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setWorkingHoursError(null);
      setWorkingHoursSuccess(null);

      const toMinutes = (value: string): number => {
        const [hours, minutes] = value.split(":").map((part) => Number(part ?? "0"));
        return hours * 60 + minutes;
      };

      if (!startTime || !endTime) {
        setWorkingHoursError(t("Please select both start and end times"));
        return;
      }

      if (toMinutes(startTime) >= toMinutes(endTime)) {
        setWorkingHoursError(t("Start time must be before end time"));
        return;
      }

      setWorkingHoursSubmitting(true);
      try {
        await CalendarService.upsertWorkingHours({
          startTime,
          endTime,
          timezone,
        });
        setWorkingHoursSuccess(t("Working hours updated successfully"));
        if (lastRangeRef.current) {
          const { start, end } = lastRangeRef.current;
          void fetchCalendar(start, end);
        }
      } catch (submissionError) {
        // eslint-disable-next-line no-console
        console.error("Failed to update working hours", submissionError);
        const message = getAxiosMessage(submissionError);
        setWorkingHoursError(message ?? t("Failed to update working hours"));
      } finally {
        setWorkingHoursSubmitting(false);
      }
    },
    [endTime, fetchCalendar, getAxiosMessage, startTime, t, timezone],
  );

  const calendarBusinessHours = useMemo(() => businessHours, [businessHours]);

  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            {t("Calendar")}
          </Typography>
        </Box>
        <Box mb={2}>
          <Button variant="contained" color="primary" onClick={toggleWorkingHoursForm}>
            {showWorkingHoursForm ? t("Close Working Hours") : t("Update Normal Working Hours")}
          </Button>
        </Box>
        {showWorkingHoursForm && (
          <Box component="form" onSubmit={handleWorkingHoursSubmit} mb={2}>
            <Stack spacing={2} mb={2} direction="column">
              {workingHoursError && <Alert severity="error">{workingHoursError}</Alert>}
              {workingHoursSuccess && <Alert severity="success">{workingHoursSuccess}</Alert>}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label={t("Start Time")}
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  inputProps={{ step: 60 }}
                  required
                  fullWidth
                />
                <TextField
                  label={t("End Time")}
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  inputProps={{ step: 60 }}
                  required
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button type="submit" variant="contained" color="primary" disabled={workingHoursSubmitting}>
                  {workingHoursSubmitting ? t("Saving...") : t("Save Working Hours")}
                </Button>
                <Button variant="outlined" onClick={toggleWorkingHoursForm} disabled={workingHoursSubmitting}>
                  {t("Cancel")}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Box position="relative">
          {loading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="rgba(255,255,255,0.7)"
              zIndex={1}
            >
              <CircularProgress size={48} />
            </Box>
          )}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            businessHours={calendarBusinessHours}
            datesSet={onDatesSet}
            weekends
            displayEventEnd
            nowIndicator
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            timeZone={timezone}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CalendarPage;
