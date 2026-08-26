import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  loginUser,
  verifyAdminPassword,
  adminCreateUser,
  getDepartments,
} from "../api/auth";

const Login = () => {
  // Mode: 'login' | 'admin-auth' | 'create-user'
  const [viewMode, setViewMode] = useState("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Admin verification state
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");

  // Create user form state
  const [fullName, setFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // Available departments from DB
  const [departments, setDepartments] = useState([]);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch departments when reaching creation mode
  useEffect(() => {
    if (viewMode === "create-user" && departments.length === 0) {
      getDepartments()
        .then((data) => setDepartments(data))
        .catch(() => {});
    }
  }, [viewMode, departments.length]);

  const resetState = () => {
    setError("");
    setSuccess("");
    setAdminPassword("");
    setFullName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setConfirmPassword("");
    setRole("user");
    setDepartmentId("");
    setLevel("");
    setEmployeeId("");
  };

  const handleSwitchToAdminAuth = () => {
    resetState();
    setViewMode("admin-auth");
  };

  const handleSwitchToLogin = () => {
    resetState();
    setAdminToken("");
    setViewMode("login");
  };

  // Handle Standard Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin Password Verification
  const handleAdminAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await verifyAdminPassword(adminPassword);
      setAdminToken(result.adminToken);
      setViewMode("create-user");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Admin verification failed. Please check the password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle New User Creation
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newUserPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newUserPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (role === "agent" && !departmentId) {
      setError("Please select a department for support agents.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await adminCreateUser({
        full_name: fullName,
        email: newUserEmail,
        password: newUserPassword,
        role,
        department_id: departmentId ? Number(departmentId) : null,
        level: role === "agent" && level ? level : null,
        employee_id: employeeId || null,
        adminToken,
      });

      setSuccess(
        result.message ||
          `Account (${result.user?.role}) created successfully for ${newUserEmail}!`
      );
      setEmail(newUserEmail);
      setPassword("");
      setFullName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setConfirmPassword("");
      setDepartmentId("");
      setLevel("");
      setEmployeeId("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create user. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div
        className={`w-full ${
          viewMode === "create-user" ? "max-w-lg" : "max-w-md"
        } bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all`}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-3">
          Support Ticket System
        </p>

        {/* View 1: Standard Login */}
        {viewMode === "login" && (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              Sign in
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Access your dashboard, tickets, and support workflow.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">Administrator access?</span>
              <button
                type="button"
                onClick={handleSwitchToAdminAuth}
                className="font-medium text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Add User
              </button>
            </div>
          </>
        )}

        {/* View 2: Admin Password Verification */}
        {viewMode === "admin-auth" && (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              Admin Verification
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Enter administrator password to unlock user creation.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Administrator Password"
                className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                autoFocus
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Verifying..." : "Verify Admin"}
              </button>

              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel & Back to Sign In
              </button>
            </form>
          </>
        )}

        {/* View 3: Create User Form */}
        {viewMode === "create-user" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                Create Account
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                Admin Verified
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Register a new customer, support agent, or administrator in the
              database.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      role === "user"
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    User / Requester
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      role === "agent"
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Support Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      role === "admin"
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Khanna"
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              {/* Conditional Agent Fields: Department & Seniority */}
              {role === "agent" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      required
                    >
                      <option value="">Select Department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seniority Level
                    </label>
                    <select
                      className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="">Standard (No Level)</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Optional Employee ID */}
              {(role === "agent" || role === "admin") && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={role === "agent" ? "e.g. AGT-201" : "e.g. ADM-301"}
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer font-medium text-sm mt-2"
              >
                {submitting ? "Creating Account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
              </button>

              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-medium"
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
