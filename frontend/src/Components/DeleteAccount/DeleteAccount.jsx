import React, {useEffect, useRef} from "react";
import "./DeleteAccount.css";

const DeleteAccount = ({ onCancel }) => {
  const user_email = localStorage.getItem("email");

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5000/api/v1/users/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user_email }),
      });

      localStorage.clear();
      window.location.href = "/signup"; // Redirect to the signup page
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };


  return (
    <div className="delete-overlay">
      <div className="delete-container">
        <h1 className="delete-title">Are you sure?</h1>
        <p className="delete-message">This action cannot be undone.</p>
        <div className="delete-buttons">
          <button className="delete-btn delete-confirm" onClick={handleDelete}>
            Delete
          </button>
          <button className="delete-btn delete-cancel" onClick={() => onCancel(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
