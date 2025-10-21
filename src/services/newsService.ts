import type { NewsArticle, NewsSearchParams } from '../types';

// 지원하는 국가 목록
export const SUPPORTED_COUNTRIES = [
  { code: 'us', name: 'United States', nativeName: '미국' },
  { code: 'kr', name: 'South Korea', nativeName: '한국' },
  { code: 'jp', name: 'Japan', nativeName: '일본' },
  { code: 'cn', name: 'China', nativeName: '중국' },
  { code: 'gb', name: 'United Kingdom', nativeName: '영국' },
  { code: 'de', name: 'Germany', nativeName: '독일' },
  { code: 'fr', name: 'France', nativeName: '프랑스' },
  { code: 'it', name: 'Italy', nativeName: '이탈리아' },
  { code: 'es', name: 'Spain', nativeName: '스페인' },
  { code: 'ru', name: 'Russia', nativeName: '러시아' },
  { code: 'br', name: 'Brazil', nativeName: '브라질' },
  { code: 'mx', name: 'Mexico', nativeName: '멕시코' },
  { code: 'in', name: 'India', nativeName: '인도' },
  { code: 'au', name: 'Australia', nativeName: '호주' },
  { code: 'ca', name: 'Canada', nativeName: '캐나다' },
];

// 지원하는 언어 목록 (20개국)
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
];

// 샘플 뉴스 데이터 (API 없이 테스트용)
const SAMPLE_NEWS: NewsArticle[] = [
  {
    title: 'Breaking: Technology Advances in AI',
    description: 'New developments in artificial intelligence are transforming industries worldwide.',
    url: 'https://example.com/ai-news',
    urlToImage: 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AI+Technology',
    publishedAt: new Date().toISOString(),
    source: { name: 'Tech News' },
    content: 'Artificial intelligence continues to make significant strides...'
  },
  {
    title: 'Global Markets Show Positive Trends',
    description: 'Stock markets around the world are experiencing growth amid positive economic indicators.',
    url: 'https://example.com/market-news',
    urlToImage: 'https://via.placeholder.com/800x400/059669/FFFFFF?text=Market+News',
    publishedAt: new Date().toISOString(),
    source: { name: 'Financial Times' },
    content: 'Markets worldwide are showing resilience...'
  },
  {
    title: 'Climate Change Summit Yields New Agreements',
    description: 'World leaders commit to ambitious carbon reduction targets at the latest climate summit.',
    url: 'https://example.com/climate-news',
    urlToImage: 'https://via.placeholder.com/800x400/0891B2/FFFFFF?text=Climate+Summit',
    publishedAt: new Date().toISOString(),
    source: { name: 'Global News Network' },
    content: 'The international climate summit concluded with...'
  }
];

/**
 * 뉴스 검색 함수
 * 실제 프로덕션에서는 News API나 GNews API를 사용해야 합니다.
 * 현재는 샘플 데이터를 반환합니다.
 */
export async function searchNews(params: NewsSearchParams): Promise<NewsArticle[]> {
  const { keyword, country, language } = params;

  // 실제 API 호출 시뮬레이션 (2초 대기)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 키워드로 필터링된 샘플 뉴스 반환
  const filteredNews = SAMPLE_NEWS.map(article => ({
    ...article,
    title: `${keyword}: ${article.title}`,
    description: `[${country?.toUpperCase() || 'GLOBAL'}] ${article.description}`,
  }));

  return filteredNews;
}

/**
 * News API를 사용한 실제 뉴스 검색 함수
 * API 키가 필요합니다: https://newsapi.org
 */
export async function searchNewsWithAPI(
  params: NewsSearchParams,
  apiKey: string
): Promise<NewsArticle[]> {
  const { keyword, country } = params;

  try {
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.append('q', keyword);
    url.searchParams.append('apiKey', apiKey);

    if (country) {
      url.searchParams.append('country', country);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    return data.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('뉴스를 가져오는데 실패했습니다. API 키를 확인해주세요.');
  }
}

/**
 * GNews API를 사용한 뉴스 검색 함수
 * API 키가 필요합니다: https://gnews.io
 */
export async function searchNewsWithGNews(
  params: NewsSearchParams,
  apiKey: string
): Promise<NewsArticle[]> {
  const { keyword, country, language } = params;

  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.append('q', keyword);
    url.searchParams.append('token', apiKey);
    url.searchParams.append('lang', language || 'en');

    if (country) {
      url.searchParams.append('country', country);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`GNews API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: { name: article.source.name },
      content: article.content
    })) || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('뉴스를 가져오는데 실패했습니다. API 키를 확인해주세요.');
  }
}
