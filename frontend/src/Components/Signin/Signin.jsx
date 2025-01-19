import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextRevealCard } from "../ui/text-reveal-card.jsx";
import "./Signin.css";
import { signin } from "./Services/SigninServices.jsx";
import Notification from "../Common/Notification/Notification.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import usercontext from "../../Context/UserContext.js";

function SignIn() {
  const alert = new Notification();

  const navigate = useNavigate();

  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const usercon = useContext(usercontext)

  // Handle form submission
  const subHandler = async (e) => {
    e.preventDefault();

    const isLoggedin = await signin(data);
    if (isLoggedin?.status) {
      alert.notify(isLoggedin?.status, isLoggedin?.message);
      setData({ email: "", password: "" });
      localStorage.setItem("token", isLoggedin?.data);

      const headers = {
        'authorization': localStorage.getItem("token")
      }

      usercon.fetchUserData(headers)  //call api and pass token to fetch user data

      navigate("/chat")
    } else {
      alert.notify(isLoggedin?.status, isLoggedin?.message);
    }
  };

  // Handle input changes
  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="signin-page">
      {/* Left Section */}
      <div className="left-section">
        <div className="signin-branding">
          <TextRevealCard
            text="Welcome back!" // Text for the animation
            revealText="Sign in to continue your secure journey." // Subtitle
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Sign In</h2>
          <form onSubmit={subHandler}>
            <input
              type="email"
              placeholder="E-mail"
              required
              name="email"
              value={data.email}
              onChange={changeHandler}
            />
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                name="password"
                value={data.password}
                onChange={changeHandler}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <LuEyeClosed /> : <FaEye />}
              </span>
            </div>
            <button type="submit" className="shimmer-btn">
              Sign In
            </button>
          </form>
          <p>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#9D4EDD",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
