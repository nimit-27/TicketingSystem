import React from "react";
import userEvent from "@testing-library/user-event";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../test/testUtils";

const mockNavigate = jest.fn();
const mockShowMessage = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../context/SnackbarContext", () => ({
  useSnackbar: () => ({ showMessage: mockShowMessage }),
}));

jest.mock("@mui/material/TextField", () => (props: any) => {
  const { label, select, SelectProps = {}, onChange, value } = props;

  if (select) {
    return (
      <label>
        {label}
        <select
          aria-label={label}
          multiple={SelectProps.multiple}
          value={SelectProps.value ?? value ?? ""}
          onChange={(event) => (SelectProps.onChange ?? onChange)?.(event)}
        />
      </label>
    );
  }

  return (
    <label>
      {label}
      <input aria-label={label} value={value ?? ""} onChange={onChange} />
    </label>
  );
});

import AddUser from "../AddUser";

const createApiMock = (data: unknown, apiHandler?: jest.Mock) => ({
  data,
  pending: false,
  error: null,
  success: true,
  apiHandler: apiHandler || jest.fn(() => Promise.resolve(data)),
});

const rolesResponse = [{ roleId: 1, role: "Admin" }];
const stakeholdersResponse = [{ id: 10, description: "Stakeholder" }];
const levelsResponse = [
  { levelId: "L1", levelName: "Level 1" },
  { levelId: "L2", levelName: "Level 2" },
];
const roleLevelsResponse = [{ roleId: 1, levelIds: ["L1"] }];

let mockApiQueue: ReturnType<typeof createApiMock>[] = [];
let checkUsernameApiHandler: jest.Mock | null = null;

jest.mock("../../hooks/useApi", () => ({
  useApi: () => {
    if (mockApiQueue.length === 0) {
      return createApiMock(null);
    }
    return mockApiQueue.shift() as ReturnType<typeof createApiMock>;
  },
}));

jest.mock("../../services/RoleService", () => ({
  getRoleSummaries: jest.fn(() => Promise.resolve(rolesResponse)),
  getRoleLevels: jest.fn(() => Promise.resolve(roleLevelsResponse)),
}));

jest.mock("../../services/StakeholderService", () => ({
  getStakeholders: jest.fn(() => Promise.resolve(stakeholdersResponse)),
}));

jest.mock("../../services/LevelService", () => ({
  getAllLevels: jest.fn(() => Promise.resolve(levelsResponse)),
}));

jest.mock("../../services/UserService", () => ({
  checkUsernameAvailability: jest.fn(() => Promise.resolve({ available: true })),
  createUser: jest.fn(() => Promise.resolve({ name: "John" })),
}));

describe("AddUser", () => {
  beforeEach(() => {
    checkUsernameApiHandler = jest.fn((fn?: () => Promise<any>) => Promise.resolve(fn ? fn() : { available: true }));
    mockApiQueue = [
      createApiMock(rolesResponse),
      createApiMock(stakeholdersResponse),
      createApiMock(levelsResponse),
      createApiMock(roleLevelsResponse),
      createApiMock(null),
      createApiMock(null, checkUsernameApiHandler),
    ];
  });

  it("renders the add user form heading", () => {
    renderWithTheme(<AddUser />);

    expect(screen.getByText("Add New User")).toBeInTheDocument();
    expect(screen.getByText("Provide complete details to create a new user account.")).toBeInTheDocument();
  });

});
