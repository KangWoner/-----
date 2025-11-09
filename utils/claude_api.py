"""
Claude API 연동 모듈

Anthropic의 Claude AI와 통신하는 핵심 모듈
"""

import os
from anthropic import Anthropic
from utils.prompt_templates import SYSTEM_PROMPT, create_full_prompt


class ClaudeClient:
    """
    Claude API 클라이언트 클래스

    Claude AI와의 모든 통신을 관리합니다.
    """

    def __init__(self, api_key=None):
        """
        ClaudeClient 초기화

        Args:
            api_key (str, optional): Claude API 키.
                                     None이면 환경변수에서 가져옴
        """
        # API 키 설정 (환경변수 또는 직접 전달)
        self.api_key = api_key or os.getenv('CLAUDE_API_KEY')

        if not self.api_key:
            raise ValueError(
                "Claude API 키가 설정되지 않았습니다. "
                ".env 파일에 CLAUDE_API_KEY를 추가해주세요."
            )

        # Anthropic 클라이언트 생성
        self.client = Anthropic(api_key=self.api_key)

        # 사용할 모델 지정
        self.model = "claude-sonnet-4-5-20250929"

        # 최대 토큰 수 (응답 길이 제한)
        self.max_tokens = 1024


    def send_message(self, user_message, conversation_history=None):
        """
        사용자 메시지를 Claude에게 보내고 응답 받기

        Args:
            user_message (str): 사용자의 메시지
            conversation_history (list, optional): 이전 대화 기록

        Returns:
            dict: {
                'success': bool,
                'message': str,  # AI 응답
                'error': str     # 에러 발생 시
            }
        """
        try:
            # 입력 검증
            if not user_message or not user_message.strip():
                return {
                    'success': False,
                    'error': '메시지가 비어있습니다.'
                }

            # 메시지 리스트 생성
            messages = create_full_prompt(
                user_message=user_message,
                conversation_history=conversation_history
            )

            # Claude API 호출
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=SYSTEM_PROMPT,  # 쏘미의 성격과 규칙
                messages=messages
            )

            # 응답에서 텍스트 추출
            ai_message = response.content[0].text

            return {
                'success': True,
                'message': ai_message
            }

        except Exception as e:
            # 에러 처리
            error_message = str(e)

            # API 키 관련 에러인지 확인
            if 'api_key' in error_message.lower() or 'authentication' in error_message.lower():
                return {
                    'success': False,
                    'error': 'API 키가 유효하지 않습니다. .env 파일을 확인해주세요.'
                }

            # 요금/한도 관련 에러
            elif 'quota' in error_message.lower() or 'rate' in error_message.lower():
                return {
                    'success': False,
                    'error': 'API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
                }

            # 기타 에러
            else:
                return {
                    'success': False,
                    'error': f'AI 통신 중 오류가 발생했습니다: {error_message}'
                }


    def get_hint(self, level, problem_text, conversation_context):
        """
        힌트 요청 처리 (3단계 힌트 시스템)

        Args:
            level (int): 힌트 레벨 (1, 2, 3)
            problem_text (str): 현재 문제
            conversation_context (str): 대화 맥락

        Returns:
            dict: send_message()와 동일한 형식
        """
        from utils.prompt_templates import get_hint_prompt

        hint_prompt = get_hint_prompt(level, problem_text, conversation_context)

        return self.send_message(hint_prompt)


# ============================================
# 편의 함수: 직접 호출 가능
# ============================================

def send_to_claude(user_message, conversation_history=None, api_key=None):
    """
    Claude에게 메시지를 보내는 간단한 함수

    Args:
        user_message (str): 사용자 메시지
        conversation_history (list, optional): 대화 기록
        api_key (str, optional): API 키

    Returns:
        dict: 응답 결과
    """
    try:
        client = ClaudeClient(api_key=api_key)
        return client.send_message(user_message, conversation_history)
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
