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

// 뉴스 관련 타입 정의
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

export interface NewsSearchParams {
  keyword: string;
  country?: string;
  language?: string;
}

export interface TranslatedNewsArticle extends NewsArticle {
  translatedTitle?: string;
  translatedDescription?: string;
  translatedContent?: string;
}

export interface NewsSearchResult {
  articles: NewsArticle[];
  keyword: string;
  country?: string;
  language?: string;
  searchedAt: Date;
  bannerImage?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
