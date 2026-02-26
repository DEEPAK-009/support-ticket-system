import Layout from "../components/Layout";

const AdminDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">
        Admin Dashboard
      </h1>

      <p className="text-gray-600">
        Here you will see all tickets in the system.
      </p>
    </Layout>
  );
};

export default AdminDashboard;