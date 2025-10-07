import { fireEvent, screen } from '@testing-library/react';
import UserAvatar from '../UserAvatar/UserAvatar';
import { renderWithTheme } from '../../../test/testUtils';

describe('UserAvatar', () => {
  it('renders initials from the provided name', () => {
    renderWithTheme(<UserAvatar name="Jane Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('does not render initials when name is not provided', () => {
    renderWithTheme(<UserAvatar />);

    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('invokes onClick when provided', () => {
    const onClick = jest.fn();
    renderWithTheme(<UserAvatar name="John Smith" onClick={onClick} />);

    fireEvent.click(screen.getByText('JS'));

    expect(onClick).toHaveBeenCalled();
  });
});
