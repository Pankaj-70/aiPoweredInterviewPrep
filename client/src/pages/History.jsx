import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaBriefcase, FaClock, FaStar, FaRedo, FaChartBar, FaInbox } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { HiOutlineSparkles } from 'react-icons/hi';

// ── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score >= 7) return { fg: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' };
  if (score >= 4) return { fg: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' };
  if (score >  0) return { fg: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' };
  return           { fg: '#475569',       bg: 'rgba(71,85,105,0.1)',   border: 'rgba(71,85,105,0.2)'  };
};

const scoreLabel = (score) => {
  if (score >= 7) return 'Excellent';
  if (score >= 4) return 'Good';
  if (score >  0) return 'Needs Work';
  return 'Incomplete';
};

const formatDate = (id) => {
  // ObjectId contains a 4-byte timestamp
  try {
    const ts = parseInt(id.substring(0, 8), 16) * 1000;
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch { return '—'; }
};

// Circular score ring
const ScoreRing = ({ score, size = 64 }) => {
  const max = 10;
  const pct = Math.min(score / max, 1);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const { fg } = scoreColor(score);

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={fg} strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: 'center',
          fontSize: size < 56 ? 11 : 13,
          fontWeight: 700,
          fill: fg,
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}
      >
        {score > 0 ? score.toFixed(1) : '—'}
      </text>
    </svg>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const History = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');
  const userData = useSelector((state) => state?.user?.userData);
  const navigate = useNavigate();

  if (!userData) return <Navigate to="/auth" replace />;

  useEffect(() => {
    if (!userData?._id) return;
    (async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/interview/get-interview/${userData._id}`,
          { withCredentials: true }
        );
        setData(res.data);
      } catch (e) {
        console.error('Error fetching history:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userData]);

  // Aggregate stats
  const completed  = data.filter(d => d.finalScore > 0);
  const avgScore   = completed.length
    ? (completed.reduce((s, d) => s + d.finalScore, 0) / completed.length).toFixed(2)
    : 0;
  const bestScore  = completed.length
    ? Math.max(...completed.map(d => d.finalScore)).toFixed(2)
    : 0;

  // Filter
  const modes = ['All', 'Technical', 'HR'];
  const filtered = filter === 'All' ? data : data.filter(d => d.mode === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hist-root {
          font-family: 'Instrument Sans', sans-serif;
          min-height: 100vh;
          background: #07090f;
          background-image:
            radial-gradient(ellipse 60% 40% at 10% 0%,  rgba(99,102,241,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 100%, rgba(16,185,129,0.1)  0%, transparent 55%);
          color: #e2e8f0;
          padding: 0 0 80px;
        }

        /* Top bar */
        .hist-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(7,9,15,0.8);
        }

        /* Stats strip */
        .stat-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 32px 40px 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(99,102,241,0.3); }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          border-radius: 99px;
        }

        /* Cards grid */
        .cards-section {
          max-width: 1200px;
          margin: 32px auto 0;
          padding: 0 40px;
        }

        .interview-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1),
                      border-color 0.22s, box-shadow 0.22s,
                      background 0.22s;
          animation: cardIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
          margin-bottom: 12px;
        }
        .interview-card:hover {
          transform: translateY(-3px) scale(1.005);
          border-color: rgba(99,102,241,0.28);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Filter tabs */
        .filter-tab {
          padding: 6px 18px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #64748b;
          transition: all 0.18s;
          font-family: 'Instrument Sans', sans-serif;
        }
        .filter-tab:hover { color: #94a3b8; border-color: rgba(255,255,255,0.2); }
        .filter-tab.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
        }

        /* Mode badge */
        .mode-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          padding: 3px 10px;
          border-radius: 99px;
        }

        /* Empty state */
        @keyframes floatEmpty {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .empty-float { animation: floatEmpty 4s ease-in-out infinite; }

        /* Shimmer skeleton */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .hist-topbar { padding: 18px 20px; }
          .stat-strip  { grid-template-columns: repeat(2, 1fr); padding: 20px 20px 0; }
          .cards-section { padding: 0 20px; }
          .interview-card { flex-wrap: wrap; }
        }
      `}</style>

      <div className="hist-root">

        {/* ── TOP BAR ── */}
        <div className="hist-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaChartBar size={15} color="#fff" />
            </div>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700, fontSize: 18, color: '#f8fafc',
              letterSpacing: '-0.4px',
            }}>
              Interview History
            </span>
          </div>

          <button
            onClick={() => navigate('/resume-analysis')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '9px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              transition: 'transform 0.18s, box-shadow 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <FaRedo size={11} /> New Interview
          </button>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="stat-strip">
          {[
            {
              label: 'Total Sessions',
              value: data.length,
              icon: <BsLightningChargeFill size={16} />,
              accent: '#6366f1',
              before: 'linear-gradient(90deg, #6366f1, #818cf8)',
            },
            {
              label: 'Completed',
              value: completed.length,
              icon: <FaStar size={14} />,
              accent: '#34d399',
              before: 'linear-gradient(90deg, #10b981, #34d399)',
            },
            {
              label: 'Avg Score',
              value: avgScore > 0 ? `${avgScore}/10` : '—',
              icon: <FaChartBar size={14} />,
              accent: '#fbbf24',
              before: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            },
            {
              label: 'Best Score',
              value: bestScore > 0 ? `${bestScore}/10` : '—',
              icon: <HiOutlineSparkles size={17} />,
              accent: '#f87171',
              before: 'linear-gradient(90deg, #ef4444, #f87171)',
            },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <style>{`.stat-card:nth-child(${i+1})::before { background: ${s.before}; }`}</style>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${s.accent}18`, border: `1px solid ${s.accent}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.accent, marginBottom: 14,
              }}>
                {s.icon}
              </div>
              <p style={{ fontSize: 11, color: '#475569', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 4 }}>
                {s.label.toUpperCase()}
              </p>
              <p style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px',
              }}>
                {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 28 }} /> : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── CARDS SECTION ── */}
        <div className="cards-section">

          {/* Section header + filters */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, marginTop: 36,
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px',
              }}>
                All Sessions
                <span style={{
                  marginLeft: 8, fontSize: 12, fontWeight: 500,
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8', borderRadius: 99, padding: '2px 8px',
                }}>
                  {filtered.length}
                </span>
              </h2>
              <p style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                Your complete interview track record
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {modes.map(m => (
                <button
                  key={m}
                  className={`filter-tab ${filter === m ? 'active' : ''}`}
                  onClick={() => setFilter(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                height: 84, borderRadius: 18, marginBottom: 12,
              }} className="skeleton" />
            ))
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
              <div className="empty-float">
                <FaInbox size={48} color="#1e293b" />
              </div>
              <p style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 20, fontWeight: 700, color: '#1e293b',
              }}>
                No sessions yet
              </p>
              <p style={{ fontSize: 14, color: '#334155', maxWidth: 300 }}>
                {filter !== 'All'
                  ? `No ${filter} interviews found. Try a different filter.`
                  : 'Start your first AI mock interview to see your history here.'}
              </p>
              <button
                onClick={() => navigate('/resume-analysis')}
                style={{
                  marginTop: 8,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 22px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                Begin Interview →
              </button>
            </div>
          )}

          {/* Interview cards */}
          {!loading && filtered.map((item, i) => {
            const { fg, bg, border } = scoreColor(item.finalScore);
            const label = scoreLabel(item.finalScore);
            const date  = formatDate(item._id);
            const isComplete = item.finalScore > 0;

            return (
              <div
                key={item._id}
                className="interview-card"
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => navigate(`/report/${item._id}`)}
              >
                {/* Score ring */}
                <ScoreRing score={item.finalScore} size={64} />

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: 15, fontWeight: 700, color: '#f1f5f9',
                      letterSpacing: '-0.3px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 300,
                    }}>
                      {item.role}
                    </span>
                    <span
                      className="mode-badge"
                      style={{
                        background: item.mode === 'Technical' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.12)',
                        color:      item.mode === 'Technical' ? '#a5b4fc' : '#6ee7b7',
                        border: `1px solid ${item.mode === 'Technical' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      }}
                    >
                      {item.mode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                      <FaBriefcase size={11} /> {item.experience}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                      <FaClock size={11} /> {date}
                    </span>
                  </div>
                </div>

                {/* Score pill + status */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    background: bg, color: fg, border: `1px solid ${border}`,
                    borderRadius: 99, padding: '3px 12px',
                    letterSpacing: '0.3px',
                  }}>
                    {label}
                  </span>
                  {isComplete && (
                    <span style={{ fontSize: 11, color: '#334155' }}>
                      Score: <strong style={{ color: fg }}>{item.finalScore.toFixed(2)}</strong>/10
                    </span>
                  )}
                </div>

                {/* Right arrow hint */}
                <div style={{ color: '#1e293b', fontSize: 18, flexShrink: 0 }}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default History;