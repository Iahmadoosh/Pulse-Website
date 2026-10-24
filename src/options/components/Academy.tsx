import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, GraduationCap, XCircle, RotateCcw, Unlock } from "lucide-react";
import { LESSONS, GLOSSARY_BY_ID, type Lesson } from "../../lib/options/academy";
import { LessonWidgetView, type LiveContext } from "./AcademyWidgets";
import { Callout, TermTip } from "./common";
import type { OptionsTheme } from "./ui";

function Quiz({
  theme,
  lesson,
  passed,
  onPass,
}: {
  theme: OptionsTheme;
  lesson: Lesson;
  passed: boolean;
  onPass: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allAnswered = lesson.quiz.every((q) => answers[q.id] !== undefined);
  const correct = lesson.quiz.filter((q) => answers[q.id] === q.answer).length;
  const allCorrect = correct === lesson.quiz.length;

  return (
    <div className="space-y-4">
      {lesson.quiz.map((q, qi) => {
        const picked = answers[q.id];
        const answered = picked !== undefined;
        return (
          <div key={q.id} className={`rounded-xl border p-4 ${theme.border}`}>
            <div className={`text-sm font-semibold mb-2 ${theme.strong}`}>
              {qi + 1}. {q.prompt}
            </div>
            <div className="grid gap-1.5">
              {q.choices.map((choice, ci) => {
                const isPicked = picked === ci;
                const isRight = ci === q.answer;
                let cls = theme.chip;
                if (answered && isPicked && isRight) cls = theme.okBox;
                else if (answered && isPicked && !isRight) cls = theme.dangerBox;
                return (
                  <button
                    type="button"
                    key={ci}
                    disabled={answered}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: ci }))}
                    className={`text-left text-xs px-3 py-2 rounded-md flex items-center gap-2 disabled:cursor-default ${cls}`}
                  >
                    {answered && isPicked ? (
                      isRight ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    )}
                    {choice}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={`mt-2 text-xs font-semibold ${theme.accent}`}>
                {picked === q.answer ? "Correct. " : "Not quite. "}
                <span className={theme.muted}>{q.explanation}</span>
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && !allCorrect && (
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-sm ${theme.muted}`}>
            {correct} of {lesson.quiz.length} correct. Review the explanations and try the missed questions again.
          </span>
          <button
            type="button"
            onClick={() =>
              setAnswers((a) => Object.fromEntries(Object.entries(a).filter(([id, v]) => lesson.quiz.find((q) => q.id === id)?.answer === v)))
            }
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-2 rounded-lg ${theme.chip}`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry missed
          </button>
        </div>
      )}
      {allCorrect && !passed && (
        <button
          type="button"
          onClick={onPass}
          className="inline-flex items-center gap-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Mark lesson complete
        </button>
      )}
    </div>
  );
}

export function Academy({
  theme,
  completed,
  onComplete,
  onGoToDesk,
  live,
}: {
  theme: OptionsTheme;
  completed: string[];
  onComplete: (lessonId: string) => void;
  onGoToDesk: () => void;
  live: LiveContext;
}) {
  const firstOpen = LESSONS.find((l) => !completed.includes(l.id))?.id ?? LESSONS[0].id;
  const [lessonId, setLessonId] = useState(firstOpen);
  const [step, setStep] = useState(0);
  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[0];
  const lessonIndex = LESSONS.indexOf(lesson);
  const inQuiz = step >= lesson.steps.length;
  const current = inQuiz ? null : lesson.steps[step];
  const done = completed.length;
  const allDone = LESSONS.every((l) => completed.includes(l.id));
  const passed = completed.includes(lesson.id);

  const openLesson = (id: string) => {
    setLessonId(id);
    setStep(0);
  };

  const nextLesson = useMemo(() => LESSONS[lessonIndex + 1] ?? null, [lessonIndex]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4">
      <aside className={`${theme.card} p-4 h-fit`}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className={`w-5 h-5 ${theme.accent}`} />
          <div>
            <div className={`font-display text-sm font-bold ${theme.strong}`}>Options Academy</div>
            <div className={`text-[11px] ${theme.faint}`}>
              {done} of {LESSONS.length} lessons passed
            </div>
          </div>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${theme.progressTrack}`}>
          <div className={`h-full transition-all ${theme.progressFill}`} style={{ width: `${(done / LESSONS.length) * 100}%` }} />
        </div>
        <nav className="space-y-1">
          {LESSONS.map((l, i) => {
            const isDone = completed.includes(l.id);
            const isActive = l.id === lesson.id;
            return (
              <button
                type="button"
                key={l.id}
                onClick={() => openLesson(l.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2 ${isActive ? theme.chipActive : theme.hoverBg}`}
              >
                {isDone ? (
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-white" : theme.accent}`} />
                ) : (
                  <span
                    className={`w-4 h-4 mt-0.5 shrink-0 rounded-full border text-[9px] font-bold flex items-center justify-center ${
                      isActive ? "border-white/70 text-white" : `${theme.border} ${theme.faint}`
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                <span>
                  <span className={`block text-xs font-semibold ${isActive ? "" : theme.strong}`}>{l.title}</span>
                  <span className={`block text-[10.5px] ${isActive ? "text-white/80" : theme.faint}`}>
                    {l.steps.length} steps · quiz · ~{l.minutes} min
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
        {allDone && (
          <div className="mt-3 space-y-2">
            <Callout theme={theme} tone="ok">
              Academy complete. The $300 challenge is unlocked.
            </Callout>
            <button
              type="button"
              onClick={onGoToDesk}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5"
            >
              <Unlock className="w-4 h-4" /> Go to the trading desk
            </button>
          </div>
        )}
      </aside>

      <section className={`${theme.card} p-4 sm:p-6 min-w-0`}>
        <div className={`text-[11px] font-bold uppercase tracking-wider ${theme.accent}`}>
          Lesson {lessonIndex + 1} · {inQuiz ? "Quiz" : `Step ${step + 1} of ${lesson.steps.length}`}
          {passed && <span className={`ml-2 ${theme.accent}`}>✓ Passed</span>}
        </div>
        <h2 className={`font-display text-xl sm:text-2xl font-bold mt-1 ${theme.strong}`}>{inQuiz ? `${lesson.title}: check your understanding` : current!.title}</h2>
        {!inQuiz && step === 0 && <p className={`text-sm mt-1 ${theme.faint}`}>{lesson.summary}</p>}

        <div className="flex gap-1 mt-3 mb-5" aria-hidden>
          {[...lesson.steps, null].map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? theme.progressFill : theme.progressTrack}`} />
          ))}
        </div>

        {current && (
          <div className="space-y-4">
            <div
              className={`text-[15px] leading-relaxed space-y-3 ${theme.muted} [&_strong]:font-semibold [&_strong]:text-[#2A1B1E] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:marker:text-[#7A1F2E] [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:marker:text-[#7A1F2E] [&_ol]:marker:font-bold`}
            >
              <ReactMarkdown>{current.body}</ReactMarkdown>
            </div>
            {current.widget && <LessonWidgetView widget={current.widget} theme={theme} live={live} />}
            {current.callout && (
              <Callout theme={theme} tone={current.callout.tone}>
                {current.callout.text}
              </Callout>
            )}
            {current.terms && current.terms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] font-semibold ${theme.faint}`}>Key terms:</span>
                {current.terms
                  .filter((id) => GLOSSARY_BY_ID[id])
                  .map((id) => (
                    <span key={id} className={`text-[11px] px-2 py-0.5 rounded-full ${theme.chip}`}>
                      <TermTip id={id} theme={theme}>
                        {GLOSSARY_BY_ID[id].term}
                      </TermTip>
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

        {inQuiz && (
          <Quiz
            key={lesson.id}
            theme={theme}
            lesson={lesson}
            passed={passed}
            onPass={() => onComplete(lesson.id)}
          />
        )}

        {inQuiz && passed && (
          <div className="mt-4">
            <Callout theme={theme} tone="ok">
              Lesson passed.{" "}
              {nextLesson ? `Next up: ${nextLesson.title}.` : allDone ? "You've finished every lesson. The challenge is unlocked." : "Finish the remaining lessons to unlock the challenge."}
            </Callout>
          </div>
        )}

        <div className={`flex justify-between gap-2 mt-6 pt-4 border-t ${theme.border}`}>
          <button
            type="button"
            disabled={step === 0 && lessonIndex === 0}
            onClick={() => {
              if (step > 0) setStep(step - 1);
              else if (lessonIndex > 0) {
                const prev = LESSONS[lessonIndex - 1];
                setLessonId(prev.id);
                setStep(prev.steps.length);
              }
            }}
            className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-3 py-2 rounded-lg disabled:opacity-40 ${theme.chip}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {!inQuiz ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase px-4 py-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white"
            >
              {step === lesson.steps.length - 1 ? "Take the quiz" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>
          ) : nextLesson ? (
            <button
              type="button"
              disabled={!passed}
              onClick={() => openLesson(nextLesson.id)}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase px-4 py-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next lesson <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allDone}
              onClick={onGoToDesk}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase px-4 py-2 rounded-lg bg-[#7A1F2E] hover:bg-[#5A1420] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Go to the trading desk <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
