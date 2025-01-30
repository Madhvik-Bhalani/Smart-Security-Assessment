import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class Notification extends React.Component {

    notify = (status, messsage) => {
        if (status) {
            toast.success(messsage, {
                position: "top-right",
                autoClose: 3500
            });
        } else {
            toast.error(messsage, {
                position: "top-right",
            });
        }
    }

    infoNotify = (status, messsage) => {
        if (status) {
            toast.info(messsage, {
                position: "top-right",
                autoClose: 4000
            });
        } else {
            toast.info(messsage, {
                position: "top-right",
                autoClose: 4000
            });
        }
    }

}

