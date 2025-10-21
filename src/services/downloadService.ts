import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { NewsSearchResult, TranslatedNewsArticle } from '../types';

/**
 * HTML 콘텐츠를 생성하는 함수
 */
export function generateNewsHTML(
  result: NewsSearchResult,
  articles: TranslatedNewsArticle[],
  selectedLanguage?: string
): string {
  const languageInfo = selectedLanguage ? ` (${selectedLanguage})` : '';
  const date = new Date().toLocaleDateString('ko-KR');

  const articlesHTML = articles.map((article, index) => `
    <div class="article">
      <h3>${index + 1}. ${article.translatedTitle || article.title}</h3>
      <div class="meta">
        <span class="source">${article.source.name}</span>
        <span class="date">${new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
      ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" />` : ''}
      <p class="description">${article.translatedDescription || article.description}</p>
      ${article.translatedContent || article.content ? `
        <div class="content">${article.translatedContent || article.content}</div>
      ` : ''}
      <a href="${article.url}" target="_blank" class="read-more">원문 읽기 →</a>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>뉴스 검색 결과: ${result.keyword}${languageInfo}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .banner {
      width: 100%;
      height: 300px;
      object-fit: cover;
      display: block;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .header .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .content {
      padding: 40px;
    }

    .info-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      color: #666;
    }

    .info-item strong {
      color: #333;
    }

    .article {
      margin-bottom: 40px;
      padding-bottom: 40px;
      border-bottom: 2px solid #e5e7eb;
    }

    .article:last-child {
      border-bottom: none;
    }

    .article h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .meta {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .source {
      font-weight: 600;
      color: #667eea;
    }

    .article img {
      width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 15px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .description {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #4b5563;
      margin-bottom: 15px;
    }

    .content {
      font-size: 0.95rem;
      line-height: 1.8;
      color: #6b7280;
      margin-bottom: 15px;
    }

    .read-more {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .read-more:hover {
      color: #764ba2;
      transform: translateX(5px);
    }

    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
      }

      .read-more {
        color: #667eea;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${result.bannerImage ? `<img src="${result.bannerImage}" alt="${result.keyword}" class="banner" />` : ''}

    <div class="header">
      <h1>${result.keyword}</h1>
      <p class="subtitle">뉴스 검색 결과${languageInfo}</p>
    </div>

    <div class="content">
      <div class="info-bar">
        <div class="info-item">
          <strong>검색 키워드:</strong> ${result.keyword}
        </div>
        ${result.country ? `
          <div class="info-item">
            <strong>국가:</strong> ${result.country.toUpperCase()}
          </div>
        ` : ''}
        ${selectedLanguage ? `
          <div class="info-item">
            <strong>언어:</strong> ${selectedLanguage}
          </div>
        ` : ''}
        <div class="info-item">
          <strong>기사 수:</strong> ${articles.length}개
        </div>
        <div class="info-item">
          <strong>생성일:</strong> ${date}
        </div>
      </div>

      ${articlesHTML}
    </div>

    <div class="footer">
      <p>이 문서는 다국어 뉴스 검색 앱에서 생성되었습니다.</p>
      <p>생성일: ${date}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * HTML 파일 다운로드
 */
export function downloadHTML(
  result: NewsSearchResult,
  articles: TranslatedNewsArticle[],
  selectedLanguage?: string
): void {
  const html = generateNewsHTML(result, articles, selectedLanguage);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `news-${result.keyword}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * PDF 파일 다운로드 (HTML을 렌더링하여 PDF로 변환)
 */
export async function downloadPDF(
  result: NewsSearchResult,
  articles: TranslatedNewsArticle[],
  selectedLanguage?: string
): Promise<void> {
  try {
    // 임시 컨테이너 생성
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.background = 'white';

    // HTML 콘텐츠 생성
    const html = generateNewsHTML(result, articles, selectedLanguage);
    tempContainer.innerHTML = html;
    document.body.appendChild(tempContainer);

    // HTML을 캔버스로 변환
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // PDF 생성
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지 추가
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 추가 페이지가 필요한 경우
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // PDF 저장
    pdf.save(`news-${result.keyword}-${new Date().toISOString().split('T')[0]}.pdf`);

    // 임시 컨테이너 제거
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    throw new Error('PDF 파일을 생성하는데 실패했습니다.');
  }
}

/**
 * 간단한 PDF 생성 (텍스트 기반)
 */
export function downloadSimplePDF(
  result: NewsSearchResult,
  articles: TranslatedNewsArticle[],
  selectedLanguage?: string
): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // 한글 폰트 설정 (기본 폰트 사용, 한글이 깨질 수 있음)
  pdf.setFont('helvetica');

  // 제목
  pdf.setFontSize(20);
  pdf.text(result.keyword, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // 정보
  pdf.setFontSize(10);
  const date = new Date().toLocaleDateString();
  pdf.text(`Generated: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  if (selectedLanguage) {
    pdf.text(`Language: ${selectedLanguage}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  yPosition += 10;

  // 각 기사
  articles.forEach((article, index) => {
    // 페이지 넘김 확인
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    // 기사 번호 및 제목
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const title = `${index + 1}. ${article.translatedTitle || article.title}`;
    const titleLines = pdf.splitTextToSize(title, maxWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 7 + 5;

    // 메타 정보
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${article.source.name} - ${new Date(article.publishedAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;

    // 설명
    pdf.setFontSize(10);
    const description = article.translatedDescription || article.description;
    const descLines = pdf.splitTextToSize(description, maxWidth);
    pdf.text(descLines, margin, yPosition);
    yPosition += descLines.length * 5 + 5;

    // URL
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 255);
    pdf.text(article.url, margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
  });

  // 푸터
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  pdf.save(`news-${result.keyword}-${new Date().toISOString().split('T')[0]}.pdf`);
}
