import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import interviewerVideo from "../assets/interviewer.mp4";
import { useDispatch, useSelector } from 'react-redux';
import  axios  from 'axios';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from "../App";
import { setFeedbackData } from "../redux/interviewSlice";

const Interview = () => {
  const interviewData = useSelector((state) => state.interview.interviewData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [interimAnswer, setInterimAnswer] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const dispatch = useDispatch();

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const finalTranscriptRef = useRef("");
  // ✅ Ref to track mic state without stale closure issues
  const micActiveRef = useRef(false);

  const currentQuestion = interviewData.questions[currentIndex];

  const difficultyColor = {
    easy: "#22c55e",
    medium: "#f59e0b",
    hard: "#ef4444",
  };

  const navigate = useNavigate();

  // ─── TTS via Web Speech API (reliable, no CORS) ───────────────────────────
  const speak = useCallback((text, callback) => {
    if (!text) { callback?.(); return; }

    stopListening();
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick a natural-sounding female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("google us english"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setIsSpeaking(false);
      callback?.();
    };

    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setIsSpeaking(false);
      callback?.();
    };

    // Chrome bug: long utterances get cut off — chunking fix
    if (text.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
      let i = 0;
      const speakNext = () => {
        if (i >= sentences.length) { setIsSpeaking(false); callback?.(); return; }
        const u = new SpeechSynthesisUtterance(sentences[i++].trim());
        u.lang = "en-US"; u.rate = 0.95; u.pitch = 1.05;
        if (preferred) u.voice = preferred;
        u.onend = speakNext;
        window.speechSynthesis.speak(u);
      };
      speakNext();
      return;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── Speech Recognition ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { console.warn("SpeechRecognition not supported."); return; }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += t + " ";
        } else {
          interim += t;
        }
      }
      setFinalAnswer(finalTranscriptRef.current);
      setInterimAnswer(interim);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      if (event.error === "not-allowed") {
        micActiveRef.current = false;
        setMicOn(false);
      }
    };

    recognition.onend = () => {
      setInterimAnswer("");
      // Auto-restart only if mic should still be on
      if (micActiveRef.current) {
        try { recognition.start(); } catch (e) { console.warn("Restart failed:", e); }
      } else {
        setMicOn(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    micActiveRef.current = true;
    setMicOn(true);
  }, []);

  const stopListening = useCallback(() => {
    micActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setMicOn(false);
    setInterimAnswer("");
  }, []);

  // ─── Question Flow ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentQuestion) return;

    finalTranscriptRef.current = "";
    setFinalAnswer("");
    setInterimAnswer("");

    const startFlow = () => {
      speak(currentQuestion.question, () => {
        setTimeLeft(currentQuestion.timeLimit);
        setTimeout(startListening, 600);
      });
    };

    if (currentIndex === 0) {
      // Voices may not be loaded yet on first render
      const trySpeak = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speak("Hello, I am Meera. I will be taking your interview today.", startFlow);
        } else {
          window.speechSynthesis.onvoiceschanged = () =>
            speak("Hello, I am Meera. I will be taking your interview today.", startFlow);
        }
      };
      trySpeak();
    } else {
      startFlow();
    }
  }, [currentIndex]);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const timerPercent =
    currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 100;
  const isTimerLow = timeLeft > 0 && timeLeft <= 10;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    stopListening();
    const submittedAnswer = finalTranscriptRef.current.trim();
    const res = await axios.post(`${serverUrl}/api/interview/submit-answer`, 
      {
        interviewId: interviewData.interviewId,
        questionIndex: currentIndex,
        answer: submittedAnswer,
        timeTaken: interviewData.questions[currentIndex].timeLimit 
      }, {withCredentials: true}
    );
    console.log(res?.data);
    setFeedback(res?.data?.feedback || "Structured well but could do better.")    
  };

  const handleNext = () => {
    stopListening();
    setFinalAnswer("");
    setInterimAnswer("");
    setFeedback(null);
    setCurrentIndex((p) => p + 1);
  };

  const handleReport = async() => {
    stopListening();
    setIsFinished(true);
    const res = await axios.post(`${serverUrl}/api/interview/finish`, 
      {
        interviewId: interviewData.interviewId,
      }, {withCredentials: true}
    );
    console.log(res?.data);
    dispatch(setFeedbackData(res?.data));
    navigate("/report");
  };

  const toggleMic = () => {
    if (micOn) stopListening();
    else startListening();
  };

  
  return (
    <div style={styles.page}>
      {/* Progress bar */}
      <div style={styles.progressBar}>
        {interviewData.questions.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.progressDot,
              background:
                i < currentIndex
                  ? "#6366f1"
                  : i === currentIndex
                  ? "#a5b4fc"
                  : "rgba(255,255,255,0.15)",
              transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      <div style={styles.card}>
        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>
          {/* Video — always plays */}
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              style={{
                ...styles.video,
                filter: isSpeaking
                  ? "brightness(1.05) saturate(1.1)"
                  : "brightness(0.65) saturate(0.4)",
                transition: "filter 0.5s ease",
              }}
              src={interviewerVideo}
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Speaking indicator */}
            {isSpeaking && (
              <div style={styles.speakingBadge}>
                <span style={styles.speakingDot} />
                Speaking…
              </div>
            )}
            {/* Difficulty badge */}
            <div
              style={{
                ...styles.diffBadge,
                background: difficultyColor[currentQuestion.difficulty] + "30",
                border: `1px solid ${difficultyColor[currentQuestion.difficulty]}60`,
                color: difficultyColor[currentQuestion.difficulty],
              }}
            >
              {currentQuestion.difficulty.toUpperCase()}
            </div>
          </div>

          {/* Timer */}
          <div style={styles.timerBox}>
            <div style={styles.timerTrack}>
              <div
                style={{
                  ...styles.timerFill,
                  width: `${timerPercent}%`,
                  background: isTimerLow
                    ? "#ef4444"
                    : timerPercent > 50
                    ? "#6366f1"
                    : "#f59e0b",
                  transition: "width 1s linear, background 0.5s ease",
                }}
              />
            </div>
            <span
              style={{
                ...styles.timerText,
                color: isTimerLow ? "#ef4444" : "#fff",
                animation: isTimerLow ? "pulse 1s infinite" : "none",
              }}
            >
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={styles.rightPanel}>
          {/* Question */}
          <div style={styles.questionBox}>
            <span style={styles.qLabel}>
              Q{currentIndex + 1} / {interviewData.questions.length}
            </span>
            <p style={styles.questionText}>{currentQuestion.question}</p>
          </div>

          {/* Answer textarea — shows final + interim separately */}
          <div style={styles.answerBox}>
            <span style={{ color: "#e2e8f0" }}>
              {finalTranscriptRef.current}
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
              {interimAnswer}
            </span>
            {!finalTranscriptRef.current && !interimAnswer && (
              <span style={{ color: "rgba(255,255,255,0.25)" }}>
                Speak or type your answer…
              </span>
            )}
            {/* Editable overlay for manual typing */}
            <textarea
              value={finalTranscriptRef.current + interimAnswer}
              onChange={(e) => {
                finalTranscriptRef.current = e.target.value;
                setFinalAnswer(e.target.value);
                setInterimAnswer("");
              }}
              style={styles.hiddenTextarea}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div style={styles.feedbackBox}>
              <span style={{ fontSize: 18 }}>💡</span> {feedback}
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            {!feedback ? (
              <button style={styles.primaryBtn} onClick={handleSubmit}>
                Submit Answer
              </button>
            ) : currentIndex < interviewData.questions.length - 1 ? (
              <button style={{ ...styles.primaryBtn, background: "#f59e0b" }} onClick={handleNext}>
                Next Question →
              </button>
            ) : (
              <button style={{ ...styles.primaryBtn, background: "#8b5cf6" }} onClick={handleReport}>
                Get Report
              </button>
            )}

            {/* Mic button */}
            <button
              onClick={toggleMic}
              style={{
                ...styles.micBtn,
                background: micOn ? "#ef444420" : "#22c55e20",
                border: `2px solid ${micOn ? "#ef4444" : "#22c55e"}`,
                boxShadow: micOn
                  ? "0 0 0 6px rgba(239,68,68,0.15), 0 0 20px rgba(239,68,68,0.2)"
                  : "none",
              }}
            >
              {micOn ? (
                <FaMicrophoneSlash color="#ef4444" size={18} />
              ) : (
                <FaMicrophone color="#22c55e" size={18} />
              )}
              {micOn && <span style={styles.micPulse} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  progressBar: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  card: {
    width: "100%",
    maxWidth: 1100,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
    padding: 28,
    display: "flex",
    gap: 24,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  leftPanel: {
    width: "45%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    background: "#000",
    position: "relative",
    minHeight: 260,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  speakingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    animation: "pulse 1s infinite",
  },
  diffBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: 1,
  },
  timerBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  timerTrack: {
    height: 4,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRadius: 4,
  },
  timerText: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 2,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  questionBox: {
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 14,
    padding: "14px 18px",
  },
  qLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#a5b4fc",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
  },
  questionText: {
    color: "#f1f5f9",
    fontSize: 16,
    lineHeight: 1.6,
    margin: 0,
  },
  answerBox: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    lineHeight: 1.7,
    minHeight: 120,
    position: "relative",
    cursor: "text",
  },
  hiddenTextarea: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    resize: "none",
    cursor: "text",
    padding: "14px 16px",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "transparent",
    caretColor: "#6366f1",
    zIndex: 2,
  },
  feedbackBox: {
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#86efac",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.3s ease",
  },
  micPulse: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2px solid #ef4444",
    animation: "ripple 1.5s infinite",
    pointerEvents: "none",
  },
  finishedCard: {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 60,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

export default Interview;