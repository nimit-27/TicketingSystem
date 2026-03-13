import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssigneeFilterDropdown from '../AssigneeFilterDropdown';
import { useApi } from '../../../hooks/useApi';
import { getAllLevels, getAllUsersByLevel } from '../../../services/LevelService';
import { getAllUsers } from '../../../services/UserService';

jest.mock('../../../hooks/useApi');
jest.mock('../../../services/LevelService');
jest.mock('../../../services/UserService');

jest.mock('@mui/material', () => {
    const actual = jest.requireActual('@mui/material');
    return {
        ...actual,
        Menu: ({ open, children }: any) => (open ? <div data-testid="assignee-menu">{children}</div> : null),
        Tooltip: ({ children }: any) => <>{children}</>,
    };
});

jest.mock('../../UI/UserAvatar/UserAvatar', () => ({
    __esModule: true,
    default: ({ name, onClick }: any) => (
        <button data-testid="assignee-avatar" onClick={onClick}>
            {name}
        </button>
    ),
}));

const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;

describe('AssigneeFilterDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const levelsHandler = jest.fn(async (fn) => fn());
        const usersByLevelHandler = jest.fn(async (fn) => fn());
        const allUsersHandler = jest.fn(async (fn) => fn());

        const responses = [
            {
                data: [
                    { levelId: 'L1', levelName: 'Level 1' },
                    { levelId: 'L2', levelName: 'Level 2' },
                ],
                apiHandler: levelsHandler,
            },
            {
                data: [
                    { userId: '3', username: 'level.user', name: 'Level User', roles: '8', levels: ['L1'] },
                ],
                apiHandler: usersByLevelHandler,
            },
            {
                data: [
                    { userId: '1', username: 'allowed.user', name: 'Allowed User', roles: '3|5', levels: ['L1', 'L2'] },
                    { userId: '2', username: 'blocked.user', name: 'Blocked User', roles: '5', levels: ['L1'] },
                ],
                apiHandler: allUsersHandler,
            },
        ];
        let index = 0;
        mockUseApi.mockImplementation(() => {
            const response = responses[index % 3];
            index += 1;
            return response as any;
        });
    });

    it('loads levels/users, filters by role, searches, and selects from all users', async () => {
        const onChange = jest.fn();
        render(<AssigneeFilterDropdown value="All" onChange={onChange} />);

        await waitFor(() => expect(getAllLevels).toHaveBeenCalledTimes(1));
        expect(getAllUsers).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByTestId('assignee-menu')).toBeInTheDocument();
        expect(screen.getAllByText('Allowed User').length).toBeGreaterThan(0);
        expect(screen.queryByText('Blocked User')).not.toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText('Search'), 'allowed.user');
        expect(screen.getAllByText('Allowed User').length).toBeGreaterThan(0);

        await userEvent.click(screen.getAllByText('Allowed User')[0]);
        expect(onChange).toHaveBeenCalledWith('allowed.user');
    });

    it('shows avatar for selected value, resolves selected label, and handles level/all chips', async () => {
        const onChange = jest.fn();
        render(<AssigneeFilterDropdown value="allowed.user" onChange={onChange} />);

        expect(await screen.findByTestId('assignee-avatar')).toHaveTextContent('Allowed User');

        await userEvent.click(screen.getByTestId('assignee-avatar'));
        await userEvent.click(screen.getAllByRole('button', { name: 'L1' })[0]);

        await waitFor(() => expect(getAllUsersByLevel).toHaveBeenCalledWith('L1'));
        expect(await screen.findByText('Level User')).toBeInTheDocument();

        await userEvent.click(screen.getByText('All'));
        expect(onChange).toHaveBeenCalledWith('All');
    });
});
