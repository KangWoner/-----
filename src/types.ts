export interface Problem {
  id: string;
  title: string;
  description: string;
}

export interface SubmissionFormData {
  name: string;
  date: string;
  answers: { [key: string]: string };
}

export interface Submission {
  id: string;
  submittedAt: Date;
  name: string;
  date: string;
  answers: { [key: string]: string };
  problems: Problem[];
  evaluation: string;
  isSavedToDrive: boolean;
  driveSheetUrl?: string;
}
