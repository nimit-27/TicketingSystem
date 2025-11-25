import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllChildrenChip from './AllChildrenChip';

jest.mock('@mui/material', () => ({
  __esModule: true,
  Chip: ({ label, onClick, disabled }: any) => (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled}>
      {label}
    </button>
  ),
}));

describe('AllChildrenChip', () => {
  it('renders the chip label and triggers click handler', async () => {
    const handleClick = jest.fn();

    render(<AllChildrenChip state="all" onClick={handleClick} />);

    const chip = screen.getByRole('button', { name: /all nodes/i });
    expect(chip).toBeInTheDocument();

    await userEvent.click(chip);

    expect(handleClick).toHaveBeenCalled();
  });

  it('respects the disabled state', () => {
    const handleClick = jest.fn();

    render(<AllChildrenChip state="none" onClick={handleClick} disabled />);

    const chip = screen.getByRole('button', { name: /all nodes/i });
    expect(chip).toBeDisabled();

    fireEvent.click(chip);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
