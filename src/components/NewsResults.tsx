import React from 'react';
import type { TranslatedNewsArticle, NewsSearchResult } from '../types';

interface NewsResultsProps {
  result: NewsSearchResult;
  articles: TranslatedNewsArticle[];
  selectedLanguage?: string;
  onDownloadHTML: () => void;
  onDownloadPDF: () => void;
  isDownloading: boolean;
}

const NewsResults: React.FC<NewsResultsProps> = ({
  result,
  articles,
  selectedLanguage,
  onDownloadHTML,
  onDownloadPDF,
  isDownloading,
}) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 배너 이미지 */}
      {result.bannerImage && (
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={result.bannerImage}
            alt={result.keyword}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* 결과 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{result.keyword}</h2>
            <p className="text-gray-600 mt-1">
              {articles.length}개의 뉴스 기사 {selectedLanguage && `(${selectedLanguage})`}
            </p>
          </div>

          {/* 다운로드 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={onDownloadHTML}
              disabled={isDownloading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              HTML
            </button>

            <button
              onClick={onDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              PDF
            </button>
          </div>
        </div>

        {isDownloading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-700 flex items-center">
              <svg
                className="animate-spin mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              파일 생성 중...
            </p>
          </div>
        )}
      </div>

      {/* 뉴스 기사 목록 */}
      <div className="space-y-6">
        {articles.map((article, index) => (
          <article
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span className="font-semibold text-blue-600">{article.source.name}</span>
                <span>•</span>
                <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.translatedTitle || article.title}
                </a>
              </h3>

              <p className="text-gray-600 leading-relaxed mb-4">
                {article.translatedDescription || article.description}
              </p>

              {(article.translatedContent || article.content) && (
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.translatedContent || article.content}
                </p>
              )}

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                원문 읽기
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsResults;
