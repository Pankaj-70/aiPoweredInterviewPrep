import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { useEffect } from "react";
import axios from "axios/unsafe/axios.js";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Interview from "./pages/Interview";
import ReportPage from "./pages/ReportPage";
import History  from "./pages/History";

export const serverUrl='https://super-journey-x5w7rq54q4rjhv4rp-8000.app.github.dev'
function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    const getUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/current-user`, {withCredentials: true});
        dispatch(setUserData(res.data.user));
        console.log(res.data.user);
      } catch (error) {
        console.error('Error in getting user: ',error);
        dispatch(setUserData(null));
      }
    }
    getUser();
  }, [dispatch, serverUrl]);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/resume-analysis" element={<ResumeAnalysis />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default App;
