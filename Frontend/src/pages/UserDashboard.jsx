import Layout from "../components/Layout";

const UserDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">
        User Dashboard
      </h1>

      <p className="text-gray-600">
        Here you will see tickets created by you.
      </p>
    </Layout>
  );
};

export default UserDashboard;