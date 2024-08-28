import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { FaBarsStaggered } from "react-icons/fa6";
import "./NavigationMenuButton.css";

function NavigationMenuButton() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Track hover state
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="navigation-menu-button-wrapper" ref={dropdownRef}>
      <button
        className="menu-icon-button"
        onClick={toggleDropdown}
        onMouseEnter={() => setIsHovered(true)} // Set hover state on mouse enter
        onMouseLeave={() => setIsHovered(false)} // Remove hover state on mouse leave
      >
        {isHovered ? <FaBarsStaggered /> : <FaBars />}
      </button>
      {isDropdownOpen && (
        <ul className="menu-dropdown">
          <li className="dropdown-item" onClick={() => handleNavigate("/")}>
            Dashboard
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleNavigate("/today")}
          >
            Today&apos;s Calendar
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleNavigate("/invitation")}
          >
            Invitations
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleNavigate("/friends")}
          >
            Friends
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleNavigate("/messages")}
          >
            Live Chat
          </li>
        </ul>
      )}
    </div>
  );
}

export default NavigationMenuButton;
