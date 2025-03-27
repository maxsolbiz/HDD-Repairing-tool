// src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout"; // Ensure this exists or adjust the import accordingly

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">Loading profile...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          User not found. Please sign in.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p className="mb-2">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="mb-2">
            <strong>Username:</strong> {user.username || "Not set"}
          </p>
          <p className="mb-2">
            <strong>Role:</strong>{" "}
            {typeof user.role === "object" && user.role.value ? user.role.value : user.role}
          </p>
          {/* You can add more profile details or update forms here */}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
