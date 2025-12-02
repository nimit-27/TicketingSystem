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
    expect(config.headers["Authorization"]).toBe("Bearer token-123");
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

    expect(authTokenMock.clearStoredToken).toHaveBeenCalled();
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
});

describe("CategoryService", () => {
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

describe("NotificationService", () => {
  it("fetches and marks notifications", async () => {
    const service = await import("../NotificationService");
    await service.fetchNotifications(2, 15);
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
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/comments"), "hello", { headers: { "Content-Type": "text/plain" } });
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/tickets/10/comments?count=5"));
    expect(axiosMock.put).toHaveBeenCalledWith(expect.stringContaining("/tickets/comments/comment-1"), "update", { headers: { "Content-Type": "text/plain" } });
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/tickets/comments/comment-1"));
  });

  it("constructs search query parameters", async () => {
    const service = await import("../TicketService");
    await service.searchTicketsPaginated("query", "OPEN", true, 2, 10, "assignee", "level1", "assigner", "requestor", "createdAt", "desc", "HIGH", "creator", "2024-01-01", "2024-02-01", "cat", "sub");
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
    expect(url).toContain("fromDate=2024-01-01");
    expect(url).toContain("toDate=2024-02-01");
    expect(url).toContain("category=cat");
    expect(url).toContain("subCategory=sub");
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

    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users/1"));
    expect(axiosMock.get).toHaveBeenCalledWith(expect.stringContaining("/users"));
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/users/by-roles"), ["ADMIN"]);
    expect(axiosMock.post).toHaveBeenCalledWith(expect.stringContaining("/users"), expect.any(Object));
    expect(axiosMock.post).toHaveBeenCalledWith(
      expect.stringContaining("/users/admin"),
      expect.objectContaining({ username: "testuser" })
    );
    expect(axiosMock.delete).toHaveBeenCalledWith(expect.stringContaining("/users/2"));
  });
});
