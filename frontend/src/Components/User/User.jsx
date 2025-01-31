import React, {useState} from "react";
import "./User.css";
import { useNavigate } from 'react-router-dom';


export default function User() {
    const navigate = useNavigate()

    const [isEditProfile, setIsEditProfile] = useState(false)

    const user_fname = localStorage.getItem("fname");
    const user_lname = localStorage.getItem("lname");
    const user_email = localStorage.getItem("email");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/")
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");

            await fetch("http://localhost:5000/api/v1/users/delete-account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: user_email }),
            });

            localStorage.clear();
            window.location.href = "/signup"; // Redirect to the signup page
        } catch (err) {
            console.error("Error deleting account:", err);
        }
    };

    return (
        <div className="user-profile">
            <div className="profile-content">
                <div className="profile-details">
                    <div className="profile-field">
                        
                        <span className="field-value">{user_fname}  {user_lname}</span>
                    </div>
                    <div className="profile-field">
                        
                        <span className="field-value">{user_email}</span>
                    </div>
                </div>
                <div className="profile-actions">
                <button
                        className="action-button update-button"
                        onClick={() => {
                            setIsEditProfile(!isEditProfile); // Local state change
                            // if (editProfile) {
                            //     editProfile(!isEditProfile); // Call parent prop function if provided
                            // }
                        }}
                    >
                        Update Profile
                    </button>
                    <button className="action-button change-password-button">
                        Change Password
                    </button>
                    <button className="action-button logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                    <button className="action-button delete-button" onClick={handleDelete}>
                        Delete Account
                    </button>

                </div>

            </div>
        </div>
    );
}