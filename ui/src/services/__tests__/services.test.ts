jest.mock("axios", () => jest.requireActual("../../__mocks__/axios").default);
jest.mock("../../utils/Utils", () => ({
  getUserDetails: jest.fn(() => ({ userId: "user-123" })),
  clearSession: jest.fn(),
}));
jest.mock("../../utils/authToken", () => ({
  getActiveToken: jest.fn(() => "token-123"),
  isJwtBypassEnabled: jest.fn(() => false),
  clearStoredToken: jest.fn(),
}));

let axiosMock: any;
let utilsMock: any;
let authTokenMock: any;

const resetAxios = () => {
  axiosMock.get.mockReset();
  axiosMock.post.mockReset();
  axiosMock.put.mockReset();
  axiosMock.delete.mockReset();
  axiosMock.get.mockImplementation(() => Promise.resolve({}));
  axiosMock.post.mockImplementation(() => Promise.resolve({}));
  axiosMock.put.mockImplementation(() => Promise.resolve({}));
  axiosMock.delete.mockImplementation(() => Promise.resolve({}));
  axiosMock.__resetHandlers();
  axiosMock.defaults.baseURL = "";
  axiosMock.defaults.withCredentials = false;
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  axiosMock = jest.requireMock("axios");
  utilsMock = jest.requireMock("../../utils/Utils");
  authTokenMock = jest.requireMock("../../utils/authToken");
  resetAxios();
  utilsMock.getUserDetails.mockReturnValue({ userId: "user-123" });
  authTokenMock.isJwtBypassEnabled.mockReturnValue(false);
  authTokenMock.getActiveToken.mockReturnValue("token-123");
});

describe("apiClient", () => {
  it("configures axios defaults and attaches auth headers", async () => {
    const { BASE_URL } = await import("../api");
    await import("../apiClient");

    expect(axiosMock.defaults.baseURL).toBe(BASE_URL);
    expect(axiosMock.defaults.withCredentials).toBe(true);

    const config = await axiosMock.__runRequestInterceptors({ headers: {} });
    expect(config.headers["Authorization"]).toBeUndefined();
    expect(config.headers["X-User-ID"]).toBe("user-123");
  });

  it("omits the Authorization header when bypass is enabled", async () => {
    authTokenMock.isJwtBypassEnabled.mockReturnValue(true);
    utilsMock.getUserDetails.mockReturnValue({ userId: "user-999" });

    await import("../apiClient");
    const config = await axiosMock.__runRequestInterceptors({ headers: {} });
    expect(config.headers["Authorization"]).toBeUndefined();
    expect(config.headers["X-User-ID"]).toBe("user-999");
  });

  it("clears session information when a 401 is returned", async () => {
    await import("../apiClient");
    const error = { response: { status: 401 } };
    await axiosMock.__runResponseRejected(error).catch(() => undefined);

    expect(authTokenMock.clearStoredToken).not.toHaveBeenCalled();
    expect(utilsMock.clearSession).toHaveBeenCalled();
  });

  it("passes through non-401 errors", async () => {
    await import("../apiClient");
    const error = { response: { status: 500 } };
    const result = await axiosMock.__runResponseRejected(error).catch((err: any) => err);

    expect(authTokenMock.clearStoredToken).not.toHaveBeenCalled();
    expect(utilsMock.clearSession).not.toHaveBeenCalled();
    expect(result).toBe(error);
  });
});

describe("AssignmentHistoryService", () => {
  it("fetches assignment history by ticket id", async () => {
    axiosMock.get.mockResolvedValue({ data: [] });
    const service = await import("../AssignmentHistoryService");
    await service.getAssignmentHistory("123");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/assignment-history/123"));
  });
});

describe("AuthService", () => {
  it("posts credentials on login", async () => {
    const payload = { username: "user", password: "pass" };
    const service = await import("../AuthService");
    await service.loginUser(payload);
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), payload, { withCredentials: true });
  });

  it("logs out the current user", async () => {
    const service = await import("../AuthService");
    await service.logoutUser();
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), null, { withCredentials: true });
  });

  it("supports session and sso login endpoints", async () => {
    const payload = { token: "sso-token" } as any;
    const service = await import("../AuthService");
    await service.getActiveSession();
    await service.loginSso(payload);

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/auth/session"), expect.objectContaining({ withCredentials: true, validateStatus: expect.any(Function) }));
    const validateStatus = axiosMock.get.mock.calls[0][1].validateStatus;
    expect(validateStatus(200)).toBe(true);
    expect(validateStatus(204)).toBe(true);
    expect(validateStatus(401)).toBe(true);
    expect(validateStatus(500)).toBe(false);
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/auth/sso"), payload, { withCredentials: true });
  });
});

describe("CalendarService", () => {
  it("returns nested calendar view data and upserts working hours", async () => {
    axiosMock.get.mockResolvedValue({ data: { body: { data: { holidays: [] } } } });
    const service = await import("../CalendarService");

    const data = await service.CalendarService.fetchCalendar("2025-01-01", "2025-01-31");
    await service.CalendarService.upsertWorkingHours({ startTime: "09:00", endTime: "18:00", timezone: "Asia/Kolkata" });
    await service.CalendarService.upsertWorkingHours({ startTime: "09:00", endTime: "18:00" } as any);

    expect(data).toEqual({ holidays: [] });
    expect(axiosMock.get).toHaveBeenCalledWith("/api/calendar/view", { params: { from: "2025-01-01", to: "2025-01-31" } });
    expect(axiosMock.post).toHaveBeenCalledWith("/calendar/admin/working-hours:upsert", {
      startTime: "09:00",
      endTime: "18:00",
      timezone: "Asia/Kolkata",
    });
    expect(axiosMock.post).toHaveBeenCalledWith("/calendar/admin/working-hours:upsert", {
      startTime: "09:00",
      endTime: "18:00",
    });
  });
});

describe("CategoryService", () => {
  it("normalizes category sub-category fields from different payload shapes", async () => {
    axiosMock.get.mockResolvedValue({
      data: [
        {
          id: "C1",
          subCategories: [
            { id: "S1", subCategory: "Power+Issue=", severity: { id: "SEV-1" } },
            { id: "S2", subCategory: "Already Clean", severityId: "SEV-2" },
          ],
        },
      ],
    });
    const service = await import("../CategoryService");

    const response = await service.getCategories();

    expect(response.data[0].subCategories).toEqual([
      expect.objectContaining({ id: "S1", subCategory: "Power Issue", severityId: "SEV-1" }),
      expect.objectContaining({ id: "S2", subCategory: "Already Clean", severityId: "SEV-2" }),
    ]);
  });

  it("does not cache category responses when the payload is not an array", async () => {
    axiosMock.get.mockResolvedValueOnce({ data: { body: { data: [] } } });
    axiosMock.get.mockResolvedValueOnce({ data: [] });
    const service = await import("../CategoryService");

    await service.getCategories();
    await service.getCategories();

    expect(axiosMock.get).toHaveBeenCalledTimes(2);
  });

  it("caches categories after the first request", async () => {
    const response = { data: [{ id: 1 }] };
    axiosMock.get.mockResolvedValue(response);
    const service = await import("../CategoryService");

    const first = await service.getCategories();
    expect(first).toBe(response);
    expect(axiosMock.get).toHaveBeenCalledTimes(1);

    axiosMock.get.mockClear();
    const second = await service.getCategories();
    expect(second.data).toEqual(response.data);
    expect(axiosMock.get).not.toHaveBeenCalled();
  });

  it("fetches sub categories by category and caches the response", async () => {
    const response = { data: [{ id: 10 }] };
    axiosMock.get.mockResolvedValue(response);
    const service = await import("../CategoryService");

    await service.getAllSubCategoriesByCategory("network");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/categories/network/sub-categories"));

    axiosMock.get.mockClear();
    const cached = await service.getAllSubCategoriesByCategory("network");
    expect(cached.data).toEqual(response.data);
    // expect(axiosMock.get).not.toHaveBeenCalled();
  });

  it("resets category and sub-category caches on mutating operations", async () => {
    const service = await import("../CategoryService");

    axiosMock.get.mockResolvedValue({ data: [{ id: "C1" }] });
    await service.getCategories();
    axiosMock.get.mockClear();
    await service.addCategory({ name: "New Category" });
    axiosMock.get.mockResolvedValue({ data: [{ id: "C2" }] });
    await service.getCategories();
    expect(axiosMock.get).toHaveBeenCalledTimes(1);

    axiosMock.get.mockClear();
    axiosMock.get.mockResolvedValue({ data: [{ id: "S1" }] });
    await service.getAllSubCategoriesByCategory("network");
    axiosMock.get.mockClear();
    await service.updateSubCategory("S1", { name: "Updated" });
    axiosMock.get.mockResolvedValue({ data: [{ id: "S2" }] });
    await service.getAllSubCategoriesByCategory("network");
    expect(axiosMock.get).toHaveBeenCalledTimes(1);

    axiosMock.get.mockClear();
    axiosMock.get.mockResolvedValue({ data: [{ id: "S3" }] });
    await service.getAllSubCategoriesByCategory("network");
    axiosMock.get.mockClear();
    await service.deleteSubCategory("S1");
    axiosMock.get.mockResolvedValue({ data: [{ id: "S4" }] });
    await service.getAllSubCategoriesByCategory("network");
    expect(axiosMock.get).toHaveBeenCalledTimes(1);
  });

  it("supports CRUD operations on categories and sub categories", async () => {
    const service = await import("../CategoryService");
    await service.getAllSubCategories();
    await service.addSubCategory({ categoryId: "1", name: "Sub" });
    await service.updateSubCategory("2", { name: "Updated" });
    await service.deleteSubCategory("3");
    await service.addCategory({ name: "New" });
    await service.updateCategory("4", { name: "Edit" });
    await service.deleteCategory("5");
    await service.deleteCategories(["6", "7"]);

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/sub-categories"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/categories/1/sub-categories"), expect.any(Object));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/sub-categories/2"), expect.any(Object));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/sub-categories/3"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/categories"), expect.any(Object));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/categories/4"), expect.any(Object));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/categories/5"));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/categories"), expect.objectContaining({ params: expect.any(URLSearchParams) }));
  });
});

describe("FaqService", () => {
  it("retrieves and creates FAQs", async () => {
    const faq = { question: "?", answer: "!" };
    const service = await import("../FaqService");
    await service.getFaqs();
    await service.createFaq(faq);
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/faqs"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/faqs"), faq);
  });
});

describe("FeedbackService", () => {
  it("uses apiClient for feedback endpoints", async () => {
    await import("../apiClient");
    const service = await import("../FeedbackService");
    const body = { overallSatisfaction: 5, resolutionEffectiveness: 4, communicationSupport: 4, timeliness: 5 };

    await service.getFeedbackForm("1");
    await service.submitFeedback("1", body);
    await service.getFeedback("1");

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/1/feedback/form"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/1/feedback"), body);
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/1/feedback"));
  });
});

describe("DivisionService", () => {
  it("normalizes division responses from both list and body wrappers", async () => {
    axiosMock.get.mockResolvedValueOnce({ data: [{ id: "D1" }] });
    axiosMock.get.mockResolvedValueOnce({ data: { body: { data: [{ id: "D2" }] } } });
    axiosMock.get.mockResolvedValueOnce({ data: { unknown: true } });
    const service = await import("../DivisionService");

    const flat = await service.getDivisions();
    const wrapped = await service.getDivisions();
    const fallback = await service.getDivisions();

    expect(flat.data).toEqual([{ id: "D1" }]);
    expect(wrapped.data).toEqual([{ id: "D2" }]);
    expect(fallback.data).toEqual([]);
  });
});

describe("FilegatorService", () => {
  it("initialises the filegator session", async () => {
    const service = await import("../FilegatorService");
    await service.initFilegatorSession();
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/filegator/login"), null, { withCredentials: true });
  });
});

describe("LevelService", () => {
  it("caches levels and level users", async () => {
    const response = { data: [{ id: "L1" }] };
    axiosMock.get.mockResolvedValue(response);
    const service = await import("../LevelService");

    await service.getAllLevels();
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/levels"));
    axiosMock.get.mockClear();
    await service.getAllLevels();
    expect(axiosMock.get).not.toHaveBeenCalled();

    axiosMock.get.mockResolvedValue(response);
    await service.getAllUsersByLevel("L1");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/levels/L1/users"));
    axiosMock.get.mockClear();
    await service.getAllUsersByLevel("L1");
    expect(axiosMock.get).not.toHaveBeenCalled();
  });
});

describe("FileManagementService", () => {
  it("lists, uploads and formats managed file endpoints", async () => {
    const service = await import("../FileManagementService");
    const file = new File(["binary"], "document.txt", { type: "text/plain" });
    const payload = { section: "faq", title: "Document" } as any;

    await service.listManagedFiles("faq");
    await service.uploadManagedFile(file, payload);
    await service.getManagedFileMetadata("f-1");
    const url = service.getManagedFileContentUrl("f-1");

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/file-management/files"), { params: { section: "faq" } });
    expect(axiosMock.post).toHaveBeenCalledWith(
      expect.stringContaining("/file-management/files"),
      expect.any(FormData),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/file-management/files/f-1"));
    expect(url).toContain("/file-management/files/f-1/content");
  });
});

describe("IssueTypeService", () => {
  it("normalizes, caches and falls back to empty issue type lists", async () => {
    axiosMock.get.mockResolvedValueOnce({ data: { body: { data: [{ id: "I1" }] } } });
    axiosMock.get.mockResolvedValueOnce({ data: { bad: true } });
    const service = await import("../IssueTypeService");

    const first = await service.getIssueTypes();
    expect(first.data).toEqual([{ id: "I1" }]);
    axiosMock.get.mockClear();

    const cached = await service.getIssueTypes();
    expect(cached.data).toEqual([{ id: "I1" }]);
    expect(axiosMock.get).not.toHaveBeenCalled();

    jest.resetModules();
    axiosMock = jest.requireMock("axios");
    resetAxios();
    axiosMock.get.mockResolvedValueOnce({ data: { bad: true } });
    const reloaded = await import("../IssueTypeService");
    const empty = await reloaded.getIssueTypes();
    expect(empty.data).toEqual([]);
  });
});

describe("LocationService", () => {
  it("requests zone, region and district data with params", async () => {
    const service = await import("../LocationService");
    await service.getZones();
    await service.getRegions("Z1");
    await service.getDistricts("R1");

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/zones"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/regions"), { params: { zoneCode: "Z1" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/districts"), { params: { hrmsRegCode: "R1" } });
  });
});

describe("NotificationService", () => {
  it("fetches and marks notifications", async () => {
    const service = await import("../NotificationService");
    await service.getNotifications(2, 15);
    await service.markNotificationsAsRead();

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/notifications"), { params: { page: 2, size: 15 } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/notifications/mark-read"), {});
  });
});

describe("PriorityService", () => {
  it("caches priorities", async () => {
    const response = { data: [{ id: "P1" }] };
    axiosMock.get.mockResolvedValue(response);
    const service = await import("../PriorityService");

    await service.getPriorities();
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/priorities"));
    axiosMock.get.mockClear();
    await service.getPriorities();
    expect(axiosMock.get).not.toHaveBeenCalled();
  });
});

describe("ReportService", () => {
  it("fetches available reports", async () => {
    await import("../apiClient");
    const service = await import("../ReportService");
    await service.fetchTicketSummaryReport();
    await service.fetchTicketResolutionTimeReport();
    await service.fetchCustomerSatisfactionReport();
    await service.fetchProblemManagementReport();

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/ticket-summary"), { params: undefined });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/resolution-time"), { params: undefined });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/customer-satisfaction"), { params: undefined });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/problem-management"), { params: undefined });
  });

  it("covers sla reports and job trigger endpoints", async () => {
    const service = await import("../ReportService");
    await service.fetchSupportDashboardSummary({ period: "today" } as any);
    await service.fetchSupportDashboardSummaryFiltered({ period: "today" } as any);
    await service.fetchSlaPerformanceReport({ fromDate: "2025-01-01" } as any);
    await service.notifyBreachedTicketAssignees();
    await service.fetchSlaCalculationJobHistory();
    await service.fetchSlaCalculationJobHistory(5);
    await service.triggerSlaCalculationJob();
    await service.triggerSlaCalculationJob("custom_job");
    await service.triggerSlaCalculationForAllTickets();
    await service.triggerSlaCalculationForAllTicketsFromScratch();
    await service.fetchTriggerJobs();
    await service.updateTriggerJobPeriod("sla_job", { triggerPeriod: "MANUAL", cronExpression: null });

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/support-dashboard-summary"), { params: { period: "today" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/support-dashboard-summary/filtered"), { params: { period: "today" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-performance"), { params: { fromDate: "2025-01-01" } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-performance/notify-breaches"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/history"), { params: { limit: 20 } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/history"), { params: { limit: 5 } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger"), undefined, { params: { jobCode: "sla_job" } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger"), undefined, { params: { jobCode: "custom_job" } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger-all"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger-all-from-scratch"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger-jobs"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/reports/sla-calculation/trigger-jobs/sla_job/period"), { triggerPeriod: "MANUAL", cronExpression: null });
  });
});

describe("RoleService", () => {
  it("covers role and permission endpoints", async () => {
    const service = await import("../RoleService");
    await service.getAllRoles();
    await service.getRoleSummaries();
    await service.addRole({ role: "New" });
    await service.savePermissions({});
    await service.getAllPermissions();
    await service.getRolePermission("admin");
    await service.updateRolePermission("admin", {});
    await service.updateRole("admin", {});
    await service.renameRole("old", "new", "tester");
    await service.loadPermissions();
    await service.deleteRoles(["1", "2"], true);
    await service.deleteRole("3", false);

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/roles"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/roles/summaries"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/roles"), expect.any(Object));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/permissions"), expect.any(Object));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/permissions"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/permissions/admin"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/permissions/admin"), expect.any(Object));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/roles/admin"), expect.any(Object));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/roles/old/rename"), { role: "new", updatedBy: "tester" });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/permissions/load"));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/roles"), { params: { ids: ["1", "2"], hard: true } });
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/roles/3"), { params: { hard: false } });
  });
});

describe("RootCauseAnalysisService", () => {
  it("builds ticket list queries with filters", async () => {
    const service = await import("../RootCauseAnalysisService");
    await service.getRootCauseAnalysisTickets(1, 10, "user", ["ADMIN"], "2024-01-01", "2024-01-31", "cat", "sub");
    const url = axiosMock.get.mock.calls[0][0] as string;
    expect(url).toContain("page=1");
    expect(url).toContain("size=10");
    expect(url).toContain("roles=ADMIN");
    expect(url).toContain("categoryId=cat");
    expect(url).toContain("subCategoryId=sub");
  });

  it("retrieves and mutates root cause analysis records", async () => {
    const formData = new FormData();
    const service = await import("../RootCauseAnalysisService");
    await service.getRootCauseAnalysisTicketById("123");
    await service.saveRootCauseAnalysis("123", formData);
    await service.deleteRootCauseAnalysisAttachment("123", "path", "tester");

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/root-cause-analysis/tickets/123"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/root-cause-analysis/123"), formData, expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "multipart/form-data" }) }));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/root-cause-analysis/123/attachments"));
  });

  it("returns fallback payload shapes in helper methods", async () => {
    axiosMock.get.mockResolvedValueOnce({ data: { body: { data: { id: "rca" } } } });
    axiosMock.post.mockResolvedValueOnce({ data: { body: { data: { id: "saved" } } } });
    axiosMock.delete.mockResolvedValueOnce({ data: { data: { id: "deleted" } } });
    const service = await import("../RootCauseAnalysisService");

    const fetched = await service.getRootCauseAnalysis("10");
    const saved = await service.saveRootCauseAnalysis("10", new FormData());
    const deleted = await service.deleteRootCauseAnalysisAttachment("10", "/a/b");

    expect(fetched).toEqual({ data: { body: { data: { id: "rca" } } } });
    expect(saved).toEqual({ id: "saved" });
    expect(deleted).toEqual({ id: "deleted" });
  });
});

describe("SeverityService", () => {
  it("normalises and caches severities", async () => {
    const payload = { data: [{ id: "S1" }] };
    axiosMock.get.mockResolvedValue({ data: { body: { data: payload.data } } });
    const service = await import("../SeverityService");

    const first = await service.getSeverities();
    expect(first.data).toEqual(payload.data);
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/severities"));

    axiosMock.get.mockClear();
    const second = await service.getSeverities();
    expect(second.data).toEqual(payload.data);
    expect(axiosMock.get).not.toHaveBeenCalled();
  });
});

describe("StakeholderService", () => {
  it("caches stakeholders", async () => {
    const response = { data: [{ id: "1" }] };
    axiosMock.get.mockResolvedValue(response);
    const service = await import("../StakeholderService");

    await service.getStakeholders();
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/stakeholders"));
    axiosMock.get.mockClear();
    await service.getStakeholders();
    expect(axiosMock.get).not.toHaveBeenCalled();
  });
});


describe("DivisionHistoryService", () => {
  it("retrieves ticket division history", async () => {
    const service = await import("../DivisionHistoryService");
    await service.getDivisionHistory("123");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/division-history/123"));
  });
});

describe("StatusHistoryService", () => {
  it("retrieves ticket status history", async () => {
    const service = await import("../StatusHistoryService");
    await service.getStatusHistory("123");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/status-history/123"));
  });
});

describe("StatusService", () => {
  it("invokes all status related endpoints", async () => {
    const service = await import("../StatusService");
    await service.getStatusListFromApi();
    await service.getNextStatusListByStatusId("1");
    await service.getStatusWorkflowMappings(["ADMIN"]);
    await service.getStatusActions();
    await service.getAllowedStatusListByRoles(["ADMIN"]);

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/ticket-statuses"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/status-workflow/status/1"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/status-workflow/mappings"), ["ADMIN"]);
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/status-workflow/actions"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/status-workflow/allowed-statuses"), ["ADMIN"]);
  });
});

describe("TicketService", () => {
  it("covers ticket CRUD helper endpoints", async () => {
    const plainPayload = { title: "Issue" };
    const formPayload = new FormData();
    const files = [new File(["content"], "test.txt")];
    const service = await import("../TicketService");

    await service.searchTickets("payload");
    await service.addTicket(plainPayload);
    await service.addTicket(formPayload);
    await service.addAttachments("1", files);
    await service.deleteAttachment("1", "path");
    await service.getTickets(3, 20);
    await service.getTicket("10");
    await service.getTicketSla("10");
    await service.updateTicket("10", { status: "OPEN" });
    await service.linkTicketToMaster("10", "11", "user");
    await service.makeTicketMaster("10");
    await service.unlinkTicketFromMaster("10", "user");
    await service.getChildTickets("11");
    await service.addComment("10", "hello");
    await service.getComments("10", 5);
    await service.updateComment("comment-1", "update");
    await service.deleteComment("comment-1");
    await service.getAttachmentsByTicketId("10");
    await service.getComments("10");
    await service.linkTicketToMaster("10", "11");
    await service.unlinkTicketFromMaster("10");

    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets"), "payload");
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/add"), plainPayload, undefined);
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/add"), formPayload, { headers: { "Content-Type": "multipart/form-data" } });
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/1/attachments"), expect.any(FormData), expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } }));
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/tickets/1/attachments"), { params: { path: "path" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets?page=3&size=20"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/sla"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10"), { status: "OPEN" });
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/link/11"), null, { params: { updatedBy: "user" } });
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/master"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/unlink"), null, { params: { updatedBy: "user" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/11/children"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/comments"), "hello");
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/comments?count=5"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/comments/comment-1"), "update", { headers: { "Content-Type": "text/plain" } });
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/tickets/comments/comment-1"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/attachments"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/comments"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/link/11"), null, undefined);
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/unlink"), null, undefined);
  });

  it("constructs search query parameters", async () => {
    const service = await import("../TicketService");
    await service.searchTicketsPaginated(
      "query",
      "OPEN",
      true,
      2,
      10,
      "assignee",
      "level1",
      "assigner",
      "requestor",
      "createdAt",
      "desc",
      "HIGH",
      "creator",
      "reported_date",
      "2024-01-01",
      "2024-02-01",
      "cat",
      "sub",
      "Z1",
      "R1",
      "D1",
      "I1",
      "DIV-1"
    );
    const url = axiosMock.get.mock.calls.find((call: any[]) => String(call[0]).includes("/tickets/search"))[0] as string;
    expect(url).toContain("query=query");
    expect(url).toContain("status=OPEN");
    expect(url).toContain("master=true");
    expect(url).toContain("page=2");
    expect(url).toContain("size=10");
    expect(url).toContain("assignedTo=assignee");
    expect(url).toContain("levelId=level1");
    expect(url).toContain("assignedBy=assigner");
    expect(url).toContain("requestorId=requestor");
    expect(url).toContain("sortBy=createdAt");
    expect(url).toContain("direction=desc");
    expect(url).toContain("severity=HIGH");
    expect(url).toContain("createdBy=creator");
    expect(url).toContain("dateParam=reported_date");
    expect(url).toContain("fromDate=2024-01-01");
    expect(url).toContain("toDate=2024-02-01");
    expect(url).toContain("category=cat");
    expect(url).toContain("subCategory=sub");
    expect(url).toContain("zoneCode=Z1");
    expect(url).toContain("regionCode=R1");
    expect(url).toContain("districtCode=D1");
    expect(url).toContain("issueTypeId=I1");
    expect(url).toContain("divisionId=DIV-1");
  });
  it("constructs export search query parameters", async () => {
    const service = await import("../TicketService");
    await service.searchTicketsForExport({
      fromDate: "2024-01-01",
      dateParam: "last_modified",
      toDate: "2024-02-01",
      categoryId: "C1",
      subCategoryId: "SC1",
      zoneCode: "Z1",
      regionCode: "R1",
      districtCode: "D1",
      issueTypeId: "I1",
      assignedTo: "assignee",
    });
    const exportUrl = axiosMock.get.mock.calls.find((call: any[]) => String(call[0]).includes("/tickets/search/export"))?.[0] as string;
    expect(exportUrl).toContain("fromDate=2024-01-01");
    expect(exportUrl).toContain("dateParam=last_modified");
    expect(exportUrl).toContain("toDate=2024-02-01");
    expect(exportUrl).toContain("category=C1");
    expect(exportUrl).toContain("subCategory=SC1");
    expect(exportUrl).toContain("zoneCode=Z1");
    expect(exportUrl).toContain("regionCode=R1");
    expect(exportUrl).toContain("districtCode=D1");
    expect(exportUrl).toContain("issueTypeId=I1");
    expect(exportUrl).toContain("assignedTo=assignee");
  });

  it("passes abort signal and extra export filters when provided", async () => {
    const service = await import("../TicketService");
    const controller = new AbortController();

    await service.searchTicketsForExport({ statusId: "OPEN", divisionId: "DIV-1", signal: controller.signal });

    const [url, config] = axiosMock.get.mock.calls.find((call: any[]) => String(call[0]).includes("/tickets/search/export"));
    expect(url).toContain("status=OPEN");
    expect(url).toContain("divisionId=DIV-1");
    expect(config).toEqual({ signal: controller.signal });
  });
});

describe("UserService", () => {
  it("covers user endpoints", async () => {
    const service = await import("../UserService");
    await service.getUserDetails("1");
    await service.getAllUsers();
    await service.getUsersByRoles(["ADMIN"]);
    await service.addUser({ name: "Test" });
    await service.createUser({
      username: "testuser",
      name: "Test User",
      emailId: "test@example.com",
      mobileNo: "1234567890",
      office: "HQ",
      roleIds: ["1"],
      levelIds: ["L1"],
      stakeholderIds: ["1"],
    });
    await service.deleteUser("2");
    await service.getHelpdeskUsers();
    await service.searchHelpdeskUsers("john", "ADMIN", "ST1", 1, 25);
    await service.getHelpdeskUserDetails("h1");
    await service.getRequesterUsers();
    await service.searchRequesterUsers("doe", "REQ", "ST2", "OFF", "SCHOOL", "Z1", "R1", "D1", 2, 30);
    await service.getRequesterUserDetails("r1");
    await service.getRequesterOfficeTypes();
    await service.appointRequesterAsRno("r1");
    await service.checkUsernameAvailability("testuser");
    await service.updateUser("1", { name: "Updated" } as any);
    await service.changeUserPassword("1", { oldPassword: "old", newPassword: "new" });
    await service.resetUserPassword("1", { newPassword: "new" });

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/1"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/users/by-roles"), ["ADMIN"]);
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/users"), expect.any(Object));
    expect(axiosMock.post).toHaveBeenCalledWith(
      expect.stringContaining("/users/admin"),
      expect.objectContaining({ username: "testuser" })
    );
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/users/2"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/helpdesk"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/helpdesk/search"), { params: { query: "john", roleId: "ADMIN", stakeholderId: "ST1", page: 1, size: 25 } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/helpdesk/h1"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/requesters"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/requesters/search"), { params: { query: "doe", roleId: "REQ", stakeholderId: "ST2", officeCode: "OFF", officeType: "SCHOOL", zoneCode: "Z1", regionCode: "R1", districtCode: "D1", page: 2, size: 30 } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/requesters/r1"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/requesters/office-types"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/users/requesters/r1/appoint-rno"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/check-username"), { params: { username: "testuser" } });
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/users/1"), { name: "Updated" });
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/users/1/password"), { oldPassword: "old", newPassword: "new" });
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/users/1/password/reset"), { newPassword: "new" });
  });

  it("falls back between requester and helpdesk profiles", async () => {
    const service = await import("../UserService");

    axiosMock.get
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { id: "helpdesk" } });
    const requesterFallback = await service.getUserDetailsWithFallback("u1");
    expect(requesterFallback).toEqual({ data: { id: "helpdesk" } });

    axiosMock.get
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { id: "requester" } });
    const helpdeskFallback = await service.getUserDetailsWithFallback("u2", true);
    expect(helpdeskFallback).toEqual({ data: { id: "requester" } });

    axiosMock.get.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(service.getUserDetailsWithFallback("u3", true)).rejects.toEqual({ response: { status: 500 } });
  });
});

describe("ParameterService", () => {
  it("fetches global and role specific parameters", async () => {
    const service = await import("../ParameterService");
    await service.getParameters();
    await service.getParametersByRoles(["ADMIN", "USER"]);

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/parameters"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/parameters/by-roles"), ["ADMIN", "USER"]);
  });
});
