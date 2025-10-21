# 다국어 뉴스 검색 앱

전 세계 뉴스를 검색하고 20개 언어로 번역하여 HTML/PDF로 저장할 수 있는 웹 애플리케이션입니다.

## 주요 기능

-   **뉴스 검색**: 키워드와 국가를 선택하여 최신 뉴스 검색
-   **다국어 번역**: 20개 언어로 뉴스 기사 번역 (Gemini AI 활용)
-   **배너 이미지**: 키워드에 맞는 배너 이미지 자동 생성
-   **파일 다운로드**: 검색 결과를 HTML 또는 PDF 파일로 저장

## 지원 언어 (20개)

한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 이탈리아어, 포르투갈어, 러시아어, 아랍어, 힌디어, 태국어, 베트남어, 인도네시아어, 터키어, 폴란드어, 네덜란드어, 스웨덴어, 노르웨이어

## 설치 및 실행

**사전 요구사항:** [Node.js](https://nodejs.org/)가 설치되어 있어야 합니다.

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 필요한 API 키를 입력합니다:

```env
# 필수: Gemini API 키 (번역 기능에 필요)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### API 키 발급 방법

1. **Gemini API (필수)**
   - https://makersuite.google.com/app/apikey 에서 발급
   - 번역 기능에 필요

2. **News API (선택사항)**
   - https://newsapi.org 에서 발급
   - 실제 뉴스 검색 기능

3. **Unsplash API (선택사항)**
   - https://unsplash.com/developers 에서 발급
   - 고품질 배너 이미지 검색

**보안 경고:** 이 프로젝트는 클라이언트 측에서 직접 API를 호출합니다. 프로덕션 환경에서는 반드시 백엔드 서버를 통해 API를 호출해야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열어 애플리케이션을 확인합니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 사용 방법

### 1. 뉴스 검색

1. 검색 키워드를 입력합니다 (예: "AI", "경제", "스포츠")
2. 국가를 선택합니다
3. "뉴스 검색" 버튼을 클릭합니다
4. 검색 결과와 배너 이미지가 표시됩니다

### 2. 번역

1. 검색 결과가 표시된 후 "번역 옵션" 섹션을 펼칩니다
2. 원하는 언어를 선택합니다
3. "번역하기" 버튼을 클릭합니다
4. 모든 뉴스 기사가 선택한 언어로 번역됩니다

### 3. 파일 다운로드

검색 결과 상단의 다운로드 버튼을 클릭하여:
- **HTML**: 웹 페이지 형태로 저장
- **PDF**: PDF 문서로 저장

## 프로젝트 구조

```
.
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── NewsSearchForm.tsx       # 뉴스 검색 폼
│   │   ├── NewsResults.tsx          # 검색 결과 표시
│   │   └── LanguageSelector.tsx     # 언어 선택기
│   ├── services/            # 서비스 레이어
│   │   ├── newsService.ts           # 뉴스 검색 API
│   │   ├── translationService.ts    # 번역 서비스
│   │   ├── imageGenerationService.ts # 이미지 생성
│   │   └── downloadService.ts       # HTML/PDF 다운로드
│   ├── types.ts             # TypeScript 타입 정의
│   ├── App.tsx              # 메인 앱 컴포넌트
│   └── index.tsx            # 엔트리 포인트
├── index.html               # HTML 템플릿
├── package.json             # 프로젝트 설정
├── vite.config.ts           # Vite 설정
└── README.md                # 프로젝트 문서
```

## 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **PDF Generation**: jsPDF + html2canvas

## 라이선스

All rights reserved.

---

**Powered by Gemini AI**
