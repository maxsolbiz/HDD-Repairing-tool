// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiTool, FiMenu, FiActivity } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const presetSidebarMapping = {
  themeBlue: "bg-blue-100 dark:bg-blue-800",
  themeGreen: "bg-green-100 dark:bg-green-800",
  themePurple: "bg-purple-100 dark:bg-purple-800",
};

const Sidebar = ({ theme, customColor, customTextColor }) => {
  const navigate = useNavigate();
  const { user } = useAuth();  // <--- Get the current user
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on mobile view (width < 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const style = theme === "custom" ? { backgroundColor: customColor, color: customTextColor } : {};
  const widthClass = isCollapsed ? "w-20" : "w-64";
  const presetClass = theme === "custom" ? "" : presetSidebarMapping[theme];
  const sidebarClasses = `transition-all duration-300 p-4 ${widthClass} ${presetClass}`;

  return (
    <aside style={style} className={sidebarClasses}>
      <div className="flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 focus:outline-none"
        >
          <FiMenu size={24} />
        </button>
      </div>
      <nav className="mt-4 space-y-2">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 w-full"
        >
          <FiHome size={20} />
          {!isCollapsed && <span className="ml-2">Dashboard</span>}
        </button>

        <button
          onClick={() => navigate("/scan")}
          className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 w-full"
        >
          <FiSearch size={20} />
          {!isCollapsed && <span className="ml-2">Scan Drives</span>}
        </button>

        <button
          onClick={() => navigate("/repair")}
          className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 w-full"
        >
          <FiTool size={20} />
          {!isCollapsed && <span className="ml-2">Repair Drives</span>}
        </button>

        {/* Only show "Admin Logs" if user is admin */}
        {user && user.role === "admin" && (
          <button
            onClick={() => navigate("/admin/logs")}
            className="flex items-center p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 w-full"
          >
            <FiActivity size={20} />
            {!isCollapsed && <span className="ml-2">Admin Logs</span>}
          </button>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
