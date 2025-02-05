import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ChangePassword.css";
import axios from "axios";
import img from '../../assets/delete.png';


export default function ChangePassword({closeModal}) {
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
                `${process.env.REACT_APP_API_URL}/users/change-password`,
                {
                    email,
                    old_password,
                    new_password,
                },
                {
                    // withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token, // Include the token in the headers
                    },
                }
            );
            window.dispatchEvent(new Event("closeModals"));
            navigate("/chat");
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className='user-changepassword'>
           
            <div className="user-changepassword-formContainer">
            <div className="button-container">
                <h6></h6>
                <img src={img} alt="pox" className='button' onClick={() => closeModal(false)} />
            </div>
                <form className='user-changepassword-form' onSubmit={handleSubmit}>
                    <h1>Change Password</h1>
                    <div className="user-changepassword-item">
                        <label className='user-changepassword-label' htmlFor="old_password">Old Password: </label>
                        <input className='user-changepassword-input' type="password" name="old_password" id="old_password" required />
                    </div>
                    <div className="user-changepassword-item">
                        <label className='user-changepassword-label' htmlFor="new_password">New Password: </label>
                        <input className='user-changepassword-input' type="password" name="new_password" id="new_password" required />
                    </div>

                    <button className='user-changepassword-button'>Update</button>
                    {error && <span className='user-changepassword-span'>{error}</span>}
                </form>
            </div>
        </div>
    );
}