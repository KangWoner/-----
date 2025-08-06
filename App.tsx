
import React, { useState, useEffect } from 'react';
import type { Submission, SubmissionFormData, Problem } from './types';
import { evaluateAnswers } from './services/geminiService';
import * as googleDriveService from './services/googleDriveService';
import EssayForm from './components/EssayForm';
import SubmissionHistory from './components/SubmissionHistory';
import ProblemGenerator from './components/ProblemGenerator';
import GoogleSheetViewerModal from './components/GoogleSheetViewerModal';
import { BookOpenIcon, WrenchScrewdriverIcon, GoogleDriveIcon } from './components/icons';

const initialProblems: Problem[] = [
    { id: 'problem-1', title: '문제 1: N각형의 내각의 합', description: 'n각형의 내각의 합이 (n-2) x 180°임을 삼각형 분할을 이용하여 논리적으로 설명하세요.' },
    { id: 'problem-2', title: '문제 2: 부채꼴의 넓이', description: '부채꼴의 넓이를 구하는 공식이 원의 넓이 공식과 어떻게 관련되는지 설명하고, 실생활 예시를 들어보세요.' },
    { id: 'problem-3', title: '문제 3: 정다면체의 종류', description: '정다면체가 5가지 종류밖에 없는 이유를 오일러의 다면체 정리(V-E+F=2)를 이용하여 설명하세요.' },
];

const App: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
        const savedSubmissions = localStorage.getItem('math-essay-submissions');
        return savedSubmissions ? JSON.parse(savedSubmissions) : [];
    } catch (error) {
        console.error("Failed to parse submissions from localStorage", error);
        return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [activeProblems, setActiveProblems] = useState<Problem[]>(initialProblems);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);


  useEffect(() => {
    try {
        localStorage.setItem('math-essay-submissions', JSON.stringify(submissions));
    } catch (error) {
        console.error("Failed to save submissions to localStorage", error);
    }
  }, [submissions]);

  const handleFormSubmit = async (formData: SubmissionFormData) => {
    setIsLoading(true);
    setError(null);
    let newSubmission: Submission | null = null;
    try {
      const evaluation = await evaluateAnswers(activeProblems, formData);
      newSubmission = {
        id: new Date().toISOString(),
        submittedAt: new Date(),
        name: formData.name,
        date: formData.date,
        answers: formData.answers,
        problems: activeProblems,
        evaluation,
        isSavedToDrive: false
      };
      setSubmissions(prev => [newSubmission!, ...prev]);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setIsLoading(false);
      return;
    }
    
    if (isGoogleSignedIn && newSubmission) {
        setIsSavingToDrive(true);
        try {
            const { sheetUrl } = await googleDriveService.saveSubmissionToSheet(newSubmission);
            setSubmissions(prev => prev.map(sub => 
                sub.id === newSubmission!.id 
                ? { ...sub, isSavedToDrive: true, driveSheetUrl: sheetUrl } 
                : sub
            ));
        } catch(driveError) {
             if (driveError instanceof Error) {
                setError(`Google Drive 저장 실패: ${driveError.message}`);
            } else {
                setError('Google Drive에 저장하는 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsSavingToDrive(false);
        }
    }
    setIsLoading(false);
  };
  
  const handleToggleTeacherMode = () => {
      setIsTeacherMode(!isTeacherMode);
  };

  const handleGoogleSignIn = async () => {
      try {
          await googleDriveService.signIn();
          setIsGoogleSignedIn(true);
      } catch (err) {
          setError("Google 로그인에 실패했습니다. 팝업 차단을 확인해주세요.");
      }
  };

  const handleGoogleSignOut = async () => {
      await googleDriveService.signOut();
      setIsGoogleSignedIn(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-10">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="text-left">
                <div className="flex items-center text-blue-700">
                    <BookOpenIcon />
                    <h1 className="text-4xl font-extrabold tracking-tight">논술형 수학 AI 교사</h1>
                </div>
                <p className="mt-2 text-lg text-slate-600">개념을 중심으로 수학적 논리를 길러보세요.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                  onClick={isGoogleSignedIn ? handleGoogleSignOut : handleGoogleSignIn}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isGoogleSignedIn
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
              >
                  <GoogleDriveIcon />
                  <span>{isGoogleSignedIn ? 'Drive 연결됨' : 'Google Drive에 연결'}</span>
              </button>
              <button 
                  onClick={handleToggleTeacherMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isTeacherMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
              >
                  <WrenchScrewdriverIcon />
                  <span>교사 모드</span>
              </button>
            </div>
        </div>
      </header>
      
      <main className="space-y-12">
        
        {isTeacherMode && <ProblemGenerator setActiveProblems={setActiveProblems} isGoogleSignedIn={isGoogleSignedIn} />}

        <EssayForm problems={activeProblems} onFormSubmit={handleFormSubmit} isLoading={isLoading || isSavingToDrive} />
        
        {isSavingToDrive && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md flex items-center" role="status">
                <svg className="animate-spin mr-3 h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>평가 결과를 Google Sheet에 저장 중입니다...</p>
            </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">오류 발생</p>
            <p>{error}</p>
          </div>
        )}

        <SubmissionHistory submissions={submissions} onViewInDrive={setViewingSubmission} />
      </main>

      {viewingSubmission && (
        <GoogleSheetViewerModal 
            submission={viewingSubmission} 
            onClose={() => setViewingSubmission(null)} 
        />
      )}

      <footer className="text-center mt-12 py-6 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI 기반 반응형 수학교재. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
