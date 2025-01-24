import React, { useContext, useEffect, useState } from 'react'
import "./User.css"
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
// import { AuthContext } from "../../context/AuthContext"

export default function User() {
    const [item, setItem] = useState([])
    const user_fname = localStorage.getItem("fname")
    const user_lname = localStorage.getItem("lname")
    const user_email = localStorage.getItem("email")

    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!user_fname) {
    //         navigate("/login")
    //     }
    // }, [currentUser, navigate])

    const handleLogout = async () => {
        localStorage.clear();
        navigate('/')
    }



    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token")
    
            await axios.post(`http://localhost:5000/api/v1/users/delete-account`, {
                email: user_email
            } , {
                withCredentials: true,
                headers: {
                    'token': `${token}`,
                    'Content-Type': 'application/json'
                }
            })
    
            // Clear any locally stored data
            localStorage.clear();
            
            // Redirect to homepage
            navigate("http://localhost:3000/Signup");
        } catch (err) {
            console.log(err);
            // Optionally, show an error message to the user
        }
    }
    
    return (
        user_fname && (
            <div className='profilePage'>
                <div className="details">
                    <div className="wrapper">
                        <div className="title">
                            <h1>User Information</h1>
                            <Link to="/profile/update">
                                <button>Update Profile</button>
                            </Link>
                            <Link to="/change-password">
                                <button>Change Password</button>
                            </Link>
                        </div>
                        <div className="info">
                            {/* <span><img src="/logo.png" alt="" /></span> */}
                            <span>Name: <b>{user_fname}</b></span>
                            <span>Name: <b>{user_lname}</b></span>
                            <span>email: <b>{user_email}</b></span>
                            <button onClick={handleLogout}>Log out</button>
                            <div className="deleteDiv">
                                <button className="delete" onClick={handleDelete}>Delete Account</button>
                            </div>
                        </div>
                        <div className="title">
                        </div>

                    </div>
                </div>
                <div className="rightContainer">
                    <div className="wrapper"></div>
                </div>
            </div>)
    )
}
