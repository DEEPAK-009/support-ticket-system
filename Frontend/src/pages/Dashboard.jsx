import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate ;

  const handleLogout = () => {
    logout() ;
    navigate("/") ;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">
          Dashboard
        </h1>

        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Logout
          </button>
          
        <p className="text-gray-700">
          Logged in as: <strong>{user?.full_name}</strong>
        </p>

        <p className="text-gray-700">
          Role: <strong>{user?.role}</strong>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;