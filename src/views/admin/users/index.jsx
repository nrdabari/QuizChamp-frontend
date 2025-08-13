import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Plus, Edit, ToggleLeft, ToggleRight } from "lucide-react";
// import { useAuth } from "../../../context/AuthContext";
// import { mockSubjects } from "../../../helper/helpers";

import { useApiService } from "../../../hooks/useApiService";
import { Link, useNavigate } from "react-router-dom";

const Users = () => {
  // const [showPasswordInTable, setShowPasswordInTable] = useState({});

  const { admin, isAdmin } = useApiService();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        //  setLoading(true);
        const response = await admin.getAllUsers({
          page: 1,
          limit: 100,
          // Add any default filters here
        });

        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error (show toast, set error state, etc.)
      } finally {
        // setLoading(false);
      }
    };

    fetchUsers();
  }, [admin, isAdmin]);

  // const togglePasswordVisibility = (userId) => {
  //   setShowPasswordInTable((prev) => ({
  //     ...prev,
  //     [userId]: !prev[userId],
  //   }));
  // };

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/user/edit/${userId}`);
  };

  // Route: Users List (Main Dashboard)
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add User Button */}
        <div className="mb-6">
          <button>
            <Link
              to={`/admin/user/add`}
              className="flex items-center rounded bg-primary-950 px-4 py-2 font-poppins font-semibold text-white"
            >
              <Plus size={20} className="mr-2" />
              <p> Add New User</p>
            </Link>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({users?.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade & Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sources
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        Grade {user.grade}
                      </div>
                      <div className="text-sm text-gray-500">
                        {/* {getSubjectNames(user.subjects) ||
                          "No subjects selected"} */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user?.sourceAccess.length > 0
                          ? user?.sourceAccess.join(", ")
                          : "No sources selected"}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-mono text-gray-900">
                          {showPasswordInTable[user._id]
                            ? user?.password
                            : "••••••••"}
                        </div>
                        <button
                          onClick={() => togglePasswordVisibility(user._id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          title={
                            showPasswordInTable[user._id]
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPasswordInTable[user._id] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`flex items-center space-x-2 transition-colors duration-200 ${
                          user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                        title={`Click to ${
                          user.isActive ? "deactivate" : "activate"
                        } user`}
                      >
                        {user.isActive ? (
                          <ToggleRight size={20} />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                        <span className="text-sm font-medium">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users?.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found. Click "Add New User" to create the first
                      user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
