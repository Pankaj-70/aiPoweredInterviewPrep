import React, { useEffect, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from '../../node_modules/axios/lib/axios';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: "🎯", label: "Role-specific questions" },
  { icon: "⚡", label: "Real-time AI feedback" },
  { icon: "📈", label: "Track your progress" },
];

function Auth() {
  const userData = useSelector((state) => state.user.userData);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (userData) navigate("/");
  }, [userData]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const response = await signInWithPopup(auth, provider);
      const name = response.user.displayName;
      const email = response.user.email;
      const res = await axios.post(`${serverUrl}/api/auth/googleAuth`, { name, email }, { withCredentials: true });
      dispatch(setUserData(res.data.user));
      navigate("/");
    } catch (error) {
      console.error("Error in google auth: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #faf8f5;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          background: #0e0e0e;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, #c8f04430 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, #4ade8030 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? '0' : '-12px'});
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .brand-icon-wrap {
          width: 40px; height: 40px;
          background: #c8f044;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .left-hero {
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? '0' : '20px'});
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
        }

        .left-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #c8f044;
          margin-bottom: 20px;
        }

        .left-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.1;
          color: #fff;
          margin-bottom: 28px;
        }

        .left-headline em {
          font-style: italic;
          color: #c8f044;
        }

        .left-sub {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          max-width: 340px;
          font-weight: 300;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? '0' : '16px'});
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          transition: background 0.2s;
        }

        .feature-item:hover {
          background: rgba(255,255,255,0.07);
        }

        .feature-emoji {
          font-size: 18px;
          line-height: 1;
        }

        .feature-label {
          font-size: 13.5px;
          color: rgba(255,255,255,0.65);
          font-weight: 400;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }

        /* Subtle dot grid background */
        .auth-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #d0ccbf 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.4;
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 380px;
          background: #fff;
          border: 1px solid #e8e3d8;
          border-radius: 20px;
          padding: 44px 40px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 32px rgba(0,0,0,0.06),
            0 32px 64px rgba(0,0,0,0.04);
          position: relative;
          z-index: 1;
          opacity: ${mounted ? 1 : 0};
          transform: translateY(${mounted ? '0' : '24px'}) scale(${mounted ? 1 : 0.97});
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }

        .card-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fce8;
          border: 1px solid #c8f044;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 11.5px;
          font-weight: 600;
          color: #3a7000;
          letter-spacing: 0.3px;
          margin-bottom: 28px;
        }

        .card-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6abf00;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          line-height: 1.15;
          color: #111;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .card-sub {
          font-size: 14px;
          color: #888;
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 36px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #ece9e0;
        }

        .divider-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #bbb;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          background: #fff;
          border: 1.5px solid #e0dbd0;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 500;
          color: #222;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .google-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f5f3ee, #fff);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .google-btn:hover {
          border-color: #c0bab0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .google-btn:hover::before { opacity: 1; }

        .google-btn:active { transform: translateY(0); }

        .google-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .google-btn span { position: relative; z-index: 1; }

        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid #ddd;
          border-top-color: #555;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .terms-text {
          font-size: 11.5px;
          color: #b0aa9e;
          text-align: center;
          line-height: 1.6;
        }

        .terms-text a {
          color: #777;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 32px 20px; background: #faf8f5; }
          .auth-card { max-width: 100%; }
        }
      `}</style>

      <div className="auth-root">
        {/* ── LEFT ── */}
        <div className="auth-left">
          <div className="brand-mark">
            <div className="brand-icon-wrap">
              <RiRobot2Line size={22} color="#0e0e0e" />
            </div>
            <span className="brand-name">CareerPilot</span>
          </div>

          <div className="left-hero">
            <p className="left-eyebrow">AI Interview Coach</p>
            <h2 className="left-headline">
              Ace your next<br />
              interview with<br />
              <em>confidence.</em>
            </h2>
            <p className="left-sub">
              Practice with an AI interviewer that adapts to your role and gives honest, actionable feedback after every answer.
            </p>
          </div>

          <div className="feature-list">
            {features.map((f) => (
              <div className="feature-item" key={f.label}>
                <span className="feature-emoji">{f.icon}</span>
                <span className="feature-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="card-tag">
              <span className="card-tag-dot" />
              Free to get started
            </div>

            <h1 className="card-title">Sign in to<br />CareerPilot</h1>
            <p className="card-sub">
              Your personalized AI interview coach.<br />
              No credit card required.
            </p>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Continue with</span>
              <div className="divider-line" />
            </div>

            <button
              className="google-btn"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              {loading ? (
                <div className="btn-spinner" />
              ) : (
                <FcGoogle size={20} style={{ flexShrink: 0 }} />
              )}
              <span>{loading ? "Signing you in…" : "Continue with Google"}</span>
            </button>

            <p className="terms-text">
              By continuing, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;