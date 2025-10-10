import apiClient from "./apiClient";
import { CalendarViewResponse } from "../types/calendar";

export const CalendarService = {
  async fetchCalendar(from: string, to: string): Promise<CalendarViewResponse> {
    const response = await apiClient.get<CalendarViewResponse>("/api/calendar/view", {
      params: { from, to },
    });
    return response.data;
  },
};

export default CalendarService;
