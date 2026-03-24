import { useState, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { changePassword } from "../api/auth";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    old_password: "", 
    new_password: "", 
    confirm_password: "" 
  });
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (formData.new_password !== formData.confirm_password) {
      return setStatus({ type: "error", msg: "New passwords do not match." });
    }

    try {
      await changePassword({ 
        old_password: formData.old_password, 
        new_password: formData.new_password 
      });
      setStatus({ type: "success", msg: "Password updated successfully!" });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ old_password: "", new_password: "", confirm_password: "" });
        setStatus({ type: "", msg: "" });
      }, 2000);
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Update failed." });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 mb-2">
            Account
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500 mt-2">
            Review your account details and keep your password current.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white hover:bg-slate-800 transition-colors"
        >
          Change Password
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Full Name</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{user?.full_name}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
          <p className="mt-3 text-lg font-semibold text-slate-900 break-all">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
          <p className="mt-3 text-lg font-semibold capitalize text-slate-900">{user?.role}</p>
        </div>
      </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Update Password</h2>
            
            {status.msg && (
              <div className={`mb-4 p-2 rounded text-sm ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="password" 
                placeholder="Current Password" 
                required 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, old_password: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="New Password" 
                required 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, new_password: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                required 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, confirm_password: e.target.value})}
              />
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
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
