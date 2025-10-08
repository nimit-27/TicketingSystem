import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonEditModal from '../JsonEditModal';

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange?: (value?: string) => void }) => (
    <textarea
      data-testid="mock-monaco-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}), { virtual: true });

describe('JsonEditModal', () => {
  it('renders provided data and submits parsed json', async () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    render(
      <JsonEditModal
        open
        data={{ foo: 'bar' }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );

    const editor = screen.getByTestId('mock-monaco-editor') as HTMLTextAreaElement;
    expect(editor.value).toContain('"foo": "bar"');

    fireEvent.change(editor, { target: { value: '{"baz":"qux"}' } });

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({ baz: 'qux' });
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('alerts on invalid json and keeps modal open', async () => {
    const handleSubmit = jest.fn();
    const handleCancel = jest.fn();
    const originalAlert = window.alert;
    const alertMock = jest.fn();
    Object.defineProperty(window, 'alert', { configurable: true, writable: true, value: alertMock });

    render(
      <JsonEditModal
        open
        data={{ foo: 'bar' }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );

    const editor = screen.getByTestId('mock-monaco-editor');
    fireEvent.change(editor, { target: { value: '{invalid json' } });

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(alertMock).toHaveBeenCalledWith('Invalid JSON');
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId('mock-monaco-editor')).toBeInTheDocument();

    Object.defineProperty(window, 'alert', { configurable: true, writable: true, value: originalAlert });
  });

  it('invokes cancel handler when cancel button clicked', async () => {
    const handleCancel = jest.fn();
    render(
      <JsonEditModal
        open
        data={{ foo: 'bar' }}
        onSubmit={jest.fn()}
        onCancel={handleCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(handleCancel).toHaveBeenCalled();
  });
});
