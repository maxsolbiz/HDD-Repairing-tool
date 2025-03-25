// src/components/PublicHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";

const presetColorMapping = {
  themeBlue: "bg-blue-600",
  themeGreen: "bg-green-600",
  themePurple: "bg-purple-600",
};

const PublicHeader = ({ darkMode, onToggleDarkMode, theme, customColor, customTextColor }) => {
  const navigate = useNavigate();
  const style =
    theme === "custom"
      ? { backgroundColor: customColor, color: customTextColor }
      : { color: "#ffffff" };

  return (
    <header
      style={style}
      className={`fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-center ${
        theme === "custom" ? "" : presetColorMapping[theme]
      }`}
    >
      <div className="font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
        HDD Diagnostics
      </div>
      <div className="absolute right-4">
        <input
          type="checkbox"
          id="darkModeToggle"
          className="hidden"
          checked={darkMode}
          onChange={onToggleDarkMode}
        />
        <label
          htmlFor="darkModeToggle"
          className="relative inline-block w-12 h-6 cursor-pointer"
        >
          <span className="absolute top-0 left-0 w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300"></span>
          <span
            className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 flex items-center justify-center ${
              darkMode ? "translate-x-6" : "translate-x-0"
            }`}
          >
            {darkMode ? (
              <FiMoon className="text-yellow-500" size={18} />
            ) : (
              <FiSun className="text-orange-500" size={18} />
            )}
          </span>
        </label>
      </div>
    </header>
  );
};

export default PublicHeader;
