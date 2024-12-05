import React from "react";
import { Link } from "react-router";
import './Signup.css';

function Signup() {
  return (
    <div className="login-page">
      {/* Left Section */}
      <div className="left-section">
        <div className="branding">
          <h1>Boundless Security, Infinite Trust</h1>
          <p>Join us to secure your website!</p>
        </div>
        <div className="testimonial">
          <p>
          "Security is a journey, not a destination. It is an ongoing process of vigilance, improvement, and adaptation to ever-changing threats. True security comes from not just protecting against known risks but anticipating and preparing for the unknown."
          
          </p>
          <p>— Bruce Schneier, Security Technologist and Author</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="form-container">
          <h2>Create an Account</h2>
          
          <form>
            <input type="text" placeholder="Name" required />
            <select>
              <option>Country</option>
              <option>India</option>
              <option>Germany</option>
              <option>USA</option>
            </select>
            
            <select>
              <option>Cybersecurity Knowledge Level</option>
              <option>Novice</option>
              <option>Intermediate</option>
              <optoin>Advanced</optoin>
              <option>Expert</option>
            </select>
            <input type="email" placeholder="Business E-mail" required />
            <input type="tel" placeholder="Phone number" required />
            <input type="password" placeholder="Password" required />
            <input type="password" placeholder="Confirm Password" required />

          {/*
            <div className="checkbox">
              <input type="checkbox" id="privacy-policy" required />
              <label htmlFor="privacy-policy">
                I accept the <a href="#privacy-policy">Privacy Policy</a>
              </label>
            </div>
          */ }
            <button type="submit" className="submit-btn">
              Create an Account
            </button>
          </form>
          <p>
            Already have an account? <Link to="/Signin">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// function LoginPage() {
//   return (
//     <div className="login-page">
//       {/* Left Section */}
//       <div className="left-section">
//         <div className="branding">
//           <h1>Boundless Security, Infinite Trust</h1>
//           <p>Join us to secure your website!</p>
//         </div>
//         <div className="testimonial">
//           <p>
//           "Security is a journey, not a destination. It is an ongoing process of vigilance, improvement, and adaptation to ever-changing threats. True security comes from not just protecting against known risks but anticipating and preparing for the unknown."
          
//           </p>
//           <p>— Bruce Schneier, Security Technologist and Author</p>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="right-section">
//         <div className="form-container">
//           <h2>Login to Your Account</h2>
//           <form>
//             <input type="email" placeholder="Email" required />
//             <input type="password" placeholder="Password" required />
//             {/**<div className="checkbox">
//               <input type="checkbox" id="remember-me" />
//               <label htmlFor="remember-me">Remember Me</label>
//             </div> */}
//             <button type="submit" className="submit-btn">
//               Login
//             </button>
//             <p>
//               Don't have an account? <Link to="/">Register Here</Link>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

export default Signup;
