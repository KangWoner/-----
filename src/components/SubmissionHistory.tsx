import React from 'react';
import type { Submission } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SubmissionHistoryProps {
  submissions: Submission[];
  onViewInDrive: (submission: Submission) => void;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions, onViewInDrive }) => {

  const generatePdf = async (submission: Submission) => {
    const elementId = `submission-pdf-${submission.id}`;
    const input = document.getElementById(elementId);
    if (!input) {
        console.error("PDF generation failed: element not found.");
        alert("PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    // Temporarily make the element visible for rendering
    const originalDisplay = input.style.display;
    input.style.display = 'block';

    try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${submission.name}_${submission.date}_평가결과.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("PDF를 생성하는 중 오류가 발생했습니다.");
    } finally {
        // Hide the element again
        input.style.display = originalDisplay;
    }
  };

  if (submissions.length === 0) {
    return (
        <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">제출 기록</h2>
            <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800">아직 제출된 기록이 없습니다.</h3>
                <p className="text-slate-500 mt-2">문제를 풀어 제출하면 이곳에서 결과를 확인할 수 있습니다.</p>
            </div>
        </section>
    );
  }

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">제출 기록</h2>
      <ul className="space-y-4">
        {submissions.map(submission => (
          <li key={submission.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <p className="font-semibold text-slate-800">{submission.name}</p>
                    <p className="text-sm text-slate-500">{new Date(submission.submittedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => generatePdf(submission)}
                        className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        PDF 다운로드
                    </button>
                    {submission.isSavedToDrive && submission.driveSheetUrl && (
                         <button
                            onClick={() => onViewInDrive(submission)}
                            className="px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                        >
                            Drive에서 보기
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden element for PDF generation */}
            <div id={`submission-pdf-${submission.id}`} style={{ display: 'none', position: 'absolute', left: '-9999px', width: '800px', padding: '20px', backgroundColor: 'white' }}>
               <h1>수학 논술 평가 결과</h1>
               <p><strong>학생명:</strong> {submission.name}</p>
               <p><strong>제출일:</strong> {submission.date}</p>
               <hr />
               <h2>문제 및 답변</h2>
               {submission.problems.map((p, i) => (
                   <div key={p.id}>
                       <h3>{i+1}. {p.title}</h3>
                       <p><strong>문제:</strong> {p.description}</p>
                       <p><strong>답변:</strong> {submission.answers[p.id]}</p>
                   </div>
               ))}
               <hr />
               <h2>AI 평가</h2>
               <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{submission.evaluation}</pre>
            </div>

          </li>
        ))}
      </ul>
    </section>
  );
};

export default SubmissionHistory;
