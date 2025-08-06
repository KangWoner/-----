import React from 'react';
import type { Submission } from '../types';

interface GoogleSheetViewerModalProps {
  submission: Submission;
  onClose: () => void;
}

const GoogleSheetViewerModal: React.FC<GoogleSheetViewerModalProps> = ({ submission, onClose }) => {
  if (!submission.driveSheetUrl) {
    // This case should ideally not happen if the button to open this is only shown when a URL exists.
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
                <h2 className="text-xl font-bold text-slate-800 mb-4">오류</h2>
                <p className="text-slate-600 mb-6">Google Drive 시트 URL을 찾을 수 없습니다.</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Google Sheet에서 보기</h2>
        <p className="text-slate-600 mb-6">
          <strong>{submission.name}</strong> 학생의 평가 결과가 저장된 Google Sheet입니다. 아래 링크를 클릭하여 새 탭에서 열 수 있습니다.
        </p>
        <div className="bg-slate-100 p-4 rounded-lg">
             <a
                href={submission.driveSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
             >
                {submission.driveSheetUrl}
            </a>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetViewerModal;
