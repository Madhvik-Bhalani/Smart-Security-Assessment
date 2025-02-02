import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../Common/Alert/SweetAlert";
import PageNotFoundImg from "../../assets/page_not_found.png"

const InvalidRoute = () => {
    const navigate = useNavigate();
    const alert = new Notification();

    useEffect(() => {
        alert.alert(
            "none", // icon
            "", // title
            "Oops! The page you're looking for doesn't exist.", // text message
            "Redirecting you to the sign in page...", // footer message
            () => navigate("/signin"), // Callback for redirection
            3000, // coustom timeout
            PageNotFoundImg, // img url
            370, // img width
            210, // img height
            "404 Page Not Found", // img alt text
            false // confirm btn

        );
    }, [alert, navigate]);

    return null;
};

export default InvalidRoute;
