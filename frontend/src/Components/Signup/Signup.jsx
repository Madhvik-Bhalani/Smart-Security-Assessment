import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextRevealCard } from "../ui/text-reveal-card.jsx";
import { signup } from "./Services/SignupServices.jsx";
import Notification from "../Common/Notification/Notification.jsx";
import "./Signup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import usercontext from "../../Context/UserContext.js";

function Signup({ onOpenChatbot }) {
  const alert = new Notification();
  const navigate = useNavigate();

  const [data, setData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const usercon = useContext(usercontext)

  const subHandler = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirm_password) {
      alert.notify(false, "Passwords do not match.");
      return;
    }


    const isRegistered = await signup(data); // Call API and pass user's data

    if (isRegistered?.status) {
      alert.notify(isRegistered?.status, isRegistered?.message);
      setData({ fname: "", lname: "", email: "", password: "", confirm_password: "" });
      localStorage.setItem("token", isRegistered?.data);

      const headers = {
        authorization: localStorage.getItem("token"),
      };

      usercon.fetchUserData(headers);

      onOpenChatbot()
      // navigate("/signin")
    } else {
      alert.notify(isRegistered?.status, isRegistered?.message); 
    }
  };

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="signup-page">
      {/* Left Section */}
      <div className="left-section">
        <div className="signup-branding">
          <TextRevealCard
            text="Hover to unlock the future of security!"
            revealText="Ready to secure your website? Sign up and let us protect you."
          />
          <div className="branding-cta">
            <button className="get-started-btn">Know More</button>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Create an Account</h2>
          <form method="POST" onSubmit={subHandler}>
            <input
              type="text"
              placeholder="First Name"
              minLength={1}
              required
              onChange={changeHandler}
              value={data.fname}
              name="fname"
              pattern="^[^\s]+$" // Regex to disallow white spaces
              title="White spaces are not allowed in the first name."
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              minLength={1}
              onChange={changeHandler}
              value={data.lname}
              name="lname"
              pattern="^[^\s]+$" // Regex to disallow white spaces
              title="White spaces are not allowed in the last name."
            />
            <input
              type="text"
              placeholder="E-mail"
              required
              onChange={changeHandler}
              value={data.email}
              name="email"
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" //Regex to validate E-Mail
              title="Please enter a valid email address"
            />

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                placeholder="Password"
                required
                minLength={6}
                onChange={changeHandler}
                value={data.password}
                name="password"
                pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}"
                title="Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              >
                {showPassword ? <LuEyeClosed /> : <FaEye />}
              </span>
            </div>

            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"} // Toggle between text and password
                placeholder="Confirm Password"
                required
                minLength={6}
                onChange={changeHandler}
                value={data.confirm_password}
                name="confirm_password"
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility
              >
                {showConfirmPassword ? <LuEyeClosed /> : <FaEye />}
              </span>
            </div>


            <button type="submit" className="shimmer-btn">
              Create an Account
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <Link
              to="/Signin"
              style={{
                color: "#9D4EDD", 
                textDecoration: "none", 
                fontWeight: "bold", 
              }}
            >
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
