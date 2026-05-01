import React, { useState, useRef, useEffect } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { FaCoins } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios/unsafe/axios.js";
import { serverUrl } from "../App";

const Navbar = () => {
  const [creditPopUp, showCreditPopUp] = useState(false);
  const [userPopUp, showUserPopUp] = useState(false);

  const navigate = useNavigate();
  const creditRef = useRef(null);
  const userRef = useRef(null);

  const user = useSelector((state) => state.user.userData);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error in logout:", error);
    }
  };

  // 🔥 Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (creditRef.current && !creditRef.current.contains(e.target)) {
        showCreditPopUp(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        showUserPopUp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      
      {/* Left */}
      <div className="flex items-center gap-2">
        <RiRobot2Line size={30} className="text-blue-500" />
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
          CareerPilot
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        
        {/* Credits */}
        <div className="relative" ref={creditRef}>
          <button
            onClick={() => {
              showCreditPopUp(!creditPopUp);
              showUserPopUp(false);
            }}
            className="cursor-pointer flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition duration-200"
          >
            <FaCoins className="text-yellow-500" />
            <span className="text-sm font-medium">
              {user?.credits ?? 0} Credits
            </span>
          </button>

          {/* Credits Popup */}
          {creditPopUp && (
            <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 z-50 border border-blue-100 animate-fadeIn text-center">
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                You’re running low <br /> on credits ⚡
              </p>

              <button className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-sm font-medium shadow-md">
                Buy more credits
              </button>

              <p className="text-xs text-gray-400 mt-2 text-center">
                Instant top-up available
              </p>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              showUserPopUp(!userPopUp);
              showCreditPopUp(false);
            }}
            className="cursor-pointer p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition duration-200"
          >
            <FiUser size={20} className="text-indigo-600" />
          </button>

          {/* User Popup */}
          {userPopUp && (
            <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 z-50 border border-blue-100 flex flex-col animate-fadeIn">
              
              {/* User Info */}
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-gray-400">
                  Manage your account
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-3"></div>

              {/* Actions */}
              <button className="cursor-pointer text-left text-sm text-gray-600 hover:text-blue-500 transition py-1">
                Interview History
              </button>

              <button
                onClick={handleLogout}
                className="cursor-pointer text-left text-sm text-red-500 hover:text-red-600 transition py-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;