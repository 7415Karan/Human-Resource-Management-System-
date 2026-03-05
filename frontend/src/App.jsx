import { useEffect, useState } from "react";
import axios from "axios";

// use environment variable in production; default back to localhost during development
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    department: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Attendance state
  const [activeTab, setActiveTab] = useState("employees");
  const [attendance, setAttendance] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({
    employee: "",
    date: "",
    status: "present",
  });
  const [attendanceFilter, setAttendanceFilter] = useState({
    search: "",      // employee id or name
    start_date: "",
    end_date: "",
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/employees/`);
      // Handle paginated response - extract results array
      setEmployees(res.data.results || res.data);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (activeTab === "attendance") {
      fetchAttendance(attendanceFilter);
    }
  }, [activeTab]);

  // automatically refresh attendance when filters change
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance(attendanceFilter);
    }
  }, [attendanceFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(`${API}/employees/`, form);
      setForm({
        full_name: "",
        email: "",
        department: "",
      });
      fetchEmployees();
    } catch (err) {
      setError(
        err.response?.data?.email ||
          err.response?.data?.full_name ||
          err.response?.data?.department ||
          "Something went wrong"
      );
    }
  };

  const openEditModal = (emp) => {
    setEditingId(emp.id);
    setEditForm({
      full_name: emp.full_name,
      email: emp.email,
      department: emp.department,
    });
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditForm({
      full_name: "",
      email: "",
      department: "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setEditLoading(true);
      await axios.put(`${API}/employees/${editingId}/`, editForm);
      await fetchEmployees();
      closeEditModal();
    } catch (err) {
      let errorMessage = "Failed to update employee";
      
      if (err.response?.data) {
        const data = err.response.data;
        // Handle object-style errors
        if (typeof data === "object") {
          if (data.employee_id) {
            errorMessage = Array.isArray(data.employee_id) 
              ? data.employee_id[0] 
              : data.employee_id;
          } else if (data.email) {
            errorMessage = Array.isArray(data.email) 
              ? data.email[0] 
              : data.email;
          } else if (data.detail) {
            errorMessage = data.detail;
          }
        } else {
          errorMessage = data;
        }
      }
      
      setError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setDeleteLoading(id);
      await axios.delete(`${API}/employees/${id}/`);
      fetchEmployees();
    } catch (err) {
      setError("Failed to delete employee");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Attendance functions
  const fetchAttendance = async (filters = {}) => {
    try {
      setAttendanceLoading(true);
      let url = `${API}/attendance/list/`;
      const params = new URLSearchParams();
      if (filters.search) {
        // support search by id or name
        params.append("search", filters.search);
      }
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      const res = await axios.get(url, { params });
      setAttendance(res.data.results || res.data);
    } catch (err) {
      setAttendanceError("Failed to load attendance records");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setAttendanceError("");

    if (!attendanceForm.employee || !attendanceForm.date) {
      setAttendanceError("Please select employee and date");
      return;
    }

    try {
      await axios.post(`${API}/attendance/`, {
        employee: attendanceForm.employee,
        date: attendanceForm.date,
        status: attendanceForm.status,
      });
      setAttendanceForm({
        employee: "",
        date: "",
        status: "present",
      });
      await fetchAttendance();
    } catch (err) {
      setAttendanceError(
        err.response?.data?.detail ||
          err.response?.data?.employee ||
          err.response?.data?.date ||
          "Failed to mark attendance"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-2">
            Human Resource Management System
          </h1>
          <p className="text-slate-600">Manage your employees efficiently (HRMS Lite)</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-xl ring-1 ring-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab("employees")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === "employees"
                  ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === "attendance"
                  ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Attendance
            </button>
          </div>

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <>
              {/* Form Section */}
              <div className="bg-blue-50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                  Add Employee
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      required
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Department *"
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      required
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding..." : "Add Employee"}
                  </button>
                </form>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
              </div>

          {/* Table Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Employees
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No employees found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 text-slate-700">
                          {emp.employee_id}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {emp.full_name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {emp.email}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {emp.department}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(emp)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 text-sm rounded-lg transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              disabled={deleteLoading === emp.id}
                              className="bg-blue hover:bg-red-500 text-white font-semibold py-1 px-2 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              {deleteLoading === emp.id ? "🗑️" : "🗑️"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <>
              {/* Mark Attendance Section */}
              <div className="bg-green-50 p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                  Mark Attendance
                </h2>

                <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={attendanceForm.employee}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          employee: e.target.value,
                        })
                      }
                      required
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="">Select Employee *</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employee_id} - {emp.full_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          date: e.target.value,
                        })
                      }
                      required
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      value={attendanceForm.status}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          status: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={attendanceLoading}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attendanceLoading ? "Marking..." : "Mark Attendance"}
                  </button>
                </form>

                {/* Attendance Error Message */}
                {attendanceError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{attendanceError}</p>
                  </div>
                )}
              </div>

              {/* Attendance Records Section */}
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                  Attendance Records
                </h2>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search by ID or name"
                    value={attendanceFilter.search}
                    onChange={(e) =>
                      setAttendanceFilter({
                        ...attendanceFilter,
                        search: e.target.value,
                      })
                    }
                    className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="date"
                    value={attendanceFilter.start_date}
                    onChange={(e) =>
                      setAttendanceFilter({
                        ...attendanceFilter,
                        start_date: e.target.value,
                      })
                    }
                    className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="date"
                    value={attendanceFilter.end_date}
                    onChange={(e) =>
                      setAttendanceFilter({
                        ...attendanceFilter,
                        end_date: e.target.value,
                      })
                    }
                    className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => fetchAttendance(attendanceFilter)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-4 rounded-lg transition duration-200"
                  >
                    Apply filters
                  </button>
                  <button
                    onClick={() => {
                      setAttendanceFilter({ search: "", start_date: "", end_date: "" });
                      fetchAttendance({});
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm py-1 px-4 rounded-lg transition duration-200"
                  >
                    Clear
                  </button>
                </div>

                {attendanceLoading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">Loading...</p>
                  </div>
                ) : attendance.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No attendance records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 sticky top-0">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b border-slate-200 hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 text-slate-700">
                              {record.employee_id}
                            </td>
                            <td className="px-6 py-4 text-slate-700">
                              {record.employee_name}
                            </td>
                            <td className="px-6 py-4 text-slate-700">
                              {record.date}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  record.status === "present"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                Edit Employee
              </h2>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-1 px-3 text-sm rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;