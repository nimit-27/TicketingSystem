import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import CalendarPage from "../Calendar";
import { renderWithTheme } from "../../test/testUtils";

const mockFetchCalendar = jest.fn();
const mockUpsertWorkingHours = jest.fn();

jest.mock("../../services/CalendarService", () => ({
  __esModule: true,
  default: {
    fetchCalendar: (...args: unknown[]) => mockFetchCalendar(...args),
    upsertWorkingHours: (...args: unknown[]) => mockUpsertWorkingHours(...args),
  },
}));

jest.mock(
  "@fullcalendar/react",
  () => ({ events, businessHours, datesSet, timeZone }: any) => (
    <div
      data-testid="full-calendar"
      data-events={JSON.stringify(events)}
      data-business-hours={JSON.stringify(businessHours)}
      data-timezone={timeZone ?? ""}
    >
      <button
        type="button"
        onClick={() => datesSet?.({ start: new Date("2024-02-01"), end: new Date("2024-02-07") })}
      >
        set-dates
      </button>
    </div>
  ),
  { virtual: true },
);

jest.mock("@fullcalendar/daygrid", () => jest.fn(), { virtual: true });
jest.mock("@fullcalendar/timegrid", () => jest.fn(), { virtual: true });
jest.mock("@fullcalendar/interaction", () => jest.fn(), { virtual: true });

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const calendarResponse = {
  events: [
    { id: "1", title: "Event 1", start: "2024-02-02", end: "2024-02-03", allDay: true },
  ],
  config: {
    timezone: "Asia/Kolkata",
    defaultBusinessHours: {
      startTimeMinutes: 540,
      endTimeMinutes: 1020,
      daysOfWeek: [1, 2],
    },
    exceptions: [
      { startTimeMinutes: 600, endTimeMinutes: 720, daysOfWeek: [5] },
    ],
  },
};

describe("CalendarPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCalendar.mockResolvedValue(calendarResponse);
    mockUpsertWorkingHours.mockResolvedValue({});
  });

  it("fetches calendar data when dates change", async () => {
    renderWithTheme(<CalendarPage />);

    fireEvent.click(await screen.findByText("set-dates"));

    await waitFor(() => expect(mockFetchCalendar).toHaveBeenCalled());

    expect(mockFetchCalendar).toHaveBeenCalledWith("2024-02-01", "2024-02-07");

    const calendar = await screen.findByTestId("full-calendar");
    expect(calendar.getAttribute("data-events")).toContain("Event 1");
    expect(calendar.getAttribute("data-business-hours")).toContain("09:00");
    expect(calendar.getAttribute("data-timezone")).toBe("Asia/Kolkata");
  });

  it("shows validation error when working hours are invalid", async () => {
    renderWithTheme(<CalendarPage />);

    fireEvent.click(screen.getByText("Update Normal Working Hours"));

    const startTimeField = await screen.findByLabelText(/Start Time/i);
    const endTimeField = await screen.findByLabelText(/End Time/i);

    fireEvent.change(startTimeField, { target: { value: "18:00" } });
    fireEvent.change(endTimeField, { target: { value: "17:00" } });
    fireEvent.click(screen.getByText("Save Working Hours"));

    expect(await screen.findByText("Start time must be before end time")).toBeInTheDocument();
    expect(mockUpsertWorkingHours).not.toHaveBeenCalled();
  });
});
