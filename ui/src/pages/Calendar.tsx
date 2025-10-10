import React, { useCallback, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { BusinessHoursInput, DatesSetArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
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
  const rangeKeyRef = useRef<string>("");

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
        setError(t("Unable to load calendar data"));
      } finally {
        setLoading(false);
      }
    },
    [handleResponse, t],
  );

  const onDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const key = `${formatDateParam(arg.start)}_${formatDateParam(arg.end)}`;
      if (rangeKeyRef.current === key) {
        return;
      }
      rangeKeyRef.current = key;
      void fetchCalendar(arg.start, arg.end);
    },
    [fetchCalendar],
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
