import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  loginUser,
  verifyAdminPassword,
  adminCreateUser,
  getDepartments,
} from "../api/auth";
import {
  Ticket,
  Lock,
  Mail,
  User,
  Shield,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Headphones,
  UserCheck,
} from "lucide-react";

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
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
          "Invalid administrator password. Access denied."
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Subtle Background Glow Elements (Linear style) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-1/4 w-[400px] h-[300px] bg-indigo-900/10 blur-3xl pointer-events-none rounded-full" />

      <div
        className={`w-full ${
          viewMode === "create-user" ? "max-w-lg" : "max-w-md"
        } relative z-10`}
      >
        {/* Top Brand Tag */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/90 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Ticket className="w-3.5 h-3.5 text-indigo-400" />
            <span className="tracking-wide">Support Desk · v2.0</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {viewMode === "login"
              ? "Welcome back"
              : viewMode === "admin-auth"
              ? "Admin Verification"
              : "Register New Account"}
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            {viewMode === "login"
              ? "Sign in to access your dashboard, tickets, and workflow."
              : viewMode === "admin-auth"
              ? "Enter your administrator master password to unlock account registration."
              : "Create a user, support agent, or admin account directly in MySQL."}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-7 sm:p-8 shadow-2xl shadow-black/60 transition-all duration-300">
          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* View 1: Standard Login Form */}
          {viewMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  "Signing in..."
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Need to create accounts?</span>
                <button
                  type="button"
                  onClick={handleSwitchToAdminAuth}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin: Add User</span>
                </button>
              </div>
            </form>
          )}

          {/* View 2: Admin Password Verification */}
          {viewMode === "admin-auth" && (
            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Protected by secure backend verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  "Verifying Admin..."
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="w-full border border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white py-2.5 rounded-xl transition-all cursor-pointer text-xs font-medium"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* View 3: Create User Form (Linear Multi-Role) */}
          {viewMode === "create-user" && (
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {/* Role Segmented Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      role === "user"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      role === "agent"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Agent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Aarav Khanna"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="user@company.com"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conditional Agent Fields: Department & Seniority */}
              {role === "agent" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Department <span className="text-rose-400">*</span>
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Seniority Level
                    </label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="">Standard (None)</option>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Employee ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={role === "agent" ? "e.g. AGT-201" : "e.g. ADM-301"}
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  "Creating Account..."
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Create {role.charAt(0).toUpperCase() + role.slice(1)} Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="w-full border border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white py-2.5 rounded-xl transition-all cursor-pointer text-xs font-medium"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Bottom Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Encrypted sessions with role-based MySQL access control.
        </p>
      </div>
    </div>
  );
};

export default Login;
