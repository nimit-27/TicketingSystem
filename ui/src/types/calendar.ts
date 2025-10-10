export interface FullCalendarEventDto {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean | null;
  backgroundColor?: string | null;
  textColor?: string | null;
}

export interface BusinessHoursDto {
  startTimeMinutes: number | null;
  endTimeMinutes: number | null;
  daysOfWeek: number[];
}

export interface CalendarConfigDto {
  timezone: string;
  defaultBusinessHours: BusinessHoursDto | null;
  exceptions: BusinessHoursDto[];
}

export interface CalendarViewResponse {
  config: CalendarConfigDto;
  events: FullCalendarEventDto[];
}

export interface UpsertWorkingHoursRequest {
  startTime: string;
  endTime: string;
  timezone?: string;
}
