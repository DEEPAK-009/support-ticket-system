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
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Change Password
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-lg">
        <div className="space-y-3">
          <p><span className="text-gray-500">Name:</span> {user?.full_name}</p>
          <p><span className="text-gray-500">Email:</span> {user?.email}</p>
          <p><span className="text-gray-500">Role:</span> <span className="capitalize">{user?.role}</span></p>
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