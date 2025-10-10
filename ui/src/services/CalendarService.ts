import apiClient from "./apiClient";
import { CalendarViewResponse, UpsertWorkingHoursRequest } from "../types/calendar";

export const CalendarService = {
  async fetchCalendar(from: string, to: string): Promise<CalendarViewResponse> {
    const response = await apiClient.get<CalendarViewResponse>("/api/calendar/view", {
      params: { from, to },
    });
    return response.data;
  },

  async upsertWorkingHours(payload: UpsertWorkingHoursRequest): Promise<void> {
    const { startTime, endTime, timezone } = payload;
    const requestBody = timezone
      ? { startTime, endTime, timezone }
      : { startTime, endTime };
    await apiClient.post("/calendar/admin/working-hours:upsert", requestBody);
  },
};

export default CalendarService;
