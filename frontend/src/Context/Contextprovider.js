import React from 'react'
import usercontext from './UserContext.js'
import { getUserData } from '../Services/UserDataServices.jsx'

function Contextprovider(props) {

    const fetchUserData = async (headers) => {

        const user = await getUserData(headers) //call api and pass token to fetch user's data
        
        console.log(user);
        

        if (user?.data) {
            console.log(user.data)
            localStorage.setItem("fname", user?.data.fname.toString())
            localStorage.setItem("lname", user?.data.lname.toString())
            localStorage.setItem("email", user?.data.email.toString())
            localStorage.setItem("url", user?.data?.profile_photo_url || "");
            localStorage.setItem("subscription", user?.data.subscription?.toString())

        }

    }

    return (
        <usercontext.Provider value={{fetchUserData}}>
            {props.children}
        </usercontext.Provider>
    )
}

export default Contextprovider
