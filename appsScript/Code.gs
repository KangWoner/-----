/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file authorization now that the
 * script is bound to the document.
 */

// --- CONSTANTS --- //

// Column A is the timestamp added automatically by Google Forms.
const COL_NAME = 2;       // B열: 이름
const COL_EMAIL = 3;      // C열: 이메일
const COL_PROBLEM = 4;    // D열: 내가 푼 문제 (Dropdown from Sheet)
const COL_SOLUTION_IMAGE = 5; // E열: 나의 풀이 (File Upload - will be a Drive URL)
const COL_EXPLANATION_URL = 6; // F열: 논술문제 해설 (URL)

// Output columns
const COL_TOTAL_SCORE = 7;  // G열: 총점
const COL_CATEGORY_SCORES = 8; // H열: 항목별 점수
const COL_FEEDBACK = 9;     // I열: 피드백

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Main function triggered by a Google Form submission.
 * Reads the latest form response, generates AI feedback, updates the sheet, and sends an email.
 * @param {Object} e The event parameter for a simple trigger.
 */
function onFormSubmit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  try {
    // Read values based on the new form structure
    const values = sheet.getRange(row, 1, 1, COL_EXPLANATION_URL).getValues()[0];

    const name = values[COL_NAME - 1];
    const email = values[COL_EMAIL - 1];
    const problemTitle = values[COL_PROBLEM - 1];
    const solutionImageUrl = values[COL_SOLUTION_IMAGE - 1];
    const explanationUrl = values[COL_EXPLANATION_URL - 1]; // Can be empty

    if (!email || !solutionImageUrl) {
      Logger.log(`Skipping row ${row} due to missing email or solution image.`);
      return;
    }

    // Generate feedback using the new multimodal function
    const feedbackData = generateAiFeedback(problemTitle, solutionImageUrl, explanationUrl);

    if (feedbackData) {
      // Format the output
      const totalScore = feedbackData.totalScore;
      const categoryScores = `개념: ${feedbackData.scores.concept}/25, 논리: ${feedbackData.scores.logic}/25, 계산: ${feedbackData.scores.calculation}/25, 표현: ${feedbackData.scores.expression}/25`;
      const feedbackComment = feedbackData.comment;

      // Write results to the sheet in the corrected columns
      sheet.getRange(row, COL_TOTAL_SCORE).setValue(totalScore);
      sheet.getRange(row, COL_CATEGORY_SCORES).setValue(categoryScores);
      sheet.getRange(row, COL_FEEDBACK).setValue(feedbackComment);

      // Send feedback email with separate error handling
      try {
        const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
        sendFeedbackEmail(name, email, totalScore, feedbackComment, sheetUrl);
      } catch (emailError) {
        Logger.log(`Failed to send email for row ${row}: ${emailError.toString()}`);
        // Append an email failure note to the feedback column instead of overwriting it
        const currentFeedback = sheet.getRange(row, COL_FEEDBACK).getValue();
        sheet.getRange(row, COL_FEEDBACK).setValue(currentFeedback + "\n\n(이메일 전송 실패: " + emailError.message + ")");
      }
    }
  } catch (error) {
    Logger.log(`Error in onFormSubmit: ${error.toString()}\n${error.stack}`);
    // If a major error occurs, write it to the feedback column for debugging.
    sheet.getRange(row, COL_FEEDBACK).setValue(`스크립트 오류 발생: ${error.message}`);
  }
}

/**
 * Calls the OpenAI API to generate feedback for a given problem and solution image.
 * @param {string} problemTitle The title of the problem.
 * @param {string} solutionImageUrl The Google Drive URL of the student's solution image.
 * @param {string} explanationUrl The URL of the official explanation for the student's reference.
 * @returns {Object|null} A parsed JSON object with feedback data or null on failure.
 */
function generateAiFeedback(problemTitle, solutionImageUrl, explanationUrl) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error("OpenAI API 키가 스크립트 속성('OPENAI_API_KEY')에 설정되지 않았습니다.");
  }

  // Construct the multimodal prompt
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
            학생이 제출한 문제 풀이(이미지)를 아래 루브릭에 따라 채점하고 피드백을 생성해줘.
            - 문제: ${problemTitle}
            - 학생이 참고한 해설 URL: ${explanationUrl || '제출되지 않음'}

            먼저 아래 이미지 URL에 있는 학생의 풀이를 분석하고, 그 다음에 루브릭에 따라 채점해줘.
            결과는 반드시 JSON 형식으로 반환해야 하며, 다른 설명은 추가하지 마.

            루브릭 (총 100점):
            1. 개념 (25점): 문제 해결에 필요한 핵심 개념을 정확히 이해하고 활용했는가?
            2. 논리 (25점): 풀이 과정의 논리적 흐름이 명확하고 오류가 없는가?
            3. 계산 (25점): 계산 과정이 정확하며 실수가 없는가?
            4. 표현 (25점): 풀이 과정을 다른 사람이 쉽게 이해할 수 있도록 명확하고 간결하게 표현했는가?

            JSON 출력 형식:
            {
              "scores": { "concept": 0, "logic": 0, "calculation": 0, "expression": 0 },
              "totalScore": 0,
              "comment": "총평 및 개선점에 대한 상세한 코멘트"
            }
          `
        },
        {
          type: 'image_url',
          image_url: {
            url: solutionImageUrl,
          },
        },
      ],
    },
  ];

  const payload = {
    model: 'gpt-4-turbo',
    messages: messages,
    response_format: { type: 'json_object' },
    max_tokens: 1500, // Increased for vision analysis which can be more verbose
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

// --- NEW FUNCTIONS FOR DROPDOWN SETUP ---

const PROBLEM_SOURCE_SHEET_ID = '1pUUG_zX96zOMA96EaDH20RkPYEa5LLePIGbuC8Wy3hg';
const PROBLEM_SHEET_NAME = 'Sheet1'; // Assuming the data is on the first sheet
const PROBLEM_COLUMN = 2; // Column B, which contains the problem titles
const FORM_PROBLEM_QUESTION_TITLE = '내가 푼 문제'; // The exact title of the question in the Google Form

/**
 * Creates a custom menu in the spreadsheet UI to run the setup script.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('AI 채점 도우미')
      .addItem('문제 목록 업데이트', 'setupProblemDropdown')
      .addToUi();
}

/**
 * Reads problems from the source sheet and populates the dropdown in the linked form.
 */
function setupProblemDropdown() {
  try {
    // 1. Read problems from the source sheet
    const sourceSheet = SpreadsheetApp.openById(PROBLEM_SOURCE_SHEET_ID).getSheetByName(PROBLEM_SHEET_NAME);
    if (!sourceSheet) {
      SpreadsheetApp.getUi().alert(`원본 시트에서 '${PROBLEM_SHEET_NAME}' 시트를 찾을 수 없습니다.`);
      return;
    }
    const lastRow = sourceSheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('원본 시트에 데이터가 없습니다.');
      return;
    }
    // Get data from the problem column starting from row 2 (to skip header)
    const problems = sourceSheet.getRange(2, PROBLEM_COLUMN, lastRow - 1, 1).getValues();
    const problemTitles = problems.map(row => row[0]).filter(title => title); // Filter out empty rows

    if (problemTitles.length === 0) {
      SpreadsheetApp.getUi().alert('문제 목록을 가져오는 데 실패했습니다. 원본 시트를 확인해주세요.');
      return;
    }

    // 2. Get the Google Form linked to the active spreadsheet
    const formUrl = SpreadsheetApp.getActiveSpreadsheet().getFormUrl();
    if (!formUrl) {
      SpreadsheetApp.getUi().alert('이 시트에 연결된 Google Form을 찾을 수 없습니다. Form의 응답 시트에서 스크립트를 실행해주세요.');
      return;
    }
    const form = FormApp.openByUrl(formUrl);

    // 3. Find the dropdown question and update its choices
    const items = form.getItems(FormApp.ItemType.LIST);
    let problemItem = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].getTitle() === FORM_PROBLEM_QUESTION_TITLE) {
        problemItem = items[i].asListItem();
        break;
      }
    }

    if (problemItem) {
      problemItem.setChoiceValues(problemTitles);
      SpreadsheetApp.getUi().alert(`성공적으로 ${problemTitles.length}개의 문제를 드롭다운에 추가했습니다.`);
    } else {
      SpreadsheetApp.getUi().alert(`Google Form에서 '${FORM_PROBLEM_QUESTION_TITLE}'이라는 제목의 '드롭다운' 질문을 찾을 수 없습니다.`);
    }
  } catch (error) {
    Logger.log(`Error in setupProblemDropdown: ${error.toString()}`);
    SpreadsheetApp.getUi().alert(`오류가 발생했습니다: ${error.message}`);
  }
}
