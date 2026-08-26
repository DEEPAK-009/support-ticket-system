import { useState, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Building2,
  Sparkles,
} from "lucide-react";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (formData.new_password !== formData.confirm_password) {
      return setStatus({ type: "error", msg: "New passwords do not match." });
    }

    if (formData.new_password.length < 6) {
      return setStatus({
        type: "error",
        msg: "New password must be at least 6 characters long.",
      });
    }

    try {
      setSubmitting(true);
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      setStatus({
        type: "success",
        msg: "Password updated successfully!",
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
        setStatus({ type: "", msg: "" });
      }, 1800);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleMeta = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "Operations Administrator",
          icon: Shield,
          color: "bg-violet-500/10 text-violet-300 border-violet-500/30",
        };
      case "agent":
        return {
          label: "Support Agent",
          icon: Headphones,
          color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
        };
      default:
        return {
          label: "User / Requester",
          icon: User,
          color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  const roleMeta = getRoleMeta(user?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Banner */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-indigo-500/25 shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-white">
                    {user?.full_name || "Account"}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleMeta.color}`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    <span>{roleMeta.label}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer self-start sm:self-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </section>

        {/* Account Details Tiles */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-slate-400">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Name</span>
            </div>
            <p className="mt-3 text-base font-semibold text-white">
              {user?.full_name || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-slate-400">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Address</span>
            </div>
            <p className="mt-3 text-base font-semibold text-white break-all">
              {user?.email || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-xl shadow-black/30">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-slate-400">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Access Level</span>
            </div>
            <p className="mt-3 text-base font-semibold text-white capitalize">
              {user?.role || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl shadow-black/80">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Update Account Password
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your current and new credentials
                </p>
              </div>
            </div>

            {status.msg && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
                  status.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{status.msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    value={formData.old_password}
                    onChange={(e) =>
                      setFormData({ ...formData, old_password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    value={formData.new_password}
                    onChange={(e) =>
                      setFormData({ ...formData, new_password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
