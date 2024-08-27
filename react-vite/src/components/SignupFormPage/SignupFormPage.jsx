import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleLogin = async (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Confirm Password field must be the same as the Password field"
      );
      return;
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        password,
      })
    );

    if (serverResponse) {
      console.log("Response", serverResponse);
      // Assuming serverResponse contains specific field errors
      if (serverResponse.email) {
        setEmailError(serverResponse.email);
      }
      if (serverResponse.username) {
        setUsernameError(serverResponse.username);
      }
      if (serverResponse.password) {
        setPasswordError(serverResponse.password);
      }
      if (serverResponse.confirmPassword) {
        setConfirmPasswordError(serverResponse.confirmPassword);
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="centered-container">
      <div className="login-container">
        <h1 className="login-title">Sign-Up</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-container">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              placeholder=" "
            />
            <label className="floating-label">Email</label>
          </div>
          {emailError && <p className="error">{emailError}</p>}

          <div className="input-container">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
              placeholder=" "
            />
            <label className="floating-label">Username</label>
          </div>
          {usernameError && <p className="error">{usernameError}</p>}

          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder=" "
            />
            <label className="floating-label">Password</label>
          </div>
          {passwordError && <p className="error">{passwordError}</p>}

          <div className="input-container">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="login-input"
              placeholder=" "
            />
            <label className="floating-label">Confirm Password</label>
          </div>
          {confirmPasswordError && (
            <p className="error">{confirmPasswordError}</p>
          )}

          <button type="submit" className="login-button">
            Sign Up
          </button>
        </form>

        <div className="signup-link">
          Already have an account? <button onClick={handleLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
}

export default SignupFormPage;
