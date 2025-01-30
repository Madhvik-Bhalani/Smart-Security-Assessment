import { Component } from 'react';
import Swal from 'sweetalert2';

export default class Notification extends Component {
    alert = (icon, title, text, footer) => {
        Swal.fire(
            {
                icon: icon,
                title: title,
                text: text,
                footer: footer
            },
            setTimeout(() => {
                Swal.close()
            }, 1500)
        )
    }

    confirmBox = (title, text, { deleteHandler }) => {
        Swal.fire(
            {
                icon: 'warning',
                showCancelButton: true,
                cancelButtonColor: '#0b8fdc',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Delete',
                title: title,
                text: text,
            }
        ).then((result) => {
            if (result.isConfirmed) {
                deleteHandler();
            }
        })
    }


}