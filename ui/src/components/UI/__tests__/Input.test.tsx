import { screen } from '@testing-library/react';
import GenericInput from '../Input/GenericInput';
import CustomFormInput from '../Input/CustomFormInput';
import { renderWithTheme } from '../../../test/testUtils';

jest.mock('../../i18n', () => ({}), { virtual: true });
jest.mock('i18next', () => {
  const fake = {
    use: () => fake,
    init: () => undefined,
  };
  return fake;
}, { virtual: true });
jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({}),
}), { virtual: true });

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `t:${key}`,
  }),
}), { virtual: true });

describe('GenericInput', () => {
  it('translates labels using i18next', () => {
    renderWithTheme(
      <GenericInput label="input.label" fullWidth />,
    );

    expect(screen.getByLabelText('t:input.label')).toBeInTheDocument();
  });
});

describe('CustomFormInput', () => {
  const register = jest.fn(() => ({
    name: 'name',
    onBlur: jest.fn(),
    onChange: jest.fn(),
    ref: jest.fn(),
  }));

  afterEach(() => {
    register.mockClear();
  });

  it('registers the field with computed validation rules', () => {
    const errors = { name: { message: 'Name is required' } } as any;

    renderWithTheme(
      <CustomFormInput
        register={register as any}
        errors={errors}
        control={undefined as any}
        name="name"
        label="Name"
        required
        showLabel
      />,
    );

    expect(register).toHaveBeenCalledWith('name', expect.objectContaining({ required: 'Please fill the Name' }));
    expect(screen.getAllByText('t:Name')[0]).toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('omits the required validation when the field is disabled', () => {
    renderWithTheme(
      <CustomFormInput
        register={register as any}
        errors={{}}
        control={undefined as any}
        name="description"
        label="Description"
        required
        disabled
      />,
    );

    expect(register).toHaveBeenCalledWith('description', {});
  });
});
