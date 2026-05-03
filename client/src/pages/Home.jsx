import Navbar from "../components/Navbar";
import { FaUserTie, FaMicrophone, FaClock, FaFilePdf, FaChartLine, FaArrowRight } from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFileEarmarkText } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from "./Auth";
import { useState } from "react";

function Home() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const [showAuth, setShowAuth] = useState(false);

  const guardedAction = (action) => {
    if (!userData) setShowAuth(true);
    else action();
  };

  const interviewRedirectHandle = () => guardedAction(() => navigate('/resume-analysis'));
  const historyRedirectHandle = () => guardedAction(() => navigate('/history'));

  const steps = [
    {
      icon: <FaUserTie size={22} />,
      label: "01",
      title: "Choose Role & Experience",
      desc: "Pick your target job role and experience level for customized sessions.",
      accent: "#3b82f6",
      bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      icon: <FaMicrophone size={22} />,
      label: "02",
      title: "Interactive Voice Interview",
      desc: "Engage in AI-powered voice interviews that feel like real conversations.",
      accent: "#10b981",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      icon: <FaClock size={22} />,
      label: "03",
      title: "Timed Practice Sessions",
      desc: "Improve your performance by practicing within realistic time limits.",
      accent: "#f97316",
      bg: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
      border: "rgba(249,115,22,0.2)",
    },
  ];

  const features = [
    {
      icon: <AiOutlineCheckCircle size={24} />,
      title: "Smart Answer Review",
      desc: "Receive instant insights and suggestions to refine your responses.",
      accent: "#6366f1",
      tag: "AI Powered",
      action: () => navigate('/resume-analysis'),
    },
    {
      icon: <BsFileEarmarkText size={24} />,
      title: "Resume-Driven Questions",
      desc: "Get interview questions tailored specifically to your resume profile.",
      accent: "#10b981",
      tag: "Personalized",
      action: () => navigate('/resume-analysis'),
    },
    {
      icon: <FaFilePdf size={24} />,
      title: "Exportable Reports",
      desc: "Save and download detailed reports of your interview sessions.",
      accent: "#f97316",
      tag: "Export",
      action: () => navigate('/resume-analysis'),
    },
    {
      icon: <FaChartLine size={24} />,
      title: "Performance Tracking",
      desc: "Monitor your improvement with insights from past interviews.",
      accent: "#8b5cf6",
      tag: "Analytics",
      action: () => navigate('/history'),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .home-root * { box-sizing: border-box; }
        .home-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Bricolage Grotesque', sans-serif; }

        /* Hero mesh background */
        .hero-mesh {
          background-color: #f8faff;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(16,185,129,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 60% 40%, rgba(249,115,22,0.06) 0%, transparent 50%);
        }

        /* Floating orbs */
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        .orb1 { animation: floatOrb 7s ease-in-out infinite; }
        .orb2 { animation: floatOrb 9s ease-in-out infinite 2s; }

        /* Stagger fade-in on load */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .fade-up-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both; }

        /* Step cards */
        .step-card {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
          cursor: pointer;
        }
        .step-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        /* Feature cards */
        .feat-card {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .feat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.1);
        }
        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 99px 99px 0 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .feat-card:hover::before { opacity: 1; }

        /* CTA buttons */
        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(99,102,241,0.35);
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-primary:hover::after { opacity: 1; }

        .btn-secondary {
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          background: #f1f5f9 !important;
        }

        /* Section heading accent line */
        .section-heading::after {
          content: '';
          display: block;
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #10b981);
          border-radius: 99px;
          margin: 12px auto 0;
        }

        /* Grid connector dots */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <div className="home-root min-h-screen hero-mesh flex flex-col">
        <Navbar />

        {/* Auth Modal */}
        {showAuth && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowAuth(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Auth onSuccess={() => setShowAuth(false)} />
            </div>
          </div>
        )}

        {/* ── HERO ── */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
          {/* Background orbs */}
          <div
            className="orb1 absolute pointer-events-none"
            style={{
              width: 420, height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
              top: -80, left: "10%",
              filter: "blur(1px)",
            }}
          />
          <div
            className="orb2 absolute pointer-events-none"
            style={{
              width: 320, height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.11) 0%, transparent 70%)",
              bottom: -40, right: "8%",
              filter: "blur(1px)",
            }}
          />

          {/* Eyebrow badge */}
          <div className="fade-up-1 inline-flex items-center gap-2 mb-6"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 99,
              padding: "5px 14px",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6366f1", letterSpacing: "0.5px" }}>
              AI-POWERED MOCK INTERVIEWS
            </span>
          </div>

          <h1
            className="display-font fade-up-2"
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: 760,
              marginBottom: 20,
            }}
          >
            Ace Your Next Interview
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              with AI Confidence
            </span>
          </h1>

          <p
            className="fade-up-2"
            style={{
              fontSize: 17,
              color: "#64748b",
              maxWidth: 520,
              lineHeight: 1.7,
              marginBottom: 36,
              fontWeight: 300,
            }}
          >
            Practice with an intelligent AI interviewer tailored to your role,
            experience, and resume — then get instant, actionable feedback.
          </p>

          <div className="fade-up-3 flex flex-wrap items-center justify-center gap-3">
            <button
              className="btn-primary display-font"
              onClick={interviewRedirectHandle}
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "13px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "-0.3px",
              }}
            >
              Begin Interview <FaArrowRight size={13} />
            </button>
            <button
              className="btn-secondary"
              onClick={historyRedirectHandle}
              style={{
                background: "#fff",
                color: "#374151",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "13px 28px",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              View History
            </button>
          </div>

          {/* Social proof strip */}
          <div
            className="fade-up-3 flex items-center gap-6 mt-12 flex-wrap justify-center"
            style={{ fontSize: 13, color: "#94a3b8" }}
          >
            {["10,000+ sessions", "95% satisfaction", "Free to start"].map((t, i) => (
              <span key={i} className="flex items-center gap-2">
                <span style={{ color: "#10b981" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="px-6 md:px-12 pb-20">
          <div className="max-w-5xl mx-auto">
            <h2
              className="display-font section-heading text-center mb-12"
              style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}
            >
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="step-card"
                  onClick={() => guardedAction(() => navigate('/resume-analysis'))}
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 20,
                    padding: "28px 24px",
                  }}
                >
                  {/* Step number + icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      style={{
                        width: 48, height: 48,
                        borderRadius: 14,
                        background: "#fff",
                        boxShadow: `0 4px 16px ${s.accent}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: s.accent,
                      }}
                    >
                      {s.icon}
                    </div>
                    <span
                      className="display-font"
                      style={{ fontSize: 36, fontWeight: 800, color: `${s.accent}22`, letterSpacing: "-1px" }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <h3
                    className="display-font"
                    style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.3px" }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          className="dot-grid px-6 md:px-12 py-20"
          style={{ background: "rgba(248,250,255,0.8)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="display-font section-heading"
                style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}
              >
                Powerful AI Features
              </h2>
              <p style={{ fontSize: 15, color: "#94a3b8", marginTop: 16, fontWeight: 300 }}>
                Everything you need to walk into any interview fully prepared
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feat-card"
                  onClick={() => guardedAction(f.action)}
                  style={{
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    borderRadius: 20,
                    padding: "28px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    "--accent": f.accent,
                  }}
                >
                  {/* Top accent line on hover via CSS */}
                  <style>{`.feat-card:nth-child(${i + 1})::before { background: linear-gradient(90deg, ${f.accent}, ${f.accent}55); }`}</style>

                  <div className="flex items-start justify-between mb-4">
                    <div
                      style={{
                        width: 48, height: 48,
                        borderRadius: 14,
                        background: `${f.accent}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: f.accent,
                        flexShrink: 0,
                      }}
                    >
                      {f.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: `${f.accent}12`,
                        color: f.accent,
                        borderRadius: 99,
                        padding: "3px 10px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>

                  <h3
                    className="display-font"
                    style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.3px" }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>

                  <div
                    className="flex items-center gap-1 mt-5"
                    style={{ fontSize: 13, fontWeight: 500, color: f.accent }}
                  >
                    Learn more <FaArrowRight size={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-6 py-20 text-center">
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
              borderRadius: 28,
              padding: "52px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow blob */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -40,
              width: 180, height: 180, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
              pointerEvents: "none",
            }} />

            <h2
              className="display-font"
              style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", marginBottom: 14 }}
            >
              Ready to land your dream job?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.6, fontWeight: 300 }}>
              Start your first AI mock interview now — free, fast, and surprisingly fun.
            </p>
            <button
              className="btn-primary display-font"
              onClick={interviewRedirectHandle}
              style={{
                background: "linear-gradient(135deg, #6366f1, #10b981)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "-0.3px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Start for Free <FaArrowRight size={13} />
            </button>
          </div>
        </section>

      </div>
    </>
  );
}

export default Home;