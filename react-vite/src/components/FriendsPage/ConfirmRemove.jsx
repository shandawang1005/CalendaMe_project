import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./ConfirmRemove.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  const modalRef = useRef(null);

  // Close the modal when clicking outside of the modal content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h3 className="modal-message">{message || "Are you sure?"}</h3>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>
            Yes
          </button>
          <button className="cancel-button" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
