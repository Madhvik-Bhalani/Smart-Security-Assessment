import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./UserUpdate.css";
import axios from "axios";
import img from '../../assets/delete.png';

export default function UserUpdate({ closeModal }) {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [subscriptionType, setSubscriptionType] = useState(null);
    const [expirationDate, setExpirationDate] = useState(null);

    const user_fname = localStorage.getItem("fname");
    const user_lname = localStorage.getItem("lname");
    const user_email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    const profilePhotoUrl = localStorage.getItem("url");

    useEffect(() => {
        const subscriptionData = localStorage.getItem("subscription");
        if (subscriptionData) {
            try {
                const [type, expirationInfo] = subscriptionData.split("|");
                if (expirationInfo.startsWith("expires:")) {
                    const expiration = expirationInfo.replace("expires:", "");
                    const expDate = new Date(expiration);
                    if (!isNaN(expDate.getTime())) {
                        setSubscriptionType(type);
                        setExpirationDate(expDate.toUTCString().split(' ').slice(0, 4).join(' '));
                    } else {
                        console.error("Invalid expiration date format:", expiration);
                    }
                }
            } catch (error) {
                console.error("Error parsing subscription data:", error);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { fname, lname, email } = Object.fromEntries(formData);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/v1/users/edit-account",
                { email, fname, lname },
                {
                    withCredentials: true,
                    headers: { 'token': token, 'Content-Type': 'application/json' }
                }
            );
            if (res.data.status) {
                localStorage.setItem("fname", fname);
                localStorage.setItem("lname", lname);
                localStorage.setItem("email", email);
            }
            window.dispatchEvent(new Event("closeModals"));
            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append("upload_preset", "smart_security");
        data.append("file", file);
        data.append("cloud_name", "dmzuvi5wj");

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dmzuvi5wj/image/upload", {
                method: "POST",
                body: data,
            });
            const uploadedImage = await res.json();
            const url = uploadedImage.url;

            await axios.post(
                "http://localhost:5000/api/v1/users/upload-profile-photo",
                { email: user_email, profile_photo_url: url },
                { withCredentials: true, headers: { 'Content-Type': 'application/json', 'token': token } }
            );
            localStorage.setItem("url", url);
            navigate("/chat");
        } catch (error) {
            console.error("Upload error:", error.message);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm("Are you sure you want to delete your profile picture?")) return;

        try {
            await axios.post(
                "http://localhost:5000/api/v1/users/delete-profile-photo",
                { email: user_email },
                { withCredentials: true, headers: { 'Content-Type': 'application/json', 'token': token } }
            );
            localStorage.removeItem("url");
            navigate("/chat");
        } catch (error) {
            console.error("Delete error:", error.message);
        }
    };

    return (
        <div className='user-profileUpdate'>
            <div className="user-formContainer">
                <div className="button-container">
                    <h6></h6>
                    <img src={img} alt="close" className='button' onClick={() => closeModal(false)} />
                </div>
                <form onSubmit={handleSubmit} className='user-form'>
                    <div className='user-user-header'>
                        <h1 className='user-h1'>Update Profile</h1>
                        {subscriptionType === "14 day free trial" && (
                            <button className="upgrade-button" onClick={() => window.location.href = "/subscription"}>
                                Upgrade Account
                            </button>
                        )}
                    </div>
                    <div className="subscription-info">
                        <h3 className="subscription-title">Subscription</h3>
                        <p className="subscription-type"><strong>Type:</strong> {subscriptionType || "N/A"}</p>
                        <p className="subscription-expiration"><strong>Expires:</strong> {expirationDate || "N/A"}</p>
                    </div>
                    <div className="user-item">
                        <label className='user-label' htmlFor="fname">Name:</label>
                        <input className='user-input' type="text" name="fname" id="fname" defaultValue={user_fname} />
                    </div>
                    <div className="user-item">
                        <label className='user-label' htmlFor="lname">Surname:</label>
                        <input className='user-input' type="text" name="lname" id="lname" defaultValue={user_lname} />
                    </div>
                    <div className="user-item">
                        <label className='user-label' htmlFor="email">Email:</label>
                        <input className='user-input' type="email" name="email" id="email" defaultValue={user_email} />
                    </div>
                    {profilePhotoUrl ? (
                        <button type="button" className="delete-photo-button" onClick={handleDeleteProfilePicture}>
                            Delete Profile Photo
                        </button>
                    ) : (
                        <div className="upload-photo-container">
                            <input type="file" className="file-input" onChange={handleFileUpload} />
                            <span className="upload-photo-text">Upload Profile Photo</span>
                        </div>
                    )}
                    <button className='user-button'>Update</button>
                    {error && <span className='user-span'>{error}</span>}
                </form>
                <button className='cancel-button-user' onClick={() => closeModal(false)}>Cancel</button>
            </div>
        </div>
    );
}
