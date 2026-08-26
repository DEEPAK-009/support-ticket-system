import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  User,
  PlusCircle,
  LogOut,
  Ticket,
  Shield,
  Headphones,
  Sparkles,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogout = () => {
    setShowConfirmModal(false);
    logout();
    navigate("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    ...(user?.role === "user"
      ? [
          {
            label: "Create Ticket",
            path: "/create-ticket",
            icon: PlusCircle,
          },
        ]
      : []),
    {
      label: "Profile & Settings",
      path: "/profile",
      icon: User,
    },
  ];

  // Helper for role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return {
          icon: Shield,
          color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
          label: "Operations Admin",
        };
      case "agent":
        return {
          icon: Headphones,
          color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          label: "Support Agent",
        };
      default:
        return {
          icon: User,
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          label: "Customer / User",
        };
    }
  };

  const roleMeta = getRoleBadge(user?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <>
      <aside className="w-64 my-4 ml-4 hidden md:flex flex-col justify-between h-[calc(100vh-2rem)] shrink-0 rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl shadow-black/50 z-20">
        <div>
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                SupportDesk
              </h2>
              <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                WORKSPACE
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleMeta.color}`}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                <span>{roleMeta.label}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Confirm Sign Out
                </h3>
                <p className="text-xs text-slate-400">
                  End your current session?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-2 mb-6">
              You will be signed out of your account and returned to the sign-in
              screen. Any unsaved drafts will be lost.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-medium text-white transition shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
