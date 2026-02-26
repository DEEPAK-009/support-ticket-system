import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">
          Dashboard
        </h1>

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