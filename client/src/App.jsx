import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";

export const serverUrl='https://super-journey-x5w7rq54q4rjhv4rp-8000.app.github.dev'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
