import axios from "axios";
import React, { useState } from "react";
import {
  FaUserTie,
  FaMicrophone,
  FaChartLine,
  FaFilePdf,
  FaRocket,
} from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { MdWorkOutline } from "react-icons/md";
import { serverUrl } from "../App";

const Interview = () => {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("Technical Interview");
  const [file, setFile] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const isDisabled = !role || !experience || !type;

  const handleFileUpload = async (file) => {
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await axios.post(
        `${serverUrl}/api/interview/resume`,
        formData,
        { withCredentials: true }
      );

      setAnalysis(res.data);

      // auto-fill inputs
      setRole(res.data.role || "");
      setExperience(res.data.experience || "");
      setFile(file);

    } catch (error) {
      console.error("Error while analyzing resume:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">

      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE */}
        <div className="md:w-1/2 p-10 text-gray-800 flex flex-col justify-center space-y-6 bg-gradient-to-br from-white to-indigo-50">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Launch Your AI Interview
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed">
            Get AI-powered interview preparation tailored to your resume, skills, and experience.
          </p>

          <div className="space-y-5 mt-6">
            <div className="flex items-center gap-3">
              <FaRocket className="text-indigo-500" />
              <span>Smart role detection from resume</span>
            </div>

            <div className="flex items-center gap-3">
              <FaMicrophone className="text-emerald-500" />
              <span>Interactive AI interview session</span>
            </div>

            <div className="flex items-center gap-3">
              <FaChartLine className="text-amber-500" />
              <span>Instant skill & project analysis</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center space-y-5 bg-white">

          {/* ANALYZING LOADER */}
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-600 text-sm">Analyzing resume...</p>
            </div>
          ) : (
            <>
              {/* ROLE */}
              {analysis ? (
                <div className="bg-indigo-50 border rounded-xl p-4">
                  <p className="text-sm text-indigo-600 font-semibold">Detected Role</p>
                  <p>{analysis.role}</p>
                </div>
              ) : (
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <MdWorkOutline className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Target role"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              )}

              {/* EXPERIENCE */}
              {analysis ? (
                <div className="bg-emerald-50 border rounded-xl p-4">
                  <p className="text-sm text-emerald-600 font-semibold">Experience</p>
                  <p>{analysis.experience}</p>
                </div>
              ) : (
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <FaUserTie className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Experience level"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              )}

              {/* INTERVIEW TYPE */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <HiOutlineAcademicCap className="text-gray-500 mr-2" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  <option>Technical Interview</option>
                  <option>HR Interview</option>
                </select>
              </div>

              {/* FILE UPLOAD */}
              {!file ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center bg-indigo-50/40 hover:bg-indigo-50 transition">
                  <FaFilePdf className="text-red-500 text-3xl mb-2" />
                  <label className="text-sm text-gray-600 cursor-pointer">
                    Upload Resume (PDF)
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        setFile(f);
                        handleFileUpload(f);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-indigo-700 font-medium">
                  <FaFilePdf className="text-red-500" />
                  <span>{file.name}</span>
                </div>
              )}

              {/* PROJECTS */}
              {analysis?.projects && (
                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Projects</h3>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {analysis.projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SKILLS */}
              {analysis?.skills && (
                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BUTTON */}
              <button
                disabled={isDisabled}
                className={`mt-2 py-3 rounded-xl font-semibold text-white transition
                ${isDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                  }`}
              >
                Start AI Interview
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;