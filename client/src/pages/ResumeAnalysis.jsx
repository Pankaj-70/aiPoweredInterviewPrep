import axios from "axios";
import React, { useState } from "react";
import {
  FaUserTie, FaMicrophone, FaChartLine,
  FaFilePdf, FaRocket, FaArrowRight, FaTimes, FaCheckCircle
} from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { setInterviewData } from "../redux/interviewSlice";
import { useNavigate, Navigate } from "react-router-dom";

const ResumeAnalysis = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Auth guard — redirect immediately if not logged in
  if (!userData) return <Navigate to="/auth" replace />;

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("Technical");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const isDisabled = !role || !experience || !type;

  const handleStartInterview = async () => {
    if (isDisabled) return;
    setStarting(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/interview/generate-questions`,
        { role, experience, mode: type, resumeText, projects, skills },
        { withCredentials: true }
      );
      dispatch(setInterviewData(res.data));
      dispatch(setUserData({ ...userData, credits: res.data.creditsLeft }));
      navigate("/interview");
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setStarting(false);
    }
  };

  const analyzeResumeFunc = async (f) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", f);
      const res = await axios.post(`${serverUrl}/api/interview/resume`, formData, {
        withCredentials: true,
      });
      setAnalysis(res.data);
      setRole(res.data.role || "");
      setExperience(res.data.experience || "");
      setFile(f);
      setResumeText(res.data.resumeText || "");
      setProjects(res.data.projects || []);
      setSkills(res.data.skills || []);
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      analyzeResumeFunc(dropped);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .ra-root { font-family: 'DM Sans', sans-serif; }
        .ra-display { font-family: 'Bricolage Grotesque', sans-serif; }

        /* Page background */
        .ra-page {
          min-height: 100vh;
          background: #0a0e1a;
          background-image:
            radial-gradient(ellipse 70% 50% at 15% 10%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(16,185,129,0.12) 0%, transparent 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        /* Card */
        .ra-card {
          width: 100%;
          max-width: 1000px;
          display: flex;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
        }

        /* Inputs */
        .ra-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 11px 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ra-input-wrap:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .ra-input-wrap input,
        .ra-input-wrap select {
          background: transparent;
          border: none;
          outline: none;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .ra-input-wrap input::placeholder { color: #475569; }
        .ra-input-wrap select option { background: #1e293b; color: #f1f5f9; }

        /* Upload zone */
        .ra-upload {
          border: 2px dashed rgba(99,102,241,0.3);
          border-radius: 16px;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(99,102,241,0.04);
        }
        .ra-upload:hover, .ra-upload.dragover {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
        }

        /* Tag pill */
        .skill-tag {
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          border-radius: 99px;
          padding: 3px 10px;
          font-size: 12px;
          font-weight: 500;
        }

        /* Pulse loader */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Scan animation on analyzing */
        @keyframes scanLine {
          0% { top: 0; opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          animation: scanLine 1.6s ease-in-out infinite;
          pointer-events: none;
        }

        /* Fade up */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        /* CTA button */
        .ra-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Bricolage Grotesque', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          letter-spacing: -0.3px;
        }
        .ra-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(99,102,241,0.35);
        }
        .ra-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Analysis info card */
        .info-card {
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      <div className="ra-root ra-page">
        <div className="ra-card">

          {/* ── LEFT PANEL ── */}
          <div
            style={{
              width: "42%",
              background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
              padding: "48px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient glow */}
            <div style={{
              position: "absolute", top: -80, right: -80,
              width: 280, height: 280, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -60, left: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              {/* Badge */}
              <div className="fade-up inline-flex items-center gap-2 mb-8"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 99,
                  padding: "5px 12px",
                }}>
                <BsStars size={12} color="#a5b4fc" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.8px" }}>
                  AI INTERVIEW PREP
                </span>
              </div>

              <h1
                className="ra-display fade-up delay-1"
                style={{
                  fontSize: 32, fontWeight: 800,
                  color: "#f8fafc",
                  lineHeight: 1.15,
                  letterSpacing: "-1px",
                  marginBottom: 14,
                }}
              >
                Land Your
                <span style={{
                  display: "block",
                  background: "linear-gradient(135deg, #818cf8, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Dream Role
                </span>
              </h1>

              <p
                className="fade-up delay-2"
                style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 300, marginBottom: 36 }}
              >
                Upload your resume and let AI tailor a mock interview specifically to your background and target role.
              </p>

              {/* Feature list */}
              {[
                { icon: <FaRocket size={13} />, color: "#818cf8", text: "Smart role & skill detection" },
                { icon: <FaMicrophone size={13} />, color: "#34d399", text: "Real-time voice interview" },
                { icon: <FaChartLine size={13} />, color: "#fbbf24", text: "Instant performance feedback" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`fade-up delay-${i + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: 10,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* User info strip */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                position: "relative",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #10b981)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                flexShrink: 0,
              }}>
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", margin: 0 }}>
                  {userData?.name}
                </p>
                <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>
                  {userData?.credits ?? 0} credits remaining
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div
            style={{
              flex: 1,
              background: "#0d1117",
              padding: "40px 36px",
              overflowY: "auto",
              maxHeight: "90vh",
            }}
          >
            {analyzing ? (
              /* ── ANALYZING STATE ── */
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 20,
                position: "relative",
              }}>
                <div style={{ position: "relative" }}>
                  <div className="spinner" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
                    Analyzing your resume…
                  </p>
                  <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
                    Extracting skills, projects & role
                  </p>
                </div>
                {/* Mini progress pills */}
                {["Reading document", "Extracting skills", "Detecting role"].map((step, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 12, color: "#64748b",
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#6366f1",
                      animation: `spin ${0.8 + i * 0.3}s linear infinite`,
                    }} />
                    {step}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div className="fade-up" style={{ marginBottom: 4 }}>
                  <h2 className="ra-display" style={{
                    fontSize: 20, fontWeight: 700, color: "#f8fafc",
                    letterSpacing: "-0.5px", margin: 0,
                  }}>
                    Set up your session
                  </h2>
                  <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0" }}>
                    Fill in the details or upload a resume to auto-fill
                  </p>
                </div>

                {/* ROLE */}
                <div className="fade-up delay-1">
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>
                    TARGET ROLE
                  </label>
                  {analysis ? (
                    <div className="info-card" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                      <FaCheckCircle size={14} color="#818cf8" />
                      <span style={{ fontSize: 14, color: "#c7d2fe", fontWeight: 500 }}>{analysis.role}</span>
                    </div>
                  ) : (
                    <div className="ra-input-wrap">
                      <MdWorkOutline size={16} color="#475569" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Frontend Engineer, Data Scientist…"
                      />
                    </div>
                  )}
                </div>

                {/* EXPERIENCE */}
                <div className="fade-up delay-1">
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>
                    EXPERIENCE LEVEL
                  </label>
                  {analysis ? (
                    <div className="info-card" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <FaCheckCircle size={14} color="#34d399" />
                      <span style={{ fontSize: 14, color: "#6ee7b7", fontWeight: 500 }}>{analysis.experience}</span>
                    </div>
                  ) : (
                    <div className="ra-input-wrap">
                      <FaUserTie size={14} color="#475569" />
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 2 years, Fresher, Senior…"
                      />
                    </div>
                  )}
                </div>

                {/* INTERVIEW TYPE */}
                <div className="fade-up delay-2">
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>
                    INTERVIEW TYPE
                  </label>
                  <div className="ra-input-wrap">
                    <HiOutlineAcademicCap size={16} color="#475569" />
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option>Technical</option>
                      <option>HR</option>
                    </select>
                  </div>
                </div>

                {/* FILE UPLOAD */}
                <div className="fade-up delay-2">
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>
                    RESUME (OPTIONAL)
                  </label>
                  {!file ? (
                    <label
                      className={`ra-upload ${dragOver ? "dragover" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      style={{ display: "block" }}
                    >
                      <FaFilePdf size={28} color="#ef4444" style={{ marginBottom: 10 }} />
                      <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 4px" }}>
                        <span style={{ color: "#818cf8", fontWeight: 600 }}>Click to upload</span> or drag & drop
                      </p>
                      <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>PDF only · Auto-fills all fields</p>
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) { setFile(f); analyzeResumeFunc(f); }
                        }}
                      />
                    </label>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FaFilePdf color="#ef4444" size={16} />
                        <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 500 }}>{file.name}</span>
                      </div>
                      <button
                        onClick={() => { setFile(null); setAnalysis(null); setRole(""); setExperience(""); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* PROJECTS */}
                {analysis?.projects?.length > 0 && (
                  <div className="fade-up" style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "16px",
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", marginBottom: 10 }}>
                      DETECTED PROJECTS
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {analysis.projects.map((p, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                          <span style={{ color: "#6366f1", marginTop: 2 }}>▸</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* SKILLS */}
                {analysis?.skills?.length > 0 && (
                  <div className="fade-up" style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "16px",
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.8px", marginBottom: 10 }}>
                      DETECTED SKILLS
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {analysis.skills.map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* START BUTTON */}
                <button
                  className="ra-btn fade-up delay-3"
                  disabled={isDisabled || starting}
                  onClick={handleStartInterview}
                  style={{
                    background: isDisabled || starting
                      ? "rgba(255,255,255,0.06)"
                      : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: isDisabled || starting ? "#334155" : "#fff",
                    marginTop: 4,
                  }}
                >
                  {starting ? (
                    <>
                      <div style={{
                        width: 16, height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Generating questions…
                    </>
                  ) : (
                    <>
                      Start AI Interview <FaArrowRight size={12} />
                    </>
                  )}
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ResumeAnalysis;