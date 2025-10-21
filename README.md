# 논술형 수학 AI 교사

이 프로젝트는 학생들이 수학적 개념에 대한 논술형 문제에 답하고 AI로부터 상세한 피드백을 받는 것을 돕는 웹 애플리케이션입니다. Google Gemini를 사용하여 학생들의 답변을 평가하고, 선택적으로 Google Drive에 평가 결과를 저장할 수 있습니다.

## 주요 기능

-   **AI 기반 평가:** Google Gemini Pro 모델을 사용하여 학생들의 서술형 답변을 심층적으로 분석하고 평가합니다.
-   **문제 커스터마이징:** '교사 모드'에서 새로운 문제를 동적으로 생성하고 출제할 수 있습니다.
-   **Google Drive 연동:** 학생들의 제출물과 AI의 평가 결과를 Google Sheet에 자동으로 저장하여 체계적으로 관리할 수 있습니다. (현재는 모의(mock) 구현 상태)
-   **PDF 내보내기:** 개별 평가 결과를 PDF 파일로 다운로드할 수 있습니다.

## 로컬에서 실행하기

**사전 요구사항:** [Node.js](https://nodejs.org/)가 설치되어 있어야 합니다.

1.  **의존성 설치:**
    ```bash
    npm install
    ```

2.  **환경 변수 설정:**
    프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요. 이것은 AI 평가 기능을 활성화하는 데 필요합니다.

    ```
    VITE_GEMINI_API_KEY=여기에_당신의_API_키를_입력하세요
    ```

    -   `VITE_GEMINI_API_KEY`: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받은 당신의 Gemini API 키입니다.

    **보안 경고:** 이 프로젝트는 클라이언트 측에서 직접 Gemini API를 호출합니다. 이것은 개발 및 프로토타이핑에는 편리하지만, **프로덕션 환경에서는 보안에 취약합니다.** 실제 서비스를 배포할 때는 API 키를 보호하기 위해 백엔드 서버를 통해 API를 호출하는 방식으로 아키텍처를 변경해야 합니다.

3.  **개발 서버 실행:**
    ```bash
    npm run dev
    ```
    이제 브라우저에서 `http://localhost:5173` (또는 터미널에 표시된 다른 주소)으로 접속하여 앱을 확인할 수 있습니다.

## 프로젝트 구조

-   `src/`: 애플리케이션의 주요 소스 코드
    -   `components/`: 재사용 가능한 React 컴포넌트
    -   `services/`: 외부 API(Gemini, Google Drive)와의 통신을 담당하는 모듈
    -   `types.ts`: TypeScript 타입 정의
    -   `App.tsx`: 메인 애플리케이션 컴포넌트
    -   `index.tsx`: 애플리케이션 진입점
-   `public/`: 정적 에셋 (Vite에서는 사용되지 않고, `index.html`이 루트에 있습니다)
-   `.env.local`: 로컬 환경 변수 (Git에 의해 무시됨)
-   `README.md`: 프로젝트 설명서

## Google Drive 연동에 대하여

현재 Google Drive 연동 기능(`signIn`, `signOut`, `saveSubmissionToSheet`)은 실제 API를 호출하지 않는 **모의(mock) 구현**으로 되어 있습니다. (`src/services/googleDriveService.ts` 참조).

실제 기능을 구현하려면 Google Cloud Platform에서 OAuth 2.0 클라이언트 ID를 설정하고, Google API 클라이언트 라이브러리를 프로젝트에 통합하는 복잡한 과정이 필요합니다. 이 모의 서비스는 전체적인 앱의 흐름을 테스트할 수 있도록 최소한의 기능을 시뮬레이션합니다.

---

## CSV 성적표 분석 도구

이 프로젝트에는 Python으로 작성된 CSV 성적표 분석 및 시각화 도구가 포함되어 있습니다.

### 기능

- CSV 파일에서 성적 데이터 로드
- 과목별 통계 분석 (평균, 중앙값, 최고점, 최저점, 표준편차)
- 총점 및 등수 자동 계산
- 다양한 시각화 생성:
  - 과목별 점수 분포 히스토그램
  - 박스 플롯 (과목 간 비교)
  - 상관관계 히트맵
  - 총점 순위 차트
- 분석 결과를 텍스트 파일로 저장

### Python 환경 설정

**사전 요구사항:** Python 3.8 이상이 설치되어 있어야 합니다.

1. **가상 환경 생성 (권장):**
   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

2. **의존성 설치:**
   ```bash
   pip install -r requirements.txt
   ```

### 사용 방법

1. **샘플 데이터로 테스트:**
   ```bash
   python analyze.py grades.csv
   ```

2. **자신의 CSV 파일 분석:**
   ```bash
   python analyze.py 내파일.csv
   ```

3. **출력 디렉토리 지정:**
   ```bash
   python analyze.py grades.csv -o results
   ```

4. **시각화 없이 통계만 확인:**
   ```bash
   python analyze.py grades.csv --no-viz
   ```

### CSV 파일 형식

CSV 파일은 다음과 같은 형식이어야 합니다:

```csv
이름,수학,영어,과학,국어
김철수,85,90,78,88
이영희,92,88,95,91
```

- 첫 번째 행: 헤더 (과목명)
- 첫 번째 열: 학생 이름 (선택사항)
- 나머지 열: 숫자 형식의 점수

### 출력 결과

분석을 실행하면 `output/` 폴더(또는 지정한 폴더)에 다음 파일들이 생성됩니다:

- `distribution.png` - 과목별 점수 분포 히스토그램
- `boxplot.png` - 과목별 박스 플롯
- `correlation.png` - 과목 간 상관관계 히트맵
- `ranking.png` - 총점 기준 순위 차트
- `summary.txt` - 통계 분석 결과 텍스트 파일

### 도움말

```bash
python analyze.py --help
```
