import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import "./LoginForm.css";

function LoginFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  const handleDemo1Submit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email: "demo@aa.io",
        password: "password",
      })
    );

    if (!serverResponse) {
      navigate("/");
    }
  };

  const handleDemo3Submit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email: "bobbie@aa.io",
        password: "password",
      })
    );

    if (!serverResponse) {
      navigate("/");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="centered-container">
      <div className="login-container">
        <h1 className="login-title">Log In</h1>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.length > 0 &&
            errors.map((message, index) => (
              <p key={index} className="error">
                {message}
              </p>
            ))}

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
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <div className="login-demo-buttons">
          <button onClick={handleDemo1Submit} className="demo-button">
            Log in as Demo User 1
          </button>

          <button onClick={handleDemo3Submit} className="demo-button">
            Log in as Demo User 2
          </button>
        </div>

        <div className="signup-link">
          Don&apos;t have an account?{" "}
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default LoginFormPage;
