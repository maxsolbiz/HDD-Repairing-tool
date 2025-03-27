// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiUser } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

// For Vite projects; adjust if needed.
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

// Header preset mapping for header background.
const presetColorMapping = {
  themeBlue: "bg-blue-600",
  themeGreen: "bg-green-600",
  themePurple: "bg-purple-600",
};

// Preset dropdown mapping for preset themes.
const presetDropdown = {
  themeBlue: {
    light: { bg: "#bfdbfe", text: "#1e3a8a" },
    dark: { bg: "#1e3a8a", text: "#ffffff" },
  },
  themeGreen: {
    light: { bg: "#bbf7d0", text: "#14532d" },
    dark: { bg: "#14532d", text: "#ffffff" },
  },
  themePurple: {
    light: { bg: "#e9d5ff", text: "#4c1d95" },
    dark: { bg: "#4c1d95", text: "#ffffff" },
  },
};

// Helper function to adjust a hex color by a percentage.
function adjustColor(color, percent) {
  let num = parseInt(color.slice(1), 16),
    amt = Math.round(2.55 * percent),
    R = Math.min(255, Math.max(0, (num >> 16) + amt)),
    G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt)),
    B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// DropdownItem component to manage hover transitions.
const DropdownItem = ({ children, onClick, baseBg, baseText, hoverBg }) => {
  const [isHovered, setIsHovered] = useState(false);
  const itemStyle = {
    backgroundColor: isHovered ? hoverBg : baseBg,
    color: baseText,
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="block w-full text-left px-4 py-2 transition-colors duration-300"
      style={itemStyle}
    >
      {children}
    </button>
  );
};

const Header = ({
  darkMode,
  onToggleDarkMode,
  theme,
  customHeaderColor,
  customDropdownColor,
  customDropdownTextColor, // new prop for custom dropdown text color
  customTextColor,
}) => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error calling logout", err);
    }
    logout();
    navigate("/");
  };

  // Header style remains as before.
  const headerStyle =
    theme === "custom"
      ? { backgroundColor: customHeaderColor, color: customTextColor }
      : { color: "#ffffff" };

  // Compute dropdown colors.
  let baseDropdownBg, baseDropdownText, hoverDropdownBg;
  if (theme === "custom") {
    // Use the customDropdownColor and customDropdownTextColor passed from Layout.
    baseDropdownBg = customDropdownColor;
    baseDropdownText = customDropdownTextColor;
    hoverDropdownBg = adjustColor(customDropdownColor, -5);
  } else {
    if (darkMode) {
      baseDropdownBg = presetDropdown[theme].dark.bg;
      baseDropdownText = presetDropdown[theme].dark.text;
      hoverDropdownBg = adjustColor(presetDropdown[theme].dark.bg, 5);
    } else {
      baseDropdownBg = presetDropdown[theme].light.bg;
      baseDropdownText = presetDropdown[theme].light.text;
      hoverDropdownBg = adjustColor(presetDropdown[theme].light.bg, -5);
    }
  }

  return (
    <header
      style={headerStyle}
      className={`fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between ${
        theme === "custom" ? "" : presetColorMapping[theme]
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="font-bold text-xl cursor-pointer" onClick={() => navigate("/home")}>
          HDD Diagnostics
        </div>
        <nav className="hidden md:flex space-x-4">
          <button onClick={() => navigate("/home")} className="hover:underline">
            Home
          </button>
          <button onClick={() => navigate("/scan")} className="hover:underline">
            Scan
          </button>
          <button onClick={() => navigate("/repair")} className="hover:underline">
            Repair
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-4 relative">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="darkModeToggle"
            className="hidden"
            checked={darkMode}
            onChange={onToggleDarkMode}
          />
          <label htmlFor="darkModeToggle" className="relative inline-block w-12 h-6 cursor-pointer">
            <span className="absolute top-0 left-0 w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300"></span>
            <span
              className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 flex items-center justify-center ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {darkMode ? <FiMoon className="text-yellow-500" size={18} /> : <FiSun className="text-orange-500" size={18} />}
            </span>
          </label>
        </div>
        <div className="relative">
          <button onClick={toggleProfileMenu} className="p-2 focus:outline-none">
            <FiUser size={20} />
          </button>
          {profileMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-40 rounded shadow-lg z-10"
              style={{ backgroundColor: baseDropdownBg, color: baseDropdownText }}
            >
              <DropdownItem
                onClick={() => {
                  navigate("/user/profile");
                  setProfileMenuOpen(false);
                }}
                baseBg={baseDropdownBg}
                baseText={baseDropdownText}
                hoverBg={hoverDropdownBg}
              >
                My Profile
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  handleLogout();
                  setProfileMenuOpen(false);
                }}
                baseBg={baseDropdownBg}
                baseText={baseDropdownText}
                hoverBg={hoverDropdownBg}
              >
                Logout
              </DropdownItem>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
