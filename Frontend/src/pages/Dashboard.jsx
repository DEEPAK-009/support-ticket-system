import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import UserDashboard from "./UserDashboard";
import AgentDashboard from "./AgentDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  if (user.role === "user") return <UserDashboard />;
  if (user.role === "agent") return <AgentDashboard />;
  if (user.role === "admin") return <AdminDashboard />;

  return null;
};

export default Dashboard;