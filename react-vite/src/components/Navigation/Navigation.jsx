import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSelector } from "react-redux";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return user ? (
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      <li>
        <ProfileButton />
      </li>
    </ul>
  ) : null;
}
export default Navigation;
