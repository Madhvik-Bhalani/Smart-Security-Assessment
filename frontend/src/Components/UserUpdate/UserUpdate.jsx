import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "./UserUpdate.css"
import axios from "axios"
import img from '../../assets/delete.png';

export default function UserUpdate({ closeModal }) {
    const navigate = useNavigate()
    const [error, setError] = useState("")

    const user_fname = localStorage.getItem("fname")
    const user_lname = localStorage.getItem("lname")
    const user_email = localStorage.getItem("email")
    const token = localStorage.getItem("token")
    const profilePhotoUrl = localStorage.getItem("url");


    const handleSubmit = async (e) => {
        e.preventDefault()

        // Retrieving updated values from the form
        const formData = new FormData(e.target)
        const { fname, lname, email } = Object.fromEntries(formData)

        // Getting the token from localStorage
        const token = localStorage.getItem("token")

        try {
            const res = await axios.post(
                `http://localhost:5000/api/v1/users/edit-account`,
                {
                    email,
                    fname,
                    lname,
                },
                {
                    withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )

            // If successful, update the localStorage with the new data
            if (res.data.status) {
                localStorage.setItem("fname", fname);
                localStorage.setItem("lname", lname);
                localStorage.setItem("email", email);
            }

            // Redirect to profile page after successful update
            window.dispatchEvent(new Event("closeModals"));
            navigate("/profile")
        } catch (err) {
            console.log(err)
            // Handle error (display message from backend)
            setError(err.response?.data?.message || "Something went wrong!")
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]

        if (!file) return

        const data = new FormData()

        data.append("upload_preset", "smart_security")
        data.append("file", file)
        data.append("cloud_name", "dmzuvi5wj")

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dmzuvi5wj/image/upload", {
                method: "POST",
                body: data,
            });
            const uploadedImage = await res.json();
            const url = uploadedImage.url
            const email = localStorage.getItem("email")
            console.log(uploadedImage.url);

            const res_user = await axios.post(
                "http://localhost:5000/api/v1/users/upload-profile-photo",
                {
                    email: email,
                    profile_photo_url: url,
                },
                {
                    withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${token}`, // Include the token in the headers
                    },
                }
            );
            localStorage.setItem("url", url)
            console.log("url added")
            window.location.href = "/chat";
            navigate("/chat");

        } catch (error) {
            console.error("Upload error:", error.message);
        }
    }

    const handleDeleteProfilePicture = async (event) => {
        if (!window.confirm("Are you sure you want to delete your profile picture?")) {
            return;
        }

        try {
            const email = localStorage.getItem("email")

            const res_user = await axios.post(
                "http://localhost:5000/api/v1/users/delete-profile-photo",
                {
                    email: email,
                },
                {
                    withCredentials: true, // Ensure cookies are sent with the request
                    headers: {
                        'Content-Type': 'application/json',
                        'token': `${token}`, // Include the token in the headers
                    },
                }
            );
            localStorage.removeItem("url")
            window.location.href = "/chat";
            navigate("/chat");

        } catch (error) {
            console.error("Upload error:", error.message);
        }
    }



    return (
        <div className='user-profileUpdate'>
            <div className="user-formContainer">
                <div className="button-container">
                    <h6></h6>
                    <img src={img} alt="pox" className='button' onClick={() => closeModal(false)} />
                </div>
                <form onSubmit={handleSubmit} className='user-form'>
                    <h1 className='user-h1'>Update Profile</h1>
                    <div className="user-item">
                        <label className='user-label'
                            htmlFor="fname">Name: </label>
                        <input className='user-input' type="text" name="fname" id="fname" defaultValue={user_fname} />
                    </div>
                    <div className="user-item">
                        <label className='user-label' htmlFor="lname">Surname: </label>
                        <input className='user-input' type="text" name="lname" id="lname" defaultValue={user_lname} />
                    </div>
                    <div className="user-item">
                        <label className='user-label' htmlFor="email">Email: </label>
                        <input className='user-input' type="email" name="email" id="email" defaultValue={user_email} />
                    </div>
                    <div>
                        {profilePhotoUrl ? (
                            <button
                                type="button"
                                className="delete-photo-button"
                                onClick={handleDeleteProfilePicture}
                            >
                                Delete Profile Photo
                            </button>
                        ) : (
                            <div className="upload-photo-container">
                                <input
                                    type="file"
                                    className="file-input"
                                    onChange={handleFileUpload}
                                />
                                <span className="upload-photo-text">Upload Profile Photo</span>
                            </div>
                        )}
                    </div>


                    <button className='user-button'>Update</button>
                    {error && <span className='user-span'>{error}</span>}
                </form>
            </div>

        </div>
    )
}
