import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/newsService';

interface LanguageSelectorProps {
  onTranslate: (languageCode: string, languageName: string) => void;
  isTranslating: boolean;
  currentLanguage?: string;
  hasArticles: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onTranslate,
  isTranslating,
  currentLanguage,
  hasArticles,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTranslate = () => {
    const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === selectedLanguage);
    if (language) {
      onTranslate(language.code, language.nativeName);
    }
  };

  if (!hasArticles) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
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
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          번역 옵션
        </h3>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          {isExpanded ? '접기' : '펼치기'}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {currentLanguage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-700 font-semibold">
            현재 언어: {currentLanguage}
          </p>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
              번역할 언어 선택 (20개 언어 지원)
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={isTranslating}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              isTranslating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isTranslating ? (
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
                번역 중...
              </span>
            ) : (
              '번역하기'
            )}
          </button>

          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>안내:</strong> 뉴스 기사를 선택한 언어로 번역합니다. 번역에는 시간이 소요될 수 있습니다.
            </p>
          </div>

          {isTranslating && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-yellow-700">
                번역 진행 중입니다. 잠시만 기다려주세요...
              </p>
            </div>
          )}
        </div>
      )}

      {!isExpanded && (
        <p className="text-gray-600 text-sm">
          뉴스를 20개 언어로 번역할 수 있습니다. 위의 "펼치기" 버튼을 클릭하세요.
        </p>
      )}
    </div>
  );
};

export default LanguageSelector;
