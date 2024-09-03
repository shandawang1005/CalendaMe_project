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

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const validatePassword = (password) => {
    const hasRequiredLength = password.length >= 8;
    const hasNumber = /\d/.test(password); //at least 1 number
    const hasSpecialCharacter = /[!@#$%^&*]/.test(password); //at least one of the characters inside
    const hasDot = /\./.test(password);

    return hasRequiredLength && hasNumber && (hasSpecialCharacter || hasDot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let hasErrors = false;

    // Frontend validations
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasErrors = true;
    }

    if (!validateUsername(username)) {
      setUsernameError("Username must be between 3 and 20 characters long.");
      hasErrors = true;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long and include at least one number and one special character ( !, @, #, $, %, ^, &, *)."
      );
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Confirm Password field must match the Password field."
      );
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Proceed with backend validation if frontend validation passes
    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        password,
      })
    );

    if (serverResponse) {
      // console.log("Response", serverResponse);
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
