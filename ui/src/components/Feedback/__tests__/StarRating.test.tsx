import { renderWithTheme } from '../../../test/testUtils';

const mockRating = jest.fn(({ readOnly, onChange }: any) => (
  <button
    type="button"
    data-testid="mock-rating"
    disabled={readOnly}
    onClick={() => onChange?.({}, 3)}
  >
    rating
  </button>
));

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Rating: (props: any) => mockRating(props),
  };
});

const StarRating = require('../StarRating').default;

describe('StarRating', () => {
  beforeEach(() => {
    mockRating.mockClear();
  });

  it('displays the provided label and rating description', () => {
    const { getByText } = renderWithTheme(
      <StarRating label="Timeliness" value={4} readOnly />,
    );

    expect(getByText('Timeliness')).toBeInTheDocument();
    expect(getByText('Good')).toBeInTheDocument();
  });

  it('calls onChange when a new rating is selected', () => {
    const onChange = jest.fn();
    renderWithTheme(<StarRating label="Support" value={0} onChange={onChange} />);

    expect(mockRating).toHaveBeenCalled();
    const ratingProps = mockRating.mock.calls[0][0];
    ratingProps.onChange?.({}, 3);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when readOnly is true', () => {
    const onChange = jest.fn();
    renderWithTheme(<StarRating label="Support" value={3} onChange={onChange} readOnly />);

    expect(mockRating).toHaveBeenCalled();
    const ratingProps = mockRating.mock.calls[0][0];
    expect(ratingProps.readOnly).toBe(true);
    ratingProps.onChange?.({}, 4);

    expect(onChange).not.toHaveBeenCalled();
  });
});
