import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";

// For preset themes, force background with preset classes.
const presetColorMapping = {
  themeBlue: "bg-blue-600",
  themeGreen: "bg-green-600",
  themePurple: "bg-purple-600",
};

const Header = ({ darkMode, onToggleDarkMode, theme, customColor, customTextColor }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // If preset, we use preset classes and force text to white via inline style.
  const style = theme === "custom" 
    ? { backgroundColor: customColor, color: customTextColor }
    : { color: "#ffffff" };

  return (
    <header
      style={style}
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
      <div className="flex items-center space-x-4">
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
        <button onClick={handleLogout} className="p-2 rounded bg-red-500 hover:bg-red-700 transition" title="Logout">
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
