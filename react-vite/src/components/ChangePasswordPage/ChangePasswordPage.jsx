import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePasswordThunk } from "../../redux/session"; // Import the thunk

function ChangePasswordPage() {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Get the success or error messages from the Redux store
  const successMessage = useSelector(
    (state) => state.session.passwordChangeMessage
  );
  const errorMessage = useSelector(
    (state) => state.session.passwordChangeError
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    // Log the passwords to verify what is being entered (REMOVE THIS AFTER TESTING)
    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);
    console.log("Confirm New Password:", confirmNewPassword);

    // Dispatch the thunk with the required fields
    await dispatch(
      changePasswordThunk(currentPassword, newPassword, confirmNewPassword)
    );
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="current-password">Current Password</label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            type="password"
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Change Password</button>
      </form>

      {/* Display success or error messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default ChangePasswordPage;
