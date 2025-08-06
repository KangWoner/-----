import type { Problem, SubmissionFormData } from '../types';

// IMPORTANT: This is a client-side implementation and is NOT SECURE.
// In a production environment, you should never expose your API key on the client side.
// This logic should be moved to a secure backend server that makes the API call.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

function buildPrompt(problems: Problem[], formData: SubmissionFormData): string {
  const problemTexts = problems.map((p, index) => {
    return `
### 문제 ${index + 1}: ${p.title}
**제시문:** ${p.description}
**학생 답안:** ${formData.answers[p.id]}
`;
  }).join('\n');

  return `
You are an expert AI math tutor. Your task is to evaluate a student's answers to a set of essay-style math problems.
Provide a comprehensive evaluation in Korean. For each problem, assess the answer based on the following criteria:
1.  **Conceptual Understanding:** Does the student grasp the core mathematical concepts?
2.  **Logical Reasoning:** Is the explanation clear, logical, and easy to follow?
3.  **Completeness:** Does the answer fully address all parts of the question?
4.  **Accuracy:** Are the mathematical statements and calculations correct?

After evaluating each answer individually, provide a "총평" (Overall Feedback) section that summarizes the student's overall performance, highlighting strengths and areas for improvement.

**Please format your entire response in Markdown.** Use headings, bullet points, and bold text to structure your feedback clearly.

Here are the student's submissions:
${problemTexts}

Begin your evaluation now.
`;
}

export async function evaluateAnswers(problems: Problem[], formData: SubmissionFormData): Promise<string> {
  if (!API_KEY) {
    console.error("Gemini API key is missing.");
    // Return a mock evaluation for local development without a key
    return new Promise(resolve => setTimeout(() => {
        resolve(`
## AI 평가 결과 (Mock Data)

**API 키가 제공되지 않아 실제 평가를 수행할 수 없습니다.**
아래는 샘플 평가 결과입니다. `.env.local` 파일에 `VITE_GEMINI_API_KEY`를 설정해주세요.

---

### 문제 1: N각형의 내각의 합에 대한 평가
*   **개념 이해:** n-2개의 삼각형으로 분할하는 핵심 아이디어는 잘 이해하고 있습니다.
*   **논리적 설명:** 설명이 다소 장황하고, 문장 간의 연결이 매끄럽지 못한 부분이 아쉽습니다.
*   **개선점:** 각 단계별로 명확한 근거를 제시하며 간결하게 설명하는 연습이 필요합니다.

### 총평
전반적으로 문제의 핵심 개념은 파악하고 있으나, 자신의 생각을 논리적으로 명확하게 표현하는 능력을 키울 필요가 있습니다. 다양한 문제를 접하며 자신의 풀이 과정을 글로 설명하는 연습을 꾸준히 하길 바랍니다.
        `);
    }, 1500));
  }

  const prompt = buildPrompt(problems, formData);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
          stopSequences: [],
        },
        safetySettings: [
            // Adjust safety settings as needed
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API request failed:', errorBody);
      throw new Error(`Google Gemini API 요청에 실패했습니다. (HTTP ${response.status})`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        // Handle cases where the response is blocked or has no content
        const blockReason = data.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`요청이 부적절한 콘텐츠로 인해 차단되었습니다. (${blockReason})`);
        }
        throw new Error('AI로부터 유효한 평가를 받지 못했습니다.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`AI 평가 중 오류 발생: ${error.message}`);
    }
    throw new Error('AI 평가 중 알 수 없는 오류가 발생했습니다.');
  }
}
