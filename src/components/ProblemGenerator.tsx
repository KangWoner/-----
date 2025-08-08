import React, { useState } from 'react';
import type { Problem } from '../types';
import * as googleDriveService from '../services/googleDriveService';

interface ProblemGeneratorProps {
  setActiveProblems: (problems: Problem[]) => void;
  isGoogleSignedIn: boolean;
}

const ProblemGenerator: React.FC<ProblemGeneratorProps> = ({ setActiveProblems, isGoogleSignedIn }) => {
  const [customProblem, setCustomProblem] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleGenerate = async () => {
    // This is a placeholder. In a real app, this would involve an API call to a generative AI model.
    if (!customProblem.trim()) {
        alert("문제 내용을 입력해주세요.");
        return;
    }

    let attachmentUrl: string | undefined;
    let attachmentType: 'image' | 'pdf' | undefined;

    if (attachment) {
        if (!isGoogleSignedIn) {
            alert('파일 업로드를 위해 Google Drive에 연결해야 합니다.');
            return;
        }
        try {
            const { fileUrl } = await googleDriveService.uploadFile(attachment);
            attachmentUrl = fileUrl;
            attachmentType = attachment.type.startsWith('image/') ? 'image' : 'pdf';
        } catch (err) {
            const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            alert(`파일 업로드 실패: ${message}`);
            return;
        }
    }

    const newProblem: Problem = {
      id: `custom-${new Date().getTime()}`,
      title: '사용자 정의 문제',
      description: customProblem,
      attachmentUrl,
      attachmentType,
    };
    // For simplicity, this replaces all existing problems.
    // A real implementation might want to add to the list.
    setActiveProblems([newProblem]);
    setCustomProblem('');
    setAttachment(null);
    alert("새로운 문제가 생성되어 적용되었습니다.");
  };

  return (
    <section className="bg-purple-50 p-6 rounded-xl border border-purple-200">
      <h2 className="text-xl font-bold text-purple-800 mb-4">교사 모드: 문제 생성기</h2>
      <div className="space-y-4">
        <p className="text-sm text-purple-700">
            여기에 새로운 수학 논술 문제를 입력하고 '생성' 버튼을 눌러 학생들에게 출제할 수 있습니다.
            {isGoogleSignedIn && " Google Drive에 연결되어 있어, 생성된 문제를 시트에 저장할 수도 있습니다."}
        </p>
        <textarea
          rows={3}
          value={customProblem}
          onChange={(e) => setCustomProblem(e.target.value)}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="예: 피타고라스의 정리를 증명하고 실생활 예시를 들어보세요."
        />
        <div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="block w-full text-sm text-purple-700"
            disabled={!isGoogleSignedIn}
          />
          {!isGoogleSignedIn && (
            <p className="text-xs text-purple-600 mt-1">파일 업로드는 Google Drive 연결 후 가능합니다.</p>
          )}
          {attachment && (
            <p className="text-xs text-purple-700 mt-1">선택된 파일: {attachment.name}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
            <button
                onClick={handleGenerate}
                className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
                문제 생성
            </button>
             {isGoogleSignedIn && (
                <button
                    onClick={() => alert('Google Sheet으로 내보내기 기능은 현재 개발 중입니다.')}
                    className="bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg border border-purple-300 hover:bg-purple-100 transition-colors"
                >
                    Sheet으로 내보내기
                </button>
            )}
        </div>
      </div>
    </section>
  );
};

export default ProblemGenerator;
