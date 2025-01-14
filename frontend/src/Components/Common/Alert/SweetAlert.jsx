import { Component } from 'react';
import Swal from 'sweetalert2';

export default class Notification extends Component {
    alert = (icon, title, text, footer, callback, timeout = 1700, imgUrl = null, imgWidth = 370, imgHeight = 210, imgAlt = "Alert Image", confirmbtn = true) => {
        Swal.fire(
            {
                icon: icon,
                title: title,
                text: text,
                footer: footer,
                imageUrl: imgUrl, // Custom image URL
                imageWidth: imgWidth,
                imageHeight: imgHeight,
                imageAlt: imgAlt,
                showConfirmButton: confirmbtn, // Hide the "OK" button

            },

        ).then(() => {
            if (callback) callback(); // Call the callback after the alert closes
        });

        setTimeout(() => {
            Swal.close()
        }, timeout)
    }

    // confirmBox = (title, text, { deleteHandler }) => {
    //     Swal.fire(
    //         {
    //             icon: 'warning',
    //             showCancelButton: true,
    //             cancelButtonColor: '#0b8fdc',
    //             confirmButtonColor: '#d33',
    //             confirmButtonText: 'Delete',
    //             title: title,
    //             text: text,
    //         }
    //     ).then((result) => {
    //         if (result.isConfirmed) {
    //             deleteHandler();
    //         }
    //     })
    // }


}