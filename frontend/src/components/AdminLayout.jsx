// src/components/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FiHome, FiLogOut } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Main Header (reuse your Header component styles if desired) */}
      <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="mr-4 text-xl md:hidden focus:outline-none"
          >
            {sidebarOpen ? <span>&#10005;</span> : <span>&#9776;</span>}
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="hidden md:block">
          <Link className="mr-4 hover:underline" to="/admin/logs">
            Activity Logs
          </Link>
          <button onClick={logout} className="hover:underline">
            Logout
          </button>
        </nav>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-gray-200 dark:bg-gray-800 p-4 w-64 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <nav>
            <ul>
              <li className="mb-2">
                <Link to="/admin/logs" className="hover:underline block">
                  Activity Logs
                </Link>
              </li>
              {/* Additional admin menu items can go here */}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      <footer className="p-4 bg-blue-600 text-white text-center">
        © {new Date().getFullYear()} Your Company
      </footer>
    </div>
  );
};

export default AdminLayout;
