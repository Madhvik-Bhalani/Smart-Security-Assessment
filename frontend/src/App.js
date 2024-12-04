import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import Signup from "./Components/Signup/Signup";
import Signin from "./Components/Signin/Signin";
import Home from "./Components/Home/Home";



function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
        
        <ToastContainer limit={3} />

      </BrowserRouter>
    </>
  );
}

export default App;
