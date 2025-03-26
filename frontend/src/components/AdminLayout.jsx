// src/components/AdminLayout.jsx
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Admin Navbar */}
      <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="mr-4 text-xl md:hidden focus:outline-none"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="hidden md:block">
          <Link className="mr-4 hover:underline" to="/admin/logs">
            Activity Logs
          </Link>
          {/* Add more admin links as needed */}
        </nav>
      </header>

      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <aside
          className={`
            bg-gray-200 dark:bg-gray-800 p-4 w-64
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          <nav>
            <ul>
              <li className="mb-2">
                <Link to="/admin/logs" className="hover:underline block">
                  Activity Logs
                </Link>
              </li>
              {/* Additional sidebar items */}
            </ul>
          </nav>
        </aside>

        {/* Main Admin Content */}
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
