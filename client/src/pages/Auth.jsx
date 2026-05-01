import React from "react";
import { RiRobot2Line } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";

function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        
        {/* Title with Robot Icon */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <RiRobot2Line size={32} className="text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">
            CareerPilot
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 text-sm">
          Practice real interview questions powered by AI. 
          Get instant feedback, improve your confidence, and 
          land your dream job.
        </p>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">Continue with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition">
          <FcGoogle size={22} />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>

      </div>
    </div>
  );
}

export default Auth;