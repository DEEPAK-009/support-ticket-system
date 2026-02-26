import Layout from "../components/Layout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">
        Profile
      </h1>

      <div className="bg-white p-6 rounded shadow max-w-lg">
        <p><strong>Name:</strong> {user?.full_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
    </Layout>
  );
};

export default Profile;