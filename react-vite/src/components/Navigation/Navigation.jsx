import { NavLink, Link } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSelector } from "react-redux";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton"; // Adjust the path as needed
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <div>
      {user ? (
        <nav className="navbar">
          <ul className="navbar-links">
            <Link to="/">
              <img
                className="Logo"
                src="../../../public/images/Logo-removebg.png"
                alt="Logo"
              />
            </Link>
            <>
              <li>
                <NavLink
                  exact
                  to="/"
                  activeClassName="active"
                  className="NavLink"
                >
                  DashBoard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/today"
                  activeClassName="active"
                  className="NavLink"
                >
                  Today's Calendar
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/messages"
                  activeClassName="active"
                  className="NavLink"
                >
                  Messages
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/invitation"
                  activeClassName="active"
                  className="NavLink"
                >
                  Invitation
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/friends"
                  activeClassName="active"
                  className="NavLink"
                >
                  Add Friends
                </NavLink>
              </li>
              <li>
                <ProfileButton className="profile-button" />
              </li>
              <li>
                <ThemeToggleButton /> {/* Theme toggle button */}
              </li>
            </>
          </ul>
        </nav>
      ) : (
        <div className="Logged-out-theme-button">
          <img
            className="Logo"
            src="../../../public/images/Logo-removebg.png"
            alt="Logo"
          />

          <li>
            <ThemeToggleButton /> {/* Theme toggle button */}
          </li>
        </div>
      )}
    </div>
  );
}

export default Navigation;
