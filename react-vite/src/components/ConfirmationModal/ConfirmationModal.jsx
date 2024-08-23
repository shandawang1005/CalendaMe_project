// import React from "react";
import ReactDOM from "react-dom";
import "./ConfirmationModal.css"; // Add your custom styles here

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
