import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../FileUpload';
import { renderWithTheme } from '../../../test/testUtils';

describe('FileUpload', () => {
  const originalCreateObjectURL = global.URL?.createObjectURL;
  const originalRevokeObjectURL = global.URL?.revokeObjectURL;

  beforeAll(() => {
    // @ts-expect-error jsdom type
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    // @ts-expect-error jsdom type
    global.URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    if (originalCreateObjectURL) {
      // @ts-expect-error jsdom type
      global.URL.createObjectURL = originalCreateObjectURL;
    } else {
      // @ts-expect-error jsdom type
      delete global.URL.createObjectURL;
    }

    if (originalRevokeObjectURL) {
      // @ts-expect-error jsdom type
      global.URL.revokeObjectURL = originalRevokeObjectURL;
    } else {
      // @ts-expect-error jsdom type
      delete global.URL.revokeObjectURL;
    }
  });

  it('accepts files within the size limit and notifies parent', async () => {
    const onFilesChange = jest.fn();
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    const { container } = renderWithTheme(
      <FileUpload maxSizeMB={5} onFilesChange={onFilesChange} attachments={[]} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      await userEvent.upload(input, file);
    });

    expect(onFilesChange).toHaveBeenCalledWith([file]);
  });

  it('shows an error when a file exceeds the size limit', async () => {
    const largeBuffer = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });

    const { container } = renderWithTheme(
      <FileUpload maxSizeMB={2} attachments={[]} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      await userEvent.upload(input, largeFile);
    });

    expect(screen.getByText(/Max upload size exceeded/)).toBeInTheDocument();
  });

  it('shows an error when the file type is not supported', async () => {
    const unsupportedFile = new File(['payload'], 'script.exe', { type: 'application/octet-stream' });

    const { container } = renderWithTheme(
      <FileUpload maxSizeMB={2} attachments={[]} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      await userEvent.upload(input, unsupportedFile);
    });

    expect(screen.getByText(/File not supported/)).toBeInTheDocument();
  });

  it('allows removing previously selected files', async () => {
    const onFilesChange = jest.fn();
    const file = new File(['bye'], 'bye.png', { type: 'image/png' });

    const { container } = renderWithTheme(
      <FileUpload maxSizeMB={5} onFilesChange={onFilesChange} attachments={[file]} />,
    );

    const removeButton = container.querySelector('.remove-icon') as HTMLElement;
    removeButton.style.display = 'block';
    fireEvent.click(removeButton);

    expect(onFilesChange).toHaveBeenCalledWith([]);
  });
});
