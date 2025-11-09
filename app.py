"""
중학생 수학 학습 도우미 "쏘미" - Flask 메인 애플리케이션

이 파일은 웹 서버의 중심부입니다.
- 사용자의 요청을 받고 (Request)
- 처리한 후 (Processing)
- 응답을 돌려줍니다 (Response)
"""

# ============================================
# 1. 필요한 라이브러리 불러오기 (Import)
# ============================================

# Flask: 웹 애플리케이션을 만들기 위한 핵심 도구들
from flask import Flask, render_template, request, jsonify

# os: 운영체제와 상호작용 (파일 경로, 환경변수 등)
import os

# dotenv: .env 파일에서 환경변수 읽어오기
from dotenv import load_dotenv

# datetime: 날짜와 시간 처리
from datetime import datetime

# Claude API 연동 모듈 (우리가 만든 모듈!)
from utils.claude_api import send_to_claude

# ============================================
# 2. 환경 변수 로드
# ============================================

# .env 파일에서 환경변수를 읽어옵니다
# 이렇게 하면 API 키 같은 민감한 정보를 코드에 직접 쓰지 않아도 됩니다
load_dotenv()

# ============================================
# 3. Flask 앱 생성
# ============================================

# Flask 앱 객체 생성
# __name__: 현재 모듈의 이름 (Flask가 파일 위치를 찾는 데 사용)
app = Flask(__name__)

# Flask 시크릿 키 설정
# 이 키는 세션 데이터를 암호화하는 데 사용됩니다
# .env 파일에서 가져오거나, 없으면 기본값 사용
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')

# ============================================
# 4. 전역 설정 변수
# ============================================

# Claude API 키 (환경변수에서 가져오기)
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')

# 디버그 모드 설정 (.env에서 가져오기)
DEBUG_MODE = os.getenv('FLASK_DEBUG', 'True') == 'True'

# ============================================
# 5. 라우트 (Route) 정의
# ============================================

"""
라우트란?
- URL과 함수를 연결하는 것입니다
- 예: 사용자가 "/" 주소로 접속하면 → index() 함수 실행
- 마치 "이 주소로 오면 이 일을 해라"는 지시서 같은 것
"""

# -------- 홈페이지 라우트 --------
@app.route('/')
def index():
    """
    홈페이지 (메인 화면)

    - URL: http://localhost:5000/
    - 역할: 처음 접속했을 때 보이는 화면
    - 반환: templates/index.html 파일을 렌더링
    """
    # render_template: HTML 파일을 읽어서 브라우저에 보여줍니다
    # Flask는 자동으로 templates/ 폴더에서 파일을 찾습니다
    return render_template('index.html')


# -------- 채팅 페이지 라우트 --------
@app.route('/chat')
def chat():
    """
    채팅 학습 페이지

    - URL: http://localhost:5000/chat
    - 역할: 쏘미와 대화하며 수학 문제를 푸는 페이지
    - 반환: templates/chat.html 파일을 렌더링
    """
    return render_template('chat.html')


# -------- API: 메시지 전송 --------
@app.route('/api/send_message', methods=['POST'])
def send_message():
    """
    AI에게 메시지를 보내고 응답을 받는 API 엔드포인트

    - URL: http://localhost:5000/api/send_message
    - 메서드: POST (데이터를 서버로 전송할 때 사용)
    - 역할: 사용자의 메시지를 받아서 Claude AI에게 전달하고 응답 반환

    요청 형식 (JSON):
    {
        "message": "2x + 5 = 13을 어떻게 풀어요?",
        "conversation_history": [...]  # 선택사항
    }

    응답 형식 (JSON):
    {
        "success": true,
        "ai_message": "좋은 질문이에요! 함께 풀어볼까요?...",
        "timestamp": "2024-11-09T12:34:56"
    }
    """

    try:
        # 1. 클라이언트에서 보낸 JSON 데이터 받기
        # request.get_json(): POST 요청의 JSON 본문을 파이썬 딕셔너리로 변환
        data = request.get_json()

        # 2. 데이터 검증 (필수 필드가 있는지 확인)
        if not data or 'message' not in data:
            # jsonify: 파이썬 딕셔너리를 JSON 형식으로 변환
            return jsonify({
                'success': False,
                'error': '메시지가 전송되지 않았습니다.'
            }), 400  # 400: Bad Request (잘못된 요청)

        user_message = data['message']
        conversation_history = data.get('conversation_history', [])

        # 3. 입력 검증 (빈 메시지 체크)
        if not user_message.strip():
            return jsonify({
                'success': False,
                'error': '빈 메시지는 전송할 수 없습니다.'
            }), 400

        # 4. Claude API 키 확인
        if not CLAUDE_API_KEY or CLAUDE_API_KEY == '여기에_실제_API_키를_붙여넣으세요':
            return jsonify({
                'success': False,
                'error': 'Claude API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.'
            }), 500  # 500: Internal Server Error

        # ===== 5. Claude API 호출 =====
        # 우리가 만든 send_to_claude 함수를 사용합니다!
        result = send_to_claude(
            user_message=user_message,
            conversation_history=conversation_history,
            api_key=CLAUDE_API_KEY
        )

        # 6. Claude API 응답 처리
        if result['success']:
            # 성공: AI 응답을 클라이언트에게 반환
            return jsonify({
                'success': True,
                'ai_message': result['message'],
                'timestamp': datetime.now().isoformat()
            }), 200  # 200: OK (성공)
        else:
            # 실패: 에러 메시지 반환
            return jsonify({
                'success': False,
                'error': result.get('error', 'AI 응답 생성 중 오류가 발생했습니다.')
            }), 500

    except Exception as e:
        # 예상치 못한 에러 처리
        # 실제 서비스에서는 로그 파일에 기록해야 합니다
        print(f"❌ 에러 발생: {str(e)}")  # 개발 중 디버깅용

        return jsonify({
            'success': False,
            'error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            'error_detail': str(e) if DEBUG_MODE else None
        }), 500


# -------- API: 헬스 체크 (서버 상태 확인) --------
@app.route('/api/health')
def health_check():
    """
    서버 상태 확인용 API

    - URL: http://localhost:5000/api/health
    - 역할: 서버가 정상적으로 작동하는지 확인
    - 사용처: 모니터링, 자동화된 테스트 등
    """
    return jsonify({
        'status': 'healthy',
        'message': '쏘미 서버가 정상적으로 작동 중입니다! 🎉',
        'timestamp': datetime.now().isoformat()
    })


# ============================================
# 6. 에러 핸들러 (Error Handlers)
# ============================================

@app.errorhandler(404)
def page_not_found(e):
    """
    404 에러 처리: 페이지를 찾을 수 없을 때

    - 사용자가 존재하지 않는 URL에 접속했을 때 실행
    - 친절한 에러 메시지를 보여줍니다
    """
    return jsonify({
        'error': '페이지를 찾을 수 없습니다.',
        'message': '요청하신 페이지가 존재하지 않습니다. URL을 확인해주세요.',
        'status_code': 404
    }), 404


@app.errorhandler(500)
def internal_error(e):
    """
    500 에러 처리: 서버 내부 오류

    - 서버에서 예상치 못한 오류가 발생했을 때 실행
    """
    return jsonify({
        'error': '서버 오류',
        'message': '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        'status_code': 500
    }), 500


# ============================================
# 7. 애플리케이션 시작점
# ============================================

if __name__ == '__main__':
    """
    이 스크립트를 직접 실행했을 때만 아래 코드가 실행됩니다
    (다른 파일에서 import 했을 때는 실행되지 않음)
    """

    print("\n" + "="*50)
    print("🎓 중학생 수학 학습 도우미 '쏘미' 시작!")
    print("="*50)
    print(f"📍 서버 주소: http://localhost:5000")
    print(f"📍 채팅 페이지: http://localhost:5000/chat")
    print(f"🔧 디버그 모드: {DEBUG_MODE}")
    print("="*50 + "\n")

    # Flask 개발 서버 실행
    app.run(
        host='0.0.0.0',      # 모든 네트워크 인터페이스에서 접속 허용
        port=5000,            # 포트 번호 (기본값: 5000)
        debug=DEBUG_MODE      # 디버그 모드 (코드 변경 시 자동 재시작)
    )
