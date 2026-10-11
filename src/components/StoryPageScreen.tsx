import React, { useState, useEffect, useRef } from 'react';
import { StoryPage, WordDefinition, ReadingFeedback, StorySentence } from '../types';
import { Mic, MicOff, Volume2, ArrowLeft, ArrowRight, Star, RotateCcw, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { speakText, stopSpeaking, startSpeechRecognition, startAudioWithVolumeDetection, evaluateReading, SpeechRecognitionController, AudioRecorderController } from '../utils/speech';
import { sounds } from '../utils/soundEffects';

interface StoryPageScreenProps {
  page: StoryPage;
  totalPages: number;
  readSentenceIds: Set<string>;
  sentenceFeedbacks: Record<string, ReadingFeedback>;
  savedWordMap: Set<string>;
  soundEnabled: boolean;
  onSentenceRead: (sentenceId: string, feedback: ReadingFeedback) => void;
  onSelectWord: (word: WordDefinition) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const StoryPageScreen: React.FC<StoryPageScreenProps> = ({
  page,
  readSentenceIds,
  sentenceFeedbacks,
  savedWordMap,
  onSentenceRead,
  onSelectWord,
  onNextPage,
  onPrevPage,
}) => {
  // Active sentence being read/focused
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const activeSentence: StorySentence = page.sentences[activeSentenceIndex] || page.sentences[0];

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isPlayingModel, setIsPlayingModel] = useState<boolean>(false);
  const [isPlayingStudent, setIsPlayingStudent] = useState<boolean>(false);
  const [silenceDetected, setSilenceDetected] = useState<boolean>(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);

  // Controllers
  const recognitionRef = useRef<SpeechRecognitionController | null>(null);
  const audioRecorderRef = useRef<AudioRecorderController | null>(null);
  const studentAudioRef = useRef<HTMLAudioElement | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const recordingTargetIndexRef = useRef<number>(0);

  // Check if all sentences on this page have been read
  const allSentencesRead = page.sentences.every((s) => readSentenceIds.has(s.id));
  const currentSentenceFeedback = sentenceFeedbacks[activeSentence.id];

  // Identify next unread sentence index
  const nextUnreadSentenceIndex = page.sentences.findIndex(
    (s, idx) => idx > activeSentenceIndex && !readSentenceIds.has(s.id)
  );

  // Reset audio & select first unread sentence on page change
  useEffect(() => {
    stopSpeaking();
    if (studentAudioRef.current) {
      studentAudioRef.current.pause();
    }
    const firstUnread = page.sentences.findIndex((s) => !readSentenceIds.has(s.id));
    if (firstUnread !== -1) {
      setActiveSentenceIndex(firstUnread);
      recordingTargetIndexRef.current = firstUnread;
    } else {
      setActiveSentenceIndex(0);
      recordingTargetIndexRef.current = 0;
    }
    setSilenceDetected(false);
    setMicPermissionDenied(false);
  }, [page.pageNumber]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopSpeaking();
    };
  }, []);

  // Start recording for a specific sentence index
  const handleStartRecording = async (targetIndex = activeSentenceIndex) => {
    stopSpeaking();
    setActiveSentenceIndex(targetIndex);
    recordingTargetIndexRef.current = targetIndex;
    setSilenceDetected(false);
    setMicPermissionDenied(false);
    setInterimTranscript('');
    latestTranscriptRef.current = '';

    try {
      audioRecorderRef.current = await startAudioWithVolumeDetection();
    } catch (err: any) {
      console.warn('Microphone permission or support issue:', err);
      setMicPermissionDenied(true);
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    sounds.playRecordStart();

    // Start Web Speech API transcription
    recognitionRef.current = startSpeechRecognition({
      onInterim: (text) => {
        setInterimTranscript(text);
        latestTranscriptRef.current = text;
      },
      onFinal: (text) => {
        setInterimTranscript(text);
        latestTranscriptRef.current = text;
        finishRecording(text, targetIndex);
      },
      onError: (err) => {
        console.warn('Speech recognition warning:', err);
      },
      onEnd: () => {
        // Will be handled in finishRecording
      },
    });
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    finishRecording(latestTranscriptRef.current, recordingTargetIndexRef.current);
  };

  const finishRecording = async (transcript: string, sentenceIndex: number) => {
    if (!isRecording) return;
    sounds.playRecordStop();
    setIsRecording(false);
    setIsEvaluating(true);

    let audioResult = { blobUrl: null as string | null, hasSound: false, durationMs: 0, maxVolume: 0 };
    if (audioRecorderRef.current) {
      try {
        const res = await audioRecorderRef.current.stop();
        audioResult = {
          blobUrl: res.blobUrl,
          hasSound: res.hasSound,
          durationMs: res.durationMs,
          maxVolume: res.maxVolume,
        };
      } catch (e) {
        console.warn('Audio recorder stop error:', e);
      }
    }

    const hasTranscript = transcript.trim().length > 0;
    // Reliable sound detection: require real voice activity or non-empty transcript with audio signal
    const hasDetectedSound =
      (hasTranscript && (audioResult.maxVolume >= 0.015 || audioResult.durationMs >= 600)) ||
      (audioResult.hasSound && audioResult.durationMs >= 750);

    // Edge case: learner said nothing (no speech detected & sound was silent or too brief)
    if (!hasDetectedSound) {
      setIsEvaluating(false);
      setSilenceDetected(true);
      return;
    }

    const target = page.sentences[sentenceIndex] || page.sentences[0];
    // Extract key words ONLY belonging to THIS specific target sentence
    const targetTokens = new Set(target.text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));
    const keyWordStrings = page.underlinedWords
      .filter((w) => targetTokens.has(w.word.toLowerCase().trim()))
      .map((w) => w.word);

    const feedback = await evaluateReading(
      target.text,
      transcript || target.text,
      keyWordStrings,
      audioResult.blobUrl || undefined
    );

    // Strictly ensure practice words belong ONLY to THIS sentence
    const sanitizedPracticeWords = (feedback.practiceWords || []).filter((w) => targetTokens.has(w.toLowerCase().trim()));
    feedback.practiceWords = sanitizedPracticeWords.length > 0
      ? sanitizedPracticeWords.slice(0, 2)
      : keyWordStrings.slice(0, 2);

    setIsEvaluating(false);
    setActiveSentenceIndex(sentenceIndex);
    onSentenceRead(target.id, feedback);

    // Auto-play model reading of ONLY current sentence
    handlePlayModelReading(target.text);
  };

  const handlePlayModelReading = (text: string) => {
    setIsPlayingModel(true);
    speakText(text, {
      rate: 0.85,
      onEnd: () => setIsPlayingModel(false),
    });
  };

  const handlePlayStudentAudio = (url?: string) => {
    if (!url) return;
    if (studentAudioRef.current) {
      studentAudioRef.current.pause();
    }
    const audio = new Audio(url);
    studentAudioRef.current = audio;
    setIsPlayingStudent(true);
    audio.onended = () => setIsPlayingStudent(false);
    audio.play().catch(() => setIsPlayingStudent(false));
  };

  // Render sentence with clickable underlined words
  const renderSentenceWithUnderlinedWords = (sentence: StorySentence, isActive: boolean) => {
    const text = sentence.text;
    const words = text.split(/\b/);

    return (
      <p
        className={`text-lg sm:text-xl leading-relaxed font-story transition-all ${
          isActive
            ? 'text-slate-900 font-semibold'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {words.map((chunk, idx) => {
          const lowerChunk = chunk.toLowerCase().trim();
          const matchedDef = page.underlinedWords.find(
            (w) =>
              w.word.toLowerCase() === lowerChunk ||
              lowerChunk.startsWith(w.word.toLowerCase()) ||
              (w.word.toLowerCase() === 'enters' && lowerChunk === 'enters') ||
              (w.word.toLowerCase() === 'yard' && lowerChunk === 'yard')
          );

          if (matchedDef) {
            const isSaved = savedWordMap.has(matchedDef.word.toLowerCase());
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWord(matchedDef);
                }}
                className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-bold transition-all underline decoration-2 decoration-amber-400 underline-offset-4 cursor-pointer active:scale-95 ${
                  isSaved
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
                title="Tap to see Korean meaning and save to Word Bank"
              >
                {chunk}
              </button>
            );
          }
          return <span key={idx}>{chunk}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full px-3 py-2 sm:px-4">
      {/* Top half: Picture book illustration (WITHOUT any floating buttons covering it!) */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-amber-200/60 bg-amber-50/50 shrink-0">
        <img
          src={page.image}
          alt={page.imageAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none"
        />
      </div>

      {/* Bottom half: Story text sentences & Listen button below */}
      <div className="flex-1 flex flex-col justify-around py-2 gap-2">
        <div className="space-y-2">
          {page.sentences.map((sent, index) => {
            const isRead = readSentenceIds.has(sent.id);
            const isActive = index === activeSentenceIndex;
            return (
              <div
                key={sent.id}
                onClick={() => {
                  if (!isRecording) {
                    setActiveSentenceIndex(index);
                    setSilenceDetected(false);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-300 shadow-xs ring-2 ring-amber-400/20'
                    : 'bg-white/80 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {renderSentenceWithUnderlinedWords(sent, isActive)}
                  </div>
                  {isRead && (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Listen button located inside the bottom text area below story sentences */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => handlePlayModelReading(activeSentence.text)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
            title="Listen to this sentence read aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Listen to Sentence (올바른 발음 듣기)</span>
          </button>

          {page.sentences.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Sentence {activeSentenceIndex + 1} of {page.sentences.length}</span>
            </div>
          )}
        </div>

        {/* Silence Detection Alert with clearly visible Record again button */}
        {silenceDetected && !isRecording && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-1.5 text-rose-700 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>I couldn't hear you. Let's try again!</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-700 font-korean">
              목소리가 들리지 않았어요. 마이크 가까이에서 큰 소리로 다시 읽어볼까요?
            </p>
            <button
              onClick={() => handleStartRecording(activeSentenceIndex)}
              className="py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer font-korean"
            >
              <Mic className="w-4 h-4" />
              <span>Record again (다시 읽기)</span>
            </button>
          </div>
        )}

        {/* Microphone Permission Blocked Alert */}
        {micPermissionDenied && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Microphone Access Needed (마이크 권한 필요)</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 font-korean leading-relaxed">
              브라우저 상단의 마이크 권한을 허용한 후 다시 읽어주세요!
            </p>
            <button
              onClick={() => handleStartRecording(activeSentenceIndex)}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer font-korean"
            >
              <Mic className="w-4 h-4" />
              <span>Record again (마이크 허용 후 다시 읽기)</span>
            </button>
          </div>
        )}

        {/* AI Reading Coach Panel (Requirement 1: No "Reverse Echo" label, larger font size, per-sentence) */}
        {currentSentenceFeedback && !isRecording && !silenceDetected && (
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < currentSentenceFeedback.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-slate-800 ml-1">
                  AI Reading Coach
                </span>
                {page.sentences.length > 1 && (
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full ml-1">
                    Sentence {activeSentenceIndex + 1}
                  </span>
                )}
              </div>

              {/* Re-record button INSIDE the panel for the current sentence */}
              <button
                onClick={() => handleStartRecording(activeSentenceIndex)}
                className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
                title="Re-record this sentence"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Re-record</span>
              </button>
            </div>

            {/* Larger font size for feedback message */}
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
              {currentSentenceFeedback.feedbackMessage}
            </p>

            {/* Practice Words belonging strictly to this current sentence */}
            {(() => {
              const activeSentenceTokens = new Set(
                activeSentence.text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
              );
              const sentenceSpecificPracticeWords = (currentSentenceFeedback.practiceWords || []).filter((word) =>
                activeSentenceTokens.has(word.toLowerCase().trim())
              );
              if (sentenceSpecificPracticeWords.length === 0) return null;
              return (
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-slate-500 text-xs font-medium">Practice words:</span>
                  {sentenceSpecificPracticeWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => speakText(word, { rate: 0.8 })}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>{word}</span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Larger Korean Tip */}
            <p className="text-xs sm:text-sm text-amber-900 font-korean bg-amber-50/80 p-2.5 rounded-xl leading-relaxed">
              💡 {currentSentenceFeedback.koreanTip}
            </p>

            {/* Audio Comparison Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handlePlayModelReading(activeSentence.text)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors font-korean ${
                  isPlayingModel
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingModel ? '재생 중...' : '올바른 발음 확인'}</span>
              </button>

              {currentSentenceFeedback.audioBlobUrl && (
                <button
                  onClick={() => handlePlayStudentAudio(currentSentenceFeedback.audioBlobUrl)}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                    isPlayingStudent
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{isPlayingStudent ? '재생 중...' : 'My Voice'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Live Recording Pulse */}
        {isRecording && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-center space-y-2 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Listening... Speak the sentence clearly!</span>
            </div>
            {interimTranscript && (
              <p className="text-base font-story text-slate-800 italic">
                "{interimTranscript}"
              </p>
            )}
          </div>
        )}

        {isEvaluating && (
          <div className="bg-white border border-amber-200 rounded-2xl p-3 text-center text-xs text-amber-800 font-medium">
            <span>✨ AI is listening and preparing your feedback...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Previous, Record, Next) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Previous Button (Hidden on page 1) */}
        {page.pageNumber > 1 ? (
          <button
            onClick={() => {
              sounds.playPageFlip();
              onPrevPage();
            }}
            className="h-11 px-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <div className="w-20" />
        )}

        {/* Center CTA Button:
            - If recording: [Done Reading]
            - If active sentence is read AND there is a next unread sentence: [🎤 Record Sentence 2]
            - Otherwise: [🎤 Record] for active sentence
        */}
        <div className="flex-1 flex justify-center">
          {isRecording ? (
            <button
              onClick={handleStopRecording}
              className="h-12 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/30 active:scale-95 transition-transform"
            >
              <MicOff className="w-5 h-5 animate-bounce" />
              <span>Done Reading (완료)</span>
            </button>
          ) : silenceDetected || micPermissionDenied ? (
            <button
              onClick={() => handleStartRecording(activeSentenceIndex)}
              className="h-12 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all font-korean cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              <span>Record again (다시 읽기)</span>
            </button>
          ) : readSentenceIds.has(activeSentence.id) && nextUnreadSentenceIndex !== -1 ? (
            /* Requirement 6: Show [🎤 Record] button for the NEXT sentence! */
            <button
              onClick={() => handleStartRecording(nextUnreadSentenceIndex)}
              className="h-12 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>Record Sentence {nextUnreadSentenceIndex + 1} (다음 문장)</span>
            </button>
          ) : (
            <button
              onClick={() => handleStartRecording(activeSentenceIndex)}
              className={`h-12 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
                readSentenceIds.has(activeSentence.id)
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>
                {readSentenceIds.has(activeSentence.id)
                  ? 'Re-record (다시 읽기)'
                  : 'Record (소리 내어 읽기)'}
              </span>
            </button>
          )}
        </div>

        {/* Next Button (Unlocked only after every sentence on the page is read) */}
        <button
          onClick={() => {
            if (allSentencesRead && !silenceDetected && !micPermissionDenied) {
              sounds.playPageFlip();
              onNextPage();
            }
          }}
          disabled={!allSentencesRead || silenceDetected || micPermissionDenied}
          className={`h-11 px-4 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            allSentencesRead && !silenceDetected && !micPermissionDenied
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 cursor-pointer active:scale-95'
              : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed'
          }`}
          title={allSentencesRead ? 'Proceed to next page' : 'Please read all sentences on this page first'}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
