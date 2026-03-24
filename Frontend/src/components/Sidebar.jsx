import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-72 m-4 rounded-[28px] border border-white/10 bg-slate-950/90 text-white shadow-2xl backdrop-blur">
      <div className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 mb-2">
            Workspace
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Support System
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Keep requests moving with a clear ticket workflow.
          </p>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="block w-full rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="block w-full rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-white/5 hover:text-white"
          >
            Profile
          </button>
        </nav>
      </div>

      <div>
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <p className="text-sm font-medium text-white">
            {user?.full_name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            {user?.role}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Logged in and ready to work.
          </p>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Secure session controls
        </p>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
        >
          Logout
        </button>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;
