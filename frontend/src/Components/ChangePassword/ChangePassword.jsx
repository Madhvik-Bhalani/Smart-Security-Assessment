import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ChangePassword.css";
import axios from "axios";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const { old_password, new_password } = Object.fromEntries(formData);

        const token = localStorage.getItem("token"); // Retrieve token from local storage
        const email = localStorage.getItem("email"); // Retrieve email from local storage

        try {
            const res = await axios.post(
                "http://localhost:5000/api/v1/users/change-password",
                {
                    email,
                    old_password,
                    new_password,
                },
                {
                    withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token, // Include the token in the headers
                    },
                }
            );

            navigate("/profile");
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className='profileUpdate'>
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <div className="item">
                        <label htmlFor="old_password">Old Password: </label>
                        <input type="password" name="old_password" id="old_password" required />
                    </div>
                    <div className="item">
                        <label htmlFor="new_password">New Password: </label>
                        <input type="password" name="new_password" id="new_password" required />
                    </div>

                    <button>Update</button>
                    {error && <span>{error}</span>}
                </form>
            </div>
        </div>
    );
}