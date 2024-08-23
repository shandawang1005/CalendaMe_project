// import React from "react";
import ReactDOM from "react-dom";
import "./ConfirmRemove.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{message || "Are you sure?"}</h3>
        <div>
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onClose}>No</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
