import React, { useState } from 'react';
import type { Problem, SubmissionFormData } from '../types';

interface EssayFormProps {
  problems: Problem[];
  onFormSubmit: (formData: SubmissionFormData) => void;
  isLoading: boolean;
}

const EssayForm: React.FC<EssayFormProps> = ({ problems, onFormSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleAnswerChange = (problemId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [problemId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("학생 이름을 입력해주세요.");
        return;
    }
    const allAnswered = problems.every(p => answers[p.id]?.trim());
    if (!allAnswered) {
        alert("모든 문제에 대한 답변을 작성해주세요.");
        return;
    }
    onFormSubmit({ name, date, answers });
  };

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">문제 풀이</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">학생 이름</label>
                    <input
                        type="text"
                        id="studentName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 홍길동"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="submissionDate" className="block text-sm font-medium text-slate-700 mb-1">제출 날짜</label>
                    <input
                        type="date"
                        id="submissionDate"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            {problems.map((problem, index) => (
                <div key={problem.id} className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-lg text-slate-800">{problem.title}</h3>
                    <p className="text-slate-600 mt-1 mb-4">{problem.description}</p>
                    <textarea
                        rows={8}
                        value={answers[problem.id] || ''}
                        onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="여기에 답변을 작성하세요..."
                        required
                    />
                </div>
            ))}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        처리 중...
                    </>
                ) : '제출 및 평가받기'}
            </button>
        </form>
    </section>
  );
};

export default EssayForm;
