import React, { useState } from 'react';
import { SUPPORTED_COUNTRIES } from '../services/newsService';

interface NewsSearchFormProps {
  onSearch: (keyword: string, country: string) => void;
  isLoading: boolean;
}

const NewsSearchForm: React.FC<NewsSearchFormProps> = ({ onSearch, isLoading }) => {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('us');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim(), country);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">뉴스 검색</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-semibold text-gray-700 mb-2">
            검색 키워드
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 기술, AI, 경제 등"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
            국가 선택
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled={isLoading}
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.nativeName} ({c.name})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            isLoading || !keyword.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              검색 중...
            </span>
          ) : (
            '뉴스 검색'
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>팁:</strong> 키워드를 입력하고 국가를 선택하면 해당 국가의 최신 뉴스를 검색할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default NewsSearchForm;
