import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RemarkComponent from '../Remark/RemarkComponent';
import { renderWithTheme } from '../../../test/testUtils';

describe('RemarkComponent', () => {
  it('generates confirmation message based on action name', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    renderWithTheme(
      <RemarkComponent actionName="Resolve" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    expect(
      screen.getByText('If you are sure you want to Resolve the ticket, please add a remark and submit'),
    ).toBeInTheDocument();
  });

  it('submits and resets remark in inline mode', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithTheme(
      <RemarkComponent actionName="Close" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '  All done  ');

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith('All done');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('resets remark and notifies cancel handler', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    renderWithTheme(
      <RemarkComponent defaultRemark="Existing" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Existing');
  });

  it('renders as a modal dialog when requested', () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    renderWithTheme(
      <RemarkComponent
        isModal
        open
        title="Add Remark"
        actionName="Reopen"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Add Remark')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });


  it('limits remark input to 255 characters', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    renderWithTheme(
      <RemarkComponent actionName="Close" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'a'.repeat(300));

    expect((input as HTMLInputElement).value).toHaveLength(255);
    expect(screen.getByText('255/255')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith('a'.repeat(255));
  });

  it('blocks empty remarks', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    renderWithTheme(
      <RemarkComponent actionName="Close" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '   ');

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Remark cannot be empty.')).toBeInTheDocument();
  });
});
