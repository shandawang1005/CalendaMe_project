import "./Splashpage.css";
import { useNavigate } from "react-router-dom";

function Splashpage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="splash-page">
      <div className="splash-content">
        <h1 className="splash-title">Welcome to Our Platform</h1>
        <p className="splash-subtitle">
          Join us to experience all the features we have to offer!
        </p>
        <div className="splash-buttons">
          <button className="splash-button login-button" onClick={handleLogin}>
            Log In
          </button>
          <button
            className="splash-button signup-button"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Splashpage;
