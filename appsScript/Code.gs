/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file authorization now that the
 * script is bound to the document.
 */

// --- CONSTANTS --- //

// Input columns (adjust numbers if your sheet layout is different)
const COL_NAME = 1;       // A열: 이름
const COL_EMAIL = 2;      // B열: 이메일
const COL_PROBLEM = 3;    // C열: 내가 푼 문제
const COL_SOLUTION = 4;   // D열: 나의 풀이
const COL_FILE_URL = 5;   // E열: 파일(URL 가능)

// Output columns (adjust numbers if your sheet layout is different)
const COL_TOTAL_SCORE = 6;  // F열: 총점
const COL_CATEGORY_SCORES = 7; // G열: 항목별 점수
const COL_FEEDBACK = 8;     // H열: 피드백

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Main function triggered by a Google Form submission.
 * Reads the latest form response, generates AI feedback, updates the sheet, and sends an email.
 * @param {Object} e The event parameter for a simple trigger.
 */
function onFormSubmit(e) {
  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    const values = sheet.getRange(row, 1, 1, COL_FILE_URL).getValues()[0];

    const name = values[COL_NAME - 1];
    const email = values[COL_EMAIL - 1];
    const problem = values[COL_PROBLEM - 1];
    const solution = values[COL_SOLUTION - 1];
    // Note: The file URL is read but not used in this version.
    // It could be extended to fetch file content if needed.

    if (!email || !solution) {
      Logger.log(`Skipping row ${row} due to missing email or solution.`);
      return;
    }

    // Generate feedback using AI
    const feedbackData = generateAiFeedback(problem, solution);

    if (feedbackData) {
      // Format the output
      const totalScore = feedbackData.totalScore;
      const categoryScores = `개념: ${feedbackData.scores.concept}/25, 논리: ${feedbackData.scores.logic}/25, 계산: ${feedbackData.scores.calculation}/25, 표현: ${feedbackData.scores.expression}/25`;
      const feedbackComment = feedbackData.comment;

      // Write results to the sheet
      sheet.getRange(row, COL_TOTAL_SCORE).setValue(totalScore);
      sheet.getRange(row, COL_CATEGORY_SCORES).setValue(categoryScores);
      sheet.getRange(row, COL_FEEDBACK).setValue(feedbackComment);

      // Send feedback email to the student
      const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
      sendFeedbackEmail(name, email, totalScore, feedbackComment, sheetUrl);
    }
  } catch (error) {
    Logger.log(`Error in onFormSubmit: ${error.toString()}\n${error.stack}`);
    // Optional: Write an error message to the sheet for debugging
    if (e && e.range) {
      e.range.getSheet().getRange(e.range.getRow(), COL_FEEDBACK).setValue(`오류 발생: ${error.message}`);
    }
  }
}

/**
 * Calls the OpenAI API to generate feedback for a given problem and solution.
 * @param {string} problem The problem description.
 * @param {string} solution The student's solution.
 * @returns {Object|null} A parsed JSON object with feedback data or null on failure.
 */
function generateAiFeedback(problem, solution) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error("OpenAI API 키가 스크립트 속성('OPENAI_API_KEY')에 설정되지 않았습니다.");
  }

  const prompt = `
    학생이 제출한 문제 풀이를 아래 루브릭에 따라 채점하고 피드백을 생성해줘.
    결과는 반드시 JSON 형식으로 반환해야 하며, 다른 설명은 추가하지 마.

    - 문제: ${problem}
    - 학생의 풀이: ${solution}

    루브릭 (총 100점):
    1. 개념 (25점): 문제 해결에 필요한 핵심 개념을 정확히 이해하고 활용했는가?
    2. 논리 (25점): 풀이 과정의 논리적 흐름이 명확하고 오류가 없는가?
    3. 계산 (25점): 계산 과정이 정확하며 실수가 없는가? (계산이 없는 문제 유형은 0점으로 처리)
    4. 표현 (25점): 풀이 과정을 다른 사람이 쉽게 이해할 수 있도록 명확하고 간결하게 표현했는가?

    JSON 출력 형식:
    {
      "scores": {
        "concept": <number>,
        "logic": <number>,
        "calculation": <number>,
        "expression": <number>
      },
      "totalScore": <number>,
      "comment": "<string: 총평 및 개선점에 대한 상세한 코멘트>"
    }
  `;

  const payload = {
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true, // Prevents script from stopping on HTTP errors
  };

  const response = UrlFetchApp.fetch(OPENAI_API_ENDPOINT, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode === 200) {
    try {
      const messageContent = JSON.parse(responseBody).choices[0].message.content;
      return JSON.parse(messageContent);
    } catch (e) {
      Logger.log(`Failed to parse AI response: ${e.toString()}`);
      Logger.log(`Raw AI Response: ${responseBody}`);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다.");
    }
  } else {
    Logger.log(`AI API Error: ${responseCode} - ${responseBody}`);
    throw new Error(`AI API 요청에 실패했습니다. (HTTP Code: ${responseCode})`);
  }
}


/**
 * Sends a feedback summary email to the student.
 * @param {string} name The student's name.
 * @param {string} email The student's email address.
 * @param {number} totalScore The total score received.
 * @param {string} feedback The detailed feedback comment.
 * @param {string} sheetUrl A URL to the Google Sheet for reference.
 */
function sendFeedbackEmail(name, email, totalScore, feedback, sheetUrl) {
  const subject = `[자동 피드백] ${name}님, 제출하신 과제에 대한 피드백이 도착했습니다.`;
  const body = `
    안녕하세요, ${name}님.<br><br>
    제출하신 과제에 대한 자동 피드백이 생성되었습니다.<br><br>
    <b>- 총점:</b> ${totalScore} / 100<br>
    <b>- 피드백:</b><br>
    <p style="padding-left: 15px; border-left: 3px solid #ccc;">${feedback.replace(/\n/g, '<br>')}</p>
    <br>
    자세한 내용은 아래 링크된 Google Sheet에서 확인하실 수 있습니다.<br>
    <a href="${sheetUrl}">결과 확인하기</a><br><br>
    감사합니다.<br>
  `;

  GmailApp.sendEmail(email, subject, '', {
    htmlBody: body,
  });
}
