import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSelector } from "react-redux";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <nav className="navbar">
      <ul className="navbar-links">
        {user && (
          <>
            <li>
              <NavLink exact to="/" activeClassName="active">
                DashBoard
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" activeClassName="active">
                Calendar
              </NavLink>
            </li>
            <li>
              <NavLink to="/friends" activeClassName="active">
                Friends
              </NavLink>
            </li>
            <li>
              <NavLink to="/messages" activeClassName="active">
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink to="/notification" activeClassName="active">
                Notification
              </NavLink>
            </li>
            <li>
              <NavLink to="/invitation" activeClassName="active">
                Invitation
              </NavLink>
            </li>
            <li>
              <ProfileButton />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
