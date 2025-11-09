# 🎓 중학생 수학 학습 도우미 "쏘미" (So-Me)

> **Socrates + Me** : 소크라테스처럼 질문하며 학생과 함께 성장하는 AI 수학 튜터

중학생들이 수학 문제를 풀 때 절대 답을 알려주지 않고, **질문을 통해 스스로 깨닫게 하는** AI 학습 도우미입니다.

---

## 📌 프로젝트 소개

**쏘미**는 중학생들을 위한 대화형 수학 학습 웹앱입니다.

### 핵심 특징
- ✨ **소크라테스식 대화**: 답을 주지 않고 질문으로 가이드
- 💡 **3단계 힌트 시스템**: 막힐 때 점진적인 도움 제공
- 🤖 **Claude AI 기반**: 자연스러운 대화와 정확한 수학 분석
- 📱 **반응형 디자인**: 스마트폰, 태블릿, PC 모두 지원
- 🎯 **안전한 학습 공간**: 틀려도 격려받는 친근한 환경

---

## 🎯 대상 사용자

- 수학에 자신감이 없는 중학생
- 문제를 어디서부터 시작해야 할지 막막한 학생
- 혼자서도 학습하고 싶지만 도움이 필요한 학생
- 즉각적인 피드백을 원하는 학생

---

## 🛠️ 기술 스택

### 백엔드
- **Python 3.10+**
- **Flask** - 가볍고 초보자 친화적인 웹 프레임워크
- **Claude API** - Anthropic의 AI 모델 (claude-sonnet-4-5)
- **SQLite** - 간단한 데이터베이스

### 프론트엔드
- **HTML5** + **CSS3**
- **Vanilla JavaScript** (프레임워크 없이 순수 JS)
- 반응형 디자인

---

## 📁 프로젝트 구조

```
math-tutor-somi/
├── app.py                    # Flask 메인 애플리케이션
├── requirements.txt          # Python 패키지 목록
├── .env                      # 환경 변수 (API 키 등) ⚠️ Git에 올리지 마세요!
├── .env.example              # 환경 변수 예시 파일
├── .gitignore                # Git에서 제외할 파일 목록
│
├── static/                   # 정적 파일 (CSS, JS, 이미지)
│   ├── css/
│   │   └── style.css        # 스타일시트
│   └── js/
│       └── main.js          # 프론트엔드 JavaScript
│
├── templates/                # HTML 템플릿
│   ├── index.html           # 홈 화면
│   └── chat.html            # 대화형 학습 화면
│
├── database/                 # 데이터베이스 관련
│   └── init_db.py           # DB 초기화 스크립트
│
└── utils/                    # 유틸리티 모듈
    ├── claude_api.py        # Claude API 연동
    └── prompt_templates.py  # AI 프롬프트 템플릿
```

---

## 🚀 설치 및 실행 방법

### 1️⃣ 사전 준비

#### Python 설치 확인
터미널(명령 프롬프트)을 열고 다음 명령어를 입력하세요:

```bash
python --version
```

또는

```bash
python3 --version
```

**Python 3.10 이상**이 설치되어 있어야 합니다.

📥 Python이 없다면?
- **Windows**: [python.org](https://www.python.org/downloads/)에서 다운로드
- **Mac**: 기본 설치되어 있거나 [python.org](https://www.python.org/downloads/)에서 다운로드
- **Linux**: `sudo apt install python3 python3-pip` (Ubuntu/Debian)

#### 코드 에디터 설치 (선택사항이지만 강력 권장!)

초보자에게 추천하는 에디터:
- **Visual Studio Code (VS Code)** ⭐ 가장 추천!
  - 다운로드: [code.visualstudio.com](https://code.visualstudio.com/)
  - 무료, 가볍고, Python 확장 프로그램 풍부

---

### 2️⃣ 프로젝트 다운로드

```bash
# Git이 설치되어 있다면
git clone <repository-url>
cd math-tutor-somi

# 또는 ZIP 파일로 다운로드 후 압축 해제
```

---

### 3️⃣ 가상환경 생성 (권장)

가상환경은 프로젝트마다 독립적인 Python 환경을 만들어줍니다.
다른 프로젝트와 패키지 충돌을 방지할 수 있습니다.

#### Windows:
```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
venv\Scripts\activate
```

#### Mac/Linux:
```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate
```

✅ 성공하면 터미널 앞에 `(venv)`가 표시됩니다!

---

### 4️⃣ 필수 패키지 설치

```bash
pip install -r requirements.txt
```

이 명령어는 `requirements.txt`에 적힌 모든 패키지를 자동으로 설치합니다.
- Flask
- python-dotenv
- anthropic
- 등등...

⏱️ 1~2분 정도 걸립니다. 잠시 기다려주세요!

---

### 5️⃣ 환경 변수 설정

#### Claude API 키 발급받기

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인 또는 회원가입
3. **API Keys** 메뉴 선택
4. **"Create Key"** 클릭
5. 생성된 키 복사 (sk-ant-api03-...로 시작하는 긴 문자열)

#### .env 파일 수정

프로젝트 폴더의 `.env` 파일을 열어서:

```bash
CLAUDE_API_KEY=여기에_실제_API_키를_붙여넣으세요
```

이 부분을 아래처럼 수정하세요:

```bash
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **주의**: API 키는 절대 다른 사람에게 공유하지 마세요!

---

### 6️⃣ 개발 서버 실행

```bash
python app.py
```

또는

```bash
python3 app.py
```

✅ 성공하면 이런 메시지가 나옵니다:

```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

---

### 7️⃣ 브라우저에서 접속

웹 브라우저를 열고 다음 주소로 접속하세요:

```
http://localhost:5000
```

또는

```
http://127.0.0.1:5000
```

🎉 **축하합니다! 쏘미가 실행되었습니다!**

---

## 🎮 사용 방법

1. **홈 화면**에서 "문제 풀이 시작하기" 버튼 클릭
2. 수학 문제를 **텍스트로 입력** (예: "2x + 5 = 13을 풀어주세요")
3. **쏘미**가 질문으로 가이드해줍니다
4. 막히면 **"힌트" 버튼** 클릭 (3단계 힌트 제공)
5. 문제를 풀면 **칭찬과 격려**를 받습니다!

---

## 🔧 개발 진행 상황

### ✅ 완료된 작업 (1단계)
- [x] 프로젝트 폴더 구조 생성
- [x] requirements.txt 작성
- [x] 환경 변수 설정
- [x] .gitignore 설정

### 🚧 진행 중 (2단계)
- [ ] Flask 앱 기본 구조
- [ ] 라우트 설정
- [ ] 정적 파일 서빙

### 📅 예정 (3단계 이후)
- [ ] HTML/CSS/JS UI 개발
- [ ] Claude API 연동
- [ ] 데이터베이스 구축
- [ ] 학습 기록 기능
- [ ] 통합 테스트 및 버그 수정

---

## 🐛 문제 해결 (Troubleshooting)

### Python을 찾을 수 없다고 나와요
- Windows: "앱 및 기능"에서 Python 설치 확인
- PATH 환경변수에 Python이 추가되었는지 확인
- `python3` 명령어 사용해보기

### 패키지 설치가 안 돼요
```bash
# pip 업그레이드
python -m pip install --upgrade pip

# 다시 설치 시도
pip install -r requirements.txt
```

### API 키 오류가 나요
- `.env` 파일이 프로젝트 루트 폴더에 있는지 확인
- API 키가 정확히 복사되었는지 확인 (공백 없이)
- Anthropic Console에서 API 키 상태 확인

### 서버가 실행되지 않아요
- 포트 5000이 이미 사용 중일 수 있습니다
- `app.py`에서 포트 번호 변경: `app.run(port=5001)`

---

## 📚 학습 자료

### 초보자를 위한 추천 자료
- [Flask 공식 문서 (한글)](https://flask-docs-kr.readthedocs.io/)
- [Python 기초 강의 - 생활코딩](https://opentutorials.org/course/1)
- [HTML/CSS 기초 - MDN Web Docs](https://developer.mozilla.org/ko/)

---

## 🤝 기여하기

이 프로젝트는 학습 목적으로 만들어졌습니다.
버그를 발견하거나 개선 아이디어가 있다면 언제든 이슈를 올려주세요!

---

## 📝 라이선스

이 프로젝트는 교육 목적으로 자유롭게 사용할 수 있습니다.

---

## 👨‍💻 개발자

프로그래밍 초보자의 첫 웹 프로젝트 🌱

**시작일**: 2024년 11월
**목표**: 3주 내 MVP 완성

---

## 💬 연락처

궁금한 점이나 도움이 필요하면 언제든 질문하세요!

---

**행복한 코딩되세요! Happy Coding! 🚀**
