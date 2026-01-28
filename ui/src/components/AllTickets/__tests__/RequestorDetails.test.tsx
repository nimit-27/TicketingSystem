import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RequestorDetails from '../RequestorDetails';

describe('RequestorDetails', () => {
    const writeTextMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        writeTextMock.mockReset();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
        });
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it('renders provided username, email, and phone values', () => {
        render(<RequestorDetails username="johndoe" email="john@example.com" phone="1234567890" />);

        expect(screen.getByText('johndoe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    it('copies username to clipboard and shows confirmation', async () => {
        render(<RequestorDetails username="johndoe" email="john@example.com" phone="1234567890" />);

        const [usernameCopyIcon] = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(usernameCopyIcon);

        expect(writeTextMock).toHaveBeenCalledWith('johndoe');
        expect(screen.getByText('Username copied')).toBeInTheDocument();

        await act(async () => {
            jest.runAllTimers();
        });
        await waitFor(() => {
            expect(screen.queryByText('Username copied')).not.toBeInTheDocument();
        });
    });

    it('does not attempt to copy when value is missing', () => {
        render(<RequestorDetails phone="1234567890" />);

        const [usernameCopyIcon] = screen.getAllByTestId('ContentCopyIcon');
        fireEvent.click(usernameCopyIcon);

        expect(writeTextMock).not.toHaveBeenCalled();
        expect(screen.getByText('-')).toBeInTheDocument();
    });
});
