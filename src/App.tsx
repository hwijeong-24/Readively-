/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WordDefinition, WordBankItem, ReadingFeedback } from './types';
import { STORY_PAGES, INFERENCE_QUESTIONS } from './data/storyData';
import { Header } from './components/Header';
import { CoverScreen } from './components/CoverScreen';
import { StoryPageScreen } from './components/StoryPageScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ResultScreen } from './components/ResultScreen';
import { StoryRebuilderScreen } from './components/StoryRebuilderScreen';
import { FinalScreen } from './components/FinalScreen';
import { BookCatalogScreen } from './components/BookCatalogScreen';
import { WordModal } from './components/WordModal';
import { WordBankModal } from './components/WordBankModal';
import { HomeConfirmModal } from './components/HomeConfirmModal';
import { stopSpeaking } from './utils/speech';

const STORAGE_KEY = 'readively_state_v3';
const CURRENT_STORY_ID = 'max-the-brave';

type ScreenType = 'cover' | 'story' | 'question' | 'result' | 'rebuilder' | 'final' | 'catalog';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('cover');
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');

  // Persistence State
  const [readSentenceIds, setReadSentenceIds] = useState<Set<string>>(new Set());
  const [sentenceFeedbacks, setSentenceFeedbacks] = useState<Record<string, ReadingFeedback>>({});
  const [savedWords, setSavedWords] = useState<WordBankItem[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, { selectedIndex: number; isCorrect: boolean }>>({});
  const [completedStoryIds, setCompletedStoryIds] = useState<string[]>([]);
  const [badgeCount, setBadgeCount] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modal States
  const [activeWordPopup, setActiveWordPopup] = useState<WordDefinition | null>(null);
  const [isWordBankOpen, setIsWordBankOpen] = useState<boolean>(false);
  const [isHomeConfirmOpen, setIsHomeConfirmOpen] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.readSentenceIds) setReadSentenceIds(new Set(parsed.readSentenceIds));
        if (parsed.sentenceFeedbacks) setSentenceFeedbacks(parsed.sentenceFeedbacks);
        if (parsed.savedWords) setSavedWords(parsed.savedWords);
        if (parsed.questionAnswers) setQuestionAnswers(parsed.questionAnswers);
        if (parsed.currentPageNum) setCurrentPageNum(parsed.currentPageNum);
        if (parsed.screen) setScreen(parsed.screen);
        if (parsed.currentQuestionId) setCurrentQuestionId(parsed.currentQuestionId);
        if (parsed.completedStoryIds) setCompletedStoryIds(parsed.completedStoryIds);
        if (typeof parsed.badgeCount === 'number') setBadgeCount(parsed.badgeCount);
      }
    } catch (e) {
      console.warn('Failed to restore saved progress:', e);
    }
  }, []);

  // Save to localStorage whenever critical states change
  useEffect(() => {
    try {
      const stateToSave = {
        readSentenceIds: Array.from(readSentenceIds),
        sentenceFeedbacks,
        savedWords,
        questionAnswers,
        currentPageNum,
        screen,
        currentQuestionId,
        completedStoryIds,
        badgeCount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save progress to localStorage:', e);
    }
  }, [
    readSentenceIds,
    sentenceFeedbacks,
    savedWords,
    questionAnswers,
    currentPageNum,
    screen,
    currentQuestionId,
    completedStoryIds,
    badgeCount,
  ]);

  // Derived Values
  const currentPage = STORY_PAGES.find((p) => p.pageNumber === currentPageNum) || STORY_PAGES[0];
  const currentQuestion = INFERENCE_QUESTIONS.find((q) => q.id === currentQuestionId) || INFERENCE_QUESTIONS[0];
  const questionForPage = INFERENCE_QUESTIONS.find((q) => q.afterPage === currentPageNum);
  const savedWordSet = new Set(savedWords.map((w) => w.word.toLowerCase()));

  // Count total sentences
  const totalSentencesCount = STORY_PAGES.reduce((acc, p) => acc + p.sentences.length, 0);
  const sentencesReadCount = readSentenceIds.size;

  // Correct questions count (only first-try correct counts towards score)
  const correctQuestionsCount = Object.values(questionAnswers).filter((a) => a.isCorrect).length;

  // Sentence read handler
  const handleSentenceRead = (sentenceId: string, feedback: ReadingFeedback) => {
    setReadSentenceIds((prev) => new Set([...prev, sentenceId]));
    setSentenceFeedbacks((prev) => ({
      ...prev,
      [sentenceId]: feedback,
    }));
  };

  // Toggle word in Word Bank
  const handleToggleWordBank = (wordDef: WordDefinition) => {
    const isAlreadySaved = savedWordSet.has(wordDef.word.toLowerCase());
    if (isAlreadySaved) {
      setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== wordDef.word.toLowerCase()));
    } else {
      const newItem: WordBankItem = {
        ...wordDef,
        addedAt: Date.now(),
        pageNumber: currentPageNum,
      };
      setSavedWords((prev) => [newItem, ...prev]);
    }
  };

  // Remove word directly from Word Bank modal
  const handleRemoveWordFromBank = (word: string) => {
    setSavedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase()));
  };

  // Answer inference question
  const handleAnswerQuestion = (questionId: string, selectedIndex: number, isCorrect: boolean) => {
    setQuestionAnswers((prev) => {
      // Do not overwrite if already answered on first attempt
      if (prev[questionId]) return prev;
      return {
        ...prev,
        [questionId]: { selectedIndex, isCorrect },
      };
    });
  };

  // Mark story as completed and award badge (only on first completion)
  const completeStoryAndAwardBadge = () => {
    if (!completedStoryIds.includes(CURRENT_STORY_ID)) {
      setCompletedStoryIds((prev) => [...prev, CURRENT_STORY_ID]);
      setBadgeCount((prev) => prev + 1);
    }
    setScreen('result');
  };

  // Navigation: Next Page button on Story Page
  const handleNextPageFromStory = () => {
    if (questionForPage) {
      setCurrentQuestionId(questionForPage.id);
      setScreen('question');
    } else {
      if (currentPageNum < STORY_PAGES.length) {
        setCurrentPageNum((prev) => prev + 1);
      } else {
        completeStoryAndAwardBadge();
      }
    }
  };

  // Navigation: Previous Page button on Story Page
  const handlePrevPageFromStory = () => {
    if (currentPageNum > 1) {
      setCurrentPageNum((prev) => prev - 1);
    }
  };

  // Navigation: Previous button on Question screen
  const handlePrevFromQuestion = () => {
    setScreen('story');
  };

  // Navigation: Continue button on Question screen
  const handleContinueFromQuestion = () => {
    if (currentPageNum < STORY_PAGES.length) {
      setCurrentPageNum((prev) => prev + 1);
      setScreen('story');
    } else {
      completeStoryAndAwardBadge();
    }
  };

  // Return to Cover screen and reset current reading progress (keeps badges, completed stories, and word bank)
  const handleConfirmHome = () => {
    stopSpeaking();
    setCurrentPageNum(1);
    setReadSentenceIds(new Set());
    setSentenceFeedbacks({});
    setQuestionAnswers({});
    setScreen('cover');
    setIsHomeConfirmOpen(false);
  };

  // Restart current story from Cover screen
  const handleRestartStory = () => {
    stopSpeaking();
    setCurrentPageNum(1);
    setReadSentenceIds(new Set());
    setSentenceFeedbacks({});
    setQuestionAnswers({});
    setScreen('cover');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        currentPage={currentPageNum}
        totalPages={STORY_PAGES.length}
        isCover={screen === 'cover'}
        isResult={screen === 'result' || screen === 'final'}
        isQuestion={screen === 'question'}
        screenTitle={
          screen === 'rebuilder'
            ? 'Story Rebuilder'
            : screen === 'catalog'
            ? 'Library'
            : undefined
        }
        wordBankCount={savedWords.length}
        badgeCount={badgeCount}
        soundEnabled={soundEnabled}
        onOpenWordBank={() => setIsWordBankOpen(true)}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenHomeConfirm={() => setIsHomeConfirmOpen(true)}
      />

      {/* Main Content Screens */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {screen === 'cover' && (
          <CoverScreen
            onOpenBook={() => {
              setScreen('story');
              setCurrentPageNum(1);
            }}
            wordBankCount={savedWords.length}
          />
        )}

        {screen === 'story' && (
          <StoryPageScreen
            page={currentPage}
            totalPages={STORY_PAGES.length}
            readSentenceIds={readSentenceIds}
            sentenceFeedbacks={sentenceFeedbacks}
            savedWordMap={savedWordSet}
            soundEnabled={soundEnabled}
            onSentenceRead={handleSentenceRead}
            onSelectWord={(word) => setActiveWordPopup(word)}
            onNextPage={handleNextPageFromStory}
            onPrevPage={handlePrevPageFromStory}
          />
        )}

        {screen === 'question' && (
          <QuestionScreen
            question={currentQuestion}
            page={currentPage}
            answeredResult={questionAnswers[currentQuestion.id] || null}
            savedWordMap={savedWordSet}
            onAnswerQuestion={handleAnswerQuestion}
            onSelectWord={(word) => setActiveWordPopup(word)}
            onPrevPage={handlePrevFromQuestion}
            onContinue={handleContinueFromQuestion}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            score={correctQuestionsCount}
            totalQuestions={INFERENCE_QUESTIONS.length}
            savedWords={savedWords}
            sentencesReadCount={sentencesReadCount}
            totalSentencesCount={totalSentencesCount}
            badgeCount={badgeCount}
            onOpenWordBank={() => setIsWordBankOpen(true)}
            onOpenStoryRebuilder={() => setScreen('rebuilder')}
          />
        )}

        {screen === 'rebuilder' && (
          <StoryRebuilderScreen
            onBackToResult={() => setScreen('result')}
            onFinishRebuilder={() => setScreen('final')}
          />
        )}

        {screen === 'final' && (
          <FinalScreen
            badgeCount={badgeCount}
            onRestartStory={handleRestartStory}
            onOpenBookCatalog={() => setScreen('catalog')}
          />
        )}

        {screen === 'catalog' && (
          <BookCatalogScreen
            badgeCount={badgeCount}
            onBackToFinal={() => setScreen('final')}
            onSelectCurrentBook={handleRestartStory}
          />
        )}
      </main>

      {/* Word Definition Popup Modal (Supports story pages & question words) */}
      <WordModal
        word={activeWordPopup}
        isInBank={activeWordPopup ? savedWordSet.has(activeWordPopup.word.toLowerCase()) : false}
        onToggleBank={handleToggleWordBank}
        onClose={() => setActiveWordPopup(null)}
      />

      {/* Word Bank Drawer/Modal */}
      {isWordBankOpen && (
        <WordBankModal
          savedWords={savedWords}
          onRemoveWord={handleRemoveWordFromBank}
          onClose={() => setIsWordBankOpen(false)}
        />
      )}

      {/* Home Confirmation Modal */}
      <HomeConfirmModal
        isOpen={isHomeConfirmOpen}
        onConfirm={handleConfirmHome}
        onCancel={() => setIsHomeConfirmOpen(false)}
      />
    </div>
  );
}
