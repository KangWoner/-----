/// <reference types="vite/client" />
import type { NewsArticle, TranslatedNewsArticle } from '../types';

// IMPORTANT: This is a client-side implementation and is NOT SECURE.
// In a production environment, you should never expose your API key on the client side.
// This logic should be moved to a secure backend server that makes the API call.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

/**
 * 뉴스 기사를 지정된 언어로 번역
 */
export async function translateArticle(
  article: NewsArticle,
  targetLanguage: string,
  targetLanguageName: string
): Promise<TranslatedNewsArticle> {
  if (!API_KEY) {
    console.warn("Gemini API key is missing. Returning original article.");
    return {
      ...article,
      translatedTitle: `[번역 불가] ${article.title}`,
      translatedDescription: `[번역 불가] ${article.description}`,
      translatedContent: article.content ? `[번역 불가] ${article.content}` : undefined,
    };
  }

  const prompt = `
Translate the following news article into ${targetLanguageName} (${targetLanguage}).
Maintain a professional news tone and preserve the original meaning accurately.

Title: ${article.title}

Description: ${article.description}

${article.content ? `Content: ${article.content}` : ''}

Please provide the translation in the following JSON format:
{
  "title": "translated title",
  "description": "translated description"
  ${article.content ? ', "content": "translated content"' : ''}
}

Only return the JSON object, no additional text.
`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;

      // JSON 응답 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const translated = JSON.parse(jsonMatch[0]);
        return {
          ...article,
          translatedTitle: translated.title,
          translatedDescription: translated.description,
          translatedContent: translated.content || article.content,
        };
      }
    }

    throw new Error('번역 결과를 파싱할 수 없습니다.');
  } catch (error) {
    console.error('Translation error:', error);
    // 오류 발생 시 원본 텍스트 반환
    return {
      ...article,
      translatedTitle: article.title,
      translatedDescription: article.description,
      translatedContent: article.content,
    };
  }
}

/**
 * 여러 뉴스 기사를 일괄 번역
 */
export async function translateArticles(
  articles: NewsArticle[],
  targetLanguage: string,
  targetLanguageName: string,
  onProgress?: (current: number, total: number) => void
): Promise<TranslatedNewsArticle[]> {
  const translatedArticles: TranslatedNewsArticle[] = [];

  for (let i = 0; i < articles.length; i++) {
    const translated = await translateArticle(articles[i], targetLanguage, targetLanguageName);
    translatedArticles.push(translated);

    if (onProgress) {
      onProgress(i + 1, articles.length);
    }

    // API 호출 간 딜레이 (Rate Limiting 방지)
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return translatedArticles;
}

/**
 * 간단한 텍스트 번역
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  targetLanguageName: string
): Promise<string> {
  if (!API_KEY) {
    console.warn("Gemini API key is missing.");
    return `[번역 불가] ${text}`;
  }

  const prompt = `Translate the following text into ${targetLanguageName} (${targetLanguage}):

${text}

Only return the translated text, no additional explanations.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    }

    throw new Error('번역 결과를 가져올 수 없습니다.');
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 오류 시 원본 반환
  }
}
