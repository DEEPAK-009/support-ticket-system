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
    <div className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold mb-8">
          Support System
        </h2>

        <nav className="space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="block w-full text-left text-gray-700 hover:text-black"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="block w-full text-left text-gray-700 hover:text-black"
          >
            Profile
          </button>
        </nav>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-4">
          {user?.full_name}
        </p>

        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;