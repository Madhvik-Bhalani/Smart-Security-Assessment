import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "./UserUpdate.css"
import axios from "axios"

export default function UserUpdate() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const user_fname = localStorage.getItem("fname")
    const user_lname = localStorage.getItem("lname")
    const user_email = localStorage.getItem("email")
    const token = localStorage.getItem("token")

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
            navigate("/profile")
        } catch (err) {
            console.log(err)
            // Handle error (display message from backend)
            setError(err.response?.data?.message || "Something went wrong!")
        }
    }
    


    return (
        <div className='profileUpdate'>
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <h1>Update Profile</h1>
                    <div className="item">
                        <label htmlFor="fname">Name: </label>
                        <input type="text" name="fname" id="fname" defaultValue={user_fname}  />
                    </div>
                    <div className="item">
                        <label htmlFor="lname">Surname: </label>
                        <input type="text" name="lname" id="lname" defaultValue={user_lname}  />
                    </div>
                    <div className="item">
                        <label htmlFor="email">Email: </label>
                        <input type="email" name="email" id="email" defaultValue={user_email} />
                    </div>
                    
                    <button>Update</button>
                    {error && <span>{error}</span>}
                </form>
            </div>
            {/* <div className="sideContainer">
                <img src={currentUser.avatar || "/noavatar.png"} alt="" className='avatar' />
            </div> */}

        </div>
    )
}
