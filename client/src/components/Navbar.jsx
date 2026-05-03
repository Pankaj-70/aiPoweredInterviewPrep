import React, { useState, useRef, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { FaCoins, FaBolt } from "react-icons/fa";
import { FiUser, FiLogOut, FiClock, FiChevronRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const Navbar = () => {
  const [creditPopUp, showCreditPopUp] = useState(false);
  const [userPopUp, showUserPopUp] = useState(false);

  const navigate = useNavigate();
  const creditRef = useRef(null);
  const userRef = useRef(null);

  const user = useSelector((state) => state.user.userData);

  // ✅ Guarded action — redirect to /auth if not logged in
  const guardedAction = (action) => {
    if (!user) {
      navigate("/auth");
    } else {
      action();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      navigate("/auth");
    } catch (error) {
      console.error("Error in logout:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (creditRef.current && !creditRef.current.contains(e.target)) showCreditPopUp(false);
      if (userRef.current && !userRef.current.contains(e.target)) showUserPopUp(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Credit bar fill percentage (cap at 100)
  const creditPct = Math.min(((user?.credits ?? 0) / 100) * 100, 100);
  const creditColor =
    creditPct > 60 ? "#22d3a5" : creditPct > 25 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          font-family: 'DM Sans', sans-serif;
        }
        .nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
        }

        /* Slide-down popup */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .popup-enter {
          animation: slideDown 0.18s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        /* Subtle shimmer on credit bar */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .credit-bar-fill {
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite;
        }

        /* Avatar ring pulse when logged in */
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(99,102,241,0.15); }
        }
        .avatar-btn { animation: ringPulse 3s ease-in-out infinite; }

        .nav-btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
        .nav-btn-hover { transition: all 0.18s ease; }
      `}</style>

      <nav
        className="nav-root w-full px-6 py-3 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 24px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex items-center gap-2 cursor-pointer nav-btn-hover"
          onClick={() => navigate("/")}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              borderRadius: 10,
              padding: "5px 6px",
              display: "flex",
            }}
          >
            <RiRobot2Line size={20} color="#fff" />
          </div>
          <span
            className="nav-logo-text text-gray-900"
            style={{ fontSize: 19, letterSpacing: "-0.5px" }}
          >
            CareerPilot
          </span>
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-3">

          {/* ── Credits Button ── */}
          <div className="relative" ref={creditRef}>
            <button
              onClick={() =>
                guardedAction(() => {
                  showCreditPopUp(!creditPopUp);
                  showUserPopUp(false);
                })
              }
              className="nav-btn-hover flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                border: "1px solid rgba(99,102,241,0.18)",
                borderRadius: 12,
                padding: "7px 14px",
                cursor: "pointer",
              }}
            >
              <FaCoins style={{ color: "#f59e0b", fontSize: 14 }} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1e293b",
                  letterSpacing: "-0.2px",
                }}
              >
                {user?.credits ?? 0}
                <span style={{ color: "#94a3b8", marginLeft: 3 }}>credits</span>
              </span>
            </button>

            {/* Credits Popup */}
            {creditPopUp && (
              <div
                className="popup-enter"
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 10,
                  width: 240,
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  padding: "20px",
                  zIndex: 200,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                    Your Credits
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: creditPct > 25 ? "#dcfce7" : "#fee2e2",
                      color: creditPct > 25 ? "#16a34a" : "#dc2626",
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontWeight: 600,
                    }}
                  >
                    {creditPct > 25 ? "Active" : "Low"}
                  </span>
                </div>

                {/* Big credit number */}
                <div className="flex items-end gap-1 mb-3">
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      fontFamily: "'Syne', sans-serif",
                      color: "#0f172a",
                      lineHeight: 1,
                    }}
                  >
                    {user?.credits ?? 0}
                  </span>
                  <span style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>
                    / 100
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 6,
                    background: "#f1f5f9",
                    borderRadius: 99,
                    overflow: "hidden",
                    marginBottom: 16,
                  }}
                >
                  <div
                    className="credit-bar-fill"
                    style={{
                      height: "100%",
                      width: `${creditPct}%`,
                      borderRadius: 99,
                      backgroundImage: `linear-gradient(90deg, ${creditColor}, ${creditColor}cc, ${creditColor})`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>

                {creditPct <= 25 && (
                  <p style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12, fontWeight: 500 }}>
                    ⚡ Running low — top up to keep going
                  </p>
                )}

                <button
                  className="nav-btn-hover"
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <FaBolt size={11} /> Buy More Credits
                </button>

                <p style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center", marginTop: 8 }}>
                  Instant top-up · Secure payment
                </p>
              </div>
            )}
          </div>

          {/* ── User Button ── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() =>
                guardedAction(() => {
                  showUserPopUp(!userPopUp);
                  showCreditPopUp(false);
                })
              }
              className="avatar-btn nav-btn-hover flex items-center gap-2"
              style={{
                background: user
                  ? "linear-gradient(135deg, #6366f1, #818cf8)"
                  : "#f1f5f9",
                border: "none",
                borderRadius: 12,
                padding: "7px 12px",
                cursor: "pointer",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: user ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user?.name ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <FiUser size={14} color="#94a3b8" />
                )}
              </div>
              {user?.name && (
                <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>
                  {user.name.split(" ")[0]}
                </span>
              )}
            </button>

            {/* User Popup */}
            {userPopUp && (
              <div
                className="popup-enter"
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 10,
                  width: 230,
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  overflow: "hidden",
                  zIndex: 200,
                }}
              >
                {/* User header */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    padding: "16px 18px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "'Syne', sans-serif",
                        flexShrink: 0,
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>
                        {user?.name ?? "User"}
                      </p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0 }}>
                        {user?.email ?? ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: "8px 0" }}>
                  <button
                    className="nav-btn-hover"
                    onClick={() => { showUserPopUp(false); navigate("/history"); }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#334155",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FiClock size={14} color="#6366f1" /> Interview History
                    </span>
                    <FiChevronRight size={13} color="#cbd5e1" />
                  </button>

                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

                  <button
                    className="nav-btn-hover"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#ef4444",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;