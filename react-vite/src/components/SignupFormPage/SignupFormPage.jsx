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
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword:
          "Confirm Password field must be the same as the Password field",
      });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">Sign-Up</h1>

      {errors.server && <p>{errors.server}</p>}

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="input-container">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="signup-input"
            placeholder=" "
          />
          <label className="floating-label">Email</label>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="signup-input"
            placeholder=" "
          />
          <label className="floating-label">Username</label>
        </div>

        <div className="input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="signup-input"
            placeholder=" "
          />
          <label className="floating-label">Password</label>
        </div>

        <div className="input-container">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="signup-input"
            placeholder=" "
          />
          <label className="floating-label">Confirm Password</label>
        </div>

        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>

      <div className="auth-links">
        Already have an account?{" "}
        <a href="/login" className="login-link">
          Login
        </a>
      </div>
    </div>
  );
}

export default SignupFormPage;
