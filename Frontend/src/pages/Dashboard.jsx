import { useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">
        Dashboard
      </h1>

      <p className="text-gray-700">
        Logged in as: <strong>{user?.full_name}</strong>
      </p>

      <p className="text-gray-700">
        Role: <strong>{user?.role}</strong>
      </p>
    </Layout>
  );
};

export default Dashboard;