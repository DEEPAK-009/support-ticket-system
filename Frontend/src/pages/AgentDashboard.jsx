import Layout from "../components/Layout";

const AgentDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">
        Agent Dashboard
      </h1>

      <p className="text-gray-600">
        Here you will see tickets assigned to you.
      </p>
    </Layout>
  );
};

export default AgentDashboard;