import "./Splashpage.css";
// import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Splashpage() {
  const navigate = useNavigate();

  // const user = useSelector((state) => state.session.user);

  const handleLogin = async (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="splash-container">
      <button onClick={handleLogin}>Log In</button>
      <button onClick={handleSignUp}>Sign Up</button>
      <p>Please Join us to see Full Features!</p>
    </div>
  );
}

export default Splashpage;
