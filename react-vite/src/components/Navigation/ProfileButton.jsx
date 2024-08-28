import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { thunkLogout } from "../../redux/session";
// import OpenModalMenuItem from "./OpenModalMenuItem";
import CreateEditEventModal from "../CreateEditEventModal/CreateEditEventModal";
import { useNavigate } from "react-router-dom";
import "./ProfileButton.css"; // Import the CSS file for styling

function ProfileButton() {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false); // Control the modal state
  const user = useSelector((store) => store.session.user);
  const ulRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const logout = async (e) => {
    e.preventDefault();
    // Delete the session cookie
    deleteCookie("session");
    //  delete the CSRF token cookie
    deleteCookie("csrf_token");
    
    await dispatch(thunkLogout());
    closeMenu();
    // setTimeout(navigate("/"), 10000);
    navigate("/");
  };

  // Handle opening and closing the modal
  const openCreateEventModal = () => {
    setShowCreateEventModal(true);
    closeMenu(); // Close dropdown when opening modal
  };

  const closeCreateEventModal = () => {
    setShowCreateEventModal(false);
  };
  const formatName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  return (
    <div className="profile-button-wrapper">
      <button
        onClick={toggleMenu}
        className="profile-icon-button"
        // disabled={isDisabled}
      >
        <FaUserCircle />
      </button>
      {showMenu && (
        <ul className="profile-dropdown" ref={ulRef}>
          {user ? (
            <>
              <li className="dropdown-item">
                Welcome! {formatName(user.username)}.
              </li>
              <li
                className="dropdown-item"
                onClick={() => navigate("/profile")}
              >
                Profile
              </li>
              <li
                className="dropdown-item"
                onClick={() => navigate("/profile/change-password")}
              >
                Change Password
              </li>
              <li className="dropdown-item" onClick={openCreateEventModal}>
                Create Event
              </li>
              <li
                className="dropdown-item"
                onClick={() => navigate("/history")}
              >
                Event History
              </li>
              <li className="dropdown-item">
                <button onClick={logout} className="logout-button">
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <div></div>
          )}
        </ul>
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <CreateEditEventModal
          isOpen={showCreateEventModal}
          onClose={closeCreateEventModal}
        />
      )}
    </div>
  );
}

export default ProfileButton;
