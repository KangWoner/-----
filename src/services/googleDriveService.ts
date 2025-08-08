import type { Submission } from '../types';

// ===================================================================================
// IMPORTANT MOCK IMPLEMENTATION
// ===================================================================================
// This is a MOCK service for demonstration purposes. A real implementation would
// require using the Google API Client Library for JavaScript (gapi) and Google
// Identity Services (gis) for authentication and API calls.
//
// Setting up Google Drive integration involves:
// 1. Creating a project in the Google Cloud Console.
// 2. Enabling the Google Drive API and Google Sheets API.
// 3. Creating OAuth 2.0 credentials (Client ID).
// 4. Configuring the OAuth consent screen.
// 5. Loading the `gapi` and `gis` scripts in your `index.html`.
// 6. Handling the complex OAuth 2.0 flow for user sign-in and token management.
// 7. Using the `gapi.client.sheets` methods to create and update spreadsheets.
// ===================================================================================

let isSignedIn = false;

/**
 * Simulates the Google Sign-In flow.
 */
export async function signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log("Attempting to sign in to Google...");
        // In a real app, this would trigger the Google Sign-In popup.
        const userAgrees = window.confirm(
            "이 앱이 Google Drive 파일 및 데이터에 접근하도록 허용하시겠습니까? (이것은 모의 프롬프트입니다)"
        );
        if (userAgrees) {
            console.log("Mock sign-in successful.");
            isSignedIn = true;
            resolve();
        } else {
            console.log("Mock sign-in cancelled by user.");
            reject(new Error("사용자가 Google 로그인을 거부했습니다."));
        }
    });
}

/**
 * Simulates signing out.
 */
export async function signOut(): Promise<void> {
  console.log("Signing out from Google...");
  isSignedIn = false;
  return Promise.resolve();
}

/**
 * Simulates saving submission data to a Google Sheet.
 * In a real implementation, this would create a new sheet or append to an existing one.
 * @returns A dummy URL to a Google Sheet.
 */
export async function saveSubmissionToSheet(submission: Submission): Promise<{ sheetUrl: string }> {
  console.log("Simulating save to Google Sheet for submission:", submission.id);

  if (!isSignedIn) {
    throw new Error("Google 계정에 로그인해야 합니다.");
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real app, you would use the Sheets API here.
  // For now, return a fake URL.
  const mockSheetId = `sheet_${Date.now()}`;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${mockSheetId}/edit#gid=0`;

  console.log(`Mock sheet created at: ${sheetUrl}`);

  return { sheetUrl };
}

/**
 * Simulates uploading a file to Google Drive.
 * Returns a dummy URL representing the uploaded file.
 */
export async function uploadFile(file: File): Promise<{ fileUrl: string }> {
  console.log("Simulating file upload to Google Drive:", file.name);

  if (!isSignedIn) {
    throw new Error("Google 계정에 로그인해야 합니다.");
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a fake Drive file URL
  const mockFileId = `file_${Date.now()}`;
  const fileUrl = `https://drive.google.com/file/d/${mockFileId}/view`;
  console.log(`Mock file uploaded at: ${fileUrl}`);

  return { fileUrl };
}
