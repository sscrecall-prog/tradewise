import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { AcademyLesson } from "../types";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Award,
  ChevronRight
} from "lucide-react";

export const AcademyPage: React.FC = () => {
  const { academyLessons, completeAcademyLesson } = useApp();

  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson | null>(
    academyLessons.length > 0 ? academyLessons[0] : null
  );

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const completedCount = academyLessons.filter(l => l.isCompleted).length;
  const progressPercent = academyLessons.length > 0 ? Math.round((completedCount / academyLessons.length) * 100) : 0;

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedLesson) return;
    setShowResults(true);

    let score = 0;
    selectedLesson.quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score++;
      }
    });

    const percent = Math.round((score / selectedLesson.quiz.length) * 100);
    await completeAcademyLesson(selectedLesson.id, percent);
  };

  const handleSelectLesson = (lesson: AcademyLesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-brand-accent" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Trader Academy & Knowledge Base
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
            Indian Stock Market Mastery Curriculum
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Essential concepts: Market mechanics, STT & regulatory friction, option Greeks, and risk rules
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bg-secondary p-3.5 rounded-2xl border border-border-subtle">
          <div>
            <span className="text-[10px] text-text-muted block">Curriculum Progress</span>
            <span className="text-base font-extrabold text-text-primary">
              {completedCount} / {academyLessons.length} Completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-accent/15 border border-brand-accent/30 text-brand-accent flex items-center justify-center font-bold text-sm">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Main Grid: Lessons Sidebar + Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons List (1 col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block px-1">
            Modules & Lessons
          </span>

          <div className="space-y-2">
            {academyLessons.map(lesson => {
              const isSelected = selectedLesson?.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-bg-card border-brand-accent shadow-sm"
                      : "bg-bg-card/60 border-border-subtle hover:border-border-subtle hover:bg-bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        lesson.isCompleted
                          ? "bg-brand-positive/20 text-brand-positive"
                          : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {lesson.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : lesson.level}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary block line-clamp-1">
                        {lesson.title}
                      </span>
                      <span className="text-[11px] text-text-muted">{lesson.readTime} read</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Lesson Detail & Interactive Quiz (2 cols) */}
        {selectedLesson && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="accent" size="sm">Level {selectedLesson.level}</Badge>
                  <span className="text-xs text-text-muted">{selectedLesson.levelTitle}</span>
                </div>
                <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {selectedLesson.summary}
                </p>
              </div>

              {/* Lesson Body */}
              <div className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle space-y-3 text-xs text-text-primary leading-relaxed whitespace-pre-wrap font-sans">
                {selectedLesson.contentMarkdown}
              </div>

              {/* Example Scenario */}
              {selectedLesson.exampleScenario && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">
                    Real Market Scenario (Indian Context)
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {selectedLesson.exampleScenario}
                  </p>
                </div>
              )}

              {/* Key Takeaways */}
              {selectedLesson.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Key Institutional Rules
                  </span>
                  <div className="space-y-1.5">
                    {selectedLesson.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-positive flex-shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* End of Lesson Interactive Quiz */}
              {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
                <div className="pt-4 border-t border-border-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-accent" />
                      Discipline & Knowledge Check ({selectedLesson.quiz.length} Questions)
                    </h4>
                    {selectedLesson.quizScore !== undefined && (
                      <Badge variant="positive" size="sm">Score: {selectedLesson.quizScore}%</Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedLesson.quiz.map((q, qIdx) => (
                      <div key={q.id} className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-2.5">
                        <span className="text-xs font-bold text-text-primary block">
                          {qIdx + 1}. {q.question}
                        </span>

                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[q.id] === oIdx;
                            const isCorrect = q.correctOptionIndex === oIdx;

                            let optionClass = "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary";
                            if (showResults) {
                              if (isCorrect) optionClass = "bg-brand-positive/20 border-brand-positive text-brand-positive font-bold";
                              else if (isSelected && !isCorrect) optionClass = "bg-brand-negative/20 border-brand-negative text-brand-negative";
                            } else if (isSelected) {
                              optionClass = "bg-brand-accent/20 border-brand-accent text-brand-accent font-bold";
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, oIdx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${optionClass}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {showResults && (
                          <p className="text-[11px] text-text-muted mt-2 pt-2 border-t border-border-subtle/50">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    {!showResults ? (
                      <Button
                        variant="primary"
                        onClick={handleSubmitQuiz}
                        icon={<Sparkles className="w-4 h-4" />}
                      >
                        Submit Answers
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowResults(false);
                          setSelectedAnswers({});
                        }}
                      >
                        Retake Quiz
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
