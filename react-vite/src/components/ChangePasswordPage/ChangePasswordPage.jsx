import { useState } from "react";
import { useDispatch } from "react-redux";
import { changePasswordThunk } from "../../redux/session";
import { useNotification } from "../NotificationPage/NotificationContainer";
import "./ChangePasswordPage.css"; // Import the CSS file

function ChangePasswordPage() {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Get the success or error messages from the Redux store
  // const successMessage = useSelector(
  //   (state) => state.session.passwordChangeMessage
  // );
  // const errorMessage = useSelector(
  //   (state) => state.session.passwordChangeError
  // );

  // Get the addNotification function from your custom notification hook
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      addNotification(
        "New password and confirmation do not match.",
        "error",
        5000
      );
      return;
    }

    // Dispatch the thunk with the required fields
    const result = await dispatch(
      changePasswordThunk(currentPassword, newPassword, confirmNewPassword)
    );

    // Handle notifications based on the result
    if (result === "Password changed successfully.") {
      addNotification(result, "success", 5000);
    } else if (result) {
      addNotification(result, "error", 5000);
    }
  };

  return (
    <div className="centered-container">
      <div className="change-password-container">
        <h2 className="change-password-title">Change Password</h2>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="input-container">
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="change-password-input"
              required
              placeholder=" "
            />
            <label htmlFor="current-password" className="floating-label">
              Current Password
            </label>
          </div>
          <div className="input-container">
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="change-password-input"
              required
              placeholder=" "
            />
            <label htmlFor="new-password" className="floating-label">
              New Password
            </label>
          </div>
          <div className="input-container">
            <input
              type="password"
              id="confirm-new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="change-password-input"
              required
              placeholder=" "
            />
            <label htmlFor="confirm-new-password" className="floating-label">
              Confirm New Password
            </label>
          </div>

          <button type="submit" className="change-password-button">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
