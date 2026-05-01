import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { useEffect } from "react";
import axios from "axios/unsafe/axios.js";

export const serverUrl='https://super-journey-x5w7rq54q4rjhv4rp-8000.app.github.dev'
function App() {
  useEffect(()=>{
    const getUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/current-user`, {withCredentials: true});
        console.log(res.data);
      } catch (error) {
        console.error('Error in getting user: ',error);
      }
    }
    getUser();
  }, [])
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
