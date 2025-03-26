// src/pages/AdminLogsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "http://127.0.0.1:8000";

const AdminLogsPage = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      // Fetch online users count
      const resOnline = await axios.get(`${BASE_URL}/admin/stats/online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnlineCount(resOnline.data.online_users);

      // Fetch paginated activity logs
      const resActivities = await axios.get(
        `${BASE_URL}/admin/user-activities?page=${page}&per_page=${perPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivities(resActivities.data.activities);
      setTotal(resActivities.data.total);
    } catch (err) {
      console.error("Error fetching admin logs", err);
      toast.error("Error fetching admin logs");
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, page]);

  const totalPages = Math.ceil(total / perPage);

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/admin/export-activities?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: format === "pdf" ? "application/pdf" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", format === "pdf" ? `activities_${Date.now()}.pdf` : `activities_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data", error);
      toast.error("Error exporting data");
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard - User Activity Logs</h1>
        <p className="text-xl mb-4">
          Total Online Users: <span className="font-bold">{onlineCount}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">User Email</th>
                <th className="px-4 py-2 border">Login Time</th>
                <th className="px-4 py-2 border">Logout Time</th>
                <th className="px-4 py-2 border">IP Address</th>
                <th className="px-4 py-2 border">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 border">{activity.id}</td>
                  <td className="px-4 py-2 border">{activity.user_email}</td>
                  <td className="px-4 py-2 border">{new Date(activity.login_time).toLocaleString()}</td>
                  <td className="px-4 py-2 border">
                    {activity.logout_time ? new Date(activity.logout_time).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-4 py-2 border">{activity.ip_address || "N/A"}</td>
                  <td className="px-4 py-2 border">{activity.user_agent || "N/A"}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mt-4 space-x-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogsPage;
