import React, { useState } from 'react';
import type { NewsSearchResult, NewsArticle, TranslatedNewsArticle } from './types';
import { searchNews } from './services/newsService';
import { translateArticles } from './services/translationService';
import { generateBannerImage } from './services/imageGenerationService';
import { downloadHTML, downloadSimplePDF } from './services/downloadService';
import NewsSearchForm from './components/NewsSearchForm';
import NewsResults from './components/NewsResults';
import LanguageSelector from './components/LanguageSelector';

const App: React.FC = () => {
  const [newsResult, setNewsResult] = useState<NewsSearchResult | null>(null);
  const [articles, setArticles] = useState<TranslatedNewsArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | undefined>(undefined);

  const handleSearch = async (keyword: string, country: string) => {
    setIsSearching(true);
    setError(null);
    setCurrentLanguage(undefined);

    try {
      // 뉴스 검색
      const searchResults = await searchNews({ keyword, country });

      // 배너 이미지 생성
      const bannerImage = await generateBannerImage(keyword);

      const result: NewsSearchResult = {
        articles: searchResults,
        keyword,
        country,
        searchedAt: new Date(),
        bannerImage,
      };

      setNewsResult(result);
      setArticles(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('뉴스 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTranslate = async (languageCode: string, languageName: string) => {
    if (!newsResult || articles.length === 0) return;

    setIsTranslating(true);
    setError(null);

    try {
      const translatedArticles = await translateArticles(
        articles,
        languageCode,
        languageName
      );
      setArticles(translatedArticles);
      setCurrentLanguage(languageName);
    } catch (err) {
      console.error('Translation error:', err);
      setError('번역 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!newsResult) return;

    setIsDownloading(true);
    try {
      downloadHTML(newsResult, articles, currentLanguage);
    } catch (err) {
      console.error('Download error:', err);
      setError('HTML 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!newsResult) return;

    setIsDownloading(true);
    try {
      // 간단한 PDF 생성 사용 (더 안정적)
      downloadSimplePDF(newsResult, articles, currentLanguage);
    } catch (err) {
      console.error('PDF download error:', err);
      setError('PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* 헤더 */}
        <header className="mb-10 text-center">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                다국어 뉴스 검색
              </h1>
            </div>
            <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
              전 세계 뉴스를 검색하고 20개 언어로 번역하여 HTML/PDF로 저장하세요
            </p>
          </div>
        </header>

        <main className="space-y-8">
          {/* 검색 폼 */}
          <NewsSearchForm onSearch={handleSearch} isLoading={isSearching} />

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow" role="alert">
              <p className="font-bold">오류 발생</p>
              <p>{error}</p>
            </div>
          )}

          {/* 언어 선택기 */}
          {newsResult && (
            <LanguageSelector
              onTranslate={handleTranslate}
              isTranslating={isTranslating}
              currentLanguage={currentLanguage}
              hasArticles={articles.length > 0}
            />
          )}

          {/* 검색 결과 */}
          {newsResult && (
            <NewsResults
              result={newsResult}
              articles={articles}
              selectedLanguage={currentLanguage}
              onDownloadHTML={handleDownloadHTML}
              onDownloadPDF={handleDownloadPDF}
              isDownloading={isDownloading}
            />
          )}

          {/* 로딩 상태 */}
          {isSearching && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg flex items-center shadow">
              <svg
                className="animate-spin mr-3 h-6 w-6 text-blue-600"
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
              <p className="font-semibold">뉴스를 검색하고 배너 이미지를 생성하는 중입니다...</p>
            </div>
          )}

          {/* 기능 안내 */}
          {!newsResult && !isSearching && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 기능</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">뉴스 검색</h3>
                    <p className="text-gray-600 text-sm">
                      키워드와 국가를 선택하여 최신 뉴스를 검색합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">다국어 번역</h3>
                    <p className="text-gray-600 text-sm">
                      20개 언어로 뉴스를 번역하여 읽을 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">배너 이미지</h3>
                    <p className="text-gray-600 text-sm">
                      키워드에 맞는 배너 이미지가 자동으로 생성됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
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
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">파일 다운로드</h3>
                    <p className="text-gray-600 text-sm">
                      검색 결과를 HTML 또는 PDF 파일로 저장할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="text-center mt-12 py-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} 다국어 뉴스 검색 앱. All rights reserved.</p>
          <p className="mt-2">
            <span className="text-gray-400">Powered by Gemini AI</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
