import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ProblemGenerator from '../ProblemGenerator';
import * as driveService from '../../services/googleDriveService';

jest.mock('../../services/googleDriveService', () => ({
  uploadFileToDrive: jest.fn(),
}));

describe('ProblemGenerator', () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  it('uploads file and adds attachment to problem', async () => {
    const mockUpload = driveService.uploadFileToDrive as jest.Mock;
    mockUpload.mockResolvedValue({ url: 'https://drive.google.com/file/test' });

    const setActiveProblems = jest.fn();

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <ProblemGenerator setActiveProblems={setActiveProblems} isGoogleSignedIn={true} />
    );

    // enter problem description
    fireEvent.change(
      getByPlaceholderText(/예: 피타고라스의 정리를/),
      { target: { value: 'sample problem' } }
    );

    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(getByText('문제 생성'));

    await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(file));
    await waitFor(() => expect(setActiveProblems).toHaveBeenCalled());
    const problemsArg = setActiveProblems.mock.calls[0][0];
    expect(problemsArg[0].attachment).toEqual({ name: 'test.txt', url: 'https://drive.google.com/file/test' });
  });
});
