import React from "react";
import Navbar from "../components/Navbar";
import { FaUserTie, FaMicrophone, FaClock, FaFilePdf, FaChartLine } from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BsFileEarmarkText } from "react-icons/bs";

function Home() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Ace Your Interviews with AI Assistance
        </h1>
        <p className="text-gray-600 text-sm max-w-xl mb-6">
          Get interview-ready using intelligent mock sessions designed around your
          role, experience, and skillset.
        </p>

        <div className="flex gap-4">
          <button className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Begin Interview
          </button>
          <button className="cursor-pointer bg-white border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
            Check History
          </button>
        </div>
      </div>

      {/* Steps Section */}
      <div className="mt-20 px-8">
        <div className="grid md:grid-cols-3 gap-6 text-center">

          <div className="bg-blue-100 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <FaUserTie className="text-3xl mx-auto mb-3 text-blue-600" />
            <h2 className="font-semibold text-lg mb-2">
              1. Choose Role & Experience
            </h2>
            <p className="text-sm text-gray-600">
              Pick your target job role and experience level for customized sessions.
            </p>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <FaMicrophone className="text-3xl mx-auto mb-3 text-green-600" />
            <h2 className="font-semibold text-lg mb-2">
              2. Interactive Voice Interview
            </h2>
            <p className="text-sm text-gray-600">
              Engage in AI-powered voice interviews that feel like real conversations.
            </p>
          </div>

          <div className="bg-orange-100 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <FaClock className="text-3xl mx-auto mb-3 text-orange-600" />
            <h2 className="font-semibold text-lg mb-2">
              3. Timed Practice Sessions
            </h2>
            <p className="text-sm text-gray-600">
              Improve your performance by practicing within realistic time limits.
            </p>
          </div>

        </div>
      </div>

      {/* Advanced AI Capabilities */}
      <div className="mt-20 px-8 mb-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Powerful AI Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-blue-50 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <AiOutlineCheckCircle className="text-3xl mb-3 text-blue-600" />
            <h3 className="font-semibold mb-2">Smart Answer Review</h3>
            <p className="text-sm text-gray-600">
              Receive instant insights and suggestions to refine your responses.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <BsFileEarmarkText className="text-3xl mb-3 text-green-600" />
            <h3 className="font-semibold mb-2">Resume-Driven Questions</h3>
            <p className="text-sm text-gray-600">
              Get interview questions tailored specifically to your resume profile.
            </p>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <FaFilePdf className="text-3xl mb-3 text-orange-600" />
            <h3 className="font-semibold mb-2">Exportable Reports</h3>
            <p className="text-sm text-gray-600">
              Save and download detailed reports of your interview sessions.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <FaChartLine className="text-3xl mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">Performance Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor your improvement with insights from past interviews.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;