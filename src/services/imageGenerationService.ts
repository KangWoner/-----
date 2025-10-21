/**
 * 이미지 생성 및 검색 서비스
 */

/**
 * Unsplash API를 사용해서 키워드 관련 이미지 검색
 * API 키가 필요합니다: https://unsplash.com/developers
 */
export async function searchImageFromUnsplash(
  keyword: string,
  unsplashApiKey?: string
): Promise<string | null> {
  if (!unsplashApiKey) {
    console.warn('Unsplash API key not provided');
    return null;
  }

  try {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.append('query', keyword);
    url.searchParams.append('per_page', '1');
    url.searchParams.append('orientation', 'landscape');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${unsplashApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Unsplash API request failed');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}

/**
 * Pexels API를 사용해서 키워드 관련 이미지 검색
 * API 키가 필요합니다: https://www.pexels.com/api/
 */
export async function searchImageFromPexels(
  keyword: string,
  pexelsApiKey?: string
): Promise<string | null> {
  if (!pexelsApiKey) {
    console.warn('Pexels API key not provided');
    return null;
  }

  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.append('query', keyword);
    url.searchParams.append('per_page', '1');
    url.searchParams.append('orientation', 'landscape');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': pexelsApiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Pexels API request failed');
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }

    return null;
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return null;
  }
}

/**
 * placeholder 이미지 생성
 */
export function generatePlaceholderImage(keyword: string): string {
  const colors = [
    '4F46E5', // Indigo
    '059669', // Emerald
    'DC2626', // Red
    '0891B2', // Cyan
    '7C3AED', // Violet
    'EA580C', // Orange
  ];

  const colorIndex = keyword.length % colors.length;
  const color = colors[colorIndex];
  const encodedKeyword = encodeURIComponent(keyword);

  return `https://via.placeholder.com/1200x600/${color}/FFFFFF?text=${encodedKeyword}`;
}

/**
 * 배너 이미지 생성 (여러 소스 시도)
 */
export async function generateBannerImage(
  keyword: string,
  unsplashApiKey?: string,
  pexelsApiKey?: string
): Promise<string> {
  // 1. Unsplash에서 검색 시도
  if (unsplashApiKey) {
    const unsplashImage = await searchImageFromUnsplash(keyword, unsplashApiKey);
    if (unsplashImage) {
      return unsplashImage;
    }
  }

  // 2. Pexels에서 검색 시도
  if (pexelsApiKey) {
    const pexelsImage = await searchImageFromPexels(keyword, pexelsApiKey);
    if (pexelsImage) {
      return pexelsImage;
    }
  }

  // 3. Placeholder 이미지 생성
  return generatePlaceholderImage(keyword);
}

/**
 * Canvas를 사용해서 커스텀 배너 이미지 생성
 */
export function generateCustomBannerImage(
  keyword: string,
  width: number = 1200,
  height: number = 600
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return generatePlaceholderImage(keyword);
  }

  // 그라디언트 배경
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4F46E5');
  gradient.addColorStop(0.5, '#7C3AED');
  gradient.addColorStop(1, '#0891B2');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 텍스트 추가
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 텍스트에 그림자 추가
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  ctx.fillText(keyword.toUpperCase(), width / 2, height / 2);

  // Canvas를 Data URL로 변환
  return canvas.toDataURL('image/png');
}
